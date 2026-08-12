import React, { useState } from 'react';

const FileAutomation = () => {
    const [fileList, setFileList] = useState([
        { id: 1, name: 'Invoices_2026_Q1.zip', path: '/rpa/incoming/Invoices_2026_Q1.zip', size: '14.2 MB', type: 'ZIP Archive' },
        { id: 2, name: 'PO_Vendor_Manifest.csv', path: '/rpa/processed/PO_Vendor_Manifest.csv', size: '420 KB', type: 'CSV Document' },
        { id: 3, name: 'Ledger_Export.xlsx', path: '/rpa/exports/Ledger_Export.xlsx', size: '2.8 MB', type: 'Excel Spreadsheet' }
    ]);

    const handleFileOp = (actionName) => {
        alert(`Executed File Operation: [${actionName}] successfully.`);
    };

    return (
        <div className="rpa-file-automation">
            <div className="rpa-card" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ color: '#ffde59', margin: 0 }}>📁 File System Automation & Directory Monitor</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>Automate file moves, folder creation, renaming, deletion, ZIP compression/decompression, and real-time folder watching.</p>
            </div>

            {/* Quick Action Toolbar */}
            <div className="rpa-card" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="rpa-btn rpa-btn-primary" onClick={() => handleFileOp('Create Folder')}>📁 Create Folder</button>
                <button className="rpa-btn" onClick={() => handleFileOp('Move File')}>📦 Move File</button>
                <button className="rpa-btn" onClick={() => handleFileOp('Rename File')}>✏️ Rename File</button>
                <button className="rpa-btn" onClick={() => handleFileOp('Compress Files (ZIP)')}>🗜️ Compress ZIP</button>
                <button className="rpa-btn" onClick={() => handleFileOp('Extract ZIP')}>📂 Extract ZIP</button>
                <button className="rpa-btn rpa-btn-danger" onClick={() => handleFileOp('Delete File')}>🗑️ Delete File</button>
            </div>

            {/* Simulated Live Directory Tree */}
            <div className="rpa-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ color: '#ffde59', margin: 0 }}>🗂️ Live Monitored Directory Tree</h4>
                    <span className="rpa-badge-accent">Folder Watcher Active</span>
                </div>

                <div className="rpa-table-wrapper">
                    <table className="rpa-table">
                        <thead>
                            <tr>
                                <th>File Name</th>
                                <th>System Path</th>
                                <th>File Size</th>
                                <th>Type</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fileList.map(f => (
                                <tr key={f.id}>
                                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{f.name}</td>
                                    <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}><code>{f.path}</code></td>
                                    <td>{f.size}</td>
                                    <td>
                                        <span className="rpa-status-tag rpa-status-running">{f.type}</span>
                                    </td>
                                    <td>
                                        <button className="rpa-btn rpa-btn-sm" onClick={() => handleFileOp(`Process ${f.name}`)}>⚡ Process</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FileAutomation;
