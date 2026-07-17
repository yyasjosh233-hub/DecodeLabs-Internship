import re
from typing import Dict, Any

class QueryClassifier:
    SAFETY_KEYWORDS = [
        r"joint\s+limit", r"torque", r"velocity\s+limit", r"acceleration\s+limit",
        r"motor\s+current", r"ampere", r"voltage", r"e-stop", r"emergency\s+stop",
        r"collision", r"avoidance", r"actuator", r"spray\s+rate", r"pressure",
        r"chemical", r"nozzle", r"payload", r"incline", r"wheel\s+slip",
        r"human-robot", r"safety", r"injury", r"hazard", r"brake"
    ]

    INTENT_PATTERNS = {
        "ROS2_QOS": [r"\bqos\b", r"quality of service", r"best\s*effort", r"reliable", r"transient\s*local", r"durability", r"reliability", r"compatibility"],
        "JOINT_LIMITS": [r"joint\s+limit", r"max\s+velocity\s+of", r"actuator\s+limit", r"max\s+speed\s+of\s+joint"],
        "ROS2_CONTROL": [r"ros2_control", r"controller\s+manager", r"hardware\s+interface"],
        "MOVEIT": [r"moveit", r"trajectory\s+execution", r"manipulation"],
        "NAV2": [r"nav2", r"navigation", r"costmap", r"planner\s+server", r"controller\s+server", r"bt\s+navigator", r"behavior\s+server"],
        "SLAM": [r"slam", r"mapping", r"loop\s+closure", r"tf2?", r"transform", r"coordinate", r"odom", r"map\b"],
        "ROBOT_SAFETY": [r"safety", r"e-stop", r"emergency\s+stop", r"hazard", r"incline\s+limit", r"critical\s+low", r"current\s+limit"],
        "SPECIFIC_ROBOT_MODEL": [r"agro-r1", r"agro\s+r1", r"r1\s+spec"],
        "AGRICULTURAL_ROBOTICS": [r"agricultural", r"crop", r"weed", r"spraying", r"vineyard", r"nozzle", r"agro"],
        "INDUSTRIAL_ROBOTICS": [r"isaac\s+sim", r"simulation", r"sim-to-real", r"domain\s+randomization", r"omniverse"],
        "ROBOT_HARDWARE": [r"jetson", r"agx\s+orin", r"lidar", r"realsense", r"depth\s+camera", r"battery", r"payload", r"sensor"],
        "ROS2": [r"ros2", r"node", r"topic", r"publisher", r"subscriber", r"rclpy", r"rclcpp"],
        "GENERAL_ROBOTICS": [r"\brobot\b", r"\brobotics\b", r"machine", r"automation", r"definition", r"actuator", r"controller", r"sensor"]
    }

    def classify(self, query: str) -> Dict[str, Any]:
        q_lower = query.lower()
        is_safety_critical = False
        triggered_keywords = []

        for pattern in self.SAFETY_KEYWORDS:
            match = re.search(pattern, q_lower)
            if match:
                is_safety_critical = True
                triggered_keywords.append(match.group(0))

        # Check for specific robotic models mentioned
        robot_model = "AGRO-R1" if "agro" in q_lower or "r1" in q_lower else "Generic Robot"

        # Determine Intent Category
        intent = "UNKNOWN"
        for category, patterns in self.INTENT_PATTERNS.items():
            matched = False
            for pat in patterns:
                if re.search(pat, q_lower):
                    intent = category
                    matched = True
                    break
            if matched:
                break

        return {
            "is_safety_critical": is_safety_critical,
            "triggered_keywords": list(set(triggered_keywords)),
            "robot_model": robot_model,
            "category": "safety_limits" if is_safety_critical else "general_robotics",
            "intent": intent
        }

