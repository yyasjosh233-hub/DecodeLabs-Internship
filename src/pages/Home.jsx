import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import roboticArmImg from '../assets/robotic_arm.png';
import alexanderImg from '../assets/roboticist_alexander.png';
import elenaImg from '../assets/roboticist_elena.png';
import sarahImg from '../assets/roboticist_sarah.png';
import ParticleCanvas from '../components/ParticleCanvas';

// Tagline Typing Component
const TypingTagline = ({ text }) => {
    const [typedText, setTypedText] = useState("");
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setTypedText(text.slice(0, index + 1));
            index++;
            if (index >= text.length) {
                clearInterval(interval);
            }
        }, 80);
        return () => clearInterval(interval);
    }, [text]);
    return <span>{typedText}</span>;
};

// Animated Number Counter Component
const AnimatedCounter = ({ target, duration = 1500 }) => {
    const [count, setCount] = useState(0);
    const elementRef = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !hasAnimated) {
                setHasAnimated(true);
                const isMs = target.includes('ms');
                const isPercent = target.includes('%');
                const isPlus = target.includes('+');
                const isSlash = target.includes('/');
                
                const num = parseInt(target.replace(/[^0-9]/g, ''));
                if (isNaN(num)) return;

                let current = 0;
                const increment = Math.ceil(num / 30);
                const step = Math.max(duration / 30, 20);

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= num) {
                        setCount(num);
                        clearInterval(timer);
                    } else {
                        setCount(current);
                    }
                }, step);
            }
        }, { threshold: 0.1 });

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }
        return () => observer.disconnect();
    }, [target, duration, hasAnimated]);

    const getFormattedValue = () => {
        if (target.includes('ms')) return `${count}ms`;
        if (target.includes('%')) return `${count}%`;
        if (target.includes('+')) return `${count}+`;
        if (target.includes('/')) return `24/7`; // Constant display for 24/7 support
        return count;
    };

    return <span ref={elementRef}>{getFormattedValue()}</span>;
};

