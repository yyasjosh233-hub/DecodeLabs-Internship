import React, { useState } from 'react';
import { ShieldAlert, Plus, Trash2, CheckCircle2, AlertTriangle, OctagonAlert } from 'lucide-react';
import type { Obstacle, CollisionInfo, JointState } from '../types/robotics';
import { CollisionEngine } from '../robotics/collision';

interface CollisionTabProps {
  jointState: JointState;
  collisionInfo: CollisionInfo;
  obstacles: Obstacle[];
  onUpdateObstacles: (obstacles: Obstacle[]) => void;
}

type ObsType = 'sphere' | 'box' | 'cylinder';

export const CollisionTab: React.FC<CollisionTabProps> = ({
  jointState,
  collisionInfo,
  obstacles,
  onUpdateObstacles
}) => {
  const [newName, setNewName]   = useState('');
  const [newType, setNewType]   = useState<ObsType>('sphere');
  const [newX, setNewX]         = useState(0.2);
  const [newY, setNewY]         = useState(0.3);
  const [newZ, setNewZ]         = useState(0.4);
  const [newRadius, setNewRadius] = useState(0.15);
  const [newW, setNewW]         = useState(0.2);
  const [newH, setNewH]         = useState(0.2);
  const [newD, setNewD]         = useState(0.2);
  const [newCylH, setNewCylH]   = useState(0.3);

  const selfCollision = CollisionEngine.checkSelfCollision(jointState);

  const handleAddObstacle = () => {
    let size: [number, number, number] | number;
    if (newType === 'sphere')   size = newRadius;
    else if (newType === 'box') size = [newW, newH, newD];
    else                        size = [newRadius, newCylH, newRadius]; // cylinder [r, h, r]

    const newObs: Obstacle = {
      id: `obs-${Date.now()}`,
      name: newName.trim() || `${newType.charAt(0).toUpperCase() + newType.slice(1)} ${obstacles.length + 1}`,
      type: newType,
      position: [newX, newY, newZ],
      size
    };
    onUpdateObstacles([...obstacles, newObs]);
    setNewName('');
  };

  const handleRemove = (id: string) => onUpdateObstacles(obstacles.filter(o => o.id !== id));

  const riskColor = {
    LOW: 'text-emerald-400', MEDIUM: 'text-amber-400', HIGH: 'text-orange-400', CRITICAL: 'text-rose-400'
  };

  return (
    <div className="flex flex-col gap-5 font-sans">

      {/* Header & Status */}
      <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            Collision Monitor & Obstacle System
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time link-segment collision, self-collision, workspace boundary, and obstacle clearance.
          </p>
        </div>

        <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 font-mono text-xs font-bold ${
          collisionInfo.status === 'CLEAR'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : collisionInfo.status === 'WARNING'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse'
            : 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
        }`}>
          {collisionInfo.status === 'CLEAR'     && <CheckCircle2 className="w-4 h-4" />}
          {collisionInfo.status === 'WARNING'   && <AlertTriangle className="w-4 h-4" />}
          {collisionInfo.status === 'COLLISION' && <OctagonAlert  className="w-4 h-4" />}
          {collisionInfo.status} · Clearance: {collisionInfo.minClearance}m
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Collision Details */}
        <div className="flex flex-col gap-4">

          {/* Live Collision Info */}
          <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-3 font-mono text-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300">Collision Details</h3>

            {/* Clearance Bar */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Minimum Clearance</span>
                <span className={`font-bold ${
                  collisionInfo.minClearance < 0.05 ? 'text-rose-400' :
                  collisionInfo.minClearance < 0.20 ? 'text-amber-400' : 'text-emerald-400'
                }`}>{collisionInfo.minClearance}m</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#080b15] border border-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    collisionInfo.minClearance < 0.05 ? 'bg-rose-500' :
                    collisionInfo.minClearance < 0.20 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (collisionInfo.minClearance / 0.5) * 100)}%` }}
                />
              </div>
            </div>

            {/* Detail rows */}
            {[
              { l: 'Status',          v: collisionInfo.status,
                c: collisionInfo.status === 'CLEAR' ? 'text-emerald-400' : collisionInfo.status === 'WARNING' ? 'text-amber-400' : 'text-rose-400' },
              { l: 'Risk Level',      v: collisionInfo.riskLevel ?? 'LOW',
                c: riskColor[collisionInfo.riskLevel ?? 'LOW'] },
              { l: 'Closest Object',  v: collisionInfo.closestObstacle ?? 'None', c: 'text-white' },
              { l: 'Self Collision',  v: selfCollision.detected ? 'DETECTED' : 'CLEAR',
                c: selfCollision.detected ? 'text-rose-400' : 'text-emerald-400' },
            ].map(({ l, v, c }) => (
              <div key={l} className="flex justify-between">
                <span className="text-gray-500">{l}</span>
                <span className={`font-bold ${c}`}>{v}</span>
              </div>
            ))}

            {/* Colliding objects list */}
            {(collisionInfo.collidingObjects ?? []).length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-gray-500">Colliding Objects:</span>
                {(collisionInfo.collidingObjects ?? []).map(name => (
                  <span key={name} className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px]">
                    ⚠ {name}
                  </span>
                ))}
              </div>
            )}

            {/* Self collision links */}
            {selfCollision.detected && (
              <div className="flex flex-col gap-1">
                <span className="text-gray-500">Self-Colliding Links:</span>
                {selfCollision.collidingLinks.map(pair => (
                  <span key={pair} className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px]">
                    ⚠ {pair}
                  </span>
                ))}
              </div>
            )}

            {/* Collision location */}
            {collisionInfo.collisionLocation && (
              <div className="flex justify-between">
                <span className="text-gray-500">Location (est.)</span>
                <span className="text-orange-400 font-bold text-[10px]">
                  [{collisionInfo.collisionLocation.map(v => v.toFixed(3)).join(', ')}]m
                </span>
              </div>
            )}
          </div>

          {/* Joint Link Distances */}
          <div className="glass-panel p-4 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl font-mono text-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Self-Collision Check</h3>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Non-adjacent link clearance</span>
                <span className={selfCollision.detected ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {selfCollision.minClearance}m
                </span>
              </div>
              {selfCollision.collidingLinks.length === 0 && (
                <div className="text-emerald-400 text-[10px]">✓ No self-collision detected</div>
              )}
            </div>
          </div>

        </div>

        {/* Right: Add Obstacle */}
        <div className="flex flex-col gap-4">

          {/* Add Obstacle Form */}
          <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-3 font-mono text-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300">Add 3D Obstacle</h3>

            {/* Type Selector */}
            <div className="flex gap-2">
              {(['sphere', 'box', 'cylinder'] as ObsType[]).map(t => (
                <button key={t} onClick={() => setNewType(t)}
                  className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                    newType === t ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-[#080b15] border-white/10 text-gray-500 hover:text-white'
                  }`}>
                  {t}
                </button>
              ))}
            </div>

            {/* Name */}
            <input
              type="text" placeholder="Obstacle Name" value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#080b15] border border-white/10 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
            />

            {/* Position */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-0.5">
                <label className="text-gray-500 text-[9px]">X (m)</label>
                <input type="number" step="0.1" value={newX}
                  onChange={(e) => setNewX(parseFloat(e.target.value) || 0)}
                  className="px-2 py-1.5 rounded-lg bg-[#060812] border border-white/10 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-gray-500 text-[9px]">Y (m)</label>
                <input type="number" step="0.1" value={newY}
                  onChange={(e) => setNewY(parseFloat(e.target.value) || 0)}
                  className="px-2 py-1.5 rounded-lg bg-[#060812] border border-white/10 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-gray-500 text-[9px]">Z (m)</label>
                <input type="number" step="0.1" value={newZ}
                  onChange={(e) => setNewZ(parseFloat(e.target.value) || 0)}
                  className="px-2 py-1.5 rounded-lg bg-[#060812] border border-white/10 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Size Inputs by type */}
            {newType === 'sphere' && (
              <div className="flex flex-col gap-0.5">
                <label className="text-gray-500 text-[9px]">Radius (m)</label>
                <input type="number" step="0.05" min="0.01" value={newRadius}
                  onChange={(e) => setNewRadius(parseFloat(e.target.value) || 0.1)}
                  className="px-2 py-1.5 rounded-lg bg-[#060812] border border-white/10 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
            {newType === 'box' && (
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-0.5">
                  <label className="text-gray-500 text-[9px]">W (m)</label>
                  <input type="number" step="0.05" min="0.01" value={newW}
                    onChange={(e) => setNewW(parseFloat(e.target.value) || 0.1)}
                    className="px-2 py-1.5 rounded-lg bg-[#060812] border border-white/10 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-gray-500 text-[9px]">H (m)</label>
                  <input type="number" step="0.05" min="0.01" value={newH}
                    onChange={(e) => setNewH(parseFloat(e.target.value) || 0.1)}
                    className="px-2 py-1.5 rounded-lg bg-[#060812] border border-white/10 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-gray-500 text-[9px]">D (m)</label>
                  <input type="number" step="0.05" min="0.01" value={newD}
                    onChange={(e) => setNewD(parseFloat(e.target.value) || 0.1)}
                    className="px-2 py-1.5 rounded-lg bg-[#060812] border border-white/10 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}
            {newType === 'cylinder' && (
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-0.5">
                  <label className="text-gray-500 text-[9px]">Radius (m)</label>
                  <input type="number" step="0.05" min="0.01" value={newRadius}
                    onChange={(e) => setNewRadius(parseFloat(e.target.value))}
                    className="px-2 py-1.5 rounded-lg bg-[#060812] border border-white/10 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-gray-500 text-[9px]">Height (m)</label>
                  <input type="number" step="0.05" min="0.01" value={newCylH}
                    onChange={(e) => setNewCylH(parseFloat(e.target.value))}
                    className="px-2 py-1.5 rounded-lg bg-[#060812] border border-white/10 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <button onClick={handleAddObstacle}
              className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/30">
              <Plus className="w-4 h-4" /> Add Obstacle
            </button>
          </div>

          {/* Obstacle List */}
          <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-300">
              Active Obstacles ({obstacles.length})
            </h3>
            {obstacles.length === 0 && (
              <div className="text-gray-600 text-xs font-mono text-center py-3">No obstacles defined</div>
            )}
            <div className="space-y-2 font-mono text-xs">
              {obstacles.map(obs => {
                const isColliding = (collisionInfo.collidingObjects ?? []).includes(obs.name);
                return (
                  <div key={obs.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isColliding ? 'border-rose-500/40 bg-rose-500/5' : 'border-white/10 bg-[#080b15]'
                    }`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        isColliding ? 'bg-rose-400 animate-pulse' : 'bg-amber-400'
                      }`} />
                      <div>
                        <div className="font-semibold text-white text-[11px]">{obs.name}</div>
                        <div className="text-gray-500 text-[9px]">
                          [{obs.position.join(', ')}]m · {obs.type}
                          {obs.type === 'sphere' && ` · r=${obs.size as number}m`}
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-gray-400 uppercase">{obs.type}</span>
                    </div>
                    <button onClick={() => handleRemove(obs.id)}
                      className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/10 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
