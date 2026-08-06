/**
 * 6-DOF Industrial Robot Kinematics & Motion Planning Engine
 * Includes Forward Kinematics (FK), Damped Least Squares Inverse Kinematics (IK),
 * Jacobian Matrix computation, Yoshikawa Manipulability Index, Singularity Detection,
 * Quintic Polynomial Trajectory Planning, and Collision Detection.
 */

export const DH_PARAMS = [
    { alpha: -Math.PI / 2, a: 0.10, d: 0.40 }, // Joint 1 -> Link 1
    { alpha: 0,            a: 0.55, d: 0.00 }, // Joint 2 -> Link 2
    { alpha: -Math.PI / 2, a: 0.10, d: 0.00 }, // Joint 3 -> Link 3
    { alpha:  Math.PI / 2, a: 0.00, d: 0.60 }, // Joint 4 -> Link 4
    { alpha: -Math.PI / 2, a: 0.00, d: 0.00 }, // Joint 5 -> Link 5
    { alpha: 0,            a: 0.00, d: 0.15 }  // Joint 6 -> Tool Flange
];

export const JOINT_LIMITS = [
    { min: -180, max: 180 },
    { min: -110, max: 110 },
    { min: -130, max: 150 },
    { min: -200, max: 200 },
    { min: -125, max: 125 },
    { min: -360, max: 360 }
];

const rad = (deg) => (deg * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

/**
 * Computes 4x4 DH Transformation Matrix
 */
export function dhMatrix(alpha, a, d, theta) {
    const ct = Math.cos(theta);
    const st = Math.sin(theta);
    const ca = Math.cos(alpha);
    const sa = Math.sin(alpha);

    return [
        [ct, -st * ca,  st * sa, a * ct],
        [st,  ct * ca, -ct * sa, a * st],
        [0,   sa,       ca,      d],
        [0,   0,        0,       1]
    ];
}

/**
 * 4x4 Matrix Multiplication
 */
export function multiplyMatrices(A, B) {
    const C = Array(4).fill(0).map(() => Array(4).fill(0));
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            C[r][c] = A[r][0] * B[0][c] + A[r][1] * B[1][c] + A[r][2] * B[2][c] + A[r][3] * B[3][c];
        }
    }
    return C;
}

/**
 * Forward Kinematics (FK)
 * Calculates positions of all joint origins and end-effector pose (X, Y, Z, Roll, Pitch, Yaw)
 */
export function forwardKinematics(jointDegrees) {
    const radians = jointDegrees.map(rad);
    let T = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];

    const jointTransforms = [];
    const jointPositions = [[0, 0, 0]];
    const jointZAxes = [[0, 0, 1]];

    for (let i = 0; i < 6; i++) {
        const dh = DH_PARAMS[i];
        const Ti = dhMatrix(dh.alpha, dh.a, dh.d, radians[i]);
        T = multiplyMatrices(T, Ti);
        jointTransforms.push(T);
        jointPositions.push([T[0][3], T[1][3], T[2][3]]);
        jointZAxes.push([T[0][2], T[1][2], T[2][2]]);
    }

    // Extract End Effector Pose
    const x = T[0][3];
    const y = T[1][3];
    const z = T[2][3];

    // Euler angles (ZYX / Roll-Pitch-Yaw)
    const pitch = Math.atan2(-T[2][0], Math.sqrt(T[0][0] * T[0][0] + T[1][0] * T[1][0]));
    const yaw = Math.atan2(T[1][0], T[0][0]);
    const roll = Math.atan2(T[2][1], T[2][2]);

    return {
        pose: {
            x: Number(x.toFixed(4)),
            y: Number(y.toFixed(4)),
            z: Number(z.toFixed(4)),
            roll: Number(deg(roll).toFixed(2)),
            pitch: Number(deg(pitch).toFixed(2)),
            yaw: Number(deg(yaw).toFixed(2))
        },
        matrix: T,
        jointPositions,
        jointZAxes,
        jointTransforms
    };
}

/**
 * 6x6 Geometric Jacobian Matrix Calculation
 */
