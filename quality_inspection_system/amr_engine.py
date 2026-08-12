import math
import time
import heapq
import json
import csv
import io
import threading
import numpy as np

class EKFLocalization:
    """
    Extended Kalman Filter for 2D Mobile Robot Pose & Velocity Estimation.
    State Vector: x = [x, y, yaw, vx, vy, yaw_rate]^T
    """
    def __init__(self, process_noise_std=0.05, odom_noise_std=0.15, imu_noise_std=0.02):
        self.x = np.zeros((6, 1), dtype=np.float64)
        self.P = np.eye(6, dtype=np.float64) * 0.1
        self.Q = np.eye(6, dtype=np.float64) * (process_noise_std ** 2)
        self.R_odom = np.eye(3, dtype=np.float64) * (odom_noise_std ** 2)
        self.R_imu = np.eye(2, dtype=np.float64) * (imu_noise_std ** 2)

    def predict(self, dt):
        if dt <= 0:
            return
        yaw = float(self.x[2, 0])
        vx = float(self.x[3, 0])
        vy = float(self.x[4, 0])
        yaw_rate = float(self.x[5, 0])

        dx = (vx * math.cos(yaw) - vy * math.sin(yaw)) * dt
        dy = (vx * math.sin(yaw) + vy * math.cos(yaw)) * dt
        dyaw = yaw_rate * dt

        self.x[0, 0] += dx
        self.x[1, 0] += dy
        self.x[2, 0] = math.atan2(math.sin(self.x[2, 0] + dyaw), math.cos(self.x[2, 0] + dyaw))

        F = np.eye(6, dtype=np.float64)
        F[0, 2] = (-vx * math.sin(yaw) - vy * math.cos(yaw)) * dt
        F[0, 3] = math.cos(yaw) * dt
        F[0, 4] = -math.sin(yaw) * dt
        F[1, 2] = (vx * math.cos(yaw) - vy * math.sin(yaw)) * dt
        F[1, 3] = math.sin(yaw) * dt
        F[1, 4] = math.cos(yaw) * dt
        F[2, 5] = dt

        self.P = F @ self.P @ F.T + self.Q

    def update_odom(self, raw_x, raw_y, raw_yaw):
        z = np.array([[raw_x], [raw_y], [raw_yaw]], dtype=np.float64)
        H = np.zeros((3, 6), dtype=np.float64)
        H[0, 0] = 1.0
        H[1, 1] = 1.0
        H[2, 2] = 1.0

        y = z - H @ self.x
        y[2, 0] = math.atan2(math.sin(y[2, 0]), math.cos(y[2, 0]))
        S = H @ self.P @ H.T + self.R_odom
        K = self.P @ H.T @ np.linalg.inv(S)

        self.x = self.x + K @ y
        self.P = (np.eye(6, dtype=np.float64) - K @ H) @ self.P

    def update_imu(self, imu_yaw, imu_wz):
        z = np.array([[imu_yaw], [imu_wz]], dtype=np.float64)
        H = np.zeros((2, 6), dtype=np.float64)
        H[0, 2] = 1.0
        H[1, 5] = 1.0

        y = z - H @ self.x
        y[0, 0] = math.atan2(math.sin(y[0, 0]), math.cos(y[0, 0]))
        S = H @ self.P @ H.T + self.R_imu
        K = self.P @ H.T @ np.linalg.inv(S)

        self.x = self.x + K @ y
        self.P = (np.eye(6, dtype=np.float64) - K @ H) @ self.P

    def get_state(self):
        return {
            "x": float(self.x[0, 0]),
            "y": float(self.x[1, 0]),
            "yaw": float(self.x[2, 0]),
            "vx": float(self.x[3, 0]),
            "vy": float(self.x[4, 0]),
            "yaw_rate": float(self.x[5, 0]),
            "covariance_tr": float(np.trace(self.P))
        }


