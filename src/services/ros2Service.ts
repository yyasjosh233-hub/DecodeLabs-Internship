import type { JointState, EEPose, PIDDiagnostics } from '../types/robotics';

export type ROS2LogLevel = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface ROS2LogEntry {
  timestamp: string;
  level: ROS2LogLevel;
  node: string;
  message: string;
}

export interface ROS2TopicStatus {
  name: string;
  type: string;
  freq: string;
  status: 'PUBLISHING' | 'SUBSCRIBING' | 'IDLE';
}

export interface ROS2NodeStatus {
  name: string;
  namespace: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  pid: number;
}

export interface ROS2ServiceStatus {
  name: string;
  type: string;
  available: boolean;
}

export interface ROS2ActionStatus {
  name: string;
  type: string;
  status: 'IDLE' | 'ACTIVE' | 'PREEMPTED';
}

/**
 * ROS 2 Simulation Adapter
 *
 * This class simulates ROS 2 DDS middleware behaviour.
 * It does NOT connect to a real ROS 2 environment.
 * All values are derived from actual kinematics calculations.
 *
 * The UI will always display: SIMULATION MODE
 */
export class ROS2SimAdapter {
  private static logs: ROS2LogEntry[] = [];
  private static startTime = Date.now();
  private static messageCount = 0;

  static readonly MODE = 'SIMULATION_MODE' as const;
  static readonly ROS_DISTRO = 'Jazzy Jalisco';
  static readonly CONNECTED = false; // Never true in simulation

  static readonly TOPICS: ROS2TopicStatus[] = [
    { name: '/joint_states',     type: 'sensor_msgs/msg/JointState',           freq: '50 Hz',  status: 'PUBLISHING' },
    { name: '/tf',               type: 'tf2_msgs/msg/TFMessage',               freq: '100 Hz', status: 'PUBLISHING' },
    { name: '/tf_static',        type: 'tf2_msgs/msg/TFMessage',               freq: 'Static', status: 'PUBLISHING' },
    { name: '/joint_trajectory', type: 'trajectory_msgs/msg/JointTrajectory',  freq: '20 Hz',  status: 'SUBSCRIBING' },
    { name: '/robot_status',     type: 'std_msgs/msg/String',                  freq: '10 Hz',  status: 'PUBLISHING' },
    { name: '/robot_telemetry',  type: 'std_msgs/msg/String',                  freq: '10 Hz',  status: 'PUBLISHING' },
    { name: '/diagnostics',      type: 'diagnostic_msgs/msg/DiagnosticArray',  freq: '1 Hz',   status: 'PUBLISHING' },
  ];

  static readonly SERVICES: ROS2ServiceStatus[] = [
    { name: '/solve_fk',        type: 'moveit_msgs/srv/GetPositionFK',    available: true },
    { name: '/solve_ik',        type: 'moveit_msgs/srv/GetPositionIK',    available: true },
    { name: '/plan_path',       type: 'moveit_msgs/srv/GetMotionPlan',    available: true },
    { name: '/check_collision', type: 'moveit_msgs/srv/GetStateValidity', available: true },
  ];

  static readonly ACTIONS: ROS2ActionStatus[] = [
    { name: '/follow_joint_trajectory', type: 'control_msgs/action/FollowJointTrajectory', status: 'IDLE' },
  ];

  static readonly NODES: ROS2NodeStatus[] = [
    { name: 'robot_state_publisher', namespace: '/',          status: 'ACTIVE',   pid: 1001 },
    { name: 'joint_state_publisher', namespace: '/',          status: 'ACTIVE',   pid: 1002 },
    { name: 'tf2_ros_static',        namespace: '/',          status: 'ACTIVE',   pid: 1003 },
    { name: 'ik_solver_node',        namespace: '/planning',  status: 'ACTIVE',   pid: 1004 },
    { name: 'trajectory_controller', namespace: '/control',   status: 'ACTIVE',   pid: 1005 },
    { name: 'collision_checker',     namespace: '/planning',  status: 'ACTIVE',   pid: 1006 },
    { name: 'moveit_commander',      namespace: '/moveit',    status: 'INACTIVE', pid: 0    },
  ];

