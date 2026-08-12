import React from 'react';

const RPADashboard = ({ bots, jobs, logs, onQuickAction }) => {
    const runningBots = bots.filter(b => b.status === 'RUNNING').length;
    const idleBots = bots.filter(b => b.status === 'IDLE').length;
    const completedJobs = jobs.filter(j => j.status === 'COMPLETED').length + 420;
    const failedJobs = jobs.filter(j => j.status === 'FAILED').length + 12;
    const queueSize = 18;
    const successRate = 98.2;
    const avgExecTime = '2.4s';
    const todaysJobs = 145;
    const cpuUsage = 28;
    const memoryUsage = 4.2; // GB
    const robotHealth = 99.4; // %

    return (
        <div className="rpa-dashboard-view">
            {/* Top Metrics Row 1 */}
            <div className="rpa-grid-4">
                <div className="rpa-card rpa-metric-card">
                    <div className="rpa-metric-icon" style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.1)' }}>🤖</div>
                    <div className="rpa-metric-info">
                        <h4>Running Bots</h4>
                        <div className="rpa-metric-val">{runningBots} <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 400 }}>/ {bots.length}</span></div>
                        <div className="rpa-sub-val"><span className="rpa-dot rpa-dot-running"></span> Active Workers</div>
                    </div>
                </div>

                <div className="rpa-card rpa-metric-card">
                    <div className="rpa-metric-icon" style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)' }}>⏳</div>
                    <div className="rpa-metric-info">
                        <h4>Idle Bots</h4>
                        <div className="rpa-metric-val">{idleBots}</div>
                        <div className="rpa-sub-val" style={{ color: '#fbbf24' }}>Ready for Dispatch</div>
                    </div>
                </div>

                <div className="rpa-card rpa-metric-card">
                    <div className="rpa-metric-icon" style={{ color: '#60a5fa', background: 'rgba(96, 165, 250, 0.1)' }}>✅</div>
                    <div className="rpa-metric-info">
                        <h4>Completed Jobs</h4>
                        <div className="rpa-metric-val">{completedJobs}</div>
                        <div className="rpa-sub-val">+18% vs yesterday</div>
                    </div>
                </div>

                <div className="rpa-card rpa-metric-card">
                    <div className="rpa-metric-icon" style={{ color: '#f87171', background: 'rgba(248, 113, 113, 0.1)' }}>🚨</div>
                    <div className="rpa-metric-info">
                        <h4>Failed Jobs</h4>
                        <div className="rpa-metric-val">{failedJobs}</div>
                        <div className="rpa-sub-val" style={{ color: '#f87171' }}>2 requiring review</div>
                    </div>
                </div>
            </div>

            {/* Metrics Row 2 */}
            <div className="rpa-grid-4">
                <div className="rpa-card rpa-metric-card">
                    <div className="rpa-metric-icon" style={{ color: '#c084fc', background: 'rgba(192, 132, 252, 0.1)' }}>📥</div>
                    <div className="rpa-metric-info">
                        <h4>Queue Size</h4>
                        <div className="rpa-metric-val">{queueSize} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>tasks</span></div>
                        <div className="rpa-sub-val">Normal Load</div>
                    </div>
                </div>

                <div className="rpa-card rpa-metric-card">
                    <div className="rpa-metric-icon" style={{ color: '#ffde59', background: 'rgba(255, 222, 89, 0.1)' }}>🎯</div>
                    <div className="rpa-metric-info">
                        <h4>Success Rate</h4>
                        <div className="rpa-metric-val">{successRate}%</div>
                        <div className="rpa-sub-val">Optimal Efficiency</div>
                    </div>
                </div>

                <div className="rpa-card rpa-metric-card">
                    <div className="rpa-metric-icon" style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)' }}>⏱️</div>
                    <div className="rpa-metric-info">
                        <h4>Avg Execution Time</h4>
                        <div className="rpa-metric-val">{avgExecTime}</div>
                        <div className="rpa-sub-val">-0.4s hardware acceleration</div>
                    </div>
                </div>

                <div className="rpa-card rpa-metric-card">
                    <div className="rpa-metric-icon" style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)' }}>📅</div>
                    <div className="rpa-metric-info">
                        <h4>Today's Jobs</h4>
                        <div className="rpa-metric-val">{todaysJobs}</div>
                        <div className="rpa-sub-val">Scheduled & Triggered</div>
                    </div>
                </div>
            </div>

            {/* System Performance & Robot Health Row */}
            <div className="rpa-grid-2">
                <div className="rpa-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ color: '#ffde59', fontSize: '1.05rem', margin: 0 }}>💻 System Resource Allocation</h3>
                        <span className="rpa-badge-accent">Live Telemetry</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                                <span style={{ color: '#cbd5e1' }}>CPU Utilization</span>
                                <span style={{ color: '#ffde59', fontWeight: 700 }}>{cpuUsage}%</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${cpuUsage}%`, height: '100%', background: 'linear-gradient(90deg, #34d399, #ffde59)', borderRadius: '4px' }}></div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                                <span style={{ color: '#cbd5e1' }}>Memory Usage (RAM)</span>
                                <span style={{ color: '#38bdf8', fontWeight: 700 }}>{memoryUsage} GB / 16 GB</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${(memoryUsage / 16) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', borderRadius: '4px' }}></div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                                <span style={{ color: '#cbd5e1' }}>Overall Robot Health</span>
                                <span style={{ color: '#34d399', fontWeight: 700 }}>{robotHealth}% Health Score</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${robotHealth}%`, height: '100%', background: '#34d399', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rpa-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ color: '#ffde59', fontSize: '1.05rem', margin: 0 }}>⚡ Active Bot Telemetry</h3>
                        <button className="rpa-btn rpa-btn-sm" onClick={() => onQuickAction('bots')}>Manage All Bots</button>
                    </div>

                    <div className="rpa-table-wrapper">
                        <table className="rpa-table">
                            <thead>
                                <tr>
                                    <th>Bot Name</th>
                                    <th>Status</th>
                                    <th>Workflow</th>
                                    <th>CPU</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bots.slice(0, 4).map(b => (
                                    <tr key={b.id}>
                                        <td style={{ fontWeight: 600, color: '#f8fafc' }}>{b.name}</td>
                                        <td>
                                            <span className={`rpa-status-tag rpa-status-${b.status.toLowerCase()}`}>
                                                <span className={`rpa-dot rpa-dot-${b.status.toLowerCase()}`}></span>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{b.workflow}</td>
                                        <td>{b.cpu}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Recent Jobs Queue & Control Quick Triggers */}
            <div className="rpa-card" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ color: '#ffde59', fontSize: '1.05rem', margin: 0 }}>📋 Recent Execution Queue & Real-Time Job Feed</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="rpa-btn rpa-btn-sm rpa-btn-primary" onClick={() => onQuickAction('workflow')}>+ New Workflow</button>
                        <button className="rpa-btn rpa-btn-sm" onClick={() => onQuickAction('reports')}>Generate Report</button>
                    </div>
                </div>

                <div className="rpa-table-wrapper">
                    <table className="rpa-table">
                        <thead>
                            <tr>
                                <th>Job ID</th>
                                <th>Bot Assigned</th>
                                <th>Workflow Name</th>
                                <th>Items</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(j => (
                                <tr key={j.id}>
                                    <td style={{ fontWeight: 700, color: '#ffde59' }}>{j.id}</td>
                                    <td style={{ color: '#f1f5f9' }}>{j.botName}</td>
                                    <td style={{ color: '#94a3b8' }}>{j.workflowName}</td>
                                    <td>{j.itemsProcessed}</td>
                                    <td>{j.duration}</td>
                                    <td>
                                        <span className={`rpa-status-tag rpa-status-${j.status.toLowerCase()}`}>
                                            {j.status}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{j.timestamp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RPADashboard;
