import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoboticsImage from '../components/RoboticsImage';

const RobotIntelligenceLab = () => {
    const { tab = 'overview' } = useParams();
    const navigate = useNavigate();

    // Robot parameters state (simulated real-time)
    const [telemetry, setTelemetry] = useState({
        battery: 82.4,
        cpu: 34,
        gpu: 65,
        ram: 42.1,
        speed: 1.1,
        heading: 142.5,
        lat: 12.9716,
        lon: 77.5946,
        status: 'NOMINAL',
        activeTask: 'Sector 4 Weed Spraying'
    });

    const [approvalStatus, setApprovalStatus] = useState('PENDING'); // PENDING, APPROVED, SHUTDOWN, TELEOP
    const [timelineLogs, setTimelineLogs] = useState([
        { id: 1, action: 'Mission Started', detail: 'Calibrated RTK GPS and initiated trajectory Planner.', time: '10:00:02 AM', status: 'VERIFIED' },
        { id: 2, action: 'Weed Detection', detail: 'Camera classification identified Amaranthus at (2.4, 4.1) with 96% confidence.', time: '10:02:14 AM', status: 'VERIFIED' },
        { id: 3, action: 'Actuation Completed', detail: 'High-frequency solenoid valve sprayed 12ml chemical payload.', time: '10:02:16 AM', status: 'VERIFIED' },
    ]);

    const [eventLogs, setEventLogs] = useState([
        { type: 'INFO', msg: 'Node /agro_control: Initialization complete.', time: '10:00:01' },
        { type: 'INFO', msg: 'RTK GPS: Signal locked with 4cm precision.', time: '10:00:03' },
        { type: 'WARNING', msg: 'Wheel slip detected on left rear motor (11.5% slip).', time: '10:03:05' }
    ]);

    // Live robot movement in Mission Monitor SVG
    const [robotPos, setRobotPos] = useState({ x: 100, y: 150 });
    const [pathHistory, setPathHistory] = useState([{ x: 100, y: 150 }]);

    useEffect(() => {
        const interval = setInterval(() => {
            // Randomize active stats
            setTelemetry(prev => {
                const nextSpeed = prev.status === 'NOMINAL' ? parseFloat((0.9 + Math.random() * 0.4).toFixed(2)) : 0.0;
                return {
                    ...prev,
                    battery: parseFloat((prev.battery - 0.01).toFixed(2)),
                    cpu: Math.floor(25 + Math.random() * 20),
                    gpu: Math.floor(55 + Math.random() * 25),
                    ram: parseFloat((41.8 + Math.random() * 0.5).toFixed(1)),
                    speed: nextSpeed,
                    heading: parseFloat((prev.heading + (Math.random() - 0.5) * 2).toFixed(1))
                };
            });

            // Simulate robot moving on agricultural rows
            setRobotPos(prev => {
                if (telemetry.status === 'BLOCKED') return prev;
                let nextX = prev.x + (1.2 + Math.random() * 0.4);
                let nextY = prev.y + (Math.sin(prev.x / 40) * 1.5);
                
                if (nextX > 580) {
                    // Reset position to loop
                    nextX = 40;
                    nextY = 80 + Math.random() * 100;
                    setPathHistory([{ x: nextX, y: nextY }]);
                } else {
                    setPathHistory(history => [...history, { x: nextX, y: nextY }]);
                }
                
                return { x: nextX, y: nextY };
            });

            // Randomly trigger mud pit block scenario if pending is active
            if (Math.random() > 0.95 && telemetry.status === 'NOMINAL' && approvalStatus === 'PENDING') {
                setTelemetry(prev => ({ ...prev, status: 'BLOCKED', activeTask: 'HAZARD CLEARANCE REQUIRED' }));
                setEventLogs(prev => [
                    { type: 'SAFETY', msg: 'HAZARD: Obstacle depth exceeds limits. Mud pit detected ahead.', time: '10:04:12' },
                    ...prev
                ]);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [telemetry.status, approvalStatus]);

    const handleApproval = (action) => {
        setApprovalStatus(action);
        if (action === 'APPROVED') {
            setTelemetry(prev => ({ ...prev, status: 'NOMINAL', activeTask: 'Resuming row inspection' }));
            setTimelineLogs(prev => [
                { id: Date.now(), action: 'Operator Clearance', detail: 'Bypass authorization granted for Sector 4 mud hazard.', time: 'Now', status: 'OVERRIDDEN' },
                ...prev
            ]);
            setEventLogs(prev => [
                { type: 'INFO', msg: 'Operator bypass instruction received. Overriding costmap constraints.', time: 'Now' },
                ...prev
            ]);
        } else if (action === 'SHUTDOWN') {
            setTelemetry(prev => ({ ...prev, status: 'SHUTDOWN', activeTask: 'Emergency halt operational' }));
            setEventLogs(prev => [
                { type: 'ERROR', msg: 'Emergency Stop issued. All motor relays opened.', time: 'Now' },
                ...prev
            ]);
        } else if (action === 'TELEOP') {
            setTelemetry(prev => ({ ...prev, status: 'TELEOP', activeTask: 'Operator remote control' }));
            setEventLogs(prev => [
                { type: 'INFO', msg: 'Node /remote_teleop active. Remote commands active.', time: 'Now' },
                ...prev
            ]);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'status', label: 'Live Status' },
        { id: 'mission', label: 'Mission Monitor' },
        { id: 'nodes', label: 'ROS 2 Nodes' },
        { id: 'topics', label: 'ROS 2 Topics' },
        { id: 'sensors', label: 'Sensor Monitoring' },
        { id: 'vision', label: 'AI Vision' },
        { id: 'timeline', label: 'Decision Timeline' },
        { id: 'approval', label: 'Human Approval' },
        { id: 'events', label: 'Robot Events' }
    ];

    return (
        <div className="robot-lab-page page-container">
            <div className="lab-header-row">
                <div>
                    <h1 className="page-title">AGRO-R1 Intelligence Lab</h1>
                    <p className="page-description">Real-time agricultural rover operations cockpit, sensor feeds, node health diagnostics, and explainable decision records.</p>
                </div>
                <div className="lab-telemetry-badge glass">
                    <span className="bullet-online"></span>
                    <strong>ROBOT: AGRO-R1</strong>
                    <div className="spacer">|</div>
                    <span className={`status-badge-lbl ${telemetry.status.toLowerCase()}`}>{telemetry.status}</span>
                </div>
            </div>

            {/* Tab Bar */}
            <div className="lab-tabs-tray">
                {tabs.map(t => (
                    <button 
                        key={t.id}
                        onClick={() => navigate(`/robot-lab/${t.id}`)}
                        className={`btn-lab-tab ${tab === t.id ? 'active' : ''}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Viewport Content */}
            <div className="lab-viewport-content">
                
                {/* 1. Overview */}
                {tab === 'overview' && (
                    <div className="lab-card-grid">
                        <div className="dashboard-card glass">
                            <h3>AGRO-R1 SPECIFICATIONS</h3>
                            <div className="spec-grid-layout">
                                <div className="spec-row"><strong>Drive system:</strong> <span>4WD Skid-Steer Electric Drive</span></div>
                                <div className="spec-row"><strong>AI Processor:</strong> <span>NVIDIA Jetson AGX Orin (275 TOPS, 64GB)</span></div>
                                <div className="spec-row"><strong>LiDAR sensor:</strong> <span>Ouster OS1 3D LiDAR (64 Channels)</span></div>
                                <div className="spec-row"><strong>Cameras:</strong> <span>Dual Intel RealSense D435i depth cameras</span></div>
                                <div className="spec-row"><strong>Payload:</strong> <span>60L Chemical Spray Tank (solenoid valves)</span></div>
                                <div className="spec-row"><strong>Standard runtime:</strong> <span>8 Hours continuous operations</span></div>
                            </div>
                        </div>
                        <div className="dashboard-card glass">
                            <h3>PHYSICAL PROFILE MAPPING</h3>
                            <div style={{ padding: '1rem', background: '#000', borderRadius: '12px' }}>
                                <RoboticsImage imageKey="agricultural" category="Agricultural Rover" />
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Live Status */}
                {tab === 'status' && (
                    <div className="telemetry-gauges-grid">
                        <div className="gauge-panel glass">
                            <span className="gauge-label">BATTERY ENERGY LEVEL</span>
                            <span className="gauge-value">{telemetry.battery}%</span>
                            <div className="progress-bar-bg" style={{ marginTop: '1rem' }}>
                                <div className="progress-bar-fill" style={{ width: `${telemetry.battery}%`, background: telemetry.battery > 20 ? '#10B981' : '#EF4444' }}></div>
                            </div>
                        </div>
                        <div className="gauge-panel glass">
                            <span className="gauge-label">CPU CORE LOAD</span>
                            <span className="gauge-value">{telemetry.cpu}%</span>
                        </div>
                        <div className="gauge-panel glass">
                            <span className="gauge-label">GPU TENSOR LOAD</span>
                            <span className="gauge-value">{telemetry.gpu}%</span>
                        </div>
                        <div className="gauge-panel glass">
                            <span className="gauge-label">ONBOARD MEMORY (RAM)</span>
                            <span className="gauge-value">{telemetry.ram} GB</span>
                        </div>
                        <div className="gauge-panel glass">
                            <span className="gauge-label">VELOCITY (M/S)</span>
                            <span className="gauge-value">{telemetry.speed} m/s</span>
                        </div>
                        <div className="gauge-panel glass">
                            <span className="gauge-label">GPS COORDINATES</span>
                            <span className="gauge-value" style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>
                                {telemetry.lat.toFixed(5)}, {telemetry.lon.toFixed(5)}
                            </span>
                        </div>
                    </div>
                )}

                {/* 3. Mission Monitor */}
                {tab === 'mission' && (
                    <div className="dashboard-card glass">
                        <div className="card-header">
                            <h3>SECTOR 4 COGNITIVE PATH TRACKING</h3>
                            <span>Active: {telemetry.activeTask}</span>
                        </div>
                        <div className="mission-canvas-wrapper" style={{ background: '#000', position: 'relative', height: '400px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                            <svg width="100%" height="100%">
                                {/* Grid lines */}
                                <defs>
                                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1"/>
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                                
                                {/* Agricultural rows (crops) */}
                                <line x1="50" y1="80" x2="550" y2="80" stroke="#1E3A1E" strokeWidth="6" strokeDasharray="15,10" />
                                <line x1="50" y1="150" x2="550" y2="150" stroke="#1E3A1E" strokeWidth="6" strokeDasharray="15,10" />
                                <line x1="50" y1="220" x2="550" y2="220" stroke="#1E3A1E" strokeWidth="6" strokeDasharray="15,10" />
                                <line x1="50" y1="290" x2="550" y2="290" stroke="#1E3A1E" strokeWidth="6" strokeDasharray="15,10" />
                                
                                {/* Robot Path History */}
                                <polyline 
                                    fill="none" 
                                    stroke="var(--accent-color)" 
                                    strokeWidth="2" 
                                    strokeDasharray="5,5"
                                    points={pathHistory.map(p => `${p.x},${p.y}`).join(' ')} 
                                />

                                {/* Active Obstacle Warning (Mud Pit) */}
                                {telemetry.status === 'BLOCKED' && (
                                    <>
                                        <ellipse cx="400" cy="150" rx="35" ry="18" fill="rgba(245, 158, 11, 0.2)" stroke="#F59E0B" strokeWidth="2" />
                                        <text x="365" y="125" fill="#F59E0B" fontSize="10" fontWeight="bold">HAZARD: MUD PIT</text>
                                    </>
                                )}

                                {/* Robot Node Icon */}
                                <g transform={`translate(${robotPos.x - 15}, ${robotPos.y - 12})`}>
                                    <rect width="30" height="24" rx="4" fill="#00ff66" opacity="0.8" />
                                    <circle cx="15" cy="12" r="5" fill="#000" />
                                    <text x="6" y="-5" fill="#fff" fontSize="8" fontWeight="bold">AGRO_R1</text>
                                </g>
                            </svg>
                        </div>
                    </div>
                )}

                {/* 4. Nodes Monitor */}
                {tab === 'nodes' && (
                    <div className="dashboard-card glass">
                        <h3>ACTIVE ROS 2 GRAPH NODES</h3>
                        <div className="table-responsive">
                            <table className="engineering-table">
                                <thead>
                                    <tr>
                                        <th>Node name</th>
                                        <th>State</th>
                                        <th>CPU Usage</th>
                                        <th>Intra-Process Links</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td><strong>/agro_control_system</strong></td> <td style={{ color: '#10B981' }}>Active</td> <td>4.2%</td> <td>3 links</td></tr>
                                    <tr><td><strong>/nav2_bt_navigator</strong></td> <td style={{ color: '#10B981' }}>Active</td> <td>8.5%</td> <td>5 links</td></tr>
                                    <tr><td><strong>/isaac_visual_slam</strong></td> <td style={{ color: '#10B981' }}>Active</td> <td>14.1%</td> <td>4 links (GPU bound)</td></tr>
                                    <tr><td><strong>/ouster_lidar_driver</strong></td> <td style={{ color: '#10B981' }}>Active</td> <td>2.8%</td> <td>2 links</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 5. Topics Monitor */}
                {tab === 'topics' && (
                    <div className="dashboard-card glass">
                        <h3>ACTIVE ROS 2 TOPICS</h3>
                        <div className="table-responsive">
                            <table className="engineering-table">
                                <thead>
                                    <tr>
                                        <th>Topic Name</th>
                                        <th>Message Type</th>
                                        <th>Frequency (Hz)</th>
                                        <th>Messages count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td><strong>/cmd_vel</strong></td> <td>geometry_msgs/msg/Twist</td> <td>10.0 Hz</td> <td>32,410</td></tr>
                                    <tr><td><strong>/odom</strong></td> <td>nav_msgs/msg/Odometry</td> <td>30.0 Hz</td> <td>97,230</td></tr>
                                    <tr><td><strong>/scan</strong></td> <td>sensor_msgs/msg/LaserScan</td> <td>15.0 Hz</td> <td>48,615</td></tr>
                                    <tr><td><strong>/camera/color/image_raw</strong></td> <td>sensor_msgs/msg/Image</td> <td>30.0 Hz (GPU)</td> <td>97,120</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 6. Sensors Monitoring */}
                {tab === 'sensors' && (
                    <div className="lab-card-grid">
                        <div className="dashboard-card glass">
                            <h3>LiDAR SWEEP SIGNAL (RANGE VALUE)</h3>
                            <div style={{ height: '220px', background: '#000', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                                {/* Oscilloscope line drawing simulation */}
                                <svg width="100%" height="100%">
                                    <polyline 
                                        fill="none" 
                                        stroke="#10B981" 
                                        strokeWidth="2" 
                                        points={Array.from({ length: 40 }, (_, i) => `${i * 15},${110 + Math.sin(i / 2) * 50 + (Math.random() - 0.5) * 15}`).join(' ')} 
                                    />
                                    <line x1="0" y1="110" x2="600" y2="110" stroke="rgba(255,255,255,0.1)" strokeDasharray="5,5"/>
                                </svg>
                            </div>
                        </div>
                        <div className="dashboard-card glass">
                            <h3>IMU IMU ANGLE DRIFT (ROLL/PITCH)</h3>
                            <div style={{ height: '220px', background: '#000', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                                <svg width="100%" height="100%">
                                    <polyline 
                                        fill="none" 
                                        stroke="#8B5CF6" 
                                        strokeWidth="2" 
                                        points={Array.from({ length: 40 }, (_, i) => `${i * 15},${110 + Math.cos(i / 3) * 20 + (Math.random() - 0.5) * 5}`).join(' ')} 
                                    />
                                    <line x1="0" y1="110" x2="600" y2="110" stroke="rgba(255,255,255,0.1)" strokeDasharray="5,5"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* 7. AI Vision */}
                {tab === 'vision' && (
                    <div className="dashboard-card glass">
                        <div className="card-header">
                            <h3>ONBOARD CAMERA STREAM & WEED INSPECTION</h3>
                            <span className="live-pulse-label">LIVE DNN PROCESSING</span>
                        </div>
                        <div className="camera-feed-canvas-wrapper" style={{ background: '#000', position: 'relative', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '12px', overflow: 'hidden' }}>
                            <div style={{ width: '100%', height: '100%', position: 'absolute', opacity: 0.6 }}>
                                <RoboticsImage imageKey="agricultural" category="Crop Feed" style={{ width: '100%', height: '100%' }} />
                            </div>
                            
                            {/* SVG overlay for detection boxes */}
                            <svg width="100%" height="100%" style={{ position: 'absolute', zIndex: 5 }}>
                                {/* Crop detection green box */}
                                <rect x="80" y="120" width="120" height="150" fill="none" stroke="#10B981" strokeWidth="3" />
                                <text x="85" y="140" fill="#10B981" fontSize="12" fontWeight="bold">CROP (Grapevine) 98%</text>

                                {/* Weed detection red box */}
                                <rect x="320" y="180" width="90" height="90" fill="none" stroke="#EF4444" strokeWidth="3" />
                                <text x="325" y="200" fill="#EF4444" fontSize="12" fontWeight="bold">WEED (Amaranthus) 96%</text>
                                
                                {/* Status info */}
                                <rect x="20" y="20" width="200" height="40" rx="4" fill="rgba(0,0,0,0.8)" />
                                <text x="30" y="45" fill="#fff" fontSize="10" fontFamily="monospace">LATENCY: 4.5ms | Hz: 222 Hz</text>
                            </svg>
                        </div>
                    </div>
                )}

                {/* 8. Decision Timeline */}
                {tab === 'timeline' && (
                    <div className="dashboard-card glass">
                        <h3>EXPLAINABLE ROBOT DECISION TIMELINE</h3>
                        <div className="activity-timeline">
                            {timelineLogs.map(l => (
                                <div key={l.id} className="activity-timeline-item">
                                    <span className="timeline-icon">🤖</span>
                                    <div className="timeline-content">
                                        <div className="timeline-meta">
                                            <strong>{l.action}</strong>
                                            <span className="time-stamp">{l.time}</span>
                                        </div>
                                        <p>{l.detail}</p>
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <span className={`status-badge-lbl ${l.status.toLowerCase()}`}>{l.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 9. Human Approval */}
                {tab === 'approval' && (
                    <div className="dashboard-card glass">
                        <div className="card-header">
                            <h3>HUMAN-IN-THE-LOOP SAFETY DECISIONS</h3>
                        </div>
                        
                        {telemetry.status === 'BLOCKED' ? (
                            <div className="human-approval-box alert" style={{ padding: '2rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #F59E0B', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <span style={{ fontSize: '3rem' }}>⚠️</span>
                                    <div>
                                        <h4 style={{ fontSize: '1.5rem', color: '#F59E0B', margin: 0 }}>HAZARD INTERVENTION TRIGGERED</h4>
                                        <p style={{ margin: '0.2rem 0 0 0', color: '#ccc' }}>AGRO-R1 blocked at Sector 4 Vineyard row 3.</p>
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px', marginBottom: '2rem' }}>
                                    <strong>EVIDENCE:</strong>
                                    <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.9rem', color: '#bbb' }}>
                                        Ultrasonic sensor logs read an obstruction matching depth index &gt; 35cm (mud/soil saturation).
                                        Current limit threshold 25cm exceeded. Automatic safety brakes engaged.
                                    </p>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <button 
                                        onClick={() => handleApproval('APPROVED')}
                                        className="btn-submit-debug"
                                        style={{ background: '#10B981', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Approve Mud Bypass (Override limits)
                                    </button>
                                    <button 
                                        onClick={() => handleApproval('TELEOP')}
                                        className="btn-submit-debug"
                                        style={{ background: '#3B82F6', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Initiate Remote Manual Teleop
                                    </button>
                                    <button 
                                        onClick={() => handleApproval('SHUTDOWN')}
                                        className="btn-submit-debug"
                                        style={{ background: '#EF4444', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Issue Emergency Stop (All Off)
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>
                                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>✔️</span>
                                <p>No active hazard approval triggers. Robot is executing scheduled path coordinates safely.</p>
                                {approvalStatus !== 'PENDING' && (
                                    <button 
                                        onClick={() => {
                                            setApprovalStatus('PENDING');
                                            setTelemetry(prev => ({ ...prev, status: 'NOMINAL', activeTask: 'Sector 4 Weed Spraying' }));
                                        }}
                                        className="btn-example-paste"
                                        style={{ marginTop: '1rem' }}
                                    >
                                        Reset Simulator Trigger Scenario
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 10. Events */}
                {tab === 'events' && (
                    <div className="dashboard-card glass">
                        <h3>ROS 2 DIAGNOSTICS & SYSTEM EVENT LOGS</h3>
                        <div className="events-log-terminal">
                            {eventLogs.map((log, idx) => (
                                <div key={idx} className={`terminal-log-line ${log.type.toLowerCase()}`}>
                                    <span className="log-time">[{log.time}]</span>
                                    <span className="log-badge">{log.type}</span>
                                    <span className="log-text">{log.msg}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default RobotIntelligenceLab;