  static getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  static getLatencyMs(): number {
    // Simulated DDS latency (0.5–2ms typical)
    return Number((0.5 + Math.random() * 1.5).toFixed(2));
  }

  static addLog(level: ROS2LogLevel, node: string, message: string): void {
    const now = new Date();
    const ts = `${now.getHours().toString().padStart(2, '0')}:${
      now.getMinutes().toString().padStart(2, '0')}:${
      now.getSeconds().toString().padStart(2, '0')}.${
      now.getMilliseconds().toString().padStart(3, '0')}`;
    this.logs.unshift({ timestamp: ts, level, node, message });
    if (this.logs.length > 100) this.logs.pop();
    this.messageCount++;
  }

  static getLogs(): ROS2LogEntry[] {
    return this.logs;
  }

  static getMessageCount(): number {
    return this.messageCount;
  }

  static clearLogs(): void {
    this.logs = [];
  }

  /** Initialize standard startup logs */
  static initialize(): void {
    this.logs = [];
    this.addLog('INFO',    'robot_state_publisher', 'Node started in SIMULATION MODE');
    this.addLog('INFO',    'joint_state_publisher', 'Publishing /joint_states at 50 Hz');
    this.addLog('INFO',    'tf2_ros_static',        'TF tree initialized: world → base_link → ... → end_effector');
    this.addLog('INFO',    'ik_solver_node',        'DLS IK solver ready (damping λ=0.1, max_iter=50)');
    this.addLog('INFO',    'collision_checker',     'Collision checker initialized with 2 obstacle(s)');
    this.addLog('SUCCESS', 'trajectory_controller', 'Trajectory controller ACTIVE – quintic profile ready');
    this.addLog('INFO',    'moveit_commander',      'MoveIt 2 commander not connected (SIMULATION_MODE)');
    this.addLog('WARNING', 'system',                'ROS 2 not available on this machine – running in SIMULATION_MODE');
  }

  /** Simulate /solve_fk service call */
  static callSolveFK(joints: JointState): { success: boolean; latencyMs: number } {
    this.addLog('INFO', 'ik_solver_node', `FK solved for joints [${Object.values(joints).map(v => v.toFixed(1)).join(', ')}]°`);
    return { success: true, latencyMs: this.getLatencyMs() };
  }

  /** Simulate /solve_ik service call */
  static callSolveIK(target: EEPose, solutionCount: number): { success: boolean; latencyMs: number } {
    if (solutionCount > 0) {
      this.addLog('SUCCESS', 'ik_solver_node', `IK solved: ${solutionCount} solution(s) for target [${target.x},${target.y},${target.z}]m`);
    } else {
      this.addLog('ERROR', 'ik_solver_node', `IK FAILED: No solution for target [${target.x},${target.y},${target.z}]m`);
    }
    return { success: solutionCount > 0, latencyMs: this.getLatencyMs() };
  }

  /** Simulate /plan_path service call */
  static callPlanPath(safe: boolean, stats: { pathLength: number; duration: number }): { success: boolean; latencyMs: number } {
    if (safe) {
      this.addLog('SUCCESS', 'trajectory_controller', `Path planned: ${stats.pathLength.toFixed(3)}m, ${stats.duration.toFixed(2)}s`);
    } else {
      this.addLog('ERROR', 'collision_checker', 'Path REJECTED: collision detected along trajectory');
    }
    return { success: safe, latencyMs: this.getLatencyMs() };
  }

  /** Simulate /check_collision service call */
  static callCheckCollision(status: string, clearance: number): void {
    if (status === 'CLEAR') {
      this.addLog('SUCCESS', 'collision_checker', `Collision check PASSED – clearance: ${clearance.toFixed(3)}m`);
    } else if (status === 'WARNING') {
      this.addLog('WARNING', 'collision_checker', `Collision check WARNING – clearance: ${clearance.toFixed(3)}m`);
    } else {
      this.addLog('ERROR', 'collision_checker', `COLLISION DETECTED – clearance: ${clearance.toFixed(3)}m`);
    }
  }

