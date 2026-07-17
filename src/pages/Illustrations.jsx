import React, { useState, useEffect } from 'react';

// Import assets
import futureSewingMachine from '../assets/future_sewing_machine.png';
import humanoidRobotLine from '../assets/humanoid_robot_line.png';
import glowingDartboard from '../assets/glowing_dartboard.png';
import orangeRoboticArmsFactory from '../assets/orange_robotic_arms_factory.png';
import formulaRaceCar from '../assets/formula_race_car.png';
import textileAutomation from '../assets/textile_automation.png';
import roboticArm from '../assets/robotic_arm.png';
import pharmaceuticalBottling from '../assets/pharmaceutical_bottling.png';
import biomimeticPollinator from '../assets/biomimetic_pollinator.png';
import microelectronicsProcessor from '../assets/microelectronics_processor.png';
import uxFlowTelemetry from '../assets/ux_flow_telemetry.png';

const illustrationData = [
    {
        id: 1,
        title: "Precision Cyber-Physical Sewing System",
        tag: "Cyber-Physical",
        category: "Automation",
        image: futureSewingMachine,
        description: "An advanced robotic sewing cell that merges high-speed mechanics with digital sensory intelligence. This system adapts to fabric elasticity and thickness on the fly, ensuring perfect stitch precision on complex industrial textiles.",
        advancedTech: [
            "Computer Vision Fabric Alignment",
            "Neural Stitch-path Correction",
            "IoT Cloud Synchronization Protocols",
            "Real-Time Edge Process Diagnostics"
        ],
        keyFeatures: [
            "Dynamic thread tension auto-tuning",
            "Visual fabric distortion compensation",
            "Automatic multi-thread bobbin management"
        ]
    },
    {
        id: 2,
        title: "Humanoid Robotic Assembly Line",
        tag: "Humanoid Robotics",
        category: "AI & Robotics",
        image: humanoidRobotLine,
        description: "A synchronized cleanroom production line composed of humanoid robot workers. Designed to mimic human dexterity while operating with tireless consistency, it is ideal for precision electronics assembly.",
        advancedTech: [
            "Haptic Feedback Joint Integration",
            "Collaborative Path Planning AI",
            "Spatial Awareness Lidar Sensors",
            "Edge ML Visual Inspection Quality Control"
        ],
        keyFeatures: [
            "Sub-millimeter pickup precision",
            "Sterile cleanroom grade compatibility",
            "Safe operator proximity collision avoidance"
        ]
    },
    {
        id: 3,
        title: "Precision Sensor Calibration System",
        tag: "Calibration",
        category: "Smart Systems",
        image: glowingDartboard,
        description: "A high-frequency optical sensor testing rig designed to calibrate targeting coordinates. Using simulated high-speed physical targets, it aligns multi-spectral lens components to sub-micron accuracy.",
        advancedTech: [
            "High-Frequency Telemetry Tracking",
            "Sub-Micron Laser Distance Sensors",
            "Predictive Path Calibration Engines",
            "Target-Tracking AI Object Models"
        ],
        keyFeatures: [
            "Real-time laser drift adjustment",
            "Zero-tolerance spatial alignment",
            "Integrated telemetry logging loops"
        ]
    },
    {
        id: 4,
        title: "High-Volume Multi-Axis Factory Automation",
        tag: "Automation",
        category: "Automation",
        image: orangeRoboticArmsFactory,
        description: "Heavy-duty automated multi-axis robot arms executing complex welding, picking, and palletizing routines. Configured with a central controller, they operate continuously at maximum speed.",
        advancedTech: [
            "Kinematic Path Optimization Algorithms",
            "Edge Computing Joint Controllers",
            "Synchronized Multi-Agent Coordination System"
        ],
        keyFeatures: [
            "High payload capacity up to 500kg",
            "24/7 continuous assembly operation",
            "Predictive thermal wear and stress diagnostics"
        ]
    },
    {
        id: 5,
        title: "High-Speed Formula Vehicle Telematics",
        tag: "Vehicle Telematics",
        category: "Smart Systems",
        image: formulaRaceCar,
        description: "Telemetry capture and processing system designed for high-performance automotive testing. Streams active metrics from chassis sensors to track aerodynamic efficiency and vehicle stability at extreme speeds.",
        advancedTech: [
            "5G Vehicle-to-Everything (V2X) Transceivers",
            "Live Aerodynamic Sensor Arrays",
            "Predictive Traction and Chassis Slip Models"
        ],
        keyFeatures: [
            "Microsecond chassis strain readings",
            "Live telemetry streaming cockpit dashboard",
            "Real-time aerodynamic lift and drag logging"
        ]
    },
    {
        id: 6,
        title: "IoT-Connected Textile Factory Automation",
        tag: "Textile Automation",
        category: "Automation",
        image: textileAutomation,
        description: "Autonomous high-speed yarn spinning looms utilizing a matrix of IoT sensors. Monitors thread tension and fiber consistency in real-time, preventing snarls and breaks without human intervention.",
        advancedTech: [
            "Fiber Optic Stress Sensors",
            "IoT Throughput Synchronization Hubs",
            "Predictive Yarn Breakage Neural Networks"
        ],
        keyFeatures: [
            "Autonomous spindle hot-swapping",
            "Dynamic tension auto-correction",
            "Visual yarn consistency and weave check"
        ]
    },
    {
        id: 7,
        title: "Collaborative Robotics (Cobot) Systems",
        tag: "Collaborative Robotics",
        category: "AI & Robotics",
        image: roboticArm,
        description: "A collaborative robotic manipulator that works alongside human operators without physical safety fences. Sensitive force-feedback joints ensure immediate safety stops upon light contact.",
        advancedTech: [
            "Torque-Limited Safety Borders",
            "Haptic Sensing Skin Membrane",
            "Teach-By-Demonstration Path Learning"
        ],
        keyFeatures: [
            "Instant contact-halt logic",
            "Intuitive manual guidance calibration",
            "Multi-directional 7-joint articulation"
        ]
    },
    {
        id: 8,
        title: "Sterile Pharmaceutical Bottling Line",
        tag: "Medical & Chemical",
        category: "Automation",
        image: pharmaceuticalBottling,
        description: "An aseptic environment packaging line for high-speed liquid medicine filling. Uses specialized multi-spectral cameras to identify contaminants and verify capping integrity.",
        advancedTech: [
            "Multi-Spectral Inspection Cameras",
            "AI Contaminant Detection Models",
            "Robotic Torque Feedback Sensors"
        ],
        keyFeatures: [
            "Aseptic sterile boundary control",
            "300 bottles/minute filling rate",
            "Automated defective bottle ejector system"
        ]
    },
    {
        id: 9,
        title: "Evolutionary Biomimetic Pollinator Drones",
        tag: "Biomimetic Robotics",
        category: "AI & Robotics",
        image: biomimeticPollinator,
        description: "Micro-scale autonomous flying units designed for precise pollination and agricultural field scanning. Mimics organic flight patterns while using ultra-light optical sensors to target active blossoms.",
        advancedTech: [
            "Bio-Inspired Flight Dynamics Controller",
            "Sub-Gram Micro-Optics Assembly",
            "Neural Network Navigation AI"
        ],
        keyFeatures: [
            "Autonomous blossom visual targeting",
            "Wind gust micro-compensation",
            "Ultra-safe soft contact landing"
        ]
    },
    {
        id: 10,
        title: "Silicon Wafer Microelectronics Fabrication",
        tag: "Microelectronics",
        category: "Smart Systems",
        image: microelectronicsProcessor,
        description: "High-precision computer chip fabrication systems. Employs nanometer-scale laser etching and robotic wafer handlers within a completely dust-free, vibration-isolated cleanroom.",
        advancedTech: [
            "EUV Lithography Monitoring",
            "Nanometer-Level Robotic Manipulators",
            "Vibration Damping Isolation Stages"
        ],
        keyFeatures: [
            "Dust-free nitrogen-purged handling",
            "Microscopic automated defect classification",
            "Thermal gradient stabilization control"
        ]
    },
    {
        id: 11,
        title: "Dynamic Flow UX Telemetry Visualization",
        tag: "Telemetry & Visualization",
        category: "Smart Systems",
        image: uxFlowTelemetry,
        description: "An abstract visual representation of complex user interaction flows. Streams layout performance, click telemetry, and navigational path efficiency into interactive, visual pipelines.",
        advancedTech: [
            "Live User Click Telemetry",
            "Generative Web Flow Engines",
            "Predictive Bottleneck Analytics"
        ],
        keyFeatures: [
            "Adaptive layout adjustment based on telemetry",
            "Dynamic conversion bottleneck highlights",
            "Visual interaction heatmapping"
        ]
    }
];

