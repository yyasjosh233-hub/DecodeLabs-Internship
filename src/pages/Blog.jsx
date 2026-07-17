import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import local assets
import underwaterImg from '../assets/underwater_robot.png';
import educationalImg from '../assets/educational_robot.png';
import agriculturalImg from '../assets/agricultural_robot.png';
import medicalImg from '../assets/medical robots.png';
import humanoidImg from '../assets/humanoid.png';
import weldingImg from '../assets/Welding_Robots.png';
import swarmImg from '../assets/Swarm Robotics Systems.png';
import carImg from '../assets/Autonomous Robot Car.png';

// Import newly generated custom stock assets
import sewingMachineImg from '../assets/future_sewing_machine.png';
import humanoidRobotLineImg from '../assets/humanoid_robot_line.png';
import glowingDartboardImg from '../assets/glowing_dartboard.png';
import orangeRoboticArmsFactoryImg from '../assets/orange_robotic_arms_factory.png';
import formulaRaceCarImg from '../assets/formula_race_car.png';
import textileAutomationImg from '../assets/textile_automation.png';
import deburringImg from '../assets/robotic_deburring.png';

const imageMap = {
    underwater: underwaterImg,
    educational: educationalImg,
    agricultural: agriculturalImg,
    medical: medicalImg,
    humanoidRobotLine: humanoidRobotLineImg,
    orangeRoboticArmsFactory: orangeRoboticArmsFactoryImg,
    welding: weldingImg,
    sewingMachine: sewingMachineImg,
    glowingDartboard: glowingDartboardImg,
    swarm: swarmImg,
    car: carImg,
    formulaRaceCar: formulaRaceCarImg,
    textileAutomation: textileAutomationImg,
    deburring: deburringImg
};


