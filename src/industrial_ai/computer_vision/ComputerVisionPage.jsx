import React, { useState, useRef, useEffect } from 'react';
import './ComputerVisionStyles.css';

const TASK_BOUNDING_BOXES = {
    'Defect Detection': [
        { id: 1, label: 'Gear Surface Crack', confidence: '99.4%', box: { top: '30%', left: '20%', width: '140px', height: '100px' }, isDefect: true },
        { id: 2, label: 'Pitting Corrosion Wear', confidence: '96.2%', box: { top: '55%', left: '50%', width: '130px', height: '80px' }, isDefect: true }
    ],
    'Surface Inspection': [
        { id: 1, label: 'Roughness Ra 0.8µm', confidence: '98.8%', box: { top: '35%', left: '30%', width: '160px', height: '90px' }, isDefect: false },
        { id: 2, label: 'Polished Weld Seam', confidence: '99.5%', box: { top: '20%', left: '60%', width: '130px', height: '70px' }, isDefect: false }
    ],
    'Dimension Measurement': [
        { id: 1, label: 'Bore Inner: 35.01mm', confidence: '99.9%', box: { top: '25%', left: '35%', width: '150px', height: '110px' }, isDefect: false },
        { id: 2, label: 'Outer Dia: 120.02mm', confidence: '99.7%', box: { top: '15%', left: '20%', width: '220px', height: '180px' }, isDefect: false }
    ],
    'Barcode & QR Detection': [
        { id: 1, label: 'QR Code: ISO-2026-JETSON', confidence: '100%', box: { top: '50%', left: '40%', width: '130px', height: '75px' }, isDefect: false },
        { id: 2, label: 'Barcode 128: PO-99812-A', confidence: '99.6%', box: { top: '20%', left: '15%', width: '150px', height: '65px' }, isDefect: false }
    ],
    'Assembly Verification': [
        { id: 1, label: 'Fastener 1: Torque OK', confidence: '99.8%', box: { top: '25%', left: '25%', width: '130px', height: '75px' }, isDefect: false },
        { id: 2, label: 'Fastener 2: Torque OK', confidence: '99.7%', box: { top: '25%', left: '55%', width: '130px', height: '75px' }, isDefect: false },
        { id: 3, label: 'Part Alignment: Centered', confidence: '99.1%', box: { top: '55%', left: '38%', width: '140px', height: '80px' }, isDefect: false }
    ],
    'Object Counting': [
        { id: 1, label: 'Item #1 (Gear)', confidence: '99.5%', box: { top: '20%', left: '15%', width: '90px', height: '80px' }, isDefect: false },
        { id: 2, label: 'Item #2 (Gear)', confidence: '99.3%', box: { top: '20%', left: '40%', width: '90px', height: '80px' }, isDefect: false },
        { id: 3, label: 'Item #3 (Gear)', confidence: '99.1%', box: { top: '20%', left: '65%', width: '90px', height: '80px' }, isDefect: false },
        { id: 4, label: 'Item #4 (Gear)', confidence: '98.9%', box: { top: '55%', left: '38%', width: '90px', height: '80px' }, isDefect: false }
    ],
    'PPE & Helmet Detection': [
        { id: 1, label: 'Worker Safety Helmet', confidence: '99.2%', box: { top: '15%', left: '38%', width: '130px', height: '90px' }, isDefect: false },
        { id: 2, label: 'Safety High-Vis Vest', confidence: '98.7%', box: { top: '42%', left: '32%', width: '160px', height: '120px' }, isDefect: false }
    ],
    'Fire & Smoke Alert': [
        { id: 1, label: 'Thermal Scan: 24.5°C Normal', confidence: '100%', box: { top: '30%', left: '30%', width: '180px', height: '110px' }, isDefect: false }
    ],
    'Worker Safety Analytics': [
        { id: 1, label: 'Operator Stance: Safe Zone', confidence: '99.8%', box: { top: '20%', left: '30%', width: '180px', height: '180px' }, isDefect: false },
        { id: 2, label: 'Laser Interlock: Active', confidence: '100%', box: { top: '65%', left: '20%', width: '150px', height: '60px' }, isDefect: false }
    ]
};

