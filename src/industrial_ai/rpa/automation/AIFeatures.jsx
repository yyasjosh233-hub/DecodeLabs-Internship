import React, { useState } from 'react';

const AIFeatures = () => {
    const [selectedFeature, setSelectedFeature] = useState('Document Classification');
    const [resultOutput, setResultOutput] = useState('');

    const handleRunAI = (featureName) => {
        let text = '';
        if (featureName === 'Document Classification') {
            text = '🤖 Document Classified: "Tax & Financial Invoice (99.4% confidence)"';
        } else if (featureName === 'Invoice Classification') {
            text = '🤖 Invoice Sub-Type: "Capital Expenditure - Robotics Hardware (CapEx)"';
        } else if (featureName === 'Email Classification') {
            text = '🤖 Email Intent: "Vendor Urgent Payment Query -> Priority High"';
        } else if (featureName === 'Auto Summary') {
            text = '📝 Executive Summary: Document outlines a purchase agreement for 5 units of 6-DOF industrial robot arms total value $145,000 to be delivered by Q2 2026.';
        } else if (featureName === 'Duplicate Detection') {
            text = '⚠️ Duplicate Detection: Invoice #INV-2026-8819 matches 99.8% with existing record ID JOB-901 processed on 2026-02-15.';
        } else if (featureName === 'Anomaly Detection') {
            text = '🚨 Anomaly Warning: Amount ($145,000) exceeds 3-sigma historical mean for vendor "Apex Actuators Ltd" by +210%. Requires supervisor sign-off.';
        } else if (featureName === 'Recommendation Engine') {
            text = '💡 RPA Recommendation: Route this document to Automated Parallel OCR pipeline to decrease average execution time from 2.4s to 1.1s.';
        }
        setSelectedFeature(featureName);
        setResultOutput(text);
    };

    return (
        <div className="rpa-ai-features">
            <div className="rpa-card" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ color: '#ffde59', margin: 0 }}>🧠 AI-Powered RPA Cognition Engine</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>Leverage grounded LLM classification, summarization, duplicate detection, anomaly alerts, and workflow recommendations.</p>
            </div>

            {/* AI Feature Selector Toolbar */}
            <div className="rpa-card" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                    'Document Classification',
                    'Invoice Classification',
                    'Email Classification',
                    'Auto Summary',
                    'Duplicate Detection',
                    'Anomaly Detection',
                    'Recommendation Engine'
                ].map(feat => (
                    <button 
                        key={feat} 
                        className={`rpa-btn ${selectedFeature === feat ? 'rpa-btn-primary' : ''}`}
                        onClick={() => handleRunAI(feat)}
                    >
                        ⚡ {feat}
                    </button>
                ))}
            </div>

            {/* AI Output Card */}
            <div className="rpa-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ color: '#ffde59', margin: 0 }}>✨ AI Insights & Telemetry Response</h4>
                    <span className="rpa-badge-accent">{selectedFeature}</span>
                </div>

                <div style={{ background: '#051515', padding: '1.5rem', borderRadius: '10px', border: '1px solid rgba(255,222,89,0.2)', fontSize: '0.95rem', color: '#34d399', fontFamily: 'Fira Code, monospace', minHeight: '120px' }}>
                    {resultOutput || 'Select any AI feature above to run neural inference and observe intelligent output.'}
                </div>
            </div>
        </div>
    );
};

export default AIFeatures;
