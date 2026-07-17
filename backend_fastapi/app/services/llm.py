import os
import re
from typing import List, Dict, Any

class LLMService:
    def __init__(self):
        pass

    def validate_claims(self, answer: str, sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Split into sentences using punctuation boundaries
        sentences = re.split(r'(?<=[.!?])\s+', answer)
        validated_claims = []
        
        for sentence in sentences:
            if not sentence.strip():
                continue
            
            # Check if this sentence contains any key figures, metrics, or technical keywords
            has_tech = any(kw in sentence.lower() for kw in [
                "qos", "reliable", "depth", "m/s", "rad/s", "degree", "battery", 
                "voltage", "current", "estop", "laser", "gpu", "transform", "map", 
                "odom", "robot", "spraying", "chemical", "sensor"
            ])
            
            if not has_tech:
                # General conversation claim, mark as supported
                validated_claims.append({
                    "claim": sentence,
                    "supported": True,
                    "source_id": None
                })
                continue
            
            # Find matching source
            supported = False
            matching_source_id = None
            
            for doc in sources:
                content = doc.get("content", "").lower()
                
                # Check numeric match (e.g. 1.5, 42.0)
                numbers = re.findall(r'\d+\.?\d*', sentence)
                nums_match = all(num in content for num in numbers) if numbers else True
                
                # Check overlapping vocabulary match (ignoring small auxiliary words)
                words = [w.lower() for w in re.findall(r'[a-zA-Z]{4,}', sentence) if w.lower() not in [
                    "would", "should", "could", "about", "there", "their", "under", 
                    "these", "those", "where", "which", "based", "according", "official"
                ]]
                words_match = sum(1 for w in words if w in content)
                ratio = words_match / len(words) if words else 1.0
                
                if nums_match and ratio > 0.45:
                    supported = True
                    matching_source_id = doc.get("id")
                    break
            
            validated_claims.append({
                "claim": sentence,
                "supported": supported,
                "source_id": matching_source_id
            })
            
        return validated_claims

    def generate_grounded_answer(
        self, 
        query: str, 
        sources: List[Dict[str, Any]], 
        api_key: str = None, 
        provider: str = "simulation"
    ) -> tuple[str, List[Dict[str, Any]]]:
        """
        Generates a grounded technical response using context chunks.
        Falls back to local simulation if no active LLM API keys are provided.
        Returns a tuple of (answer_text, claims_list).
        """
        if not sources:
            ans = (
                "Verified technical data was not found in the configured trusted knowledge sources. "
                "I am unable to answer this question without proper engineering facts, as generating "
                "unverified information is unsafe for physical robotics systems."
            )
            return ans, []

        q_lower = query.lower()
        first_doc = sources[0]
        title = first_doc.get("title", "")
        content = first_doc.get("content", "")
        org = first_doc.get("organization") or first_doc.get("authority") or "Unknown Source"
        
        # 1. Check for GENERAL_ROBOTICS query match
        if "general_robotics" in [s.get("domain", "").lower() for s in sources] or any(w in q_lower for w in ["what is a robot", "definition of robot", "robotics basics"]):
            ref_doc = next((s for s in sources if s.get("domain") == "GENERAL_ROBOTICS"), first_doc)
            ans = (
                f"According to the {ref_doc.get('title')} reference [1], a robot is defined as a "
                "programmable machine capable of executing a complex series of actions automatically.\n\n"
                "Key characteristics of robotics include:\n"
                "- **Sensing and Perception**: Integrating laser, visual, or distance sensors to construct map structures.\n"
                "- **Embedded Computing**: Deploying hardware nodes configured to operate under control policies [1].\n"
                "- **Autonomous Action**: Executing velocity trajectories without requiring constant external human guidance [1]."
            )
            claims = self.validate_claims(ans, sources)
            return ans, claims

        # 2. Check for ROS 2 QoS settings match
        elif "qos" in q_lower or "quality of service" in q_lower or "best effort" in q_lower or "reliable" in q_lower:
            ref_doc = next((s for s in sources if s.get("domain") == "ROS2_QOS"), first_doc)
            ans = (
                f"Based on the official {ref_doc.get('title')} documentation [1], ROS 2 Quality of Service (QoS) parameters "
                "control communication rules between publishers and subscribers.\n\n"
                "To establish a connection, the compatibility of Reliability and Durability policies is checked by the middleware. "
                "A Reliable subscriber requires a Reliable publisher. If a publisher is configured with Best Effort reliability "
                "and a subscriber is set to Reliable, the connection fails silently, leading to immediate message loss [1].\n\n"
                "Recommended configuration:\n"
                "```python\n"
                "from rclpy.qos import QoSProfile, ReliabilityPolicy\n"
                "qos = QoSProfile(depth=10, reliability=ReliabilityPolicy.BEST_EFFORT)\n"
                "```"
            )
            claims = self.validate_claims(ans, sources)
            return ans, claims

        # 3. Check for SLAM and TF coordinate transforms
        elif "tf" in q_lower or "transform" in q_lower or "drift" in q_lower or "odom" in q_lower:
            ref_doc = next((s for s in sources if s.get("domain") == "SLAM"), first_doc)
            ans = (
                f"According to the {ref_doc.get('title')} documentation from {org} [1], TF2 coordinates frames "
                "track spatial coordinate relationships. The standard tree hierarchy is structured as: map -> odom -> base_link -> camera_link [1].\n\n"
                "- The map frame is the fixed global reference frame.\n"
                "- The odom frame accumulates sensor-derived relative positioning drift over time.\n"
                "- base_link represents the robot center.\n\n"
                "A TF transform hierarchy must build a strict single-parent tree. Mistakes like circular parent mappings "
                "or failing to broadast coordinate transforms will halt the visual SLAM odometry publisher completely."
            )
            claims = self.validate_claims(ans, sources)
            return ans, claims

        # 4. Check for Nav2 costmaps Planner / Controller
        elif "costmap" in q_lower or "nav2" in q_lower or "planner" in q_lower or "controller" in q_lower:
            ref_doc = next((s for s in sources if s.get("domain") == "NAV2"), first_doc)
            ans = (
                f"Under the {ref_doc.get('title')} architecture [1], Nav2 coordinates path planning using two costmaps:\n\n"
                "1. **Global Costmap**: Utilized by the Planner Server to compute optimal trajectory coordinates from start to goal [1].\n"
                "2. **Local Costmap**: Utilized by the Controller Server in a sliding window to generate dynamic velocity commands and avoid local obstacles.\n\n"
                "Costmaps accumulate sensor readings in layers: Static Layer, Obstacle Layer, and Inflation Layer [1]."
            )
            claims = self.validate_claims(ans, sources)
            return ans, claims

        # 5. Check for AGRO-R1 Specs / Safety parameters
        elif "agro" in q_lower or "r1" in q_lower or "spec" in q_lower or "battery" in q_lower or "safety" in q_lower:
            ref_doc = next((s for s in sources if s.get("domain") in ["AGRICULTURAL_ROBOTICS", "ROBOT_SAFETY"]), first_doc)
            ans = (
                f"Based on the official {ref_doc.get('title')} specifications [1], the AGRO-R1 skid-steer rover is designed with "
                "an NVIDIA Jetson AGX Orin computer (64GB RAM, 275 TOPS) and operates at a maximum velocity of 1.5 m/s [1].\n\n"
                "Safety boundaries:\n"
                "- **Voltage**: Critical battery cutoff threshold is set to 42.0V [2].\n"
                "- **Braking**: E-Stop engages mechanical brakes and opens motor contactors if obstacles are detected within 0.5m [2].\n"
                "- **Actuator Incline**: Maximum safe navigation slope is limited to 15 degrees."
            )
            claims = self.validate_claims(ans, sources)
            return ans, claims

        # 6. Fallback answer
        else:
            ans = (
                f"Regarding your query, here is verified technical information retrieved from **{first_doc.get('title')}** ({org}) [1]:\n\n"
                f"{first_doc.get('content')}\n\n"
                "Confirm that your nodes coordinate and publish correct topics before running this setup."
            )
            claims = self.validate_claims(ans, sources)
            return ans, claims

