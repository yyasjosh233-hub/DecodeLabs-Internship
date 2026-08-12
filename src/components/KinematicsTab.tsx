import React, { useState } from 'react';
import { Calculator, Layers, FileCode2, Activity, CheckCircle2, OctagonAlert, ChevronDown, ChevronRight } from 'lucide-react';
import type { JointState, EEPose, IKSolution, IKDiagnostics, WorkspaceCheckResult } from '../types/robotics';
import { DH_TABLE, KinematicsEngine } from '../robotics/kinematics';

interface KinematicsTabProps {
  jointState: JointState;
  jacobianResult: {
    J: number[][];
    manipulability: number;
    detJ: number;
    conditionNumber: number;
    status: 'Safe' | 'Warning' | 'Singular';
  };
  fkResult: {
    eePose: EEPose;
    T_all: number[][][];
    jointPositions: [number, number, number][];
  };
  ikSolutions: IKSolution[];
  ikDiagnostics: IKDiagnostics;
  workspaceCheck: WorkspaceCheckResult;
  targetPose: EEPose;
}

const JOINT_NAMES = ['Shoulder Pan', 'Shoulder Lift', 'Elbow', 'Wrist Roll', 'Wrist Pitch', 'Wrist Yaw'];

function Matrix4x4({ mat, label, color = 'text-blue-200' }: { mat: number[][], label: string, color?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-mono text-gray-500">{label}</span>
      <div className={`p-2 rounded-lg bg-[#060812] border border-white/10 font-mono text-[10px] ${color}`}>
        {mat.map((row, ri) => (
          <div key={ri} className="flex gap-3">
            {row.map((v, ci) => (
              <span key={ci} className="w-14 text-right">{v.toFixed(4)}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export const KinematicsTab: React.FC<KinematicsTabProps> = ({
  jointState, jacobianResult, fkResult, ikSolutions: _ikSolutions, ikDiagnostics, workspaceCheck, targetPose
}) => {
  const { eePose, T_all } = fkResult;
  const { J, manipulability, detJ, conditionNumber, status } = jacobianResult;
  const [showAllMatrices, setShowAllMatrices] = useState(false);

  const SE3Target = KinematicsEngine.getSE3Matrix(targetPose);
  const keys: (keyof JointState)[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

  const singularityBadge = status === 'Safe'
    ? { cls: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', label: 'SAFE' }
    : status === 'Warning'
    ? { cls: 'bg-amber-500/10 border-amber-500/40 text-amber-300', label: 'WARNING' }
    : { cls: 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse', label: 'CRITICAL – NEAR SINGULARITY' };

  return (
    <div className="flex flex-col gap-5 font-sans">

      {/* ── Top Summary Banner ───────────────────────────────────────────── */}
      <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-400" />
            DH Kinematics Engine – FK / IK / Jacobian
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time Denavit-Hartenberg Forward Kinematics, Multi-solution IK, Geometric Jacobian, and SE(3) Transformation.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
          <div className="px-3 py-1.5 rounded-lg bg-[#080b15] border border-white/10 text-cyan-300">
            μ: <strong className="text-white">{manipulability}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#080b15] border border-white/10 text-purple-300">
            κ(J): <strong className="text-white">{conditionNumber}</strong>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border font-bold ${singularityBadge.cls}`}>
            {singularityBadge.label}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Forward Kinematics Panel ──────────────────────────────────── */}
        <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-4">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-300 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Forward Kinematics
          </h3>

          {/* Joint Configuration */}
          <div>
            <p className="text-[10px] text-gray-500 font-mono mb-2 uppercase tracking-wide">Joint Configuration</p>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              {keys.map((k, i) => (
                <div key={k} className="px-2.5 py-2 rounded-lg bg-[#060812] border border-white/5">
                  <div className="text-gray-500 text-[9px]">q{i+1} {JOINT_NAMES[i]}</div>
                  <div className="text-amber-300 font-bold text-sm">{jointState[k].toFixed(1)}°</div>
                </div>
              ))}
            </div>
          </div>

          {/* End Effector Output */}
          <div>
            <p className="text-[10px] text-gray-500 font-mono mb-2 uppercase tracking-wide">End Effector Position</p>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              {(['x','y','z'] as const).map(ax => (
                <div key={ax} className="px-2.5 py-2 rounded-lg bg-[#060812] border border-cyan-500/20 text-center">
                  <div className="text-gray-500 text-[9px] uppercase">{ax} (m)</div>
                  <div className="text-cyan-300 font-bold text-sm">{eePose[ax]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Orientation */}
          <div>
            <p className="text-[10px] text-gray-500 font-mono mb-2 uppercase tracking-wide">Orientation (RPY)</p>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              {(['roll','pitch','yaw'] as const).map(ax => (
                <div key={ax} className="px-2.5 py-2 rounded-lg bg-[#060812] border border-purple-500/20 text-center">
                  <div className="text-gray-500 text-[9px] uppercase">{ax}</div>
                  <div className="text-purple-300 font-bold text-sm">{eePose[ax]}°</div>
                </div>
              ))}
            </div>
          </div>

          {/* T06 Matrix */}
          {T_all.length > 5 && (
            <Matrix4x4 mat={T_all[5]} label="T₀⁶ – Homogeneous Transformation Matrix" color="text-blue-200" />
          )}

          {/* Intermediate matrices accordion */}
          <button
            onClick={() => setShowAllMatrices(!showAllMatrices)}
            className="flex items-center gap-2 text-[10px] font-mono text-gray-400 hover:text-white transition-all"
          >
            {showAllMatrices ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {showAllMatrices ? 'Hide' : 'Show'} intermediate T₀ⁱ matrices (T₀¹ … T₀⁵)
          </button>
          {showAllMatrices && (
            <div className="flex flex-col gap-3">
              {T_all.slice(0, 5).map((T, i) => (
                <Matrix4x4 key={i} mat={T} label={`T₀${i+1}`} color="text-indigo-200" />
              ))}
            </div>
          )}
        </div>

        {/* ── DH Table + Jacobian ───────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* DH Parameter Table */}
          <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-300">DH Parameter Table</h3>
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#080b15]">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0f1424] text-gray-400 text-[10px] uppercase">
                    <th className="py-2 px-3">Joint</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">θᵢ (°)</th>
                    <th className="py-2 px-3">dᵢ (m)</th>
                    <th className="py-2 px-3">aᵢ (m)</th>
                    <th className="py-2 px-3">αᵢ (°)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {DH_TABLE.map((row, idx) => {
                    const qKey = `q${idx + 1}` as keyof JointState;
                    return (
                      <tr key={row.joint} className="hover:bg-white/[0.02]">
                        <td className="py-2 px-3 font-semibold text-blue-400">J{row.joint}</td>
                        <td className="py-2 px-3 text-gray-400">{row.name}</td>
                        <td className="py-2 px-3 font-bold text-amber-300">{jointState[qKey].toFixed(1)}°</td>
                        <td className="py-2 px-3">{row.d}</td>
                        <td className="py-2 px-3">{row.a}</td>
                        <td className="py-2 px-3">{row.alpha}°</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Jacobian Matrix */}
          <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">
                Geometric Jacobian J (6×6)
              </h3>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-gray-500">det(J):</span>
                <span className={`font-bold ${status === 'Safe' ? 'text-emerald-400' : status === 'Warning' ? 'text-amber-300' : 'text-rose-400'}`}>
                  {detJ}
                </span>
                <span className={`px-2 py-0.5 rounded border font-bold text-[9px] ${singularityBadge.cls}`}>
                  {singularityBadge.label}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#060812] border border-white/10 overflow-x-auto font-mono text-[10px] leading-relaxed text-cyan-200">
              <pre>
                {J.map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-2">
                    <span className="text-gray-600 w-5 select-none">{rIdx < 3 ? 'v' : 'ω'}{rIdx+1}:</span>
                    <span>[{row.map(v => (v >= 0 ? '+' : '') + v.toFixed(4)).join(', ')}]</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>

        </div>
      </div>

      {/* ── SE(3) / Workspace / IK Diagnostics Row ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* SE(3) Target */}
        <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-3">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
            <Layers className="w-4 h-4" /> SE(3) Target Pose T_target
          </h3>
          <div className="font-mono text-[10px] text-gray-400 space-y-1">
            <div>Target: [{targetPose.x}, {targetPose.y}, {targetPose.z}]m</div>
            <div>RPY: [{targetPose.roll}°, {targetPose.pitch}°, {targetPose.yaw}°]</div>
          </div>
          <Matrix4x4 mat={SE3Target} label="T_target ∈ SE(3)" color="text-indigo-200" />
        </div>

        {/* Workspace Validation */}
        <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-3">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-300">
            Workspace Validation
          </h3>
          <div className={`px-3 py-2 rounded-lg border font-mono text-xs font-bold flex items-center gap-2 ${
            workspaceCheck.status === 'REACHABLE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : workspaceCheck.status === 'OUT_OF_WORKSPACE' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            : 'bg-gray-500/10 border-gray-500/30 text-gray-400'
          }`}>
            {workspaceCheck.status === 'REACHABLE' && <CheckCircle2 className="w-4 h-4" />}
            {workspaceCheck.status === 'OUT_OF_WORKSPACE' && <OctagonAlert className="w-4 h-4" />}
            {workspaceCheck.status}
          </div>
          <div className="font-mono text-[10px] space-y-1.5">
            {[
              { l: 'Distance',  v: `${workspaceCheck.distance}m`, ok: workspaceCheck.distance <= workspaceCheck.maxReach },
              { l: 'Max Reach', v: `${workspaceCheck.maxReach}m`, ok: true },
              { l: 'X limit',   v: workspaceCheck.xLimitOk ? 'OK' : 'VIOLATED', ok: workspaceCheck.xLimitOk },
              { l: 'Y limit',   v: workspaceCheck.yLimitOk ? 'OK' : 'VIOLATED', ok: workspaceCheck.yLimitOk },
              { l: 'Z limit',   v: workspaceCheck.zLimitOk ? 'OK' : 'VIOLATED', ok: workspaceCheck.zLimitOk },
            ].map(({ l, v, ok }) => (
              <div key={l} className="flex items-center justify-between">
                <span className="text-gray-500">{l}</span>
                <span className={ok ? 'text-emerald-400' : 'text-rose-400'}>{v}</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] font-mono text-gray-500 italic">{workspaceCheck.message}</div>
        </div>

        {/* IK Solver Diagnostics */}
        <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-3">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-2">
            <FileCode2 className="w-4 h-4" /> IK Solver Diagnostics
          </h3>
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
            ikDiagnostics.solverStatus === 'SUCCESS' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : ikDiagnostics.solverStatus === 'IDLE'  ? 'bg-gray-500/10 border-gray-500/30 text-gray-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            Solver: {ikDiagnostics.solverStatus}
          </div>
          <div className="font-mono text-[10px] space-y-1.5">
            {[
              { l: 'Solutions',    v: ikDiagnostics.totalSolutions },
              { l: 'Iterations',   v: ikDiagnostics.iterations },
              { l: 'Best Error',   v: `${ikDiagnostics.bestError.toFixed(4)}m` },
              { l: 'WS Violation', v: ikDiagnostics.workspaceViolation ? 'YES' : 'NO',
                ok: !ikDiagnostics.workspaceViolation },
              { l: 'Singularity',  v: ikDiagnostics.singularityCondition ? 'DETECTED' : 'CLEAR',
                ok: !ikDiagnostics.singularityCondition },
            ].map(({ l, v, ok }) => (
              <div key={l} className="flex items-center justify-between">
                <span className="text-gray-500">{l}</span>
                <span className={ok === undefined ? 'text-white' : ok ? 'text-emerald-400' : 'text-amber-400'}>{String(v)}</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] font-mono text-gray-500 italic leading-relaxed">{ikDiagnostics.message}</div>
        </div>

      </div>
    </div>
  );
};
