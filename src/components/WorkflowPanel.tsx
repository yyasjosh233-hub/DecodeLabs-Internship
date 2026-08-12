import React from 'react';
import { ArrowRight, CheckCircle2, OctagonAlert, TrendingUp } from 'lucide-react';
import type { JointState, EEPose, WorkspaceCheckResult, IKDiagnostics, CollisionInfo, TrajectoryStats } from '../types/robotics';

interface WorkflowPanelProps {
  startJoints: JointState;
  targetPose: EEPose;
  workspaceCheck: WorkspaceCheckResult;
  ikDiagnostics: IKDiagnostics;
  collisionInfo: CollisionInfo;
  trajStats: TrajectoryStats | null;
  trajectoryStatus: 'IDLE' | 'PLAYING' | 'PAUSED' | 'STOPPED' | 'BLOCKED_COLLISION';
  currentEEPose: EEPose;
}

type StepStatus = 'done' | 'active' | 'blocked' | 'pending';

function StepBadge({ status }: { status: StepStatus }) {
  if (status === 'done') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (status === 'active') return <div className="w-4 h-4 rounded-full border-2 border-cyan-400 animate-pulse bg-cyan-400/20" />;
  if (status === 'blocked') return <OctagonAlert className="w-4 h-4 text-rose-400" />;
  return <div className="w-4 h-4 rounded-full border border-gray-600 bg-gray-800/60" />;
}

export const WorkflowPanel: React.FC<WorkflowPanelProps> = ({
  startJoints,
  targetPose,
  workspaceCheck,
  ikDiagnostics,
  collisionInfo,
  trajStats,
  trajectoryStatus,
  currentEEPose
}) => {
  // Determine step statuses
  const hasTrajStats = trajStats !== null;
  const isPlaying = trajectoryStatus === 'PLAYING';
  const isComplete = trajectoryStatus === 'IDLE' && hasTrajStats;
  const isBlocked = trajectoryStatus === 'BLOCKED_COLLISION';
  const wsOk = workspaceCheck.status === 'REACHABLE';
  const ikOk = ikDiagnostics.solverStatus === 'SUCCESS';

  const steps: { label: string; sub: string; status: StepStatus }[] = [
    {
      label: 'POINT A',
      sub: `Start: [${Object.values(startJoints).map(v=>v.toFixed(0)).join(',')}]°`,
      status: 'done'
    },
    {
      label: 'TARGET B',
      sub: `[${targetPose.x}, ${targetPose.y}, ${targetPose.z}]m`,
      status: workspaceCheck.status !== 'UNCHECKED' ? (wsOk ? 'done' : 'blocked') : 'pending'
    },
    {
      label: 'WORKSPACE',
      sub: workspaceCheck.status === 'UNCHECKED' ? 'Not checked' : workspaceCheck.status,
      status: workspaceCheck.status === 'UNCHECKED' ? 'pending' : (wsOk ? 'done' : 'blocked')
    },
    {
      label: 'IK SOLVER',
      sub: ikDiagnostics.solverStatus === 'IDLE' ? 'Waiting...' : `${ikDiagnostics.totalSolutions} solutions`,
      status: ikDiagnostics.solverStatus === 'IDLE' ? 'pending' : (ikOk ? 'done' : 'blocked')
    },
    {
      label: 'COLLISION',
      sub: `${collisionInfo.status} (${collisionInfo.minClearance}m)`,
      status: collisionInfo.status === 'COLLISION' ? 'blocked' : (collisionInfo.status === 'WARNING' ? 'active' : (hasTrajStats ? 'done' : 'pending'))
    },
    {
      label: 'TRAJECTORY',
      sub: hasTrajStats ? `${trajStats.pathLength.toFixed(3)}m, ${trajStats.duration.toFixed(1)}s` : 'Not planned',
      status: isBlocked ? 'blocked' : hasTrajStats ? 'done' : 'pending'
    },
    {
      label: 'EXECUTION',
      sub: isPlaying ? 'PLAYING...' : trajectoryStatus === 'STOPPED' ? 'STOPPED' : (isComplete ? 'COMPLETE' : 'READY'),
      status: isPlaying ? 'active' : (isComplete && hasTrajStats ? 'done' : 'pending')
    },
    {
      label: 'POINT B',
      sub: `EE: [${currentEEPose.x}, ${currentEEPose.y}, ${currentEEPose.z}]m`,
      status: isComplete && hasTrajStats && trajStats?.collisionFree ? 'done' : 'pending'
    }
  ];

  return (
    <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-4 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Point A → B Planning Workflow</h2>
        </div>
      </div>

      {/* Step Pipeline */}
      <div className="flex items-start flex-wrap gap-2">
        {steps.map((step, idx) => (
          <React.Fragment key={step.label}>
            <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border min-w-[90px] text-center transition-all ${
              step.status === 'done'    ? 'border-emerald-500/30 bg-emerald-500/5' :
              step.status === 'active' ? 'border-cyan-500/40 bg-cyan-500/10 shadow-lg shadow-cyan-500/10' :
              step.status === 'blocked'? 'border-rose-500/30 bg-rose-500/5' :
              'border-white/10 bg-white/[0.02]'
            }`}>
              <StepBadge status={step.status} />
              <span className={`text-[10px] font-mono font-bold mt-0.5 ${
                step.status === 'done'    ? 'text-emerald-400' :
                step.status === 'active' ? 'text-cyan-400' :
                step.status === 'blocked'? 'text-rose-400' :
                'text-gray-500'
              }`}>{step.label}</span>
              <span className="text-[8px] text-gray-600 leading-tight max-w-[80px]">{step.sub}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex items-center self-center mt-0">
                <ArrowRight className={`w-3 h-3 ${
                  steps[idx].status === 'done' ? 'text-emerald-600' : 'text-gray-700'
                }`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Stats Row */}
      {hasTrajStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 font-mono text-[10px]">
          {[
            { label: 'Path Length', value: `${trajStats.pathLength.toFixed(3)}m`, color: 'text-cyan-400' },
            { label: 'Duration',    value: `${trajStats.duration.toFixed(2)}s`,    color: 'text-blue-400' },
            { label: 'Max Vel',     value: `${trajStats.maxVelocity.toFixed(1)}°/s`, color: 'text-amber-400' },
            { label: 'Max Acc',     value: `${trajStats.maxAcceleration.toFixed(1)}°/s²`, color: 'text-orange-400' },
            { label: 'Points',      value: trajStats.totalPoints,                  color: 'text-purple-400' },
            { label: 'Plan Time',   value: `${trajStats.planningTimeMs.toFixed(0)}ms`, color: 'text-indigo-400' },
            { label: 'Collision',   value: trajStats.collisionFree ? 'FREE ✓' : `${trajStats.collisionSegments} hits ✗`,
              color: trajStats.collisionFree ? 'text-emerald-400' : 'text-rose-400' }
          ].map(({ label, value, color }) => (
            <div key={label} className="px-2 py-1.5 rounded-lg bg-[#080b15] border border-white/5 text-center">
              <div className="text-gray-600">{label}</div>
              <div className={`${color} font-bold`}>{value}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
