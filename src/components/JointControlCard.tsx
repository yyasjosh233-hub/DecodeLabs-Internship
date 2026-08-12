import React from 'react';
import { Sliders } from 'lucide-react';
import type { JointState, EEPose } from '../types/robotics';
import { DEFAULT_JOINT_LIMITS } from '../robotics/kinematics';

interface JointControlCardProps {
  jointState: JointState;
  eePose: EEPose;
  onChangeJoint: (joint: keyof JointState, val: number) => void;
  disabled?: boolean;
}

const JOINT_NAMES: Record<keyof JointState, string> = {
  q1: 'Shoulder Pan',
  q2: 'Shoulder Lift',
  q3: 'Elbow',
  q4: 'Wrist Roll',
  q5: 'Wrist Pitch',
  q6: 'Wrist Yaw'
};

const JOINT_COLORS: Record<keyof JointState, string> = {
  q1: 'accent-blue-500',
  q2: 'accent-indigo-400',
  q3: 'accent-violet-400',
  q4: 'accent-purple-400',
  q5: 'accent-fuchsia-400',
  q6: 'accent-pink-400'
};

export const JointControlCard: React.FC<JointControlCardProps> = ({
  jointState,
  eePose,
  onChangeJoint,
  disabled = false
}) => {
  const keys: (keyof JointState)[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

  return (
    <div className="glass-panel p-4 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Joint State Control</h2>
        </div>
        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
          FORWARD KINEMATICS
        </span>
      </div>

      {/* EE Position Live */}
      <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
        {(['x', 'y', 'z'] as const).map(ax => (
          <div key={ax} className="px-2 py-1 rounded-lg bg-[#080b15] border border-white/5 text-center">
            <div className="text-gray-500 uppercase">{ax}</div>
            <div className="text-cyan-400 font-bold">{eePose[ax]}m</div>
          </div>
        ))}
      </div>

      {/* Joint Sliders */}
      <div className="space-y-2.5 font-mono text-xs">
        {keys.map((key) => {
          const lim = DEFAULT_JOINT_LIMITS[key];
          const val = jointState[key];

          return (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-semibold text-[11px]">
                  {key} <span className="text-gray-500">({JOINT_NAMES[key]})</span>
                </span>
                <span className="text-blue-400 font-bold text-[11px]">{val.toFixed(1)}°</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-gray-600 w-8 text-right">{lim.min}°</span>
                <input
                  type="range"
                  min={lim.min} max={lim.max} step="0.5"
                  value={val}
                  onChange={(e) => onChangeJoint(key, parseFloat(e.target.value))}
                  disabled={disabled}
                  className={`flex-1 h-1.5 bg-[#121727] rounded-lg appearance-none cursor-pointer ${JOINT_COLORS[key]} disabled:opacity-50`}
                />
                <span className="text-[9px] text-gray-600 w-8">{lim.max}°</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
