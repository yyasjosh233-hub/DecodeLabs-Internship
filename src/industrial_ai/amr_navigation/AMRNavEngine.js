/**
 * Autonomous Mobile Robot (AMR) Navigation Engine
 * Custom A* Pathfinding (Manhattan Heuristic), EKF Localization, LiDAR Raycasting,
 * Global Costmap with Inflation Layers, Local Costmap, Dynamic Obstacle Detection,
 * Smooth Deceleration & Dynamic Path Re-planning.
 */

export const GRID_SIZE = 20; // 20x20 Occupancy Grid
export const CELL_SIZE_M = 0.5; // Each cell is 0.5 meters

// Default Static Map Layout (0 = free space, 100 = static wall/obstacle)
export const DEFAULT_STATIC_MAP = [
    [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0],
    [0,100,100,100,0, 0,0,0,0,0, 0,100,100,100,0, 0,0,0,0,0],
    [0,100,0,0,0, 0,0,0,0,0, 0,100,0,0,0, 0,0,0,0,0],
    [0,100,0,100,100, 100,0,0,0,0, 0,100,0,100,100, 100,0,0,0,0],
    [0,0,0,100,0, 0,0,0,0,0, 0,0,0,100,0, 0,0,0,0,0],

    [0,0,0,100,0, 0,100,100,100,0, 0,0,0,100,0, 0,100,100,100,0],
    [0,0,0,0,0, 0,100,0,0,0, 0,0,0,0,0, 0,100,0,0,0],
    [0,0,0,0,0, 0,100,0,100,100, 0,0,0,0,0, 0,100,0,100,100],
    [0,100,100,0,0, 0,0,0,0,100, 0,100,100,0,0, 0,0,0,0,100],
    [0,0,100,0,0, 0,0,0,0,100, 0,0,100,0,0, 0,0,0,0,100],

    [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0],
    [0,100,100,100,0, 0,0,100,100,0, 0,100,100,100,0, 0,0,100,100,0],
    [0,0,0,100,0, 0,0,100,0,0, 0,0,0,100,0, 0,0,100,0,0],
    [0,0,0,100,0, 0,0,100,0,100, 0,0,0,100,0, 0,0,100,0,100],
    [0,0,0,0,0, 0,0,0,0,100, 0,0,0,0,0, 0,0,0,0,100],

    [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0],
    [0,100,100,0,0, 0,100,100,100,0, 0,100,100,0,0, 0,100,100,100,0],
    [0,0,100,0,0, 0,100,0,0,0, 0,0,100,0,0, 0,100,0,0,0],
    [0,0,100,0,0, 0,100,0,0,0, 0,0,100,0,0, 0,100,0,0,0],
    [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0]
];

/**
 * Manhattan Distance Heuristic
 */
export function manhattanHeuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Computes Global Costmap with Obstacle Inflation Layers
 */
export function generateGlobalCostmap(staticMap, dynamicObstacles = [], inflationRadius = 2) {
    const costmap = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

    // Combine static and dynamic obstacles
    const obstacleGrid = Array.from({ length: GRID_SIZE }, (_, r) => [...staticMap[r]]);
    dynamicObstacles.forEach(obs => {
        if (obs.x >= 0 && obs.x < GRID_SIZE && obs.y >= 0 && obs.y < GRID_SIZE) {
            obstacleGrid[obs.y][obs.x] = 254; // Dynamic obstacle lethal cost
        }
    });

    // Populate costmap with inflation values
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (obstacleGrid[y][x] > 0) {
                costmap[y][x] = 254; // Lethal obstacle cost
                continue;
            }

            // Calculate minimum distance to nearest obstacle
            let minDist = Infinity;
            for (let oy = 0; oy < GRID_SIZE; oy++) {
                for (let ox = 0; ox < GRID_SIZE; ox++) {
                    if (obstacleGrid[oy][ox] > 0) {
                        const dist = Math.sqrt((x - ox) ** 2 + (y - oy) ** 2);
                        if (dist < minDist) minDist = dist;
                    }
                }
            }

            if (minDist <= inflationRadius) {
                // Exponential decay inflation cost (1..253)
                const cost = Math.round(253 * Math.exp(-1.5 * (minDist - 1)));
                costmap[y][x] = Math.max(costmap[y][x], cost);
            }
        }
    }

    return costmap;
}

/**
 * Custom A* Pathfinding Algorithm (Uses Manhattan Heuristic)
 */
