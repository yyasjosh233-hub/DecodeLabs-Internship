import React, { useState, useRef, useEffect } from 'react';
import ConveyorSimulator from './ConveyorSimulator';
import { runInspectionPipeline, PIPELINE_STAGES, DEFECT_TYPES } from './OpenCVPipelineEngine';
import { generatePDFReport, generateCSVReport, generateExcelReport, generateJSONReport } from '../reports/ReportGenerator';
import { JsonTreeViewer, StatusBadge, MetricTile } from '../shared/SharedComponents';

const QualityInspectionPage = () => {
    // Current input source: 'SAMPLE' | 'CAMERA' | 'IMAGE'
    const [inputSource, setInputSource] = useState('SAMPLE');
    const [selectedSample, setSelectedSample] = useState('GEAR');
    const [forcedDefect, setForcedDefect] = useState('');

    // Media elements
    const videoRef = useRef(null);
    const uploadedImageRef = useRef(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState('');

    // Active inspection result payload
    const [currentInspection, setCurrentInspection] = useState(null);
    const [selectedPipelineStep, setSelectedPipelineStep] = useState('PASS_FAIL');
    const [isInspecting, setIsInspecting] = useState(false);

    // Inspection History
    const [history, setHistory] = useState([
        { inspectionId: 'INSP-849102', timestamp: '2026-08-06T22:00:00.000Z', partType: 'GEAR', status: 'PASS', confidenceScore: 98.6, defects: [], measurements: { outerDiameterMM: 120.02, innerBoreMM: 35.01 }, latencyMs: 11.4 },
        { inspectionId: 'INSP-849101', timestamp: '2026-08-06T21:45:00.000Z', partType: 'GEAR', status: 'FAIL', confidenceScore: 94.2, defects: ['Missing Gear Tooth'], measurements: { outerDiameterMM: 119.85, innerBoreMM: 35.04 }, latencyMs: 13.8 },
        { inspectionId: 'INSP-849100', timestamp: '2026-08-06T21:30:00.000Z', partType: 'BOLT', status: 'PASS', confidenceScore: 99.1, defects: [], measurements: { outerDiameterMM: 14.00, innerBoreMM: 8.00 }, latencyMs: 9.8 }
    ]);

    // Handle Camera Start/Stop
    useEffect(() => {
        if (inputSource === 'CAMERA') {
            setCameraError(false);
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } } })
                    .then(stream => {
                        if (videoRef.current) {
                            videoRef.current.srcObject = stream;
                            videoRef.current.onloadedmetadata = () => {
                                videoRef.current.play();
                                setIsCameraActive(true);
                                setTimeout(() => {
                                    executeInspection(videoRef.current, 'LIVE_CAMERA_FRAME');
                                }, 400);
                            };
                        }
                    })
                    .catch(err => {
                        console.warn("Camera access denied or unattached:", err);
                        setCameraError(true);
                        setIsCameraActive(false);
                        executeInspection(null, selectedSample);
                    });
            } else {
                setCameraError(true);
                executeInspection(null, selectedSample);
            }
        } else {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
                setIsCameraActive(false);
            }
        }
    }, [inputSource]);

    // Core Inspection Execution
    const executeInspection = async (sourceElem = null, partName = selectedSample) => {
        setIsInspecting(true);
        let src = sourceElem;

        if (!src) {
            if (inputSource === 'CAMERA' && videoRef.current && videoRef.current.readyState >= 2) {
                src = videoRef.current;
            } else if (inputSource === 'IMAGE' && uploadedImageRef.current) {
                src = uploadedImageRef.current;
            }
        }

        const result = await runInspectionPipeline(src, partName, forcedDefect || null);
        setCurrentInspection(result);
        setHistory(prev => [result, ...prev]);
        setIsInspecting(false);
    };

    // Auto Run on mount and sample change
    useEffect(() => {
        if (inputSource === 'SAMPLE') {
            executeInspection(null, selectedSample);
        }
    }, [selectedSample, forcedDefect, inputSource]);

    // Image File Upload Handler
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadedFileName(file.name);
        const url = URL.createObjectURL(file);
        setInputSource('IMAGE');

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            uploadedImageRef.current = img;
            executeInspection(img, file.name);
        };
        img.src = url;
    };

    return (
        <div className="quality-inspection-page page-container" style={{ color: '#f8fafc' }}>
            {/* Header Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div>
                    <span className="hero-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        MODULE 2 • WEEK 2
                    </span>
                    <h1 style={{ margin: '0.4rem 0 0 0', color: '#ffde59', fontSize: '1.8rem' }}>👁️ Automated Computer Vision Quality Inspection</h1>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                        15-Stage OpenCV Processing Pipeline, Multi-Defect Detection, & High-Speed Optical Conveyor Simulation
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button onClick={() => currentInspection && generatePDFReport(currentInspection)} className="btn-hero-action" style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>📄 PDF Report</button>
                    <button onClick={() => generateCSVReport(history)} className="btn-hero-action" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>📊 CSV Export</button>
                    <button onClick={() => generateExcelReport(history)} className="btn-hero-action" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>📗 Excel Export</button>
                    <button onClick={() => generateJSONReport(history)} className="btn-hero-action" style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>⚙️ JSON Export</button>
                </div>
            </div>

            {/* Conveyor Belt Feed Simulator */}
            <ConveyorSimulator onPartTriggered={(type) => executeInspection(null, type)} />

            {/* Main Content Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', marginTop: '1.5rem' }}>
                
                {/* Left Column: Input Source Controls & 15-Stage OpenCV Visualizer */}
                <div>
                    
                    {/* Control Toolbar */}
                    <div className="dashboard-card glass" style={{ padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                            {/* Mode Selectors */}
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                {[
                                    { id: 'SAMPLE', label: '📸 Sample Dataset' },
                                    { id: 'CAMERA', label: '📹 Live Camera' },
                                    { id: 'IMAGE', label: '📁 Upload File' }
                                ].map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setInputSource(m.id)}
                                        style={{
                                            background: inputSource === m.id ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.05)',
                                            color: inputSource === m.id ? '#000' : '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '0.4rem 0.8rem',
                                            fontWeight: 'bold',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>

                            {/* Synthetic Component Dropdown */}
                            {inputSource === 'SAMPLE' && (
                                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                                    <select
                                        value={selectedSample}
                                        onChange={(e) => setSelectedSample(e.target.value)}
                                        style={{ background: '#0a1220', color: '#fff', border: '1px solid rgba(255,222,89,0.3)', padding: '0.35rem', borderRadius: '4px', fontSize: '0.8rem' }}
                                    >
                                        <option value="GEAR">Industrial Gear</option>
                                        <option value="SCREW">Precision Screw</option>
                                        <option value="BOLT">Hex Bolt</option>
                                        <option value="PCB">Printed Circuit Board</option>
                                        <option value="BRACKET">Engine Bracket</option>
                                    </select>

                                    <select
                                        value={forcedDefect}
                                        onChange={(e) => setForcedDefect(e.target.value)}
                                        style={{ background: '#0a1220', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.35rem', borderRadius: '4px', fontSize: '0.8rem' }}
                                    >
                                        <option value="">No Defect (Intact Part)</option>
                                        {Object.values(DEFECT_TYPES).map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* File Upload Input */}
                            {inputSource === 'IMAGE' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        style={{ fontSize: '0.8rem', color: '#ffde59' }}
                                    />
                                </div>
                            )}

                            <button
                                onClick={() => executeInspection()}
                                className="btn-hero-action"
                                style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 1.2rem', fontWeight: 'bold' }}
                                disabled={isInspecting}
                            >
                                {isInspecting ? 'Processing Pipeline...' : '⚡ Inspect Frame'}
                            </button>
                        </div>
                    </div>

                    {/* Live Camera View Box */}
                    {inputSource === 'CAMERA' && (
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            height: '240px',
                            background: '#040914',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            marginBottom: '1rem',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />

                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                background: isCameraActive ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                                color: '#ffffff',
                                padding: '3px 10px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                backdropFilter: 'blur(4px)'
                            }}>
                                {isCameraActive ? '🔴 LIVE CAMERA FEED ONLINE' : '⚠️ OPTICAL SENSOR SIMULATED STREAM'}
                            </div>

                            {cameraError && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    left: '10px',
                                    right: '10px',
                                    background: 'rgba(239, 68, 68, 0.85)',
                                    color: '#ffffff',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    textAlign: 'center'
                                }}>
                                    Webcam permission denied or device busy. Displaying optical inspection simulation stream.
                                </div>
                            )}

                            <button
                                onClick={() => executeInspection(videoRef.current, 'CAMERA_FRAME')}
                                style={{
                                    position: 'absolute',
                                    bottom: '12px',
                                    right: '12px',
                                    background: '#ffde59',
                                    color: '#000000',
                                    border: 'none',
                                    padding: '0.4rem 0.9rem',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
                                }}
                            >
                                📸 Capture & Inspect Frame
                            </button>
                        </div>
                    )}

                    {/* 15-Stage Pipeline Interactive Viewer */}
                    <div className="dashboard-card glass" style={{ padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                            <h4 style={{ margin: 0, color: '#ffde59', fontSize: '0.95rem' }}>🔬 OPENCV 15-STAGE PIPELINE STEP VIEWER</h4>
                            {currentInspection && (
                                <StatusBadge status={currentInspection.status} text={`${currentInspection.status} (${currentInspection.confidenceScore}%)`} />
                            )}
                        </div>

                        {/* 15 Pipeline Steps Selector Pills */}
                        <div style={{ display: 'flex', gap: '0.3rem', overflowX: 'auto', paddingBottom: '0.6rem', marginBottom: '1rem', scrollbarWidth: 'thin' }}>
                            {PIPELINE_STAGES.map(stage => (
                                <button
                                    key={stage.key}
                                    onClick={() => setSelectedPipelineStep(stage.key)}
                                    style={{
                                        background: selectedPipelineStep === stage.key ? '#ffde59' : 'rgba(255, 255, 255, 0.05)',
                                        color: selectedPipelineStep === stage.key ? '#000' : '#94a3b8',
                                        border: '1px solid rgba(255,222,89,0.2)',
                                        borderRadius: '4px',
                                        padding: '0.3rem 0.6rem',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {stage.name}
                                </button>
                            ))}
                        </div>

                        {/* Active Pipeline Stage Canvas Image Output */}
                        <div style={{ width: '100%', height: '380px', background: '#040914', borderRadius: '8px', overflow: 'hidden', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {currentInspection && currentInspection.stageResults[selectedPipelineStep] ? (
                                <img
                                    src={currentInspection.stageResults[selectedPipelineStep]}
                                    alt="Pipeline output"
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                            ) : (
                                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Processing 15-stage OpenCV pipeline...</div>
                            )}

                            {/* Stage Description Overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: '10px',
                                left: '10px',
                                right: '10px',
                                background: 'rgba(7, 13, 25, 0.85)',
                                border: '1px solid rgba(255,222,89,0.2)',
                                borderRadius: '6px',
                                padding: '0.5rem 0.8rem',
                                fontSize: '0.8rem',
                                color: '#e2e8f0',
                                backdropFilter: 'blur(6px)'
                            }}>
                                <strong style={{ color: '#ffde59' }}>
                                    {PIPELINE_STAGES.find(s => s.key === selectedPipelineStep)?.name}:
                                </strong>{' '}
                                {PIPELINE_STAGES.find(s => s.key === selectedPipelineStep)?.desc}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Metric Cards & Inspection History Table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* Inspection Metrics & Defect Summary Card */}
                    <div className="dashboard-card glass" style={{ padding: '1rem', borderRadius: '12px' }}>
                        <h4 style={{ margin: '0 0 0.8rem 0', color: '#ffde59', fontSize: '0.95rem' }}>📊 INSPECTION DISPOSITION</h4>
                        {currentInspection ? (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#94a3b8' }}>Inspection ID</span>
                                    <strong style={{ color: '#ffde59' }}>{currentInspection.inspectionId}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#94a3b8' }}>Confidence Score</span>
                                    <strong style={{ color: '#10b981' }}>{currentInspection.confidenceScore}%</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#94a3b8' }}>Outer Diameter</span>
                                    <strong>{currentInspection.measurements.outerDiameterMM} mm</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#94a3b8' }}>Inner Bore ID</span>
                                    <strong>{currentInspection.measurements.innerBoreMM} mm</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#94a3b8' }}>Processing Latency</span>
                                    <strong style={{ color: '#38bdf8' }}>{currentInspection.latencyMs} ms</strong>
                                </div>

                                <div style={{ marginTop: '0.8rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>DETECTED DEFECTS:</span>
                                    {currentInspection.defects.length === 0 ? (
                                        <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>✓ Zero Anomalies Detected</span>
                                    ) : (
                                        currentInspection.defects.map(d => (
                                            <span key={d} style={{ display: 'block', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                                                ⚠️ {d}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No inspection data available</div>
                        )}
                    </div>

                    {/* Inspection History Log Table */}
                    <div className="dashboard-card glass" style={{ padding: '1rem', borderRadius: '12px' }}>
                        <h4 style={{ margin: '0 0 0.8rem 0', color: '#ffde59', fontSize: '0.95rem' }}>📜 RECENT INSPECTION LOGS</h4>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,222,89,0.2)', color: '#94a3b8' }}>
                                        <th style={{ padding: '0.4rem' }}>ID</th>
                                        <th style={{ padding: '0.4rem' }}>PART</th>
                                        <th style={{ padding: '0.4rem' }}>STATUS</th>
                                        <th style={{ padding: '0.4rem' }}>CONF.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map(item => (
                                        <tr key={item.inspectionId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '0.4rem', fontFamily: 'monospace', color: '#ffde59' }}>{item.inspectionId}</td>
                                            <td style={{ padding: '0.4rem' }}>{item.partType}</td>
                                            <td style={{ padding: '0.4rem' }}>
                                                <span style={{ color: item.status === 'PASS' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.4rem' }}>{item.confidenceScore}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Inspection Payload JSON Viewer */}
                    <JsonTreeViewer data={currentInspection || { status: 'NO_DATA' }} title="ACTIVE INSPECTION PAYLOAD" />
                </div>
            </div>
        </div>
    );
};

export default QualityInspectionPage;
