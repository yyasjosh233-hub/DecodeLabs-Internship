import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Camera, Grid, Axis3D, Globe, AlertTriangle, CheckCircle2, OctagonAlert, Eye } from 'lucide-react';
import type { JointState, EEPose, Obstacle, CollisionInfo, TrajectoryPoint } from '../types/robotics';

interface RobotViewportProps {
  jointState: JointState;
  eePose: EEPose;
  singularityMetric: number;
  singularityStatus: 'Safe' | 'Warning' | 'Singular';
  collisionInfo: CollisionInfo;
  obstacles: Obstacle[];
  fps: number;
  trajectory: TrajectoryPoint[];
  targetPose: EEPose;
  fkResult: {
    T_all: number[][][];
    jointPositions: [number, number, number][];
  };
}

function makeAxisArrows(size = 0.25): THREE.Group {
  const group = new THREE.Group();
  const coneH = size * 0.3;
  const shaft = size - coneH;
  const axes = [
    { color: 0xef4444, dir: [1, 0, 0], rot: [0, 0, -Math.PI / 2] }, // X red
    { color: 0x22c55e, dir: [0, 1, 0], rot: [0, 0, 0] },             // Y green
    { color: 0x3b82f6, dir: [0, 0, 1], rot: [Math.PI / 2, 0, 0] },   // Z blue
  ];
  axes.forEach(({ color, rot }) => {
    const mat = new THREE.MeshBasicMaterial({ color });
    const cylGeo = new THREE.CylinderGeometry(0.006, 0.006, shaft, 8);
    const cyl = new THREE.Mesh(cylGeo, mat);
    cyl.position.y = shaft / 2;
    const coneGeo = new THREE.ConeGeometry(0.018, coneH, 8);
    const cone = new THREE.Mesh(coneGeo, mat);
    cone.position.y = shaft + coneH / 2;
    const ax = new THREE.Group();
    ax.add(cyl);
    ax.add(cone);
    ax.rotation.set(...(rot as [number, number, number]));
    group.add(ax);
  });
  return group;
}

