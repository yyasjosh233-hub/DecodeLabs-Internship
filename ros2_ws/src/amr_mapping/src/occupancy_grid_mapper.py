#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
import numpy as np
from sensor_msgs.msg import LaserScan
from nav_msgs.msg import OccupancyGrid, Odometry
from geometry_msgs.msg import Pose
import math

class OccupancyGridMapper(Node):
    """
    Constructs 2D Occupancy Grid from simulated LiDAR (/scan) and EKF pose (/odometry/filtered).
    0 = free, 100 = occupied, -1 = unknown.
    Applies ray tracing for free-cell clearing and occupied-cell updates.
    """
    def __init__(self):
        super().__init__('occupancy_grid_mapper')

        self.declare_parameter('resolution', 0.10)  # meters/cell
        self.declare_parameter('width', 10.0)      # meters
        self.declare_parameter('height', 10.0)     # meters

        self.resolution = self.get_parameter('resolution').value
        self.width_m = self.get_parameter('width').value
        self.height_m = self.get_parameter('height').value

        self.grid_width = int(self.width_m / self.resolution)
        self.grid_height = int(self.height_m / self.resolution)

        # Log-odds occupancy grid initialized to 0 (unknown)
        self.log_odds = np.zeros((self.grid_height, self.grid_width), dtype=np.float32)

        self.l_free = -0.4
        self.l_occ = 0.85
        self.l_min = -4.0
        self.l_max = 4.0

        self.robot_x = 1.0
        self.robot_y = 1.0
        self.robot_yaw = 0.0

        self.create_subscription(Odometry, '/odometry/filtered', self.odom_callback, 10)
        self.create_subscription(LaserScan, '/scan', self.scan_callback, 10)

        self.map_pub = self.create_publisher(OccupancyGrid, '/map', 10)
        self.timer = self.create_timer(0.2, self.publish_map)  # 5 Hz map update

        self.get_logger().info(f'Occupancy Grid Mapper initialized ({self.grid_width}x{self.grid_height} cells).')

    def world_to_grid(self, wx, wy):
        gx = int(wx / self.resolution)
        gy = int(wy / self.resolution)
        if 0 <= gx < self.grid_width and 0 <= gy < self.grid_height:
            return gx, gy
        return None

    def odom_callback(self, msg: Odometry):
        self.robot_x = msg.pose.pose.position.x
        self.robot_y = msg.pose.pose.position.y
        q = msg.pose.pose.orientation
        siny_cosp = 2 * (q.w * q.z + q.x * q.y)
        cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z)
        self.robot_yaw = math.atan2(siny_cosp, cosy_cosp)

    def bresenham(self, x0, y0, x1, y1):
        """Bresenham's line algorithm for ray tracing free cells."""
        points = []
        dx = abs(x1 - x0)
        dy = abs(y1 - y0)
        sx = 1 if x0 < x1 else -1
        sy = 1 if y0 < y1 else -1
        err = dx - dy

        curr_x, curr_y = x0, y0
        while True:
            points.append((curr_x, curr_y))
            if curr_x == x1 and curr_y == y1:
                break
            e2 = 2 * err
            if e2 > -dy:
                err -= dy
                curr_x += sx
            if e2 < dx:
                err += dx
                curr_y += sy
        return points

    def scan_callback(self, msg: LaserScan):
        robot_grid = self.world_to_grid(self.robot_x, self.robot_y)
        if not robot_grid:
            return

        rx0, ry0 = robot_grid
        angle = msg.angle_min

        for r in msg.ranges:
            if msg.range_min <= r <= msg.range_max:
                hit = True
            elif r > msg.range_max:
                r = msg.range_max
                hit = False
            else:
                angle += msg.angle_increment
                continue

            beam_angle = self.robot_yaw + angle
            wx = self.robot_x + r * math.cos(beam_angle)
            wy = self.robot_y + r * math.sin(beam_angle)

            target_grid = self.world_to_grid(wx, wy)
            if target_grid:
                tx, ty = target_grid
                ray_points = self.bresenham(rx0, ry0, tx, ty)

                # Clear free cells along ray
                for px, py in ray_points[:-1]:
                    if 0 <= px < self.grid_width and 0 <= py < self.grid_height:
                        self.log_odds[py, px] = max(self.l_min, self.log_odds[py, px] + self.l_free)

                # Mark hit cell as occupied
                if hit and 0 <= tx < self.grid_width and 0 <= ty < self.grid_height:
                    self.log_odds[ty, tx] = min(self.l_max, self.log_odds[ty, tx] + self.l_occ)

            angle += msg.angle_increment

    def publish_map(self):
        grid_msg = OccupancyGrid()
        grid_msg.header.stamp = self.get_clock().now().to_msg()
        grid_msg.header.frame_id = 'map'

        grid_msg.info.resolution = self.resolution
        grid_msg.info.width = self.grid_width
        grid_msg.info.height = self.grid_height
        grid_msg.info.origin.position.x = 0.0
        grid_msg.info.origin.position.y = 0.0

        # Convert log odds to probability array [0..100], -1 for unknown
        prob = 1.0 - (1.0 / (1.0 + np.exp(self.log_odds)))
        occupancy_data = np.full_like(self.log_odds, -1, dtype=np.int8)

        # Free cells
        free_mask = self.log_odds < -0.1
        occupancy_data[free_mask] = (prob[free_mask] * 100).astype(np.int8)

        # Occupied cells
        occ_mask = self.log_odds > 0.1
        occupancy_data[occ_mask] = (prob[occ_mask] * 100).astype(np.int8)

        grid_msg.data = occupancy_data.flatten().tolist()
        self.map_pub.publish(grid_msg)

def main(args=None):
    rclpy.init(args=args)
    node = OccupancyGridMapper()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
