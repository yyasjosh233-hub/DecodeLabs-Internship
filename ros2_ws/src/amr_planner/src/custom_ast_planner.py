#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
import heapq
import time
import math
import numpy as np
from nav_msgs.msg import OccupancyGrid, Path
from geometry_msgs.msg import PoseStamped
from std_msgs.msg import String
import json

class CustomAStarPlannerNode(Node):
    """
    Custom A* Pathfinding Planner Node.
    f(n) = g(n) + h(n) with Manhattan Heuristic: h(n) = |x1-x2| + |y1-y2|
    Discrete 4-way grid expansion (UP, DOWN, LEFT, RIGHT).
    Generates inflated global costmap and validates global path clearance.
    """
    def __init__(self):
        super().__init__('custom_ast_planner')

        self.declare_parameter('robot_radius', 0.25)
        self.declare_parameter('inflation_radius', 0.50)
        self.declare_parameter('cost_scaling_factor', 10.0)

        self.robot_radius = self.get_parameter('robot_radius').value
        self.inflation_radius = self.get_parameter('inflation_radius').value
        self.cost_scaling_factor = self.get_parameter('cost_scaling_factor').value

        self.map_grid = None
        self.costmap = None
        self.resolution = 0.10
        self.width = 100
        self.height = 100

        self.start_pose = (1.0, 1.0)
        self.goal_pose = (8.0, 7.0)

        # Subscriptions & Publishers
        self.create_subscription(OccupancyGrid, '/map', self.map_callback, 10)
        self.create_subscription(PoseStamped, '/goal_pose', self.goal_callback, 10)

        self.path_pub = self.create_publisher(Path, '/global_path', 10)
        self.costmap_pub = self.create_publisher(OccupancyGrid, '/global_costmap', 10)
        self.diag_pub = self.create_publisher(String, '/planner_diagnostics', 10)

        self.get_logger().info('Custom A* Path Planner Node initialized.')

    def map_callback(self, msg: OccupancyGrid):
        self.resolution = msg.info.resolution
        self.width = msg.info.width
        self.height = msg.info.height
        raw_data = np.array(msg.data, dtype=np.int8).reshape((self.height, self.width))
        self.map_grid = raw_data
        self.compute_global_costmap()

    def compute_global_costmap(self):
        if self.map_grid is None:
            return

        self.costmap = np.copy(self.map_grid).astype(np.float32)

        # Inflation radius in grid cells
        inf_cells = int(math.ceil(self.inflation_radius / self.resolution))
        rob_cells = int(math.ceil(self.robot_radius / self.resolution))

        occ_indices = np.argwhere(self.map_grid == 100)

        for ry, rx in occ_indices:
            y_min = max(0, ry - inf_cells)
            y_max = min(self.height, ry + inf_cells + 1)
            x_min = max(0, rx - inf_cells)
            x_max = min(self.width, rx + inf_cells + 1)

            for cy in range(y_min, y_max):
                for cx in range(x_min, x_max):
                    if self.map_grid[cy, cx] == 100:
                        continue
                    dist = math.hypot((cx - rx) * self.resolution, (cy - ry) * self.resolution)
                    if dist <= self.robot_radius:
                        self.costmap[cy, cx] = 100.0  # Footprint collision
                    elif dist <= self.inflation_radius:
                        # Exponential decay cost scaling
                        factor = math.exp(-self.cost_scaling_factor * (dist - self.robot_radius))
                        cost = 50.0 * factor
                        self.costmap[cy, cx] = max(self.costmap[cy, cx], cost)

        # Publish costmap
        cm_msg = OccupancyGrid()
        cm_msg.header.stamp = self.get_clock().now().to_msg()
        cm_msg.header.frame_id = 'map'
        cm_msg.info.resolution = self.resolution
        cm_msg.info.width = self.width
        cm_msg.info.height = self.height
        cm_msg.data = np.clip(self.costmap, -1, 100).astype(np.int8).flatten().tolist()
        self.costmap_pub.publish(cm_msg)

    def manhattan_heuristic(self, p1, p2):
        """h(n) = |x1-x2| + |y1-y2|"""
        return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1])

    def world_to_grid(self, wx, wy):
        gx = int(wx / self.resolution)
        gy = int(wy / self.resolution)
        if 0 <= gx < self.width and 0 <= gy < self.height:
            return gx, gy
        return None

    def grid_to_world(self, gx, gy):
        wx = (gx + 0.5) * self.resolution
        wy = (gy + 0.5) * self.resolution
        return wx, wy

    def goal_callback(self, msg: PoseStamped):
        self.goal_pose = (msg.pose.position.x, msg.pose.position.y)
        self.plan_path()

    def plan_path(self, start_pos=None, goal_pos=None):
        if start_pos is not None:
            self.start_pose = start_pos
        if goal_pos is not None:
            self.goal_pose = goal_pos

        if self.costmap is None:
            self.get_logger().warn("Costmap not available for planning.")
            return False, []

        start_grid = self.world_to_grid(*self.start_pose)
        goal_grid = self.world_to_grid(*self.goal_pose)

        if not start_grid or not goal_grid:
            self.get_logger().error("Start or Goal outside map boundaries.")
            return False, []

        if self.costmap[goal_grid[1], goal_grid[0]] >= 90:
            self.get_logger().error("Goal pose is inside an obstacle cell! GOAL INVALID.")
            self.publish_diagnostics("GOAL INVALID", 0, 0.0, 0.0, 0, 0, [])
            return False, []

        t0 = time.time()

        # Priority queue OPEN list: (f_score, h_score, g_score, (gx, gy))
        open_list = []
        h_start = self.manhattan_heuristic(start_grid, goal_grid)
        heapq.heappush(open_list, (h_start, h_start, 0.0, start_grid))

        g_score = {start_grid: 0.0}
        f_score = {start_grid: h_start}
        came_from = {}
        closed_set = set()

        nodes_expanded = 0
        # 4-way discrete movement: UP, DOWN, LEFT, RIGHT
        neighbors = [(0, 1), (0, -1), (-1, 0), (1, 0)]

        path_found = False

        while open_list:
            _, curr_h, curr_g, current = heapq.heappop(open_list)

            if current in closed_set:
                continue

            closed_set.add(current)
            nodes_expanded += 1

            if current == goal_grid:
                path_found = True
                break

            for dx, dy in neighbors:
                nx, ny = current[0] + dx, current[1] + dy

                if not (0 <= nx < self.width and 0 <= ny < self.height):
                    continue

                cell_cost = self.costmap[ny, nx]
                if cell_cost >= 90 or cell_cost == -1:  # Occupied cell or unknown
                    continue

                traversal_cost = 1.0 + (cell_cost / 10.0)
                tentative_g = curr_g + traversal_cost

                neighbor = (nx, ny)
                if neighbor in closed_set:
                    continue

                if tentative_g < g_score.get(neighbor, float('inf')):
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    h_val = self.manhattan_heuristic(neighbor, goal_grid)
                    f_val = tentative_g + h_val
                    f_score[neighbor] = f_val
                    heapq.heappush(open_list, (f_val, h_val, tentative_g, neighbor))

        planning_time_ms = (time.time() - t0) * 1000.0

        if not path_found:
            self.get_logger().error("A* Search failed to find a valid path.")
            self.publish_diagnostics("NO PATH FOUND", nodes_expanded, planning_time_ms, 0.0, 0.0, len(open_list), [])
            return False, []

        # Reconstruct path from Goal to Start
        curr = goal_grid
        grid_path = [curr]
        while curr in came_from:
            curr = came_from[curr]
            grid_path.append(curr)
        grid_path.reverse()

        # Convert grid path to world coordinates
        world_path = [self.grid_to_world(gx, gy) for gx, gy in grid_path]
        path_length_m = sum(math.hypot(world_path[i+1][0] - world_path[i][0], world_path[i+1][1] - world_path[i][1])
                             for i in range(len(world_path) - 1))
        path_cost = g_score[goal_grid]

        # Publish Path message
        path_msg = Path()
        path_msg.header.stamp = self.get_clock().now().to_msg()
        path_msg.header.frame_id = 'map'

        for wx, wy in world_path:
            pose = PoseStamped()
            pose.header.frame_id = 'map'
            pose.pose.position.x = float(wx)
            pose.pose.position.y = float(wy)
            pose.pose.orientation.w = 1.0
            path_msg.poses.append(pose)

        self.path_pub.publish(path_msg)

        self.publish_diagnostics("SUCCESS", nodes_expanded, planning_time_ms, path_length_m, path_cost, len(open_list), world_path)
        return True, world_path

    def publish_diagnostics(self, status, expanded, time_ms, length, cost, open_cnt, waypoints):
        diag_data = {
            "algorithm": "Custom A*",
            "heuristic": "Manhattan Distance |x1-x2|+|y1-y2|",
            "resolution": self.resolution,
            "status": status,
            "nodes_expanded": expanded,
            "planning_time_ms": round(time_ms, 2),
            "path_length_m": round(length, 2),
            "path_cost": round(cost, 2),
            "waypoints_count": len(waypoints),
            "open_nodes": open_cnt,
            "start": self.start_pose,
            "goal": self.goal_pose
        }
        msg = String()
        msg.data = json.dumps(diag_data)
        self.diag_pub.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = CustomAStarPlannerNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
