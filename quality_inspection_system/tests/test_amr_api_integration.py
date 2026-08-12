import unittest
import json
import sys
import os

# Add quality_inspection_system to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app, amr_engine

class TestAMRAPIIntegration(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        # Reset engine before each test
        amr_engine.reset_system()

    def test_01_get_state_endpoint(self):
        """Test GET /api/amr/state returns 200 OK and valid telemetry dictionary."""
        response = self.app.get('/api/amr/state')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("ros2_connection", data)
        self.assertIn("nav_state", data)
        self.assertIn("ekf_pose", data)
        self.assertIn("scan_ranges", data)
        self.assertIn("static_walls", data)
        self.assertIn("a_star_diagnostics", data)
        self.assertEqual(data["nav_state"], "IDLE")

    def test_02_post_plan_endpoint(self):
        """Test POST /api/amr/plan invokes A* planner and returns global path."""
        response = self.app.post('/api/amr/plan')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "success")
        self.assertIn("path", data)
        self.assertTrue(len(data["path"]) > 0)
        self.assertEqual(data["a_star_diagnostics"]["status"], "SUCCESS")

    def test_03_post_navigate_endpoint(self):
        """Test POST /api/amr/navigate transitions state to NAVIGATING."""
        # First plan a path
        self.app.post('/api/amr/plan')
        # Then start navigation
        response = self.app.post('/api/amr/navigate', json={"action": "start"})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["nav_state"], "NAVIGATING")

        # Step engine simulation
        amr_engine.update_simulation_step(dt=0.5)

        # Verify state live movement
        state_resp = self.app.get('/api/amr/state')
        state_data = json.loads(state_resp.data)
        self.assertEqual(state_data["nav_state"], "NAVIGATING")
        self.assertTrue(len(state_data["robot_trajectory"]) > 0)

    def test_04_post_reset_endpoint(self):
        """Test POST /api/amr/reset resets robot pose, state, and clears paths."""
        # Drive robot and start nav
        self.app.post('/api/amr/plan')
        self.app.post('/api/amr/navigate', json={"action": "start"})
        amr_engine.update_simulation_step(dt=1.0)

        # Reset
        response = self.app.post('/api/amr/reset')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "success")

        # Verify state
        state_resp = self.app.get('/api/amr/state')
        state_data = json.loads(state_resp.data)
        self.assertEqual(state_data["nav_state"], "IDLE")
        self.assertEqual(state_data["ekf_pose"]["x"], 1.0)
        self.assertEqual(state_data["ekf_pose"]["y"], 1.0)
        self.assertEqual(len(state_data["global_path"]), 0)

    def test_05_export_endpoints(self):
        """Test JSON and CSV export endpoints return valid attachment files."""
        res_json = self.app.get('/api/amr/export/json')
        self.assertEqual(res_json.status_code, 200)
        self.assertEqual(res_json.mimetype, 'application/json')

        res_csv = self.app.get('/api/amr/export/csv')
        self.assertEqual(res_csv.status_code, 200)
        self.assertEqual(res_csv.mimetype, 'text/csv')

if __name__ == '__main__':
    unittest.main()
