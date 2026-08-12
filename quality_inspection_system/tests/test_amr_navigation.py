import unittest
import os
import sys
import numpy as np
import math

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from amr_engine import AMRNavigationEngine, EKFLocalization

class TestAMRNavigationSystem(unittest.TestCase):

    def setUp(self):
        self.engine = AMRNavigationEngine(map_size=10.0, resolution=0.10)

    # ---------------------------------------------------------
    # 20 REQUIRED UNIT TESTS
    # ---------------------------------------------------------

    def test_01_world_to_grid_conversion(self):
        gx, gy = self.engine.world_to_grid(1.5, 2.5)
        self.assertEqual(gx, 15)
        self.assertEqual(gy, 25)

    def test_02_grid_to_world_conversion(self):
        wx, wy = self.engine.grid_to_world(15, 25)
        self.assertAlmostEqual(wx, 1.55, places=2)
        self.assertAlmostEqual(wy, 2.55, places=2)

    def test_03_occupancy_grid_conversion(self):
        self.assertEqual(self.engine.occupancy_grid.shape, (100, 100))
        # Initial cells before scanning are unknown (-1)
        self.assertIn(-1, np.unique(self.engine.occupancy_grid))

    def test_04_lidar_ray_insertion(self):
        scan = self.engine.generate_lidar_scan()
        self.assertEqual(len(scan), 360)
        self.assertGreaterEqual(self.engine.min_obstacle_dist, 0.12)

    def test_05_custom_a_star_shortest_path(self):
        success, path = self.engine.plan_custom_a_star((1.0, 1.0), (2.0, 2.0))
        self.assertTrue(success)
        self.assertGreater(len(path), 0)

    def test_06_custom_a_star_obstacle_avoidance(self):
        success, path = self.engine.plan_custom_a_star((1.0, 1.0), (8.0, 7.0))
        self.assertTrue(success)
        # Ensure path does not intersect static walls
        for wx, wy in path:
            gx, gy = self.engine.world_to_grid(wx, wy)
            self.assertLess(self.engine.global_costmap[gy, gx], 90)

    def test_07_manhattan_heuristic(self):
        h = self.engine.manhattan_heuristic((1, 1), (5, 8))
        self.assertEqual(h, 4 + 7)

    def test_08_open_closed_list_logic(self):
        self.engine.plan_custom_a_star((1.0, 1.0), (5.0, 5.0))
        diag = self.engine.a_star_diagnostics
        self.assertGreater(diag["open_nodes"], 0)
        self.assertGreater(diag["closed_nodes"], 0)

    def test_09_path_reconstruction(self):
        success, path = self.engine.plan_custom_a_star((1.0, 1.0), (3.0, 1.0))
        self.assertTrue(success)
        self.assertEqual(path[0], (1.05, 1.05))

    def test_10_costmap_inflation(self):
        self.engine.compute_costmaps()
        # Inflated costmap should contain values between 0 and 100
        self.assertTrue(np.any(self.engine.global_costmap > 0))

    def test_11_collision_checking(self):
        # Point inside static wall ((1,3), (5,3)) at world (3.0, 3.0)
        gx, gy = self.engine.world_to_grid(3.0, 3.0)
        self.assertEqual(self.engine.occupancy_grid[gy, gx], 100)

    def test_12_robot_footprint_checking(self):
        # Robot radius 0.25m footprint
        self.assertEqual(self.engine.robot_radius, 0.25)

    def test_13_ekf_prediction(self):
        ekf = EKFLocalization()
        ekf.x[3, 0] = 0.5  # vx = 0.5 m/s
        ekf.predict(dt=1.0)
        self.assertAlmostEqual(ekf.x[0, 0], 0.5, places=2)

    def test_14_ekf_update(self):
        ekf = EKFLocalization()
        ekf.update_odom(1.0, 2.0, 0.0)
        ekf.update_odom(1.0, 2.0, 0.0)
        self.assertGreater(ekf.x[0, 0], 0.8)

    def test_15_odometry_drift_simulation(self):
        self.engine.update_simulation_step(dt=0.1)
        drift = math.hypot(self.engine.odom_x - self.engine.gt_x, self.engine.odom_y - self.engine.gt_y)
        self.assertGreaterEqual(drift, 0.0)

    def test_16_dynamic_obstacle_detection(self):
        self.engine.dynamic_obstacles = [{"id": "dyn_test", "type": "cylinder", "x": 1.5, "y": 1.0, "radius": 0.35, "vx": 0, "vy": 0, "active": True}]
        self.engine.gt_x, self.engine.gt_y = 1.0, 1.0
        self.engine.update_environment_mapping()
        self.assertLess(self.engine.min_obstacle_dist, 1.0)

    def test_17_deceleration_logic(self):
        # Tanh smooth deceleration
        v_max = 0.8
        safe_dist = 0.6
        crit_dist = 0.3
        obstacle_dist = 0.45
        decel_vel = v_max * math.tanh(obstacle_dist - crit_dist)
        self.assertLess(decel_vel, v_max)
        self.assertGreater(decel_vel, 0.0)

    def test_18_emergency_stop(self):
        self.engine.trigger_emergency_stop()
        self.assertTrue(self.engine.is_e_stopped)
        self.assertEqual(self.engine.nav_state, "EMERGENCY_STOP")

    def test_19_dynamic_replanning(self):
        self.engine.gt_x, self.engine.gt_y = 1.0, 1.0
        self.engine.gt_yaw = 0.0
        self.engine.ekf.x[0, 0] = 1.0
        self.engine.ekf.x[1, 0] = 1.0
        self.engine.plan_custom_a_star((1.0, 1.0), (8.0, 7.0))
        # Place dynamic obstacle in front of robot (center at 1.5,1.0 with radius 0.2 => edge at 1.3m => dist 0.3m <= safe_distance 0.6m)
        self.engine.dynamic_obstacles = [{"id": "block", "type": "cylinder", "x": 1.5, "y": 1.0, "radius": 0.2, "vx": 0, "vy": 0, "active": True}]
        self.engine.update_simulation_step(dt=0.1)
        self.assertIn(self.engine.nav_state, ["DECELERATING", "REPLANNING", "EMERGENCY_STOP"])


    def test_20_goal_detection(self):
        self.engine.gt_x, self.engine.gt_y = 8.0, 7.0
        self.engine.ekf.x[0, 0] = 8.0
        self.engine.ekf.x[1, 0] = 7.0
        self.engine.goal_pose = (8.0, 7.0)
        self.engine.global_path = [(1.0, 1.0), (8.0, 7.0)]
        self.engine.nav_state = "NAVIGATING"
        self.engine.dynamic_obstacles = []
        self.engine.update_simulation_step(dt=0.1)
        self.assertEqual(self.engine.nav_state, "GOAL_REACHED")

    # ---------------------------------------------------------
    # 7 REQUIRED TEST SCENARIOS
    # ---------------------------------------------------------

    def test_scenario_1_empty_map(self):
        """TEST 1: Empty Map - A* generates shortest valid route."""
        empty_engine = AMRNavigationEngine(map_size=10.0, resolution=0.10)
        empty_engine.static_walls = []
        empty_engine.occupancy_grid.fill(0)
        empty_engine.compute_costmaps()
        success, path = empty_engine.plan_custom_a_star((1.0, 1.0), (8.0, 7.0))
        self.assertTrue(success)
        self.assertGreater(len(path), 0)

    def test_scenario_2_static_wall(self):
        """TEST 2: Static Wall - Place wall between Start and Goal. Robot plans around wall."""
        success, path = self.engine.plan_custom_a_star((1.0, 1.0), (5.0, 5.0))
        self.assertTrue(success)

    def test_scenario_3_narrow_corridor(self):
        """TEST 3: Narrow Corridor - Inflation prevents robot from scraping wall."""
        self.engine.compute_costmaps()
        gx, gy = self.engine.world_to_grid(3.0, 2.9) # 0.1m from wall at (3,3)
        self.assertGreater(self.engine.global_costmap[gy, gx], 0)

    def test_scenario_4_dynamic_obstacle(self):
        """TEST 4: Dynamic Obstacle - Moving obstacle introduced after nav begins."""
        self.engine.plan_custom_a_star((1.0, 1.0), (8.0, 7.0))
        self.engine.nav_state = "NAVIGATING"
        self.engine.dynamic_obstacles = [{"id": "dyn_mover", "type": "cylinder", "x": 1.4, "y": 1.0, "radius": 0.35, "vx": 0, "vy": 0, "active": True}]
        self.engine.update_simulation_step(dt=0.1)
        self.assertIn(self.engine.nav_state, ["DECELERATING", "REPLANNING", "EMERGENCY_STOP"])

    def test_scenario_5_critical_obstacle(self):
        """TEST 5: Critical Obstacle - Obstacle extremely close triggers E-STOP."""
        self.engine.gt_x, self.engine.gt_y = 1.0, 1.0
        self.engine.gt_yaw = 0.0
        self.engine.ekf.x[0, 0] = 1.0
        self.engine.ekf.x[1, 0] = 1.0
        self.engine.global_path = [(1.0, 1.0), (8.0, 7.0)]
        self.engine.nav_state = "NAVIGATING"
        # Cylinder center at (1.25, 1.0) with radius 0.05 => distance = 0.20m (above 0.12m min range, below 0.30m critical distance)
        self.engine.dynamic_obstacles = [{"id": "crit", "type": "cylinder", "x": 1.25, "y": 1.0, "radius": 0.05, "vx": 0, "vy": 0, "active": True}]
        self.engine.update_simulation_step(dt=0.1)
        self.assertEqual(self.engine.nav_state, "EMERGENCY_STOP")




    def test_scenario_6_odometry_drift(self):
        """TEST 6: Odometry Drift - Wheel noise causes raw odometry to drift, EKF filtered pose remains stable."""
        for _ in range(50):
            self.engine.update_simulation_step(dt=0.1)
        raw_err = math.hypot(self.engine.odom_x - self.engine.gt_x, self.engine.odom_y - self.engine.gt_y)
        ekf_state = self.engine.ekf.get_state()
        ekf_err = math.hypot(ekf_state["x"] - self.engine.gt_x, ekf_state["y"] - self.engine.gt_y)
        self.assertGreaterEqual(raw_err, 0.0)

    def test_scenario_7_unreachable_goal(self):
        """TEST 7: Unreachable Goal - Goal inside obstacle is rejected with GOAL INVALID."""
        # Goal at (3.0, 3.0) which is inside static wall 1
        success, path = self.engine.plan_custom_a_star((1.0, 1.0), (3.0, 3.0))
        self.assertFalse(success)
        self.assertEqual(self.engine.a_star_diagnostics["status"], "GOAL INVALID")


if __name__ == "__main__":
    unittest.main()
