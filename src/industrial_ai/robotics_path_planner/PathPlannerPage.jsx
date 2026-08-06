import React, { useState, useEffect, useRef } from 'react';
import ThreeRobotViewer from './ThreeRobotViewer';
import {
    forwardKinematics,
    inverseKinematics,
    calculateJacobian,
    calculateManipulability,
    generateQuinticTrajectory,
    checkCollisions,
    JOINT_LIMITS
} from './KinematicsEngine';
import { JsonTreeViewer, StatusBadge, MetricTile } from '../shared/SharedComponents';

const PathPlannerPage = () => {
    // Joint angles J1-J6 in degrees
    const [joints, setJoints] = useState([0, 25, -45, 0, 40, 0]);

    // Target Cartesian Pose for Inverse Kinematics
    const [targetPose, setTargetPose] = useState({ x: 0.55, y: 0.15, z: 0.45, roll: 0, pitch: 90, yaw: 0 });

    // Gripper State
    const [gripperOpen, setGripperOpen] = useState(true);

    // E-STOP State
    const [isEmergencyStop, setIsEmergencyStop] = useState(false);

    // Trajectory & Animation
    const [trajectory, setTrajectory] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [animSpeed, setAnimSpeed] = useState(1);

    // Performance & Analytics
    const [fps, setFps] = useState(60);
    const animRef = useRef(null);

    // Compute live kinematics
    const fk = forwardKinematics(joints);
    const J = calculateJacobian(joints);
    const manipulability = calculateManipulability(J);
    const isSingular = manipulability < 0.0005;
    const collisionInfo = checkCollisions(joints);

    // Synchronize Cartesian target pose on joint slider move
    const handleJointChange = (index, value) => {
        if (isEmergencyStop) return;
        const newJoints = [...joints];
        newJoints[index] = Number(value);
        setJoints(newJoints);

        const newFk = forwardKinematics(newJoints);
        setTargetPose(newFk.pose);
    };

    // Run Inverse Kinematics solver
    const handleSolveIK = () => {
        if (isEmergencyStop) return;
        const res = inverseKinematics(targetPose, joints);
        if (res.success) {
            setJoints(res.joints);
        } else {
            alert(`IK Solver Warning: Target pose outside reach or near singularity (Error: ${res.error}m)`);
        }
    };

    // Plan Quintic Trajectory
    const handlePlanTrajectory = () => {
        if (isEmergencyStop) return;
        const goalPose = { x: targetPose.x, y: targetPose.y + 0.2, z: targetPose.z + 0.1, roll: 0, pitch: 90, yaw: 0 };
        const ikRes = inverseKinematics(goalPose, joints);
        const startJ = [...joints];
        const goalJ = ikRes.success ? ikRes.joints : [joints[0] + 30, joints[1] - 15, joints[2] + 20, joints[3], joints[4], joints[5]];

        const traj = generateQuinticTrajectory(startJ, goalJ, 3.0, 30);
        setTrajectory(traj);
        setCurrentFrame(0);
        setIsPlaying(true);
    };

    // Animation loop
    useEffect(() => {
        if (isPlaying && trajectory.length > 0 && !isEmergencyStop) {
            animRef.current = setInterval(() => {
                setCurrentFrame(prev => {
                    if (prev + 1 >= trajectory.length) {
                        setIsPlaying(false);
                        return prev;
                    }
                    setJoints(trajectory[prev + 1].joints);
                    return prev + 1;
                });
            }, (1000 / 30) / animSpeed);
        } else {
            clearInterval(animRef.current);
        }
        return () => clearInterval(animRef.current);
    }, [isPlaying, trajectory, animSpeed, isEmergencyStop]);

    // Handle E-Stop
    const toggleEmergencyStop = () => {
        setIsEmergencyStop(prev => !prev);
        setIsPlaying(false);
    };

    // Live ROS2 TF Topic simulation payload
    const ros2TopicState = {
        node: '/industrial_path_planner_node',
        executor: 'SingleThreadedExecutor',
        topics: [
            { name: '/joint_states', type: 'sensor_msgs/msg/JointState', hz: 50.0 },
            { name: '/tf', type: 'tf2_msgs/msg/TFMessage', hz: 100.0 },
            { name: '/trajectory_controller/follow_joint_trajectory', type: 'control_msgs/action/FollowJointTrajectory', status: isPlaying ? 'ACTIVE' : 'IDLE' }
        ],
        tf_tree: [
            'base_link -> link_1',
            'link_1 -> link_2',
            'link_2 -> link_3',
            'link_3 -> link_4',
            'link_4 -> link_5',
            'link_5 -> link_6',
            'link_6 -> tool0'
        ]
    };

    return (
        <div className="path-planner-page page-container" style={{ color: '#f8fafc' }}>
            {/* Header Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div>
                    <span className="hero-badge" style={{ background: 'rgba(255, 222, 89, 0.1)', color: '#ffde59', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        MODULE 1 • WEEK 1
                    </span>
                    <h1 style={{ margin: '0.4rem 0 0 0', color: '#ffde59', fontSize: '1.8rem' }}>🦾 6-DOF Industrial Robot Path Planner</h1>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                        Three.js 3D Simulation, Forward & Inverse Kinematics, Jacobian Matrix & Quintic Motion Planning
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <StatusBadge status={isEmergencyStop ? 'ESTOP' : (collisionInfo.collided ? 'WARNING' : 'RUNNING')} text={isEmergencyStop ? 'E-STOP ENGAGED' : (collisionInfo.collided ? collisionInfo.type : 'SYSTEM NORMAL')} />
                    <button
                        onClick={toggleEmergencyStop}
                        style={{
                            background: isEmergencyStop ? '#10b981' : '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.6rem 1.4rem',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            boxShadow: isEmergencyStop ? '0 0 15px rgba(16, 185, 129, 0.5)' : '0 0 20px rgba(239, 68, 68, 0.6)'
                        }}
                    >
                        {isEmergencyStop ? 'RESET EMERGENCY STOP' : '🚨 EMERGENCY STOP'}
                    </button>
                </div>
            </div>

            {/* Metrics Quick Bar */}
            <div className="stats-mini-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <MetricTile label="Manipulability (w)" value={manipulability} icon="📈" color={isSingular ? '#ef4444' : '#10b981'} subtext={isSingular ? 'SINGULARITY DETECTED' : 'Yoshikawa Index'} />
                <MetricTile label="End-Effector X" value={`${fk.pose.x} m`} icon="📍" color="#38bdf8" subtext={`Y: ${fk.pose.y}m | Z: ${fk.pose.z}m`} />
                <MetricTile label="Orient Roll/Pitch" value={`${fk.pose.roll}° / ${fk.pose.pitch}°`} icon="📐" color="#a855f7" subtext={`Yaw: ${fk.pose.yaw}°`} />
                <MetricTile label="ROS 2 Node State" value={isPlaying ? 'EXECUTING' : 'READY'} icon="⚡" color="#ffde59" subtext="/joint_states 50Hz" />
                <MetricTile label="3D Canvas FPS" value={fps} icon="🎮" color="#10b981" subtext="WebGL Frame Rate" />
            </div>

            {/* Main Content Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
                {/* Left Column: 3D Visualization & Animation Controls */}
                <div>
                    <div className="dashboard-card glass" style={{ padding: '1rem', borderRadius: '12px', height: '520px', position: 'relative' }}>
                        <ThreeRobotViewer
                            jointAngles={joints}
                            trajectory={trajectory}
                            gripperOpen={gripperOpen}
                            isEmergencyStop={isEmergencyStop}
                            onFpsUpdate={setFps}
                        />
                    </div>

                    {/* Animation Player Toolbar */}
                    <div className="dashboard-card glass" style={{ marginTop: '1rem', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                            <button
                                onClick={handlePlanTrajectory}
                                className="btn-hero-action"
                                style={{ background: 'var(--accent-color)', color: '#000', border: 'none', padding: '0.4rem 1rem', fontWeight: 'bold' }}
                                disabled={isEmergencyStop}
                            >
                                🎯 Plan Quintic Trajectory
                            </button>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="btn-hero-action"
                                style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#38bdf8', borderColor: '#38bdf8', padding: '0.4rem 1rem' }}
                                disabled={isEmergencyStop || trajectory.length === 0}
                            >
                                {isPlaying ? '⏸ Pause' : '▶ Play'}
                            </button>
                            <button
                                onClick={() => { setJoints([0, 25, -45, 0, 40, 0]); setTrajectory([]); setCurrentFrame(0); }}
                                className="btn-hero-action"
                                style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', padding: '0.4rem 1rem' }}
                            >
                                🔄 Home Pose
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                Frame: <strong style={{ color: '#ffde59' }}>{currentFrame} / {Math.max(0, trajectory.length - 1)}</strong>
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                                <span>Speed:</span>
                                {[0.5, 1, 2].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setAnimSpeed(s)}
                                        style={{
                                            background: animSpeed === s ? '#ffde59' : 'rgba(255,255,255,0.05)',
                                            color: animSpeed === s ? '#000' : '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '0.2rem 0.5rem',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        {s}x
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Trajectory Curves (SVG Chart) */}
                    <div className="dashboard-card glass" style={{ marginTop: '1rem', padding: '1rem', borderRadius: '12px' }}>
                        <h4 style={{ margin: '0 0 0.8rem 0', color: '#ffde59', fontSize: '0.9rem' }}>📊 JOINT TRAJECTORY ACCELERATION & VELOCITY PROFILES</h4>
                        <div style={{ width: '100%', height: '140px', background: '#050b14', borderRadius: '8px', padding: '0.5rem' }}>
                            <svg width="100%" height="100%" viewBox="0 0 500 120">
                                {/* Grid lines */}
                                <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.1)" strokeDasharray="4" />
                                <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.05)" />
                                <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.05)" />

                                {/* Quintic curve overlay */}
                                {trajectory.length > 0 && (
                                    <polyline
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="2.5"
                                        points={trajectory.map((t, idx) => `${(idx / trajectory.length) * 500},${60 - t.velocities[0] * 0.8}`).join(' ')}
                                    />
                                )}
                                {trajectory.length > 0 && (
                                    <polyline
                                        fill="none"
                                        stroke="#38bdf8"
                                        strokeWidth="2"
                                        points={trajectory.map((t, idx) => `${(idx / trajectory.length) * 500},${60 - t.velocities[1] * 0.8}`).join(' ')}
                                    />
                                )}
                            </svg>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                            <span style={{ color: '#10b981' }}>── J1 Velocity (deg/s)</span>
                            <span style={{ color: '#38bdf8' }}>── J2 Velocity (deg/s)</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Joint & Cartesian Control Panels */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* Joint Slider Controls */}
                    <div className="dashboard-card glass" style={{ padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                            <h4 style={{ margin: 0, color: '#ffde59', fontSize: '0.9rem' }}>⚙️ JOINT CONTROLS (J1 - J6)</h4>
                            <button
                                onClick={() => setGripperOpen(!gripperOpen)}
                                style={{
                                    background: gripperOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: gripperOpen ? '#10b981' : '#ef4444',
                                    border: '1px solid currentColor',
                                    borderRadius: '4px',
                                    padding: '0.2rem 0.6rem',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Tool Gripper: {gripperOpen ? 'OPEN' : 'CLOSED'}
                            </button>
                        </div>

                        {joints.map((val, idx) => (
                            <div key={idx} style={{ marginBottom: '0.7rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                                    <span style={{ color: '#94a3b8' }}>Joint {idx + 1}</span>
                                    <strong style={{ color: '#ffde59' }}>{val}°</strong>
                                </div>
                                <input
                                    type="range"
                                    min={JOINT_LIMITS[idx].min}
                                    max={JOINT_LIMITS[idx].max}
                                    value={val}
                                    onChange={(e) => handleJointChange(idx, e.target.value)}
                                    disabled={isEmergencyStop}
                                    style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Cartesian IK Pose Controller */}
                    <div className="dashboard-card glass" style={{ padding: '1rem', borderRadius: '12px' }}>
                        <h4 style={{ margin: '0 0 0.8rem 0', color: '#ffde59', fontSize: '0.9rem' }}>🎯 CARTESIAN IK POSE CONTROLLER</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.8rem' }}>
                            {['x', 'y', 'z', 'roll', 'pitch', 'yaw'].map((axis) => (
                                <div key={axis}>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase' }}>{axis}</label>
                                    <input
                                        type="number"
                                        step="0.05"
                                        value={targetPose[axis]}
                                        onChange={(e) => setTargetPose({ ...targetPose, [axis]: Number(e.target.value) })}
                                        disabled={isEmergencyStop}
                                        style={{
                                            width: '100%',
                                            background: '#0a1220',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            padding: '0.3rem 0.5rem',
                                            borderRadius: '4px',
                                            fontFamily: 'monospace'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleSolveIK}
                            style={{
                                width: '100%',
                                marginTop: '0.8rem',
                                padding: '0.5rem',
                                background: '#38bdf8',
                                color: '#000',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                            disabled={isEmergencyStop}
                        >
                            Solve Inverse Kinematics (DLS)
                        </button>
                    </div>

                    {/* Live Robot Telemetry & ROS 2 JSON State Viewer */}
                    <JsonTreeViewer data={ros2TopicState} title="ROS 2 TELEMETRY & TF TOPICS" />
                </div>
            </div>
        </div>
    );
};

export default PathPlannerPage;
