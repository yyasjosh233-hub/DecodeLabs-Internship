import React, { useEffect, useRef, useState } from 'react';

const ConveyorSimulator = ({ onPartTriggered, isAutoLoop = false }) => {
    const canvasRef = useRef(null);
    const partPosRef = useRef(-100);
    const currentPartTypeRef = useRef('GEAR');
    const isAutoRef = useRef(isAutoLoop);
    const [partCount, setPartCount] = useState(14);
    const [lastDisposition, setLastDisposition] = useState('PASS');

    useEffect(() => {
        isAutoRef.current = isAutoLoop;
    }, [isAutoLoop]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;
        let speed = 2.5;

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;

            // Background
            ctx.fillStyle = '#060d19';
            ctx.fillRect(0, 0, width, height);

            // Conveyor Belt Base
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(20, height - 70, width - 40, 50);

            // Belt Rollers
            const rollerCount = 12;
            const rollerSpacing = (width - 60) / rollerCount;
            const time = performance.now() * 0.005;

            for (let i = 0; i <= rollerCount; i++) {
                const rx = 30 + i * rollerSpacing;
                const ry = height - 45;

                ctx.fillStyle = '#475569';
                ctx.beginPath();
                ctx.arc(rx, ry, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#94a3b8';
                ctx.stroke();

                // Rotating spoke line
                ctx.strokeStyle = '#00f0ff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(rx, ry);
                ctx.lineTo(rx + 10 * Math.cos(time + i), ry + 10 * Math.sin(time + i));
                ctx.stroke();
            }

            // Belt Top Line
            ctx.strokeStyle = '#ffde59';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(20, height - 70);
            ctx.lineTo(width - 20, height - 70);
            ctx.stroke();

            // Optical Inspection Frame Tower
            const towerX = width / 2;
            ctx.fillStyle = '#334155';
            ctx.fillRect(towerX - 15, 20, 30, height - 90);

            // Camera Sensor Head
            ctx.fillStyle = '#10b981';
            ctx.fillRect(towerX - 35, 20, 70, 35);
            ctx.fillStyle = '#00f0ff';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('OPENCV CAM', towerX, 42);

            // Laser Optical Sensor Beam
            ctx.strokeStyle = partPosRef.current > towerX - 30 && partPosRef.current < towerX + 30 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(0, 240, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(towerX, 55);
            ctx.lineTo(towerX, height - 70);
            ctx.stroke();
            ctx.setLineDash([]);

            // Moving Industrial Part
            if (partPosRef.current >= -100) {
                partPosRef.current += speed;

                const px = partPosRef.current;
                const py = height - 95;

                ctx.save();
                ctx.translate(px, py);

                // Gear rendering
                ctx.fillStyle = '#cbd5e1';
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.arc(0, 0, 22, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();

                // Trigger Inspection Event when part passes under Optical Beam
                if (Math.abs(px - towerX) < speed && !canvas.hasTriggered) {
                    canvas.hasTriggered = true;
                    const pass = Math.random() > 0.2;
                    setLastDisposition(pass ? 'PASS' : 'FAIL');
                    setPartCount(prev => prev + 1);
                    if (onPartTriggered) onPartTriggered(currentPartTypeRef.current);
                }

                // Reset loop if offscreen
                if (px > width + 50) {
                    canvas.hasTriggered = false;
                    if (isAutoRef.current) {
                        partPosRef.current = -50;
                    } else {
                        partPosRef.current = -150;
                    }
                }
            }

            animationId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationId);
    }, []);

    const triggerManualPass = () => {
        const parts = ['GEAR', 'SCREW', 'BOLT', 'PCB', 'BRACKET'];
        currentPartTypeRef.current = parts[Math.floor(Math.random() * parts.length)];
        const canvas = canvasRef.current;
        if (canvas) canvas.hasTriggered = false;
        partPosRef.current = 30;
    };

    return (
        <div className="conveyor-simulator-card glass" style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(10, 18, 32, 0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>⚙️</span>
                    <div>
                        <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '0.95rem' }}>HIGH-SPEED OPTICAL CONVEYOR FEED</h4>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Real-time part detection line & automated trigger</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        background: lastDisposition === 'PASS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: lastDisposition === 'PASS' ? '#10b981' : '#ef4444',
                        border: lastDisposition === 'PASS' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                    }}>
                        LAST: {lastDisposition}
                    </span>
                    <button
                        onClick={triggerManualPass}
                        className="btn-card-link"
                        style={{
                            padding: '0.35rem 0.8rem',
                            fontSize: '0.8rem',
                            background: 'var(--accent-color)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        + Feed New Component
                    </button>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                width={700}
                height={160}
                style={{ width: '100%', height: '160px', borderRadius: '8px', border: '1px solid rgba(255,222,89,0.15)' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                <span>Total Inspected Parts: <strong style={{ color: '#ffde59' }}>{partCount}</strong></span>
                <span>Optical Sensor Latency: <strong style={{ color: '#10b981' }}>1.4 ms</strong></span>
                <span>Line Speed: <strong style={{ color: '#38bdf8' }}>1.2 m/s</strong></span>
            </div>
        </div>
    );
};

export default ConveyorSimulator;
