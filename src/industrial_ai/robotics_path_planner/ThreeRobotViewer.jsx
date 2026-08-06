import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { forwardKinematics } from './KinematicsEngine';

const ThreeRobotViewer = ({ jointAngles, trajectory = [], gripperOpen = true, isEmergencyStop = false, onFpsUpdate }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const robotLinksRef = useRef([]);
    const tfFramesRef = useRef([]);
    const trajectoryLineRef = useRef(null);
    const gripperRef = useRef(null);
    const beaconLightsRef = useRef([]);
    const frameCountRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const [fps, setFps] = useState(60);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 500;

        // 1. Scene & Environment Fog
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#060c18');
        scene.fog = new THREE.FogExp2('#060c18', 0.07);
        sceneRef.current = scene;

        // 2. Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(2.4, 2.0, 2.8);
        camera.lookAt(0, 0.5, 0);

        // 3. Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        container.appendChild(renderer.domElement);

        // 4. Lighting System (Hemisphere, Key, Fill, and Dual Rim Lights)
        const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.8);
        scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffde59, 1.4);
        dirLight.position.set(6, 9, 6);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.bias = -0.0001;
        scene.add(dirLight);

        const rimLight1 = new THREE.PointLight(0x00f0ff, 1.2, 12);
        rimLight1.position.set(-3, 4, -3);
        scene.add(rimLight1);

        const rimLight2 = new THREE.PointLight(0xff0055, 0.8, 10);
        rimLight2.position.set(3, 3, -3);
        scene.add(rimLight2);

        // 5. Industrial Factory Floor & Steel Plate
        const floorGeo = new THREE.PlaneGeometry(14, 14);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x0a1324,
            roughness: 0.4,
            metalness: 0.6
        });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.position.y = -0.01;
        floorMesh.receiveShadow = true;
        scene.add(floorMesh);

        // Secondary Metal Pedestal Plate
        const pedestalPlateGeo = new THREE.BoxGeometry(3.5, 0.04, 3.5);
        const pedestalPlateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
        const pedestalPlate = new THREE.Mesh(pedestalPlateGeo, pedestalPlateMat);
        pedestalPlate.position.y = 0.02;
        pedestalPlate.receiveShadow = true;
        scene.add(pedestalPlate);

        // Safety Hazard Border Ring
        const hazardGeo = new THREE.RingGeometry(1.65, 1.72, 32);
        const hazardMat = new THREE.MeshBasicMaterial({ color: 0xffde59, side: THREE.DoubleSide });
        const hazardRing = new THREE.Mesh(hazardGeo, hazardMat);
        hazardRing.rotation.x = Math.PI / 2;
        hazardRing.position.y = 0.041;
        scene.add(hazardRing);

        // Cyan Laser Boundary Outer Ring
        const laserGeo = new THREE.RingGeometry(2.1, 2.14, 32);
        const laserMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
        const laserRing = new THREE.Mesh(laserGeo, laserMat);
        laserRing.rotation.x = Math.PI / 2;
        laserRing.position.y = 0.042;
        scene.add(laserRing);

        // 6. Grid Overlay
        const gridHelper = new THREE.GridHelper(6, 30, 0xffde59, 0x1e2d4a);
        gridHelper.position.y = 0.043;
        scene.add(gridHelper);

        // 7. Workcell Safety Fence Corner Pillars & Warning Beacons
        const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 16);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.1 });
        const beaconGeo = new THREE.SphereGeometry(0.06, 16, 16);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

        const pillarPositions = [
            [-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]
        ];

        const beacons = [];
        pillarPositions.forEach(([px, pz]) => {
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.position.set(px, 1.1, pz);
            pillar.castShadow = true;
            scene.add(pillar);

            const beacon = new THREE.Mesh(beaconGeo, beaconMat);
            beacon.position.set(px, 2.25, pz);
            scene.add(beacon);
            beacons.push(beacon);
        });
        beaconLightsRef.current = beacons;

        // Top Connecting Safety Frame Rails
        const railGeo = new THREE.BoxGeometry(4.44, 0.04, 0.04);
        const railMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });

        const railNorth = new THREE.Mesh(railGeo, railMat);
        railNorth.position.set(0, 2.22, -2.2);
        scene.add(railNorth);

        const railSouth = new THREE.Mesh(railGeo, railMat);
        railSouth.position.set(0, 2.22, 2.2);
        scene.add(railSouth);

        const railEast = new THREE.Mesh(railGeo, railMat);
        railEast.rotation.y = Math.PI / 2;
        railEast.position.set(2.2, 2.22, 0);
        scene.add(railEast);

        const railWest = new THREE.Mesh(railGeo, railMat);
        railWest.rotation.y = Math.PI / 2;
        railWest.position.set(-2.2, 2.22, 0);
        scene.add(railWest);

        // 8. Floating Industrial Dust / Sparkle Particle Atmosphere
        const particleCount = 180;
        const particleGeo = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            particlePositions[i] = (Math.random() - 0.5) * 8;
            particlePositions[i + 1] = Math.random() * 4;
            particlePositions[i + 2] = (Math.random() - 0.5) * 8;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

        const particleMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.025, transparent: true, opacity: 0.5 });
        const particleSystem = new THREE.Points(particleGeo, particleMat);
        scene.add(particleSystem);

        // 9. Reachable Workspace Sphere Cloud
        const wsGeo = new THREE.SphereGeometry(1.35, 16, 16);
        const wsMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.08 });
        const wsMesh = new THREE.Mesh(wsGeo, wsMat);
        wsMesh.position.set(0, 0.4, 0);
        scene.add(wsMesh);

        // 10. Robot Base & Joints
        const robotGroup = new THREE.Group();
        scene.add(robotGroup);

        const baseGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.2, 32);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x1a233a, metalness: 0.9, roughness: 0.1 });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.y = 0.15;
        baseMesh.castShadow = true;
        robotGroup.add(baseMesh);

        // Metallic 6-DOF Robot Links
        const linkColors = [0xffde59, 0x3b82f6, 0x10b981, 0x8b5cf6, 0xf59e0b, 0xec4899];
        const links = [];
        const tfFrames = [];

        for (let i = 0; i < 6; i++) {
            const linkGroup = new THREE.Group();

            const jCylGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.16, 24);
            const jCylMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.1 });
            const jCylMesh = new THREE.Mesh(jCylGeo, jCylMat);
            jCylMesh.rotation.x = Math.PI / 2;
            jCylMesh.castShadow = true;
            linkGroup.add(jCylMesh);

            const armGeo = new THREE.BoxGeometry(0.09, 0.35, 0.09);
            const armMat = new THREE.MeshStandardMaterial({ color: linkColors[i], metalness: 0.7, roughness: 0.2 });
            const armMesh = new THREE.Mesh(armGeo, armMat);
            armMesh.position.y = 0.175;
            armMesh.castShadow = true;
            linkGroup.add(armMesh);

            const axesHelper = new THREE.AxesHelper(0.18);
            linkGroup.add(axesHelper);
            tfFrames.push(axesHelper);

            scene.add(linkGroup);
            links.push(linkGroup);
        }
        robotLinksRef.current = links;
        tfFramesRef.current = tfFrames;

        // End Effector Gripper
        const gripperGroup = new THREE.Group();
        const gBaseGeo = new THREE.BoxGeometry(0.12, 0.05, 0.06);
        const gBaseMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.2 });
        const gBaseMesh = new THREE.Mesh(gBaseGeo, gBaseMat);
        gripperGroup.add(gBaseMesh);

        const fingerGeo = new THREE.BoxGeometry(0.02, 0.08, 0.02);
        const fingerMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });

        const fingerLeft = new THREE.Mesh(fingerGeo, fingerMat);
        fingerLeft.position.set(-0.04, 0.05, 0);

        const fingerRight = new THREE.Mesh(fingerGeo, fingerMat);
        fingerRight.position.set(0.04, 0.05, 0);

        gripperGroup.add(fingerLeft);
        gripperGroup.add(fingerRight);
        scene.add(gripperGroup);
        gripperRef.current = { group: gripperGroup, left: fingerLeft, right: fingerRight };

        // Mouse Drag Orbit Controls
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        const handleMouseDown = (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            const radius = Math.sqrt(camera.position.x ** 2 + camera.position.y ** 2 + camera.position.z ** 2);
            let theta = Math.atan2(camera.position.x, camera.position.z);
            let phi = Math.acos(camera.position.y / radius);

            theta -= deltaX * 0.008;
            phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi - deltaY * 0.008));

            camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
            camera.position.y = radius * Math.cos(phi);
            camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
            camera.lookAt(0, 0.5, 0);

            previousMousePosition = { x: e.clientX, y: e.clientY };
        };

        const handleMouseUp = () => { isDragging = false; };

        container.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        // Animation Loop with Pulsing Warning Beacons & Particles
        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            // Pulse beacon colors
            const timeSec = performance.now() * 0.003;
            beaconLightsRef.current.forEach((b, idx) => {
                if (isEmergencyStop) {
                    b.material.color.setHex(0xef4444); // Flash red on E-stop
                } else {
                    b.material.color.setHex(Math.sin(timeSec + idx) > 0 ? 0x10b981 : 0x00f0ff);
                }
            });

            // Slowly rotate atmosphere particles
            particleSystem.rotation.y += 0.0004;

            // Calculate FPS
            frameCountRef.current += 1;
            const now = performance.now();
            if (now - lastTimeRef.current >= 1000) {
                const currentFps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
                setFps(currentFps);
                if (onFpsUpdate) onFpsUpdate(currentFps);
                frameCountRef.current = 0;
                lastTimeRef.current = now;
            }

            renderer.render(scene, camera);
        };
        animate();

        // Handle Resize
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
            cancelAnimationFrame(animationFrameId);
            container.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('resize', handleResize);
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    // Synchronize 3D Link Positions with Joint Angles (Deterministic Matrix Reset)
    useEffect(() => {
        if (!robotLinksRef.current.length) return;

        const fk = forwardKinematics(jointAngles);
        const positions = fk.jointPositions;

        for (let i = 0; i < 6; i++) {
            const link = robotLinksRef.current[i];
            const pStart = positions[i];
            const pEnd = positions[i + 1];

            // Reset rotation to identity before applying orientation
            link.quaternion.set(0, 0, 0, 1);
            link.position.set(pStart[0], pStart[2] + 0.05, pStart[1]); // Swap Y/Z for Three.js coordinates

            // Orient link towards next joint position
            const dx = pEnd[0] - pStart[0];
            const dy = pEnd[2] - pStart[2];
            const dz = pEnd[1] - pStart[1];
            const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (len > 0.001) {
                link.lookAt(pEnd[0], pEnd[2] + 0.05, pEnd[1]);
                link.rotateX(Math.PI / 2);
            }
        }

        // End Effector Gripper position
        if (gripperRef.current) {
            const tcpPos = positions[6];
            gripperRef.current.group.position.set(tcpPos[0], tcpPos[2] + 0.05, tcpPos[1]);
            const offset = gripperOpen ? 0.05 : 0.015;
            gripperRef.current.left.position.x = -offset;
            gripperRef.current.right.position.x = offset;
        }
    }, [jointAngles, gripperOpen]);

    // Render Trajectory Path Line
    useEffect(() => {
        if (!sceneRef.current) return;

        if (trajectoryLineRef.current) {
            sceneRef.current.remove(trajectoryLineRef.current);
            trajectoryLineRef.current = null;
        }

        if (trajectory && trajectory.length > 0) {
            const points = trajectory.map(t => new THREE.Vector3(t.pose.x, t.pose.z + 0.05, t.pose.y));
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const lineMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 3 });
            const line = new THREE.Line(lineGeo, lineMat);
            sceneRef.current.add(line);
            trajectoryLineRef.current = line;
        }
    }, [trajectory]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '480px', backdropFilter: 'none' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', backdropFilter: 'none' }} />

            {/* Overlays */}
            <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(6, 12, 24, 0.85)',
                border: '1px solid rgba(255, 222, 89, 0.3)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#ffde59',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                backdropFilter: 'blur(6px)',
                zIndex: 10
            }}>
                <span>🏭 SMART FACTORY WORKCELL 3D | FPS: </span>
                <strong style={{ color: fps > 45 ? '#10b981' : '#f59e0b' }}>{fps}</strong>
            </div>

            {isEmergencyStop && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(239, 68, 68, 0.95)',
                    border: '3px solid #ffffff',
                    boxShadow: '0 0 40px rgba(239, 68, 68, 0.9)',
                    borderRadius: '12px',
                    padding: '1.2rem 2.5rem',
                    color: '#ffffff',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.4rem',
                    zIndex: 20
                }}>
                    🚨 EMERGENCY STOP ENGAGED
                    <p style={{ fontSize: '0.85rem', margin: '4px 0 0 0', fontWeight: 'normal', color: '#fef2f2' }}>
                        Motion Interrupted | Servo Power Isolated
                    </p>
                </div>
            )}
        </div>
    );
};

export default ThreeRobotViewer;
