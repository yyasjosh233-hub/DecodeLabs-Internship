import React, { useState } from 'react';

const DocumentProcessing = () => {
    const [selectedDoc, setSelectedDoc] = useState('Invoice_DVJ_9981.pdf');
    const [fileType, setFileType] = useState('PDF');
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedFields, setExtractedFields] = useState({
        invoiceNumber: 'INV-2026-9981',
        customerName: 'Acme Heavy Industrial Systems Corp',
        amount: '$45,250.00',
        date: '2026-02-28',
        gst: '$8,145.00',
        purchaseOrder: 'PO-77412-A'
    });

    const handleFieldChange = (key, val) => {
        setExtractedFields(prev => ({ ...prev, [key]: val }));
    };

    const runExtraction = () => {
        setIsExtracting(true);
        setTimeout(() => {
            setIsExtracting(false);
        }, 600);
    };

    return (
        <div className="rpa-document-processing">
            <div className="rpa-card" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ color: '#ffde59', margin: 0 }}>📄 Intelligent Document Processing & Data Extraction</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>Extract key business entities automatically from invoices, purchase orders, contracts, and multi-format files using neural OCR.</p>
            </div>

            <div className="rpa-grid-2">
                {/* Upload & Document Selector */}
                <div className="rpa-card">
                    <h4 style={{ color: '#ffde59', marginBottom: '1rem' }}>📁 Document Input & Format Selection</h4>
                    
                    <div className="rpa-input-group">
                        <label>Supported File Formats</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {['PDF', 'Word', 'Excel', 'CSV', 'JSON', 'XML', 'OCR Image'].map(fmt => (
                                <button 
                                    key={fmt} 
                                    className={`rpa-btn rpa-btn-sm ${fileType === fmt ? 'rpa-btn-primary' : ''}`}
                                    onClick={() => setFileType(fmt)}
                                >
                                    {fmt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rpa-input-group" style={{ marginTop: '1rem' }}>
                        <label>Select Sample Document</label>
                        <select className="rpa-input" value={selectedDoc} onChange={(e) => setSelectedDoc(e.target.value)}>
                            <option value="Invoice_DVJ_9981.pdf">Invoice_DVJ_9981.pdf (Invoice PDF)</option>
                            <option value="PurchaseOrder_Acme_774.docx">PurchaseOrder_Acme_774.docx (Word PO)</option>
                            <option value="VendorLedger_2026.xlsx">VendorLedger_2026.xlsx (Excel Sheet)</option>
                            <option value="RawClaims_Scan.png">RawClaims_Scan.png (OCR Image Scan)</option>
                        </select>
                    </div>

                    <div style={{ background: '#051515', border: '1px stroke rgba(255,255,255,0.1)', padding: '2rem', textAlign: 'center', borderRadius: '10px', marginTop: '1rem' }}>
                        <div style={{ fontSize: '2.5rem' }}>📄</div>
                        <div style={{ color: '#e2e8f0', fontWeight: 600, marginTop: '0.5rem' }}>{selectedDoc}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.2rem' }}>Format: {fileType} | OCR Model: High-Precision LayoutLMv3</div>
                        <button className="rpa-btn rpa-btn-primary" onClick={runExtraction} disabled={isExtracting} style={{ marginTop: '1rem' }}>
                            {isExtracting ? '⚡ Extracting Fields...' : '⚡ Run AI Data Extraction'}
                        </button>
                    </div>
                </div>

                {/* Extracted Fields Form */}
                <div className="rpa-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ color: '#ffde59', margin: 0 }}>✨ Extracted Business Entities</h4>
                        <span className="rpa-badge-accent">Confidence 99.2%</span>
                    </div>

                    <div className="rpa-input-group">
                        <label>Invoice Number</label>
                        <input type="text" className="rpa-input" value={extractedFields.invoiceNumber} onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)} />
                    </div>

                    <div className="rpa-input-group">
                        <label>Customer Name</label>
                        <input type="text" className="rpa-input" value={extractedFields.customerName} onChange={(e) => handleFieldChange('customerName', e.target.value)} />
                    </div>

                    <div className="rpa-grid-2" style={{ gap: '0.75rem', marginBottom: 0 }}>
                        <div className="rpa-input-group">
                            <label>Amount (Total)</label>
                            <input type="text" className="rpa-input" value={extractedFields.amount} onChange={(e) => handleFieldChange('amount', e.target.value)} />
                        </div>
                        <div className="rpa-input-group">
                            <label>Invoice Date</label>
                            <input type="text" className="rpa-input" value={extractedFields.date} onChange={(e) => handleFieldChange('date', e.target.value)} />
                        </div>
                    </div>

                    <div className="rpa-grid-2" style={{ gap: '0.75rem', marginBottom: 0 }}>
                        <div className="rpa-input-group">
                            <label>GST / Tax Amount</label>
                            <input type="text" className="rpa-input" value={extractedFields.gst} onChange={(e) => handleFieldChange('gst', e.target.value)} />
                        </div>
                        <div className="rpa-input-group">
                            <label>Purchase Order (PO)</label>
                            <input type="text" className="rpa-input" value={extractedFields.purchaseOrder} onChange={(e) => handleFieldChange('purchaseOrder', e.target.value)} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button className="rpa-btn rpa-btn-primary" onClick={() => alert('JSON Exported successfully!')}>💾 Export JSON</button>
                        <button className="rpa-btn" onClick={() => alert('Sent to Database!')}>📥 Push to DB</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentProcessing;
