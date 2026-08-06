import React from 'react';
import { MetricTile, StatusBadge } from '../shared/SharedComponents';

const AnalyticsDashboard = ({
    robotSimCount = 142,
    totalInspections = 850,
    passCount = 798,
    failCount = 52,
    accuracy = '98.4%',
    processingTime = '12.4 ms',
    robotStatus = 'RUNNING'
}) => {
    const yieldRate = ((passCount / (totalInspections || 1)) * 100).toFixed(1);

    const recentActivities = [
        { id: 1, type: 'ROBOTICS', action: 'Quintic Trajectory Planned', detail: '6-DOF Arm executed 120 waypoint trajectory with 0.04mm precision.', time: '2m ago', icon: '🤖' },
        { id: 2, type: 'VISION', action: 'Optical Inspection Triggered', detail: 'Gear #894 PASS (Confidence: 98.7%, OD: 120.02mm).', time: '5m ago', icon: '🔍' },
        { id: 3, type: 'VISION', action: 'Defect Classified', detail: 'Missing Gear Tooth detected on Batch #441 (Rejected to Bin 2).', time: '14m ago', icon: '🚨' },
        { id: 4, type: 'ROBOTICS', action: 'Singularity Guard Auto-Bypass', detail: 'Jacobian determinant fell below 0.0004. Damped Least Squares IK engaged.', time: '28m ago', icon: '⚡' }
    ];

    return (
        <div className="industrial-analytics-section glass" style={{ padding: '1.5rem', borderRadius: '14px', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255, 222, 89, 0.2)', paddingBottom: '0.8rem' }}>
                <div>
                    <h2 style={{ color: '#ffde59', margin: 0, fontSize: '1.4rem' }}>🏭 INDUSTRIAL AI PLATFORM DASHBOARD</h2>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Integrated Robotics Simulation & Visual Inspection Telemetry</span>
                </div>
                <StatusBadge status={robotStatus} text={`SYSTEM ${robotStatus}`} />
            </div>

            {/* Metric Tiles Grid */}
            <div className="stats-mini-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <MetricTile label="Robot Simulations" value={robotSimCount} icon="🦾" color="#38bdf8" subtext="6-DOF Trajectories" />
                <MetricTile label="Total Inspections" value={totalInspections} icon="🔎" color="#ffde59" subtext="Parts Inspected" />
                <MetricTile label="PASS Count" value={passCount} icon="✓" color="#10b981" subtext={`Yield: ${yieldRate}%`} />
                <MetricTile label="FAIL Count" value={failCount} icon="✗" color="#ef4444" subtext="Defects Isolated" />
                <MetricTile label="Inspection Accuracy" value={accuracy} icon="🎯" color="#10b981" subtext="CV Precision" />
                <MetricTile label="Avg Processing Time" value={processingTime} icon="⚡" color="#a855f7" subtext="Pipeline Latency" />
            </div>

            {/* Activity Stream */}
            <div>
                <h4 style={{ color: '#f8fafc', marginBottom: '0.8rem', fontSize: '0.95rem' }}>RECENT INDUSTRIAL ACTIVITIES</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {recentActivities.map(a => (
                        <div key={a.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            padding: '0.7rem 1rem',
                            borderRadius: '8px',
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>{a.icon}</span>
                            <div style={{ flexGrow: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong style={{ color: '#f1f5f9', fontSize: '0.85rem' }}>{a.action}</strong>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.time}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>{a.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