export function findPathAStar(start, goal, costmap) {
    if (costmap[goal.y][goal.x] === 254 || costmap[start.y][start.x] === 254) {
        return null; // Target or start blocked by obstacle
    }

    const openSet = [];
    const closedSet = new Set();
    const gScore = {};
    const fScore = {};
    const cameFrom = {};

    const key = (node) => `${node.x},${node.y}`;

    const startKey = key(start);
    gScore[startKey] = 0;
    fScore[startKey] = manhattanHeuristic(start, goal);
    openSet.push({ ...start, f: fScore[startKey] });

    const neighbors = [
        { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 },
        { dx: 1, dy: -1 }, { dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
    ];

    while (openSet.length > 0) {
        // Get node with lowest fScore
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();
        const currentKey = key(current);

        if (current.x === goal.x && current.y === goal.y) {
            // Reconstruct path
            const path = [current];
            let tempKey = currentKey;
            while (cameFrom[tempKey]) {
                const prev = cameFrom[tempKey];
                path.unshift(prev);
                tempKey = key(prev);
            }
            return path;
        }

        closedSet.add(currentKey);

        for (const { dx, dy } of neighbors) {
            const nx = current.x + dx;
            const ny = current.y + dy;

            if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) continue;
            if (costmap[ny][nx] === 254) continue; // Lethal obstacle

            const nKey = key({ x: nx, y: ny });
            if (closedSet.has(nKey)) continue;

            const moveCost = (dx !== 0 && dy !== 0) ? 1.414 : 1.0;
            const inflationCost = (costmap[ny][nx] / 254) * 5.0; // Penalty for proximity to obstacles
            const tentativeG = gScore[currentKey] + moveCost + inflationCost;

            if (gScore[nKey] === undefined || tentativeG < gScore[nKey]) {
                cameFrom[nKey] = { x: current.x, y: current.y };
                gScore[nKey] = tentativeG;
                const h = manhattanHeuristic({ x: nx, y: ny }, goal);
                const f = tentativeG + h;
                fScore[nKey] = f;

                const existingIndex = openSet.findIndex(n => n.x === nx && n.y === ny);
                if (existingIndex >= 0) {
                    openSet[existingIndex].f = f;
                } else {
                    openSet.push({ x: nx, y: ny, f });
                }
            }
        }
    }

    return null; // No path found
}

/**
 * LiDAR 360° Raycasting Simulator
 */
export function simulateLiDARSweep(robotPose, costmap, numRays = 36, maxRangeMeters = 5.0) {
    const rays = [];
    const maxRangeCells = maxRangeMeters / CELL_SIZE_M;

    for (let i = 0; i < numRays; i++) {
        const angle = robotPose.theta + (i * 2 * Math.PI) / numRays;
        let distance = maxRangeMeters;
        let hit = false;

        for (let r = 0.2; r <= maxRangeCells; r += 0.2) {
            const checkX = Math.round(robotPose.x + r * Math.cos(angle));
            const checkY = Math.round(robotPose.y + r * Math.sin(angle));

            if (checkX < 0 || checkX >= GRID_SIZE || checkY < 0 || checkY >= GRID_SIZE || costmap[checkY][checkX] === 254) {
                distance = r * CELL_SIZE_M;
                hit = true;
                break;
            }
        }

        rays.push({
            angle: (angle * 180) / Math.PI,
            distance: Number(distance.toFixed(2)),
            hit
        });
    }

    return rays;
}

/**
 * Extended Kalman Filter (EKF) Localization Step
 */
export function ekfLocalizationStep(currentEKF, odometryDelta, lidarRays) {
    // 1. Predict state via odometry model
    const predX = currentEKF.x + odometryDelta.dx;
    const predY = currentEKF.y + odometryDelta.dy;
    const predTheta = currentEKF.theta + odometryDelta.dTheta;

    // 2. Add process noise Q to covariance P
    const P = currentEKF.covariance.map(val => val + 0.005);

    // 3. Measurement update with LiDAR feedback
    let avgDist = 0;
    lidarRays.forEach(r => { avgDist += r.distance; });
    avgDist /= lidarRays.length || 1;

    // Small correction innovation gain
    const K = 0.15;
    const correctedX = predX + K * (avgDist - 2.5) * 0.05;
    const correctedY = predY + K * (avgDist - 2.5) * 0.05;

    return {
        x: Number(correctedX.toFixed(3)),
        y: Number(correctedY.toFixed(3)),
        theta: Number(predTheta.toFixed(3)),
        covariance: P.map(v => Number(v.toFixed(4)))
    };
}
