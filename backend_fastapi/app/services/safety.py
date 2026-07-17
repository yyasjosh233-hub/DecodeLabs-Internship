from typing import Dict, Any

class SafetyValidator:
    def __init__(self):
        pass

    def validate_and_append_warnings(self, query_class: Dict[str, Any], answer: str) -> Dict[str, Any]:
        """
        Validates the output for safety and appends critical physical robot warnings.
        """
        warnings = []
        is_safe = True

        if query_class.get("is_safety_critical"):
            # Identify specific keywords to give customized safety advice
            keywords = query_class.get("triggered_keywords", [])
            
            if any(k in ["joint limit", "torque", "velocity limit", "acceleration limit", "actuator"] for k in keywords):
                warnings.append(
                    "SAFETY-CRITICAL ACTUATION WARNING: Verify physical joint limits, speed constraints, and gear ratios "
                    "against the official manufacturer documentation for the exact robot model, controller, and firmware version "
                    "before physical execution."
                )
            
            if any(k in ["voltage", "motor current", "ampere", "e-stop", "emergency stop", "brake"] for k in keywords):
                warnings.append(
                    "HARDWARE POWER & EMERGENCY WARNING: Improper electrical configuration or disabling safety circuits can cause permanent "
                    "actuator damage, fire, or severe injury. Always test Emergency Stop (E-Stop) circuits under no-load conditions."
                )

            if any(k in ["chemical", "spray rate", "pressure", "nozzle"] for k in keywords):
                warnings.append(
                    "HAZARD WARNING: Agricultural chemical application rates and pump pressures must align with local environmental safety "
                    "mandates and crop tolerance limits to prevent crop damage or toxic runoff."
                )
            
            if not warnings:
                warnings.append(
                    "GENERAL SAFETY WARNING: Physical robotics involve kinetic and electrical forces. Validate instructions "
                    "in a simulation environment (e.g. Gazebo/Isaac Sim) before launching on physical hardware."
                )

        return {
            "warnings": warnings,
            "is_safe_for_hardware_execution": is_safe,
            "safety_clearance_required": query_class.get("is_safety_critical", False)
        }
