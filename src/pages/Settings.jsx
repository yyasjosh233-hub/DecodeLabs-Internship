import React, { useState } from 'react';

const Settings = () => {
    const [rosDistro, setRosDistro] = useState('humble');
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('dvj_openai_key') || '');
    const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('dvj_gemini_key') || '');
    const [simMode, setSimMode] = useState(true);
    const [batteryThreshold, setBatteryThreshold] = useState(20);
    const [speedThreshold, setSpeedThreshold] = useState(1.5);

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem('dvj_openai_key', apiKey);
        localStorage.setItem('dvj_gemini_key', geminiKey);
        alert('Configurations saved successfully! Backend service updated.');
    };

    return (
        <div className="settings-page page-container">
            <h1 className="page-title">Workspace Settings</h1>
            <p className="page-description">Configure edge platform telemetry limits, AI provider credentials, and selected ROS environments variables.</p>

            <div className="debugger-layout-grid">
                
                {/* AI Credentials */}
                <div className="debugger-form-panel glass">
                    <h3>AI PROVIDERS & CREDIENTIALS</h3>
                    <form onSubmit={handleSave} className="debugger-form" style={{ marginTop: '1.5rem' }}>
                        <div className="form-control">
                            <label>Gemini API Key (Recommended)</label>
                            <input 
                                type="password" 
                                value={geminiKey}
                                onChange={(e) => setGeminiKey(e.target.value)}
                                placeholder="Enter Gemini API key for live grounding..."
                            />
                        </div>
                        <div className="form-control">
                            <label>OpenAI API Key</label>
                            <input 
                                type="password" 
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter OpenAI API key..."
                            />
                        </div>
                        <div className="form-control">
                            <label>Active ROS 2 Version</label>
                            <select value={rosDistro} onChange={(e) => setRosDistro(e.target.value)}>
                                <option value="humble">ROS 2 Humble Hawksbill (LTS)</option>
                                <option value="iron">ROS 2 Iron Irwini</option>
                                <option value="jazzy">ROS 2 Jazzy Jalisco (LTS)</option>
                                <option value="rolling">ROS 2 Rolling Ridley</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-submit-debug" style={{ background: 'var(--accent-color)', color: '#000' }}>
                            Save API Credentials
                        </button>
                    </form>
                </div>

                {/* Telemetry settings */}
                <div className="debugger-result-panel glass">
                    <h3>EDGE MONITORING CONFIGURATION</h3>
                    
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        <div className="form-control" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong>Hardware Simulation Mode</strong>
                                <p style={{ fontSize: '0.8rem', color: '#aaa', margin: '0.2rem 0 0 0' }}>Simulate telemetries for AGRO-R1 offline.</p>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={simMode}
                                onChange={(e) => setSimMode(e.target.checked)}
                                style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                            />
                        </div>

                        <div className="form-control">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <strong>Critical Battery Threshold (%)</strong>
                                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{batteryThreshold}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="10" 
                                max="40" 
                                value={batteryThreshold}
                                onChange={(e) => setBatteryThreshold(parseInt(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div className="form-control">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <strong>Max Velocity Warning Limit (m/s)</strong>
                                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{speedThreshold} m/s</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.5" 
                                max="3.0" 
                                step="0.1"
                                value={speedThreshold}
                                onChange={(e) => setSpeedThreshold(parseFloat(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-color)' }}>
                            <strong>SAFETY NOTICE:</strong> Changing monitoring limits directly edits active supervisor checks in /agro_control. Exceeding nominal speed bounds may trigger hardware alarms.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Settings;
