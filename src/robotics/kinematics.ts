import type { JointState, JointLimits, EEPose, DHParameter, IKSolution, IKDiagnostics, WorkspaceCheckResult } from '../types/robotics';

export const DEFAULT_JOINT_LIMITS: Record<keyof JointState, JointLimits> = {
  q1: { min: -180, max: 180 },
  q2: { min: -135, max: 135 },
  q3: { min: -150, max: 150 },
  q4: { min: -180, max: 180 },
  q5: { min: -120, max: 120 },
  q6: { min: -360, max: 360 }
};

export const INITIAL_JOINT_STATE: JointState = {
  q1: 0,
  q2: -45,
  q3: 60,
  q4: 0,
  q5: 30,
  q6: 0
};

// Standard 6-DOF Industrial Manipulator DH Table
export const DH_TABLE: DHParameter[] = [
  { joint: 1, name: 'Shoulder Pan',  theta: 0, d: 0.40, a: 0.00, alpha: 90 },
  { joint: 2, name: 'Shoulder Lift', theta: 0, d: 0.00, a: 0.45, alpha: 0 },
  { joint: 3, name: 'Elbow',         theta: 0, d: 0.00, a: 0.40, alpha: 0 },
  { joint: 4, name: 'Wrist Roll',    theta: 0, d: 0.35, a: 0.00, alpha: -90 },
  { joint: 5, name: 'Wrist Pitch',   theta: 0, d: 0.00, a: 0.00, alpha: 90 },
  { joint: 6, name: 'Wrist Yaw',     theta: 0, d: 0.10, a: 0.00, alpha: 0 }
];

// Workspace limits (meters)
export const WORKSPACE_LIMITS = {
  maxReach: 1.35,
  minReach: 0.10,
  xMin: -1.35, xMax: 1.35,
  yMin: -1.35, yMax: 1.35,
  zMin:  0.00, zMax: 1.70
};

export class KinematicsEngine {
  /** Helper: Degree to Radian */
  static degToRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  /** Helper: Radian to Degree */
  static radToDeg(rad: number): number {
    return (rad * 180) / Math.PI;
  }

  /**
   * Compute single DH Homogeneous Transformation Matrix (4x4)
   */
  static getDHMatrix(thetaDeg: number, d: number, a: number, alphaDeg: number): number[][] {
    const th = this.degToRad(thetaDeg);
    const al = this.degToRad(alphaDeg);
    const cosTh = Math.cos(th);
    const sinTh = Math.sin(th);
    const cosAl = Math.cos(al);
    const sinAl = Math.sin(al);

    return [
      [cosTh, -sinTh * cosAl,  sinTh * sinAl, a * cosTh],
      [sinTh,  cosTh * cosAl, -cosTh * sinAl, a * sinTh],
      [0,      sinAl,          cosAl,          d        ],
      [0,      0,              0,              1        ]
    ];
  }

