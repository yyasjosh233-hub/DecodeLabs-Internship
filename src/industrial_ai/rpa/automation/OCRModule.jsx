import React, { useState } from 'react';

const OCRModule = () => {
    const [engine, setEngine] = useState('EasyOCR');
    const [targetType, setTargetType] = useState('Invoices');
    const [ocrResult, setOcrResult] = useState({
        rawText: `INVOICE #INV-2026-8819\nDATE: 28/02/2026\nVENDOR: DVJ INDUSTRIAL ROBOTICS HUB\nAMOUNT DUE: $18,450.00\nTAX ID: US-9918234`,
        confidenceScore: 98.6,
        detectedLines: 5
    });

    const handleRunOCR = () => {
        alert(`Executed OCR Scan using [${engine}] for [${targetType}] extraction mode.`);
    };

    return (
        <div className="rpa-ocr-module">
            <div className="rpa-card" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ color: '#ffde59', margin: 0 }}>🔍 Optical Character Recognition (OCR Engine)</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>Extract high-accuracy text, tables, forms, and structured invoice fields from scanned images using Tesseract & EasyOCR models.</p>
            </div>

            <div className="rpa-grid-2">
                <div className="rpa-card">
                    <h4 style={{ color: '#ffde59', marginBottom: '1rem' }}>⚙️ OCR Configuration</h4>

                    <div className="rpa-input-group">
                        <label>OCR Engine Model</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['Tesseract OCR', 'EasyOCR'].map(eng => (
                                <button key={eng} className={`rpa-btn ${engine === eng ? 'rpa-btn-primary' : ''}`} onClick={() => setEngine(eng)}>
                                    {eng}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rpa-input-group" style={{ marginTop: '1rem' }}>
                        <label>Extraction Target Mode</label>
                        <select className="rpa-input" value={targetType} onChange={(e) => setTargetType(e.target.value)}>
                            <option value="Invoices">Invoice Structure & Totals</option>
                            <option value="Tables">Tabular Grid Extraction</option>
                            <option value="Forms">Key-Value Form Pairs</option>
                            <option value="Text">Raw Freeform Text</option>
                        </select>
                    </div>

                    <button className="rpa-btn rpa-btn-primary" onClick={handleRunOCR} style={{ width: '100%', marginTop: '1rem' }}>
                        🔍 Run {engine} Scan
                    </button>
                </div>

                <div className="rpa-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ color: '#ffde59', margin: 0 }}>✨ OCR Output Stream</h4>
                        <span className="rpa-badge-accent">Accuracy {ocrResult.confidenceScore}%</span>
                    </div>

                    <textarea 
                        className="rpa-input" 
                        rows="6" 
                        value={ocrResult.rawText} 
                        onChange={(e) => setOcrResult({ ...ocrResult, rawText: e.target.value })}
                        style={{ fontFamily: 'Fira Code, monospace', color: '#34d399' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default OCRModule;