const breakthroughData = [
    {
        id: "b1",
        year: "2026",
        title: "Generative Physical AI (Motion Transformers)",
        overview: "End-to-end neural motion models that generate physical action trajectories directly from visual-language commands, bypassing traditional inverse kinematics.",
        status: "Production Deployment",
        impact: "99.4% task adaptation success",
        features: [
            "Zero-shot execution of natural language instructions (e.g., 'sort the defective cylinders')",
            "Dynamic real-time collision evasion in multi-agent workspaces",
            "Automatic tool-usage adaptation without manual reprogramming",
            "Generative trajectory smoothing for reduced wear on motor actuators"
        ]
    },
    {
        id: "b2",
        year: "2026",
        title: "Liquid-State Biomimetic Actuation",
        overview: "Smart-material soft actuators replacing traditional gears and copper coils with magnetorheological fluid matrices, mimicking organic muscle fibers.",
        status: "Field Validation",
        impact: "300% increase in impact resilience",
        features: [
            "Passive shock absorption and high impact dissipation under heavy loads",
            "Organic, noiseless joint movements (silent operations under 10dB)",
            "Self-healing fluid matrices that seal minor micro-fissures automatically",
            "Extremely high power-to-weight ratio compared to brushed/brushless motors"
        ]
    },
    {
        id: "b3",
        year: "2025",
        title: "Neuromorphic Edge Vision Engines",
        overview: "Spiking neural processors combined with event-based silicon sensors, processing only optical changes rather than full video frames.",
        status: "Production Deployment",
        impact: "95% reduction in edge power consumption",
        features: [
            "Sub-millisecond latency reaction speed to sudden mechanical disturbances",
            "Full operational integrity in extreme high-contrast or low-light zones",
            "Continuous local learning at the edge without requiring server cloud connections",
            "Operates at micro-watt idle draws (average total load under 3.5 Watts)"
        ]
    },
    {
        id: "b4",
        year: "2025",
        title: "Haptic Sensing Skin Matrices",
        overview: "Flexible, stretchable sensor membranes covering robot end-effectors, providing high-density tactile telemetry feedback.",
        status: "Beta Trial",
        impact: "Micrometric slip control within 2ms",
        features: [
            "Ultra-sensitive pressure grid detection down to 0.08 grams",
            "Real-time surface texture friction analysis and grip stabilization",
            "Integrated thermoreception grid for sorting high-temperature components",
            "Multi-directional shear force detection to prevent fragile object damage"
        ]
    },
    {
        id: "b5",
        year: "2025",
        title: "Decentralized Swarm Mesh Networks",
        overview: "Dynamic peer-to-peer communication protocols allowing collaborative robot swarms to coordinate task divisions dynamically.",
        status: "Production Deployment",
        impact: "Zero-latency mesh node failover",
        features: [
            "Self-healing mesh topology (if a node fails, the rest re-route immediately)",
            "Collaborative load sharing calculation without any centralized controller",
            "Dynamic spatial partitioning to prevent collision in congested zones",
            "Autonomous cooperative task allocation based on nearest-node proximity"
        ]
    }
];