export function calculateJacobian(jointDegrees) {
    const fk = forwardKinematics(jointDegrees);
    const p_e = fk.jointPositions[6];

    const J = Array(6).fill(0).map(() => Array(6).fill(0));

    for (let i = 0; i < 6; i++) {
        const z_i = fk.jointZAxes[i];
        const p_i = fk.jointPositions[i];

        // Linear velocity component: z_{i-1} x (p_e - p_{i-1})
        const rx = p_e[0] - p_i[0];
        const ry = p_e[1] - p_i[1];
        const rz = p_e[2] - p_i[2];

        J[0][i] = z_i[1] * rz - z_i[2] * ry;
        J[1][i] = z_i[2] * rx - z_i[0] * rz;
        J[2][i] = z_i[0] * ry - z_i[1] * rx;

        // Angular velocity component: z_{i-1}
        J[3][i] = z_i[0];
        J[4][i] = z_i[1];
        J[5][i] = z_i[2];
    }

    return J;
}

/**
 * Computes Yoshikawa Manipulability Index: w = sqrt(det(J * J^T))
 */
export function calculateManipulability(J) {
    const JJt = Array(6).fill(0).map(() => Array(6).fill(0));
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
            let sum = 0;
            for (let k = 0; k < 6; k++) sum += J[r][k] * J[c][k];
            JJt[r][c] = sum;
        }
    }

    let det = 1.0;
    const M = JJt.map(row => [...row]);
    for (let i = 0; i < 6; i++) {
        let pivot = i;
        for (let j = i + 1; j < 6; j++) {
            if (Math.abs(M[j][i]) > Math.abs(M[pivot][i])) pivot = j;
        }
        if (pivot !== i) {
            [M[i], M[pivot]] = [M[pivot], M[i]];
            det = -det;
        }
        if (Math.abs(M[i][i]) < 1e-12) return 0;
        det *= M[i][i];
        for (let j = i + 1; j < 6; j++) {
            const factor = M[j][i] / M[i][i];
            for (let k = i; k < 6; k++) M[j][k] -= factor * M[i][k];
        }
    }

    const manipulability = Math.sqrt(Math.max(0, det));
    return Number(manipulability.toFixed(4));
}

/**
 * Damped Least Squares Numerical Inverse Kinematics (IK)
 */
export function inverseKinematics(targetPose, currentJoints, maxIter = 50, tol = 1e-3) {
    let joints = [...currentJoints];
    const lambda = 0.1;

    for (let iter = 0; iter < maxIter; iter++) {
        const fk = forwardKinematics(joints);
        const current = fk.pose;

        const errX = targetPose.x - current.x;
        const errY = targetPose.y - current.y;
        const errZ = targetPose.z - current.z;
        const errR = rad(targetPose.roll - current.roll);
        const errP = rad(targetPose.pitch - current.pitch);
        const errYaw = rad(targetPose.yaw - current.yaw);

        const errorNorm = Math.sqrt(errX * errX + errY * errY + errZ * errZ + errR * errR + errP * errP + errYaw * errYaw);
        if (errorNorm < tol) {
            return { success: true, joints: joints.map(j => Number(j.toFixed(2))), iterations: iter, error: errorNorm };
        }

        const J = calculateJacobian(joints);
        const errVec = [errX, errY, errZ, errR, errP, errYaw];

        const JJt = Array(6).fill(0).map(() => Array(6).fill(0));
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                let sum = 0;
                for (let k = 0; k < 6; k++) sum += J[r][k] * J[c][k];
                JJt[r][c] = sum + (r === c ? lambda * lambda : 0);
            }
        }

        const y = solve6x6(JJt, errVec);
        if (!y) break;

        const dTheta = Array(6).fill(0);
        for (let i = 0; i < 6; i++) {
            let sum = 0;
            for (let k = 0; k < 6; k++) sum += J[k][i] * y[k];
            dTheta[i] = deg(sum);
        }

        for (let i = 0; i < 6; i++) {
            const step = Math.max(-5, Math.min(5, dTheta[i]));
            joints[i] += step;
            joints[i] = Math.max(JOINT_LIMITS[i].min, Math.min(JOINT_LIMITS[i].max, joints[i]));
        }
    }

    const finalFk = forwardKinematics(joints);
    const err = Math.sqrt(
        Math.pow(targetPose.x - finalFk.pose.x, 2) +
        Math.pow(targetPose.y - finalFk.pose.y, 2) +
        Math.pow(targetPose.z - finalFk.pose.z, 2)
    );

    return {
        success: err < 0.05,
        joints: joints.map(j => Number(j.toFixed(2))),
        error: Number(err.toFixed(4))
    };
}