const InteractiveCorePanel = () => {
    const [subsystemStatus, setSubsystemStatus] = useState({
        aiEngine: true,
        pneumatics: true,
        collisionSafety: true
    });
    
    const [diagnostics, setDiagnostics] = useState({
        payload: 42.5,
        latency: 1.2,
        network: "STRONG"
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setDiagnostics(prev => ({
                payload: parseFloat((40 + Math.random() * 5).toFixed(1)),
                latency: parseFloat((0.8 + Math.random() * 0.6).toFixed(1)),
                network: Math.random() > 0.1 ? "STRONG" : "NOMINAL"
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass reveal-on-scroll" style={{
            padding: '3rem',
            borderRadius: '24px',
            border: '1px solid rgba(255, 222, 89, 0.15)',
            background: 'rgba(5, 21, 21, 0.85)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        background: subsystemStatus.aiEngine ? '#00ff66' : '#ff3333', 
                        borderRadius: '50%', 
                        boxShadow: subsystemStatus.aiEngine ? '0 0 10px #00ff66' : '0 0 10px #ff3333'
                    }}></div>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>NEURAL CORE</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>SYS_ACTIVE_v4.20</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Core Latency Speed</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '2rem', color: 'var(--accent-color)', fontWeight: 800, fontFamily: 'monospace' }}>{diagnostics.latency}ms</span>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>Zero-lag threshold</span>
                    </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Active Payload Rate</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, fontFamily: 'monospace' }}>{diagnostics.payload} kg/s</span>
                    </div>
                </div>
            </div>

            <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.2rem' }}>Subsystem Controls</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                    { key: 'aiEngine', label: 'Cognitive Pathing AI Engine' },
                    { key: 'pneumatics', label: 'Pneumatic Micro-Stabilizers' },
                    { key: 'collisionSafety', label: 'Self-Evasive Proximity Grid' }
                ].map(sub => (
                    <div 
                        key={sub.key} 
                        onClick={() => setSubsystemStatus(prev => ({ ...prev, [sub.key]: !prev[sub.key] }))}
                        style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '1rem 1.5rem', 
                            background: 'rgba(255,255,255,0.02)', 
                            borderRadius: '8px', 
                            border: '1px solid rgba(255,255,255,0.05)',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,222,89,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                    >
                        <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>{sub.label}</span>
                        <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 800, 
                            color: subsystemStatus[sub.key] ? '#00ff66' : 'rgba(255,255,255,0.2)',
                            letterSpacing: '1px'
                        }}>
                            {subsystemStatus[sub.key] ? 'ENABLED' : 'DISABLED'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Home = () => {
    const [roboticsData, setRoboticsData] = useState([]);
    const [loadingRobotics, setLoadingRobotics] = useState(true);
    const [activeModal, setActiveModal] = useState(null);

    useEffect(() => {
        const fetchRobotics = async () => {
            try {
                const response = await axios.get('/api/robotics');
                setRoboticsData(response.data);
            } catch (error) {
                console.error("Error fetching robotics data, using fallback:", error);
                setRoboticsData([
                    {
                        id: "industrial",
                        title: "Industrial Automation",
                        description: "Autonomous assembly, high-precision welding, and smart logistics systems designed for heavy manufacturing.",
                        spec: "Payload: Up to 500kg | Precision: ±0.02mm",
                        icon: "industrial"
                    },
                    {
                        id: "humanoid",
                        title: "Humanoid Assistants",
                        description: "Next-generation bipedal and humanoid systems integrated with neural cognitive engines for research and service industries.",
                        spec: "DoF: 53 | AI Core: Neural-Motion v4",
                        icon: "humanoid"
                    },
                    {
                        id: "medical",
                        title: "Precision Surgery",
                        description: "Robotic surgical assistants and smart rehabilitation systems engineered to enhance precision and support patient care.",
                        spec: "Latency: <1.2ms | Accuracy: Sub-millimeter",
                        icon: "medical"
                    },
                    {
                        id: "agricultural",
                        title: "Smart Agriculture",
                        description: "AI-driven farming solutions specializing in soil monitoring, precision planting, and autonomous harvesting.",
                        spec: "Autonomy: Level 4 | Area Coverage: 50 acres/day",
                        icon: "agriculture"
                    },
                    {
                        id: "uav",
                        title: "Autonomous Drones (UAV)",
                        description: "Advanced aerial robotics designed for mapping, surveillance, and automated inspection in complex environments.",
                        spec: "Flight Time: 60 mins | Sensors: LiDAR & Multi-spectral",
                        icon: "drone"
                    },
                    {
                        id: "amr",
                        title: "Logistics & AMRs",
                        description: "Self-navigating warehouse and logistics systems that optimize material flow with dynamic pathfinding.",
                        spec: "Speed: 2.0 m/s | Navigation: SLAM Visual-LiDAR",
                        icon: "logistics"
                    }
                ]);
            } finally {
                setLoadingRobotics(false);
            }
        };
        fetchRobotics();
    }, []);

    // Scroll Reveal trigger
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.15 });

        const elements = document.querySelectorAll('.reveal-on-scroll');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    // Parallax mouse effect on decorative orbs
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX - window.innerWidth / 2) * 0.05,
                y: (e.clientY - window.innerHeight / 2) * 0.05
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="home-page animate-fade-in" style={{ background: 'var(--primary-bg)', overflow: 'hidden' }}>
            
            {/* Parallax Orbs */}
            <div className="glow-orb" style={{
                width: '400px',
                height: '400px',
                background: 'var(--accent-color)',
                top: '10%',
                left: '-10%',
                transform: `translate(${mousePos.x}px, ${mousePos.y}px)`
            }} />
            <div className="glow-orb" style={{
                width: '500px',
                height: '500px',
                background: 'rgba(255, 255, 255, 0.05)',
                bottom: '10%',
                right: '-10%',
                transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)`
            }} />

            {/* Extended Hero Section */}
            <section className="hero animate-fade-in" style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                padding: '6rem 2rem 2rem 2rem',
                background: 'var(--primary-bg)'
            }}>
                {/* Cinematic Background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'linear-gradient(135deg, rgba(2, 11, 11, 0.9) 0%, rgba(5, 21, 21, 0.95) 50%, rgba(10, 35, 35, 0.9) 100%), url("https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=2000")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0
                }}></div>

                {/* Particle Background Element */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
                    {/* Particles rendered on canvas */}
                </div>

                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    width: '100%',
                    gap: '4rem',
                    alignItems: 'center',
                    zIndex: 10,
                    position: 'relative'
                }} className="hero-grid-container">
                    
                    {/* Left text column */}
                    <div style={{ textAlign: 'left' }}>
                        <div className="reveal-on-scroll" style={{
                            display: 'inline-block',
                            padding: '0.4rem 1.2rem',
                            background: 'rgba(255, 222, 89, 0.08)',
                            borderRadius: '50px',
                            border: '1px solid rgba(255, 222, 89, 0.15)',
                            marginBottom: '1rem'
                        }}>
                            <span style={{
                                color: 'var(--accent-color)',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                letterSpacing: '3px',
                                textTransform: 'uppercase'
                            }}>
                                Pioneering Autonomy
                            </span>
                        </div>
                        
                        <h1 style={{
                            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
                            fontWeight: 900,
                            lineHeight: '1.1',
                            marginBottom: '0.8rem',
                            color: '#fff',
                            letterSpacing: '-1px'
                        }}>
                            Architects of Machine Intelligence
                        </h1>

                        <h2 style={{
                            fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)',
                            fontWeight: 700,
                            color: 'var(--accent-color)',
                            marginBottom: '1.2rem',
                            textShadow: '0 0 30px rgba(255, 222, 89, 0.15)'
                        }}>
                            Robotics That <TypingTagline text="Think & Adapt" />
                        </h2>

                        <p style={{
                            fontSize: '1.1rem',
                            color: 'rgba(255,255,255,0.8)',
                            maxWidth: '600px',
                            lineHeight: '1.6',
                            fontWeight: 300,
                            marginBottom: '1.5rem'
                        }}>
                            Empowering global manufacturing with intelligent automation ecosystems that merge AI-cognitive brilliance with mechanical perfection.
                        </p>

                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                            <Link to="/contact" className="btn-primary-v2" style={{
                                background: 'var(--accent-color)',
                                color: '#000',
                                padding: '1rem 3rem',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                fontWeight: 800,
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 10px 30px rgba(255, 222, 89, 0.25)'
                            }}>
                                Deploy Solutions
                            </Link>
                            <Link to="/services" style={{
                                color: '#fff',
                                padding: '1rem 3rem',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                border: '1px solid rgba(255,255,255,0.3)',
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(10px)'
                            }}>
                                Explore Offerings
                            </Link>
                        </div>

                        {/* Neural Core Panel placed below the description & buttons */}
                        <div style={{ marginBottom: '1rem', maxWidth: '520px' }}>
                            <InteractiveCorePanel />
                        </div>
                    </div>

                    {/* Right column: Robotic Arm Graphic Showcase */}
                    <div className="reveal-on-scroll" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '520px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 222, 89, 0.1)',
                            borderRadius: '24px',
                            padding: '2.5rem',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative Core Glow Behind Arm */}
                            <div style={{
                                position: 'absolute',
                                width: '200px',
                                height: '200px',
                                background: 'radial-gradient(circle, rgba(255, 222, 89, 0.15) 0%, rgba(255, 222, 89, 0) 70%)',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none'
                            }} />

                            <img 
                                src={roboticArmImg} 
                                alt="DJ Group Precision Robotic System" 
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    maxHeight: '380px',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 15px 35px rgba(255,222,89,0.2))',
                                    transition: 'transform 0.5s ease'
                                }}
                                className="hover-scale"
                            />
                            
                            <div style={{
                                marginTop: '2rem',
                                borderTop: '1px solid rgba(255,255,255,0.05)',
                                paddingTop: '1rem',
                                width: '100%'
                            }}>
                                <span style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--accent-color)',
                                    fontWeight: 700,
                                    letterSpacing: '2px',
                                    textTransform: 'uppercase'
                                }}>
                                    DJ-Series Kinematic Actuation System
                                </span>
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: 'rgba(255,255,255,0.5)',
                                    marginTop: '0.2rem'
                                }}>
                                    Precision engineered for ultra-high throughput environments
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    zIndex: 10
                }}>
                    <span style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.5, color: '#fff' }}>Discover More</span>
                    <div style={{
                        width: '2px',
                        height: '40px',
                        background: 'linear-gradient(to bottom, var(--accent-color), transparent)',
                        opacity: 0.5
                    }}></div>
                </div>
            </section>

            {/* Metrics Showcase */}
            <section style={{
                padding: '3rem 5%',
                background: 'rgba(255, 255, 255, 0.02)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem' }}>
                    {[
                        { num: '540+', label: 'Active Deployments' },
                        { num: '12ms', label: 'Response Latency' },
                        { num: '42%', label: 'Efficiency Gain' },
                        { num: '24/7', label: 'Expert Support' }
                    ].map((stat, i) => (
                        <div key={i} style={{ textAlign: 'center' }} className="reveal-on-scroll">
                            <span style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--accent-color)', display: 'block', marginBottom: '0.5rem' }}>
                                <AnimatedCounter target={stat.num} />
                            </span>
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px' }}>{stat.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Robotics Showcase Section */}
            <section style={{ padding: '4rem 5%', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }} className="reveal-on-scroll">
                    <span className="subtitle" style={{ letterSpacing: '6px' }}>OUR PORTFOLIO</span>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginTop: '1.5rem', color: '#fff' }}>
                        Advanced Robotics <span style={{ color: 'var(--accent-color)' }}>Solutions</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '1.5rem auto 0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
                        Discover our comprehensive range of autonomous systems, engineered to bring intelligence, efficiency, and precision to diverse industries.
                    </p>
                </div>

                {loadingRobotics ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <div style={{ color: 'var(--accent-color)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Loading Robotics Intelligence...
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem' }}>
                        {roboticsData.map((robot) => (
                            <div 
                                key={robot.id} 
                                className="glass reveal-on-scroll" 
                                style={{
                                    padding: '3rem',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255, 222, 89, 0.1)',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    background: 'rgba(5, 21, 21, 0.6)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.borderColor = 'var(--accent-color)';
                                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(255, 222, 89, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 222, 89, 0.1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 222, 89, 0.2)',
                                        background: 'rgba(255, 222, 89, 0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '2rem'
                                    }}>
                                        {/* Dynamic SVG Icon based on type */}
                                        {robot.icon === 'industrial' && (
                                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                                                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                                                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                                                <line x1="6" y1="18" x2="6.01" y2="18"></line>
                                            </svg>
                                        )}
                                        {robot.icon === 'humanoid' && (
                                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="5" r="2"></circle>
                                                <path d="m12 7 2 12"></path>
                                                <path d="m12 7-2 12"></path>
                                                <path d="m19 10-7-3-7 3"></path>
                                            </svg>
                                        )}
                                        {robot.icon === 'medical' && (
                                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                                            </svg>
                                        )}
                                        {robot.icon === 'agriculture' && (
                                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 22V12"></path>
                                                <path d="M12 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"></path>
                                                <path d="m17 8 2.5-2.5"></path>
                                                <path d="m7 8-2.5-2.5"></path>
                                            </svg>
                                        )}
                                        {robot.icon === 'drone' && (
                                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                            </svg>
                                        )}
                                        {robot.icon === 'logistics' && (
                                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                            </svg>
                                        )}
                                    </div>
                                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.2rem', color: '#fff' }}>{robot.title}</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                                        {robot.description}
                                    </p>
                                </div>
                                <div style={{
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    paddingTop: '1.2rem',
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace',
                                    color: 'var(--accent-color)',
                                    letterSpacing: '1px'
                                }}>
                                    {robot.spec}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Innovation Section */}
            <section style={{ padding: '4rem 5%', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '8rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }} className="reveal-on-scroll">
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            left: '-20px',
                            width: '100%',
                            height: '100%',
                            border: '1px solid var(--accent-color)',
                            borderRadius: '24px',
                            opacity: 0.2,
                            zIndex: 0
                        }}></div>
                        <img
                            src={roboticArmImg}
                            alt="Advanced Robotics"
                            style={{ width: '100%', borderRadius: '24px', zIndex: 1, position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}
                        />
                    </div>
                    <div className="reveal-on-scroll">
                        <span className="subtitle">THE ARCHITECTURE</span>
                        <h2 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: '1.1' }}>
                            Where Intelligence <br />
                            <span style={{ color: 'var(--accent-color)' }}>Meets Precision</span>
                        </h2>
                        <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginBottom: '2rem' }}>
                            Our Neural-Motion framework enables robots to anticipate environmental shifts and obstacles in real-time. By processing millions of data points at the edge, Dj Group systems deliver performance that defines the future of work.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                            {[
                                { title: 'Predictive Pathing', desc: 'Real-time optimization' },
                                { title: 'Edge Computing', desc: 'Zero-latency processing' },
                                { title: 'Haptic Sensors', desc: 'Human-like sensitivity' },
                                { title: 'Cloud Core', desc: 'Centralized intelligence' }
                            ].map((item, i) => (
                                <div key={i}>
                                    <h4 style={{ color: 'var(--accent-color)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{item.title}</h4>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Technology Timeline */}
            <section style={{ padding: '4rem 5%', background: 'rgba(255, 255, 255, 0.01)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }} className="reveal-on-scroll">
                        <span className="subtitle">MILESTONES OF INNOVATION</span>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: 900 }}>Evolution of DJ Group</h2>
                    </div>

                    <div className="timeline-container">
                        <div className="timeline-line"></div>
                        
                        {[
                            { year: '2026', title: 'Generative Motion Integration', desc: 'Released Cognitive Pathing v4.0, integrating real-time neural models directly into collaborative arm units.' },
                            { year: '2024', title: 'Haptic Feedback Robotics', desc: 'Pioneered touch-sensitive industrial cobots capable of high-precision assembly alongside humans.' },
                            { year: '2022', title: 'Edge Analytics Deployment', desc: 'Shifted core decision architectures to zero-latency on-device processing systems.' },
                            { year: '2020', title: 'Foundational Smart Systems', desc: 'Established DJ Group Robotics to bring predictive computer vision models to heavy factory plants.' }
                        ].map((milestone, idx) => (
                            <div key={idx} className="timeline-item reveal-on-scroll">
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <span className="timeline-year">{milestone.year}</span>
                                    <h3 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '0.8rem' }}>{milestone.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{milestone.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trusted By / Clients section */}
            <section style={{ padding: '3rem 5%', background: 'linear-gradient(to bottom, transparent, rgba(255, 222, 89, 0.02), transparent)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '6px', fontSize: '0.8rem', marginBottom: '3rem' }}>Pioneers We Empower</p>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8rem', flexWrap: 'wrap', opacity: 0.5 }}>
                        <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '2.5rem', margin: 0 }}>TECHCORP</h3>
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 200, margin: 0 }}>GLOBAL<span style={{ fontWeight: 600 }}>MFG</span></h3>
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 800, fontStyle: 'italic', margin: 0 }}>NEXUS</h3>
                        <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.5rem', fontWeight: 300, letterSpacing: '10px', margin: 0 }}>AVION</h3>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section style={{ padding: '4rem 5%', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }} className="reveal-on-scroll">
                    <span className="subtitle">GLOBAL IMPACT</span>
                    <h2 style={{ fontSize: '4rem', fontWeight: 900 }}>Voices from the <span style={{ color: 'var(--accent-color)' }}>Field</span></h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem' }}>
                    {[
                        {
                            name: 'Dr. Alexander Sterling',
                            role: 'Chief Robotics Architect, Cybernetics',
                            img: alexanderImg,
                            text: "Their bipedal balance controls and joint actuator modules are top-tier. Integrating their designs cut our hardware testing cycles in half."
                        },
                        {
                            name: 'Elena Rostova',
                            role: 'Lead Automation & Precision Assembly Engineer',
                            img: elenaImg,
                            text: "The micro-tolerance pick-and-place grippers they fabricated allowed our electronics lines to achieve continuous 24/7 assembly without a single misalignment."
                        },
                        {
                            name: 'Dr. Sarah Chen',
                            role: 'Director of Autonomous Systems, Robotics Lab',
                            img: sarahImg,
                            text: "Their approach to robotics integration is world-class. The AI-driven calibration alone saved us months of manual tuning and brought our prototypes to market faster."
                        }
                    ].map((t, i) => (
                        <div key={i} className="glass reveal-on-scroll" style={{ padding: '5rem 4rem', borderRadius: '32px', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '-40px', left: '40px', width: '100px', height: '100px', borderRadius: '50%', border: '4px solid var(--accent-color)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', background: '#d0d0d0' }}>
                                <img src={t.img} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <p style={{ fontSize: '1.25rem', lineHeight: '1.8', fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', marginBottom: '3rem' }}>"{t.text}"</p>
                            <div>
                                <h4 style={{ fontSize: '1.2rem', color: 'var(--accent-color)', marginBottom: '0.2rem' }}>{t.name}</h4>
                                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* About Us Section */}
            <section style={{ padding: '4rem 5%', background: 'var(--secondary-bg)' }} className="reveal-on-scroll">
                <div style={{ maxWidth: '900px' }}>
                    <span className="subtitle" style={{ letterSpacing: '6px' }}>ABOUT US</span>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: '1.15', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                        Leading the Future of Manufacturing Technology
                    </h2>
                    <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.65)', lineHeight: '1.9', marginBottom: '1.5rem', maxWidth: '800px' }}>
                        Dj Group of Industry specializes in advanced manufacturing robotics to automate and optimise production processes. With a commitment to innovation and quality, Dj Group of Industry delivers cutting-edge robotic solutions tailored for diverse industries.
                    </p>
                    <Link to="/about" style={{
                        display: 'inline-block',
                        padding: '1rem 2.5rem',
                        border: '1px solid rgba(255,255,255,0.6)',
                        color: '#fff',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        borderRadius: '4px',
                        transition: 'all 0.3s ease'
                    }}>
                        Learn More
                    </Link>
                </div>
            </section>

            {/* Why Choose DJ Group */}
            <section style={{ padding: '4rem 5%', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }} className="reveal-on-scroll">
                    <span className="subtitle" style={{ letterSpacing: '6px' }}>WHY CHOOSE DJ GROUP</span>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginTop: '1.5rem' }}>Engineered for Your Success</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                    {/* Guaranteed ROI */}
                    <div 
                        onClick={() => setActiveModal('roi')}
                        className="glass reveal-on-scroll" 
                        style={{
                            padding: '3.5rem',
                            borderRadius: '20px',
                            border: '1px solid rgba(255, 222, 89, 0.1)',
                            transition: 'all 0.4s ease',
                            position: 'relative',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            border: '2px solid var(--accent-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '2rem'
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Guaranteed ROI</h3>
                            <span style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Read More →</span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: '1.8' }}>
                            Our clients experience an average of 35% increase in production efficiency within the first 6 months of implementation.
                        </p>
                    </div>

                    {/* 24/7 Rapid Support */}
                    <div 
                        onClick={() => setActiveModal('support')}
                        className="glass reveal-on-scroll" 
                        style={{
                            padding: '3.5rem',
                            borderRadius: '20px',
                            border: '1px solid rgba(255, 222, 89, 0.1)',
                            transition: 'all 0.4s ease',
                            position: 'relative',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            border: '2px solid var(--accent-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '2rem'
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>24/7 Rapid Support</h3>
                            <span style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Read More →</span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: '1.8' }}>
                            Downtime costs money. Our dedicated expert support team is available around the clock to ensure your operations never stop.
                        </p>
                    </div>

                    {/* Uncompromised Safety */}
                    <div 
                        onClick={() => setActiveModal('safety')}
                        className="glass reveal-on-scroll" 
                        style={{
                            padding: '3.5rem',
                            borderRadius: '20px',
                            border: '1px solid rgba(255, 222, 89, 0.1)',
                            transition: 'all 0.4s ease',
                            position: 'relative',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            border: '2px solid var(--accent-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '2rem'
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Uncompromised Safety</h3>
                            <span style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Read More →</span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: '1.8' }}>
                            Built to the highest international safety standards. Our cobots and industrial units prioritize human safety above all else.
                        </p>
                    </div>
                </div>
            </section>

            {/* Final Call to Action */}
            <section style={{
                padding: '5rem 5%',
                textAlign: 'center',
                background: 'radial-gradient(circle at center, rgba(255, 222, 89, 0.05) 0%, transparent 70%)'
            }}>
                <h2 style={{ fontSize: '5rem', fontWeight: 900, marginBottom: '1.5rem' }}>Ready to <span style={{ color: 'var(--accent-color)' }}>Transform?</span></h2>
                <p style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.6)', maxWidth: '800px', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
                    Join the industry leaders who have already embraced the future of autonomous precision. Let's build your custom solution.
                </p>
                <Link to="/contact" className="btn-primary-v2" style={{
                    background: 'var(--accent-color)',
                    color: '#000',
                    padding: '1.5rem 5rem',
                    borderRadius: '8px',
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    textDecoration: 'none',
                    boxShadow: '0 20px 50px rgba(255, 222, 89, 0.2)'
                }}>
                    Start Consultation
                </Link>
            </section>

            {/* Feature Modals */}
            {activeModal && (
                <div 
                    onClick={() => setActiveModal(null)}
                    style={{
                        position: 'fixed',
                        zIndex: 10000,
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(5, 21, 21, 0.9)',
                        backdropFilter: 'blur(8px)',
                        padding: '2rem'
                    }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="glass"
                        style={{
                            backgroundColor: 'var(--secondary-bg)',
                            padding: '3.5rem',
                            border: '1px solid var(--accent-color)',
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '700px',
                            position: 'relative',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                            animation: 'fadeInUp 0.3s ease-out forwards'
                        }}
                    >
                        <button 
                            onClick={() => setActiveModal(null)}
                            style={{
                                color: 'var(--text-muted)',
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                background: 'none',
                                border: 'none',
                                fontSize: '2rem',
                                cursor: 'pointer',
                                transition: 'color 0.3s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#fff'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                        >
                            &times;
                        </button>
                        
                        {activeModal === 'roi' && (
                            <>
                                <h2 style={{ color: 'var(--accent-color)', fontSize: '2.2rem', marginBottom: '2rem', fontWeight: 800 }}>Guaranteed ROI Details</h2>
                                <ul style={{ color: '#fff', fontSize: '1.1rem', lineHeight: '1.9', listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    <li><strong>Rapid Amortization:</strong> Most of our robotic deployments pay for themselves within 12 to 18 months.</li>
                                    <li><strong>Reduced Material Waste:</strong> High precision means fewer errors, drastically cutting raw material waste by up to 20%.</li>
                                    <li><strong>Predictable Output:</strong> Eliminate shifts and breaks; get constant, predictable 24/7 manufacturing output.</li>
                                    <li><strong>Data-Driven Insights:</strong> Integrated sensors provide real-time analytics to continually optimize your process flow.</li>
                                </ul>
                            </>
                        )}

                        {activeModal === 'support' && (
                            <>
                                <h2 style={{ color: 'var(--accent-color)', fontSize: '2.2rem', marginBottom: '2rem', fontWeight: 800 }}>24/7 Rapid Support Details</h2>
                                <ul style={{ color: '#fff', fontSize: '1.1rem', lineHeight: '1.9', listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    <li><strong>Dedicated Account Managers:</strong> You are assigned a specific engineering team familiar with your custom deployment.</li>
                                    <li><strong>Remote Diagnostics:</strong> Our secure cloud connections allow us to troubleshoot and push fixes over-the-air instantly.</li>
                                    <li><strong>Global Technician Network:</strong> If physical intervention is needed, our certified technicians are dispatched worldwide within 24 hours.</li>
                                    <li><strong>Preventative Maintenance:</strong> Scheduled check-ups and part replacements prevent breakdowns before they occur.</li>
                                </ul>
                            </>
                        )}

                        {activeModal === 'safety' && (
                            <>
                                <h2 style={{ color: 'var(--accent-color)', fontSize: '2.2rem', marginBottom: '2rem', fontWeight: 800 }}>Uncompromised Safety Details</h2>
                                <ul style={{ color: '#fff', fontSize: '1.1rem', lineHeight: '1.9', listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    <li><strong>ISO/TS 15066 Compliance:</strong> All cobots exceed international safety standards for collaborative workspaces.</li>
                                    <li><strong>Advanced Collision Avoidance:</strong> Proprietary sensors detect human presence within milliseconds, triggering an immediate soft-stop.</li>
                                    <li><strong>Force Limiting:</strong> Physical constraints ensure even in case of contact, force applied is well below human injury thresholds.</li>
                                    <li><strong>Cybersecurity Protocols:</strong> Industrial-grade encryption protects your robotic network from external hacking or interference.</li>
                                </ul>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
