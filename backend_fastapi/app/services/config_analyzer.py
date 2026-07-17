import re
from typing import Dict, Any, List
from backend_fastapi.app.services.diagnostics import DiagnosticsResolver

class ConfigAnalyzerService:
    def analyze_nav2_yaml(self, yaml_content: str, context: str = "GENERAL") -> Dict[str, Any]:
        """
        Parses and inspects Nav2 configuration parameters inside YAML files,
        identifying syntactic bugs, deprecated configurations, or missing keys.
        """
        issues = []
        parsed_keys = []
        insufficient_data = False
        
        lines = yaml_content.split("\n")
        
        # Check basic yaml syntax
        has_tabs = False
        missing_spaces = False
        
        for idx, line in enumerate(lines):
            line_strip = line.strip()
            if not line_strip or line_strip.startswith("#"):
                continue
            
            if "\t" in line:
                has_tabs = True
                
            # Regex for missing space after colon on keys
            if re.search(r'^[a-zA-Z0-9_-]+:[^\s#/]', line_strip):
                missing_spaces = True

        if has_tabs:
            issues.append(DiagnosticsResolver.create_issue(
                issue_id="nav2.syntax.tabs_detected",
                module="NAV2",
                severity="WARNING",
                category="SYNTAX",
                title="Tab Characters Indentation Error",
                message="Tab characters detected. YAML configuration files MUST only use spaces for indentation. Indent issues will crash your launch file.",
                impact="Launch file crashes or YAML parsing failures during node instantiation.",
                recommendation="Replace all tab characters with 2 or 4 spaces for proper indentation.",
                context=context
            ))
            
        if missing_spaces:
            issues.append(DiagnosticsResolver.create_issue(
                issue_id="nav2.syntax.missing_spaces",
                module="NAV2",
                severity="WARNING",
                category="SYNTAX",
                title="Missing Parameter Spaces",
                message="Missing spaces after colon on parameters. Key-value pairs should be formatted as 'parameter: value'.",
                impact="Incorrect YAML parameter parsing, causing properties to be read as strings or empty values.",
                recommendation="Ensure there is exactly one space after every colon separator.",
                context=context
            ))

        # Check for frame names (odom, map, base_link)
        has_map_frame = False
        has_odom_frame = False
        has_base_frame = False
        
        # Check costmap layers
        has_local_costmap = "local_costmap" in yaml_content
        has_plugins_list = "plugins" in yaml_content or "plugins:" in yaml_content
        
        # Case A: Partial configuration check
        if has_local_costmap and not has_plugins_list:
            insufficient_data = True
            issues.append(DiagnosticsResolver.create_issue(
                issue_id="nav2.local_costmap.partial_config",
                module="NAV2",
                severity="INFO",
                category="COSTMAP_CONFIGURATION",
                title="Partial Configuration Detected",
                message="Local costmap plugin configuration was not fully provided.",
                impact="Local costmap verification is limited due to missing plugin lists.",
                recommendation="Provide the complete local_costmap block containing the plugins parameter to run validation rules.",
                context=context
            ))
            
        has_inflation_layer = "inflation_layer" in yaml_content or "InflationLayer" in yaml_content
        has_obstacle_layer = "obstacle_layer" in yaml_content or "ObstacleLayer" in yaml_content
        has_deprecated_recovery = "recovery_behaviors" in yaml_content or "RecoveryServer" in yaml_content
        
        for line in lines:
            line_lower = line.lower()
            if "global_frame" in line_lower:
                parsed_keys.append(line.strip())
                if "map" in line_lower:
                    has_map_frame = True
                if "odom" in line_lower:
                    has_odom_frame = True
            if "odom_frame" in line_lower:
                parsed_keys.append(line.strip())
                if "odom" in line_lower:
                    has_odom_frame = True
            if "robot_base_frame" in line_lower or "base_frame" in line_lower:
                parsed_keys.append(line.strip())
                if "base_link" in line_lower or "base_footprint" in line_lower:
                    has_base_frame = True

        # Frame warnings
        if parsed_keys:
            if not has_map_frame and "global_costmap" in yaml_content:
                issues.append(DiagnosticsResolver.create_issue(
                    issue_id="nav2.frames.map_missing",
                    module="NAV2",
                    severity="WARNING",
                    category="COORDINATE_SYSTEM",
                    title="Map Frame Unresolved",
                    message="Global Costmap does not explicitly link to the standard 'map' frame. Verify coordinate mapping offsets.",
                    impact="Potential global trajectory alignment errors and coordinate frame drift.",
                    recommendation="Set global_frame: map inside the global_costmap parameters.",
                    context=context
                ))
            if not has_odom_frame and "local_costmap" in yaml_content:
                issues.append(DiagnosticsResolver.create_issue(
                    issue_id="nav2.frames.odom_missing",
                    module="NAV2",
                    severity="WARNING",
                    category="COORDINATE_SYSTEM",
                    title="Odom Frame Unresolved",
                    message="Local Costmap is missing explicit link to the 'odom' frame. Speed controllers require valid odometry offsets.",
                    impact="Local path planning and collision avoidance fail due to unresolved speed transform lookups.",
                    recommendation="Set global_frame: odom inside the local_costmap parameters.",
                    context=context
                ))
            if not has_base_frame:
                issues.append(DiagnosticsResolver.create_issue(
                    issue_id="nav2.frames.base_missing",
                    module="NAV2",
                    severity="WARNING",
                    category="COORDINATE_SYSTEM",
                    title="Robot Base Frame Undefined",
                    message="Robot base frame is undefined. Ensure the transform tree links base_link coordinates.",
                    impact="Kinematic transformation calculations fail between sensor mount coordinates and the robot center.",
                    recommendation="Specify robot_base_frame: base_link in the costmap configuration settings.",
                    context=context
                ))

        # Context-aware Inflation warnings
        if has_local_costmap and has_plugins_list:
            if not has_inflation_layer:
                # Case B: Complete config present but inflation layer is missing
                issues.append(DiagnosticsResolver.create_issue(
                    issue_id="nav2.local_costmap.inflation_layer_missing",
                    module="NAV2",
                    severity="SUGGESTION",
                    category="COSTMAP_CONFIGURATION",
                    title="Inflation Layer Not Configured",
                    message="The analyzed local costmap does not configure an inflation layer.",
                    impact="Obstacle cost inflation behaviour is not available in the analyzed local costmap configuration.",
                    recommendation="Review whether an inflation layer is appropriate for obstacle clearance behaviour in this robot's navigation configuration.",
                    context=context
                ))
            else:
                # Check for Case C & Case D
                has_inflation_block = "inflation_layer:" in yaml_content
                
                # Check if there is an invalid plugin class for inflation (Case D)
                has_invalid_class = False
                for line in lines:
                    if "plugin:" in line and ("inflation" in line.lower() or "Inflation" in line):
                        if "nav2_costmap_2d::InflationLayer" not in line:
                            has_invalid_class = True
                
                if has_invalid_class:
                    # Case D: Invalid class
                    issues.append(DiagnosticsResolver.create_issue(
                        issue_id="nav2.local_costmap.inflation_class_invalid",
                        module="NAV2",
                        severity="ERROR",
                        category="COSTMAP_CONFIGURATION",
                        title="Invalid Inflation Plugin Class",
                        message="The inflation layer plugin class is invalid or cannot be resolved.",
                        impact="DDS controller server crashes during costmap layer initialization.",
                        recommendation="Set the plugin value to 'nav2_costmap_2d::InflationLayer'.",
                        context=context
                    ))
                elif not has_inflation_block:
                    # Case C: listed in plugins but configuration block missing
                    issues.append(DiagnosticsResolver.create_issue(
                        issue_id="nav2.local_costmap.inflation_block_missing",
                        module="NAV2",
                        severity="WARNING",
                        category="COSTMAP_CONFIGURATION",
                        title="Inflation Layer Configuration Missing",
                        message="The inflation_layer is listed in plugins, but its configuration block is missing or invalid.",
                        impact="The costmap fails to load because the plugin parameter definitions are missing.",
                        recommendation="Add a nested 'inflation_layer:' configuration parameters section under costmap parameters.",
                        context=context
                    ))

        # Obstacle layer warnings
        if has_local_costmap and has_plugins_list:
            if not has_obstacle_layer:
                issues.append(DiagnosticsResolver.create_issue(
                    issue_id="nav2.local_costmap.obstacle_layer_missing",
                    module="NAV2",
                    severity="SUGGESTION",
                    category="COSTMAP_CONFIGURATION",
                    title="Obstacle Layer Not Configured",
                    message="No Obstacle Layer found. Costmap will fail to update dynamically with real-time sensor streams.",
                    impact="The robot will plan paths based on static maps only, increasing risk of collision with dynamic obstacles.",
                    recommendation="Verify sensor topic configurations and link 'nav2_costmap_2d::ObstacleLayer' in plugins list.",
                    context=context
                ))

        # Deprecations check
        if has_deprecated_recovery:
            issues.append(DiagnosticsResolver.create_issue(
                issue_id="nav2.deprecation.recovery_behaviors",
                module="NAV2",
                severity="WARNING",
                category="DEPRECATION",
                title="Deprecated Recovery Behaviors Key",
                message="'recovery_behaviors' parameter is deprecated in ROS 2 Humble/Jazzy. Nav2 now uses the 'Behavior Server' (behaviors list) node configuration.",
                impact="Deprecated parameters are ignored by modern Nav2 nodes, leading to a failure to initiate spin, wait, or backup recovery behaviors.",
                recommendation="Migrate 'recovery_behaviors' parameters to 'behavior_server' parameters with 'spin', 'backup', and 'wait' plugin configurations.",
                context=context
            ))

        # Final Status Calculation
        parser_status = "PARTIAL" if insufficient_data else "SUCCESS"
        analysis_status = DiagnosticsResolver.calculate_status(parser_status, issues, insufficient_data)
        
        if analysis_status == "HEALTHY":
            message = "YAML configuration parses correctly. No structural frame mismatches or deprecated syntax were found."
        elif analysis_status == "INSUFFICIENT_DATA":
            message = "YAML configuration analysis incomplete due to insufficient data."
        else:
            message = f"Pasted Nav2 configuration contains {len(issues)} structural warnings, recommendations, or deprecations."

        # Keep backward compatibility while adding normalized diagnostic schemas
        return {
            "parser_status": parser_status,
            "analysis_status": analysis_status,
            "status": analysis_status,
            "message": message,
            "issues": issues,
            "warnings_found": [
                {"type": iss["category"], "message": iss["message"]} for iss in issues if iss["severity"] == "WARNING"
            ],
            "engineering_suggestions": [iss["recommendation"] for iss in issues if iss["severity"] in ["SUGGESTION", "WARNING", "ERROR"]],
            "parsed_coordinate_references": parsed_keys
        }