  /** Multiply 4x4 matrices A and B */
  static multiply4x4(A: number[][], B: number[][]): number[][] {
    const C: number[][] = Array(4).fill(0).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += A[i][k] * B[k][j];
        }
        C[i][j] = sum;
      }
    }
    return C;
  }

  /**
   * Forward Kinematics: Calculates all intermediate transformations T0_1..T0_6 and EE Pose
   */
  static forwardKinematics(joints: JointState): {
    eePose: EEPose;
    T_all: number[][][]; // T0_1, T0_2, ..., T0_6
    jointPositions: [number, number, number][];
  } {
    const q = [joints.q1, joints.q2, joints.q3, joints.q4, joints.q5, joints.q6];
    let T_curr = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];

    const T_all: number[][][] = [];
    const jointPositions: [number, number, number][] = [[0, 0, 0]];

    for (let i = 0; i < 6; i++) {
      const dh = DH_TABLE[i];
      const A_i = this.getDHMatrix(dh.theta + q[i], dh.d, dh.a, dh.alpha);
      T_curr = this.multiply4x4(T_curr, A_i);
      T_all.push(T_curr);
      jointPositions.push([T_curr[0][3], T_curr[1][3], T_curr[2][3]]);
    }

    const T6 = T_curr;
    const x = T6[0][3];
    const y = T6[1][3];
    const z = T6[2][3];

    // Extract Euler Angles Z-Y-X (Yaw-Pitch-Roll) from T6 rotation submatrix
    const r11 = T6[0][0], r21 = T6[1][0], r31 = T6[2][0];
    const r32 = T6[2][1], r33 = T6[2][2];

    const pitch = Math.atan2(-r31, Math.sqrt(r11 * r11 + r21 * r21));
    const roll  = Math.atan2(r32, r33);
    const yaw   = Math.atan2(r21, r11);

    const eePose: EEPose = {
      x:     Number(x.toFixed(3)),
      y:     Number(y.toFixed(3)),
      z:     Number(z.toFixed(3)),
      roll:  Number(this.radToDeg(roll).toFixed(1)),
      pitch: Number(this.radToDeg(pitch).toFixed(1)),
      yaw:   Number(this.radToDeg(yaw).toFixed(1))
    };

    return { eePose, T_all, jointPositions };
  }

  /**
   * Compute 6x6 Geometric Jacobian Matrix J(q)
   */
  static calculateJacobian(joints: JointState): {
    J: number[][];
    manipulability: number;
    detJ: number;
    conditionNumber: number;
    status: 'Safe' | 'Warning' | 'Singular';
  } {
    const { T_all, eePose } = this.forwardKinematics(joints);
    const pe = [eePose.x, eePose.y, eePose.z];

    const J: number[][] = Array(6).fill(0).map(() => Array(6).fill(0));

    for (let i = 0; i < 6; i++) {
      const T_prev = i === 0 ? [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ] : T_all[i - 1];

      const z_prev = [T_prev[0][2], T_prev[1][2], T_prev[2][2]];
      const p_prev = [T_prev[0][3], T_prev[1][3], T_prev[2][3]];

      const diff = [pe[0] - p_prev[0], pe[1] - p_prev[1], pe[2] - p_prev[2]];

      // Cross product z_prev x diff
      const v = [
        z_prev[1] * diff[2] - z_prev[2] * diff[1],
        z_prev[2] * diff[0] - z_prev[0] * diff[2],
        z_prev[0] * diff[1] - z_prev[1] * diff[0]
      ];

      J[0][i] = v[0];
      J[1][i] = v[1];
      J[2][i] = v[2];
      J[3][i] = z_prev[0];
      J[4][i] = z_prev[1];
      J[5][i] = z_prev[2];
    }

    // Approximate det via 3x3 position submatrix
    const detPos = Math.abs(
      J[0][0] * (J[1][1] * J[2][2] - J[1][2] * J[2][1]) -
      J[0][1] * (J[1][0] * J[2][2] - J[1][2] * J[2][0]) +
      J[0][2] * (J[1][0] * J[2][1] - J[1][1] * J[2][0])
    );

    const manipulability = Number((detPos * 1.85 + 0.05).toFixed(3));
    const detJ = Number(detPos.toFixed(3));

    // Approximate condition number: ratio of column norms (max/min)
    const colNorms = Array(6).fill(0).map((_, c) => {
      let norm = 0;
      for (let r = 0; r < 6; r++) norm += J[r][c] * J[r][c];
      return Math.sqrt(norm);
    });
    const maxNorm = Math.max(...colNorms);
    const minNorm = Math.min(...colNorms.filter(n => n > 1e-10));
    const conditionNumber = Number((minNorm > 0 ? maxNorm / minNorm : 9999).toFixed(2));

    let status: 'Safe' | 'Warning' | 'Singular' = 'Safe';
    if (detJ < 0.02) {
      status = 'Singular';
    } else if (detJ < 0.08) {
      status = 'Warning';
    }

    return { J, manipulability, detJ, conditionNumber, status };
  }

  /**
   * Build homogeneous transformation matrix from EEPose (SE3)
   */
  static getSE3Matrix(pose: EEPose): number[][] {
    const r = this.degToRad(pose.roll);
    const p = this.degToRad(pose.pitch);
    const y = this.degToRad(pose.yaw);
    // ZYX rotation: Rz * Ry * Rx
    const cr = Math.cos(r), sr = Math.sin(r);
    const cp = Math.cos(p), sp = Math.sin(p);
    const cy = Math.cos(y), sy = Math.sin(y);
    return [
      [cy*cp, cy*sp*sr - sy*cr, cy*sp*cr + sy*sr, pose.x],
      [sy*cp, sy*sp*sr + cy*cr, sy*sp*cr - cy*sr, pose.y],
      [-sp,   cp*sr,            cp*cr,            pose.z],
      [0,     0,                0,                1      ]
    ];
  }

  /**
   * Validate target pose against workspace limits
   */
  static validateWorkspace(target: EEPose): WorkspaceCheckResult {
    const dist = Math.sqrt(target.x * target.x + target.y * target.y + target.z * target.z);
    const lim = WORKSPACE_LIMITS;

    const xOk = target.x >= lim.xMin && target.x <= lim.xMax;
    const yOk = target.y >= lim.yMin && target.y <= lim.yMax;
    const zOk = target.z >= lim.zMin && target.z <= lim.zMax;
    const reachOk = dist <= lim.maxReach && dist >= lim.minReach;

    const reachable = xOk && yOk && zOk && reachOk;

    let message = 'Target is reachable';
    if (!reachOk && dist > lim.maxReach) message = `Target exceeds max reach (${dist.toFixed(3)}m > ${lim.maxReach}m)`;
    else if (!reachOk && dist < lim.minReach) message = `Target too close to base (${dist.toFixed(3)}m < ${lim.minReach}m)`;
    else if (!zOk) message = `Z position out of range [${lim.zMin}, ${lim.zMax}]m`;
    else if (!xOk) message = `X position out of range [${lim.xMin}, ${lim.xMax}]m`;
    else if (!yOk) message = `Y position out of range [${lim.yMin}, ${lim.yMax}]m`;

    return {
      status: reachable ? 'REACHABLE' : 'OUT_OF_WORKSPACE',
      maxReach: lim.maxReach,
      minReach: lim.minReach,
      distance: Number(dist.toFixed(3)),
      xLimitOk: xOk,
      yLimitOk: yOk,
      zLimitOk: zOk,
      message
    };
  }

  /**
   * Numerical Inverse Kinematics via Damped Least Squares (DLS)
   * Preserved exactly from original implementation.
   */
  static inverseKinematics(targetPose: EEPose, initialJoints: JointState): {
    success: boolean;
    solution: JointState;
    errorDistance: number;
    iterations: number;
  } {
    let q: JointState = { ...initialJoints };
    const maxIter = 100;
    const tol = 0.005; // 5mm tolerance
    const lambda = 0.1; // Damping factor

    let iterations = 0;
    let errDist = 999;

    for (let iter = 0; iter < maxIter; iter++) {
      iterations = iter + 1;
      const currentFK = this.forwardKinematics(q);
      const curPose = currentFK.eePose;

      const dx = targetPose.x - curPose.x;
      const dy = targetPose.y - curPose.y;
      const dz = targetPose.z - curPose.z;
      const dRoll  = this.degToRad(targetPose.roll  - curPose.roll);
      const dPitch = this.degToRad(targetPose.pitch - curPose.pitch);
      const dYaw   = this.degToRad(targetPose.yaw   - curPose.yaw);

      errDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (errDist < tol) {
        return { success: true, solution: q, errorDistance: Number(errDist.toFixed(4)), iterations };
      }

      const e = [dx, dy, dz, dRoll * 0.1, dPitch * 0.1, dYaw * 0.1];
      const { J } = this.calculateJacobian(q);

      const step = Array(6).fill(0);
      for (let i = 0; i < 6; i++) {
        let delta = 0;
        for (let j = 0; j < 6; j++) {
          delta += J[j][i] * e[j];
        }
        step[i] = (delta * 0.8) / (1.0 + lambda * lambda);
      }

      const keys: (keyof JointState)[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
      keys.forEach((key, idx) => {
        let val = q[key] + this.radToDeg(step[idx]);
        const lim = DEFAULT_JOINT_LIMITS[key];
        val = Math.max(lim.min, Math.min(lim.max, val));
        q[key] = val;
      });
    }

    // Final clean precision for solution
    const finalSolution: JointState = {
      q1: Number(q.q1.toFixed(2)),
      q2: Number(q.q2.toFixed(2)),
      q3: Number(q.q3.toFixed(2)),
      q4: Number(q.q4.toFixed(2)),
      q5: Number(q.q5.toFixed(2)),
      q6: Number(q.q6.toFixed(2)),
    };

    return {
      success: errDist < 0.05,
      solution: finalSolution,
      errorDistance: Number(errDist.toFixed(4)),
      iterations
    };
  }

  /**
   * Generate multiple IK solutions by seeding different initial configurations.
   * Returns up to 8 diverse solutions.
   */
  static solveMultipleIK(
    targetPose: EEPose,
    currentJoints: JointState
  ): {
    solutions: IKSolution[];
    diagnostics: IKDiagnostics;
  } {
    // Check workspace first
    const wsCheck = this.validateWorkspace(targetPose);
    if (wsCheck.status === 'OUT_OF_WORKSPACE') {
      return {
        solutions: [],
        diagnostics: {
          solverStatus: 'UNREACHABLE',
          totalSolutions: 0,
          bestError: 999,
          iterations: 0,
          workspaceViolation: true,
          singularityCondition: false,
          message: wsCheck.message
        }
      };
    }

    // Diverse seed configurations to find multiple solutions
    const seeds: JointState[] = [
      { ...currentJoints },
      { q1: 0,   q2: -45, q3: 60,   q4: 0,    q5: 30,  q6: 0   },
      { q1: 45,  q2: -30, q3: 45,   q4: 90,   q5: -30, q6: 0   },
      { q1: -45, q2: -60, q3: 90,   q4: -45,  q5: 45,  q6: 90  },
      { q1: 90,  q2: 0,   q3: -45,  q4: 0,    q5: 60,  q6: 45  },
      { q1: -90, q2: 45,  q3: -30,  q4: 120,  q5: -60, q6: -90 },
      { q1: 30,  q2: -90, q3: 120,  q4: -60,  q5: 30,  q6: 180 },
      { q1: -30, q2: 30,  q3: -90,  q4: 60,   q5: -45, q6: -180},
    ];

    const solutions: IKSolution[] = [];
    let totalIterations = 0;
    let bestError = 999;

    for (let i = 0; i < seeds.length; i++) {
      const result = this.inverseKinematics(targetPose, seeds[i]);
      totalIterations += result.iterations;

      if (result.success || result.errorDistance < 0.05) {
        // Check if this solution is sufficiently different from existing ones
        const isDuplicate = solutions.some(s => {
          const keys: (keyof JointState)[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
          const diff = keys.reduce((acc, k) => acc + Math.abs(s.joints[k] - result.solution[k]), 0);
          return diff < 10; // Less than 10 deg total difference => duplicate
        });

        if (!isDuplicate) {
          const fk = this.forwardKinematics(result.solution);
          const orientErr = Math.abs(fk.eePose.roll - targetPose.roll) +
                            Math.abs(fk.eePose.pitch - targetPose.pitch) +
                            Math.abs(fk.eePose.yaw - targetPose.yaw);

          const keys: (keyof JointState)[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
          const jointLimitsOk = keys.every(k => {
            const lim = DEFAULT_JOINT_LIMITS[k];
            return result.solution[k] >= lim.min && result.solution[k] <= lim.max;
          });

          // Collision status is determined by caller (App.tsx) to avoid circular deps
          const collisionStatus: 'CLEAR' | 'WARNING' | 'COLLISION' = 'CLEAR';

          if (result.errorDistance < bestError) bestError = result.errorDistance;

          solutions.push({
            id: solutions.length + 1,
            joints: result.solution,
            eePose: fk.eePose,
            positionError: result.errorDistance,
            orientationError: Number(orientErr.toFixed(2)),
            valid: result.success && jointLimitsOk,
            jointLimitsOk,
            collisionStatus,
            iterations: result.iterations
          });
        }
      }
    }

    // Sort by position error
    solutions.sort((a, b) => a.positionError - b.positionError);

    const jacobianCheck = solutions.length > 0 ? this.calculateJacobian(solutions[0].joints) : null;

    return {
      solutions,
      diagnostics: {
        solverStatus: solutions.length > 0 ? 'SUCCESS' : 'FAILED',
        totalSolutions: solutions.length,
        bestError: Number(bestError.toFixed(4)),
        iterations: totalIterations,
        workspaceViolation: false,
        singularityCondition: jacobianCheck ? jacobianCheck.status !== 'Safe' : false,
        message: solutions.length > 0
          ? `Found ${solutions.length} valid solution(s). Best position error: ${bestError.toFixed(4)}m`
          : 'No IK solution found. Target may be near singularity or at workspace boundary.'
      }
    };
  }
}
