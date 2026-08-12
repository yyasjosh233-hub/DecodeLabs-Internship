/**
 * Robotics Engine Test Suite
 * Week 1: Kinematics, IK, Jacobian, Trajectory, Collision
 *
 * Run: node --experimental-vm-modules src/robotics/robotics.test.ts
 */

import { KinematicsEngine, INITIAL_JOINT_STATE, DEFAULT_JOINT_LIMITS, DH_TABLE, WORKSPACE_LIMITS } from './kinematics';
import { TrajectoryEngine } from './trajectory';
import { CollisionEngine, INITIAL_OBSTACLES } from './collision';
import type { JointState, EEPose, Obstacle } from '../types/robotics';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

function assertClose(a: number, b: number, tol: number, label: string) {
  assert(Math.abs(a - b) <= tol, label, `got ${a.toFixed(5)}, expected ≈ ${b.toFixed(5)} (tol ${tol})`);
}

// ─────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log('  WEEK 1 – ROBOTICS ENGINE TEST SUITE');
console.log('══════════════════════════════════════════════════════\n');

// ─── Section 1: Forward Kinematics ────────────────────────────────
console.log('--- 1. Forward Kinematics ---');
{
  // Home position (all zeros) → EE should be at approximately [0, sum(d), 0]
  const zeroJoints: JointState = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0 };
  const fkZero = KinematicsEngine.forwardKinematics(zeroJoints);
  assert(typeof fkZero.eePose.x === 'number' && !isNaN(fkZero.eePose.x), 'FK produces finite X');
  assert(typeof fkZero.eePose.y === 'number' && !isNaN(fkZero.eePose.y), 'FK produces finite Y');
  assert(typeof fkZero.eePose.z === 'number' && !isNaN(fkZero.eePose.z), 'FK produces finite Z');
  assert(fkZero.T_all.length === 6, 'FK produces 6 transformation matrices (T01..T06)');
  assert(fkZero.jointPositions.length === 7, 'FK produces 7 joint positions (base + 6 joints)');

  // T06 must be 4x4
  assert(fkZero.T_all[5].length === 4 && fkZero.T_all[5][0].length === 4, 'T06 is a 4x4 matrix');

  // T06 last row should be [0, 0, 0, 1]
  const lastRow = fkZero.T_all[5][3];
  assertClose(lastRow[0], 0, 1e-9, 'T06 bottom row: R[3][0] = 0');
  assertClose(lastRow[1], 0, 1e-9, 'T06 bottom row: R[3][1] = 0');
  assertClose(lastRow[2], 0, 1e-9, 'T06 bottom row: R[3][2] = 0');
  assertClose(lastRow[3], 1, 1e-9, 'T06 bottom row: R[3][3] = 1');

  // With default (non-zero) joints
  const fkDefault = KinematicsEngine.forwardKinematics(INITIAL_JOINT_STATE);
  assert(fkDefault.eePose.z >= 0, 'FK with default joints: EE Z >= 0 (above ground)');

  // Total reach should be within workspace limits
  const dist = Math.sqrt(
    fkDefault.eePose.x ** 2 + fkDefault.eePose.y ** 2 + fkDefault.eePose.z ** 2
  );
  assert(dist <= WORKSPACE_LIMITS.maxReach + 0.05, 'FK: EE within max reach');
}

// ─── Section 2: DH Table integrity ────────────────────────────────
console.log('\n--- 2. DH Table Integrity ---');
{
  assert(DH_TABLE.length === 6, 'DH table has exactly 6 entries');
  DH_TABLE.forEach((row, i) => {
    assert(typeof row.d === 'number' && typeof row.a === 'number', `DH[${i}] d and a are numbers`);
    assert(row.d >= 0, `DH[${i}] d >= 0`);
  });
}

