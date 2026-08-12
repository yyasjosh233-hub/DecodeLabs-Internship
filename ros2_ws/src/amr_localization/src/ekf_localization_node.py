#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
import numpy as np
from nav_msgs.msg import Odometry
from sensor_msgs.msg import Imu
from geometry_msgs.msg import TransformStamped
import tf2_ros
import math

class EKFLocalizationNode(Node):
    """
    Extended Kalman Filter (EKF) Localization Node for AMR.
    State Vector: x = [x, y, yaw, vx, vy, yaw_rate]^T
    Filters wheel odometry drift using IMU sensor measurements.
    """
    def __init__(self):
        super().__init__('ekf_localization_node')

        # Declare parameters for process noise and measurement noise
        self.declare_parameter('process_noise_std', 0.05)
        self.declare_parameter('odom_noise_std', 0.15)
        self.declare_parameter('imu_noise_std', 0.02)

        p_std = self.get_parameter('process_noise_std').value
        o_std = self.get_parameter('odom_noise_std').value
        i_std = self.get_parameter('imu_noise_std').value

        # State vector: [x, y, yaw, vx, vy, yaw_rate]
        self.x = np.zeros((6, 1))
        self.P = np.eye(6) * 0.1  # State covariance

        # Process covariance Q
        self.Q = np.eye(6) * (p_std ** 2)

        # Measurement covariances R
        self.R_odom = np.eye(3) * (o_std ** 2)  # [x, y, yaw]
        self.R_imu = np.eye(2) * (i_std ** 2)   # [yaw, yaw_rate]

        self.last_time = self.get_clock().now()

        # Subscribers
        self.create_subscription(Odometry, '/odom', self.odom_callback, 10)
        self.create_subscription(Imu, '/imu', self.imu_callback, 10)

        # Publisher
        self.filtered_pub = self.create_publisher(Odometry, '/odometry/filtered', 10)
        self.tf_broadcaster = tf2_ros.TransformBroadcaster(self)

        self.get_logger().info('EKF Localization Node initialized successfully.')

    def predict(self, dt):
        if dt <= 0:
            return

        # Motion model prediction: x_k = f(x_{k-1})
        yaw = self.x[2, 0]
        vx = self.x[3, 0]
        vy = self.x[4, 0]
        yaw_rate = self.x[5, 0]

        # Update position state
        dx = (vx * math.cos(yaw) - vy * math.sin(yaw)) * dt
        dy = (vx * math.sin(yaw) + vy * math.cos(yaw)) * dt
        dyaw = yaw_rate * dt

        self.x[0, 0] += dx
        self.x[1, 0] += dy
        self.x[2, 0] = math.atan2(math.sin(self.x[2, 0] + dyaw), math.cos(self.x[2, 0] + dyaw))

        # Jacobian matrix F
        F = np.eye(6)
        F[0, 2] = (-vx * math.sin(yaw) - vy * math.cos(yaw)) * dt
        F[0, 3] = math.cos(yaw) * dt
        F[0, 4] = -math.sin(yaw) * dt
        F[1, 2] = (vx * math.cos(yaw) - vy * math.sin(yaw)) * dt
        F[1, 3] = math.sin(yaw) * dt
        F[1, 4] = math.cos(yaw) * dt
        F[2, 5] = dt

        # Covariance update: P = F * P * F^T + Q
        self.P = F @ self.P @ F.T + self.Q

    def odom_callback(self, msg: Odometry):
        current_time = self.get_clock().now()
        dt = (current_time - self.last_time).nanoseconds / 1e9
        self.last_time = current_time

        self.predict(dt)

        # Measurement z = [x, y, yaw]
        q = msg.pose.pose.orientation
        siny_cosp = 2 * (q.w * q.z + q.x * q.y)
        cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z)
        raw_yaw = math.atan2(siny_cosp, cosy_cosp)

        z = np.array([
            [msg.pose.pose.position.x],
            [msg.pose.pose.position.y],
            [raw_yaw]
        ])

        H = np.zeros((3, 6))
        H[0, 0] = 1.0
        H[1, 1] = 1.0
        H[2, 2] = 1.0

        # EKF Update
        y = z - H @ self.x
        y[2, 0] = math.atan2(math.sin(y[2, 0]), math.cos(y[2, 0]))
        S = H @ self.P @ H.T + self.R_odom
        K = self.P @ H.T @ np.linalg.inv(S)

        self.x = self.x + K @ y
        self.P = (np.eye(6) - K @ H) @ self.P

        # Publish filtered state and TF
        self.publish_filtered_odometry(msg.header.stamp)

    def imu_callback(self, msg: Imu):
        q = msg.orientation
        siny_cosp = 2 * (q.w * q.z + q.x * q.y)
        cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z)
        imu_yaw = math.atan2(siny_cosp, cosy_cosp)
        imu_wz = msg.angular_velocity.z

        z = np.array([[imu_yaw], [imu_wz]])
        H = np.zeros((2, 6))
        H[0, 2] = 1.0
        H[1, 5] = 1.0

        y = z - H @ self.x
        y[0, 0] = math.atan2(math.sin(y[0, 0]), math.cos(y[0, 0]))
        S = H @ self.P @ H.T + self.R_imu
        K = self.P @ H.T @ np.linalg.inv(S)

        self.x = self.x + K @ y
        self.P = (np.eye(6) - K @ H) @ self.P

    def publish_filtered_odometry(self, stamp):
        out = Odometry()
        out.header.stamp = stamp
        out.header.frame_id = 'odom'
        out.child_frame_id = 'base_link'

        out.pose.pose.position.x = float(self.x[0, 0])
        out.pose.pose.position.y = float(self.x[1, 0])
        out.pose.pose.position.z = 0.0

        yaw = float(self.x[2, 0])
        out.pose.pose.orientation.z = math.sin(yaw / 2.0)
        out.pose.pose.orientation.w = math.cos(yaw / 2.0)

        out.twist.twist.linear.x = float(self.x[3, 0])
        out.twist.twist.linear.y = float(self.x[4, 0])
        out.twist.twist.angular.z = float(self.x[5, 0])

        self.filtered_pub.publish(out)

        # Broadcast map -> odom -> base_link TF
        t = TransformStamped()
        t.header.stamp = stamp
        t.header.frame_id = 'odom'
        t.child_frame_id = 'base_link'
        t.transform.translation.x = float(self.x[0, 0])
        t.transform.translation.y = float(self.x[1, 0])
        t.transform.translation.z = 0.0
        t.transform.rotation.z = math.sin(yaw / 2.0)
        t.transform.rotation.w = math.cos(yaw / 2.0)
        self.tf_broadcaster.sendTransform(t)

def main(args=None):
    rclpy.init(args=args)
    node = EKFLocalizationNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