const upcomingTechData = [
    {
        id: "u1",
        year: "2027+ Horizon",
        title: "Quantum Kinematic Computing",
        overview: "Deploying board-level micro-quantum processors directly on robotic hubs, allowing calculations of millions of potential trajectories simultaneously for ultra-congested spaces.",
        impact: "Zero-latency multi-joint trajectory solving",
        horizon: "R&D Prototype Phase",
        features: [
            "Calculate infinite joint angle adjustments in complex dynamic environment corridors",
            "On-board Quantum-safe telemetry encryption shielding against intercept attempts",
            "Self-correcting sensor-drift calculations utilizing quantum superposition states"
        ]
    },
    {
        id: "u2",
        year: "2027+ Horizon",
        title: "Organic Bio-Hybrid Actuators",
        overview: "Replacing mechanical servos and fluid joints with lab-grown bio-synthetic muscle tissues stimulated by micro-electrical pulses.",
        impact: "100% biodegradable carbon footprint",
        horizon: "Lab Testing Phase",
        features: [
            "Passive biological self-repairing tissue loops that regenerate with nutrient feeds",
            "Unparalleled operational efficiency using low caloric organic inputs",
            "Natural flex characteristics that outperform shape memory alloys"
        ]
    },
    {
        id: "u3",
        year: "2028 Horizon",
        title: "Molecular Nanobot Swarms",
        overview: "Microscopic autonomous repair units engineered to bond molecular structures together, fixing micro-fissures in real time.",
        impact: "Instant in-situ structural rebuilding",
        horizon: "Pre-clinical Validation Phase",
        features: [
            "Autonomous molecular grid alignment to seal microscopic pipeline leaks",
            "Self-replication shutoff protocols to prevent runaway material assembly",
            "Localized magnetic guide arrays allowing target-specific concentration"
        ]
    },
    {
        id: "u4",
        year: "2027+ Horizon",
        title: "Cognitive Empathy & Co-Reasoning AI",
        overview: "Multi-modal behavior engines that analyze worker tone, gesture speed, and pulse to gauge stress and adapt cooperation speeds.",
        impact: "Dynamic safety buffer auto-scaling",
        horizon: "Active Pilot Stage",
        features: [
            "Worker fatigue prediction that actively shifts heavy payload lifting to the machine",
            "Multi-modal gestural dialog loops allowing point-and-talk workspace guidance",
            "Adaptive speed scaling that drops velocity smoothly when worker attention shifts"
        ]
    },
    {
        id: "u5",
        year: "2028 Horizon",
        title: "Kinetic-Harvesting Graphene Membranes",
        overview: "Power-generating skin arrays made from single-atom graphene layers, capturing energy from the robot's own movements.",
        impact: "Continuous self-charging feedback",
        horizon: "Prototype Stage",
        features: [
            "Captures motion, ambient heat, and factory lighting to extend standby time by 40%",
            "Ultra-thin profile that adds zero weight to robotic limb articulators",
            "Integrated thermal insulation protecting internal sensitive microchips"
        ]
    }
];

