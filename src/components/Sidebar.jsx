import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo_circle.png';

const Sidebar = ({ isOpen, toggleSidebar, activeProject, setActiveProject }) => {
    const location = useLocation();
    const [industrialOpen, setIndustrialOpen] = useState(true);
    const [labOpen, setLabOpen] = useState(true);
    const [showLightbox, setShowLightbox] = useState(false);

    const industrialSubItems = [
        { path: '/industrial-ai/robotics-path-planner', label: 'Robotics Path Planner' },
        { path: '/industrial-ai/quality-inspection', label: 'Automated Quality Inspection' },
        { path: '/industrial-ai/amr-navigation', label: 'AMR Autonomous Navigation' },
        { path: '/industrial-ai/rpa', label: 'Robotic Process Automation (RPA)' },
        { path: '/industrial-ai/process-mining', label: 'Process Mining & AI Intelligence' },
        { path: '/industrial-ai/digital-twin', label: '3D Digital Twin Platform' },
        { path: '/industrial-ai/iiot', label: 'Industrial IoT & Edge AI' },
        { path: '/industrial-ai/computer-vision', label: 'Advanced AI Computer Vision' },
        { path: '/industrial-ai/copilot-agents', label: 'AI Copilot & Multi-Agent AI' }
    ];

    const projects = [
        { id: 'agro_r1', name: 'AGRO-R1 Farm Rover' },
        { id: 'warehouse_amr', name: 'Logistics AMR Fleet' },
        { id: 'cobot_arm', name: 'Kinematic Cobot Arm' }
    ];

    const menuItems = [
        { path: '/workspace', label: 'Dashboard', icon: '📊' },
        { path: '/ai-assistant', label: 'AI Robotics Assistant', icon: '🤖' },
        { path: '/ros2-hub', label: 'ROS 2 Knowledge Hub', icon: '📚' },
        { path: '/ros2-debugger', label: 'ROS 2 Error Debugger', icon: '🔧' },
        { path: '/nvidia-hub', label: 'NVIDIA Robotics Hub', icon: '🟢' },
        { path: '/nav2-assistant', label: 'Nav2 Assistant', icon: '🧭' },
        { path: '/slam-explorer', label: 'SLAM Explorer', icon: '🗺️' },
        { path: '/urdf-analyzer', label: 'URDF Analyzer', icon: '📐' },
        { path: '/robot-kb', label: 'Robot Knowledge Base', icon: '📁' },
        { path: '/robotics-companies', label: 'Global Robotics Companies', icon: '🌐' }
    ];

    const labSubItems = [
        { path: '/robot-lab/overview', label: 'Robot Overview' },
        { path: '/robot-lab/status', label: 'Live Status' },
        { path: '/robot-lab/mission', label: 'Mission Monitor' },
        { path: '/robot-lab/nodes', label: 'ROS 2 Nodes' },
        { path: '/robot-lab/topics', label: 'ROS 2 Topics' },
        { path: '/robot-lab/sensors', label: 'Sensor Monitoring' },
        { path: '/robot-lab/vision', label: 'AI Vision' },
        { path: '/robot-lab/timeline', label: 'Decision Timeline' },
        { path: '/robot-lab/approval', label: 'Human Approval' },
        { path: '/robot-lab/events', label: 'Robot Events' },
        { path: '/robot-lab/chat', label: 'Ask About Robot' }
    ];

    const bottomItems = [
        { path: '/projects-workspace', label: 'Projects Workspace', icon: '⚙️' },
        { path: '/trusted-sources', label: 'Trusted Sources', icon: '🗂️' },
        { path: '/settings', label: 'Settings', icon: '🛠️' }
    ];

    return (
        <aside className={`platform-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
            {/* Header / Brand */}
            <div className="sidebar-header">
                <Link to="/workspace" className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <img 
                        src={logoImg} 
                        alt="Dj Group Logo" 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowLightbox(true);
                        }}
                        title="Click to view full crest logo"
                        style={{ 
                            width: '36px', 
                            height: '36px', 
                            objectFit: 'contain',
                            cursor: 'zoom-in'
                        }} 
                    />
                    {isOpen && (
                        <span>
                            <span className="brand-accent">DJ</span>
                            <span className="brand-sub">Platform</span>
                        </span>
                    )}
                </Link>
                <button className="sidebar-toggle-inner" onClick={toggleSidebar}>
                    {isOpen ? '◀' : '▶'}
                </button>
            </div>

            {/* Project Selector */}
            {isOpen && (
                <div className="project-selector-container">
                    <label>ACTIVE WORKSPACE</label>
                    <select 
                        value={activeProject} 
                        onChange={(e) => setActiveProject(e.target.value)}
                        className="project-dropdown"
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Navigation Menus */}
            <nav className="sidebar-nav">
                <ul className="nav-menu">
                    {/* Dashboard */}
                    <li className="nav-item">
                        <Link 
                            to="/workspace" 
                            className={`nav-link-item ${location.pathname === '/workspace' ? 'active' : ''}`}
                            title="Dashboard"
                        >
                            <span className="nav-icon">📊</span>
                            {isOpen && <span className="nav-label">Dashboard</span>}
                        </Link>
                    </li>

                    {/* Industrial AI Platform Collapsible Menu */}
                    <li className="nav-item">
                        <div 
                            className={`nav-link-item lab-toggle ${location.pathname.startsWith('/industrial-ai') ? 'active-parent' : ''}`}
                            onClick={() => setIndustrialOpen(!industrialOpen)}
                            title="Industrial AI Platform"
                            style={{ cursor: 'pointer', background: 'rgba(255, 222, 89, 0.08)', borderRadius: '8px' }}
                        >
                            <span className="nav-icon">🏭</span>
                            {isOpen && <span className="nav-label" style={{ fontWeight: 'bold', color: '#ffde59' }}>Industrial AI Platform</span>}
                            {isOpen && <span className="arrow">{industrialOpen ? '▼' : '►'}</span>}
                        </div>
                        {isOpen && industrialOpen && (
                            <ul className="lab-submenu">
                                {industrialSubItems.map(sub => (
                                    <li key={sub.path}>
                                        <Link 
                                            to={sub.path} 
                                            className={`subnav-link ${location.pathname === sub.path ? 'active' : ''}`}
                                        >
                                            {sub.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>

                    {menuItems.filter(i => i.path !== '/workspace').map(item => (
                        <li key={item.path} className="nav-item">
                            <Link 
                                to={item.path} 
                                className={`nav-link-item ${location.pathname === item.path ? 'active' : ''}`}
                                title={item.label}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {isOpen && <span className="nav-label">{item.label}</span>}
                            </Link>
                        </li>
                    ))}

                    {/* Robot Intelligence Lab Collapsible Link */}
                    <li className="nav-item">
                        <div 
                            className={`nav-link-item lab-toggle ${location.pathname.startsWith('/robot-lab') ? 'active-parent' : ''}`}
                            onClick={() => setLabOpen(!labOpen)}
                            title="Robot Intelligence Lab"
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="nav-icon">🔬</span>
                            {isOpen && <span className="nav-label">Robot Lab (AGRO-R1)</span>}
                            {isOpen && <span className="arrow">{labOpen ? '▼' : '►'}</span>}
                        </div>
                        {isOpen && labOpen && (
                            <ul className="lab-submenu">
                                {labSubItems.map(sub => (
                                    <li key={sub.path}>
                                        <Link 
                                            to={sub.path} 
                                            className={`subnav-link ${location.pathname === sub.path ? 'active' : ''}`}
                                        >
                                            {sub.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>

                    <div className="nav-separator"></div>

                    {bottomItems.map(item => (
                        <li key={item.path} className="nav-item">
                            <Link 
                                to={item.path} 
                                className={`nav-link-item ${location.pathname === item.path ? 'active' : ''}`}
                                title={item.label}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {isOpen && <span className="nav-label">{item.label}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Bottom Actions: Toggle back to public portfolio */}
            <div className="sidebar-footer">
                <Link to="/portfolio" className="btn-portfolio-back">
                    <span>🏠</span>
                    {isOpen && <span>View Public Site</span>}
                </Link>
            </div>
            {showLightbox && (
                <div 
                    className="logo-lightbox-overlay" 
                    onClick={() => setShowLightbox(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0, 0, 0, 0.85)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 99999,
                        cursor: 'zoom-out',
                        backdropFilter: 'blur(8px)'
                    }}
                >
                    <div style={{ position: 'relative', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <img 
                            src={logoImg} 
                            alt="Dj Group Logo Large" 
                            style={{ 
                                maxWidth: '90%', 
                                maxHeight: '75vh', 
                                objectFit: 'contain',
                                border: '3px solid rgba(255, 222, 89, 0.4)',
                                borderRadius: '12px',
                                background: '#09111e',
                                padding: '1rem',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
                            }} 
                        />
                        <button 
                            onClick={() => setShowLightbox(false)}
                            style={{
                                position: 'absolute',
                                top: '-45px',
                                right: '0',
                                background: 'none',
                                border: 'none',
                                color: '#fff',
                                fontSize: '2.5rem',
                                cursor: 'pointer',
                                lineHeight: '1'
                            }}
                        >
                            &times;
                        </button>
                        <p style={{ color: '#ffde59', marginTop: '1rem', fontFamily: 'sans-serif', fontSize: '1rem', fontWeight: 'bold' }}>DJ Group of Industry Premium Crest</p>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