const MODEL_SPECIFIC_BOXES = {
    'EasyOCR': [
        { id: 1, label: 'OCR Text: DVJ INDUSTRIAL ROBOTICS', confidence: '99.8%', box: { top: '35%', left: '20%', width: '220px', height: '60px' }, isDefect: false },
        { id: 2, label: 'OCR Code: PART-88910-US', confidence: '99.5%', box: { top: '55%', left: '25%', width: '180px', height: '55px' }, isDefect: false }
    ],
    'SAM2 (Segment Anything)': [
        { id: 1, label: 'SAM2 Mask: Foreground Object', confidence: '99.6%', box: { top: '20%', left: '25%', width: '210px', height: '180px' }, isDefect: false }
    ]
};

const ComputerVisionPage = () => {
    const [selectedModel, setSelectedModel] = useState('YOLOv11');
    const [activeTask, setActiveTask] = useState('Defect Detection');
    const [useWebcam, setUseWebcam] = useState(false);
    const [webcamActive, setWebcamActive] = useState(false);
    const [webcamError, setWebcamError] = useState('');
    const [lastActionMsg, setLastActionMsg] = useState('Camera Stream #1 Active - Ready for AI Inference.');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [scannedItems, setScannedItems] = useState(TASK_BOUNDING_BOXES['Defect Detection']);

    // Handle Live Webcam Toggle
    useEffect(() => {
        let stream = null;
        if (useWebcam) {
            setWebcamError('');
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } })
                    .then(s => {
                        stream = s;
                        if (videoRef.current) {
                            videoRef.current.srcObject = stream;
                            videoRef.current.play();
                            setWebcamActive(true);
                            setLastActionMsg('Live Webcam feed connected successfully.');
                        }
                    })
                    .catch(err => {
                        console.warn("Webcam access error:", err);
                        setWebcamError('Camera access denied or no webcam detected. Streaming simulated industrial optical feed.');
                        setWebcamActive(false);
                        setUseWebcam(false);
                    });
            } else {
                setWebcamError('Webcam API not supported in browser. Using industrial camera simulation.');
                setUseWebcam(false);
            }
        } else {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(t => t.stop());
                videoRef.current.srcObject = null;
            }
            setWebcamActive(false);
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
            }
        };
    }, [useWebcam]);

    // Animated Optical Canvas Simulation when live webcam is off
    useEffect(() => {
        if (webcamActive) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let frameId;
        let scanY = 0;

        const draw = () => {
            ctx.fillStyle = '#060d17';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Grid lines
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.15)';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += 40) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Laser scan line
            scanY = (scanY + 2) % canvas.height;
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#f472b6';
            ctx.beginPath();
            ctx.moveTo(0, scanY);
            ctx.lineTo(canvas.width, scanY);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // HUD Crosshair
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
            ctx.stroke();

            frameId = requestAnimationFrame(draw);
        };
        draw();

        return () => cancelAnimationFrame(frameId);
    }, [webcamActive]);

    // Dynamic Task & Model Change Handlers
    const handleRunInference = (taskName) => {
        setActiveTask(taskName);
        const newBoxes = TASK_BOUNDING_BOXES[taskName] || TASK_BOUNDING_BOXES['Defect Detection'];
        setScannedItems(newBoxes);
        setLastActionMsg(`Executed AI Model [${selectedModel}] for [${taskName}] on Camera Stream #1`);
    };

    const handleModelChange = (modelName) => {
        setSelectedModel(modelName);
        if (MODEL_SPECIFIC_BOXES[modelName]) {
            setScannedItems(MODEL_SPECIFIC_BOXES[modelName]);
        } else {
            setScannedItems(TASK_BOUNDING_BOXES[activeTask] || TASK_BOUNDING_BOXES['Defect Detection']);
        }
        setLastActionMsg(`Switched AI Vision Backbone to [${modelName}] - Pipeline Re-initialized.`);
    };

    return (
        <div className="cv-container">
            {/* Header Banner */}
            <div className="cv-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ color: '#f472b6', margin: 0, fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        👁️ Advanced AI Computer Vision & Safety Analytics
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        YOLOv11, RT-DETR, SAM2, OpenCV & Dual OCR for Defect Detection, PPE Safety, Barcode/QR, and Fire/Smoke Alerts.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="cv-badge">{selectedModel} Active</span>
                    <button 
                        className={`rpa-btn ${useWebcam ? 'rpa-btn-danger' : 'rpa-btn-primary'}`}
                        onClick={() => setUseWebcam(!useWebcam)}
                    >
                        {useWebcam ? '⏹️ Stop Live Webcam' : '📷 Open Live Webcam'}
                    </button>
                </div>
            </div>

            {/* Model Selector Bar */}
            <div className="cv-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: '#e2e8f0' }}>AI Vision Backbone:</span>
                    {['YOLOv11', 'RT-DETR', 'SAM2 (Segment Anything)', 'OpenCV Pipeline', 'EasyOCR'].map(m => (
                        <button key={m} className={`rpa-btn rpa-btn-sm ${selectedModel === m ? 'rpa-btn-primary' : ''}`} onClick={() => handleModelChange(m)}>
                            {m}
                        </button>
                    ))}
                </div>
                <span className="rpa-status-tag rpa-status-running">
                    <span className="rpa-dot rpa-dot-running"></span> {webcamActive ? 'Webcam 60 FPS' : 'Optical Sim 60 FPS'}
                </span>
            </div>

            {webcamError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    ⚠️ {webcamError}
                </div>
            )}

            {/* Task Triggers & Video Feed View */}
            <div className="pm-grid-2">
                <div className="cv-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <h4 style={{ color: '#f472b6', margin: 0 }}>
                            📹 {webcamActive ? 'Live User Webcam Feed' : 'Simulated Industrial Camera Stream #1'}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>1920x1080 @ 60 FPS</span>
                    </div>
                    
                    <div className="cv-video-frame">
                        {/* Live Video Element */}
                        <video 
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover', 
                                display: webcamActive ? 'block' : 'none',
                                transform: 'scaleX(-1)'
                            }} 
                        />

                        {/* Animated Canvas simulation if webcam is off */}
                        {!webcamActive && (
                            <canvas 
                                ref={canvasRef} 
                                width={640} 
                                height={360} 
                                style={{ width: '100%', height: '100%', display: 'block' }}
                            />
                        )}

                        {/* Bounding Box Overlays */}
                        {scannedItems.map(item => (
                            <div 
                                key={item.id} 
                                className={`cv-bbox ${item.isDefect ? 'cv-bbox-danger' : ''}`}
                                style={{ top: item.box.top, left: item.box.left, width: item.box.width, height: item.box.height }}
                            >
                                <span className="cv-bbox-label">{item.label} ({item.confidence})</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="cv-card">
                    <h4 style={{ color: '#f472b6', marginBottom: '1rem' }}>⚡ Industrial Vision AI Task Suite</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                        {[
                            'Defect Detection',
                            'Surface Inspection',
                            'Dimension Measurement',
                            'Barcode & QR Detection',
                            'Assembly Verification',
                            'Object Counting',
                            'PPE & Helmet Detection',
                            'Fire & Smoke Alert',
                            'Worker Safety Analytics'
                        ].map(task => (
                            <button 
                                key={task} 
                                className={`rpa-btn ${activeTask === task ? 'rpa-btn-primary' : ''}`}
                                onClick={() => handleRunInference(task)}
                            >
                                🎯 {task}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: '1.25rem', background: '#051515', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(236,72,153,0.3)' }}>
                        <div style={{ fontWeight: 700, color: '#f472b6', marginBottom: '0.3rem' }}>Active Task: {activeTask}</div>
                        <div style={{ fontSize: '0.8rem', color: '#34d399' }}>Detected Entities: {scannedItems.length} items | Confidence Avg: 99.2%</div>
                        <div style={{ fontSize: '0.85rem', color: '#ffde59', marginTop: '0.4rem', fontWeight: 600 }}>{lastActionMsg}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComputerVisionPage;
