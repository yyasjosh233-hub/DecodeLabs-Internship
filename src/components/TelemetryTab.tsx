import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Activity, Radio, Settings, RefreshCw } from 'lucide-react';
import type { JointState, EEPose, TrajectoryStats, CollisionInfo, PIDDiagnostics } from '../types/robotics';
import { ROS2SimAdapter } from '../services/ros2Service';

interface TelemetryTabProps {
  jointState: JointState;
  eePose: EEPose;
  fps: number;
  robotStatus: string;
  collisionInfo: CollisionInfo;
  trajStats: TrajectoryStats | null;
  trajectoryStatus: string;
  pidDiagnostics: PIDDiagnostics;
  pidMode: 'UNDER_TUNED' | 'NORMAL' | 'OVER_TUNED';
  onChangePidMode: (mode: 'UNDER_TUNED' | 'NORMAL' | 'OVER_TUNED') => void;
}

export const TelemetryTab: React.FC<TelemetryTabProps> = ({
  jointState, eePose, fps, robotStatus, collisionInfo,
  trajStats: _trajStats, trajectoryStatus, pidDiagnostics, pidMode, onChangePidMode
}) => {
  const [logs, setLogs] = useState(ROS2SimAdapter.getLogs());
  const [uptime, setUptime] = useState(ROS2SimAdapter.getUptime());
  const [latency, setLatency] = useState(ROS2SimAdapter.getLatencyMs());
  const timerRef = useRef<any>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setLogs(ROS2SimAdapter.getLogs().slice(0, 30));
      setUptime(ROS2SimAdapter.getUptime());
      setLatency(ROS2SimAdapter.getLatencyMs());
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const jointKeys: (keyof JointState)[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

  const logLevelColor: Record<string, string> = {
    INFO: 'text-blue-400',
    SUCCESS: 'text-emerald-400',
    WARNING: 'text-amber-400',
    ERROR: 'text-rose-400'
  };

  return (
    <div className="flex flex-col gap-5 font-sans">

      {/* ROS 2 Status Banner */}
      <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-base font-semibold text-white">ROS 2 Telemetry & Diagnostics</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Middleware: <span className="text-amber-300">{ROS2SimAdapter.ROS_DISTRO}</span> •
              Mode: <span className="text-emerald-400 font-bold">SIMULATION_MODE</span> •
              DDS: <span className="text-gray-400">Not connected (simulated)</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs flex-wrap">
          <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold animate-pulse">
            ⚠ SIMULATION MODE – NOT REAL ROS 2
          </span>
          <span className="px-2 py-1 rounded-lg bg-[#080b15] border border-white/10 text-gray-400">
            Uptime: <span className="text-white font-bold">{uptime}s</span>
          </span>
          <span className="px-2 py-1 rounded-lg bg-[#080b15] border border-white/10 text-gray-400">
            DDS Latency: <span className="text-cyan-400 font-bold">{latency}ms</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT: Logs + Nodes */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* System Log Panel */}
          <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                <Radio className="w-4 h-4" /> System Logs
              </h3>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-gray-500">{ROS2SimAdapter.getMessageCount()} messages</span>
                <button onClick={() => { ROS2SimAdapter.clearLogs(); setLogs([]); }}
                  className="px-2 py-1 rounded-lg bg-[#161c2e] border border-white/10 text-gray-400 text-[10px] hover:text-white flex items-center gap-1">
                  <RefreshCw className="w-2.5 h-2.5" /> Clear
                </button>
              </div>
            </div>
            <div className="h-48 overflow-y-auto rounded-lg bg-[#060812] border border-white/10 p-2 space-y-0.5 font-mono text-[10px]">
              {logs.length === 0 && (
                <div className="text-gray-600 text-center py-6">No logs yet</div>
              )}
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 hover:bg-white/[0.02] px-1 py-0.5 rounded">
                  <span className="text-gray-600 shrink-0">{log.timestamp}</span>
                  <span className={`shrink-0 font-bold ${logLevelColor[log.level] ?? 'text-gray-400'}`}>[{log.level}]</span>
                  <span className="text-blue-400 shrink-0">{log.node}:</span>
                  <span className="text-gray-300">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Topics Table */}
          <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-300">ROS 2 Topics</h3>
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#080b15]">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0f1424] text-gray-400 text-[10px] uppercase">
                    <th className="py-2 px-3">Topic</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Freq</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ROS2SimAdapter.TOPICS.map(t => (
                    <tr key={t.name} className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3 text-cyan-400 font-semibold">{t.name}</td>
                      <td className="py-2 px-3 text-gray-400 text-[10px]">{t.type}</td>
                      <td className="py-2 px-3 text-amber-300">{t.freq}</td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          t.status === 'PUBLISHING' ? 'bg-emerald-500/20 text-emerald-400'
                          : t.status === 'SUBSCRIBING' ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-gray-500/20 text-gray-400'
                        }`}>{t.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Services + Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel p-4 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl font-mono text-xs">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-300 mb-3">Services</h3>
              {ROS2SimAdapter.SERVICES.map(s => (
                <div key={s.name} className="flex items-center justify-between mb-1.5">
                  <span className="text-cyan-400">{s.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    s.available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-500'
                  }`}>{s.available ? 'AVAILABLE' : 'UNAVAILABLE'}</span>
                </div>
              ))}
            </div>
            <div className="glass-panel p-4 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl font-mono text-xs">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-3">Actions + Nodes</h3>
              {ROS2SimAdapter.ACTIONS.map(a => (
                <div key={a.name} className="flex items-center justify-between mb-1.5">
                  <span className="text-cyan-400 text-[10px]">{a.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    a.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400'
                    : a.status === 'IDLE' ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-amber-500/20 text-amber-400'
                  }`}>{a.status}</span>
                </div>
              ))}
              <hr className="border-white/10 my-2" />
              {ROS2SimAdapter.NODES.slice(0, 4).map(n => (
                <div key={n.name} className="flex items-center justify-between mb-1 text-[10px]">
                  <span className="text-gray-400">{n.name}</span>
                  <span className={n.status === 'ACTIVE' ? 'text-emerald-400' : 'text-gray-600'}>{n.status}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT: /joint_states + PID */}
        <div className="flex flex-col gap-4">

          {/* Live /joint_states Message */}
          <div className="glass-panel p-4 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl font-mono text-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-3 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> /joint_states (live)
            </h3>
            <div className="bg-[#060812] border border-white/10 rounded-lg p-3 text-[10px] space-y-1 leading-relaxed">
              <div className="text-gray-500">name:</div>
              <div className="text-amber-300 ml-2">[{['joint1','joint2','joint3','joint4','joint5','joint6'].map(n=>`'${n}'`).join(', ')}]</div>
              <div className="text-gray-500 mt-1">position (rad):</div>
              <div className="text-cyan-300 ml-2">
                [{jointKeys.map(k => (jointState[k] * Math.PI / 180).toFixed(4)).join(', ')}]
              </div>
              <div className="text-gray-500 mt-1">velocity:</div>
              <div className="text-blue-300 ml-2">[{pidDiagnostics.velocityError.map(v => v.toFixed(4)).join(', ')}]</div>
              <div className="text-gray-500 mt-1">effort (A):</div>
              <div className="text-purple-300 ml-2">[1.20, 4.80, 3.10, 0.90, 0.40, 0.10]</div>
            </div>
          </div>

          {/* PID Controller Diagnostics */}
          <div className="glass-panel p-4 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl font-mono text-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                <Settings className="w-3.5 h-3.5" /> PID Controller
              </h3>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                pidDiagnostics.controllerState === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>{pidDiagnostics.controllerState}</span>
            </div>

            {/* Mode selector */}
            <div className="flex gap-1">
              {(['UNDER_TUNED','NORMAL','OVER_TUNED'] as const).map(m => (
                <button key={m} onClick={() => onChangePidMode(m)}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase border transition-all ${
                    pidMode === m ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                    : 'bg-[#080b15] border-white/10 text-gray-500 hover:text-white'
                  }`}>
                  {m === 'UNDER_TUNED' ? 'Under' : m === 'NORMAL' ? 'Normal' : 'Over'}
                </button>
              ))}
            </div>

            {/* Gains */}
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              {[
                { l: 'Kp', v: pidDiagnostics.kp, c: 'text-red-400' },
                { l: 'Ki', v: pidDiagnostics.ki, c: 'text-green-400' },
                { l: 'Kd', v: pidDiagnostics.kd, c: 'text-blue-400' },
              ].map(({ l, v, c }) => (
                <div key={l} className="px-2 py-2 rounded-lg bg-[#060812] border border-white/5 text-center">
                  <div className="text-gray-500">{l}</div>
                  <div className={`${c} font-bold`}>{v}</div>
                </div>
              ))}
            </div>

            {/* Tracking errors per joint */}
            <div>
              <span className="text-gray-500 text-[10px]">Tracking Error (°):</span>
              <div className="grid grid-cols-3 gap-1 mt-1">
                {jointKeys.map((k, i) => (
                  <div key={k} className={`px-2 py-1 rounded bg-[#060812] border border-white/5 text-[10px] text-center ${
                    Math.abs(pidDiagnostics.trackingError[i]) > 5 ? 'text-rose-400' :
                    Math.abs(pidDiagnostics.trackingError[i]) > 2 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    <div className="text-gray-600 text-[8px]">q{i+1}</div>
                    {pidDiagnostics.trackingError[i]?.toFixed(3) ?? '0.000'}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Controller State */}
          <div className="glass-panel p-4 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl font-mono text-xs flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Controller State</h3>
            {[
              { l: 'Robot Status',  v: robotStatus,    c: robotStatus === 'IDLE' ? 'text-emerald-400' : 'text-amber-400' },
              { l: 'Traj Status',   v: trajectoryStatus, c: 'text-gray-300' },
              { l: 'FPS',           v: fps,            c: 'text-cyan-400' },
              { l: 'EE X',          v: `${eePose.x}m`, c: 'text-blue-400' },
              { l: 'EE Y',          v: `${eePose.y}m`, c: 'text-blue-400' },
              { l: 'EE Z',          v: `${eePose.z}m`, c: 'text-blue-400' },
              { l: 'Collision',     v: collisionInfo.status, c: collisionInfo.status === 'CLEAR' ? 'text-emerald-400' : 'text-rose-400' },
            ].map(({ l, v, c }) => (
              <div key={l} className="flex justify-between">
                <span className="text-gray-500">{l}</span>
                <span className={`font-bold ${c}`}>{String(v)}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};