const TelemetryConsole = () => {
    const [telemetry, setTelemetry] = useState([
        { id: 1, location: "Chennai Unit A-12", workload: "Welding", status: "ACTIVE", efficiency: 98.4, cycleCount: 14205, temp: 34.2 },
        { id: 2, location: "Mumbai Pharma B-4", workload: "Sterile Filling", status: "ACTIVE", efficiency: 99.1, cycleCount: 8432, temp: 21.8 },
        { id: 3, location: "Coimbatore Spinning S-1", workload: "Tension Tuning", status: "ACTIVE", efficiency: 97.8, cycleCount: 22849, temp: 28.5 },
        { id: 4, location: "Bengaluru Logistics W-8", workload: "AMR Dispatch", status: "ACTIVE", efficiency: 98.9, cycleCount: 4501, temp: 24.1 }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTelemetry(prev => prev.map(item => {
                const randomCycleAdd = Math.floor(Math.random() * 3) + 1;
                const randomTempChange = (Math.random() * 0.4 - 0.2);
                const randomEffChange = (Math.random() * 0.2 - 0.1);
                
                return {
                    ...item,
                    cycleCount: item.cycleCount + randomCycleAdd,
                    temp: parseFloat((item.temp + randomTempChange).toFixed(1)),
                    efficiency: parseFloat(Math.min(100, Math.max(90, item.efficiency + randomEffChange)).toFixed(1))
                };
            }));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass reveal-on-scroll" style={{
            maxWidth: '1400px',
            margin: '4rem auto 0 auto',
            padding: '4rem',
            borderRadius: '24px',
            border: '1px solid rgba(255,222,89,0.1)',
            background: 'rgba(5, 21, 21, 0.95)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                    <span className="subtitle" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>LIVE OPERATIONS</span>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginTop: '0.8rem' }}>Industry Workload Telemetry</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,222,89,0.05)', border: '1px solid rgba(255,222,89,0.15)', borderRadius: '50px', padding: '0.6rem 1.4rem' }}>
                    <div style={{ width: '10px', height: '10px', background: '#00ff66', borderRadius: '50%', boxShadow: '0 0 10px #00ff66' }} className="pulse-glowing"></div>
                    <span style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px' }}>SYSTEM STATUS: HEALTHY</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                {telemetry.map(item => (
                    <div key={item.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>{item.location}</span>
                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(0,255,102,0.1)', color: '#00ff66', fontWeight: 800 }}>{item.status}</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Workload:</span>
                                <span style={{ color: '#fff', fontWeight: 600 }}>{item.workload}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Op Efficiency:</span>
                                <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{item.efficiency}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Total Cycles:</span>
                                <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 600 }}>{item.cycleCount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Joint Temp:</span>
                                <span style={{ color: item.temp > 40 ? '#ff3333' : '#fff', fontWeight: 600 }}>{item.temp}°C</span>
                            </div>
                        </div>

                        {/* Progress Meter Bar */}
                        <div style={{ marginTop: '1.5rem', width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ width: `${item.efficiency}%`, height: '100%', background: 'var(--accent-color)', transition: 'width 0.5s ease-out' }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Blog = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [gridLayout, setGridLayout] = useState(false);
    const [roboticsData, setRoboticsData] = useState([]);
    const [loadingRobotics, setLoadingRobotics] = useState(true);
    const [postsData, setPostsData] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

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

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('/api/posts');
                setPostsData(response.data);
            } catch (error) {
                console.error("Error fetching posts data, using fallback:", error);
                setPostsData([
                    {
                        id: 1,
                        tag: 'OCEAN TECH',
                        category: 'Robotics',
                        date: 'February 24, 2026',
                        title: 'Underwater Robots',
                        content: 'Underwater robots (ROVs or AUVs) play a crucial role in ocean exploration, underwater mining, and pipeline inspections, reaching depths inaccessible to human divers.',
                        imageKey: 'underwater'
                    },
                    {
                        id: 2,
                        tag: 'EDTECH',
                        category: 'Education',
                        date: 'February 24, 2026',
                        title: 'Educational Robots',
                        content: 'Educational robots are specifically designed to facilitate hands-on learning in coding and robotics, preparing the next generation for an automated world.',
                        imageKey: 'educational'
                    },
                    {
                        id: 3,
                        tag: 'AGRI-TECH',
                        category: 'Robotics',
                        date: 'February 24, 2026',
                        title: 'Agricultural Robots',
                        content: 'From precision planting to health monitoring via AI sensors, agricultural robots are transforming farming into a high-tech, efficiency-driven industry.',
                        imageKey: 'agricultural'
                    },
                    {
                        id: 4,
                        tag: 'HEALTH-CARE',
                        category: 'Medical',
                        date: 'February 24, 2026',
                        title: 'Medical Robots',
                        content: 'Enhancing precision in surgical procedures and reducing recovery times, medical robots are a cornerstone of modern minimally invasive surgery.',
                        imageKey: 'medical'
                    },
                    {
                        id: 5,
                        tag: 'HUMANOID',
                        category: 'AI',
                        date: 'February 24, 2026',
                        title: 'Humanoid Assembly Systems',
                        content: 'Clean-room humanoid robots executing micro-inspections and delicate assembly tasks with high precision on automated production lines.',
                        imageKey: 'humanoidRobotLine'
                    },
                    {
                        id: 6,
                        tag: 'AUTOMATION',
                        category: 'Industry',
                        date: 'February 24, 2026',
                        title: 'High-Volume Automation',
                        content: 'Industrial automation robots built for pure throughput and sub-millimeter precision, essential for global manufacturing elite.',
                        imageKey: 'orangeRoboticArmsFactory'
                    },
                    {
                        id: 7,
                        tag: 'RPA',
                        category: 'Industry',
                        date: 'February 28, 2026',
                        title: 'Robotic Process Automation',
                        content: 'Optimizing and securing intricate factory workflows while enhancing operator safety across all manufacturing sectors.',
                        image: 'https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?auto=format&fit=crop&q=80&w=1200'
                    },
                    {
                        id: 8,
                        tag: 'LOGISTICS',
                        category: 'Robotics',
                        date: 'February 28, 2026',
                        title: 'Autonomous Mobile Robots (AMR)',
                        content: 'Revolutionizing warehouse logistics, AMRs navigate dynamically using sensors and AI to transport goods safely in busy environments.',
                        image: 'https://images.unsplash.com/photo-1589254066007-898d52d910d3?auto=format&fit=crop&q=80&w=1200'
                    },
                    {
                        id: 9,
                        tag: 'FABRICATION',
                        category: 'Industry',
                        date: 'February 28, 2026',
                        title: 'Advanced Robotic Welding',
                        content: 'Automated welding cells that integrate real-time vision to adapt to part variances, ensuring perfect seam integrity every time.',
                        imageKey: 'welding'
                    },
                    {
                        id: 10,
                        tag: 'CYBER-TECH',
                        category: 'Industry',
                        date: 'February 28, 2026',
                        title: 'Cyber-Physical Sewing Systems',
                        content: 'Next-generation computerized sewing automation integrating visual sensors to execute precise stitching on dynamic fabrics.',
                        imageKey: 'sewingMachine'
                    },
                    {
                        id: 11,
                        tag: 'AI-VISION',
                        category: 'AI',
                        date: 'February 28, 2026',
                        title: 'Precision Target Calibration',
                        content: 'Optic sensor testing and alignment rigs utilizing high-frequency telemetry tracking to achieve sub-micron precision.',
                        imageKey: 'glowingDartboard'
                    },
                    {
                        id: 12,
                        tag: 'SWARM-TECH',
                        category: 'Robotics',
                        date: 'February 28, 2026',
                        title: 'Swarm Robotics Systems',
                        content: 'Coordinating large numbers of simple robots to accomplish complex tasks collaboratively, providing extreme fault tolerance.',
                        imageKey: 'swarm'
                    },
                    {
                        id: 13,
                        tag: 'SELF-DRIVING',
                        category: 'AI',
                        date: 'February 28, 2026',
                        title: 'Autonomous Robot Car',
                        content: 'Next-gen mobility systems built with self-driving capability, reshaping urban transportation and logistical delivery.',
                        imageKey: 'car'
                    },
                    {
                        id: 14,
                        tag: 'TELEMATICS',
                        category: 'AI',
                        date: 'February 28, 2026',
                        title: 'High-Speed Vehicle Telematics',
                        content: 'Telemetry processing platforms streaming motor metrics and chassis balance points at ultra-low latencies.',
                        imageKey: 'formulaRaceCar'
                    },
                    {
                        id: 15,
                        tag: 'TEXTILE-TECH',
                        category: 'Industry',
                        date: 'February 28, 2026',
                        title: 'Textile Factory Automation',
                        content: 'High-speed automated yarn spinning facilities utilizing IoT sensors to maintain perfect thread tension and throughput.',
                        imageKey: 'textileAutomation'
                    },
                    {
                        id: 16,
                        tag: 'MOBILITY',
                        category: 'Robotics',
                        date: 'February 28, 2026',
                        title: 'Legged Locomotion',
                        content: 'Robots based on advanced movement types, utilizing biomimetic legged mobility to conquer terrains inaccessible to wheels.',
                        image: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=1200'
                    },
                    {
                        id: 17,
                        tag: 'LOGISTICS',
                        category: 'Automation',
                        date: 'March 01, 2026',
                        title: 'Robotic Palletizing Systems',
                        content: 'Advanced robotic articulators operating at high-speed load-bearing cycles, stacking heavy cargo cases in optimal grids.',
                        image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=1200'
                    },
                    {
                        id: 18,
                        tag: 'CNC-TECH',
                        category: 'Manufacturing',
                        date: 'March 01, 2026',
                        title: 'CNC Machine Tending Robots',
                        content: 'Integrating multi-gripper loaders with active machine doors to automate tool spindle loading and raw material feeding.',
                        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200'
                    },
                    {
                        id: 19,
                        tag: 'FABRICATION',
                        category: 'Manufacturing',
                        date: 'March 01, 2026',
                        title: 'Robotic Laser Cutting & Slicing',
                        content: 'High-power multi-axis laser cut units profiling complex contours in steel plate feeds with sub-micron tolerances.',
                        image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1200'
                    },
                    {
                        id: 20,
                        tag: 'COATING',
                        category: 'Automation',
                        date: 'March 01, 2026',
                        title: 'Robotic Painting & Coating Cells',
                        content: 'Explosion-proof paint sprayers operating in isolated enclosures to deliver flawless finishes on heavy manufacturing parts.',
                        image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=1200'
                    },
                    {
                        id: 21,
                        tag: 'PACKAGING',
                        category: 'Robotics',
                        date: 'March 01, 2026',
                        title: 'Delta Pick-and-Place Systems',
                        content: 'Spider-like high-frequency parallel robots packaging pharmaceuticals, food items, and delicate electronics at top speed.',
                        image: 'https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?auto=format&fit=crop&q=80&w=1200'
                    },
                    {
                        id: 22,
                        tag: 'FOUNDRY',
                        category: 'Manufacturing',
                        date: 'March 01, 2026',
                        title: 'Metallurgical Foundry Robots',
                        content: 'Heavy payload thermal-shielded robotic arms performing casting extraction and molten metal pouring under extreme heat.',
                        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200'
                    },
                    {
                        id: 23,
                        tag: 'DOCK-TECH',
                        category: 'Logistics',
                        date: 'March 01, 2026',
                        title: 'Autonomous Forklift Fleets',
                        content: 'Advanced driverless lift trucks navigating warehouse spaces via 3D LiDAR meshes to automate high-rack pallet loading.',
                        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200'
                    },
                    {
                        id: 24,
                        tag: 'FINISHING',
                        category: 'Automation',
                        date: 'March 01, 2026',
                        title: 'Robotic De-burring & Polishing',
                        content: 'Force-feedback grinding robots stripping weld seams and polishing castings automatically to achieve uniform smoothness.',
                        imageKey: 'deburring'
                    }
                ]);
            } finally {
                setLoadingPosts(false);
            }
        };
        fetchPosts();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.reveal-on-scroll');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [searchQuery, selectedCategory, gridLayout, postsData]);

    // Calculate reading time helper
    const getReadingTime = (text) => {
        const words = text.split(/\s+/).length;
        const minutes = Math.ceil(words / 150); // average speed
        return `${minutes} min read`;
    };

    // Filter Posts
    const filteredPosts = postsData.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             post.tag.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const categories = ['All', 'AI', 'Robotics', 'Industry', 'Medical', 'Education'];

    return (
        <div className="blog-page animate-fade-in" style={{ background: '#051515', color: '#fff' }}>
            <section className="blog-hero" style={{ height: '45vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(255, 222, 89, 0.05) 0%, transparent 70%)' }}>
                <span className="subtitle" style={{ letterSpacing: '8px', color: 'var(--accent-color)', marginBottom: '1.5rem', fontWeight: 600 }}>INDUSTRIAL INSIGHTS</span>
                <h1 style={{ fontSize: '4.5rem', fontWeight: 900 }}>The <span style={{ color: 'var(--accent-color)' }}>Future</span> of Robotics</h1>
            </section>

            {/* Toolbar: Search, Filters & Grid Layout Toggle */}
            <div style={{
                maxWidth: '1400px',
                margin: '4rem auto 0 auto',
                padding: '0 5%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '2rem'
            }}>
                {/* Search Bar */}
                <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
                    <input 
                        type="text" 
                        placeholder="Search articles..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 222, 89, 0.2)',
                            borderRadius: '8px',
                            padding: '1rem 1.2rem 1rem 3rem',
                            color: '#fff',
                            fontSize: '0.95rem',
                            outline: 'none',
                            transition: 'border-color 0.3s'
                        }}
                    />
                    <svg style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                background: selectedCategory === cat ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.02)',
                                color: selectedCategory === cat ? '#000' : 'rgba(255,255,255,0.7)',
                                border: '1px solid rgba(255,222,89,0.1)',
                                padding: '0.6rem 1.4rem',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Layout Toggle */}
                <button 
                    onClick={() => setGridLayout(!gridLayout)}
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 222, 89, 0.2)',
                        borderRadius: '8px',
                        padding: '0.8rem',
                        cursor: 'pointer',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.3s'
                    }}
                    title={gridLayout ? "List view" : "Grid view"}
                >
                    {gridLayout ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                    )}
                </button>
            </div>

            {/* Grid vs List rendering */}
            <section className="blog-content" style={{ padding: '6rem 5%', maxWidth: '1400px', margin: '0 auto' }}>
                {filteredPosts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
                        <h3>No articles match your criteria.</h3>
                        <p style={{ marginTop: '1rem' }}>Try clearing your search query or picking a different category filter.</p>
                    </div>
                ) : gridLayout ? (
                    /* Grid Layout (3 Columns) */
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '3rem'
                    }}>
                        {filteredPosts.map(post => (
                            <article 
                                key={post.id}
                                className="glass reveal-on-scroll"
                                style={{
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255, 222, 89, 0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.3s ease',
                                }}
                            >
                                <div style={{ height: '220px', overflow: 'hidden' }}>
                                    <img src={post.image || imageMap[post.imageKey]} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                        <span style={{ color: 'var(--accent-color)', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '1px' }}>{post.tag}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{getReadingTime(post.content)}</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem', fontWeight: 700 }}>{post.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem', flexGrow: 1 }}>{post.content}</p>
                                    <a href="#" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>Read Article &rarr;</a>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    /* Standard Dynamic List Layout */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
                        {filteredPosts.map((post, index) => (
                            <article 
                                key={post.id} 
                                style={{ 
                                    display: 'flex', 
                                    flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    backdropFilter: 'blur(15px)',
                                    borderRadius: '30px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255, 222, 89, 0.1)',
                                    transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                                    minHeight: '480px'
                                }}
                                className="blog-wide-card reveal-on-scroll"
                            >
                                <div style={{ flex: '1.3', position: 'relative', overflow: 'hidden' }}>
                                    <img 
                                        src={post.image || imageMap[post.imageKey]} 
                                        alt={post.title} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                                        className="card-img"
                                    />
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, rgba(5,21,21,0.2), transparent)' }}></div>
                                </div>
                                <div style={{ flex: '1', padding: '4.5rem', display: 'flex', flexDirection: 'column', justifycontent: 'center' }}>
                                    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                        <span style={{ 
                                            background: 'rgba(255, 222, 89, 0.15)', 
                                            color: 'var(--accent-color)', 
                                            padding: '0.6rem 1.4rem', 
                                            borderRadius: '50px', 
                                            fontSize: '0.75rem', 
                                            fontWeight: 800,
                                            letterSpacing: '2px'
                                        }}>
                                            {post.tag}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{getReadingTime(post.content)}</span>
                                    </div>
                                    <h2 style={{ fontSize: '3rem', marginBottom: '1.8rem', fontWeight: 800, lineHeight: '1.1', color: '#fff' }}>{post.title}</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.15rem', lineHeight: '1.9', marginBottom: '3rem', maxWidth: '90%' }}>
                                        {post.content}
                                    </p>
                                    <div>
                                        <a href="#" className="btn-blog-action" style={{ 
                                            display: 'inline-block', 
                                            padding: '1rem 2.8rem', 
                                            borderRadius: '6px', 
                                            border: '1px solid rgba(255,255,255,0.8)', 
                                            color: '#fff', 
                                            textDecoration: 'none', 
                                            fontSize: '0.95rem', 
                                            fontWeight: 700,
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer'
                                        }}>
                                            Learn More
                                        </a>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* Robotics Tech Reference */}
            <section style={{
                maxWidth: '1400px',
                margin: '4rem auto 0 auto',
                padding: '4rem',
                borderRadius: '24px',
                border: '1px solid rgba(255,222,89,0.1)',
                background: 'rgba(5, 21, 21, 0.95)'
            }} className="reveal-on-scroll">
                <div style={{ marginBottom: '3rem' }}>
                    <span className="subtitle" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>TECH GLOSSARY</span>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginTop: '0.8rem' }}>Robotics Reference Guide</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.5rem' }}>
                        Quick-reference technical details for all active autonomous modules running on our mesh network.
                    </p>
                </div>

                {loadingRobotics ? (
                    <div style={{ color: 'var(--accent-color)', fontSize: '1.1rem', fontWeight: 700 }}>
                        Connecting telemetry database...
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        {roboticsData.map(robot => (
                            <div key={robot.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '2rem' }}>
                                <h4 style={{ color: 'var(--accent-color)', fontSize: '1.2rem', marginBottom: '0.8rem', fontWeight: 800 }}>{robot.title}</h4>
                                <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>{robot.description}</p>
                                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>
                                    {robot.spec}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Live Telemetry Console showing present industry workloads */}
            <TelemetryConsole />

            <section style={{ height: '15rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '1px', height: '100px', background: 'linear-gradient(to bottom, var(--accent-color), transparent)', opacity: 0.3 }}></div>
            </section>
        </div>
    );
};

export default Blog;
