import React, { useState } from 'react';

const RPASettings = () => {
    const [engineSpeed, setEngineSpeed] = useState(80);
    const [apiKey, setApiKey] = useState('rpa_live_sk_99182374910283');
    const [smtpServer, setSmtpServer] = useState('smtp.dvjgroup.ai:587');
    const [ocrConfidence, setOcrConfidence] = useState(0.85);

    const handleSave = (e) => {
        e.preventDefault();
        alert('RPA System Settings saved successfully!');
    };

    return (
        <div className="rpa-settings-view">
            <div className="rpa-card" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ color: '#ffde59', margin: 0 }}>⚙️ RPA Platform System Settings & Credentials</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>Manage API integration keys, execution speed, email servers, DB connection pools, and AI confidence thresholds.</p>
            </div>

            <form onSubmit={handleSave} className="rpa-card" style={{ maxWidth: '650px' }}>
                <div className="rpa-input-group">
                    <label>RPA Worker Execution Speed ({engineSpeed}%)</label>
                    <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={engineSpeed} 
                        onChange={(e) => setEngineSpeed(Number(e.target.value))}
                        style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <span>Eco / Low Load</span>
                        <span>High Throughput</span>
                    </div>
                </div>

                <div className="rpa-input-group">
                    <label>Platform API Key</label>
                    <input type="password" className="rpa-input" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                </div>

                <div className="rpa-input-group">
                    <label>Default SMTP Mail Gateway</label>
                    <input type="text" className="rpa-input" value={smtpServer} onChange={(e) => setSmtpServer(e.target.value)} />
                </div>

                <div className="rpa-input-group">
                    <label>AI OCR Minimum Confidence Threshold ({ocrConfidence * 100}%)</label>
                    <input type="number" step="0.05" min="0.5" max="1.0" className="rpa-input" value={ocrConfidence} onChange={(e) => setOcrConfidence(Number(e.target.value))} />
                </div>

                <button type="submit" className="rpa-btn rpa-btn-primary" style={{ marginTop: '1rem' }}>
                    💾 Save System Configuration
                </button>
            </form>
        </div>
    );
};

export default RPASettings;
