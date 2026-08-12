import type { JointState, TrajectoryPoint, TrajectoryStats, Obstacle } from '../types/robotics';
import { KinematicsEngine, DEFAULT_JOINT_LIMITS } from './kinematics';
import { CollisionEngine } from './collision';

export class TrajectoryEngine {
  /**
   * Generates a 5th-order (Quintic) polynomial joint trajectory.
   * Preserved exactly from original implementation.
   */
  static generateQuinticTrajectory(
    startJoints: JointState,
    targetJoints: JointState,
    duration: number = 3.0,
    sampleRate: number = 20
  ): TrajectoryPoint[] {
    const totalSamples = Math.max(10, Math.floor(duration * sampleRate));
    const dt = duration / totalSamples;
    const points: TrajectoryPoint[] = [];

    const keys: (keyof JointState)[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

    // Quintic polynomial coefficients for each joint: a0, a1, a2, a3, a4, a5
    const coeffs: Record<keyof JointState, number[]> = {
      q1: [], q2: [], q3: [], q4: [], q5: [], q6: []
    };

    keys.forEach((key) => {
      const q0 = startJoints[key];
      const qf = targetJoints[key];
      const T = duration;
      const D = qf - q0;

      const a0 = q0;
      const a1 = 0;
      const a2 = 0;
      const a3 = (10 * D) / (T * T * T);
      const a4 = (-15 * D) / (T * T * T * T);
      const a5 = (6 * D) / (T * T * T * T * T);

      coeffs[key] = [a0, a1, a2, a3, a4, a5];
    });

    for (let step = 0; step <= totalSamples; step++) {
      const t = Math.min(duration, step * dt);
      const t2 = t * t;
      const t3 = t2 * t;
      const t4 = t3 * t;
      const t5 = t4 * t;

      const curJoints: JointState = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0 };
      const vel: number[] = [];
      const acc: number[] = [];

      keys.forEach((key) => {
        const [a0, a1, a2, a3, a4, a5] = coeffs[key];

        // Position
        const posVal = a0 + a1 * t + a2 * t2 + a3 * t3 + a4 * t4 + a5 * t5;
        curJoints[key] = Number(posVal.toFixed(2));

        // Velocity (deg/s)
        const velVal = a1 + 2 * a2 * t + 3 * a3 * t2 + 4 * a4 * t3 + 5 * a5 * t4;
        vel.push(Number(velVal.toFixed(3)));

        // Acceleration (deg/s^2)
        const accVal = 2 * a2 + 6 * a3 * t + 12 * a4 * t2 + 20 * a5 * t3;
        acc.push(Number(accVal.toFixed(3)));
      });

      const fk = KinematicsEngine.forwardKinematics(curJoints);

      points.push({
        time: Number(t.toFixed(3)),
        joints: curJoints,
        pose: fk.eePose,
        velocity: vel,
        acceleration: acc
      });
    }

    return points;
  }

  /**
   * Validate every trajectory point against obstacles and joint limits.
   * Returns annotated points with collision status, plus overall validity.
   */
  static validateTrajectory(
    trajectory: TrajectoryPoint[],
    obstacles: Obstacle[] = []
  ): {
    safe: boolean;
    annotated: TrajectoryPoint[];
    collisionSegments: number;
    firstCollisionTime: number | null;
    message: string;
  } {
    const keys: (keyof JointState)[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
    let collisionSegments = 0;
    let firstCollisionTime: number | null = null;
    const annotated: TrajectoryPoint[] = [];

    for (const pt of trajectory) {
      // Check joint limits
      const jointLimitViolation = keys.some(k => {
        const lim = DEFAULT_JOINT_LIMITS[k];
        return pt.joints[k] < lim.min || pt.joints[k] > lim.max;
      });

      // Check obstacle collision
      let collisionStatus: 'CLEAR' | 'WARNING' | 'COLLISION' = 'CLEAR';
      if (obstacles.length > 0 || jointLimitViolation) {
        const colResult = CollisionEngine.checkCollision(pt.joints, obstacles);
        collisionStatus = jointLimitViolation ? 'COLLISION' : colResult.status;
      }

      if (collisionStatus === 'COLLISION') {
        collisionSegments++;
        if (firstCollisionTime === null) firstCollisionTime = pt.time;
      }

      annotated.push({ ...pt, collisionStatus });
    }

    const safe = collisionSegments === 0;
    const message = safe
      ? `Trajectory validated: ${trajectory.length} points, all collision-free`
      : `UNSAFE: ${collisionSegments} collision point(s) detected. First at t=${firstCollisionTime?.toFixed(2)}s`;

    return { safe, annotated, collisionSegments, firstCollisionTime, message };
  }

  /**
   * Compute path statistics from a trajectory.
   */
  static computePathStats(
    trajectory: TrajectoryPoint[],
    planningTimeMs: number = 0,
    collisionSegments: number = 0
  ): TrajectoryStats {
    if (trajectory.length < 2) {
      return {
        pathLength: 0, duration: 0, maxVelocity: 0, maxAcceleration: 0,
        totalPoints: trajectory.length, planningTimeMs, collisionFree: true, collisionSegments: 0
      };
    }

    // Cartesian path length
    let pathLength = 0;
    for (let i = 1; i < trajectory.length; i++) {
      const a = trajectory[i - 1].pose;
      const b = trajectory[i].pose;
      pathLength += Math.sqrt(
        (b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2
      );
    }

    const duration = trajectory[trajectory.length - 1].time;

    // Max velocity and acceleration across all joints
    let maxVelocity = 0;
    let maxAcceleration = 0;
    for (const pt of trajectory) {
      for (const v of pt.velocity) {
        if (Math.abs(v) > maxVelocity) maxVelocity = Math.abs(v);
      }
      for (const a of pt.acceleration) {
        if (Math.abs(a) > maxAcceleration) maxAcceleration = Math.abs(a);
      }
    }

    return {
      pathLength: Number(pathLength.toFixed(4)),
      duration: Number(duration.toFixed(3)),
      maxVelocity: Number(maxVelocity.toFixed(2)),
      maxAcceleration: Number(maxAcceleration.toFixed(2)),
      totalPoints: trajectory.length,
      planningTimeMs: Number(planningTimeMs.toFixed(1)),
      collisionFree: collisionSegments === 0,
      collisionSegments
    };
  }

  /**
   * Build a FollowJointTrajectory-compatible JSON structure for ROS 2.
   */
  static toFollowJointTrajectoryJSON(
    trajectory: TrajectoryPoint[],
    jointNames: string[] = ['joint1', 'joint2', 'joint3', 'joint4', 'joint5', 'joint6']
  ): object {
    return {
      header: {
        stamp: { sec: Math.floor(Date.now() / 1000), nanosec: (Date.now() % 1000) * 1e6 },
        frame_id: 'base_link'
      },
      joint_names: jointNames,
      points: trajectory.map(pt => ({
        positions: [pt.joints.q1, pt.joints.q2, pt.joints.q3, pt.joints.q4, pt.joints.q5, pt.joints.q6]
          .map(d => Number((d * Math.PI / 180).toFixed(6))), // convert to radians
        velocities: pt.velocity.map(v => Number((v * Math.PI / 180).toFixed(6))),
        accelerations: pt.acceleration.map(a => Number((a * Math.PI / 180).toFixed(6))),
        time_from_start: {
          sec: Math.floor(pt.time),
          nanosec: Math.round((pt.time % 1) * 1e9)
        }
      }))
    };
  }
}
