import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ServiceCard = ({ number, title, description, icon, onClick }) => {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const angleX = (yc - y) / 12; // tilt angle limit
        const angleY = (x - xc) / 12;
        card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.boxShadow = `${(xc - x) / 10}px ${(yc - y) / 10}px 30px rgba(0, 0, 0, 0.5)`;
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (!card) return;
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        card.style.boxShadow = 'none';
    };

    return (
        <div 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className="service-card glass tilt-card reveal-on-scroll" 
            style={{ 
                padding: '3.5rem 2.5rem', 
                borderRadius: '20px', 
                transition: 'transform 0.15s ease-out, border-color 0.3s ease, box-shadow 0.3s ease', 
                position: 'relative', 
                overflow: 'hidden', 
                height: '100%', 
                border: '1px solid rgba(255, 222, 89, 0.05)',
                cursor: 'pointer'
            }}
        >
            <span className="step-num" style={{ fontSize: '4rem', fontWeight: 900, opacity: 0.05, position: 'absolute', top: '10px', right: '20px', color: 'var(--accent-color)' }}>{number}</span>
            <div style={{ color: 'var(--accent-color)', marginBottom: '2rem' }} className="tilt-inner">
                {icon}
            </div>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '1.2rem', color: '#fff', fontWeight: 700 }} className="tilt-inner">{title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.8' }} className="tilt-inner">{description}</p>
            <div style={{ marginTop: '2rem', color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '0.9rem' }}>Read Details &rarr;</div>
        </div>
    );
};

