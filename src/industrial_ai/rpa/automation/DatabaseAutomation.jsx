import React, { useState } from 'react';

const DatabaseAutomation = () => {
    const [dbEngine, setDbEngine] = useState('PostgreSQL');
    const [query, setQuery] = useState("SELECT * FROM erp_invoices WHERE status = 'PENDING' ORDER BY created_at DESC LIMIT 10;");
    const [queryResult, setQueryResult] = useState([
        { invoice_id: 'INV-1090', customer: 'BOSCH Manufacturing', amount: 14200.00, status: 'PENDING', sync_flag: true },
        { invoice_id: 'INV-1091', customer: 'Fanuc Robotics India', amount: 8900.50, status: 'PENDING', sync_flag: true },
        { invoice_id: 'INV-1092', customer: 'KUKA Systems GmbH', amount: 32100.00, status: 'PENDING', sync_flag: false }
    ]);
    const [executing, setExecuting] = useState(false);

    const handleExecuteQuery = () => {
        setExecuting(true);
        setTimeout(() => {
            setExecuting(false);
            alert(`Executed ${dbEngine} query successfully! Returned ${queryResult.length} rows.`);
        }, 500);
    };

    return (
        <div className="rpa-db-automation">
            <div className="rpa-card" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ color: '#ffde59', margin: 0 }}>🗄️ Database Automation & Multi-SQL Engine</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>Connect SQLite, PostgreSQL, MySQL, and MongoDB databases for automated insert, update, delete, search, and analytical queries.</p>
            </div>

            {/* DB Engine Switcher */}
            <div className="rpa-card" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Target Database Engine:</span>
                    {['SQLite', 'PostgreSQL', 'MySQL', 'MongoDB'].map(engine => (
                        <button key={engine} className={`rpa-btn rpa-btn-sm ${dbEngine === engine ? 'rpa-btn-primary' : ''}`} onClick={() => setDbEngine(engine)}>
                            {engine}
                        </button>
                    ))}
                </div>
                <span className="rpa-status-tag rpa-status-running"><span className="rpa-dot rpa-dot-running"></span> {dbEngine} Pool Active</span>
            </div>

            {/* Query Builder */}
            <div className="rpa-card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ color: '#ffde59', margin: 0 }}>⚡ SQL / Query Executor</h4>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="rpa-btn rpa-btn-sm" onClick={() => setQuery("INSERT INTO erp_invoices (invoice_id, amount) VALUES ('INV-999', 5000);")}>+ Insert</button>
                        <button className="rpa-btn rpa-btn-sm" onClick={() => setQuery("UPDATE erp_invoices SET status='PROCESSED' WHERE invoice_id='INV-1090';")}>✏️ Update</button>
                        <button className="rpa-btn rpa-btn-sm rpa-btn-danger" onClick={() => setQuery("DELETE FROM erp_invoices WHERE status='EXPIRED';")}>🗑️ Delete</button>
                    </div>
                </div>

                <textarea 
                    className="rpa-input" 
                    rows="3" 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ fontFamily: 'Fira Code, monospace', color: '#38bdf8', marginBottom: '0.75rem' }}
                />

                <button className="rpa-btn rpa-btn-primary" onClick={handleExecuteQuery} disabled={executing}>
                    {executing ? '⏳ Executing Query...' : '▶️ Execute Query'}
                </button>
            </div>

            {/* Results Grid */}
            <div className="rpa-card">
                <h4 style={{ color: '#ffde59', marginBottom: '0.75rem' }}>📋 Query Results Grid</h4>
                <div className="rpa-table-wrapper">
                    <table className="rpa-table">
                        <thead>
                            <tr>
                                <th>Invoice ID</th>
                                <th>Customer Name</th>
                                <th>Amount ($)</th>
                                <th>Status</th>
                                <th>Sync Flag</th>
                            </tr>
                        </thead>
                        <tbody>
                            {queryResult.map((r, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 700, color: '#ffde59' }}>{r.invoice_id}</td>
                                    <td style={{ color: '#f8fafc' }}>{r.customer}</td>
                                    <td>${r.amount.toLocaleString()}</td>
                                    <td>
                                        <span className="rpa-status-tag rpa-status-idle">{r.status}</span>
                                    </td>
                                    <td style={{ color: r.sync_flag ? '#34d399' : '#f87171' }}>{r.sync_flag ? 'TRUE' : 'FALSE'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DatabaseAutomation;