class AMRNavigationEngine:
    """
    Autonomous Mobile Robot (AMR) Navigation Engine for Project 3.
    Demonstrates:
    - 2D Occupancy Grid Mapping & Ray Tracing
    - Extended Kalman Filter (EKF) Sensor Fusion (Odom + IMU)
    - Custom A* Global Pathfinding with Manhattan Heuristic
    - Obstacle Inflation Costmaps (Global & Local)
    - Dynamic Obstacle Avoidance & Reflex Tanh Deceleration
    - Safety Override & Dynamic Re-planning
    - Navigation State Machine Lifecycle
    """
    def __init__(self, map_size=10.0, resolution=0.10):
        self.map_size = map_size
        self.resolution = resolution
        self.grid_dim = int(map_size / resolution)

        # Ground Truth Pose
        self.gt_x = 1.0
        self.gt_y = 1.0
        self.gt_yaw = 0.0

        # Raw Drifting Wheel Odometry Pose
        self.odom_x = 1.0
        self.odom_y = 1.0
        self.odom_yaw = 0.0
        self.drift_bias_x = 0.0
        self.drift_bias_y = 0.0

        # Thread Safety Lock
        self.lock = threading.Lock()

        # EKF State Estimator
        self.ekf = EKFLocalization()
        self.ekf.x[0, 0] = 1.0
        self.ekf.x[1, 0] = 1.0

        # Motion Commands
        self.cmd_linear_vel = 0.0
        self.cmd_angular_vel = 0.0
        self.max_speed = 0.8
        self.safe_distance = 0.60
        self.critical_distance = 0.30

        # Inflation Parameters
        self.robot_radius = 0.25
        self.inflation_radius = 0.50
        self.cost_scaling_factor = 10.0

        # Grid Maps
        self.static_walls = self._create_indoor_maze_walls()
        self.occupancy_grid = np.full((self.grid_dim, self.grid_dim), -1, dtype=np.int8)  # -1 = unknown
        self._rasterize_static_walls()
        self.global_costmap = np.zeros((self.grid_dim, self.grid_dim), dtype=np.float32)
        self.local_costmap = np.zeros((30, 30), dtype=np.float32)  # 3m x 3m local window

        # LiDAR Sensor Specs
        self.lidar_samples = 360
        self.lidar_range_min = 0.12
        self.lidar_range_max = 10.0
        self.last_scan_ranges = []
        self.min_obstacle_dist = float('inf')

        # Path & Navigation
        self.start_pose = (1.0, 1.0)
        self.goal_pose = (8.0, 7.0)
        self.global_path = []
        self.path_waypoint_index = 0

        # Dynamic Obstacles
        self.dynamic_obstacles = [
            {"id": "dyn_1", "type": "cylinder", "x": 5.0, "y": 5.0, "radius": 0.35, "vx": 0.0, "vy": 0.15, "active": True}
        ]

        # Diagnostics & Logging
        self.nav_state = "IDLE"
        self.is_paused = False
        self.is_e_stopped = False
        self.logs = []
        self.robot_trajectory = []
        self.a_star_diagnostics = {
            "status": "NOT RUN",
            "nodes_expanded": 0,
            "planning_time_ms": 0.0,
            "path_length_m": 0.0,
            "path_cost": 0.0,
            "waypoints_count": 0,
            "open_nodes": 0,
            "closed_nodes": 0,
            "g": 0.0, "h": 0.0, "f": 0.0
        }

        self.last_update_time = time.time()
        self.add_log("INFO", "Project 3 AMR Navigation Engine initialized.")
        self.update_environment_mapping()

    def _rasterize_static_walls(self):
        """Pre-populates 2D occupancy grid with static maze wall segments."""
        for (x1, y1), (x2, y2) in self.static_walls:
            gx1, gy1 = int(x1 / self.resolution), int(y1 / self.resolution)
            gx2, gy2 = int(x2 / self.resolution), int(y2 / self.resolution)
            pts = self.bresenham_line(gx1, gy1, gx2, gy2)
            for px, py in pts:
                if 0 <= px < self.grid_dim and 0 <= py < self.grid_dim:
                    self.occupancy_grid[py, px] = 100


    def add_log(self, level, message):
        timestamp = time.strftime("%H:%M:%S")
        self.logs.append({"timestamp": timestamp, "level": level, "message": message})
        if len(self.logs) > 100:
            self.logs.pop(0)

    def _create_indoor_maze_walls(self):
        """Line segments defining static walls in the indoor maze."""
        walls = [
            # Boundary Walls
            ((0, 0), (10, 0)),
            ((10, 0), (10, 10)),
            ((10, 10), (0, 10)),
            ((0, 10), (0, 0)),

            # Inner Maze Barriers
            ((1, 3), (5, 3)),
            ((7, 3.5), (7, 8.5)),
            ((2.5, 8), (6, 8)),
            ((4, 5), (4, 6.5)),
            ((6, 1), (6, 2.5)),

            # Static Obstacle Boxes
            ((1.5, 5.5), (2.5, 5.5)),
            ((2.5, 5.5), (2.5, 6.5)),
            ((2.5, 6.5), (1.5, 6.5)),
            ((1.5, 6.5), (1.5, 5.5))
        ]
        return walls

    def world_to_grid(self, wx, wy):
        gx = int(wx / self.resolution)
        gy = int(wy / self.resolution)
        if 0 <= gx < self.grid_dim and 0 <= gy < self.grid_dim:
            return gx, gy
        return None

    def grid_to_world(self, gx, gy):
        wx = (gx + 0.5) * self.resolution
        wy = (gy + 0.5) * self.resolution
        return round(wx, 3), round(wy, 3)

    def ray_cast(self, ox, oy, angle):
        """Casts a single LiDAR ray against maze line segments and dynamic obstacles."""
        dx = math.cos(angle)
        dy = math.sin(angle)
        min_dist = self.lidar_range_max

        # Check line segments
        for (x1, y1), (x2, y2) in self.static_walls:
            # Line intersection formula
            den = (x1 - x2) * dy - (y1 - y2) * dx
            if abs(den) < 1e-9:
                continue
            t = ((x1 - ox) * (y1 - y2) - (y1 - oy) * (x1 - x2)) / den
            u = -((x1 - x2) * (y1 - oy) - (y1 - y2) * (x1 - ox)) / den

            if t >= self.lidar_range_min and 0.0 <= u <= 1.0:
                if t < min_dist:
                    min_dist = t

        # Check dynamic obstacles (circles)
        for obs in self.dynamic_obstacles:
            if not obs.get("active", True):
                continue
            cx, cy, r = obs["x"], obs["y"], obs["radius"]
            # Ray-circle intersection
            fx = ox - cx
            fy = oy - cy
            b = 2 * (fx * dx + fy * dy)
            c = (fx*fx + fy*fy) - r*r
            discriminant = b*b - 4*c
            if discriminant >= 0:
                discriminant = math.sqrt(discriminant)
                t1 = (-b - discriminant) / 2.0
                if t1 >= self.lidar_range_min and t1 < min_dist:
                    min_dist = t1

        return min_dist

    def generate_lidar_scan(self):
        """Simulates full 360-degree LiDAR scan and computes forward obstacle clearance."""
        ranges = []
        angle_step = (2 * math.pi) / self.lidar_samples
        min_d = float('inf')

        for i in range(self.lidar_samples):
            rel_angle = -math.pi + i * angle_step
            angle = self.gt_yaw + rel_angle
            r = self.ray_cast(self.gt_x, self.gt_y, angle)
            ranges.append(round(r, 3))

            # Only consider forward-facing rays (+- 60 deg cone) for forward collision & deceleration
            if abs(rel_angle) <= (math.pi / 3.0):
                if r < min_d:
                    min_d = r

        self.last_scan_ranges = ranges
        self.min_obstacle_dist = min_d if min_d != float('inf') else self.lidar_range_max
        return ranges


    def update_environment_mapping(self):
        """Updates 2D Occupancy Grid from simulated LiDAR and Ray Tracing."""
        scan = self.generate_lidar_scan()
        angle_step = (2 * math.pi) / self.lidar_samples

        rx0, ry0 = int(self.gt_x / self.resolution), int(self.gt_y / self.resolution)

        for i, r in enumerate(scan):
            angle = self.gt_yaw + (-math.pi + i * angle_step)
            wx = self.gt_x + r * math.cos(angle)
            wy = self.gt_y + r * math.sin(angle)

            target = self.world_to_grid(wx, wy)
            if not target:
                continue
            tx, ty = target

            # Ray tracing (Bresenham)
            pts = self.bresenham_line(rx0, ry0, tx, ty)
            for px, py in pts[:-1]:
                if 0 <= px < self.grid_dim and 0 <= py < self.grid_dim:
                    if self.occupancy_grid[py, px] != 100:
                        self.occupancy_grid[py, px] = 0  # Free cell

            if r < self.lidar_range_max and 0 <= tx < self.grid_dim and 0 <= ty < self.grid_dim:
                self.occupancy_grid[ty, tx] = 100  # Occupied cell

        self.compute_costmaps()

    def bresenham_line(self, x0, y0, x1, y1):
        points = []
        dx = abs(x1 - x0)
        dy = abs(y1 - y0)
        sx = 1 if x0 < x1 else -1
        sy = 1 if y0 < y1 else -1
        err = dx - dy
        cx, cy = x0, y0
        while True:
            points.append((cx, cy))
            if cx == x1 and cy == y1:
                break
            e2 = 2 * err
            if e2 > -dy:
                err -= dy
                cx += sx
            if e2 < dx:
                err += dx
                cy += sy
        return points

    def compute_costmaps(self):
        """Calculates Global and Local Inflation Costmaps."""
        self.global_costmap = np.copy(self.occupancy_grid).astype(np.float32)
        inf_cells = int(math.ceil(self.inflation_radius / self.resolution))
        rob_cells = int(math.ceil(self.robot_radius / self.resolution))

        occ_y, occ_x = np.where(self.occupancy_grid == 100)

        for ry, rx in zip(occ_y, occ_x):
            y_min = max(0, ry - inf_cells)
            y_max = min(self.grid_dim, ry + inf_cells + 1)
            x_min = max(0, rx - inf_cells)
            x_max = min(self.grid_dim, rx + inf_cells + 1)

            for cy in range(y_min, y_max):
                for cx in range(x_min, x_max):
                    if self.occupancy_grid[cy, cx] == 100:
                        continue
                    dist = math.hypot((cx - rx) * self.resolution, (cy - ry) * self.resolution)
                    if dist <= self.robot_radius:
                        self.global_costmap[cy, cx] = 100.0
                    elif dist <= self.inflation_radius:
                        factor = math.exp(-self.cost_scaling_factor * (dist - self.robot_radius))
                        self.global_costmap[cy, cx] = max(self.global_costmap[cy, cx], 50.0 * factor)

        # Rolling local costmap around robot (30x30 cells)
        rgx, rgy = int(self.gt_x / self.resolution), int(self.gt_y / self.resolution)
        l_min_x = max(0, rgx - 15)
        l_max_x = min(self.grid_dim, rgx + 15)
        l_min_y = max(0, rgy - 15)
        l_max_y = min(self.grid_dim, rgy + 15)

        self.local_costmap = np.zeros((30, 30), dtype=np.float32)
        sub_grid = self.global_costmap[l_min_y:l_max_y, l_min_x:l_max_x]
        h_sub, w_sub = sub_grid.shape
        self.local_costmap[:h_sub, :w_sub] = sub_grid

    def manhattan_heuristic(self, p1, p2):
        """h(n) = |x1-x2| + |y1-y2| for 4-way discrete grid."""
        return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1])

    def plan_custom_a_star(self, start=None, goal=None):
        """
        CUSTOM A* PATHFINDING ALGORITHM
        f(n) = g(n) + h(n)
        h(n) = Manhattan distance
        OPEN list / priority queue, CLOSED set, parent tracking.
        """
        with self.lock:
            return self._internal_plan_a_star(start, goal)

    def _internal_plan_a_star(self, start=None, goal=None):
        if start is not None:
            self.start_pose = start
        else:
            self.start_pose = (float(self.ekf.x[0, 0]), float(self.ekf.x[1, 0]))

        if goal is not None:
            self.goal_pose = goal

        s_grid = self.world_to_grid(*self.start_pose)
        g_grid = self.world_to_grid(*self.goal_pose)


        if not s_grid or not g_grid:
            self.add_log("ERROR", "A* Planning Failed: Start or Goal outside map boundaries.")
            self.nav_state = "ERROR"
            return False, []

        if self.global_costmap[g_grid[1], g_grid[0]] >= 100:
            self.add_log("ERROR", "A* Planner Rejected Goal: Goal is inside a solid obstacle wall! GOAL INVALID.")
            self.a_star_diagnostics["status"] = "GOAL INVALID"
            self.nav_state = "ERROR"
            return False, []

        t0 = time.time()
        self.add_log("INFO", f"A* Planning started from {self.start_pose} to {self.goal_pose}.")
        self.nav_state = "PLANNING"

        open_list = []
        h_start = self.manhattan_heuristic(s_grid, g_grid)
        heapq.heappush(open_list, (h_start, h_start, 0.0, s_grid))

        g_score = {s_grid: 0.0}
        f_score = {s_grid: h_start}
        came_from = {}
        closed_set = set()

        nodes_expanded = 0
        neighbors = [(0, 1), (0, -1), (-1, 0), (1, 0)]  # Discrete 4-way movement
        path_found = False

        while open_list:
            _, curr_h, curr_g, current = heapq.heappop(open_list)

            if current in closed_set:
                continue

            closed_set.add(current)
            nodes_expanded += 1

            if current == g_grid:
                path_found = True
                break

            for dx, dy in neighbors:
                nx, ny = current[0] + dx, current[1] + dy

                if not (0 <= nx < self.grid_dim and 0 <= ny < self.grid_dim):
                    continue

                cell_cost = self.global_costmap[ny, nx]
                if cell_cost >= 100:  # Solid obstacle wall cell
                    continue

                traversal_cost = 1.0 + (cell_cost / 5.0)

                tentative_g = curr_g + traversal_cost

                neighbor = (nx, ny)
                if neighbor in closed_set:
                    continue

                if tentative_g < g_score.get(neighbor, float('inf')):
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    h_val = self.manhattan_heuristic(neighbor, g_grid)
                    f_val = tentative_g + h_val
                    f_score[neighbor] = f_val
                    heapq.heappush(open_list, (f_val, h_val, tentative_g, neighbor))

        planning_time_ms = (time.time() - t0) * 1000.0

        if not path_found:
            self.add_log("WARNING", "A* Planning Failed: No valid path found.")
            self.a_star_diagnostics = {
                "status": "NO PATH FOUND",
                "nodes_expanded": int(nodes_expanded),
                "planning_time_ms": round(float(planning_time_ms), 2),
                "path_length_m": 0.0, "path_cost": 0.0, "waypoints_count": 0,
                "open_nodes": int(len(open_list)), "closed_nodes": int(len(closed_set)),
                "g": 0.0, "h": float(h_start), "f": float(h_start)
            }
            self.nav_state = "ERROR"
            return False, []


        # Reconstruct path
        curr = g_grid
        grid_path = [curr]
        while curr in came_from:
            curr = came_from[curr]
            grid_path.append(curr)
        grid_path.reverse()

        world_path = [self.grid_to_world(gx, gy) for gx, gy in grid_path]
        path_length_m = sum(math.hypot(world_path[i+1][0] - world_path[i][0], world_path[i+1][1] - world_path[i][1])
                             for i in range(len(world_path) - 1))
        path_cost = g_score[g_grid]

        self.global_path = world_path
        self.path_waypoint_index = 0

        self.a_star_diagnostics = {
            "status": "SUCCESS",
            "nodes_expanded": int(nodes_expanded),
            "planning_time_ms": round(float(planning_time_ms), 2),
            "path_length_m": round(float(path_length_m), 2),
            "path_cost": round(float(path_cost), 2),
            "waypoints_count": int(len(world_path)),
            "open_nodes": int(len(open_list)),
            "closed_nodes": int(len(closed_set)),
            "g": round(float(path_cost), 2),
            "h": 0.0,
            "f": round(float(path_cost), 2)
        }


        self.add_log("SUCCESS", f"A* Path generated! Length: {path_length_m:.2f}m, Waypoints: {len(world_path)}, Time: {planning_time_ms:.1f}ms.")
        self.nav_state = "NAVIGATING"
        return True, world_path

    def update_simulation_step(self, dt=0.05):
        """Core simulation iteration: Kinematics, Sensor Noise, EKF, Avoidance & Control."""
        if self.is_paused:
            return

        with self.lock:
            self._internal_simulation_step(dt)

    def _internal_simulation_step(self, dt=0.05):
        now = time.time()
        # Update dynamic obstacles positions
        for obs in self.dynamic_obstacles:
            if not obs.get("active", True):
                continue
            obs["x"] += obs["vx"] * dt
            obs["y"] += obs["vy"] * dt
            # Bounce back at boundaries
            if obs["x"] <= 1.0 or obs["x"] >= 9.0: obs["vx"] *= -1
            if obs["y"] <= 1.0 or obs["y"] >= 9.0: obs["vy"] *= -1

        # Predict EKF state
        self.ekf.predict(dt)

        # Apply Differential Drive Kinematics to Ground Truth Pose
        self.gt_x += (self.cmd_linear_vel * math.cos(self.gt_yaw)) * dt
        self.gt_y += (self.cmd_linear_vel * math.sin(self.gt_yaw)) * dt
        self.gt_yaw = math.atan2(math.sin(self.gt_yaw + self.cmd_angular_vel * dt),
                                 math.cos(self.gt_yaw + self.cmd_angular_vel * dt))

        # Add Artificial Odometry Drift Noise
        self.drift_bias_x += np.random.normal(0.0, 0.005)
        self.drift_bias_y += np.random.normal(0.0, 0.005)
        self.odom_x = self.gt_x + np.random.normal(0, 0.03) + self.drift_bias_x
        self.odom_y = self.gt_y + np.random.normal(0, 0.03) + self.drift_bias_y
        self.odom_yaw = math.atan2(math.sin(self.gt_yaw + np.random.normal(0, 0.02)),
                                   math.cos(self.gt_yaw + np.random.normal(0, 0.02)))

        # Update EKF with Wheel Odom & IMU
        self.ekf.update_odom(self.odom_x, self.odom_y, self.odom_yaw)
        imu_yaw = self.gt_yaw + np.random.normal(0, 0.01)
        imu_wz = self.cmd_angular_vel + np.random.normal(0, 0.01)
        self.ekf.update_imu(imu_yaw, imu_wz)

        ekf_pose = self.ekf.get_state()

        # Update LiDAR and Map
        self.update_environment_mapping()

        # Append trajectory
        self.robot_trajectory.append((round(ekf_pose["x"], 2), round(ekf_pose["y"], 2)))
        if len(self.robot_trajectory) > 500:
            self.robot_trajectory.pop(0)

        # Dynamic Obstacle Avoidance & Control Logic
        if self.is_e_stopped:
            self.cmd_linear_vel = 0.0
            self.cmd_angular_vel = 0.0
            self.nav_state = "EMERGENCY_STOP"
            return

        # Critical Obstacle Safety Override
        if self.min_obstacle_dist <= self.critical_distance:
            self.cmd_linear_vel = 0.0
            self.cmd_angular_vel = 0.0
            self.is_e_stopped = True
            self.nav_state = "EMERGENCY_STOP"
            self.add_log("DANGER", f"EMERGENCY STOP: Critical obstacle detected at {self.min_obstacle_dist:.2f}m!")
            return

        if not self.global_path or self.nav_state in ["IDLE", "GOAL_REACHED", "ERROR"]:
            self.cmd_linear_vel = 0.0
            self.cmd_angular_vel = 0.0
            return

        # Check goal arrival
        gx, gy = self.goal_pose
        dist_to_goal = math.hypot(gx - ekf_pose["x"], gy - ekf_pose["y"])
        if dist_to_goal < 0.25:
            self.cmd_linear_vel = 0.0
            self.cmd_angular_vel = 0.0
            self.nav_state = "GOAL_REACHED"
            self.add_log("SUCCESS", "Goal pose successfully reached!")
            return

        # Check target waypoint
        target_x, target_y = self.global_path[self.path_waypoint_index]
        dist_to_wp = math.hypot(target_x - ekf_pose["x"], target_y - ekf_pose["y"])

        if dist_to_wp < 0.25 and self.path_waypoint_index < len(self.global_path) - 1:
            self.path_waypoint_index += 1
            target_x, target_y = self.global_path[self.path_waypoint_index]

        # Safety Layer & Reflex Deceleration
        obstacle_error = self.min_obstacle_dist - self.critical_distance

        if self.min_obstacle_dist <= self.safe_distance:
            # OBSTACLE DETECTED -> DECELERATING & DYNAMIC RE-PLANNING CHECK
            self.nav_state = "DECELERATING"
            decel_vel = self.max_speed * math.tanh(max(0.0, obstacle_error))
            self.cmd_linear_vel = max(0.05, decel_vel)


            target_heading = math.atan2(target_y - ekf_pose["y"], target_x - ekf_pose["x"])
            heading_err = math.atan2(math.sin(target_heading - ekf_pose["yaw"]), math.cos(target_heading - ekf_pose["yaw"]))
            self.cmd_angular_vel = float(np.clip(2.0 * heading_err, -1.0, 1.0))

            # Trigger A* Dynamic Re-planning if path is blocked ahead
            if self.min_obstacle_dist < 0.45:
                self.add_log("WARNING", f"Dynamic obstacle blocking global path ({self.min_obstacle_dist:.2f}m). Triggering A* Re-planning...")
                self.nav_state = "REPLANNING"
                success, new_path = self.plan_custom_a_star((ekf_pose["x"], ekf_pose["y"]), self.goal_pose)
                if not success:
                    self.add_log("ERROR", "Re-planning failed to circumvent dynamic obstacle.")
        else:
            # NORMAL NAVIGATION
            self.nav_state = "NAVIGATING"
            target_heading = math.atan2(target_y - ekf_pose["y"], target_x - ekf_pose["x"])
            heading_err = math.atan2(math.sin(target_heading - ekf_pose["yaw"]), math.cos(target_heading - ekf_pose["yaw"]))

            if abs(heading_err) > 0.4:
                self.cmd_linear_vel = 0.05
                self.cmd_angular_vel = float(np.clip(2.5 * heading_err, -1.2, 1.2))
            else:
                self.cmd_linear_vel = self.max_speed
                self.cmd_angular_vel = float(np.clip(1.5 * heading_err, -0.8, 0.8))

    def trigger_emergency_stop(self):
        with self.lock:
            self.is_e_stopped = True
            self.cmd_linear_vel = 0.0
            self.cmd_angular_vel = 0.0
            self.nav_state = "EMERGENCY_STOP"
            self.add_log("DANGER", "EMERGENCY STOP manually triggered by user.")

    def reset_system(self):
        with self.lock:
            self.gt_x, self.gt_y, self.gt_yaw = 1.0, 1.0, 0.0
            self.odom_x, self.odom_y, self.odom_yaw = 1.0, 1.0, 0.0
            self.drift_bias_x, self.drift_bias_y = 0.0, 0.0
            self.ekf = EKFLocalization()
            self.ekf.x[0, 0] = 1.0
            self.ekf.x[1, 0] = 1.0

            self.cmd_linear_vel = 0.0
            self.cmd_angular_vel = 0.0
            self.is_e_stopped = False
            self.is_paused = False
            self.global_path = []
            self.robot_trajectory = []
            self.nav_state = "IDLE"
            self.add_log("INFO", "AMR System reset to default Start Pose (1.0, 1.0).")


    def export_data_json(self):
        ekf_pose = self.ekf.get_state()
        data = {
            "ros2_status": "SIMULATION MODE",
            "navigation_state": self.nav_state,
            "start_pose": self.start_pose,
            "goal_pose": self.goal_pose,
            "ekf_filtered_pose": ekf_pose,
            "raw_odometry": {"x": self.odom_x, "y": self.odom_y, "yaw": self.odom_yaw},
            "ground_truth": {"x": self.gt_x, "y": self.gt_y, "yaw": self.gt_yaw},
            "lidar_min_range": self.min_obstacle_dist,
            "a_star_diagnostics": self.a_star_diagnostics,
            "global_path_waypoints": self.global_path,
            "robot_trajectory": self.robot_trajectory,
            "logs": self.logs
        }
        return json.dumps(data, indent=2)

    def export_data_csv(self):
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Time", "State", "GT_X", "GT_Y", "GT_Yaw", "Odom_X", "Odom_Y", "EKF_X", "EKF_Y", "EKF_Yaw", "Linear_Vel", "Angular_Vel", "Min_Laser_Dist"])

        ekf_pose = self.ekf.get_state()
        writer.writerow([
            time.strftime("%H:%M:%S"), self.nav_state,
            round(self.gt_x, 3), round(self.gt_y, 3), round(self.gt_yaw, 3),
            round(self.odom_x, 3), round(self.odom_y, 3),
            round(ekf_pose["x"], 3), round(ekf_pose["y"], 3), round(ekf_pose["yaw"], 3),
            round(self.cmd_linear_vel, 3), round(self.cmd_angular_vel, 3),
            round(self.min_obstacle_dist, 3)
        ])
        return output.getvalue()

    def get_full_state_dict(self):
        with self.lock:
            ekf_pose = self.ekf.get_state()
            odom_drift = math.hypot(self.odom_x - self.gt_x, self.odom_y - self.gt_y)

            # Dist to goal
            dist_to_goal = math.hypot(self.goal_pose[0] - ekf_pose["x"], self.goal_pose[1] - ekf_pose["y"])

            return {
                "ros2_connection": "SIMULATION MODE",
                "nav_state": str(self.nav_state),
                "start_pose": list(self.start_pose),
                "goal_pose": list(self.goal_pose),
                "ground_truth": {"x": round(float(self.gt_x), 3), "y": round(float(self.gt_y), 3), "yaw": round(float(self.gt_yaw), 3)},
                "raw_odometry": {"x": round(float(self.odom_x), 3), "y": round(float(self.odom_y), 3), "yaw": round(float(self.odom_yaw), 3)},
                "ekf_pose": ekf_pose,
                "odometry_drift_m": round(float(odom_drift), 3),
                "linear_velocity": round(float(self.cmd_linear_vel), 2),
                "angular_velocity": round(float(self.cmd_angular_vel), 2),
                "goal_distance_m": round(float(dist_to_goal), 2),
                "lidar_min_range_m": round(float(self.min_obstacle_dist), 2),
                "lidar_valid_beams": len([r for r in self.last_scan_ranges if r < self.lidar_range_max]),
                "scan_ranges": [float(r) for r in self.last_scan_ranges],
                "a_star_diagnostics": {k: (float(v) if isinstance(v, (np.floating, float)) else int(v) if isinstance(v, (np.integer, int)) else str(v)) for k, v in self.a_star_diagnostics.items()},
                "global_path": [[float(p[0]), float(p[1])] for p in self.global_path],

                "robot_trajectory": list(self.robot_trajectory[-100:]),
                "dynamic_obstacles": [dict(o) for o in self.dynamic_obstacles],
                "static_walls": list(self.static_walls),
                "is_e_stopped": bool(self.is_e_stopped),
                "is_paused": bool(self.is_paused),
                "logs": list(self.logs[-20:]),
                "tf_tree": [
                    {"parent": "map", "child": "odom"},
                    {"parent": "odom", "child": "base_link"},
                    {"parent": "base_link", "child": "laser"},
                    {"parent": "base_link", "child": "imu_link"}
                ]
            }


