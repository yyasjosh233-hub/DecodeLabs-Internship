#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
import numpy as np
import math
from sensor_msgs.msg import LaserScan
from nav_msgs.msg import OccupancyGrid, Odometry, Path
from geometry_msgs.msg import Twist, PoseStamped
from std_msgs.msg import String
import json

class DynamicObstacleAvoidanceNode(Node):
    """
    Local Avoidance and Controller Node.
    - Maintains rolling window Local Costmap.
    - Detects dynamic obstacles via live /scan.
    - Applies smooth reflex deceleration: v = max_speed * tanh(distance_to_obstacle - safe_distance).
    - Triggers emergency stop override when distance < critical_distance.
    - Triggers dynamic A* re-planning when current global path is obstructed.
    """
    def __init__(self):
        super().__init__('dynamic_obstacle_avoidance_node')

        self.declare_parameter('max_speed', 0.8)          # m/s
        self.declare_parameter('safe_distance', 0.6)       # meters
        self.declare_parameter('critical_distance', 0.3)   # meters
        self.declare_parameter('local_map_size', 3.0)      # 3x3 meters rolling window

        self.max_speed = self.get_parameter('max_speed').value
        self.safe_distance = self.get_parameter('safe_distance').value
        self.critical_distance = self.get_parameter('critical_distance').value
        self.local_size_m = self.get_parameter('local_map_size').value

        self.robot_x = 1.0
        self.robot_y = 1.0
        self.robot_yaw = 0.0

        self.global_path = []
        self.current_waypoint_idx = 0

        self.min_obstacle_dist = float('inf')
        self.is_e_stopped = False
        self.replan_needed = False

        # Subscriptions
        self.create_subscription(Odometry, '/odometry/filtered', self.odom_callback, 10)
        self.create_subscription(LaserScan, '/scan', self.scan_callback, 10)
        self.create_subscription(Path, '/global_path', self.path_callback, 10)

        # Publishers
        self.cmd_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.local_costmap_pub = self.create_publisher(OccupancyGrid, '/local_costmap', 10)
        self.status_pub = self.create_publisher(String, '/robot_status', 10)

        # Control loop timer (20 Hz)
        self.timer = self.create_timer(0.05, self.control_loop)

        self.get_logger().info('Dynamic Obstacle Avoidance & Navigation Controller initialized.')

    def odom_callback(self, msg: Odometry):
        self.robot_x = msg.pose.pose.position.x
        self.robot_y = msg.pose.pose.position.y
        q = msg.pose.pose.orientation
        siny_cosp = 2 * (q.w * q.z + q.x * q.y)
        cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z)
        self.robot_yaw = math.atan2(siny_cosp, cosy_cosp)

    def path_callback(self, msg: Path):
        self.global_path = [(p.pose.position.x, p.pose.position.y) for p in msg.poses]
        self.current_waypoint_idx = 0
        self.replan_needed = False
        self.get_logger().info(f'Received new global path with {len(self.global_path)} waypoints.')

    def scan_callback(self, msg: LaserScan):
        ranges = [r for r in msg.ranges if msg.range_min <= r <= msg.range_max]
        if ranges:
            self.min_obstacle_dist = min(ranges)
        else:
            self.min_obstacle_dist = msg.range_max

        # Build rolling local costmap (30x30 cells @ 0.1m resolution)
        res = 0.10
        dim = int(self.local_size_m / res)
        local_grid = np.zeros((dim, dim), dtype=np.int8)

        angle = msg.angle_min
        for r in msg.ranges:
            if msg.range_min <= r <= msg.range_max:
                b_angle = angle
                lx = r * math.cos(b_angle)
                ly = r * math.sin(b_angle)
                gx = int((lx + self.local_size_m / 2.0) / res)
                gy = int((ly + self.local_size_m / 2.0) / res)
                if 0 <= gx < dim and 0 <= gy < dim:
                    local_grid[gy, gx] = 100

            angle += msg.angle_increment

        lc_msg = OccupancyGrid()
        lc_msg.header.stamp = self.get_clock().now().to_msg()
        lc_msg.header.frame_id = 'base_link'
        lc_msg.info.resolution = res
        lc_msg.info.width = dim
        lc_msg.info.height = dim
        lc_msg.info.origin.position.x = -self.local_size_m / 2.0
        lc_msg.info.origin.position.y = -self.local_size_m / 2.0
        lc_msg.data = local_grid.flatten().tolist()
        self.local_costmap_pub.publish(lc_msg)

    def control_loop(self):
        cmd = Twist()
        nav_state = "IDLE"

        if self.is_e_stopped:
            nav_state = "EMERGENCY_STOP"
            self.cmd_pub.publish(cmd)
            self.publish_status(nav_state, 0.0, 0.0)
            return

        if not self.global_path:
            nav_state = "IDLE"
            self.cmd_pub.publish(cmd)
            self.publish_status(nav_state, 0.0, 0.0)
            return

        # Check waypoint arrival
        target_x, target_y = self.global_path[self.current_waypoint_idx]
        dist_to_wp = math.hypot(target_x - self.robot_x, target_y - self.robot_y)

        if dist_to_wp < 0.20:
            if self.current_waypoint_idx < len(self.global_path) - 1:
                self.current_waypoint_idx += 1
                target_x, target_y = self.global_path[self.current_waypoint_idx]
            else:
                nav_state = "GOAL_REACHED"
                self.cmd_pub.publish(cmd)
                self.publish_status(nav_state, 0.0, 0.0)
                return

        # Safety override & Reflex-level Deceleration
        obstacle_error = self.min_obstacle_dist - self.critical_distance

        if self.min_obstacle_dist <= self.critical_distance:
            # CRITICAL OBSTACLE -> EMERGENCY STOP
            nav_state = "EMERGENCY_STOP"
            cmd.linear.x = 0.0
            cmd.angular.z = 0.0
            self.get_logger().error(f"Critical obstacle at {self.min_obstacle_dist:.2f}m! Triggering E-STOP.")
        elif self.min_obstacle_dist <= self.safe_distance:
            # DECELERATING / OBSTACLE DETECTED
            nav_state = "DECELERATING"
            # Bounded smooth tanh deceleration model
            target_vel = self.max_speed * math.tanh(max(0.0, obstacle_error))
            cmd.linear.x = max(0.02, target_vel)

            # Steering toward waypoint
            target_angle = math.atan2(target_y - self.robot_y, target_x - self.robot_x)
            heading_error = math.atan2(math.sin(target_angle - self.robot_yaw), math.cos(target_angle - self.robot_yaw))
            cmd.angular.z = np.clip(2.0 * heading_error, -1.0, 1.0)
        else:
            # NORMAL NAVIGATION
            nav_state = "NAVIGATING"
            target_angle = math.atan2(target_y - self.robot_y, target_x - self.robot_x)
            heading_error = math.atan2(math.sin(target_angle - self.robot_yaw), math.cos(target_angle - self.robot_yaw))

            if abs(heading_error) > 0.4:
                cmd.linear.x = 0.05
                cmd.angular.z = np.clip(2.5 * heading_error, -1.2, 1.2)
            else:
                cmd.linear.x = self.max_speed
                cmd.angular.z = np.clip(1.5 * heading_error, -0.8, 0.8)

        self.cmd_pub.publish(cmd)
        self.publish_status(nav_state, cmd.linear.x, cmd.angular.z)

    def publish_status(self, state, v, w):
        status_data = {
            "state": state,
            "min_obstacle_dist": round(self.min_obstacle_dist, 2),
            "linear_vel": round(v, 2),
            "angular_vel": round(w, 2),
            "current_waypoint": self.current_waypoint_idx,
            "total_waypoints": len(self.global_path),
            "robot_pose": (round(self.robot_x, 2), round(self.robot_y, 2), round(self.robot_yaw, 2))
        }
        msg = String()
        msg.data = json.dumps(status_data)
        self.status_pub.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = DynamicObstacleAvoidanceNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
