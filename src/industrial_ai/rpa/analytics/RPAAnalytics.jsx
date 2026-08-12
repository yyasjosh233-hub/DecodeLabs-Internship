import React from 'react';

const RPAAnalytics = ({ bots, jobs }) => {
    const dailyStats = [
        { day: 'Mon', count: 120, success: 118, failed: 2 },
        { day: 'Tue', count: 145, success: 142, failed: 3 },
        { day: 'Wed', count: 190, success: 188, failed: 2 },
        { day: 'Thu', count: 160, success: 156, failed: 4 },
        { day: 'Fri', count: 210, success: 208, failed: 2 },
        { day: 'Sat', count: 85, success: 85, failed: 0 },
        { day: 'Sun', count: 95, success: 94, failed: 1 }
    ];

    const maxDaily = 220;

    return (
        <div className="rpa-analytics-view">
            <div className="rpa-card" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ color: '#ffde59', margin: 0 }}>📈 RPA Performance Analytics & Visual Telemetry</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>Comprehensive visual charts tracking bot usage, daily/monthly execution volume, processing latencies, success rates, and queue health.</p>
            </div>

            <div className="rpa-grid-2">
                {/* Daily Automation Volume Bar Chart */}
                <div className="rpa-card">
                    <h4 style={{ color: '#ffde59', marginBottom: '1rem' }}>📊 Daily Automation Task Volume</h4>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '180px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                        {dailyStats.map(d => {
                            const pct = (d.count / maxDaily) * 100;
                            return (
                                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#ffde59', fontWeight: 700, marginBottom: '0.2rem' }}>{d.count}</div>
                                    <div style={{ width: '100%', height: `${pct}%`, background: 'linear-gradient(180deg, #ffde59, #34d399)', borderRadius: '4px 4px 0 0' }}></div>
                                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.4rem' }}>{d.day}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Success vs Failure Distribution */}
                <div className="rpa-card">
                    <h4 style={{ color: '#ffde59', marginBottom: '1rem' }}>🎯 Success vs Failure Rate Breakdown</h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                                <span style={{ color: '#34d399', fontWeight: 600 }}>Execution Success Rate</span>
                                <span style={{ color: '#34d399', fontWeight: 700 }}>98.4% (1,011 Jobs)</span>
                            </div>
                            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                                <div style={{ width: '98.4%', height: '100%', background: '#34d399', borderRadius: '5px' }}></div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                                <span style={{ color: '#f87171', fontWeight: 600 }}>Failure Rate (Handled Exceptions)</span>
                                <span style={{ color: '#f87171', fontWeight: 700 }}>1.6% (16 Jobs)</span>
                            </div>
                            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                                <div style={{ width: '1.6%', height: '100%', background: '#f87171', borderRadius: '5px' }}></div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                                <span style={{ color: '#38bdf8', fontWeight: 600 }}>Queue Retention & Processing Speed</span>
                                <span style={{ color: '#38bdf8', fontWeight: 700 }}>18 tasks queued | 2.4s avg time</span>
                            </div>
                            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                                <div style={{ width: '75%', height: '100%', background: '#38bdf8', borderRadius: '5px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Automation & Bot Usage Stats */}
            <div className="rpa-grid-2">
                <div className="rpa-card">
                    <h4 style={{ color: '#ffde59', marginBottom: '0.75rem' }}>🗓️ Monthly Automation Volume Trend</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginTop: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>January 2026</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>3,420</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>February 2026</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffde59' }}>4,890</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>March 2026 (Est.)</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>6,200</div>
                        </div>
                    </div>
                </div>

                <div className="rpa-card">
                    <h4 style={{ color: '#ffde59', marginBottom: '0.75rem' }}>🤖 Bot Fleet Utilization Index</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginTop: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Active Fleet</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>{bots.filter(b => b.status === 'RUNNING').length} Bots</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Workflows</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>{jobs.length + 8} Active</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RPAAnalytics;