export const RobotViewport: React.FC<RobotViewportProps> = ({
  jointState,
  eePose,
  singularityMetric,
  singularityStatus,
  collisionInfo,
  obstacles,
  fps,
  trajectory,
  targetPose,
  fkResult
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [showGrid, setShowGrid]           = useState(true);
  const [showTFFrames, setShowTFFrames]   = useState(true);
  const [showWorkspace, setShowWorkspace] = useState(true);
  const [showObstacles, setShowObstacles] = useState(true);

  // Three.js refs
  const sceneRef     = useRef<THREE.Scene | null>(null);
  const cameraRef    = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef  = useRef<THREE.WebGLRenderer | null>(null);
  const linksRef     = useRef<THREE.Group[]>([]);
  const gridRef      = useRef<THREE.GridHelper | null>(null);
  const tfGroupRef   = useRef<THREE.Group | null>(null);
  const wsGroupRef   = useRef<THREE.Group | null>(null);
  const obsGroupRef  = useRef<THREE.Group | null>(null);
  const trajLineRef  = useRef<THREE.Line | null>(null);
  const targetMarkerRef = useRef<THREE.Mesh | null>(null);
  const axisGroupRef = useRef<THREE.Group | null>(null);

  const isDraggingRef = useRef(false);
  const prevMouseRef  = useRef({ x: 0, y: 0 });

  // ─── Scene Init ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;
    const w = mountRef.current.clientWidth || 700;
    const h = mountRef.current.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060812);
    scene.fog = new THREE.FogExp2(0x060812, 0.08);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.05, 100);
    camera.position.set(1.8, 1.4, 2.2);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dir1.position.set(3, 5, 4);
    dir1.castShadow = true;
    scene.add(dir1);
    const dir2 = new THREE.DirectionalLight(0xa855f7, 0.7);
    dir2.position.set(-3, 3, -3);
    scene.add(dir2);
    const dir3 = new THREE.DirectionalLight(0x22d3ee, 0.4);
    dir3.position.set(0, -2, 2);
    scene.add(dir3);

    // Ground Grid
    const grid = new THREE.GridHelper(5, 50, 0x1e3a5f, 0x0f1c2e);
    grid.position.y = 0;
    scene.add(grid);
    gridRef.current = grid;

    // Ground rings
    for (let r = 0.3; r <= 1.35; r += 0.3) {
      const ringGeo = new THREE.RingGeometry(r - 0.003, r + 0.003, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x0e4f7a, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.001;
      scene.add(ring);
    }

    // Workspace envelope group
    const wsGroup = new THREE.Group();
    scene.add(wsGroup);
    wsGroupRef.current = wsGroup;

    // Cyan workspace hemisphere dome wireframe
    const domeGeo = new THREE.SphereGeometry(1.35, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.08 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0;
    wsGroup.add(dome);

    // Workspace limit circles at different heights
    [0.3, 0.6, 0.9, 1.2].forEach(y => {
      const r = Math.sqrt(Math.max(0, 1.35 ** 2 - y ** 2));
      const cGeo = new THREE.TorusGeometry(r, 0.004, 8, 64);
      const cMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.2 });
      const c = new THREE.Mesh(cGeo, cMat);
      c.position.y = y;
      wsGroup.add(c);
    });

    // World XYZ axes at origin
    const axisGroup = new THREE.Group();
    axisGroup.add(makeAxisArrows(0.4));
    scene.add(axisGroup);
    axisGroupRef.current = axisGroup;

    // TF Frames group
    const tfGroup = new THREE.Group();
    scene.add(tfGroup);
    tfGroupRef.current = tfGroup;

    // Obstacles group
    const obsGroup = new THREE.Group();
    scene.add(obsGroup);
    obsGroupRef.current = obsGroup;

    // Target marker (cyan sphere)
    const targetGeo = new THREE.SphereGeometry(0.025, 16, 16);
    const targetMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 0.8 });
    const targetMarker = new THREE.Mesh(targetGeo, targetMat);
    scene.add(targetMarker);
    targetMarkerRef.current = targetMarker;

    // Trajectory line (placeholder)
    const trajGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3()]);
    const trajMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, linewidth: 2, transparent: true, opacity: 0.8 });
    const trajLine = new THREE.Line(trajGeo, trajMat);
    scene.add(trajLine);
    trajLineRef.current = trajLine;

    // ── Robot Arm ────────────────────────────────────────────
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    // Base pedestal
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.9 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.27, 0.18, 32), baseMat);
    base.position.y = 0.09;
    base.castShadow = true;
    robotGroup.add(base);

    // Base ring detail
    const bRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.015, 8, 32), new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.9 }));
    bRing.rotation.x = Math.PI / 2;
    bRing.position.y = 0.175;
    robotGroup.add(bRing);

    const linkGroups: THREE.Group[] = [];

    // Link 1 – Shoulder Pan
    const l1 = new THREE.Group();
    l1.position.set(0, 0.17, 0);
    robotGroup.add(l1);
    const j1Body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.28, 24),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.25, metalness: 0.75 })
    );
    j1Body.position.y = 0.14;
    j1Body.castShadow = true;
    l1.add(j1Body);
    linkGroups.push(l1);

    // Link 2 – Shoulder Lift
    const l2 = new THREE.Group();
    l2.position.set(0, 0.28, 0);
    l1.add(l2);
    const arm1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.46, 0.11),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.2, metalness: 0.7 })
    );
    arm1.position.y = 0.23;
    arm1.castShadow = true;
    l2.add(arm1);
    // Joint sphere
    const j2sph = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.2, metalness: 0.8 }));
    l2.add(j2sph);
    linkGroups.push(l2);

    // Link 3 – Elbow
    const l3 = new THREE.Group();
    l3.position.set(0, 0.46, 0);
    l2.add(l3);
    const arm2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.41, 0.09),
      new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.2, metalness: 0.65 })
    );
    arm2.position.y = 0.205;
    arm2.castShadow = true;
    l3.add(arm2);
    const j3sph = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.2, metalness: 0.8 }));
    l3.add(j3sph);
    linkGroups.push(l3);

    // Link 4 – Wrist Roll
    const l4 = new THREE.Group();
    l4.position.set(0, 0.41, 0);
    l3.add(l4);
    const w1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.18, 20),
      new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.25, metalness: 0.75 })
    );
    w1.position.y = 0.09;
    l4.add(w1);
    linkGroups.push(l4);

    // Link 5 – Wrist Pitch
    const l5 = new THREE.Group();
    l5.position.set(0, 0.18, 0);
    l4.add(l5);
    const w2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.2, metalness: 0.8 })
    );
    l5.add(w2);
    linkGroups.push(l5);

    // Link 6 – End Effector
    const l6 = new THREE.Group();
    l6.position.set(0, 0.055, 0);
    l5.add(l6);
    const toolFlange = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.09, 16),
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2, metalness: 0.9, emissive: 0x064e3b, emissiveIntensity: 0.2 })
    );
    toolFlange.position.y = 0.045;
    l6.add(toolFlange);

    // Gripper fingers
    const fGeo = new THREE.BoxGeometry(0.018, 0.065, 0.022);
    const fMat = new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.15, metalness: 0.9 });
    [-0.028, 0.028].forEach(xOff => {
      const f = new THREE.Mesh(fGeo, fMat);
      f.position.set(xOff, 0.105, 0);
      l6.add(f);
    });
    // EE tip glow point
    const eeLight = new THREE.PointLight(0x10b981, 0.5, 0.3);
    eeLight.position.y = 0.12;
    l6.add(eeLight);

    linkGroups.push(l6);
    linksRef.current = linkGroups;

    // Animate
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const resObs = new ResizeObserver(() => {
      if (!mountRef.current || !renderer || !camera) return;
      const nw = mountRef.current.clientWidth || 700;
      const nh = mountRef.current.clientHeight || 480;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    resObs.observe(mountRef.current);
    window.addEventListener('resize', () => resObs.disconnect());

    return () => {
      resObs.disconnect();
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, []);

  // ─── Update Joint Rotations ────────────────────────────────────────────────
  useEffect(() => {
    if (linksRef.current.length < 6) return;
    const rad = (d: number) => (d * Math.PI) / 180;
    linksRef.current[0].rotation.y = rad(jointState.q1);
    linksRef.current[1].rotation.x = rad(jointState.q2);
    linksRef.current[2].rotation.x = rad(jointState.q3);
    linksRef.current[3].rotation.y = rad(jointState.q4);
    linksRef.current[4].rotation.x = rad(jointState.q5);
    linksRef.current[5].rotation.z = rad(jointState.q6);
  }, [jointState]);

  // ─── TF Frames at each joint position ─────────────────────────────────────
  useEffect(() => {
    const tfGroup = tfGroupRef.current;
    if (!tfGroup) return;
    tfGroup.clear();
    if (!showTFFrames) return;

    fkResult.jointPositions.forEach(([x, y, z]) => {
      const frameGroup = new THREE.Group();
      frameGroup.position.set(x, y, z);
      frameGroup.add(makeAxisArrows(0.10));

      // Label sphere
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
      );
      frameGroup.add(dot);
      tfGroup.add(frameGroup);
    });
  }, [fkResult.jointPositions, showTFFrames]);

  // ─── Update Workspace Visibility ──────────────────────────────────────────
  useEffect(() => {
    if (gridRef.current)    gridRef.current.visible = showGrid;
    if (wsGroupRef.current) wsGroupRef.current.visible = showWorkspace;
  }, [showGrid, showWorkspace]);

  // ─── Update Target Marker ─────────────────────────────────────────────────
  useEffect(() => {
    if (targetMarkerRef.current) {
      targetMarkerRef.current.position.set(targetPose.x, targetPose.z, -targetPose.y);
      (targetMarkerRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8 + Math.sin(Date.now() * 0.005) * 0.2;
    }
  }, [targetPose]);

  // ─── Update Trajectory Line ───────────────────────────────────────────────
  useEffect(() => {
    if (!trajLineRef.current || !sceneRef.current) return;
    if (trajectory.length < 2) {
      (trajLineRef.current.geometry as THREE.BufferGeometry).setFromPoints([new THREE.Vector3()]);
      return;
    }
    const pts = trajectory.map(pt => new THREE.Vector3(pt.pose.x, pt.pose.z, -pt.pose.y));
    trajLineRef.current.geometry.dispose();
    (trajLineRef.current as any).geometry = new THREE.BufferGeometry().setFromPoints(pts);
  }, [trajectory]);

  // ─── Update Obstacles ─────────────────────────────────────────────────────
  useEffect(() => {
    const group = obsGroupRef.current;
    if (!group) return;
    group.clear();
    if (!showObstacles) return;

    const isCollided = collisionInfo.status === 'COLLISION';
    const isWarning  = collisionInfo.status === 'WARNING';
    const baseColor  = isCollided ? 0xef4444 : isWarning ? 0xf59e0b : 0xd97706;

    obstacles.forEach(obs => {
      let mesh: THREE.Mesh;
      const mat = new THREE.MeshStandardMaterial({ color: baseColor, transparent: true, opacity: 0.75, roughness: 0.3 });
      const [ox, oy, oz] = obs.position;

      if (obs.type === 'sphere') {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(obs.size as number, 24, 24), mat);
      } else if (obs.type === 'cylinder') {
        const [r, h] = obs.size as [number, number, number];
        mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), mat);
      } else {
        const [w, h, d] = obs.size as [number, number, number];
        mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      }
      mesh.position.set(ox, oz, -oy); // swap Y/Z for Three.js coordinate system
      // Wireframe overlay
      const wfMat = new THREE.MeshBasicMaterial({ color: baseColor, wireframe: true, transparent: true, opacity: 0.4 });
      const wfMesh = new THREE.Mesh(mesh.geometry.clone(), wfMat);
      wfMesh.position.copy(mesh.position);
      group.add(mesh);
      group.add(wfMesh);
    });
  }, [obstacles, collisionInfo, showObstacles]);

  // ─── Mouse Orbit ───────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !cameraRef.current) return;
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    const cam = cameraRef.current;
    const r = Math.sqrt(cam.position.x ** 2 + cam.position.y ** 2 + cam.position.z ** 2);
    let theta = Math.atan2(cam.position.x, cam.position.z);
    let phi = Math.acos(cam.position.y / r);
    theta -= dx * 0.007;
    phi = Math.max(0.08, Math.min(Math.PI * 0.9, phi - dy * 0.007));
    cam.position.set(r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.cos(theta));
    cam.lookAt(0, 0.5, 0);
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = () => { isDraggingRef.current = false; };
  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    const cam = cameraRef.current;
    const factor = 1 + e.deltaY * 0.001;
    cam.position.multiplyScalar(Math.max(0.5, Math.min(8, cam.position.length() * factor) / cam.position.length()));
    cam.lookAt(0, 0.5, 0);
  };
  const handleResetCamera = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.set(1.8, 1.4, 2.2);
    cameraRef.current.lookAt(0, 0.5, 0);
  };

  return (
    <div className="glass-panel p-4 flex flex-col h-full bg-[#0d101d]/90 border-[#1c233c] rounded-2xl relative select-none" style={{ minHeight: '540px' }}>

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Axis3D className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Interactive 6-DOF 3D Robot Manipulator</h2>
        </div>

        <div className="flex items-center gap-1 font-mono text-xs flex-wrap">
          <button onClick={handleResetCamera}
            className="px-2 py-1 rounded-lg bg-[#161c2e] hover:bg-[#202942] border border-white/10 text-gray-300 text-[10px] font-medium flex items-center gap-1 transition-all">
            <Camera className="w-3 h-3 text-blue-400" /> Reset View
          </button>
          {[
            { label: 'Grid',      state: showGrid,      set: setShowGrid,      icon: Grid,    key: 'grid' },
            { label: 'TF Frames', state: showTFFrames,  set: setShowTFFrames,  icon: Axis3D,  key: 'tf' },
            { label: 'Workspace', state: showWorkspace, set: setShowWorkspace, icon: Globe,   key: 'ws' },
            { label: 'Obstacles', state: showObstacles, set: setShowObstacles, icon: Eye,     key: 'obs' },
          ].map(({ label, state, set, icon: Icon, key }) => (
            <button key={key} onClick={() => set(!state)}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium border flex items-center gap-1 transition-all ${
                state ? 'bg-blue-600/30 text-blue-300 border-blue-500/40' : 'bg-[#161c2e] text-gray-500 border-white/10 hover:text-white'
              }`}>
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas */}
      <div
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ height: '460px', width: '100%' }}
        className="flex-1 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing relative"
      >
        {/* HUD Overlays */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none font-mono text-xs z-10">

          {/* EE Pose */}
          <div className="px-3 py-1.5 rounded-lg bg-[#060914]/90 backdrop-blur-md border border-blue-500/30 text-blue-300 shadow-md">
            <span className="text-gray-500">EE: </span>
            <span className="font-bold text-white">X:{eePose.x} Y:{eePose.y} Z:{eePose.z}m</span>
            <span className="text-gray-500 ml-2">R:{eePose.roll}° P:{eePose.pitch}° Y:{eePose.yaw}°</span>
          </div>

          {/* Singularity */}
          <div className={`px-3 py-1.5 rounded-lg bg-[#060914]/90 backdrop-blur-md border shadow-md ${
            singularityStatus === 'Safe'     ? 'border-emerald-500/30 text-emerald-400' :
            singularityStatus === 'Warning'  ? 'border-amber-500/30 text-amber-300' :
            'border-rose-500/40 text-rose-400'}`}>
            <span className="text-gray-500">Singularity: </span>
            <span className="font-bold">det(J)={singularityMetric} – {singularityStatus.toUpperCase()}</span>
          </div>

          {/* Collision */}
          <div className={`px-3 py-1.5 rounded-lg bg-[#060914]/90 backdrop-blur-md border shadow-md flex items-center gap-1.5 ${
            collisionInfo.status === 'CLEAR'     ? 'border-emerald-500/30 text-emerald-400' :
            collisionInfo.status === 'WARNING'   ? 'border-amber-500/30 text-amber-300' :
            'border-rose-500/40 text-rose-400 animate-pulse'}`}>
            {collisionInfo.status === 'CLEAR'     && <CheckCircle2 className="w-3 h-3" />}
            {collisionInfo.status === 'WARNING'   && <AlertTriangle className="w-3 h-3" />}
            {collisionInfo.status === 'COLLISION' && <OctagonAlert  className="w-3 h-3" />}
            <span>Collision: <strong>{collisionInfo.status}</strong> ({collisionInfo.minClearance}m)</span>
          </div>

          {/* FPS */}
          <div className="px-3 py-1 rounded-lg bg-[#060914]/80 border border-white/10 text-gray-400">
            <span className="text-cyan-500 font-bold">{fps}</span> FPS • ROS2: <span className="text-cyan-500">SIMULATION</span>
          </div>
        </div>

        {/* Right: Legend */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 pointer-events-none font-mono text-[9px] z-10">
          {[
            { color: 'bg-red-500',   label: 'X axis' },
            { color: 'bg-green-500', label: 'Y axis' },
            { color: 'bg-blue-500',  label: 'Z axis' },
            { color: 'bg-yellow-400', label: 'Trajectory' },
            { color: 'bg-cyan-400',  label: 'Target' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#060914]/80">
              <div className={`w-2 h-2 rounded-sm ${color}`} />
              <span className="text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
