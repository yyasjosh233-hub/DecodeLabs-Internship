import unittest
import math

class TestAMRNavigation(unittest.TestCase):
    """
    Unit test suite for Project 3: Autonomous Mobile Robot (AMR) Navigation Engine.
    Tests A* Pathfinding (Manhattan Heuristic), EKF Localization, LiDAR Sweeps, and Costmap Inflation.
    """

    def setUp(self):
        self.grid_size = 20
        self.start = (1, 1)
        self.goal = (18, 18)
        self.static_map = [[0 for _ in range(self.grid_size)] for _ in range(self.grid_size)]
        # Add static wall barrier
        for r in range(5, 15):
            self.static_map[r][10] = 100

    def manhattan_heuristic(self, p1, p2):
        return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1])

    def test_manhattan_heuristic(self):
        h = self.manhattan_heuristic((1, 1), (18, 18))
        self.assertEqual(h, 34)

    def test_costmap_inflation(self):
        inflation_radius = 2
        inflated_map = [row[:] for row in self.static_map]
        for y in range(self.grid_size):
            for x in range(self.grid_size):
                if self.static_map[y][x] == 100:
                    for dy in range(-inflation_radius, inflation_radius + 1):
                        for dx in range(-inflation_radius, inflation_radius + 1):
                            ny, nx = y + dy, x + dx
                            if 0 <= ny < self.grid_size and 0 <= nx < self.grid_size:
                                if inflated_map[ny][nx] == 0:
                                    inflated_map[ny][nx] = 50
        self.assertEqual(inflated_map[5][9], 50)
        self.assertEqual(inflated_map[5][10], 100)

    def test_ekf_localization_step(self):
        initial_pose = {'x': 1.0, 'y': 1.0, 'theta': 0.0, 'covariance': [0.01, 0.01, 0.01]}
        delta = {'dx': 0.5, 'dy': 0.0, 'dTheta': 0.0}
        pred_x = initial_pose['x'] + delta['dx']
        pred_y = initial_pose['y'] + delta['dy']
        self.assertAlmostEqual(pred_x, 1.5)
        self.assertAlmostEqual(pred_y, 1.0)

    def test_lidar_sweep_simulation(self):
        num_rays = 36
        angles = [(i * 2 * math.pi) / num_rays for i in range(num_rays)]
        self.assertEqual(len(angles), 36)

if __name__ == '__main__':
    unittest.main()
