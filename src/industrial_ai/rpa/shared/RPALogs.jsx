import React, { useState } from 'react';

const RPALogs = ({ logs }) => {
    const [levelFilter, setLevelFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLogs = logs.filter(log => {
        const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
        const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) || log.botId.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLevel && matchesSearch;
    });

    const handleExport = () => {
        const text = filteredLogs.map(l => `[${l.timestamp}] [${l.level}] [${l.botId}] ${l.message}`).join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `RPA_System_Logs_${Date.now()}.log`;
        a.click();
    };

    return (
        <div className="rpa-logs-view">
            <div className="rpa-card" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ color: '#ffde59', margin: 0 }}>📜 System Real-Time & Audit Logs Console</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>Filter execution logs by error levels, search message text, track worker bot activity, and download diagnostic log files.</p>
            </div>

            {/* Filter Bar */}
            <div className="rpa-card" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>Level Filter:</span>
                    {['ALL', 'INFO', 'WARN', 'ERROR', 'SUCCESS'].map(lvl => (
                        <button 
                            key={lvl} 
                            className={`rpa-btn rpa-btn-sm ${levelFilter === lvl ? 'rpa-btn-primary' : ''}`}
                            onClick={() => setLevelFilter(lvl)}
                        >
                            {lvl}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                        type="text" 
                        className="rpa-input" 
                        placeholder="Search logs or Bot ID..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '220px' }}
                    />
                    <button className="rpa-btn" onClick={handleExport}>💾 Export Logs</button>
                </div>
            </div>

            {/* Log Stream Box */}
            <div className="rpa-card">
                <div className="rpa-log-stream" style={{ minHeight: '400px', maxHeight: '550px' }}>
                    {filteredLogs.length === 0 ? (
                        <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '2rem' }}>No log entries match the current filter criteria.</div>
                    ) : (
                        filteredLogs.map(l => (
                            <div key={l.id} className="rpa-log-row">
                                <span style={{ color: '#64748b' }}>[{l.timestamp}]</span>{' '}
                                <span className={`rpa-log-${l.level}`} style={{ fontWeight: 700 }}>[{l.level}]</span>{' '}
                                <span style={{ color: '#ffde59' }}>[{l.botId}]</span>{' '}
                                <span>{l.message}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default RPALogs;
