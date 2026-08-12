import React from 'react';
import { Bot, Cpu, Activity, AlertOctagon, RotateCcw, CheckCircle2, AlertTriangle, OctagonAlert } from 'lucide-react';
import type { CollisionInfo } from '../types/robotics';

interface HeaderProps {
  status: 'IDLE' | 'MOVING' | 'E-STOPPED' | 'TRAJECTORY_EXECUTION';
  fps: number;
  isEStopped: boolean;
  onTriggerEStop: () => void;
  onResetEStop: () => void;
  collisionInfo?: CollisionInfo;
  manipulability?: number;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  fps,
  isEStopped,
  onTriggerEStop,
  onResetEStop,
  collisionInfo,
  manipulability
}) => {
  return (
    <header className="border-b border-[#1c233c] bg-[#070913]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">

        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-600/30 border border-blue-400/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight font-sans">
                ROBOTICS PATH PLANNER
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded font-mono uppercase tracking-wider">
                PRO v2
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 rounded font-mono uppercase">
                SIMULATION
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono">
              6-DOF Manipulator • FK/IK • Jacobian • Trajectory • ROS 2 Sim
            </p>
          </div>
        </div>

        {/* Right Telemetry Badges */}
        <div className="flex items-center gap-2 font-mono text-xs flex-wrap justify-end">

          {/* Collision Badge */}
          {collisionInfo && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
              collisionInfo.status === 'CLEAR'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : collisionInfo.status === 'WARNING'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 animate-pulse'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
            }`}>
              {collisionInfo.status === 'CLEAR' && <CheckCircle2 className="w-3 h-3" />}
              {collisionInfo.status === 'WARNING' && <AlertTriangle className="w-3 h-3" />}
              {collisionInfo.status === 'COLLISION' && <OctagonAlert className="w-3 h-3" />}
              <span>{collisionInfo.status}</span>
            </div>
          )}

          {/* Manipulability Badge */}
          {manipulability !== undefined && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px]">
              <span>μ: {manipulability.toFixed(3)}</span>
            </div>
          )}

          {/* Physics FPS Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px]">
            <Cpu className="w-3 h-3 text-blue-400" />
            <span>{fps} FPS</span>
          </div>

          {/* State Badge */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
            isEStopped
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
              : status === 'MOVING' || status === 'TRAJECTORY_EXECUTION'
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
          }`}>
            <Activity className="w-3 h-3" />
            <span>{status}</span>
          </div>

          {/* E-STOP / Reset */}
          {isEStopped ? (
            <button
              onClick={onResetEStop}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RELEASE E-STOP
            </button>
          ) : (
            <button
              onClick={onTriggerEStop}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-xl shadow-rose-600/40 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <AlertOctagon className="w-3.5 h-3.5 fill-current" />
              E-STOP
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
