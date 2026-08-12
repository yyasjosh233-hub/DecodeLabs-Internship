import React, { useState } from 'react';

const BotManager = ({ bots, onUpdateBotStatus, onCreateBot, onDeleteBot }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showLogsModal, setShowLogsModal] = useState(null);
    const [newBotName, setNewBotName] = useState('');
    const [newBotWorkflow, setNewBotWorkflow] = useState('ERP Invoice Automation');

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newBotName.trim()) return;
        onCreateBot({
            name: newBotName,
            workflow: newBotWorkflow
        });
        setNewBotName('');
        setShowCreateModal(false);
    };

    return (
        <div className="rpa-bot-manager">
            {/* Top Bar */}
            <div className="rpa-card" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ color: '#ffde59', margin: 0 }}>🤖 Enterprise Bot Fleet Control</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>Deploy, monitor, pause, resume, and manage industrial RPA worker bots.</p>
                </div>
                <button className="rpa-btn rpa-btn-primary" onClick={() => setShowCreateModal(true)}>
                    + Create New Robot
                </button>
            </div>

            {/* Bots Grid Cards */}
            <div className="rpa-grid-2">
                {bots.map(bot => (
                    <div key={bot.id} className="rpa-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🤖</span>
                                    <div>
                                        <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', margin: 0 }}>{bot.name}</h4>
                                        <span style={{ fontSize: '0.75rem', color: '#ffde59', fontWeight: 600 }}>{bot.id}</span>
                                    </div>
                                </div>
                                <span className={`rpa-status-tag rpa-status-${bot.status.toLowerCase()}`}>
                                    <span className={`rpa-dot rpa-dot-${bot.status.toLowerCase()}`}></span>
                                    {bot.status}
                                </span>
                            </div>

                            <div style={{ background: 'rgba(5, 21, 21, 0.6)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Assigned Workflow:</div>
                                <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>📋 {bot.workflow}</div>
                            </div>

                            {/* Telemetry Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem', textAlign: 'center' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Tasks Run</div>
                                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{bot.assignedTasks}</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Success Rate</div>
                                    <div style={{ fontWeight: 700, color: '#34d399' }}>{bot.successRate}%</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>CPU / RAM</div>
                                    <div style={{ fontWeight: 700, color: '#38bdf8' }}>{bot.cpu}% / {bot.memory}MB</div>
                                </div>
                            </div>
                        </div>

                        {/* Control Actions */}
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
                            {bot.status === 'RUNNING' ? (
                                <button className="rpa-btn rpa-btn-sm" onClick={() => onUpdateBotStatus(bot.id, 'PAUSED')}>⏸️ Pause</button>
                            ) : (
                                <button className="rpa-btn rpa-btn-sm rpa-btn-primary" onClick={() => onUpdateBotStatus(bot.id, 'RUNNING')}>▶️ Start</button>
                            )}

                            {bot.status !== 'IDLE' && (
                                <button className="rpa-btn rpa-btn-sm" onClick={() => onUpdateBotStatus(bot.id, 'IDLE')}>⏹️ Stop</button>
                            )}

                            <button className="rpa-btn rpa-btn-sm" onClick={() => setShowLogsModal(bot)}>📜 Logs</button>
                            <button className="rpa-btn rpa-btn-sm rpa-btn-danger" onClick={() => onDeleteBot(bot.id)}>🗑️ Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Bot Modal */}
            {showCreateModal && (
                <div className="rpa-modal-overlay">
                    <div className="rpa-modal">
                        <div className="rpa-modal-header">
                            <h3>🤖 Provision New Robot Worker</h3>
                            <button className="rpa-btn rpa-btn-sm" onClick={() => setShowCreateModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="rpa-input-group">
                                <label>Bot Name</label>
                                <input 
                                    type="text" 
                                    className="rpa-input" 
                                    placeholder="e.g. Sales Invoice Processor" 
                                    value={newBotName}
                                    onChange={(e) => setNewBotName(e.target.value)}
                                    required 
                                />
                            </div>

                            <div className="rpa-input-group">
                                <label>Assign Initial Workflow</label>
                                <select 
                                    className="rpa-input"
                                    value={newBotWorkflow}
                                    onChange={(e) => setNewBotWorkflow(e.target.value)}
                                >
                                    <option value="ERP Invoice Automation">ERP Invoice Automation</option>
                                    <option value="PO Email Scraping Pipeline">PO Email Scraping Pipeline</option>
                                    <option value="Quarterly Ledger Reconciler">Quarterly Ledger Reconciler</option>
                                    <option value="PostgreSQL-MongoDB Sync">PostgreSQL-MongoDB Sync</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                                <button type="button" className="rpa-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="rpa-btn rpa-btn-primary">Provision Bot</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Logs Modal */}
            {showLogsModal && (
                <div className="rpa-modal-overlay">
                    <div className="rpa-modal" style={{ maxWidth: '700px' }}>
                        <div className="rpa-modal-header">
                            <h3>📜 Execution Telemetry Logs - {showLogsModal.name}</h3>
                            <button className="rpa-btn rpa-btn-sm" onClick={() => setShowLogsModal(null)}>&times;</button>
                        </div>
                        <div className="rpa-log-stream">
                            <div className="rpa-log-row rpa-log-INFO">[16:44:00] Initialized worker daemon process PID 8892</div>
                            <div className="rpa-log-row rpa-log-INFO">[16:44:02] Connected to RPA Message Broker queue</div>
                            <div className="rpa-log-row rpa-log-SUCCESS">[16:44:10] Executed workflow [{showLogsModal.workflow}] successfully</div>
                            <div className="rpa-log-row rpa-log-INFO">[16:44:12] CPU load: {showLogsModal.cpu}% | RAM: {showLogsModal.memory}MB</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BotManager;
