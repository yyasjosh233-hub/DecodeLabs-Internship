import React, { useState } from 'react';
import './IIoTStyles.css';

const IIoTPage = () => {
    const [selectedProtocol, setSelectedProtocol] = useState('OPC UA');
    const [devices, setDevices] = useState([
        { id: 'DEV-101', name: 'Siemens S7-1500 PLC', protocol: 'OPC UA', ip: '192.168.1.50', status: 'ONLINE', firmware: 'v2.9.4', edgeAI: 'Active', latency: '1.2ms' },
        { id: 'DEV-102', name: 'Allen Bradley ControlLogix', protocol: 'EtherNet/IP', ip: '192.168.1.51', status: 'ONLINE', firmware: 'v33.011', edgeAI: 'Active', latency: '1.8ms' },
        { id: 'DEV-103', name: 'KUKA KR C4 Controller', protocol: 'Modbus TCP', ip: '192.168.1.80', status: 'ONLINE', firmware: 'v8.6', edgeAI: 'Active', latency: '2.1ms' },
        { id: 'DEV-104', name: 'NVIDIA Jetson Orin Edge Node', protocol: 'MQTT', ip: '192.168.1.120', status: 'ONLINE', firmware: 'JetPack 6.0', edgeAI: 'Active (YOLOv11)', latency: '0.4ms' },
        { id: 'DEV-105', name: 'ESP32 Smart Sensor Array', protocol: 'MQTT', ip: '192.168.1.200', status: 'ONLINE', firmware: 'v1.4.0', edgeAI: 'MicroTVM', latency: '5.2ms' }
    ]);

    const handleSendRemoteCommand = (devName, cmd) => {
        alert(`Executed Remote Command [${cmd}] on device "${devName}" via ${selectedProtocol} Gateway.`);
    };

    return (
        <div className="iiot-container">
            {/* Header Banner */}
            <div className="iiot-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ color: '#fbbf24', margin: 0, fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        📡 Industrial IoT (IIoT) Management & Edge AI
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Multi-Protocol Industrial Connectivity (MQTT, OPC UA, Modbus TCP) for Siemens, AB, ABB, KUKA, Fanuc, UR, ESP32, RPi & Jetson.
                    </p>
                </div>
                <span className="iiot-badge">5 Gateways Active</span>
            </div>

            {/* Protocol Selector Bar */}
            <div className="iiot-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Active Protocol Gateway:</span>
                    {['MQTT', 'OPC UA', 'Modbus TCP', 'Siemens S7-Comm', 'EtherNet/IP'].map(p => (
                        <button key={p} className={`rpa-btn rpa-btn-sm ${selectedProtocol === p ? 'rpa-btn-primary' : ''}`} onClick={() => setSelectedProtocol(p)}>
                            {p}
                        </button>
                    ))}
                </div>
                <span className="rpa-status-tag rpa-status-running"><span className="rpa-dot rpa-dot-running"></span> Gateway Sync 100Hz</span>
            </div>

            {/* Device Fleet Cards */}
            <div className="pm-grid-2">
                {devices.map(dev => (
                    <div key={dev.id} className="iiot-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div>
                                <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', margin: 0 }}>{dev.name}</h4>
                                <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>{dev.id} | {dev.ip}</span>
                            </div>
                            <span className="rpa-status-tag rpa-status-running">{dev.status}</span>
                        </div>

                        <div style={{ background: '#051515', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>
                                <span>Protocol: <strong style={{ color: '#fbbf24' }}>{dev.protocol}</strong></span>
                                <span>Firmware: <strong>{dev.firmware}</strong></span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1' }}>
                                <span>Edge AI Model: <strong style={{ color: '#34d399' }}>{dev.edgeAI}</strong></span>
                                <span>Latency: <strong>{dev.latency}</strong></span>
                            </div>
                        </div>

                        {/* Remote Command Actions */}
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <button className="rpa-btn rpa-btn-sm" onClick={() => handleSendRemoteCommand(dev.name, 'START_CYCLE')}>▶️ Start Cycle</button>
                            <button className="rpa-btn rpa-btn-sm" onClick={() => handleSendRemoteCommand(dev.name, 'RECALIBRATE')}>🔄 Recalibrate</button>
                            <button className="rpa-btn rpa-btn-sm" onClick={() => handleSendRemoteCommand(dev.name, 'FIRMWARE_OTA_UPDATE')}>☁️ OTA Update</button>
                            <button className="rpa-btn rpa-btn-sm rpa-btn-danger" onClick={() => handleSendRemoteCommand(dev.name, 'EMERGENCY_STOP')}>🚨 E-Stop</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IIoTPage;
