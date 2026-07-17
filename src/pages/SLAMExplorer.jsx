import React, { useState } from 'react';

const SLAMExplorer = () => {
    const [selectedIssue, setSelectedIssue] = useState('drift');

    const issues = {
        drift: {
            title: 'Map Drifting & Blurring',
            cause: 'Poor odometry accuracy (wheel slipping, encoder noise) combined with loose loop-closure scan matching thresholds in SLAM Toolbox.',
            steps: [
                'Verify wheel encoders calibration parameters: run the robot in a straight line and compare physical distance to ROS /odom readings.',
                'Check LiDAR hardware mount: vibration on the sensor frame can skew laser scan sweeps, corrupting mapping consistency.',
                'Tuning scan matching parameters inside SLAM Toolbox yaml config: increase minimum_travel_distance and loop_search_maximum_distance values.'
            ]
        },
        tf_latency: {
            title: 'TF Lookup Exception / Frame Mismatch',
            cause: 'Coordinate transforms cannot be calculated because frames do not share a valid transform tree parent, or coordinate timestamp deltas are too high.',
            steps: [
                'Check if odom -> base_link transform is being active published by your robot wheel encoders node.',
                'Verify map -> odom transform is published by the active SLAM/localization node.',
                'Ensure all nodes share the same ROS time clock (especially when connecting real hardware to simulated systems in Gazebo).'
            ]
        },
        loop_closure: {
            title: 'Loop Closure Failures',
            cause: 'The robot fails to recognize previously visited areas, leading to map duplication or sudden map rotation shifts.',
            steps: [
                'Increase loop search scanning range and lower the minimum overlap threshold.',
                'Ensure the environment contains sufficient geometric features (corners, pillars) for the scan matcher to correlate maps.',
                'Publish static map transformations for symmetric rooms to prevent coordinate ambiguity.'
            ]
        }
    };

    const currentIssue = issues[selectedIssue];

    return (
        <div className="slam-explorer-page page-container">
            <h1 className="page-title">SLAM Explorer & TF Diagnostic</h1>
            <p className="page-description">
                Diagnose laser scan matchers, loop closures, and inspect active TF coordinate transform tree hierarchies.
            </p>

            {/* Interactive TF Frame Tree */}
            <div className="architecture-panel glass" style={{ marginBottom: '2.5rem' }}>
                <h3>ACTIVE COORDINATE FRAME TREE (TF TREE)</h3>
                <div className="tf-tree-visual-container">
                    <div className="tf-node global">
                        <span className="tf-badge">GLOBAL</span>
                        <strong>map</strong>
                        <p>Fixed global origin</p>
                    </div>
                    <div className="tf-connector-line">
                        <span className="broadcaster-info">Broadcaster: SLAM / Localization</span>
                        <div className="arrow-down">▼</div>
                    </div>
                    <div className="tf-node relative">
                        <span className="tf-badge">RELATIVE</span>
                        <strong>odom</strong>
                        <p>Accumulated odometry drift offset</p>
                    </div>
                    <div className="tf-connector-line">
                        <span className="broadcaster-info">Broadcaster: Odometry node / Encoders</span>
                        <div className="arrow-down">▼</div>
                    </div>
                    <div className="tf-node robot-base">
                        <span className="tf-badge">ROBOT CENTER</span>
                        <strong>base_link</strong>
                        <p>Physical center of the vehicle chassis</p>
                    </div>
                    <div className="tf-branches-row" style={{ marginTop: '2rem' }}>
                        <div className="tf-child-path">
                            <div className="tf-child-connector">
                                <span className="broadcaster-info">Static transform</span>
                                <div>▼</div>
                            </div>
                            <div className="tf-node sensor-node">
                                <strong>lidar_link</strong>
                                <p>Ouster LiDAR frame</p>
                            </div>
                        </div>
                        <div className="tf-child-path">
                            <div className="tf-child-connector">
                                <span className="broadcaster-info">Static transform</span>
                                <div>▼</div>
                            </div>
                            <div className="tf-node sensor-node">
                                <strong>camera_link</strong>
                                <p>RealSense D435i frame</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Troubleshooting workspace */}
            <div className="slam-troubleshooting-grid">
                
                {/* Selector */}
                <div className="dashboard-card glass">
                    <div className="card-header">
                        <h3>COMMON MAPPING INCONSISTENCIES</h3>
                    </div>
                    <ul className="popular-topics-list">
                        <li 
                            onClick={() => setSelectedIssue('drift')} 
                            className={selectedIssue === 'drift' ? 'active-item' : ''}
                            style={{ cursor: 'pointer', padding: '1rem', borderRadius: '6px' }}
                        >
                            <strong>Map Drifting & Blur</strong>
                        </li>
                        <li 
                            onClick={() => setSelectedIssue('tf_latency')} 
                            className={selectedIssue === 'tf_latency' ? 'active-item' : ''}
                            style={{ cursor: 'pointer', padding: '1rem', borderRadius: '6px' }}
                        >
                            <strong>TF Lookup Exception (Frame Errors)</strong>
                        </li>
                        <li 
                            onClick={() => setSelectedIssue('loop_closure')} 
                            className={selectedIssue === 'loop_closure' ? 'active-item' : ''}
                            style={{ cursor: 'pointer', padding: '1rem', borderRadius: '6px' }}
                        >
                            <strong>Loop Closure Alignment failures</strong>
                        </li>
                    </ul>
                </div>

                {/* Remedy info */}
                <div className="dashboard-card glass">
                    <div className="card-header">
                        <h3>DIAGNOSTIC & TROUBLESHOOTING STEP</h3>
                    </div>
                    {currentIssue && (
                        <div className="troubleshooting-remedy-content" style={{ padding: '1rem' }}>
                            <h4 style={{ color: 'var(--accent-color)', fontSize: '1.4rem', marginBottom: '1rem' }}>{currentIssue.title}</h4>
                            
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', borderLeft: '3px solid var(--accent-color)' }}>
                                <strong>ROOT CAUSE:</strong>
                                <p style={{ fontSize: '0.95rem', marginTop: '0.3rem', color: '#ccc' }}>{currentIssue.cause}</p>
                            </div>

                            <h5>REMEDY CHECKLIST</h5>
                            <ol className="steps-list">
                                {currentIssue.steps.map((s, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.8rem', fontSize: '0.95rem' }}>{s}</li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SLAMExplorer;