  /** Simulate E-STOP event */
  static callEStop(): void {
    this.addLog('ERROR', 'trajectory_controller', 'EMERGENCY STOP TRIGGERED – all motion halted');
    this.addLog('ERROR', 'robot_state_publisher',  'Robot state: E-STOPPED');
  }

  /** Simulate E-STOP reset */
  static callResetEStop(): void {
    this.addLog('INFO',    'trajectory_controller', 'E-STOP RELEASED – system resetting');
    this.addLog('SUCCESS', 'robot_state_publisher',  'Robot state: IDLE – ready for commands');
  }

  /** Simulate trajectory start */
  static callStartTrajectory(duration: number, points: number): void {
    this.addLog('INFO', 'trajectory_controller', `Executing trajectory: ${points} points, ${duration.toFixed(2)}s`);
    this.addLog('INFO', 'follow_joint_trajectory', '/follow_joint_trajectory action: ACTIVE');
  }

  /** Simulate trajectory completion */
  static callTrajectoryComplete(): void {
    this.addLog('SUCCESS', 'trajectory_controller', 'Trajectory COMPLETED – robot reached target');
    this.addLog('INFO', 'follow_joint_trajectory', '/follow_joint_trajectory action: SUCCEEDED');
  }

  /** Build simulated PID diagnostics */
  static getPIDDiagnostics(
    mode: 'UNDER_TUNED' | 'NORMAL' | 'OVER_TUNED',
    currentJoints: JointState,
    targetJoints: JointState
  ): PIDDiagnostics {
    const pidParams = {
      UNDER_TUNED: { kp: 0.3, ki: 0.01, kd: 0.05 },
      NORMAL:      { kp: 1.2, ki: 0.10, kd: 0.20 },
      OVER_TUNED:  { kp: 4.5, ki: 0.50, kd: 0.80 }
    };
    const params = pidParams[mode];

    const keys: (keyof JointState)[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
    const target = keys.map(k => targetJoints[k]);
    const actual = keys.map(k => {
      // Simulate tracking lag based on PID tuning
      const lag = mode === 'UNDER_TUNED' ? 0.85 : mode === 'NORMAL' ? 0.98 : 1.0;
      const noise = (Math.random() - 0.5) * (mode === 'OVER_TUNED' ? 2.0 : 0.2);
      return Number((currentJoints[k] * lag + targetJoints[k] * (1 - lag) + noise).toFixed(2));
    });
    const trackingError = target.map((t, i) => Number((t - actual[i]).toFixed(3)));
    const velocityError = trackingError.map(e => Number((e * params.kp * 0.1).toFixed(3)));

    return {
      mode,
      kp: params.kp,
      ki: params.ki,
      kd: params.kd,
      targetPosition: target,
      actualPosition: actual,
      trackingError,
      velocityError,
      controllerState: 'ACTIVE'
    };
  }

  /** Publish /joint_states message payload */
  static getJointStatesMessage(joints: JointState, velocity?: number[]): object {
    const keys: (keyof JointState)[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
    return {
      header: {
        stamp: { sec: Math.floor(Date.now() / 1000), nanosec: (Date.now() % 1000) * 1e6 },
        frame_id: 'base_link'
      },
      name: ['joint1', 'joint2', 'joint3', 'joint4', 'joint5', 'joint6'],
      position: keys.map(k => Number((joints[k] * Math.PI / 180).toFixed(6))),
      velocity: velocity
        ? velocity.map(v => Number((v * Math.PI / 180).toFixed(6)))
        : [0, 0, 0, 0, 0, 0],
      effort: [1.2, 4.8, 3.1, 0.9, 0.4, 0.1]
    };
  }
}

// Initialize on module load
ROS2SimAdapter.initialize();