const Services = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [selectedService, setSelectedService] = useState(null);
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
    }, [activeTab, roboticsData]);

    const serviceList = [
        {
            number: "01",
            category: "Industrial",
            title: "Industrial Automation Robots",
            description: "Efficient systems for large-scale industrial needs and automated assembly lines.",
            details: "Deploying high-speed robotic articulators and cartesian setups configured to perform heavy welding, casting, and conveyor sorting. Includes PLC optimization architectures.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"></path></svg>
        },
        {
            number: "02",
            category: "Industrial",
            title: "Collaborative Robots (Cobots)",
            description: "Flexible robots designed for safe collaboration with human workers.",
            details: "Safe, torque-limited limbs that operate in the same physical space as warehouse staff. Equipped with force-feedback sensors that halt operations upon featherlight physical contact.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        },
        {
            number: "03",
            category: "Smart Systems",
            title: "Robotic Process Automation",
            description: "Optimizing repetitive workflows through intelligent software robotics.",
            details: "Software automation streams that manage inventory feeds, update status trackers, and route logistical instructions based on live triggers.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
        },
        {
            number: "04",
            category: "Logistics & Support",
            title: "Expert Consultation",
            description: "Strategic planning and analysis for seamless robotics integration.",
            details: "Comprehensive ROI models, spatial blueprints, and hardware compatibility mappings custom-tailored to minimize deployment latency.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.6 8.38 8.38 0 0 1 3.3.9"></path><polyline points="16 4.9 22 9 10 9"></polyline></svg>
        },
        {
            number: "05",
            category: "Industrial",
            title: "Custom Robotic Systems",
            description: "Tailored robotic solutions engineered for specific industry challenges.",
            details: "From customized end-of-arm-tooling (EOAT) to custom grip geometry, we fabricate custom end-effectors to fit delicate, extreme, or oddly shaped payloads.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
        },
        {
            number: "06",
            category: "Logistics & Support",
            title: "Support and Maintenance",
            description: "Ensuring long-term reliability with continuous monitoring and technical support.",
            details: "Scheduled diagnostic operations, parts swapping programs, and OTA calibration patches keeping equipment uptime capped above 99.8%.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l-4.7 4.7a1 1 0 0 0 0 1.4l1.1 1.1a1 1 0 0 0 1.4 0l4.7-4.7a1 1 0 0 0 1.4 0l1.1-1.1a1 1 0 0 0 0-1.4l-5-5a1 1 0 0 0-1.4 0l-1.1 1.1a1 1 0 0 0 0 1.4l1.1 1.1z"></path></svg>
        },
        {
            number: "07",
            category: "Smart Systems",
            title: "AI-Powered Vision Systems",
            description: "Advanced computer vision enabling robots to detect, identify, and inspect objects.",
            details: "Multi-layered neural networks matching objects on fast-moving conveyors against quality specifications at 200 items per minute with micrometric tolerance.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        },
        {
            number: "08",
            category: "Logistics & Support",
            title: "Autonomous Mobile Robots (AMR)",
            description: "Self-navigating robots designed for warehouse logistics and material transport.",
            details: "Intelligent navigation units utilizing LiDAR and slam structures to transport massive pallet loads across dynamic, busy warehouse floors without manual guidance.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
        },
        {
            number: "09",
            category: "Logistics & Support",
            title: "Drone Robotics Solutions",
            description: "Autonomous drone systems for inspection, surveillance, and agricultural monitoring.",
            details: "High-flying thermal systems conducting structural integrity assessments on pipelines, power pylons, and sweeping crop fields for hydration analysis.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"></path><path d="M2 10v6l10 5 10-5v-6"></path></svg>
        },
        {
            number: "10",
            category: "Logistics & Support",
            title: "Smart Factory Integration",
            description: "Connecting robotics, IoT sensors, and AI to build Industry 4.0 manufacturing environments.",
            details: "Total platform networking that bridges factory machinery, telemetry sensors, and database ledgers into a singular web-dashboard readout.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>
        },
        {
            number: "11",
            category: "Smart Systems",
            title: "Predictive Maintenance Systems",
            description: "AI-driven monitoring tools that predict machine failures before they occur.",
            details: "Vibration and acoustic analytics telemetry analyzing motor hubs, signaling impending mechanical fatigue weeks before a structural fault triggers.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
        },
        {
            number: "12",
            category: "Smart Systems",
            title: "Machine Learning Robotics",
            description: "Robots that learn from data and improve performance over time.",
            details: "Dynamic calibration models that tweak robotic articulation tolerances and grip configurations automatically based on historical payload slippage data.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        },
        {
            number: "13",
            category: "Smart Systems",
            title: "Humanoid Robotics Development",
            description: "Development of human-like robots for research, service industries, and interaction.",
            details: "Locomotion balancing stacks and bipedal dynamics coupled with high-fidelity conversational AI models meant for customer guidance roles.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path></svg>
        },
        {
            number: "14",
            category: "Smart Systems",
            title: "Robotics Simulation & Digital Twin",
            description: "Virtual replicas of robotic systems to simulate production processes.",
            details: "Fully physics-enabled digital models that mock up conveyor rates and mechanical arm pathways, mapping bottleneck areas before layout construction.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 10 10v1a10 10 0 0 1-10 10"></path></svg>
        },
        {
            number: "15",
            category: "Smart Systems",
            title: "Automated Quality Inspection",
            description: "Robotic inspection systems using AI cameras to detect defects in manufacturing.",
            details: "Structured-light sensors and 3D profilometers checking precision dimensions against assembly blueprints to filter manufacturing drift instantly.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        },
        {
            number: "16",
            category: "Logistics & Support",
            title: "Warehouse Automation Systems",
            description: "Robotic solutions for automated picking, sorting, packaging, and inventory management.",
            details: "ASRS automated racking linkages and high-speed robotic cross-dock setups that minimize items handling turnaround to absolute minimums.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        },
        {
            number: "17",
            category: "Industrial",
            title: "Robotic Palletizing Systems",
            description: "High-capacity robotic stackers for heavy boxes, drums, and bags packaging.",
            details: "Specialized heavy-payload articulators equipped with customized vacuum gripper modules that stack varying carton patterns safely onto pallets at high speeds.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></svg>
        },
        {
            number: "18",
            category: "Industrial",
            title: "CNC Machine Tending Robots",
            description: "Automated machine loading and raw billet feeding for continuous machining.",
            details: "Dual-gripper robotic arms integrated directly with CNC door controls and chuck configurations to load raw castings and extract polished products automatically.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
        },
        {
            number: "19",
            category: "Industrial",
            title: "Robotic Laser Cutting & Slicing",
            description: "Multi-axis robotic cutting cells equipped with high-intensity laser systems.",
            details: "Precision 6-axis welding or cutting units fitted with high-efficiency fiber optic laser nozzles, capable of cutting complex profiles in heavy-gauge stainless steel.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 19.07l2.12-2.12M16.24 7.76l2.12-2.12"></path></svg>
        },
        {
            number: "20",
            category: "Industrial",
            title: "Robotic Painting & Coating Cells",
            description: "Explosion-proof automotive coating systems for uniform thickness finishes.",
            details: "High-accuracy painting arms with clean-room isolation boots and precise paint flow control loops that apply mirror-finish paints on car panels and machinery.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path><path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"></path></svg>
        },
        {
            number: "21",
            category: "Smart Systems",
            title: "Delta Pick-and-Place Systems",
            description: "Spider-like high-speed robotic units for packaging and sorting.",
            details: "Ultra-lightweight linkage arrays running pick-and-place frequencies up to 150 cycles per minute, optimized for fast handling of pills, chips, and components.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 22h20L12 2z"></path><circle cx="12" cy="13" r="3"></circle></svg>
        },
        {
            number: "22",
            category: "Industrial",
            title: "Metallurgical Foundry Robots",
            description: "Extreme-heat casting, forging, and heavy molten pour handling automation.",
            details: "Heavy-duty thermal-resistant manipulators configured to carry white-hot castings out of furnace gates and accurately pour molten metals into molds.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-4 4-6 7.5-6 10a6 6 0 0 0 12 0c0-2.5-2-6-6-10z"></path></svg>
        },
        {
            number: "23",
            category: "Logistics & Support",
            title: "Autonomous Forklift Fleets",
            description: "Self-navigating heavy pallet movers and forklift systems for shipping docks.",
            details: "Industrial tuggers and pallet lifters driving via advanced LiDAR SLAM guidance to transport 2-ton cargos safely through narrow warehousing pathways.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 17v-8l6 4-6 4z"></path></svg>
        },
        {
            number: "24",
            category: "Industrial",
            title: "Robotic De-burring & Polishing",
            description: "Surface cleaning, finishing, and grinding with active force feedback controls.",
            details: "Force-controlled abrasive arms analyzing tactile feedback to smoothly remove excess welding seams and metal burrs from machined castings.",
            icon: <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
        }
    ];

    const filteredServices = activeTab === 'All' 
        ? serviceList 
        : serviceList.filter(s => s.category === activeTab);

    return (
        <div className="services-page animate-fade-in" style={{ background: 'var(--primary-bg)' }}>
            
            {/* Hero */}
            <section className="blog-hero" style={{ height: '55vh', background: 'linear-gradient(rgba(5, 21, 21, 0.7), rgba(5, 21, 21, 0.95)), url("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000")' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                    <span className="subtitle" style={{ letterSpacing: '8px', textTransform: 'uppercase', color: 'var(--accent-color)', fontWeight: 600 }}>CUTTING-EDGE SOLUTIONS</span>
                    <h1 style={{ fontSize: '4.5rem', fontWeight: 900, marginTop: '1.5rem', color: '#fff' }}>
                        Explore Our <span style={{ color: 'var(--accent-color)' }}>Advanced</span> <br /> Robotic Offerings
                    </h1>
                </div>
            </section>

            {/* Filter Tabs */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                margin: '6rem auto 0 auto',
                flexWrap: 'wrap',
                maxWidth: '1200px',
                padding: '0 2rem'
            }}>
                {['All', 'Industrial', 'Smart Systems', 'Logistics & Support'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: activeTab === tab ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.03)',
                            color: activeTab === tab ? '#000' : '#fff',
                            border: '1px solid rgba(255, 222, 89, 0.2)',
                            padding: '0.8rem 2rem',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Service Grid Section */}
            <section style={{ padding: '6rem 5%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '3rem', maxWidth: '1600px', margin: '0 auto' }}>
                    {filteredServices.map((service, index) => (
                        <ServiceCard 
                            key={service.number} 
                            {...service} 
                            onClick={() => setSelectedService(service)}
                        />
                    ))}
                </div>
            </section>

            {/* Service Detail Modal */}
            {selectedService && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(5, 21, 21, 0.95)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 99999,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '2rem'
                    }}
                    onClick={() => setSelectedService(null)}
                >
                    <div 
                        style={{
                            background: 'var(--secondary-bg)',
                            border: '1px solid var(--accent-color)',
                            borderRadius: '24px',
                            maxWidth: '650px',
                            width: '100%',
                            padding: '4rem',
                            position: 'relative',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                            animation: 'pageEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setSelectedService(null)}
                            style={{
                                position: 'absolute',
                                top: '2rem',
                                right: '2rem',
                                background: 'none',
                                border: 'none',
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: '2rem',
                                cursor: 'pointer',
                                transition: 'color 0.3s'
                            }}
                        >
                            &times;
                        </button>
                        
                        <div style={{ color: 'var(--accent-color)', marginBottom: '2rem' }}>
                            {selectedService.icon}
                        </div>
                        
                        <span style={{
                            color: 'var(--accent-color)',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            display: 'block',
                            marginBottom: '1rem'
                        }}>
                            {selectedService.category} Solutions · {selectedService.number}
                        </span>
                        
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', lineHeight: '1.2' }}>
                            {selectedService.title}
                        </h2>
                        
                        <p style={{ fontSize: '1.2rem', color: '#fff', lineHeight: '1.7', marginBottom: '2rem', fontWeight: 600 }}>
                            {selectedService.description}
                        </p>
                        
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '3rem' }}>
                            {selectedService.details}
                        </p>

                        <a 
                            href="/contact"
                            style={{
                                display: 'inline-block',
                                background: 'var(--accent-color)',
                                color: '#000',
                                padding: '1rem 3rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                boxShadow: '0 10px 30px rgba(255, 222, 89, 0.2)',
                                transition: 'all 0.3s'
                            }}
                        >
                            Discuss Integration
                        </a>
                    </div>
                </div>
            )}

            {/* Featured Section - Digital Twin */}
            <section className="featured-service glass reveal-on-scroll" style={{ maxWidth: '1400px', margin: '0 auto 10rem auto', padding: '6rem', borderRadius: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '6rem', alignItems: 'center', border: '1px solid rgba(255, 222, 89, 0.1)' }}>
                <div>
                    <span className="subtitle" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>STRATEGIC DEPTH</span>
                    <h2 style={{ fontSize: '3.5rem', margin: '1.5rem 0 2.5rem 0', fontWeight: 800, color: '#fff' }}>The Digital Twin <br /><span style={{ color: 'var(--accent-color)' }}>Advantage</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', marginBottom: '2.5rem', lineHeight: '1.9' }}>
                        Before a single bolt is tightened, we build a perfect virtual replica of your production line. 
                        Simulate thousands of scenarios to find the absolute maximum efficiency without risking real-world assets.
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {['Zero-Risk Simulation', 'Predictive Resource Mapping', 'Cycle-Time Neutralization'].map((item, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem', color: '#fff', fontSize: '1.1rem' }}>
                                <div style={{ width: '28px', height: '28px', border: '1px solid var(--accent-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <div style={{ width: '10px', height: '10px', background: 'var(--accent-color)', borderRadius: '50%' }}></div>
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255, 222, 89, 0.2)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
                    <img 
                        src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200" 
                        alt="Robotic Virtual Simulation" 
                        style={{ width: '100%', display: 'block' }} 
                    />
                </div>
            </section>

            {/* Real-World Industry Deployments Tracker */}
            <section style={{ maxWidth: '1400px', margin: '0 auto 10rem auto', padding: '0 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '6rem' }} className="reveal-on-scroll">
                    <span className="subtitle" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>CASE STUDIES</span>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', marginTop: '1.5rem' }}>Present Industry Workloads</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '700px', margin: '1.5rem auto 0 auto' }}>
                        See how Dj Group of Industry is actively driving output, safety, and efficiency across India's largest manufacturing plants.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
                    {[
                        {
                            location: "Chennai Automotive Hub",
                            workload: "Robotic Welding Cells",
                            description: "Deployed 24 high-speed multi-axis articulators synchronized with real-time computer vision scanners to align chassis plates.",
                            metric: "+38% Throughput",
                            industry: "Automotive"
                        },
                        {
                            location: "Mumbai Pharma Hub",
                            workload: "Aseptic Bottling Lines",
                            description: "Integrated sterile robotic arms and multi-spectral inspection arrays to automate liquid medication capping and bottle sorting.",
                            metric: "300 Bottles/Min",
                            industry: "Pharmaceutical"
                        },
                        {
                            location: "Coimbatore Textile Hub",
                            workload: "IoT Loom Tensioners",
                            description: "Retrofitted automated spinning reels with fiber-optic tension feedback loops to adjust spindle rotation in micro-seconds.",
                            metric: "0% Yarn Breakage",
                            industry: "Textiles"
                        },
                        {
                            location: "Bengaluru Logistics Hub",
                            workload: "AMR Warehouse Fleet",
                            description: "Deployed 45 Autonomous Mobile Robots coordinated via mesh network protocols to transport massive inventory payloads.",
                            metric: "90s Pick Time",
                            industry: "E-Commerce"
                        }
                    ].map((caseStudy, idx) => (
                        <div 
                            key={idx}
                            className="glass reveal-on-scroll"
                            style={{
                                padding: '3.5rem 2.5rem',
                                borderRadius: '20px',
                                border: '1px solid rgba(255, 222, 89, 0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 222, 89, 0.25)';
                                e.currentTarget.style.transform = 'translateY(-5px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 222, 89, 0.05)';
                                e.currentTarget.style.transform = 'none';
                            }}
                        >
                            <span style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.2rem', display: 'block' }}>
                                {caseStudy.industry} · {caseStudy.location}
                            </span>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '1.2rem' }}>{caseStudy.workload}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '2.5rem', flexGrow: 1 }}>{caseStudy.description}</p>
                            
                            <div style={{ background: 'rgba(255,222,89,0.02)', border: '1px solid rgba(255,222,89,0.08)', borderRadius: '8px', padding: '1rem 1.5rem' }}>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>verified deployment result</span>
                                <span style={{ fontSize: '1.3rem', color: 'var(--accent-color)', fontWeight: 800 }}>{caseStudy.metric}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Dynamic Robotics Catalog Section */}
            <section style={{ padding: '6rem 5%', maxWidth: '1400px', margin: '0 auto 4rem auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }} className="reveal-on-scroll">
                    <span className="subtitle" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>ROBOTICS CATALOG</span>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', marginTop: '1.5rem' }}>Dynamic Fleet Specifications</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '700px', margin: '1.5rem auto 0 auto' }}>
                        Browse the exact details of the core robot types powering our automated factory networks, updated dynamically from the Neural Core backend.
                    </p>
                </div>

                {loadingRobotics ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <div style={{ color: 'var(--accent-color)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Loading Robotics Catalog...
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
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    background: 'rgba(5, 21, 21, 0.6)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.borderColor = 'var(--accent-color)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.borderColor = 'rgba(255, 222, 89, 0.1)';
                                }}
                            >
                                <div>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255, 222, 89, 0.2)',
                                        background: 'rgba(255, 222, 89, 0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '2rem'
                                    }}>
                                        {robot.icon === 'industrial' && (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                                                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                                            </svg>
                                        )}
                                        {robot.icon === 'humanoid' && (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="5" r="2"></circle>
                                                <path d="m12 7 2 12"></path>
                                                <path d="m12 7-2 12"></path>
                                            </svg>
                                        )}
                                        {robot.icon === 'medical' && (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                                            </svg>
                                        )}
                                        {robot.icon === 'agriculture' && (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 22V12"></path>
                                                <circle cx="12" cy="7" r="5"></circle>
                                            </svg>
                                        )}
                                        {robot.icon === 'drone' && (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="6"></circle>
                                                <line x1="12" y1="2" x2="12" y2="6"></line>
                                                <line x1="12" y1="18" x2="12" y2="22"></line>
                                            </svg>
                                        )}
                                        {robot.icon === 'underwater' && (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5"></path>
                                            </svg>
                                        )}
                                        {robot.icon === 'military' && (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                                                <path d="M12 2v9"></path>
                                            </svg>
                                        )}
                                        {robot.icon === 'service' && (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                            </svg>
                                        )}
                                        {robot.icon === 'educational' && (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                            </svg>
                                        )}
                                        {robot.icon === 'logistics' && (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                            </svg>
                                        )}
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.2rem', color: '#fff' }}>{robot.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '2rem' }}>
                                        {robot.description}
                                    </p>
                                </div>
                                <div style={{
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    paddingTop: '1.2rem',
                                    fontSize: '0.8rem',
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

            {/* Final CTA */}
            <section style={{ background: 'linear-gradient(to right, rgba(255, 222, 89, 0.02), rgba(255, 222, 89, 0.05))', maxWidth: '100%', padding: '12rem 2rem', textAlign: 'center', borderTop: '1px solid rgba(255, 222, 89, 0.1)' }}>
                <h2 style={{ fontSize: '4rem', marginBottom: '2rem', fontWeight: 900, color: '#fff' }}>Ready to <span style={{ color: 'var(--accent-color)' }}>Automate?</span></h2>
                <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', marginBottom: '4rem', maxWidth: '800px', margin: '0 auto 4rem auto' }}>Join the ranks of elite manufacturers transitioning to smart automation and AI-driven precision.</p>
                <a href="/contact" className="btn" style={{ padding: '1.8rem 5rem', fontSize: '1.2rem', borderRadius: '4px', background: 'var(--accent-color)', color: 'var(--primary-bg)', fontWeight: 800, textDecoration: 'none', transition: 'var(--transition)', display: 'inline-block' }}>Free Feasibility Study</a>
            </section>
        </div>
    );
};

export default Services;