function solve6x6(A, b) {
    const M = A.map((row, i) => [...row, b[i]]);
    for (let i = 0; i < 6; i++) {
        let maxRow = i;
        for (let k = i + 1; k < 6; k++) {
            if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
        }
        [M[i], M[maxRow]] = [M[maxRow], M[i]];
        if (Math.abs(M[i][i]) < 1e-12) return null;
        for (let k = i + 1; k < 6; k++) {
            const c = M[k][i] / M[i][i];
            for (let j = i; j <= 6; j++) M[k][j] -= c * M[i][j];
        }
    }
    const x = Array(6).fill(0);
    for (let i = 5; i >= 0; i--) {
        let sum = M[i][6];
        for (let j = i + 1; j < 6; j++) sum -= M[i][j] * x[j];
        x[i] = sum / M[i][i];
    }
    return x;
}

/**
 * Quintic Polynomial Motion Trajectory Generation
 * Produces smooth C^2 trajectory for all joints between start & goal
 */
export function generateQuinticTrajectory(startJoints, goalJoints, duration = 3.0, fps = 30) {
    const totalFrames = Math.floor(duration * fps);
    const trajectory = [];

    for (let f = 0; f <= totalFrames; f++) {
        const t = (f / totalFrames) * duration;
        const tau = t / duration;

        const s = 10 * Math.pow(tau, 3) - 15 * Math.pow(tau, 4) + 6 * Math.pow(tau, 5);
        const ds = (30 * Math.pow(tau, 2) - 60 * Math.pow(tau, 3) + 30 * Math.pow(tau, 4)) / duration;
        const dds = (60 * tau - 180 * Math.pow(tau, 2) + 120 * Math.pow(tau, 3)) / (duration * duration);

        const frameJoints = [];
        const frameVelocities = [];
        const frameAccelerations = [];

        for (let j = 0; j < 6; j++) {
            const q0 = startJoints[j];
            const qf = goalJoints[j];
            const delta = qf - q0;

            const q = q0 + delta * s;
            const qdot = delta * ds;
            const qddot = delta * dds;

            frameJoints.push(Number(q.toFixed(2)));
            frameVelocities.push(Number(qdot.toFixed(2)));
            frameAccelerations.push(Number(qddot.toFixed(2)));
        }

        const fk = forwardKinematics(frameJoints);
        trajectory.push({
            time: Number(t.toFixed(2)),
            joints: frameJoints,
            velocities: frameVelocities,
            accelerations: frameAccelerations,
            pose: fk.pose
        });
    }

    return trajectory;
}

/**
 * Check Self & Environmental Collisions
 */
export function checkCollisions(jointDegrees, obstacles = []) {
    const fk = forwardKinematics(jointDegrees);
    const positions = fk.jointPositions;

    for (let i = 1; i < positions.length; i++) {
        if (positions[i][2] < -0.01) {
            return { collided: true, type: 'FLOOR_COLLISION', link: `Link ${i}` };
        }
    }

    for (let i = 0; i < 6; i++) {
        if (jointDegrees[i] < JOINT_LIMITS[i].min || jointDegrees[i] > JOINT_LIMITS[i].max) {
            return { collided: true, type: 'JOINT_LIMIT_EXCEEDED', joint: `Joint ${i+1}` };
        }
    }

    for (const obs of obstacles) {
        for (let i = 1; i < positions.length; i++) {
            const pos = positions[i];
            const dx = pos[0] - obs.x;
            const dy = pos[1] - obs.y;
            const dz = pos[2] - obs.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < obs.radius) {
                return { collided: true, type: 'OBSTACLE_COLLISION', obstacle: obs.name, link: `Link ${i}` };
            }
        }
    }

    return { collided: false };
}
