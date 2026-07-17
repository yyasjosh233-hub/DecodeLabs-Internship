import React, { useState } from 'react';
import RoboticsImage from '../components/RoboticsImage';

const RobotKB = () => {
    const [viewMode, setViewMode] = useState('robots'); // 'robots' or 'sensors'

    const robots = [
        {
            id: 'industrial',
            title: 'Industrial Robotic Arms',
            desc: 'Multi-axis articulators designed for high-volume factories. They execute rapid welding, spray coating, packaging, and heavy assembly runs with sub-millimeter tolerances.',
            spec: 'DoF: 6-7 Axis | Precision: ±0.02mm | Key middleware: JointTrajectoryController',
            imgKey: 'medical' // Fallback to medical or placeholder
        },
        {
            id: 'humanoid',
            title: 'Humanoid & Bipedal Platforms',
            desc: 'Designed to mimic human kinematics and perform tasks in workspaces built for humans. They incorporate complex walking mechanics and torque-controlled actuators.',
            spec: 'DoF: 40-60 | Balance system: Divergent Component of Motion (DCM) | Edge board: Jetson Orin',
            imgKey: 'humanoid'
        },
        {
            id: 'amr',
            title: 'Autonomous Mobile Robots (AMR)',
            desc: 'Self-navigating warehouse rovers that transport heavy crates dynamically. They map their surroundings in real-time, avoiding human workers and forklift routes.',
            spec: 'Speed: Up to 2.5 m/s | Navigation: Nav2 costmap pathfinding | Core sensor: 3D LiDAR',
            imgKey: 'underwater' // Fallback
        },
        {
            id: 'agricultural',
            title: 'Autonomous Agricultural Rovers (AGRO)',
            desc: 'Deployable rovers tailored for dynamic outdoor crop inspection, spot spraying, and soil monitoring. They require rugged suspension and RTK GPS alignment.',
            spec: 'Drive: 4WD skid-steer | Autonomy: Level 4 | Payload: High-pressure chemical spray tank',
            imgKey: 'agricultural'
        }
    ];

    const sensors = [
        {
            title: '3D LiDAR (Light Detection and Ranging)',
            desc: 'LiDAR sensors spin laser beams at high frequencies, measuring how long they take to bounce off objects. This builds a 3D points mesh representing surrounding obstacles.',
            usage: 'Primary sensor for SLAM Toolbox mapping, Nav2 controller collision checks, and 3D obstacle avoidance.',
            spec: 'Sample rate: Up to 1.3 million pts/s | Range: 120m | Standard ROS topic: /scan /points2',
            imgKey: 'lidar'
        },
        {
            title: 'Depth / RGB-D Cameras',
            desc: 'Cameras that project infrared grid patterns or use stereo lenses to calculate per-pixel depth matrices alongside color feeds.',
            usage: 'Essential for GPU-accelerated Isaac ROS visual odometry, DNN crop classification, and close-range haptic grip calibration.',
            spec: 'Resolution: 1280x720 | Latency: <2ms (with GPU processing) | Standard ROS topic: /camera/color/image_raw',
            imgKey: 'jetson'
        }
    ];

    return (
        <div className="robot-kb-page page-container">
            <h1 className="page-title">Robot Knowledge Base & Glossary</h1>
            <p className="page-description">
                Explore rigid mechanics profiles, actuator controllers, and electronic sensor specifications grounded in robotics engineering documentation.
            </p>

            {/* View Toggle */}
            <div className="kb-view-selector glass">
                <button 
                    onClick={() => setViewMode('robots')} 
                    className={`btn-selector ${viewMode === 'robots' ? 'active' : ''}`}
                >
                    🤖 Robotic Systems Database
                </button>
                <button 
                    onClick={() => setViewMode('sensors')} 
                    className={`btn-selector ${viewMode === 'sensors' ? 'active' : ''}`}
                >
                    📡 Sensor Specifications Glossary
                </button>
            </div>

            {/* Content Lists */}
            {viewMode === 'robots' ? (
                <div className="kb-items-grid">
                    {robots.map(r => (
                        <div key={r.id} className="kb-item-card glass">
                            <div className="kb-img-box">
                                <RoboticsImage imageKey={r.imgKey} category="Robot System" />
                            </div>
                            <div className="kb-text-box">
                                <h3>{r.title}</h3>
                                <p>{r.desc}</p>
                                <div className="kb-spec-footer">
                                    <strong>ENGINEERING PROFILE:</strong>
                                    <code>{r.spec}</code>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="kb-items-grid">
                    {sensors.map((s, idx) => (
                        <div key={idx} className="kb-item-card glass">
                            <div className="kb-img-box">
                                <RoboticsImage imageKey={s.imgKey} category="Sensor Technology" />
                            </div>
                            <div className="kb-text-box">
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                                <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '0.9rem' }}>
                                    <strong>ROBOTIC INTEGRATION:</strong> {s.usage}
                                </div>
                                <div className="kb-spec-footer" style={{ marginTop: '1rem' }}>
                                    <strong>TELEMETRY SPEC:</strong>
                                    <code>{s.spec}</code>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RobotKB;
