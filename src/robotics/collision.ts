import type { JointState, Obstacle, CollisionInfo, CollisionState } from '../types/robotics';
import { KinematicsEngine } from './kinematics';

export const INITIAL_OBSTACLES: Obstacle[] = [
  {
    id: 'obs-1',
    name: 'Safety Barrier Sphere',
    type: 'sphere',
    position: [0.35, -0.25, 0.3],
    size: 0.15 // 15cm radius sphere
  },
  {
    id: 'obs-2',
    name: 'Assembly Fixture',
    type: 'box',
    position: [-0.3, 0.4, 0.25],
    size: [0.2, 0.2, 0.3] // [w, h, d]
  }
];

/**
 * Point-to-segment distance helper
 */
function pointToSegmentDist(
  px: number, py: number, pz: number,
  ax: number, ay: number, az: number,
  bx: number, by: number, bz: number
): number {
  const abx = bx - ax, aby = by - ay, abz = bz - az;
  const apx = px - ax, apy = py - ay, apz = pz - az;
  const ab2 = abx * abx + aby * aby + abz * abz;
  if (ab2 < 1e-10) {
    return Math.sqrt(apx * apx + apy * apy + apz * apz);
  }
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby + apz * abz) / ab2));
  const dx = px - (ax + t * abx);
  const dy = py - (ay + t * aby);
  const dz = pz - (az + t * abz);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export class CollisionEngine {
  /**
   * Calculates minimum distance between robot link segments and obstacles.
   * Preserved from original, extended with cylinder support and enhanced info.
   */
  static checkCollision(joints: JointState, obstacles: Obstacle[] = INITIAL_OBSTACLES): CollisionInfo {
    const { jointPositions } = KinematicsEngine.forwardKinematics(joints);
    let minDistance = 999.0;
    let closestObs: string | null = null;
    let collisionLocation: [number, number, number] | null = null;
    const collidingObjects: string[] = [];

    for (const obs of obstacles) {
      const [ox, oy, oz] = obs.position;
      let obsRadius = 0;

      if (obs.type === 'sphere') {
        obsRadius = obs.size as number;
      } else if (obs.type === 'box') {
        obsRadius = (obs.size as [number, number, number])[0] / 2;
      } else if (obs.type === 'cylinder') {
        obsRadius = (obs.size as [number, number, number])[0]; // radius
      }

      // Check each link segment (joint i-1 to joint i)
      for (let i = 0; i < jointPositions.length - 1; i++) {
        const [ax, ay, az] = jointPositions[i];
        const [bx, by, bz] = jointPositions[i + 1];

        const segDist = pointToSegmentDist(ox, oy, oz, ax, ay, az, bx, by, bz);
        const linkDist = segDist - obsRadius;

        if (linkDist < minDistance) {
          minDistance = linkDist;
          closestObs = obs.name;
          // Approximate collision location at midpoint of segment
          collisionLocation = [(ax + bx) / 2, (ay + by) / 2, (az + bz) / 2];
        }

        if (linkDist < 0.05 && !collidingObjects.includes(obs.name)) {
          collidingObjects.push(obs.name);
        }
      }
    }

    const minClearance = Number(Math.max(0, minDistance).toFixed(3));
    let status: CollisionState = 'CLEAR';

    if (minClearance < 0.05) {
      status = 'COLLISION';
    } else if (minClearance < 0.20) {
      status = 'WARNING';
    }

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (minClearance < 0.02) riskLevel = 'CRITICAL';
    else if (minClearance < 0.05) riskLevel = 'HIGH';
    else if (minClearance < 0.15) riskLevel = 'MEDIUM';

    return {
      status,
      minClearance,
      closestObstacle: closestObs,
      collidingObjects,
      collisionLocation: collisionLocation,
      riskLevel,
      selfCollision: false
    };
  }

  /**
   * Check self-collision between non-adjacent link segments.
   * Links i and i+1 are adjacent and always close — skip those.
   */
  static checkSelfCollision(joints: JointState): {
    detected: boolean;
    minClearance: number;
    collidingLinks: string[];
  } {
    const { jointPositions } = KinematicsEngine.forwardKinematics(joints);
    const LINK_RADIUS = 0.06; // approximate link radius (6cm)
    const linkNames = ['base→j1', 'j1→j2', 'j2→j3', 'j3→j4', 'j4→j5', 'j5→EE'];

    let minClearance = 999;
    const collidingLinks: string[] = [];

    // Check all non-adjacent link pairs (separated by at least 2 intermediate joints/links)
    for (let i = 0; i < jointPositions.length - 1; i++) {
      for (let j = i + 3; j < jointPositions.length - 1; j++) {
        // Segment i: jointPositions[i] -> jointPositions[i+1]
        // Segment j: jointPositions[j] -> jointPositions[j+1]
        const [ax, ay, az] = jointPositions[i];
        const [bx, by, bz] = jointPositions[i + 1];
        const [cx, cy, cz] = jointPositions[j];
        const [dx, dy, dz] = jointPositions[j + 1];

        // Find min distance between two segments (approximate: check endpoints)
        const dists = [
          pointToSegmentDist(ax, ay, az, cx, cy, cz, dx, dy, dz),
          pointToSegmentDist(bx, by, bz, cx, cy, cz, dx, dy, dz),
          pointToSegmentDist(cx, cy, cz, ax, ay, az, bx, by, bz),
          pointToSegmentDist(dx, dy, dz, ax, ay, az, bx, by, bz)
        ];
        const segDist = Math.min(...dists);
        const clearance = segDist - 2 * LINK_RADIUS;

        if (clearance < minClearance) {
          minClearance = clearance;
        }

        if (clearance < 0.02) {
          const name = `${linkNames[i] ?? `link${i}`} ↔ ${linkNames[j] ?? `link${j}`}`;
          if (!collidingLinks.includes(name)) {
            collidingLinks.push(name);
          }
        }
      }
    }

    return {
      detected: collidingLinks.length > 0,
      minClearance: Number(Math.max(0, minClearance).toFixed(3)),
      collidingLinks
    };
  }
}
