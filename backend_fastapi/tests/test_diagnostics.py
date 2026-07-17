import unittest
import sys
import os

# Adjust path to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend_fastapi.app.services.diagnostics import DiagnosticsResolver
from backend_fastapi.app.services.config_analyzer import ConfigAnalyzerService
from backend_fastapi.app.services.urdf_analyzer import URDFAnalyzerService
from backend_fastapi.app.services.log_parser import LogParserService
from backend_fastapi.app.services.vector_store import VectorStore
from backend_fastapi.app.services.query_classifier import QueryClassifier

class TestDiagnosticsSystem(unittest.TestCase):
    def setUp(self):
        self.config_analyzer = ConfigAnalyzerService()
        self.urdf_analyzer = URDFAnalyzerService()
        self.log_parser = LogParserService()
        self.vector_store = VectorStore()
        self.classifier = QueryClassifier()

    def test_shared_resolver_severities(self):
        # TEST 1: issues = []
        self.assertEqual(DiagnosticsResolver.calculate_status("SUCCESS", []), "HEALTHY")

        # TEST 2: issues = [INFO]
        self.assertEqual(DiagnosticsResolver.calculate_status("SUCCESS", [{"severity": "INFO"}]), "HEALTHY")

        # TEST 3: issues = [SUGGESTION]
        self.assertEqual(DiagnosticsResolver.calculate_status("SUCCESS", [{"severity": "SUGGESTION"}]), "ADVISORY")

        # TEST 4: issues = [WARNING]
        self.assertEqual(DiagnosticsResolver.calculate_status("SUCCESS", [{"severity": "WARNING"}]), "WARNING")

        # TEST 5: issues = [ERROR]
        self.assertEqual(DiagnosticsResolver.calculate_status("SUCCESS", [{"severity": "ERROR"}]), "ERROR")

        # TEST 6: issues = [CRITICAL]
        self.assertEqual(DiagnosticsResolver.calculate_status("SUCCESS", [{"severity": "CRITICAL"}]), "CRITICAL")

        # TEST 7: issues = [INFO, SUGGESTION]
        self.assertEqual(
            DiagnosticsResolver.calculate_status("SUCCESS", [{"severity": "INFO"}, {"severity": "SUGGESTION"}]), 
            "ADVISORY"
        )

        # TEST 8: issues = [SUGGESTION, WARNING]
        self.assertEqual(
            DiagnosticsResolver.calculate_status("SUCCESS", [{"severity": "SUGGESTION"}, {"severity": "WARNING"}]), 
            "WARNING"
        )

        # TEST 9: issues = [WARNING, ERROR]
        self.assertEqual(
            DiagnosticsResolver.calculate_status("SUCCESS", [{"severity": "WARNING"}, {"severity": "ERROR"}]), 
            "ERROR"
        )

        # TEST 10: required analysis data missing / PARTIAL
        self.assertEqual(DiagnosticsResolver.calculate_status("PARTIAL", []), "INSUFFICIENT_DATA")
        self.assertEqual(DiagnosticsResolver.calculate_status("SUCCESS", [], insufficient_data=True), "INSUFFICIENT_DATA")

    def test_nav2_regression_rules(self):
        # NAV2 TEST A: Complete valid config
        valid_yaml = """
local_costmap:
  local_costmap:
    ros__parameters:
      global_frame: odom
      robot_base_frame: base_link
      plugins: ["obstacle_layer", "inflation_layer"]
      obstacle_layer:
        plugin: "nav2_costmap_2d::ObstacleLayer"
      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        inflation_radius: 0.55
"""
        res_a = self.config_analyzer.analyze_nav2_yaml(valid_yaml)
        self.assertEqual(res_a["parser_status"], "SUCCESS")
        self.assertEqual(res_a["analysis_status"], "HEALTHY")

        # NAV2 TEST B: Complete config without inflation layer
        no_inflation_yaml = """
local_costmap:
  local_costmap:
    ros__parameters:
      global_frame: odom
      robot_base_frame: base_link
      plugins: ["obstacle_layer"]
      obstacle_layer:
        plugin: "nav2_costmap_2d::ObstacleLayer"
"""
        res_b = self.config_analyzer.analyze_nav2_yaml(no_inflation_yaml)
        self.assertEqual(res_b["analysis_status"], "ADVISORY")
        self.assertTrue(any(iss["severity"] == "SUGGESTION" for iss in res_b["issues"]))

        # NAV2 TEST C: Partial costmap snippet
        partial_yaml = """
local_costmap:
  ros__parameters:
    global_frame: odom
"""
        res_c = self.config_analyzer.analyze_nav2_yaml(partial_yaml)
        self.assertEqual(res_c["analysis_status"], "INSUFFICIENT_DATA")

        # NAV2 TEST D: inflation_layer listed but config missing/invalid
        invalid_inflation_yaml = """
local_costmap:
  local_costmap:
    ros__parameters:
      global_frame: odom
      robot_base_frame: base_link
      plugins: ["obstacle_layer", "inflation_layer"]
      obstacle_layer:
        plugin: "nav2_costmap_2d::ObstacleLayer"
"""
        res_d = self.config_analyzer.analyze_nav2_yaml(invalid_inflation_yaml)
        self.assertEqual(res_d["analysis_status"], "WARNING")
        self.assertTrue(any(iss["severity"] == "WARNING" for iss in res_d["issues"]))

    def test_urdf_regression_rules(self):
        # URDF TEST: Valid simple URDF
        valid_urdf = """<?xml version="1.0"?>
<robot name="test_bot">
  <link name="base_link">
    <inertial>
      <mass value="5.0"/>
    </inertial>
    <visual><geometry><box size="1 1 1"/></geometry></visual>
    <collision><geometry><box size="1 1 1"/></geometry></collision>
  </link>
</robot>
"""
        res_urdf = self.urdf_analyzer.analyze_urdf_xml(valid_urdf, context="GENERAL")
        self.assertEqual(res_urdf["parser_status"], "SUCCESS")
        self.assertEqual(res_urdf["analysis_status"], "HEALTHY")

        # URDF INVALID XML TEST
        invalid_urdf = "invalid urdf syntax"
        res_invalid = self.urdf_analyzer.analyze_urdf_xml(invalid_urdf)
        self.assertEqual(res_invalid["parser_status"], "FAILED")
        self.assertEqual(res_invalid["analysis_status"], "ERROR")

    def test_log_debugger_regression_rules(self):
        # ROS 2 ERROR DEBUGGER TEST: Valid normal log
        normal_log = "[INFO] [1672531200.000000] [minimal_node]: All systems operational."
        res_log = self.log_parser.parse_log(normal_log)
        self.assertEqual(res_log["parser_status"], "SUCCESS")
        self.assertEqual(res_log["analysis_status"], "HEALTHY")

        # ROS 2 ERROR DEBUGGER TEST: "package 'abc' not found"
        error_log = "Could not find a package configuration file for 'abc'."
        res_error = self.log_parser.parse_log(error_log)
        self.assertEqual(res_error["parser_status"], "SUCCESS")
        self.assertEqual(res_error["analysis_status"], "ERROR")
