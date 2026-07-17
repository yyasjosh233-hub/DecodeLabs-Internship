import React, { useEffect, useState } from 'react';

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setFadeOut(true);
                        setTimeout(onComplete, 800); // Allow fade animation to complete
                    }, 500);
                    return 100;
                }
                return prev + Math.floor(Math.random() * 15) + 5;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#051515',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: fadeOut ? 0 : 1,
            transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: fadeOut ? 'scale(1.05)' : 'scale(1)',
            pointerEvents: fadeOut ? 'none' : 'all'
        }}>
            {/* Tech Scanlines */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                backgroundSize: '100% 4px, 6px 100%',
                pointerEvents: 'none',
                opacity: 0.4
            }} />

            {/* Glowing Orbs */}
            <div style={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(255, 222, 89, 0.1) 0%, transparent 70%)',
                filter: 'blur(30px)',
                animation: 'pulse 3s infinite alternate',
                pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', textAlign: 'center', width: '320px', zIndex: 10 }}>
                {/* Logo & Brand */}
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: 900,
                    color: '#fff',
                    marginBottom: '1rem',
                    fontFamily: 'Cinzel, serif',
                    letterSpacing: '8px'
                }}>
                    DJ <span style={{ color: '#ffde59', textShadow: '0 0 20px rgba(255, 222, 89, 0.5)' }}>GROUP</span>
                </h1>
                <p style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '4px',
                    marginBottom: '3rem'
                }}>
                    Cognitive Automation Ecosystem
                </p>

                {/* Progress Bar Container */}
                <div style={{
                    width: '100%',
                    height: '2px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '2px',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '1rem'
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #ffde59, #fff)',
                        boxShadow: '0 0 10px #ffde59',
                        transition: 'width 0.1s ease-out'
                    }} />
                </div>

                {/* Stats Readout */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.5)'
                }}>
                    <span>BOOTING_NEURAL_CORE</span>
                    <span style={{ color: '#ffde59' }}>{progress}%</span>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