const Illustrations = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeModal, setActiveModal] = useState(null);
    const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
    const [selectedTypeLabel, setSelectedTypeLabel] = useState('Illustrations');

    // Reveal on scroll trigger
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
    }, [searchQuery, selectedCategory]);

    const categories = ['All', 'Automation', 'AI & Robotics', 'Smart Systems'];

    const filteredIllustrations = illustrationData.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.tag.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSelectType = (label) => {
        setSelectedTypeLabel(label);
        setSearchDropdownOpen(false);
    };

    return (
        <div className="illustrations-page animate-fade-in" style={{ background: '#051515', color: '#fff', minHeight: '100vh', paddingBottom: '8rem' }}>
            
            {/* Page Header Hero */}
            <section style={{ 
                height: '40vh', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                textAlign: 'center', 
                background: 'radial-gradient(circle at center, rgba(255, 222, 89, 0.05) 0%, transparent 70%)',
                padding: '0 2rem'
            }}>
                <span className="subtitle" style={{ letterSpacing: '8px', color: 'var(--accent-color)', marginBottom: '1.5rem', fontWeight: 600 }}>PORTFOLIO SHOWCASE</span>
                <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, marginBottom: '1rem' }}>Advanced Technologies</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Exploring industrial automation, artificial intelligence, microelectronics, and cyber-physical engineering.
                </p>
            </section>

            {/* Mock Search Bar Section - Matches the screenshot's Dreamstime design */}
            <section style={{ maxWidth: '1200px', margin: '0 auto 4rem auto', padding: '0 2rem' }}>
                <div className="search-container-wrapper" style={{
                    display: 'flex',
                    background: '#fff',
                    borderRadius: '4px',
                    overflow: 'visible',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    position: 'relative'
                }}>
                    {/* Eyeball icon decorative */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 1.5rem',
                        borderRight: '1px solid #e0e0e0',
                        color: '#555'
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </div>

                    {/* Search Field */}
                    <input 
                        type="text" 
                        placeholder="Find your perfect illustration..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flexGrow: 1,
                            border: 'none',
                            padding: '1.2rem 1.5rem',
                            fontSize: '1rem',
                            color: '#333',
                            outline: 'none',
                            background: '#fff'
                        }}
                    />

                    {/* Filter Dropdown */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <button 
                            type="button"
                            onClick={() => setSearchDropdownOpen(!searchDropdownOpen)}
                            style={{
                                border: 'none',
                                background: '#fff',
                                color: '#333',
                                padding: '0 2rem',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                borderLeft: '1px solid #e0e0e0',
                                fontWeight: 500
                            }}
                        >
                            <span>{selectedTypeLabel}</span>
                            <svg style={{ transform: searchDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} width="12" height="8" viewBox="0 0 10 6"><path fill="#333" d="m8.69 0 1.306 1.243-3.694 3.514L4.996 6 3.69 4.757-.004 1.243 1.302 0l3.694 3.514L8.69 0Z"></path></svg>
                        </button>

                        {searchDropdownOpen && (
                            <ul style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                background: '#fff',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                                borderRadius: '0 0 4px 4px',
                                listStyle: 'none',
                                padding: '0.5rem 0',
                                margin: 0,
                                zIndex: 100,
                                minWidth: '180px',
                                border: '1px solid #e0e0e0'
                            }}>
                                {['Illustrations', 'AI & Robotics', 'Automation', 'Smart Systems'].map(label => (
                                    <li key={label}>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                handleSelectType(label);
                                                setSelectedCategory(label === 'Illustrations' ? 'All' : label);
                                            }}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                border: 'none',
                                                background: 'transparent',
                                                padding: '0.8rem 1.5rem',
                                                color: '#333',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                        >
                                            {label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Pink Search Button */}
                    <button 
                        type="button"
                        style={{
                            background: '#e10b7b',
                            border: 'none',
                            color: '#fff',
                            padding: '0 2.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#b90864'}
                        onMouseLeave={(e) => e.target.style.background = '#e10b7b'}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </button>
                </div>

                {/* Subtitle / Artist Portfolio Section */}
                <div style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Technology Illustration Library</h2>
                    <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: 600 }}>{filteredIllustrations.length} Illustrations Found</span>
                </div>
            </section>

            {/* Illustration Grid */}
            <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                {filteredIllustrations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
                        <h3>No illustrations match your query.</h3>
                        <p style={{ marginTop: '1rem' }}>Please try searching for another term or selecting a different category.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '2.5rem'
                    }}>
                        {filteredIllustrations.map(item => (
                            <article 
                                key={item.id}
                                className="glass reveal-on-scroll"
                                onClick={() => setActiveModal(item)}
                                style={{
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255, 222, 89, 0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.01)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 222, 89, 0.3)';
                                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(255, 222, 89, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.borderColor = 'rgba(255, 222, 89, 0.1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                                    <img 
                                        src={item.image} 
                                        alt={item.title} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.08)'}
                                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        left: '12px',
                                        background: 'rgba(5, 21, 21, 0.85)',
                                        border: '1px solid rgba(255, 222, 89, 0.3)',
                                        borderRadius: '50px',
                                        padding: '0.3rem 0.9rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        color: 'var(--accent-color)',
                                        letterSpacing: '1px'
                                    }}>
                                        {item.tag.toUpperCase()}
                                    </div>
                                </div>

                                <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                    <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1rem', fontWeight: 700, lineHeight: '1.4' }}>{item.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.8rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flexGrow: 1 }}>
                                        {item.description}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 600 }}>{item.category}</span>
                                        <span style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            Explore Tech Specs &rarr;
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* 2025-2026 Breakthroughs Timeline Section */}
            <section style={{ maxWidth: '1200px', margin: '8rem auto 0 auto', padding: '0 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }} className="reveal-on-scroll">
                    <span className="subtitle" style={{ letterSpacing: '6px', color: 'var(--accent-color)' }}>RECENT ADVANCEMENTS</span>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '1rem' }}>2025 - 2026 Robotics Breakthroughs</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '650px', margin: '1rem auto 0 auto' }}>
                        Exploring the next-generation cognitive, tactile, and kinematic technologies deployed across our robotic fleet over the past two years.
                    </p>
                </div>

                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {/* Vertically staggered timeline blocks */}
                    {breakthroughData.map((b, idx) => (
                        <div 
                            key={b.id}
                            className="glass reveal-on-scroll"
                            style={{
                                padding: '3rem',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 222, 89, 0.1)',
                                background: 'rgba(255,255,255,0.01)',
                                transition: 'all 0.4s ease',
                                position: 'relative',
                                display: 'grid',
                                gridTemplateColumns: '1fr',
                                mdGridTemplateColumns: '250px 1fr',
                                gap: '2rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 222, 89, 0.3)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                e.currentTarget.style.boxShadow = '0 10px 35px rgba(255,222,89,0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 222, 89, 0.1)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Year & Metric Panel */}
                            <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', paddingRight: '1.5rem' }}>
                                <span style={{ 
                                    background: 'var(--accent-color)', 
                                    color: '#000', 
                                    padding: '0.4rem 1.2rem', 
                                    borderRadius: '50px', 
                                    fontSize: '0.9rem', 
                                    fontWeight: 900 
                                }}>
                                    {b.year}
                                </span>
                                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>Real-World Impact</h4>
                                <p style={{ color: 'var(--accent-color)', fontSize: '1.2rem', fontWeight: 800 }}>{b.impact}</p>
                                <span style={{ display: 'inline-block', marginTop: '1rem', padding: '0.3rem 0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                                    {b.status}
                                </span>
                            </div>

                            {/* Details Panel */}
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>{b.title}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '2rem' }}>
                                    {b.overview}
                                </p>
                                <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1rem' }}>Key Implemented Features</h4>
                                <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', padding: 0, listStyle: 'none' }}>
                                    {b.features.map((feat, fidx) => (
                                        <li key={fidx} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                                            <span style={{ color: 'var(--accent-color)', fontSize: '1rem' }}>✓</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.4' }}>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2027+ Upcoming Technologies & Future Horizon Section */}
            <section style={{ maxWidth: '1200px', margin: '8rem auto 0 auto', padding: '0 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }} className="reveal-on-scroll">
                    <span className="subtitle" style={{ letterSpacing: '6px', color: 'var(--accent-color)' }}>FUTURE HORIZON</span>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '1rem' }}>Upcoming Robots & Technologies (2027+)</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '650px', margin: '1rem auto 0 auto' }}>
                        A sneak peek into the quantum, organic, and molecular technologies currently undergoing development in our R&D laboratories.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem' }}>
                    {upcomingTechData.map((item, idx) => (
                        <div 
                            key={item.id}
                            className="glass reveal-on-scroll"
                            style={{
                                padding: '3.5rem 2.5rem',
                                borderRadius: '20px',
                                border: '1px solid rgba(255, 222, 89, 0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s ease',
                                background: 'linear-gradient(135deg, rgba(255,222,89,0.01) 0%, rgba(255,255,255,0.01) 100%)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 222, 89, 0.25)';
                                e.currentTarget.style.boxShadow = '0 15px 35px rgba(255, 222, 89, 0.08)';
                                e.currentTarget.style.transform = 'translateY(-5px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 222, 89, 0.05)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform = 'none';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <span style={{ 
                                    border: '1px solid var(--accent-color)', 
                                    color: 'var(--accent-color)', 
                                    padding: '0.4rem 1.2rem', 
                                    borderRadius: '50px', 
                                    fontSize: '0.8rem', 
                                    fontWeight: 800,
                                    letterSpacing: '1px'
                                }}>
                                    {item.year}
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 700 }}>
                                    {item.horizon}
                                </span>
                            </div>

                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '2rem', flexGrow: 1 }}>
                                {item.overview}
                            </p>

                            <div style={{ background: 'rgba(255,222,89,0.02)', border: '1px solid rgba(255,222,89,0.08)', borderRadius: '10px', padding: '1.2rem', marginBottom: '2.5rem' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>target output metric</span>
                                <span style={{ fontSize: '1.1rem', color: 'var(--accent-color)', fontWeight: 800 }}>{item.impact}</span>
                            </div>

                            <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.2rem' }}>projected features</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {item.features.map((feat, fidx) => (
                                    <li key={fidx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                                        <span style={{ color: 'var(--accent-color)', fontSize: '1.2rem', lineHeight: '1' }}>&#9670;</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* Interactive Glassmorphic Modal Detail Overlay */}
            {activeModal && (
                <div 
                    onClick={() => setActiveModal(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(5, 21, 21, 0.85)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '2rem'
                    }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#0a2323',
                            border: '1px solid rgba(255, 222, 89, 0.2)',
                            borderRadius: '24px',
                            maxWidth: '900px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                                <span style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>{activeModal.tag}</span>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.5rem' }}>{activeModal.title}</h2>
                            </div>
                            <button 
                                onClick={() => setActiveModal(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.03)'}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '1fr', mdGridTemplateColumns: '1.2fr 1fr', gap: '3rem' }} className="modal-grid">
                            
                            {/* Image & Overview */}
                            <div>
                                <div style={{ height: '300px', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <img src={activeModal.image} alt={activeModal.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.8rem', fontSize: '1rem', fontWeight: 800, letterSpacing: '1px' }}>SYSTEM OVERVIEW</h4>
                                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', lineHeight: '1.8' }}>
                                    {activeModal.description}
                                </p>
                            </div>

                            {/* Tech Specs & Features */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                {/* Advanced Tech */}
                                <div>
                                    <h4 style={{ color: 'var(--accent-color)', marginBottom: '1.2rem', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '1px', borderBottom: '1px solid rgba(255,222,89,0.1)', paddingBottom: '0.5rem' }}>ADVANCED TECHNOLOGIES</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {activeModal.advancedTech.map((tech, idx) => (
                                            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,222,89,0.03)', border: '1px solid rgba(255,222,89,0.1)', borderRadius: '8px', padding: '0.8rem 1.2rem' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.5"><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{tech}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Key Features */}
                                <div>
                                    <h4 style={{ color: 'var(--accent-color)', marginBottom: '1.2rem', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '1px', borderBottom: '1px solid rgba(255,222,89,0.1)', paddingBottom: '0.5rem' }}>KEY CAPABILITIES</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        {activeModal.keyFeatures.map((feat, idx) => (
                                            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                                                <span style={{ color: 'var(--accent-color)', fontSize: '1.2rem', lineHeight: '1' }}>&#9670;</span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '2rem 2.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
                            <button 
                                onClick={() => setActiveModal(null)}
                                style={{
                                    background: 'var(--accent-color)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0.8rem 2.5rem',
                                    fontSize: '0.95rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    transition: 'opacity 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                                onMouseLeave={(e) => e.target.style.opacity = '1'}
                            >
                                Close Overview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Illustrations;
