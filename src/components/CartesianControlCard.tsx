import React, { useState } from 'react';
import { Target, Zap, Play, RefreshCw, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { EEPose, WorkspaceCheckResult } from '../types/robotics';

interface CartesianControlCardProps {
  currentPose: EEPose;
  workspaceCheck: WorkspaceCheckResult;
  onSolveIK: (target: EEPose) => void;
  onMoveToTarget: (target: EEPose) => void;
  onPlanPath: (target: EEPose, duration?: number) => void;
  disabled?: boolean;
}

export const CartesianControlCard: React.FC<CartesianControlCardProps> = ({
  currentPose,
  workspaceCheck,
  onSolveIK,
  onMoveToTarget,
  onPlanPath,
  disabled = false
}) => {
  const [pose, setPose] = useState<EEPose>({
    x: 0.450, y: 0.150, z: 0.550,
    roll: 0, pitch: 90, yaw: 0
  });
  const [duration, setDuration] = useState(3.0);

  const handleChange = (field: keyof EEPose, val: string) => {
    const num = parseFloat(val);
    setPose(prev => ({ ...prev, [field]: isNaN(num) ? 0 : num }));
  };

  const handleReset = () => {
    setPose({ x: 0.450, y: 0.150, z: 0.550, roll: 0, pitch: 90, yaw: 0 });
  };

  const isReachable = workspaceCheck.status === 'REACHABLE';
  const isChecked   = workspaceCheck.status !== 'UNCHECKED';

  return (
    <div className="glass-panel p-4 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Target End-Effector Pose</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {isChecked && (
            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase flex items-center gap-1 ${
              isReachable
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              {isReachable ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
              {isReachable ? 'REACHABLE' : 'OUT OF WORKSPACE'}
            </span>
          )}
        </div>
      </div>

      {/* Workspace Warning */}
      {isChecked && !isReachable && (
        <div className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-mono">
          ⚠ {workspaceCheck.message}
        </div>
      )}

      {/* Current EE Position badge */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
        <MapPin className="w-3 h-3 text-cyan-600" />
        <span>Current EE: </span>
        <span className="text-cyan-400">X:{currentPose.x} Y:{currentPose.y} Z:{currentPose.z}</span>
      </div>

      {/* Position Inputs X, Y, Z */}
      <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
        {(['x', 'y', 'z'] as const).map(axis => (
          <div key={axis} className="flex flex-col gap-1">
            <label className="text-gray-400 text-[10px] uppercase">{axis} (m)</label>
            <input
              type="number" step="0.05" value={pose[axis]}
              onChange={(e) => handleChange(axis, e.target.value)}
              disabled={disabled}
              className="w-full px-2 py-1.5 rounded-lg bg-[#080b15] border border-white/10 text-blue-300 font-semibold focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>
        ))}
      </div>

      {/* Orientation Inputs Roll, Pitch, Yaw */}
      <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
        {(['roll', 'pitch', 'yaw'] as const).map(axis => (
          <div key={axis} className="flex flex-col gap-1">
            <label className="text-gray-400 text-[10px] uppercase">{axis} (°)</label>
            <input
              type="number" step="5" value={pose[axis]}
              onChange={(e) => handleChange(axis, e.target.value)}
              disabled={disabled}
              className="w-full px-2 py-1.5 rounded-lg bg-[#080b15] border border-white/10 text-cyan-300 font-semibold focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>
        ))}
      </div>

      {/* Duration */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <label className="text-gray-400 text-[10px]">Duration (s):</label>
        <input
          type="number" step="0.5" min="0.5" max="10" value={duration}
          onChange={(e) => setDuration(parseFloat(e.target.value) || 3)}
          disabled={disabled}
          className="w-20 px-2 py-1 rounded-lg bg-[#080b15] border border-white/10 text-amber-300 font-semibold focus:outline-none focus:border-amber-500 text-xs"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={() => onSolveIK(pose)}
          disabled={disabled}
          className="py-2 px-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-[11px] shadow-md shadow-purple-600/30 flex items-center justify-center gap-1 transition-all"
        >
          <Zap className="w-3 h-3" />
          SOLVE IK
        </button>

        <button
          onClick={() => onMoveToTarget(pose)}
          disabled={disabled}
          className="py-2 px-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-[11px] shadow-md shadow-blue-600/30 flex items-center justify-center gap-1 transition-all"
        >
          <Target className="w-3 h-3" />
          MOVE TO TARGET
        </button>

        <button
          onClick={() => onPlanPath(pose, duration)}
          disabled={disabled}
          className="py-2 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-[11px] shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1 transition-all"
        >
          <Play className="w-3 h-3 fill-current" />
          PLAN PATH
        </button>

        <button
          onClick={handleReset}
          disabled={disabled}
          className="py-2 px-2 rounded-xl bg-[#161c2e] hover:bg-[#1f2740] border border-white/10 disabled:opacity-50 text-gray-300 font-semibold text-[11px] flex items-center justify-center gap-1 transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          RESET TARGET
        </button>
      </div>

    </div>
  );
};
