import re
from typing import Dict, Any, List
from backend_fastapi.app.services.diagnostics import DiagnosticsResolver

class LogParserService:
    ERROR_PATTERNS = [
        {
            "name": "QoS Compatibility Mismatch",
            "regex": r"QoS|best_effort|reliable|compatibility|middleware|DDS",
            "cause": "A subscriber requested a RELIABLE connection, but the topic publisher is configured to only send BEST_EFFORT messages. ROS 2 middleware will silently refuse to bridge these nodes.",
            "steps": [
                "Run 'ros2 topic info --show-details /topic_name' to verify active QoS profiles.",
                "Modify your subscriber node's QoS Profile to match the publisher's Reliability configuration (change to Best Effort)."
            ],
            "commands": "ros2 topic info --show-details /<topic>",
            "category": "qos_mismatch",
            "code_fix": "from rclpy.qos import QoSProfile, ReliabilityPolicy\n\nqos = QoSProfile(depth=10, reliability=ReliabilityPolicy.BEST_EFFORT)\nself.sub = self.create_subscription(String, 'topic', self.cb, qos)"
        },
        {
            "name": "Colcon Dependency Missing",
            "regex": r"Could not find a package configuration file|CMake Error|find_package|rosdep",
            "cause": "CMake is unable to find dependencies specified in CMakeLists.txt. The package is either not installed in your active ROS workspace overlay or missing from package.xml.",
            "steps": [
                "Run 'rosdep install' at your workspace root to install all dependencies listed in your package.xml.",
                "Ensure you have sourced your main ROS distribution setup file: 'source /opt/ros/<distro>/setup.bash'."
            ],
            "commands": "rosdep install -i --from-path src --rosdistro humble -y",
            "category": "colcon_build",
            "code_fix": "<!-- Add to package.xml -->\n<depend>package_name_dependency</depend>\n\n# Source active workspace\nsource /opt/ros/humble/setup.bash\ncolcon build --packages-select <your_package>"
        },
        {
            "name": "TF2 Lookup Transform Exception",
            "regex": r"LookupException|TransformException|tf2::LookupException|wait_for_transform|frame does not exist",
            "cause": "A node requested a coordinate transform between two frames (e.g. map to base_link), but the transform path does not exist, or the broadcaster node is offline.",
            "steps": [
                "Run 'ros2 run tf2_tools view_frames' to generate a PDF graph showing the tree connections.",
                "Verify coordinate frame names match exactly (look out for leading slashes like '/map' vs 'map').",
                "Ensure static transform publishers or robot_state_publisher nodes are running."
            ],
            "commands": "ros2 run tf2_tools view_frames\nros2 run tf2_ros static_transform_publisher 0 0 0 0 0 0 odom base_link",
            "category": "tf_error",
            "code_fix": "# Python static transform publisher launch example\nfrom launch_ros.actions import Node\n\nNode(\n    package='tf2_ros',\n    executable='static_transform_publisher',\n    arguments=['0', '0', '0.5', '0', '0', '0', 'base_link', 'lidar_link']\n)"
        },
        {
            "name": "Python Module Import Error",
            "regex": r"ModuleNotFoundError|ImportError|No module named",
            "cause": "The Python interpreter in your ROS node workspace is missing a library or cannot find your custom Python module due to missing setup.py entry points.",
            "steps": [
                "Check package.xml for dependencies and ensure setup.py contains the python script in console_scripts.",
                "Run a workspace colcon build and make sure to source the local workspace overlay: 'source install/setup.bash'."
            ],
            "commands": "colcon build --symlink-install\nsource install/setup.bash",
            "category": "python_import",
            "code_fix": "# setup.py entry point structure\nentry_points={\n    'console_scripts': [\n        'my_node = my_package.my_node:main'\n    ],\n}"
        }
    ]

    def parse_log(self, raw_log: str, distro: str = "humble") -> Dict[str, Any]:
        matched_error = None
        important_lines = []
        issues = []
        
        # Split and locate traceback lines
        lines = raw_log.split("\n")
        for line in lines:
            line_strip = line.strip()
            if not line_strip:
                continue
            if any(term in line_strip for term in ["Error", "Exception", "CMake", "Fail", "ros2", "DDS"]):
                important_lines.append(line_strip)

        important_lines = important_lines[:4]

        # Scan for matching regex patterns
        for pattern in self.ERROR_PATTERNS:
            if re.search(pattern["regex"], raw_log, re.IGNORECASE):
                matched_error = pattern
                break

        if matched_error:
            summary = matched_error["name"]
            cause = matched_error["cause"]
            steps = matched_error["steps"]
            commands = matched_error["commands"]
            category = matched_error["category"]
            code_fix = matched_error["code_fix"]
            confidence = "HIGH"
            
            issues.append(DiagnosticsResolver.create_issue(
                issue_id=f"log.debugger.{category}",
                module="LOG_DEBUGGER",
                severity="ERROR",
                category=category.upper(),
                title=summary,
                message=cause,
                impact="Nodes cannot start or build successfully due to structural errors.",
                recommendation=steps[0] if steps else ""
            ))
        else:
            # Check for general warning indications in the pasted log
            is_warning_log = any(k in raw_log.lower() for k in ["warn", "warning"])
            if is_warning_log:
                summary = "Active ROS 2 Log Warning"
                cause = "The log indicates a runtime warning condition rather than a compilation or structural exception."
                steps = [
                    "Review active warning messages to trace dynamic component states.",
                    "Verify node parameters and source configurations."
                ]
                commands = "ros2 doctor"
                category = "log_warning"
                code_fix = "# Trace output logs for warnings\n# Ensure node parameters are configured correctly"
                confidence = "MEDIUM"
                
                issues.append(DiagnosticsResolver.create_issue(
                    issue_id="log.debugger.runtime_warning",
                    module="LOG_DEBUGGER",
                    severity="WARNING",
                    category="LOG_WARNING",
                    title=summary,
                    message=cause,
                    impact="Node is running but might show degraded performance or unexpected behaviors.",
                    recommendation=steps[0]
                ))
            else:
                summary = "All Systems Nominal"
                cause = "No exception traces, colcon compilation errors, or DDS warnings were identified in the log."
                steps = [
                    "System log checks out clean.",
                    "Review robot application logic or telemetry diagnostics if a problem is still suspected."
                ]
                commands = "ros2 node list"
                category = "log_nominal"
                code_fix = "# Log is clean\npass"
                confidence = "HIGH"
                
                issues.append(DiagnosticsResolver.create_issue(
                    issue_id="log.debugger.nominal",
                    module="LOG_DEBUGGER",
                    severity="INFO",
                    category="NOMINAL",
                    title=summary,
                    message=cause,
                    impact="None. Log shows successful execution.",
                    recommendation="No troubleshooting steps needed."
                ))

        is_safety = any(k in raw_log.lower() for k in ["limit", "torque", "voltage", "current", "estop"])

        parser_status = "SUCCESS"
        analysis_status = DiagnosticsResolver.calculate_status(parser_status, issues)

        return {
            "parser_status": parser_status,
            "analysis_status": analysis_status,
            "status": analysis_status, # backward compatibility
            "summary": summary,
            "likely_cause": cause,
            "confidence_level": confidence,
            "important_lines": important_lines,
            "troubleshooting_steps": steps,
            "commands_to_run": commands,
            "code_fix": code_fix,
            "category": category,
            "is_safety_critical": is_safety,
            "ros_distribution": distro,
            "issues": issues
        }
