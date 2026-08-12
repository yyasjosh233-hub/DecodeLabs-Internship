import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Navbar, type RoboticsTab } from './components/Navbar';
import { RobotViewport } from './components/RobotViewport';
import { CartesianControlCard } from './components/CartesianControlCard';
import { JointControlCard } from './components/JointControlCard';
import { KinematicsTab } from './components/KinematicsTab';
import { TrajectoryTab } from './components/TrajectoryTab';
import { CollisionTab } from './components/CollisionTab';
import { TelemetryTab } from './components/TelemetryTab';
import { ArchitectureTab } from './components/ArchitectureTab';
import { StateJsonViewer } from './components/StateJsonViewer';
import { IKSolutionsPanel } from './components/IKSolutionsPanel';
import { WorkflowPanel } from './components/WorkflowPanel';

import type {
  JointState, EEPose, Obstacle, TrajectoryPoint,
  RobotFullState, IKSolution, IKDiagnostics, WorkspaceCheckResult,
  TrajectoryStats, PIDDiagnostics
} from './types/robotics';
import { INITIAL_JOINT_STATE, KinematicsEngine } from './robotics/kinematics';
import { TrajectoryEngine } from './robotics/trajectory';
import { CollisionEngine, INITIAL_OBSTACLES } from './robotics/collision';
import { ROS2SimAdapter } from './services/ros2Service';

const DEFAULT_IK_DIAGNOSTICS: IKDiagnostics = {
  solverStatus: 'IDLE',
  totalSolutions: 0,
  bestError: 0,
  iterations: 0,
  workspaceViolation: false,
  singularityCondition: false,
  message: 'Enter target pose and click SOLVE IK'
};

const DEFAULT_WORKSPACE_CHECK: WorkspaceCheckResult = {
  status: 'UNCHECKED',
  maxReach: 1.35,
  minReach: 0.10,
  distance: 0,
  xLimitOk: true,
  yLimitOk: true,
  zLimitOk: true,
  message: 'No target set'
};

