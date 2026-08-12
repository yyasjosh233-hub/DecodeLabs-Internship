import React, { useState } from 'react';

const PDFAutomation = () => {
    const [pdfFile, setPdfFile] = useState('DVJ_Enterprise_Contract_2026.pdf');
    const [pageCount, setPageCount] = useState(12);
    const [selectedAction, setSelectedAction] = useState('Extract Text');

    const handleRunPDFAction = () => {
        alert(`Executed PDF Automation action [${selectedAction}] on ${pdfFile}`);
    };

    return (
        <div className="rpa-pdf-automation">
            <div className="rpa-card" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ color: '#ffde59', margin: 0 }}>📄 PDF Automation & Form Processing</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>Extract PDF text, fill AcroForms, split/merge multi-page documents, apply digital signatures and OCR overlays.</p>
            </div>

            <div className="rpa-grid-2">
                <div className="rpa-card">
                    <h4 style={{ color: '#ffde59', marginBottom: '1rem' }}>📄 Target PDF Document</h4>
                    
                    <div className="rpa-input-group">
                        <label>Active Document</label>
                        <select className="rpa-input" value={pdfFile} onChange={(e) => setPdfFile(e.target.value)}>
                            <option value="DVJ_Enterprise_Contract_2026.pdf">DVJ_Enterprise_Contract_2026.pdf (12 pages)</option>
                            <option value="Vendor_Agreement_Draft.pdf">Vendor_Agreement_Draft.pdf (4 pages)</option>
                            <option value="ISO9001_Quality_Manual.pdf">ISO9001_Quality_Manual.pdf (45 pages)</option>
                        </select>
                    </div>

                    <div style={{ background: '#051515', padding: '1.5rem', borderRadius: '10px', marginTop: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#94a3b8' }}>Total Pages:</span>
                            <span style={{ fontWeight: 700, color: '#ffffff' }}>{pageCount} Pages</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#94a3b8' }}>Encrypted / Protected:</span>
                            <span style={{ fontWeight: 700, color: '#34d399' }}>No (Unlocked)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#94a3b8' }}>Forms Detected:</span>
                            <span style={{ fontWeight: 700, color: '#38bdf8' }}>6 Fillable Form Fields</span>
                        </div>
                    </div>
                </div>

                <div className="rpa-card">
                    <h4 style={{ color: '#ffde59', marginBottom: '1rem' }}>⚙️ PDF Processing Toolset</h4>
                    
                    <div className="rpa-input-group">
                        <label>Operation Mode</label>
                        <select className="rpa-input" value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
                            <option value="Extract Text">Extract Full Text Content</option>
                            <option value="Extract Forms">Extract AcroForm Key-Values</option>
                            <option value="Split PDF">Split PDF into Single Pages</option>
                            <option value="Merge PDFs">Merge Multiple PDF Files</option>
                            <option value="Watermark PDF">Stamp Confidential Watermark</option>
                            <option value="OCR Overlay">Generate Searchable OCR Text Layer</option>
                        </select>
                    </div>

                    <button className="rpa-btn rpa-btn-primary" onClick={handleRunPDFAction} style={{ width: '100%', marginTop: '1rem' }}>
                        ⚡ Execute {selectedAction}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PDFAutomation;
