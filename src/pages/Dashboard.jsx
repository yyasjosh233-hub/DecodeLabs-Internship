import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const stats = [
        { label: 'Active Projects', val: '3' },
        { label: 'Ingested Documentation Chunks', val: '412' },
        { label: 'Successful Telemetry Hours', val: '1,420' },
        { label: 'Safety Events Logged', val: '0' }
    ];

    const activities = [
        { action: 'URDF Analyzed', detail: 'AGRO-R1 kinematic limits validated (estimated 210.0kg mass).', time: '10m ago', icon: '📐' },
        { action: 'ROS 2 QoS Mismatch Solved', detail: 'Adjusted subscription profiles for best-effort camera stream.', time: '1h ago', icon: '🔧' },
        { action: 'New Trusted Source Synced', detail: 'Ingested 24 chunks from Nav2 Costmaps Configuration guide.', time: '4h ago', icon: '📥' },
        { action: 'Robot Incident E-Stop Override', detail: 'Manual teleop clearance issued for sector 2 mud pit bypass.', time: '1d ago', icon: '🚨' }
    ];

    const shortcuts = [
        { label: 'Ask Robotics AI', path: '/ai-assistant', desc: 'Ask about QoS, nodes, TF trees, or DDS rules.', color: '#10B981' },
        { label: 'Debug ROS 2 Error', path: '/ros2-debugger', desc: 'Paste console tracebacks for root-cause solutions.', color: '#3B82F6' },
        { label: 'Analyze URDF Markup', path: '/urdf-analyzer', desc: 'Paste robot XML configurations to inspect joints.', color: '#8B5CF6' },
        { label: 'Open Robot Lab', path: '/robot-lab/overview', desc: 'Track AGRO-R1 crop inspection missions.', color: '#F59E0B' },
        { label: 'NVIDIA Hardware Hub', path: '/nvidia-hub', desc: 'Configure Isaac ROS acceleration benchmarks.', color: '#10B981' }
    ];

    return (
        <div className="dashboard-page page-container">
            {/* Hero Section */}
            <section className="dashboard-hero-banner glass">
                <div className="hero-badge">WORKSPACE OPERATIONAL</div>
                <h1 className="hero-title">Robotics Intelligence, Grounded in Engineering</h1>
                <p className="hero-subtitle">
                    Learn, debug, analyze, and monitor ROS 2 and autonomous robot systems from one unified engineering platform.
                </p>
                <div className="hero-quick-actions">
                    {shortcuts.slice(0, 4).map((s, idx) => (
                        <Link key={idx} to={s.path} className="btn-hero-action" style={{ borderColor: s.color }}>
                            {s.label}
                        </Link>
                    ))}
                </div>
            </section>

            {/* Grid Panels */}
            <div className="dashboard-grid">
                
                {/* Left Column: Connected Robots & Telemetry Stats */}
                <div className="grid-left-col">
                    
                    {/* Connected Robots Card */}
                    <div className="dashboard-card glass">
                        <div className="card-header">
                            <h3>ACTIVE GROUND SYSTEMS</h3>
                            <span className="live-pulse-label">LIVE FEED</span>
                        </div>
                        <div className="robot-telemetry-row">
                            <div className="robot-icon-box">🚜</div>
                            <div className="robot-telemetry-details">
                                <div className="details-header">
                                    <h4>AGRO-R1 Rover</h4>
                                    <span className="telemetry-badge-online">ONLINE</span>
                                </div>
                                <p className="mission-state">Current Mission: <strong>Crop Weed Spraying</strong></p>
                                <div className="meters-container">
                                    <div className="meter-item">
                                        <span>Battery</span>
                                        <div className="progress-bar-bg">
                                            <div className="progress-bar-fill" style={{ width: '82%', background: '#10B981' }}></div>
                                        </div>
                                        <span className="meter-val">82%</span>
                                    </div>
                                    <div className="meter-item">
                                        <span>ROS 2 Core</span>
                                        <div className="progress-bar-bg">
                                            <div className="progress-bar-fill" style={{ width: '100%', background: '#10B981' }}></div>
                                        </div>
                                        <span className="meter-val">100%</span>
                                    </div>
                                    <div className="meter-item">
                                        <span>Liquid Payload</span>
                                        <div className="progress-bar-bg">
                                            <div className="progress-bar-fill" style={{ width: '65%', background: '#3B82F6' }}></div>
                                        </div>
                                        <span className="meter-val">39L / 60L</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card-footer-actions">
                            <Link to="/robot-lab/status" className="btn-card-link">Launch Live Tracking Console →</Link>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="stats-mini-grid">
                        {stats.map((s, idx) => (
                            <div key={idx} className="stat-card glass">
                                <span className="stat-card-val">{s.val}</span>
                                <span className="stat-card-label">{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Shortcuts list */}
                    <div className="dashboard-card glass">
                        <div className="card-header">
                            <h3>INTELLIGENCE SUBMODULES</h3>
                        </div>
                        <div className="submodules-links-list">
                            {shortcuts.map((s, idx) => (
                                <Link key={idx} to={s.path} className="submodule-shortcut-item">
                                    <div className="shortcut-meta">
                                        <strong>{s.label}</strong>
                                        <p>{s.desc}</p>
                                    </div>
                                    <span className="chevron">→</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Activity Timeline & Checklists */}
                <div className="grid-right-col">
                    
                    {/* Recent Activities */}
                    <div className="dashboard-card glass">
                        <div className="card-header">
                            <h3>RECENT ENGINEERING ACTIVITY</h3>
                        </div>
                        <div className="activity-timeline">
                            {activities.map((a, idx) => (
                                <div key={idx} className="activity-timeline-item">
                                    <span className="timeline-icon">{a.icon}</span>
                                    <div className="timeline-content">
                                        <div className="timeline-meta">
                                            <strong>{a.action}</strong>
                                            <span className="time-stamp">{a.time}</span>
                                        </div>
                                        <p>{a.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Popular Topics & Checklist */}
                    <div className="dashboard-card glass">
                        <div className="card-header">
                            <h3>POPULAR ROS 2 TOPICS</h3>
                        </div>
                        <ul className="popular-topics-list">
                            <li>
                                <Link to="/ros2-hub">QoS Compatibility & Message Drops</Link>
                                <span className="view-count">142 views</span>
                            </li>
                            <li>
                                <Link to="/nav2-assistant">Costmap Inflation Tuning & Collisions</Link>
                                <span className="view-count">98 views</span>
                            </li>
                            <li>
                                <Link to="/slam-explorer">TF Tree Circular Parent Resolving</Link>
                                <span className="view-count">85 views</span>
                            </li>
                            <li>
                                <Link to="/nvidia-hub">Isaac ROS Visual SLAM Benchmarking</Link>
                                <span className="view-count">71 views</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
