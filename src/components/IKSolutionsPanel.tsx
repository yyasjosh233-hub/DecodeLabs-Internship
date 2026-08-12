import React from 'react';
import { Zap, CheckCircle2, AlertTriangle, OctagonAlert, ChevronRight } from 'lucide-react';
import type { IKSolution, IKDiagnostics } from '../types/robotics';

interface IKSolutionsPanelProps {
  solutions: IKSolution[];
  diagnostics: IKDiagnostics;
  selectedId: number | null;
  onApplySolution: (solution: IKSolution) => void;
  onSelectSolution: (id: number) => void;
  disabled?: boolean;
}

export const IKSolutionsPanel: React.FC<IKSolutionsPanelProps> = ({
  solutions,
  diagnostics,
  selectedId,
  onApplySolution,
  onSelectSolution,
  disabled = false
}) => {
  return (
    <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-4 font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">IK Solutions</h2>
          <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
            diagnostics.solverStatus === 'SUCCESS'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : diagnostics.solverStatus === 'UNREACHABLE'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {diagnostics.solverStatus}
          </span>
        </div>

        {/* Diagnostics badges */}
        <div className="flex items-center gap-2 font-mono text-[10px] flex-wrap">
          <span className="px-2 py-1 rounded-lg bg-[#080b15] border border-white/10 text-gray-400">
            Solutions: <span className="text-white font-bold">{diagnostics.totalSolutions}</span>
          </span>
          <span className="px-2 py-1 rounded-lg bg-[#080b15] border border-white/10 text-gray-400">
            Iterations: <span className="text-amber-300 font-bold">{diagnostics.iterations}</span>
          </span>
          <span className="px-2 py-1 rounded-lg bg-[#080b15] border border-white/10 text-gray-400">
            Best Error: <span className="text-cyan-300 font-bold">{diagnostics.bestError.toFixed(4)}m</span>
          </span>
          {diagnostics.workspaceViolation && (
            <span className="px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold">
              ⚠ OUT OF WORKSPACE
            </span>
          )}
          {diagnostics.singularityCondition && (
            <span className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
              ⚠ NEAR SINGULARITY
            </span>
          )}
        </div>
      </div>

      {/* Solver Message */}
      <div className={`px-3 py-2 rounded-lg text-[10px] font-mono border ${
        diagnostics.solverStatus === 'SUCCESS'
          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
          : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
      }`}>
        {diagnostics.message}
      </div>

      {/* Solution Grid */}
      {solutions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
          {solutions.map((sol) => (
            <div
              key={sol.id}
              onClick={() => onSelectSolution(sol.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedId === sol.id
                  ? 'border-purple-500/60 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                  : 'border-white/10 bg-[#080b15] hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              {/* Solution Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-purple-300">Solution #{sol.id}</span>
                <div className="flex items-center gap-1">
                  {sol.valid
                    ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    : <AlertTriangle className="w-3 h-3 text-amber-400" />
                  }
                  {sol.collisionStatus === 'CLEAR'
                    ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    : sol.collisionStatus === 'WARNING'
                    ? <AlertTriangle className="w-3 h-3 text-amber-400" />
                    : <OctagonAlert className="w-3 h-3 text-rose-400" />
                  }
                </div>
              </div>

              {/* Joint Values */}
              <div className="grid grid-cols-3 gap-1 font-mono text-[10px] mb-2">
                {(['q1','q2','q3','q4','q5','q6'] as const).map((k, i) => (
                  <div key={k} className="flex flex-col">
                    <span className="text-gray-600">q{i+1}</span>
                    <span className="text-amber-300 font-bold">{sol.joints[k].toFixed(1)}°</span>
                  </div>
                ))}
              </div>

              {/* EE Position */}
              <div className="text-[9px] font-mono text-gray-500 mb-1">
                EE: [{sol.eePose.x}, {sol.eePose.y}, {sol.eePose.z}]m
              </div>

              {/* Error metrics */}
              <div className="flex gap-2 text-[9px] font-mono mb-2">
                <span className={`${sol.positionError < 0.01 ? 'text-emerald-400' : 'text-amber-300'}`}>
                  pos: {sol.positionError.toFixed(4)}m
                </span>
                <span className="text-gray-500">
                  orient: {sol.orientationError.toFixed(1)}°
                </span>
              </div>

              {/* Status chips */}
              <div className="flex gap-1 flex-wrap mb-2">
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                  sol.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {sol.valid ? 'VALID' : 'INVALID'}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                  sol.jointLimitsOk ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  LIMITS {sol.jointLimitsOk ? 'OK' : 'VIOLATED'}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                  sol.collisionStatus === 'CLEAR'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : sol.collisionStatus === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {sol.collisionStatus}
                </span>
              </div>

              {/* Apply Button */}
              <button
                onClick={(e) => { e.stopPropagation(); onApplySolution(sol); }}
                disabled={disabled || sol.collisionStatus === 'COLLISION'}
                className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-[10px] font-mono flex items-center justify-center gap-1 transition-all"
              >
                <ChevronRight className="w-3 h-3" />
                APPLY SOLUTION
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
