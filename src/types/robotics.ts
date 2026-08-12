export interface JointState {
  q1: number; // Shoulder Pan (deg)
  q2: number; // Shoulder Lift (deg)
  q3: number; // Elbow (deg)
  q4: number; // Wrist Roll (deg)
  q5: number; // Wrist Pitch (deg)
  q6: number; // Wrist Yaw (deg)
}

export interface JointLimits {
  min: number;
  max: number;
}

export interface EEPose {
  x: number;     // meters
  y: number;     // meters
  z: number;     // meters
  roll: number;  // degrees
  pitch: number; // degrees
  yaw: number;   // degrees
}

export interface DHParameter {
  joint: number;
  name: string;
  theta: number; // degrees
  d: number;     // meters
  a: number;     // meters
  alpha: number; // degrees
}

export interface Obstacle {
  id: string;
  name: string;
  type: 'sphere' | 'box' | 'cylinder';
  position: [number, number, number];
  size: [number, number, number] | number; // radius for sphere, [w, h, d] for box, [r, h, r] for cylinder
}

export type CollisionState = 'CLEAR' | 'WARNING' | 'COLLISION';

export interface CollisionInfo {
  status: CollisionState;
  minClearance: number; // meters
  closestObstacle: string | null;
  collidingObjects?: string[];
  collisionLocation?: [number, number, number] | null;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  selfCollision?: boolean;
}

export interface TrajectoryPoint {
  time: number;
  joints: JointState;
  pose: EEPose;
  velocity: number[];
  acceleration: number[];
  collisionStatus?: CollisionState;
}

export interface TrajectoryConfig {
  startPose: EEPose;
  targetPose: EEPose;
  duration: number; // seconds
  sampleRate: number; // Hz
  type: 'quintic' | 'cubic' | 'linear';
}

export interface TrajectoryStats {
  pathLength: number;        // meters
  duration: number;          // seconds
  maxVelocity: number;       // deg/s (max over all joints)
  maxAcceleration: number;   // deg/s^2 (max over all joints)
  totalPoints: number;
  planningTimeMs: number;
  collisionFree: boolean;
  collisionSegments: number;
}

// IK solution from solver
export interface IKSolution {
  id: number;
  joints: JointState;
  eePose: EEPose;
  positionError: number;    // meters
  orientationError: number; // degrees
  valid: boolean;
  jointLimitsOk: boolean;
  collisionStatus: CollisionState;
  iterations: number;
}

export interface IKDiagnostics {
  solverStatus: 'SUCCESS' | 'FAILED' | 'PARTIAL' | 'UNREACHABLE' | 'IDLE';
  totalSolutions: number;
  bestError: number;
  iterations: number;
  workspaceViolation: boolean;
  singularityCondition: boolean;
  message: string;
}

export type WorkspaceStatus = 'REACHABLE' | 'OUT_OF_WORKSPACE' | 'UNCHECKED';

export interface WorkspaceCheckResult {
  status: WorkspaceStatus;
  maxReach: number;   // meters
  minReach: number;   // meters
  distance: number;   // target distance from base
  xLimitOk: boolean;
  yLimitOk: boolean;
  zLimitOk: boolean;
  message: string;
}

export interface PIDDiagnostics {
  mode: 'UNDER_TUNED' | 'NORMAL' | 'OVER_TUNED';
  kp: number;
  ki: number;
  kd: number;
  targetPosition: number[];  // per joint
  actualPosition: number[];  // per joint
  trackingError: number[];   // per joint
  velocityError: number[];   // per joint
  controllerState: 'ACTIVE' | 'IDLE' | 'SATURATED' | 'E-STOPPED';
}

export interface TFFrame {
  name: string;
  parent: string;
  position: [number, number, number];
  rotation: [number, number, number]; // RPY degrees
}

export interface RobotFullState {
  robot: {
    name: string;
    dof: number;
    status: 'IDLE' | 'MOVING' | 'E-STOPPED' | 'TRAJECTORY_EXECUTION';
    mode: 'SIMULATION' | 'HARDWARE';
    ros2Mode: 'SIMULATION_MODE' | 'ROS2_CONNECTED';
  };
  joint_states: JointState;
  end_effector: EEPose;
  forward_kinematics: {
    T06: number[][];
    jointPositions: [number, number, number][];
  };
  jacobian: number[][];
  manipulability: number;
  singularity_metric: number;
  condition_number: number;
  singularity_status: 'Safe' | 'Warning' | 'Singular';
  collision: CollisionInfo;
  workspace: WorkspaceCheckResult;
  ik_solutions: {
    count: number;
    solutions: IKSolution[];
    diagnostics: IKDiagnostics;
  };
  trajectory: {
    status: 'IDLE' | 'PLAYING' | 'PAUSED' | 'STOPPED' | 'BLOCKED_COLLISION';
    progress: number; // 0..100
    currentTime: number;
    totalTime: number;
    stats: TrajectoryStats | null;
  };
  pid: PIDDiagnostics;
  ros2: {
    connected: boolean;
    mode: 'SIMULATION_MODE';
    topics: string[];
    services: string[];
    actions: string[];
    latencyMs: number;
  };
  telemetry: {
    fps: number;
    uptime: number;
    logCount: number;
  };
}