// ─── Section 3: Jacobian ──────────────────────────────────────────
console.log('\n--- 3. Jacobian Computation ---');
{
  const jac = KinematicsEngine.calculateJacobian(INITIAL_JOINT_STATE);
  assert(jac.J.length === 6, 'Jacobian has 6 rows');
  assert(jac.J[0].length === 6, 'Jacobian has 6 columns');
  assert(typeof jac.detJ === 'number' && !isNaN(jac.detJ), 'det(J) is a finite number');
  assert(typeof jac.manipulability === 'number' && jac.manipulability >= 0, 'Manipulability index >= 0');
  assert(typeof jac.conditionNumber === 'number' && jac.conditionNumber > 0, 'Condition number > 0');
  assert(['Safe', 'Warning', 'Singular'].includes(jac.status), 'Jacobian status is valid enum');

  // Singularity at q2=0, q3=0 (fully stretched arm)
  const stretchJoints: JointState = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0 };
  const jacStretch = KinematicsEngine.calculateJacobian(stretchJoints);
  assert(jacStretch.conditionNumber > 50 || jacStretch.status !== 'Safe',
    'Near-singular config has high condition number or Warning/Singular status');
}

// ─── Section 4: Workspace Validation ──────────────────────────────
console.log('\n--- 4. Workspace Validation ---');
{
  // Reachable target
  const reachable: EEPose = { x: 0.4, y: 0.2, z: 0.5, roll: 0, pitch: 0, yaw: 0 };
  const wsR = KinematicsEngine.validateWorkspace(reachable);
  assert(wsR.status === 'REACHABLE', 'Valid target: status = REACHABLE');
  assert(wsR.xLimitOk && wsR.yLimitOk && wsR.zLimitOk, 'Valid target: all axis limits OK');

  // Out of workspace (too far)
  const tooFar: EEPose = { x: 2.0, y: 0, z: 0, roll: 0, pitch: 0, yaw: 0 };
  const wsF = KinematicsEngine.validateWorkspace(tooFar);
  assert(wsF.status === 'OUT_OF_WORKSPACE', 'Too-far target: status = OUT_OF_WORKSPACE');

  // Below ground
  const belowGround: EEPose = { x: 0, y: 0, z: -0.1, roll: 0, pitch: 0, yaw: 0 };
  const wsB = KinematicsEngine.validateWorkspace(belowGround);
  assert(wsB.status === 'OUT_OF_WORKSPACE', 'Below-ground target: status = OUT_OF_WORKSPACE');
}

