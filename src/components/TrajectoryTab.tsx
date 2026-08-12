import React, { useState } from 'react';
import { TrendingUp, Play, Pause, Square, Download, Copy, Check, OctagonAlert, CheckCircle2 } from 'lucide-react';
import type { JointState, EEPose, TrajectoryPoint, TrajectoryStats, Obstacle } from '../types/robotics';
import { TrajectoryEngine } from '../robotics/trajectory';

interface TrajectoryTabProps {
  currentJoints: JointState;
  startJoints: JointState;
  trajectory: TrajectoryPoint[];
  trajStats: TrajectoryStats | null;
  trajectoryStatus: 'IDLE' | 'PLAYING' | 'PAUSED' | 'STOPPED' | 'BLOCKED_COLLISION';
  isPlaying: boolean;
  playbackIndex: number;
  obstacles: Obstacle[];
  onGenerateTrajectory: (target: EEPose, duration?: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onScrub: (idx: number) => void;
  onSetTrajectory: (pts: TrajectoryPoint[], stats: TrajectoryStats) => void;
  disabled?: boolean;
}

function MiniGraph({ data, color, label, unit }: { data: number[], color: string, label: string, unit: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 200, H = 60;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-mono text-gray-500">{label}</span>
      <svg width={W} height={H} className="rounded bg-[#060812] border border-white/10 overflow-hidden" viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${H} ${pts} ${W},${H}`} fill={`url(#grad-${label})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <text x="3" y="10" fill={color} fontSize="8" fontFamily="monospace">{max.toFixed(1)}{unit}</text>
        <text x="3" y={H - 2} fill={color} fontSize="8" fontFamily="monospace">{min.toFixed(1)}{unit}</text>
      </svg>
    </div>
  );
}

export const TrajectoryTab: React.FC<TrajectoryTabProps> = ({
  currentJoints, startJoints: _startJoints, trajectory, trajStats, trajectoryStatus,
  isPlaying, playbackIndex, obstacles,
  onPlay, onPause, onStop, onScrub, onSetTrajectory, disabled = false
}) => {
  const [targetJoints, setTargetJoints] = useState<JointState>({ q1: 45, q2: 15, q3: -30, q4: 90, q5: -45, q6: 180 });
  const [duration, setDuration] = useState(3.0);
  const [speedMult, setSpeedMult] = useState(1.0);
  const [selectedJoint, setSelectedJoint] = useState(0); // which joint to graph
  const [copied, setCopied] = useState(false);

  const handleGenerateLocal = () => {
    const t0 = performance.now();
    const pts = TrajectoryEngine.generateQuinticTrajectory(currentJoints, targetJoints, duration, 20);
    const validation = TrajectoryEngine.validateTrajectory(pts, obstacles);
    const stats = TrajectoryEngine.computePathStats(validation.annotated, performance.now() - t0, validation.collisionSegments);
    onSetTrajectory(validation.annotated, stats);
  };

  const handleDownloadJSON = () => {
    if (trajectory.length === 0) return;
    const json = TrajectoryEngine.toFollowJointTrajectoryJSON(trajectory);
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trajectory_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = () => {
    if (trajectory.length === 0) return;
    const json = TrajectoryEngine.toFollowJointTrajectoryJSON(trajectory);
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract data for graphs
  const jointKeys: (keyof JointState)[] = ['q1','q2','q3','q4','q5','q6'];
  const posData = trajectory.map(pt => pt.joints[jointKeys[selectedJoint]]);
  const velData = trajectory.map(pt => pt.velocity[selectedJoint]);
  const accData = trajectory.map(pt => pt.acceleration[selectedJoint]);

  const isBlocked = trajectoryStatus === 'BLOCKED_COLLISION';

  return (
    <div className="flex flex-col gap-5 font-sans">

      {/* Header */}
      <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Quintic Polynomial Trajectory Planner
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            5th-order polynomial motion profile with zero boundary conditions. Full collision validation per segment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {trajStats && (
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${
              trajStats.collisionFree
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
            }`}>
              {trajStats.collisionFree ? <CheckCircle2 className="w-3.5 h-3.5" /> : <OctagonAlert className="w-3.5 h-3.5" />}
              {trajStats.collisionFree ? 'COLLISION FREE' : `${trajStats.collisionSegments} COLLISION(S)`}
            </div>
          )}
        </div>
      </div>

      {/* Collision Blocked Banner */}
      {isBlocked && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 flex items-center gap-3 font-mono text-sm text-rose-400 animate-pulse">
          <OctagonAlert className="w-6 h-6 shrink-0" />
          <div>
            <div className="font-bold">TRAJECTORY BLOCKED – COLLISION DETECTED</div>
            <div className="text-xs text-rose-500/80 mt-0.5">
              This trajectory cannot be executed. Adjust target pose, modify obstacles, or re-plan with a different configuration.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Controls */}
        <div className="lg:col-span-1 flex flex-col gap-4">

          {/* Target Joint Config */}
          <div className="glass-panel p-4 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">Target Joint Configuration</h3>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              {jointKeys.map((k, i) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <label className="text-gray-500 text-[9px]">q{i+1} (°)</label>
                  <input
                    type="number" step="5" value={targetJoints[k]}
                    onChange={(e) => setTargetJoints(prev => ({ ...prev, [k]: parseFloat(e.target.value) || 0 }))}
                    disabled={disabled}
                    className="px-2 py-1.5 rounded-lg bg-[#060812] border border-white/10 text-amber-300 font-bold focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              ))}
            </div>

            {/* Duration + Speed */}
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="flex flex-col gap-0.5">
                <label className="text-gray-500 text-[9px]">Duration (s)</label>
                <input type="number" step="0.5" min="0.5" max="15" value={duration}
                  onChange={(e) => setDuration(parseFloat(e.target.value) || 3)}
                  disabled={disabled}
                  className="px-2 py-1.5 rounded-lg bg-[#060812] border border-white/10 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500 text-xs" />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-gray-500 text-[9px]">Speed ×</label>
                <input type="number" step="0.25" min="0.25" max="4" value={speedMult}
                  onChange={(e) => setSpeedMult(parseFloat(e.target.value) || 1)}
                  disabled={disabled}
                  className="px-2 py-1.5 rounded-lg bg-[#060812] border border-white/10 text-green-300 font-bold focus:outline-none focus:border-green-500 text-xs" />
              </div>
            </div>

            <button onClick={handleGenerateLocal} disabled={disabled}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/30 transition-all">
              GENERATE TRAJECTORY
            </button>
          </div>

          {/* Playback Controls */}
          <div className="glass-panel p-4 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">Playback</h3>
              <span className="font-mono text-[10px] text-gray-500">
                {trajectory.length} pts · {trajStats?.duration.toFixed(1) ?? 0}s
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!isPlaying ? (
                <button onClick={onPlay} disabled={disabled || isBlocked || trajectory.length === 0}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30">
                  <Play className="w-3.5 h-3.5 fill-current" /> PLAY
                </button>
              ) : (
                <button onClick={onPause} disabled={disabled}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5">
                  <Pause className="w-3.5 h-3.5 fill-current" /> PAUSE
                </button>
              )}
              <button onClick={onStop} disabled={disabled || trajectory.length === 0}
                className="py-2 px-3 bg-[#161c2e] hover:bg-rose-900/50 border border-white/10 disabled:opacity-40 text-gray-300 hover:text-rose-400 rounded-lg text-xs flex items-center gap-1">
                <Square className="w-3.5 h-3.5 fill-current" /> STOP
              </button>
            </div>

            {/* Scrubber */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[9px] font-mono text-gray-500">
                <span>0.00s</span>
                <span className="text-cyan-400">{trajectory[playbackIndex]?.time.toFixed(2) ?? '0.00'}s</span>
                <span>{trajStats?.duration.toFixed(2) ?? '0.00'}s</span>
              </div>
              <input
                type="range" min="0" max={Math.max(0, trajectory.length - 1)}
                value={playbackIndex}
                onChange={(e) => onScrub(parseInt(e.target.value))}
                disabled={disabled || trajectory.length === 0}
                className="w-full h-2 bg-[#121727] rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-50"
              />
            </div>

            {/* Export */}
            {trajectory.length > 0 && (
              <div className="flex gap-2">
                <button onClick={handleCopyJSON}
                  className="flex-1 py-1.5 rounded-lg bg-[#161c2e] hover:bg-[#1f2740] border border-white/10 text-gray-300 text-[10px] font-mono flex items-center justify-center gap-1">
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  COPY JSON
                </button>
                <button onClick={handleDownloadJSON}
                  className="flex-1 py-1.5 rounded-lg bg-[#161c2e] hover:bg-[#1f2740] border border-white/10 text-gray-300 text-[10px] font-mono flex items-center justify-center gap-1">
                  <Download className="w-3 h-3" /> DOWNLOAD
                </button>
              </div>
            )}
          </div>

          {/* Path Stats */}
          {trajStats && (
            <div className="glass-panel p-4 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-2 font-mono text-[10px]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-300">Path Statistics</h3>
              {[
                { l: 'Path Length',  v: `${trajStats.pathLength.toFixed(4)}m`,        c: 'text-cyan-400' },
                { l: 'Duration',     v: `${trajStats.duration.toFixed(3)}s`,           c: 'text-blue-400' },
                { l: 'Max Velocity', v: `${trajStats.maxVelocity.toFixed(2)}°/s`,      c: 'text-amber-400' },
                { l: 'Max Accel',    v: `${trajStats.maxAcceleration.toFixed(2)}°/s²`, c: 'text-orange-400' },
                { l: 'Points',       v: trajStats.totalPoints,                          c: 'text-purple-400' },
                { l: 'Plan Time',    v: `${trajStats.planningTimeMs.toFixed(1)}ms`,    c: 'text-indigo-400' },
              ].map(({ l, v, c }) => (
                <div key={l} className="flex justify-between">
                  <span className="text-gray-500">{l}</span>
                  <span className={`${c} font-bold`}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Graphs + Table */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Joint Selector + Graphs */}
          {trajectory.length > 0 && (
            <div className="glass-panel p-4 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-300">
                  Joint Trajectory Graphs
                </h3>
                <select
                  value={selectedJoint}
                  onChange={(e) => setSelectedJoint(parseInt(e.target.value))}
                  className="px-2 py-1 rounded-lg bg-[#080b15] border border-white/10 text-gray-300 text-xs font-mono focus:outline-none"
                >
                  {jointKeys.map((k, i) => (
                    <option key={k} value={i}>q{i+1} ({['Shoulder Pan','Shoulder Lift','Elbow','Wrist Roll','Wrist Pitch','Wrist Yaw'][i]})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniGraph data={posData} color="#60a5fa" label="Position (°)" unit="°" />
                <MiniGraph data={velData} color="#34d399" label="Velocity (°/s)" unit="°/s" />
                <MiniGraph data={accData} color="#f59e0b" label="Acceleration (°/s²)" unit="°/s²" />
              </div>
            </div>
          )}

          {/* Trajectory Points Table */}
          {trajectory.length > 0 && (
            <div className="glass-panel p-4 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-3">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-300">
                Sampled Trajectory Points ({trajectory.length})
              </h3>
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#080b15] max-h-64">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#0f1424] text-gray-400 text-[10px] uppercase sticky top-0">
                      <th className="py-2 px-2">t (s)</th>
                      <th className="py-2 px-2">EE (X,Y,Z)</th>
                      <th className="py-2 px-2">Joints (°)</th>
                      <th className="py-2 px-2">Vel (°/s)</th>
                      <th className="py-2 px-2">Collision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {trajectory.map((pt, idx) => (
                      <tr key={idx}
                        className={`cursor-pointer transition-all ${idx === playbackIndex
                          ? 'bg-blue-600/20 text-white font-semibold'
                          : pt.collisionStatus === 'COLLISION'
                          ? 'bg-rose-900/20'
                          : 'hover:bg-white/[0.02]'
                        }`}
                        onClick={() => onScrub(idx)}
                      >
                        <td className="py-1.5 px-2 text-cyan-400">{pt.time.toFixed(2)}</td>
                        <td className="py-1.5 px-2 text-[10px]">[{pt.pose.x},{pt.pose.y},{pt.pose.z}]</td>
                        <td className="py-1.5 px-2 text-amber-300 text-[10px]">
                          [{pt.joints.q1.toFixed(1)},{pt.joints.q2.toFixed(1)},{pt.joints.q3.toFixed(1)},
                          {pt.joints.q4.toFixed(1)},{pt.joints.q5.toFixed(1)},{pt.joints.q6.toFixed(1)}]
                        </td>
                        <td className="py-1.5 px-2 text-gray-500 text-[10px]">[{pt.velocity.map(v=>v.toFixed(1)).join(',')}]</td>
                        <td className="py-1.5 px-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            pt.collisionStatus === 'CLEAR' ? 'text-emerald-400'
                            : pt.collisionStatus === 'WARNING' ? 'text-amber-400'
                            : 'text-rose-400 animate-pulse'
                          }`}>
                            {pt.collisionStatus ?? 'CLEAR'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
