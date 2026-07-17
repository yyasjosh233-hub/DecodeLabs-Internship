import React, { useState, useEffect } from 'react';
import axios from 'axios';
import bengaluruImg from '../assets/Bengaluru.png';
import hyderabadImg from '../assets/hyderabad.png';
import puneImg from '../assets/Pune.png';
import chennaiImg from '../assets/chennai.png';
import ahmedabadImg from '../assets/Ahmebabed.png';
import coimbatoreImg from '../assets/Coimbatore.png';
import mumbaiImg from '../assets/Mumbai.png';
import delhiImg from '../assets/delhi.png';
import roboticArmImg from '../assets/robotic_arm.png';

const HubCard = ({ city, category, description, image }) => (
    <div className="hub-card glass" style={{ borderRadius: '12px', overflow: 'hidden', transition: 'var(--transition)' }}>
        <div style={{ height: '220px', overflow: 'hidden' }}>
            <img src={image} alt={`${city} Robotics Lab`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} className="hub-img" />
        </div>
        <div style={{ padding: '2rem' }}>
            <h3 style={{ color: 'var(--accent-color)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>{city}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.8rem', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{category}</p>
            <p style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: '1.6' }}>{description}</p>
        </div>
    </div>
);

const About = () => {
    const [roboticsData, setRoboticsData] = useState([]);
    const [loadingRobotics, setLoadingRobotics] = useState(true);

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
                        description: "Automated machines used in factories. They perform tasks like welding, painting, assembly, packaging, and material handling with high precision and speed.",
                        spec: "Payload: Up to 500kg | Precision: ±0.02mm",
                        icon: "industrial"
                    },
                    {
                        id: "humanoid",
                        title: "Humanoid Robots",
                        description: "Robots designed to look and behave like humans. They are used in research, service industries, customer interaction, and advanced AI development.",
                        spec: "DoF: 53 | AI Core: Neural-Motion v4",
                        icon: "humanoid"
                    },
                    {
                        id: "medical",
                        title: "Medical Robots",
                        description: "Assist doctors in performing precise surgeries, rehabilitation therapy, patient monitoring, and hospital automation.",
                        spec: "Latency: <1.2ms | Accuracy: Sub-millimeter",
                        icon: "medical"
                    },
                    {
                        id: "agricultural",
                        title: "Agricultural Robots",
                        description: "Help farmers with tasks like planting, harvesting crops, spraying fertilizers, monitoring soil health, and crop inspection using AI sensors.",
                        spec: "Autonomy: Level 4 | Coverage: 50 acres/day",
                        icon: "agriculture"
                    },
                    {
                        id: "uav",
                        title: "Drone Robots (UAV)",
                        description: "Flying robots used for surveillance, delivery services, agriculture monitoring, aerial photography, mapping, and disaster management.",
                        spec: "Flight Time: 60 mins | Sensors: LiDAR & Multi-spectral",
                        icon: "drone"
                    },
                    {
                        id: "underwater",
                        title: "Underwater Robots",
                        description: "Used for ocean exploration, pipeline inspection, underwater research, and deep-sea mining (ROV or AUV).",
                        spec: "Depth: Up to 6000m | Navigation: Acoustic SLAM",
                        icon: "underwater"
                    },
                    {
                        id: "military",
                        title: "Military Robots",
                        description: "Used by defense forces for bomb disposal, surveillance, reconnaissance missions, and battlefield support.",
                        spec: "Traction: Tracked / All-Terrain | Payload: Weaponry & Sensors",
                        icon: "military"
                    },
                    {
                        id: "service",
                        title: "Service Robots",
                        description: "Assist humans in daily activities. Examples include hotel robots, hospital robots, cleaning robots, and delivery robots.",
                        spec: "Interaction: Natural Language | Navigation: Indoor SLAM",
                        icon: "service"
                    },
                    {
                        id: "educational",
                        title: "Educational Robots",
                        description: "Help students learn coding, robotics engineering, artificial intelligence, and STEM concepts through practical hands-on learning.",
                        spec: "Software: Blockly & Python | Connectivity: Bluetooth/Wi-Fi",
                        icon: "educational"
                    },
                    {
                        id: "amr",
                        title: "Autonomous Mobile Robots (AMR)",
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

    const hubs = [
        {
            city: "Bengaluru",
            category: "Largest Robotics & AI Hub",
            description: "Bengaluru is the heart of India's robotics and AI sector, home to everything from massive e-commerce automation to humanoid AI research.",
            image: bengaluruImg
        },
        {
            city: "Hyderabad",
            category: "Defense Robotics & Automation",
            description: "Leveraging strong defense research infrastructure alongside a burgeoning startup culture to develop robust automation.",
            image: hyderabadImg
        },
        {
            city: "Pune",
            category: "Industrial Robotics & Manufacturing",
            description: "An industrial powerhouse where the focus is on heavy-duty articulated arms, collaborative robots, and streamlining massive manufacturing lines.",
            image: puneImg
        },
        {
            city: "Chennai",
            category: "Automotive & Factory Automation",
            description: "Often called the 'Detroit of India,' where robotics meets high-volume automotive production with a focus on precision and scale.",
            image: chennaiImg
        },
        {
            city: "Ahmedabad",
            category: "Robotics Startups & Industrial Automation",
            description: "Ahmedabad is emerging as an important hub for robotics startups, supported by strong manufacturing industries and innovation centers.",
            image: ahmedabadImg
        },
        {
            city: "Coimbatore",
            category: "Industrial Robotics & Smart Manufacturing",
            description: "Known for its strong engineering ecosystem, the city supports robotics development in textile automation and machine tools.",
            image: coimbatoreImg
        },
        {
            city: "Mumbai",
            category: "Robotics Startups & Tech",
            description: "Dominated by intelligent software solutions, featuring startups focused on AI for retail, fin-tech automation, and collaborative robots.",
            image: mumbaiImg
        },
        {
            city: "Delhi",
            category: "Research & AI Robotics",
            description: "A hub for high-level research leveraging strong academic institutions, with a focus on AI-driven perception and human-robot interaction.",
            image: delhiImg
        }
    ];

    return (
        <div className="about-page animate-fade-in">
            <section className="blog-hero" style={{ height: '55vh', background: 'linear-gradient(rgba(5, 21, 21, 0.7), rgba(5, 21, 21, 0.9)), url("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000")' }}>
                <span className="subtitle" style={{ letterSpacing: '6px' }}>ENGINEERING THE BEYOND</span>
                <h1 style={{ fontSize: '4.5rem', fontWeight: 900 }}>Who We <span style={{ color: 'var(--accent-color)' }}>Are</span></h1>
            </section>

            {/* Reorganized Mission Section with Robotic Arm Image */}
            <section className="content-section" style={{ padding: '10rem 2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '4rem', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
                    <div>
                        <span className="subtitle">OUR CORE ESSENCE</span>
                        <h2 style={{ fontSize: '3rem', marginBottom: '2.5rem', fontWeight: 800 }}>Pioneers of the <span style={{ color: 'var(--accent-color)' }}>New Industrial Age</span></h2>
                        <div className="glass" style={{ padding: '3.5rem', borderRadius: '24px', border: '1px solid rgba(255, 222, 89, 0.1)' }}>
                            <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '3rem', color: '#eee', fontWeight: 300 }}>
                                Dj Group of Industry is not just a robotics company; we are an innovation powerhouse. We combine mechanical mastery with proprietary AI to create systems that don't just work—they excel.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                                {[
                                    { title: 'Excellence', desc: 'Sovereign-grade performance across all units.' },
                                    { title: 'Integrity', desc: 'Unyielding reliability in mission-critical environments.' },
                                    { title: 'Innovation', desc: 'Predictive AI at the heart of every motion.' }
                                ].map((item, i) => (
                                    <div key={i} className="principle">
                                        <h4 style={{ color: 'var(--accent-color)', fontSize: '1.3rem', marginBottom: '0.8rem' }}>{item.title}</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="tech-image-container" style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100%', height: '100%', border: '1px solid var(--accent-color)', borderRadius: '20px', opacity: 0.2, zIndex: 0 }}></div>
                        <img
                            src={roboticArmImg}
                            alt="High Tech Robotic Arm"
                            style={{ borderRadius: '20px', width: '100%', height: 'auto', display: 'block', position: 'relative', zIndex: 1, boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}
                        />
                    </div>
                </div>
            </section>

            {/* Our Robotics Technology Spectrum */}
            <section style={{ padding: '6rem 5%', maxWidth: '1400px', margin: '0 auto 4rem auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <span className="subtitle" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>TECH SPECTRUM</span>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', marginTop: '1.5rem' }}>Our Robotics Technology Spectrum</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px', margin: '1.5rem auto 0 auto' }}>
                        From high-capacity industrial machines to sub-millimeter surgical articulators, explore the tech stack driving our engineering excellence.
                    </p>
                </div>

                {loadingRobotics ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <div style={{ color: 'var(--accent-color)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Loading Technology Spectrum...
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        {roboticsData.map((robot) => (
                            <div 
                                key={robot.id} 
                                className="glass" 
                                style={{
                                    padding: '2.5rem',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255, 222, 89, 0.05)',
                                    background: 'rgba(5, 21, 21, 0.4)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>{robot.title}</h3>
                                    <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                        {robot.description}
                                    </p>
                                </div>
                                <div style={{
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    paddingTop: '1rem',
                                    fontSize: '0.75rem',
                                    fontFamily: 'monospace',
                                    color: 'var(--accent-color)',
                                    letterSpacing: '0.5px'
                                }}>
                                    {robot.spec}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="robotics-hubs" style={{ background: 'var(--secondary-bg)', maxWidth: '100%', padding: '10rem 10%' }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <span className="subtitle">NATIONAL PRESENCE</span>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 800 }}>Strategic <span style={{ color: 'var(--accent-color)' }}>Infrastructure</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px', margin: '2rem auto 0 auto' }}>
                        Our presence across India ensures we remain at the forefront of the technological revolution, providing localized expertise with global standards.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
                    {hubs.map((hub, index) => (
                        <HubCard key={index} {...hub} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default About;
