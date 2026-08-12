import React, { useState } from 'react';

const TaskScheduler = ({ schedules, onAddSchedule, onToggleSchedule }) => {
    const [showModal, setShowModal] = useState(false);
    const [workflowName, setWorkflowName] = useState('ERP Invoice Automation');
    const [botName, setBotName] = useState('Invoice Processing Bot');
    const [cron, setCron] = useState('*/15 * * * *');

    const handleCreateSchedule = (e) => {
        e.preventDefault();
        onAddSchedule({
            workflowName,
            botName,
            cron,
            nextRun: 'In 5 mins',
            status: 'ACTIVE'
        });
        setShowModal(false);
    };

    return (
        <div className="rpa-task-scheduler">
            <div className="rpa-card" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ color: '#ffde59', margin: 0 }}>⏱️ Task Scheduler & Cron Triggers</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>Configure time-based, event-driven, and interval cron triggers for automated bot runs.</p>
                </div>
                <button className="rpa-btn rpa-btn-primary" onClick={() => setShowModal(true)}>
                    + Schedule New Job
                </button>
            </div>

            <div className="rpa-card">
                <div className="rpa-table-wrapper">
                    <table className="rpa-table">
                        <thead>
                            <tr>
                                <th>Schedule ID</th>
                                <th>Workflow Name</th>
                                <th>Assigned Robot</th>
                                <th>Cron Expression</th>
                                <th>Next Run</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map(sch => (
                                <tr key={sch.id}>
                                    <td style={{ fontWeight: 700, color: '#ffde59' }}>{sch.id}</td>
                                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{sch.workflowName}</td>
                                    <td style={{ color: '#38bdf8' }}>🤖 {sch.botName}</td>
                                    <td><code style={{ background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#34d399' }}>{sch.cron}</code></td>
                                    <td style={{ color: '#fbbf24' }}>⌛ {sch.nextRun}</td>
                                    <td>
                                        <span className={`rpa-status-tag ${sch.status === 'ACTIVE' ? 'rpa-status-running' : 'rpa-status-paused'}`}>
                                            {sch.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="rpa-btn rpa-btn-sm" onClick={() => onToggleSchedule(sch.id)}>
                                            {sch.status === 'ACTIVE' ? '⏸️ Pause' : '▶️ Enable'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="rpa-modal-overlay">
                    <div className="rpa-modal">
                        <div className="rpa-modal-header">
                            <h3>⏱️ Add Automated Schedule</h3>
                            <button className="rpa-btn rpa-btn-sm" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateSchedule}>
                            <div className="rpa-input-group">
                                <label>Target Workflow</label>
                                <input type="text" className="rpa-input" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} required />
                            </div>
                            <div className="rpa-input-group">
                                <label>Assigned Bot Worker</label>
                                <input type="text" className="rpa-input" value={botName} onChange={(e) => setBotName(e.target.value)} required />
                            </div>
                            <div className="rpa-input-group">
                                <label>Cron Expression (5-field)</label>
                                <input type="text" className="rpa-input" value={cron} onChange={(e) => setCron(e.target.value)} placeholder="e.g. 0 9 * * 1-5" required />
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Format: minute hour day-of-month month day-of-week</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                                <button type="button" className="rpa-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="rpa-btn rpa-btn-primary">Save Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskScheduler;
