import xml.etree.ElementTree as ET
from typing import Dict, Any, List
from backend_fastapi.app.services.diagnostics import DiagnosticsResolver

class URDFAnalyzerService:
    def analyze_urdf_xml(self, urdf_content: str, context: str = "GENERAL") -> Dict[str, Any]:
        """
        Parses raw URDF/Xacro XML, constructs the joint-link tree, 
        evaluates safety limits, and lists physical dimensions.
        """
        issues = []
        links = []
        joints = []
        errors = []
        total_mass = 0.0
        parser_status = "SUCCESS"
        insufficient_data = False
        
        # Track for structural checks
        link_names = set()
        joint_names = set()
        
        try:
            # Parse XML
            root = ET.fromstring(urdf_content)
            
            # Check root tag
            if root.tag != 'robot':
                errors.append(f"Invalid root tag: '{root.tag}'. URDF root must be a '<robot>' element.")
                issues.append(DiagnosticsResolver.create_issue(
                    issue_id="urdf.syntax.invalid_root_tag",
                    module="URDF_ANALYZER",
                    severity="ERROR",
                    category="SYNTAX",
                    title="Invalid Root Element Tag",
                    message=f"Invalid root tag: '{root.tag}'. URDF root must be a '<robot>' element.",
                    impact="ROS 2 robot_state_publisher and URDF parsers will crash during XML instantiation.",
                    recommendation="Rename the outer XML tag to '<robot>' and close it properly at the end.",
                    context=context
                ))
            
            # Extract links
            for link in root.findall('link'):
                name = link.get('name')
                
                # Check for duplicate link names
                if name in link_names:
                    issues.append(DiagnosticsResolver.create_issue(
                        issue_id=f"urdf.structure.duplicate_link_{name}",
                        module="URDF_ANALYZER",
                        severity="ERROR",
                        category="STRUCTURE",
                        title=f"Duplicate Link Name Found: {name}",
                        message=f"The link name '{name}' is declared multiple times in this URDF.",
                        impact="URDF parser will fail to resolve coordinate transforms due to name ambiguity.",
                        recommendation=f"Ensure every rigid link has a unique name in the robot description.",
                        context=context
                    ))
                if name:
                    link_names.add(name)
                
                mass_val = 0.0
                inertial = link.find('inertial')
                
                # Inertial checking (No inertial data)
                if inertial is not None:
                    mass_node = inertial.find('mass')
                    if mass_node is not None:
                        try:
                            mass_val = float(mass_node.get('value', 0.0))
                            total_mass += mass_val
                        except ValueError:
                            issues.append(DiagnosticsResolver.create_issue(
                                issue_id=f"urdf.physics.non_numeric_mass_{name}",
                                module="URDF_ANALYZER",
                                severity="WARNING",
                                category="PHYSICS",
                                title=f"Non-Numeric Mass in Link {name}",
                                message=f"Non-numeric mass in link '{name}'.",
                                impact="Gazebo simulation engine will fail to compute inertial physics values.",
                                recommendation="Change the mass value parameter to a valid floating point number.",
                                context=context
                            ))
                else:
                    # Context-aware inertial data warnings
                    inertial_severity = "INFO"
                    if context == "SIMULATION":
                        inertial_severity = "WARNING"
                    elif context == "STRUCTURE":
                        inertial_severity = "SUGGESTION"
                        
                    issues.append(DiagnosticsResolver.create_issue(
                        issue_id=f"urdf.physics.missing_inertial_{name}",
                        module="URDF_ANALYZER",
                        severity=inertial_severity,
                        category="PHYSICS",
                        title=f"Missing Inertial Properties in Link: {name}",
                        message=f"Link '{name}' does not contain an '<inertial>' child block defining mass and inertia tensors.",
                        impact="The link will not experience forces or gravity correctly in simulators like Isaac Sim or Gazebo.",
                        recommendation="Define '<inertial>' properties with mass and inertia matrices for physical simulation.",
                        context=context
                    ))
                
                # Visual check
                has_visual = link.find('visual') is not None
                if not has_visual:
                    visual_severity = "INFO" if context == "GENERAL" else "SUGGESTION"
                    issues.append(DiagnosticsResolver.create_issue(
                        issue_id=f"urdf.structure.missing_visual_{name}",
                        module="URDF_ANALYZER",
                        severity=visual_severity,
                        category="STRUCTURE",
                        title=f"No Visual Element in Link: {name}",
                        message=f"Link '{name}' has no '<visual>' geometry node.",
                        impact="The link will be invisible in visualization tools like RViz.",
                        recommendation="Add a '<visual>' block specifying mesh or simple geometries (box, sphere, cylinder).",
                        context=context
                    ))

                # Collision check
                has_collision = link.find('collision') is not None
                if not has_collision:
                    collision_severity = "WARNING" if context in ["NAVIGATION", "SAFETY", "SIMULATION"] else "SUGGESTION"
                    issues.append(DiagnosticsResolver.create_issue(
                        issue_id=f"urdf.safety.missing_collision_{name}",
                        module="URDF_ANALYZER",
                        severity=collision_severity,
                        category="SAFETY",
                        title=f"Collision Geometry Missing: {name}",
                        message=f"Collision geometry is missing in link '{name}'.",
                        impact="Sensors and planners will treat this link as transparent, increasing dynamic collision risk.",
                        recommendation="Add a '<collision>' block (often copy/matched from visual geometry) to define physical boundaries.",
                        context=context
                    ))

                links.append({
                    "name": name,
                    "has_collision": has_collision,
                    "has_visual": has_visual,
                    "mass": mass_val
                })
            
            # Extract joints
            for joint in root.findall('joint'):
                name = joint.get('name')
                joint_type = joint.get('type', 'fixed')
                parent = joint.find('parent')
                child = joint.find('child')
                
                parent_name = parent.get('link') if parent is not None else "None"
                child_name = child.get('link') if child is not None else "None"
                
                # Check link existences
                if parent_name != "None" and parent_name not in link_names:
                    issues.append(DiagnosticsResolver.create_issue(
                        issue_id=f"urdf.structure.missing_parent_link_{name}",
                        module="URDF_ANALYZER",
                        severity="ERROR",
                        category="STRUCTURE",
                        title=f"Joint {name} References Missing Parent Link",
                        message=f"Joint '{name}' references parent link '{parent_name}' which does not exist.",
                        impact="URDF parser will fail to construct the transformation chain, preventing node launching.",
                        recommendation=f"Declare the link '{parent_name}' in your URDF before referencing it as a parent.",
                        context=context
                    ))
                if child_name != "None" and child_name not in link_names:
                    issues.append(DiagnosticsResolver.create_issue(
                        issue_id=f"urdf.structure.missing_child_link_{name}",
                        module="URDF_ANALYZER",
                        severity="ERROR",
                        category="STRUCTURE",
                        title=f"Joint {name} References Missing Child Link",
                        message=f"Joint '{name}' references child link '{child_name}' which does not exist.",
                        impact="URDF parsing failure due to incomplete structural kinematic chain connectivity.",
                        recommendation=f"Declare the link '{child_name}' in your URDF before referencing it as a child.",
                        context=context
                    ))

                # Check limits
                limit = joint.find('limit')
                limit_info = {}
                if limit is not None:
                    limit_info = {
                        "lower": limit.get('lower'),
                        "upper": limit.get('upper'),
                        "effort": limit.get('effort'),
                        "velocity": limit.get('velocity')
                    }
                    vel = limit.get('velocity')
                    if vel:
                        try:
                            if float(vel) > 10.0:
                                vel_severity = "WARNING" if context == "SAFETY" else "SUGGESTION"
                                issues.append(DiagnosticsResolver.create_issue(
                                    issue_id=f"urdf.safety.high_velocity_limit_{name}",
                                    module="URDF_ANALYZER",
                                    severity=vel_severity,
                                    category="SAFETY",
                                    title=f"Exceptionally High Velocity Limit: Joint {name}",
                                    message=f"Joint '{name}' has a velocity limit of {vel} rad/s, which is exceptionally high for hardware safety.",
                                    impact="Potential risk of rapid erratic motor rotation during PID controller tuning.",
                                    recommendation="Reduce the joint velocity limit parameter to match hardware physical ratings.",
                                    context=context
                                ))
                        except ValueError:
                            pass
                elif joint_type in ['revolute', 'prismatic']:
                    limit_severity = "ERROR" if context in ["SIMULATION", "SAFETY"] else "WARNING"
                    issues.append(DiagnosticsResolver.create_issue(
                        issue_id=f"urdf.safety.missing_joint_limit_{name}",
                        module="URDF_ANALYZER",
                        severity=limit_severity,
                        category="SAFETY",
                        title=f"Missing Limit Node on Moving Joint: {name}",
                        message=f"Moving joint '{name}' ({joint_type}) is missing a '<limit>' node! This can crash simulation controllers.",
                        impact="Kinematic solver crashes or failure to resolve joint position limits in Gazebo controllers.",
                        recommendation="Append a '<limit lower=\"...\" upper=\"...\" effort=\"...\" velocity=\"...\"/>' nested tag under the joint element.",
                        context=context
                    ))

                joints.append({
                    "name": name,
                    "type": joint_type,
                    "parent": parent_name,
                    "child": child_name,
                    "limits": limit_info
                })
                
            # Check for disconnected link tree components
            if links and joints:
                child_links = {j["child"] for j in joints}
                root_links = [l["name"] for l in links if l["name"] not in child_links]
                if len(root_links) > 1:
                    issues.append(DiagnosticsResolver.create_issue(
                        issue_id="urdf.structure.disconnected_tree",
                        module="URDF_ANALYZER",
                        severity="WARNING",
                        category="STRUCTURE",
                        title="Disconnected Link Tree Detected",
                        message=f"Potential disconnected link tree: Multiple root links found: {root_links}.",
                        impact="Transformation lookups fail because some robot segments are not physically connected to the main body tree.",
                        recommendation="Configure coordinate joints to link all orphan links back to the base_link coordinate system.",
                        context=context
                    ))

        except ET.ParseError as e:
            parser_status = "FAILED"
            errors.append(f"XML Parsing Error: {str(e)}")
            issues.append(DiagnosticsResolver.create_issue(
                issue_id="urdf.syntax.parse_error",
                module="URDF_ANALYZER",
                severity="ERROR",
                category="SYNTAX",
                title="XML Parse Error",
                message=f"XML Parsing Error: {str(e)}. Ensure the URDF/Xacro XML syntax is closed correctly.",
                impact="The URDF parser failed completely. The XML markup is invalid and cannot be evaluated.",
                recommendation="Review open/close bracket syntax and ensure all nested tags are closed correctly.",
                context=context
            ))
        except Exception as e:
            parser_status = "FAILED"
            errors.append(f"URDF parsing exception: {str(e)}")
            issues.append(DiagnosticsResolver.create_issue(
                issue_id="urdf.syntax.runtime_exception",
                module="URDF_ANALYZER",
                severity="ERROR",
                category="SYNTAX",
                title="URDF Parsing Runtime Exception",
                message=f"URDF parsing exception: {str(e)}",
                impact="Internal analyzer failure during XML tree inspection.",
                recommendation="Verify URDF XML validity on standard command line tool checkers like check_urdf.",
                context=context
            ))

        # Build dynamic joint tree representation
        kinematic_tree = []
        if links and not errors:
            link_parents = {}
            for j in joints:
                link_parents[j["child"]] = (j["parent"], j["name"], j["type"])
                
            for l in links:
                l_name = l["name"]
                if l_name in link_parents:
                    parent, joint_name, joint_type = link_parents[l_name]
                    kinematic_tree.append(f"{parent} ==[{joint_name} ({joint_type})]==> {l_name}")
                else:
                    kinematic_tree.append(f"{l_name} [Root Link]")

        analysis_status = DiagnosticsResolver.calculate_status(parser_status, issues, insufficient_data)
        
        return {
            "parser_status": parser_status,
            "analysis_status": analysis_status,
            "status": analysis_status, # backward compatibility
            "errors": errors,
            "warnings": [iss["message"] for iss in issues if iss["severity"] == "WARNING"], # backward compatibility
            "links_found": links,
            "joints_found": joints,
            "kinematic_tree": kinematic_tree,
            "estimated_mass_kg": round(total_mass, 2),
            "issues": issues
        }
        
    def get_agro_r1_urdf(self) -> str:
        """
        Returns a sample, beautiful URDF representing the AGRO-R1 agricultural robot.
        """
        return """<?xml version="1.0"?>
<robot name="agro_r1">
  <!-- Base Link -->
  <link name="base_link">
    <inertial>
      <mass value="150.0"/>
      <origin xyz="0 0 0.1"/>
    </inertial>
    <visual>
      <origin xyz="0 0 0.1"/>
      <geometry>
        <box size="1.6 1.2 0.4"/>
      </geometry>
    </visual>
    <collision>
      <origin xyz="0 0 0.1"/>
      <geometry>
        <box size="1.6 1.2 0.4"/>
      </geometry>
    </collision>
  </link>

  <!-- Ouster LiDAR Sensor -->
  <link name="lidar_link">
    <inertial>
      <mass value="2.5"/>
      <origin xyz="0 0 0"/>
    </inertial>
    <visual>
      <geometry>
        <cylinder length="0.08" radius="0.05"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <cylinder length="0.08" radius="0.05"/>
      </geometry>
    </collision>
  </link>

  <!-- Camera Link -->
  <link name="camera_link">
    <inertial>
      <mass value="0.8"/>
      <origin xyz="0 0 0"/>
    </inertial>
    <visual>
      <geometry>
        <box size="0.03 0.1 0.03"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <box size="0.03 0.1 0.03"/>
      </geometry>
    </collision>
  </link>

  <!-- Left Front Wheel Joint -->
  <link name="left_front_wheel">
    <inertial>
      <mass value="15.0"/>
    </inertial>
    <visual>
      <geometry>
        <cylinder length="0.2" radius="0.3"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <cylinder length="0.2" radius="0.3"/>
      </geometry>
    </collision>
  </link>

  <!-- Joints -->
  <joint name="lidar_joint" type="fixed">
    <parent link="base_link"/>
    <child link="lidar_link"/>
    <origin xyz="0.5 0 0.3"/>
  </joint>

  <joint name="camera_joint" type="fixed">
    <parent link="base_link"/>
    <child link="camera_link"/>
    <origin xyz="0.75 0 0.1"/>
  </joint>

  <joint name="left_front_wheel_joint" type="revolute">
    <parent link="base_link"/>
    <child link="left_front_wheel"/>
    <origin xyz="0.6 0.65 -0.1"/>
    <axis xyz="0 1 0"/>
    <limit lower="-3.14" upper="3.14" effort="80.0" velocity="4.5"/>
  </joint>
</robot>
"""
