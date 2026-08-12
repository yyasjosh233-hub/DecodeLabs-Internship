import React, { useState } from 'react';
import './ProcessMiningStyles.css';

const ProcessMiningPage = () => {
    const [activeTab, setActiveTab] = useState('discovery');
    const [isReplaying, setIsReplaying] = useState(false);
    const [replayStep, setReplayStep] = useState(0);

    const processVariants = [
        { id: 'V1', name: 'Standard Order-to-Fulfill (82% Cases)', throughputTime: '4.2 hrs', steps: ['Order Intake', 'Inventory Check', 'Automated Pick', 'Quality Inspection', 'Dispatch'], bottleneckStep: 'Quality Inspection' },
        { id: 'V2', name: 'Exception Rework Variant (14% Cases)', throughputTime: '18.6 hrs', steps: ['Order Intake', 'Inventory Check', 'Manual Inspection', 'Rework Repair', 'Re-Test', 'Dispatch'], bottleneckStep: 'Rework Repair' },
        { id: 'V3', name: 'Expedited Direct Dispatch (4% Cases)', throughputTime: '1.1 hrs', steps: ['Express Order', 'Automated Pick', 'Direct Dispatch'], bottleneckStep: 'None' }
    ];

    const runReplayAnimation = () => {
        setIsReplaying(true);
        setReplayStep(0);
        let step = 0;
        const interval = setInterval(() => {
            step++;
            if (step >= 5) {
                clearInterval(interval);
                setIsReplaying(false);
            } else {
                setReplayStep(step);
            }
        }, 800);
    };

    return (
        <div className="pm-container">
            {/* Header Banner */}
            <div className="pm-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ color: '#38bdf8', margin: 0, fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        🌐 Process Mining & AI Workflow Intelligence
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Enterprise Celonis-grade AI Process Discovery, Bottleneck Mining, Conformance Checking, and Autonomous Optimization.
                    </p>
                </div>
                <span style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '0.3rem 0.75rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', border: '1px solid rgba(56,189,248,0.3)' }}>
                    AI Mining Core v4.2
                </span>
            </div>

            {/* Navigation Tabs */}
            <div className="rpa-tabs-container" style={{ marginBottom: '1.25rem' }}>
                {[
                    { id: 'discovery', label: 'AI Process Discovery', icon: '🔍' },
                    { id: 'replay', label: 'Process Replay & Recording', icon: '▶️' },
                    { id: 'bottleneck', label: 'Bottlenecks & Heatmap', icon: '🔥' },
                    { id: 'conformance', label: 'Conformance Checking', icon: '📐' },
                    { id: 'auto_wf', label: 'AI Auto Workflow Generator', icon: '⚡' }
                ].map(t => (
                    <button key={t.id} className={`rpa-tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                    </button>
                ))}
            </div>

            {/* KPIs */}
            <div className="pm-grid-4">
                <div className="pm-card">
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Total Processed Cases</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', margin: '0.2rem 0' }}>48,290</div>
                    <div style={{ color: '#34d399', fontSize: '0.75rem' }}>+12.4% vs last month</div>
                </div>
                <div className="pm-card">
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Avg End-to-End Latency</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', margin: '0.2rem 0' }}>4.2 hours</div>
                    <div style={{ color: '#34d399', fontSize: '0.75rem' }}>-45 mins optimization</div>
                </div>
                <div className="pm-card">
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Conformance Score</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffde59', margin: '0.2rem 0' }}>94.8%</div>
                    <div style={{ color: '#34d399', fontSize: '0.75rem' }}>High SLA Compliance</div>
                </div>
                <div className="pm-card">
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Detected Bottlenecks</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171', margin: '0.2rem 0' }}>2 Active</div>
                    <div style={{ color: '#f87171', fontSize: '0.75rem' }}>Quality & Manual Repair</div>
                </div>
            </div>

            {/* Tab Views */}
            {activeTab === 'discovery' && (
                <div className="pm-grid-2">
                    <div className="pm-card">
                        <h3 style={{ color: '#38bdf8', marginBottom: '1rem' }}>🌳 Mined Process Variants</h3>
                        {processVariants.map(v => (
                            <div key={v.id} style={{ background: 'rgba(5,21,21,0.6)', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <span style={{ fontWeight: 700, color: '#ffde59' }}>{v.name}</span>
                                    <span style={{ color: '#34d399', fontWeight: 700 }}>{v.throughputTime}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                    {v.steps.map((s, i) => (
                                        <span key={i} style={{ background: s === v.bottleneckStep ? 'rgba(239,68,68,0.2)' : 'rgba(56,189,248,0.15)', color: s === v.bottleneckStep ? '#f87171' : '#38bdf8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                            {s} {i < v.steps.length - 1 ? '➔' : ''}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pm-card">
                        <h3 style={{ color: '#38bdf8', marginBottom: '1rem' }}>💡 AI Workflow Recommendations</h3>
                        <div style={{ background: '#051515', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid rgba(56,189,248,0.2)' }}>
                            <div style={{ fontWeight: 700, color: '#ffde59', marginBottom: '0.2rem' }}>1. Bypass Manual Quality Delay</div>
                            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0 }}>Automate visual inspection with Week 2 OpenCV camera pipeline to eliminate 14.4 hours of rework queuing.</p>
                        </div>
                        <div style={{ background: '#051515', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.2)' }}>
                            <div style={{ fontWeight: 700, color: '#ffde59', marginBottom: '0.2rem' }}>2. Auto Dispatch Trigger</div>
                            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0 }}>Enable Week 3 RPA bot to auto-sign off shipping manifests once inventory validation hits 100% confidence.</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'replay' && (
                <div className="pm-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ color: '#38bdf8', margin: 0 }}>▶️ Live Process Replay Simulation</h3>
                        <button className="pm-btn pm-btn-primary" onClick={runReplayAnimation} disabled={isReplaying}>
                            {isReplaying ? '⏳ Replaying Execution...' : '▶️ Start Process Replay'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', minHeight: '160px', background: '#051515', borderRadius: '10px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {['Order Intake', 'Inventory Pick', 'Quality Check', 'RPA Dispatch', 'Customer Delivery'].map((step, idx) => (
                            <div key={idx} className={`pm-node ${replayStep === idx ? 'selected' : ''}`} style={{ borderColor: replayStep === idx ? '#34d399' : '#38bdf8', opacity: replayStep >= idx ? 1 : 0.4 }}>
                                <div>{step}</div>
                                {replayStep === idx && <span className="pm-node-badge" style={{ background: '#34d399', color: '#051515' }}>Active Tokens</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'bottleneck' && (
                <div className="pm-card">
                    <h3 style={{ color: '#ffde59', marginBottom: '1rem' }}>🔥 Process Bottleneck Heatmap & Delay Analysis</h3>
                    <div className="rpa-table-wrapper">
                        <table className="rpa-table">
                            <thead>
                                <tr>
                                    <th>Process Step</th>
                                    <th>Avg Dwell Time</th>
                                    <th>Queue Depth</th>
                                    <th>Impact Score</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ fontWeight: 700, color: '#f87171' }}>Manual Quality Inspection</td>
                                    <td>4.2 hours</td>
                                    <td>142 items</td>
                                    <td>HIGH (88/100)</td>
                                    <td><span className="rpa-status-tag rpa-status-failed">CRITICAL BOTTLENECK</span></td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 700, color: '#fbbf24' }}>Vendor Inventory Verification</td>
                                    <td>1.1 hours</td>
                                    <td>35 items</td>
                                    <td>MEDIUM (42/100)</td>
                                    <td><span className="rpa-status-tag rpa-status-idle">MODERATE</span></td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 700, color: '#34d399' }}>Automated Pick & Pack</td>
                                    <td>0.1 hours</td>
                                    <td>2 items</td>
                                    <td>LOW (5/100)</td>
                                    <td><span className="rpa-status-tag rpa-status-running">OPTIMAL</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'conformance' && (
                <div className="pm-card">
                    <h3 style={{ color: '#38bdf8', marginBottom: '1rem' }}>📐 Process Conformance Checking</h3>
                    <p style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Comparing 48,290 actual execution traces against approved ISO-9001 reference models.</p>
                    <div style={{ background: '#051515', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,222,89,0.2)', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffde59', fontWeight: 700 }}>
                            <span>Target Model Fitness: 94.8%</span>
                            <span>Deviations: 5.2% (2,510 cases)</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'auto_wf' && (
                <div className="pm-card">
                    <h3 style={{ color: '#38bdf8', marginBottom: '1rem' }}>⚡ Automatic Workflow Generation using AI</h3>
                    <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1rem' }}>Click below to allow the Neural Process Engine to auto-synthesize an optimal RPA workflow from mined event logs.</p>
                    <button className="pm-btn pm-btn-primary" onClick={() => alert('AI Process Engine generated 1-click optimized workflow!')}>
                        ✨ Synthesize Optimized Workflow
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProcessMiningPage;
