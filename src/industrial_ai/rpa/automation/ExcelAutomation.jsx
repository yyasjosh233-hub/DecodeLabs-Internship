import React, { useState } from 'react';

const ExcelAutomation = () => {
    const [selectedSheet, setSelectedSheet] = useState('Sheet1_Ledger');
    const [gridData, setGridData] = useState([
        { id: 1, row: 'R1', vendor: 'Apex Robotics Inc', invoiceNo: 'INV-401', amount: 12500, tax: 2250, status: 'Audited' },
        { id: 2, row: 'R2', vendor: 'Global Actuators LLC', invoiceNo: 'INV-402', amount: 8400, tax: 1512, status: 'Pending' },
        { id: 3, row: 'R3', vendor: 'NVIDIA Hardware Supplier', invoiceNo: 'INV-403', amount: 35000, tax: 6300, status: 'Audited' },
        { id: 4, row: 'R4', vendor: 'Fastening Logistics GmbH', invoiceNo: 'INV-404', amount: 4200, tax: 756, status: 'Audited' }
    ]);
    const [formulaBar, setFormulaBar] = useState('=SUM(D2:D5)');

    const handleCellChange = (id, field, val) => {
        setGridData(gridData.map(r => r.id === id ? { ...r, [field]: val } : r));
    };

    const handleRunMacro = (macroName) => {
        alert(`Executed Excel Macro Automation: [${macroName}] successfully.`);
    };

    return (
        <div className="rpa-excel-automation">
            <div className="rpa-card" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ color: '#ffde59', margin: 0 }}>📊 Excel & Spreadsheet Automation Engine</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>Read workbooks, update cells, generate pivot tables, format financial ledgers, and export analytical charts automatically.</p>
            </div>

            {/* Workbook Toolbar */}
            <div className="rpa-card" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Workbook:</span>
                    <select className="rpa-input" style={{ width: '220px' }} value={selectedSheet} onChange={(e) => setSelectedSheet(e.target.value)}>
                        <option value="Sheet1_Ledger">Financial_Ledger_Q1.xlsx</option>
                        <option value="Sheet2_Pivot">Vendor_Pivot_Summary.xlsx</option>
                        <option value="Sheet3_Raw">Raw_Production_Counts.xlsx</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="rpa-btn" onClick={() => handleRunMacro('Read Workbook')}>📖 Read Workbook</button>
                    <button className="rpa-btn rpa-btn-primary" onClick={() => handleRunMacro('Write Workbook')}>💾 Write Workbook</button>
                    <button className="rpa-btn" onClick={() => handleRunMacro('Pivot Tables')}>📐 Pivot Tables</button>
                    <button className="rpa-btn" onClick={() => handleRunMacro('Create Charts')}>📈 Create Charts</button>
                </div>
            </div>

            {/* Formula Bar */}
            <div className="rpa-card" style={{ marginBottom: '1rem', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: '#ffde59' }}>fx</span>
                <input 
                    type="text" 
                    className="rpa-input" 
                    value={formulaBar} 
                    onChange={(e) => setFormulaBar(e.target.value)} 
                    style={{ fontFamily: 'Fira Code, monospace', color: '#34d399' }}
                />
            </div>

            {/* Editable Spreadsheet Grid */}
            <div className="rpa-card">
                <h4 style={{ color: '#ffde59', marginBottom: '0.75rem' }}>🟢 Live Excel Cell Data Grid</h4>
                <div className="rpa-table-wrapper">
                    <table className="rpa-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Vendor Name</th>
                                <th>Invoice No</th>
                                <th>Amount ($)</th>
                                <th>Tax / GST ($)</th>
                                <th>Audit Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gridData.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 700, color: '#94a3b8' }}>{r.row}</td>
                                    <td>
                                        <input className="rpa-input" value={r.vendor} onChange={(e) => handleCellChange(r.id, 'vendor', e.target.value)} style={{ padding: '0.2rem 0.4rem' }} />
                                    </td>
                                    <td>
                                        <input className="rpa-input" value={r.invoiceNo} onChange={(e) => handleCellChange(r.id, 'invoiceNo', e.target.value)} style={{ padding: '0.2rem 0.4rem' }} />
                                    </td>
                                    <td>
                                        <input className="rpa-input" type="number" value={r.amount} onChange={(e) => handleCellChange(r.id, 'amount', Number(e.target.value))} style={{ padding: '0.2rem 0.4rem', color: '#ffde59', fontWeight: 700 }} />
                                    </td>
                                    <td>
                                        <input className="rpa-input" type="number" value={r.tax} onChange={(e) => handleCellChange(r.id, 'tax', Number(e.target.value))} style={{ padding: '0.2rem 0.4rem' }} />
                                    </td>
                                    <td>
                                        <span className={`rpa-status-tag ${r.status === 'Audited' ? 'rpa-status-running' : 'rpa-status-idle'}`}>
                                            {r.status}
                                        </span>
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

export default ExcelAutomation;