export function App() {
  const [activeTab, setActiveTab]       = useState<RoboticsTab>('viewport');
  const [jointState, setJointState]     = useState<JointState>(INITIAL_JOINT_STATE);
  const [isEStopped, setIsEStopped]     = useState<boolean>(false);
  const [robotStatus, setRobotStatus]   = useState<'IDLE' | 'MOVING' | 'E-STOPPED' | 'TRAJECTORY_EXECUTION'>('IDLE');
  const [obstacles, setObstacles]       = useState<Obstacle[]>(INITIAL_OBSTACLES);
  const [fps, setFps]                   = useState<number>(60);

  // IK & target state
  const [targetPose, setTargetPose]     = useState<EEPose>({ x: 0.450, y: 0.150, z: 0.550, roll: 0, pitch: 90, yaw: 0 });
  const [ikSolutions, setIkSolutions]   = useState<IKSolution[]>([]);
  const [ikDiagnostics, setIkDiagnostics] = useState<IKDiagnostics>(DEFAULT_IK_DIAGNOSTICS);
  const [selectedSolutionId, setSelectedSolutionId] = useState<number | null>(null);
  const [workspaceCheck, setWorkspaceCheck] = useState<WorkspaceCheckResult>(DEFAULT_WORKSPACE_CHECK);

  // Trajectory state
  const [trajectory, setTrajectory]     = useState<TrajectoryPoint[]>([]);
  const [trajStats, setTrajStats]       = useState<TrajectoryStats | null>(null);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isTrajectoryPlaying, setIsTrajectoryPlaying] = useState(false);
  const [trajectoryStatus, setTrajectoryStatus] = useState<'IDLE' | 'PLAYING' | 'PAUSED' | 'STOPPED' | 'BLOCKED_COLLISION'>('IDLE');
  const [startJoints, setStartJoints]   = useState<JointState>(INITIAL_JOINT_STATE);

  // PID state
  const [pidMode, setPidMode]           = useState<'UNDER_TUNED' | 'NORMAL' | 'OVER_TUNED'>('NORMAL');

  // Animation timer reference
  const animTimerRef = useRef<any>(null);
  const playbackTimerRef = useRef<any>(null);

  // Measure FPS
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    const checkFps = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.min(60, Math.round((frameCount * 1000) / (now - lastTime))));
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(checkFps);
    };
    const animId = requestAnimationFrame(checkFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Compute Forward Kinematics
  const fkResult = useMemo(() => KinematicsEngine.forwardKinematics(jointState), [jointState]);

  // Compute Jacobian & Singularity Metrics
  const jacobianResult = useMemo(() => KinematicsEngine.calculateJacobian(jointState), [jointState]);

  // Compute Collision Risk
  const collisionInfo = useMemo(() => CollisionEngine.checkCollision(jointState, obstacles), [jointState, obstacles]);

  // Compute PID Diagnostics
  const pidDiagnostics: PIDDiagnostics = useMemo(() => {
    const targetForPID = ikSolutions.find(s => s.id === selectedSolutionId)?.joints ?? jointState;
    return ROS2SimAdapter.getPIDDiagnostics(pidMode, jointState, targetForPID);
  }, [jointState, ikSolutions, selectedSolutionId, pidMode]);

  // Compile Live Robot Full State JSON
  const fullState: RobotFullState = useMemo(() => ({
    robot: {
      name: 'Industrial 6-DOF Robot Manipulator',
      dof: 6,
      status: isEStopped ? 'E-STOPPED' : robotStatus,
      mode: 'SIMULATION',
      ros2Mode: 'SIMULATION_MODE'
    },
    joint_states: jointState,
    end_effector: fkResult.eePose,
    forward_kinematics: {
      T06: fkResult.T_all[5] ?? [],
      jointPositions: fkResult.jointPositions
    },
    jacobian: jacobianResult.J,
    manipulability: jacobianResult.manipulability,
    singularity_metric: jacobianResult.detJ,
    condition_number: jacobianResult.conditionNumber,
    singularity_status: jacobianResult.status,
    collision: collisionInfo,
    workspace: workspaceCheck,
    ik_solutions: {
      count: ikSolutions.length,
      solutions: ikSolutions,
      diagnostics: ikDiagnostics
    },
    trajectory: {
      status: trajectoryStatus,
      progress: trajectory.length > 0 ? Math.round((playbackIndex / (trajectory.length - 1)) * 100) : 0,
      currentTime: trajectory[playbackIndex]?.time ?? 0,
      totalTime: trajStats?.duration ?? 3.0,
      stats: trajStats
    },
    pid: pidDiagnostics,
    ros2: {
      connected: false,
      mode: 'SIMULATION_MODE',
      topics: ROS2SimAdapter.TOPICS.map(t => t.name),
      services: ROS2SimAdapter.SERVICES.map(s => s.name),
      actions: ROS2SimAdapter.ACTIONS.map(a => a.name),
      latencyMs: ROS2SimAdapter.getLatencyMs()
    },
    telemetry: {
      fps,
      uptime: ROS2SimAdapter.getUptime(),
      logCount: ROS2SimAdapter.getMessageCount()
    }
  }), [
    jointState, fkResult, jacobianResult, collisionInfo, workspaceCheck,
    isEStopped, robotStatus, ikSolutions, ikDiagnostics,
    trajectory, playbackIndex, trajStats, trajectoryStatus,
    pidDiagnostics, fps
  ]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleJointChange = useCallback((joint: keyof JointState, val: number) => {
    if (isEStopped) return;
    setJointState(prev => ({ ...prev, [joint]: val }));
    setRobotStatus('MOVING');
    setTimeout(() => setRobotStatus('IDLE'), 300);
  }, [isEStopped]);

  const handleSolveIK = useCallback((target: EEPose) => {
    if (isEStopped) return;
    setTargetPose(target);
    const wsResult = KinematicsEngine.validateWorkspace(target);
    setWorkspaceCheck(wsResult);

    if (wsResult.status === 'OUT_OF_WORKSPACE') {
      setIkSolutions([]);
      setIkDiagnostics({
        solverStatus: 'UNREACHABLE',
        totalSolutions: 0,
        bestError: 999,
        iterations: 0,
        workspaceViolation: true,
        singularityCondition: false,
        message: wsResult.message
      });
      ROS2SimAdapter.callSolveIK(target, 0);
      return;
    }

    const { solutions, diagnostics } = KinematicsEngine.solveMultipleIK(target, jointState);
    setIkSolutions(solutions);
    setIkDiagnostics(diagnostics);
    if (solutions.length > 0) setSelectedSolutionId(solutions[0].id);
    ROS2SimAdapter.callSolveIK(target, solutions.length);
    ROS2SimAdapter.callCheckCollision(collisionInfo.status, collisionInfo.minClearance);
  }, [isEStopped, jointState, obstacles, collisionInfo]);

  const handleApplySolution = useCallback((solution: IKSolution) => {
    if (isEStopped) return;
    setSelectedSolutionId(solution.id);
    animateJointTrajectory(jointState, solution.joints, 1.5);
    ROS2SimAdapter.addLog('INFO', 'trajectory_controller', `Applying IK solution #${solution.id}`);
  }, [isEStopped, jointState]);

  const handleMoveToTarget = useCallback((target: EEPose) => {
    if (isEStopped) return;
    const selected = ikSolutions.find(s => s.id === selectedSolutionId);
    if (selected) {
      animateJointTrajectory(jointState, selected.joints, 1.5);
    } else {
      const result = KinematicsEngine.inverseKinematics(target, jointState);
      if (result.success) {
        animateJointTrajectory(jointState, result.solution, 1.5);
      }
    }
  }, [isEStopped, jointState, ikSolutions, selectedSolutionId]);

  const handlePlanPath = useCallback((target: EEPose, durationSec: number = 3.0) => {
    if (isEStopped) return;
    const t0 = performance.now();

    setTargetPose(target);
    const wsResult = KinematicsEngine.validateWorkspace(target);
    setWorkspaceCheck(wsResult);

    if (wsResult.status === 'OUT_OF_WORKSPACE') {
      setTrajectoryStatus('BLOCKED_COLLISION');
      ROS2SimAdapter.addLog('ERROR', 'trajectory_controller', `Path planning FAILED: ${wsResult.message}`);
      return;
    }

    const ikResult = KinematicsEngine.inverseKinematics(target, jointState);
    const targetJoints = ikResult.success ? ikResult.solution : { ...jointState, q1: jointState.q1 + 45 };

    const pts = TrajectoryEngine.generateQuinticTrajectory(jointState, targetJoints, durationSec, 20);
    const validation = TrajectoryEngine.validateTrajectory(pts, obstacles);
    const planningMs = performance.now() - t0;
    const stats = TrajectoryEngine.computePathStats(validation.annotated, planningMs, validation.collisionSegments);

    setStartJoints({ ...jointState });
    setTrajectory(validation.annotated);
    setTrajStats(stats);
    setPlaybackIndex(0);

    ROS2SimAdapter.callPlanPath(validation.safe, stats);

    if (validation.safe) {
      setTrajectoryStatus('IDLE');
    } else {
      setTrajectoryStatus('BLOCKED_COLLISION');
    }
  }, [isEStopped, jointState, obstacles]);

  const animateJointTrajectory = useCallback((start: JointState, target: JointState, durationSec: number) => {
    if (animTimerRef.current) clearInterval(animTimerRef.current);
    const pts = TrajectoryEngine.generateQuinticTrajectory(start, target, durationSec, 20);
    setRobotStatus('TRAJECTORY_EXECUTION');
    ROS2SimAdapter.callStartTrajectory(durationSec, pts.length);
    let idx = 0;
    animTimerRef.current = setInterval(() => {
      if (idx < pts.length) {
        setJointState(pts[idx].joints);
        idx++;
      } else {
        if (animTimerRef.current) clearInterval(animTimerRef.current);
        setRobotStatus('IDLE');
        ROS2SimAdapter.callTrajectoryComplete();
      }
    }, (durationSec * 1000) / pts.length);
  }, []);

  const handlePlayTrajectory = useCallback(() => {
    if (trajectory.length === 0 || trajectoryStatus === 'BLOCKED_COLLISION' || isEStopped) return;
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    setIsTrajectoryPlaying(true);
    setTrajectoryStatus('PLAYING');
    setRobotStatus('TRAJECTORY_EXECUTION');
    ROS2SimAdapter.callStartTrajectory(trajStats?.duration ?? 3, trajectory.length);

    let idx = playbackIndex;
    playbackTimerRef.current = setInterval(() => {
      if (idx < trajectory.length) {
        setJointState(trajectory[idx].joints);
        setPlaybackIndex(idx);
        idx++;
      } else {
        if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
        setIsTrajectoryPlaying(false);
        setTrajectoryStatus('IDLE');
        setRobotStatus('IDLE');
        ROS2SimAdapter.callTrajectoryComplete();
      }
    }, ((trajStats?.duration ?? 3) * 1000) / trajectory.length);
  }, [trajectory, trajectoryStatus, isEStopped, playbackIndex, trajStats]);

  const handlePauseTrajectory = useCallback(() => {
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    setIsTrajectoryPlaying(false);
    setTrajectoryStatus('PAUSED');
    setRobotStatus('IDLE');
    ROS2SimAdapter.addLog('INFO', 'trajectory_controller', 'Trajectory PAUSED');
  }, []);

  const handleStopTrajectory = useCallback(() => {
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    setIsTrajectoryPlaying(false);
    setTrajectoryStatus('STOPPED');
    setRobotStatus('IDLE');
    setPlaybackIndex(0);
    ROS2SimAdapter.addLog('INFO', 'trajectory_controller', 'Trajectory STOPPED and reset');
  }, []);

  const handleScrub = useCallback((idx: number) => {
    if (trajectory[idx]) {
      setJointState(trajectory[idx].joints);
      setPlaybackIndex(idx);
    }
  }, [trajectory]);

  const handleTriggerEStop = useCallback(() => {
    if (animTimerRef.current) clearInterval(animTimerRef.current);
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    setIsEStopped(true);
    setRobotStatus('E-STOPPED');
    setIsTrajectoryPlaying(false);
    setTrajectoryStatus('STOPPED');
    ROS2SimAdapter.callEStop();
  }, []);

  const handleResetEStop = useCallback(() => {
    setIsEStopped(false);
    setRobotStatus('IDLE');
    ROS2SimAdapter.callResetEStop();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#060812] text-gray-100 font-sans selection:bg-blue-600 selection:text-white">

      {/* Full Width Top Header */}
      <Header
        status={isEStopped ? 'E-STOPPED' : robotStatus}
        fps={fps}
        isEStopped={isEStopped}
        onTriggerEStop={handleTriggerEStop}
        onResetEStop={handleResetEStop}
        collisionInfo={collisionInfo}
        manipulability={jacobianResult.manipulability}
      />

      {/* Horizontal Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        {/* Tab 1: 3D Viewport & Dashboard */}
        {activeTab === 'viewport' && (
          <div className="flex flex-col gap-6 animate-fade-in">

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Central 3D Viewport (8 Columns) */}
              <div className="lg:col-span-8 h-full">
                <RobotViewport
                  jointState={jointState}
                  eePose={fkResult.eePose}
                  singularityMetric={jacobianResult.detJ}
                  singularityStatus={jacobianResult.status}
                  collisionInfo={collisionInfo}
                  obstacles={obstacles}
                  fps={fps}
                  trajectory={trajectory}
                  targetPose={targetPose}
                  fkResult={fkResult}
                />
              </div>

              {/* Control Cards Sidebar (4 Columns) */}
              <div className="lg:col-span-4 flex flex-col gap-5">

                {/* Target End-Effector Pose */}
                <CartesianControlCard
                  currentPose={fkResult.eePose}
                  workspaceCheck={workspaceCheck}
                  onSolveIK={handleSolveIK}
                  onMoveToTarget={handleMoveToTarget}
                  onPlanPath={handlePlanPath}
                  disabled={isEStopped}
                />

                {/* Joint State Control */}
                <JointControlCard
                  jointState={jointState}
                  eePose={fkResult.eePose}
                  onChangeJoint={handleJointChange}
                  disabled={isEStopped}
                />

              </div>
            </div>

            {/* IK Solutions Panel (when solutions exist) */}
            {ikSolutions.length > 0 && (
              <IKSolutionsPanel
                solutions={ikSolutions}
                diagnostics={ikDiagnostics}
                selectedId={selectedSolutionId}
                onApplySolution={handleApplySolution}
                onSelectSolution={setSelectedSolutionId}
                disabled={isEStopped}
              />
            )}

            {/* Workflow Panel */}
            <WorkflowPanel
              startJoints={startJoints}
              targetPose={targetPose}
              workspaceCheck={workspaceCheck}
              ikDiagnostics={ikDiagnostics}
              collisionInfo={collisionInfo}
              trajStats={trajStats}
              trajectoryStatus={trajectoryStatus}
              currentEEPose={fkResult.eePose}
            />

            {/* Live JSON State Viewer */}
            <StateJsonViewer
              fullState={fullState}
              onApplyJoints={(newJoints) => setJointState(newJoints)}
            />

          </div>
        )}

        {/* Tab 2: Kinematics (FK / IK) */}
        {activeTab === 'kinematics' && (
          <div className="animate-fade-in">
            <KinematicsTab
              jointState={jointState}
              jacobianResult={jacobianResult}
              fkResult={fkResult}
              ikSolutions={ikSolutions}
              ikDiagnostics={ikDiagnostics}
              workspaceCheck={workspaceCheck}
              targetPose={targetPose}
            />
          </div>
        )}

        {/* Tab 3: Trajectory Planner */}
        {activeTab === 'trajectory' && (
          <div className="animate-fade-in">
            <TrajectoryTab
              currentJoints={jointState}
              startJoints={startJoints}
              trajectory={trajectory}
              trajStats={trajStats}
              trajectoryStatus={trajectoryStatus}
              isPlaying={isTrajectoryPlaying}
              playbackIndex={playbackIndex}
              obstacles={obstacles}
              onGenerateTrajectory={handlePlanPath}
              onPlay={handlePlayTrajectory}
              onPause={handlePauseTrajectory}
              onStop={handleStopTrajectory}
              onScrub={handleScrub}
              onSetTrajectory={(pts, stats) => { setTrajectory(pts); setTrajStats(stats); }}
              disabled={isEStopped}
            />
          </div>
        )}

        {/* Tab 4: Collision Monitor */}
        {activeTab === 'collision' && (
          <div className="animate-fade-in">
            <CollisionTab
              jointState={jointState}
              collisionInfo={collisionInfo}
              obstacles={obstacles}
              onUpdateObstacles={setObstacles}
            />
          </div>
        )}

        {/* Tab 5: ROS 2 & Telemetry */}
        {activeTab === 'telemetry' && (
          <div className="animate-fade-in">
            <TelemetryTab
              jointState={jointState}
              eePose={fkResult.eePose}
              fps={fps}
              robotStatus={isEStopped ? 'E-STOPPED' : robotStatus}
              collisionInfo={collisionInfo}
              trajStats={trajStats}
              trajectoryStatus={trajectoryStatus}
              pidDiagnostics={pidDiagnostics}
              pidMode={pidMode}
              onChangePidMode={setPidMode}
            />
          </div>
        )}

        {/* Tab 6: Architecture & Math */}
        {activeTab === 'architecture' && (
          <div className="animate-fade-in">
            <ArchitectureTab
              fkResult={fkResult}
              jacobianResult={jacobianResult}
              targetPose={targetPose}
            />
          </div>
        )}

      </main>

      {/* Industrial Footer */}
      <footer className="border-t border-[#1c233c] bg-[#04060d] py-3 text-center text-xs text-gray-500 font-mono">
        ROBOTICS PATH PLANNER PRO v2.0 • 6-DOF Manipulator Kinematics, Path Planning & ROS 2 Control Engine •{' '}
        <span className="text-cyan-600">SIMULATION MODE</span>
      </footer>

    </div>
  );
}

export default App;