// ─── Section 5: Inverse Kinematics (single) ───────────────────────
console.log('\n--- 5. Inverse Kinematics (Single) ---');
{
  // Solve IK for a target that FK produces from default joints
  const startJoints: JointState = { q1: 10, q2: -30, q3: 45, q4: 0, q5: 30, q6: 0 };
  const fkStart = KinematicsEngine.forwardKinematics(startJoints);
  const target = fkStart.eePose;

  const ik = KinematicsEngine.inverseKinematics(target, INITIAL_JOINT_STATE);
  assert(typeof ik.success === 'boolean', 'IK returns success boolean');
  assert(ik.iterations > 0, 'IK used at least 1 iteration');
  assert(ik.errorDistance >= 0, 'IK error distance >= 0');

  if (ik.success) {
    const fkCheck = KinematicsEngine.forwardKinematics(ik.solution);
    assertClose(fkCheck.eePose.x, target.x, 0.02, 'IK solution: FK(solution).x ≈ target.x (20mm)');
    assertClose(fkCheck.eePose.y, target.y, 0.02, 'IK solution: FK(solution).y ≈ target.y (20mm)');
    assertClose(fkCheck.eePose.z, target.z, 0.02, 'IK solution: FK(solution).z ≈ target.z (20mm)');
  }

  // Unreachable target (too far)
  const unreachable: EEPose = { x: 5.0, y: 5.0, z: 5.0, roll: 0, pitch: 0, yaw: 0 };
  const ikU = KinematicsEngine.inverseKinematics(unreachable, INITIAL_JOINT_STATE);
  assert(!ikU.success || ikU.errorDistance > 0.05, 'IK correctly fails for unreachable target');

  // Joint limits enforced
  const keys: (keyof JointState)[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
  const limitsOk = keys.every(k => {
    const lim = DEFAULT_JOINT_LIMITS[k];
    return ik.solution[k] >= lim.min && ik.solution[k] <= lim.max;
  });
  assert(limitsOk, 'IK solution respects all joint limits');
}

// ─── Section 6: Multiple IK Solutions ─────────────────────────────
console.log('\n--- 6. Multiple IK Solutions ---');
{
  const target: EEPose = { x: 0.5, y: 0.1, z: 0.6, roll: 0, pitch: 90, yaw: 0 };
  const { solutions, diagnostics } = KinematicsEngine.solveMultipleIK(target, INITIAL_JOINT_STATE);

  assert(Array.isArray(solutions), 'solveMultipleIK returns array');
  assert(diagnostics.totalSolutions === solutions.length, 'Diagnostics count matches solutions length');
  assert(['SUCCESS', 'FAILED', 'PARTIAL', 'UNREACHABLE', 'IDLE'].includes(diagnostics.solverStatus),
    'IK diagnostics status is valid enum');

  if (solutions.length > 0) {
    assert(solutions.length >= 1 && solutions.length <= 8, 'IK finds 1-8 solutions');
    const s = solutions[0];
    assert(typeof s.positionError === 'number' && s.positionError >= 0, 'Solution has positionError >= 0');
    assert(typeof s.orientationError === 'number' && s.orientationError >= 0, 'Solution has orientationError >= 0');
    assert(typeof s.jointLimitsOk === 'boolean', 'Solution has jointLimitsOk');
    assert(['CLEAR', 'WARNING', 'COLLISION'].includes(s.collisionStatus), 'Solution collisionStatus is valid');
  }

  // Unreachable target returns UNREACHABLE
  const tooFar: EEPose = { x: 5.0, y: 0, z: 0, roll: 0, pitch: 0, yaw: 0 };
  const { diagnostics: dU } = KinematicsEngine.solveMultipleIK(tooFar, INITIAL_JOINT_STATE);
  assert(dU.solverStatus === 'UNREACHABLE', 'Multi-IK returns UNREACHABLE for out-of-workspace target');
}

// ─── Section 7: SE(3) Matrix ──────────────────────────────────────
console.log('\n--- 7. SE(3) Matrix ---');
{
  const pose: EEPose = { x: 0.3, y: 0.2, z: 0.5, roll: 0, pitch: 0, yaw: 0 };
  const T = KinematicsEngine.getSE3Matrix(pose);
  assert(T.length === 4 && T[0].length === 4, 'SE3 returns 4x4 matrix');
  assertClose(T[0][3], 0.3, 1e-9, 'SE3: T[0][3] = x = 0.3');
  assertClose(T[1][3], 0.2, 1e-9, 'SE3: T[1][3] = y = 0.2');
  assertClose(T[2][3], 0.5, 1e-9, 'SE3: T[2][3] = z = 0.5');
  assertClose(T[3][3], 1,   1e-9, 'SE3: T[3][3] = 1 (homogeneous)');
  // Identity rotation when RPY=0
  assertClose(T[0][0], 1, 1e-9, 'SE3 identity rotation: T[0][0] = 1');
  assertClose(T[1][1], 1, 1e-9, 'SE3 identity rotation: T[1][1] = 1');
  assertClose(T[2][2], 1, 1e-9, 'SE3 identity rotation: T[2][2] = 1');
}

// ─── Section 8: Collision Detection ──────────────────────────────
console.log('\n--- 8. Collision Detection ---');
{
  const col = CollisionEngine.checkCollision(INITIAL_JOINT_STATE, INITIAL_OBSTACLES);
  assert(['CLEAR', 'WARNING', 'COLLISION'].includes(col.status), 'Collision status is valid enum');
  assert(col.minClearance >= 0, 'Min clearance >= 0');
  assert(typeof col.closestObstacle === 'string' || col.closestObstacle === null, 'Closest obstacle is string or null');
  assert(Array.isArray(col.collidingObjects), 'collidingObjects is array');
  assert(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(col.riskLevel!), 'Risk level is valid enum');

  // With no obstacles, should always be CLEAR
  const colEmpty = CollisionEngine.checkCollision(INITIAL_JOINT_STATE, []);
  assert(colEmpty.status === 'CLEAR', 'No obstacles = CLEAR status');
  assert(colEmpty.minClearance === 999, 'No obstacles = min clearance 999m');

  // Sphere obstacle
  const sphereObs: Obstacle[] = [{ id: 'test', name: 'Test Sphere', type: 'sphere', position: [0, 0.5, 0], size: 0.8 }];
  const colSphere = CollisionEngine.checkCollision(INITIAL_JOINT_STATE, sphereObs);
  assert(['CLEAR', 'WARNING', 'COLLISION'].includes(colSphere.status), 'Sphere obstacle: valid collision status');

  // Box obstacle
  const boxObs: Obstacle[] = [{ id: 'test2', name: 'Test Box', type: 'box', position: [0.3, 0.3, 0.3], size: [0.3, 0.3, 0.3] }];
  const colBox = CollisionEngine.checkCollision(INITIAL_JOINT_STATE, boxObs);
  assert(['CLEAR', 'WARNING', 'COLLISION'].includes(colBox.status), 'Box obstacle: valid collision status');

  // Cylinder obstacle
  const cylObs: Obstacle[] = [{ id: 'test3', name: 'Test Cylinder', type: 'cylinder', position: [0, 0.4, 0], size: [0.2, 0.6, 0.2] }];
  const colCyl = CollisionEngine.checkCollision(INITIAL_JOINT_STATE, cylObs);
  assert(['CLEAR', 'WARNING', 'COLLISION'].includes(colCyl.status), 'Cylinder obstacle: valid collision status');
}

// ─── Section 9: Self-Collision ────────────────────────────────────
console.log('\n--- 9. Self-Collision Check ---');
{
  const selfNormal = CollisionEngine.checkSelfCollision(INITIAL_JOINT_STATE);
  assert(typeof selfNormal.detected === 'boolean', 'checkSelfCollision returns detected boolean');
  assert(typeof selfNormal.minClearance === 'number' && selfNormal.minClearance >= 0, 'Self-collision minClearance >= 0');
  assert(Array.isArray(selfNormal.collidingLinks), 'collidingLinks is array');

  // Normal configuration shouldn't self-collide
  const zeroJoints: JointState = { q1: 0, q2: -45, q3: 60, q4: 0, q5: 30, q6: 0 };
  const selfZero = CollisionEngine.checkSelfCollision(zeroJoints);
  assert(!selfZero.detected, 'Default config: no self-collision');
}

// ─── Section 10: Quintic Trajectory ──────────────────────────────
console.log('\n--- 10. Quintic Polynomial Trajectory ---');
{
  const start = INITIAL_JOINT_STATE;
  const target: JointState = { q1: 45, q2: 15, q3: -30, q4: 90, q5: -45, q6: 180 };
  const traj = TrajectoryEngine.generateQuinticTrajectory(start, target, 3.0, 20);

  assert(traj.length > 0, 'Trajectory has points');
  assert(traj.length >= 20, 'Trajectory has >= 20 points at 20Hz for 3s');

  const first = traj[0];
  const last  = traj[traj.length - 1];

  // Start conditions
  assertClose(first.joints.q1, start.q1, 1e-3, 'Trajectory: q1 starts at start.q1');
  assertClose(first.joints.q2, start.q2, 1e-3, 'Trajectory: q2 starts at start.q2');

  // End conditions (quintic guarantees convergence)
  assertClose(last.joints.q1, target.q1, 0.1, 'Trajectory: q1 ends at target.q1 (±0.1°)');
  assertClose(last.joints.q2, target.q2, 0.1, 'Trajectory: q2 ends at target.q2 (±0.1°)');
  assertClose(last.joints.q3, target.q3, 0.1, 'Trajectory: q3 ends at target.q3 (±0.1°)');

  // Boundary velocities ≈ 0
  assertClose(first.velocity[0], 0, 0.1, 'Trajectory: initial velocity ≈ 0');
  assertClose(last.velocity[0],  0, 0.1, 'Trajectory: final velocity ≈ 0');

  // Boundary accelerations ≈ 0
  assertClose(first.acceleration[0], 0, 0.1, 'Trajectory: initial acceleration ≈ 0');
  assertClose(last.acceleration[0],  0, 0.1, 'Trajectory: final acceleration ≈ 0');

  // Time monotonically increasing
  let monotonic = true;
  for (let i = 1; i < traj.length; i++) {
    if (traj[i].time < traj[i-1].time) { monotonic = false; break; }
  }
  assert(monotonic, 'Trajectory time is monotonically increasing');

  // Each point has FK pose
  assert(typeof first.pose.x === 'number' && !isNaN(first.pose.x), 'Trajectory: FK pose computed per point');
}

// ─── Section 11: Trajectory Validation ───────────────────────────
console.log('\n--- 11. Trajectory Collision Validation ---');
{
  const start = INITIAL_JOINT_STATE;
  const target: JointState = { q1: 45, q2: 15, q3: -30, q4: 90, q5: -45, q6: 180 };
  const traj = TrajectoryEngine.generateQuinticTrajectory(start, target, 3.0, 20);

  const validNoObs = TrajectoryEngine.validateTrajectory(traj, []);
  assert(validNoObs.safe, 'Empty obstacle set: trajectory is safe');
  assert(validNoObs.collisionSegments === 0, 'No obstacles: 0 collision segments');
  assert(validNoObs.annotated.length === traj.length, 'validateTrajectory returns same number of points');

  // Every point annotated with collisionStatus
  const allAnnotated = validNoObs.annotated.every(pt =>
    ['CLEAR', 'WARNING', 'COLLISION'].includes(pt.collisionStatus!)
  );
  assert(allAnnotated, 'All trajectory points annotated with collisionStatus');
}

// ─── Section 12: Trajectory Path Stats ───────────────────────────
console.log('\n--- 12. Trajectory Path Statistics ---');
{
  const start = INITIAL_JOINT_STATE;
  const target: JointState = { q1: 45, q2: 15, q3: -30, q4: 90, q5: -45, q6: 180 };
  const traj = TrajectoryEngine.generateQuinticTrajectory(start, target, 3.0, 20);
  const stats = TrajectoryEngine.computePathStats(traj, 12.5, 0);

  assert(stats.pathLength >= 0, 'Path length >= 0');
  assert(stats.duration > 0, 'Duration > 0');
  assert(stats.maxVelocity >= 0, 'Max velocity >= 0');
  assert(stats.maxAcceleration >= 0, 'Max acceleration >= 0');
  assert(stats.totalPoints === traj.length, 'Total points matches trajectory length');
  assertClose(stats.planningTimeMs, 12.5, 1e-3, 'planningTimeMs passed through correctly');
  assert(stats.collisionFree === true, 'collisionFree matches input collisionSegments=0');
}

// ─── Section 13: FollowJointTrajectory JSON ───────────────────────
console.log('\n--- 13. FollowJointTrajectory JSON Export ---');
{
  const start = INITIAL_JOINT_STATE;
  const target: JointState = { q1: 10, q2: -20, q3: 30, q4: 0, q5: 0, q6: 0 };
  const traj = TrajectoryEngine.generateQuinticTrajectory(start, target, 2.0, 10);
  const json = TrajectoryEngine.toFollowJointTrajectoryJSON(traj) as any;

  assert(Array.isArray(json.joint_names), 'JSON has joint_names array');
  assert(json.joint_names.length === 6, 'JSON has 6 joint names');
  assert(Array.isArray(json.points), 'JSON has points array');
  assert(json.points.length === traj.length, 'JSON points length matches trajectory');
  assert(json.header.frame_id === 'base_link', 'JSON header frame_id = base_link');

  const firstPt = json.points[0];
  assert(Array.isArray(firstPt.positions) && firstPt.positions.length === 6, 'JSON point has 6 positions (radians)');
  assert(typeof firstPt.time_from_start.sec === 'number', 'JSON point has time_from_start.sec');
}

// ─── Summary ──────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
console.log('══════════════════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('  All tests passed! ✅\n');
  process.exit(0);
}
