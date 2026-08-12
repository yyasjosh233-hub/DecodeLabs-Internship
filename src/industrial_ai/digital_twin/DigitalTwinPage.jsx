import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import './DigitalTwinStyles.css';

const DigitalTwinPage = () => {
    const canvasRef = useRef(null);
    const [simSpeed, setSimSpeed] = useState(1);
    const [conveyorRunning, setConveyorRunning] = useState(true);
    const [isSimulatingFailure, setIsSimulatingFailure] = useState(false);
    const [telemetry, setTelemetry] = useState({
        vibration: 2.4, // mm/s
        temperature: 42.1, // °C
        spindleRPM: 3200,
        equipmentHealth: 98.2, // %
        partCount: 1420
    });

    // Three.js WebGL Canvas Setup
    useEffect(() => {
        if (!canvasRef.current) return;
        const container = canvasRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x031713);
        scene.fog = new THREE.FogExp2(0x031713, 0.03);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(12, 10, 15);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Grid & Lights
        const gridHelper = new THREE.GridHelper(30, 30, 0x10b981, 0x064e3b);
        scene.add(gridHelper);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0x34d399, 1.2);
        dirLight.position.set(10, 20, 10);
        scene.add(dirLight);

        // Factory Floor Models (Conveyor, Robot Base, Machines)
        const conveyorGeo = new THREE.BoxGeometry(16, 0.4, 2);
        const conveyorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
        const conveyorMesh = new THREE.Mesh(conveyorGeo, conveyorMat);
        conveyorMesh.position.set(0, 0.2, 0);
        scene.add(conveyorMesh);

        // 3D Robot Arm (Base + Joints)
        const armGroup = new THREE.Group();
        const baseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.8, 32);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8 });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        armGroup.add(baseMesh);

        const link1Geo = new THREE.CylinderGeometry(0.4, 0.4, 3, 16);
        const link1Mat = new THREE.MeshStandardMaterial({ color: 0xffde59 });
        const link1Mesh = new THREE.Mesh(link1Geo, link1Mat);
        link1Mesh.position.set(0, 1.9, 0);
        armGroup.add(link1Mesh);

        armGroup.position.set(-2, 0.4, -3);
        scene.add(armGroup);

        // Moving Boxes on Conveyor
        const boxes = [];
        const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
        for (let i = 0; i < 4; i++) {
            const b = new THREE.Mesh(boxGeo, boxMat);
            b.position.set(-6 + i * 4, 0.8, 0);
            scene.add(b);
            boxes.push(b);
        }

        // Animation Loop
        let reqId;
        const animate = () => {
            reqId = requestAnimationFrame(animate);

            // Rotate robot joint
            armGroup.rotation.y += 0.01 * simSpeed;

            // Move conveyor items
            if (conveyorRunning) {
                boxes.forEach(b => {
                    b.position.x += 0.04 * simSpeed;
                    if (b.position.x > 8) b.position.x = -8;
                });
            }

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(reqId);
            window.removeEventListener('resize', handleResize);
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [simSpeed, conveyorRunning]);

    // Live Telemetry simulation tick
    useEffect(() => {
        const interval = setInterval(() => {
            if (isSimulatingFailure) {
                setTelemetry(prev => ({
                    ...prev,
                    vibration: +(prev.vibration + 0.8).toFixed(1),
                    temperature: +(prev.temperature + 1.2).toFixed(1),
                    equipmentHealth: +(prev.equipmentHealth - 2.5).toFixed(1)
                }));
            } else {
                setTelemetry(prev => ({
                    ...prev,
                    partCount: prev.partCount + 1,
                    vibration: +(2.2 + Math.random() * 0.4).toFixed(1),
                    temperature: +(41.5 + Math.random() * 0.8).toFixed(1)
                }));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isSimulatingFailure]);

    return (
        <div className="dt-container">
            {/* Header Banner */}
            <div className="dt-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ color: '#34d399', margin: 0, fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        🌐 Real-Time 3D Digital Twin Platform
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Three.js WebGL 3D Factory Floor, Live Robot Twin, Conveyor Dynamics & Predictive Maintenance Simulation.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="dt-badge">WebGL 3D Active</span>
                    <button className="rpa-btn rpa-btn-sm" onClick={() => setIsSimulatingFailure(!isSimulatingFailure)} style={{ background: isSimulatingFailure ? '#ef4444' : undefined, color: isSimulatingFailure ? '#fff' : undefined }}>
                        {isSimulatingFailure ? '🚨 Stop Failure Test' : '⚠️ Trigger Fault Simulation'}
                    </button>
                </div>
            </div>

            {/* 3D WebGL Canvas */}
            <div className="dt-card" style={{ padding: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>🕹️ Interactive 3D Digital Twin Scene</span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Speed multiplier:</span>
                        {[1, 2, 4].map(s => (
                            <button key={s} className={`rpa-btn rpa-btn-sm ${simSpeed === s ? 'rpa-btn-primary' : ''}`} onClick={() => setSimSpeed(s)}>
                                {s}x
                            </button>
                        ))}
                    </div>
                </div>
                <div ref={canvasRef} className="dt-canvas-wrapper"></div>
            </div>

            {/* Telemetry & Machine Health Metrics */}
            <div className="pm-grid-4">
                <div className="dt-card">
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Vibration Velocity</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: telemetry.vibration > 4 ? '#f87171' : '#34d399' }}>{telemetry.vibration} mm/s</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Normal Threshold &lt; 4.5 mm/s</div>
                </div>

                <div className="dt-card">
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Bearing Temperature</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: telemetry.temperature > 50 ? '#f87171' : '#ffde59' }}>{telemetry.temperature} °C</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Thermal Limit &lt; 65 °C</div>
                </div>

                <div className="dt-card">
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Spindle Speed</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>{telemetry.spindleRPM} RPM</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Synchronized DDS Feedback</div>
                </div>

                <div className="dt-card">
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Predictive Equipment Health</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: telemetry.equipmentHealth < 80 ? '#f87171' : '#34d399' }}>{telemetry.equipmentHealth}%</div>
                    <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Remaining Useful Life: 1,450 hrs</div>
                </div>
            </div>
        </div>
    );
};

export default DigitalTwinPage;
