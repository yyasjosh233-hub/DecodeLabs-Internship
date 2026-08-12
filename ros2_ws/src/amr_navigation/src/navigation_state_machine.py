#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import json

class NavigationStateMachine(Node):
    """
    Manages top-level AMR Navigation State Transitions:
    IDLE -> LOCALIZING -> MAPPING -> PLANNING -> NAVIGATING -> OBSTACLE_DETECTED -> DECELERATING -> REPLANNING -> GOAL_REACHED / EMERGENCY_STOP
    """
    VALID_STATES = [
        "IDLE", "LOCALIZING", "MAPPING", "PLANNING", "NAVIGATING",
        "OBSTACLE_DETECTED", "DECELERATING", "REPLANNING",
        "GOAL_REACHED", "EMERGENCY_STOP", "ERROR"
    ]

    def __init__(self):
        super().__init__('navigation_state_machine')
        self.current_state = "IDLE"
        self.create_subscription(String, '/robot_status', self.status_callback, 10)
        self.state_pub = self.create_publisher(String, '/nav_state', 10)

        self.get_logger().info("Navigation State Machine Node initialized.")

    def status_callback(self, msg: String):
        try:
            data = json.loads(msg.data)
            new_state = data.get("state", "IDLE")
            if new_state in self.VALID_STATES and new_state != self.current_state:
                self.get_logger().info(f"State Transition: [{self.current_state}] -> [{new_state}]")
                self.current_state = new_state
                
                out_msg = String()
                out_msg.data = json.dumps({"current_state": self.current_state})
                self.state_pub.publish(out_msg)
        except Exception as e:
            self.get_logger().error(f"Error parsing robot status: {e}")

def main(args=None):
    rclpy.init(args=args)
    node = NavigationStateMachine()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
