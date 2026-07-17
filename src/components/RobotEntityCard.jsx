import React, { useState } from 'react';

const RobotEntityCard = ({ entity, onCitationClick }) => {
    const [imageError, setImageError] = useState(false);

    if (!entity) return null;

    const {
        name = "Robot Model",
        category = "Robotic System",
        image_url = "",
        short_description = "Not specified in the approved source.",
        capabilities = [],
        sensors = [],
        ai_technologies = [],
        navigation = [],
        applications = [],
        specifications = {}
    } = entity;

    // Log development warning if image is missing/broken
    const handleImageError = () => {
        console.warn(`AGRO-R1 image asset not found at path: ${image_url}`);
        setImageError(true);
    };

    return (
        <div className="robot-entity-card glass" style={{
            background: 'var(--secondary-workspace-bg)',
            border: '1px solid var(--workspace-border)',
            borderRadius: '12px',
            overflow: 'hidden',
            marginTop: '1.5rem',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
            
            {/* Robot Image Container (Step 5) */}
            {image_url && !imageError && (
                <div className="robot-img-container" style={{
                    width: '100%',
                    height: '220px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '1.2rem',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img 
                        src={image_url} 
                        alt={`${name} autonomous agricultural robot`} 
                        onError={handleImageError}
                        loading="lazy"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                </div>
            )}

            {/* Header info */}
            <div className="robot-card-header" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.6rem', color: '#fff', margin: 0, fontWeight: 'bold' }}>{name}</h3>
                <span className="category-tag" style={{
                    display: 'inline-block',
                    padding: '0.2rem 0.6rem',
                    background: 'rgba(255, 222, 89, 0.1)',
                    color: 'var(--accent-color)',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    marginTop: '0.3rem'
                }}>{category}</span>
            </div>

            {/* Structured Content Sections (Step 6) */}
            <div className="robot-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: '#ccc' }}>
                
                {/* Overview */}
                {short_description && (
                    <div className="section-block">
                        <h4 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0.5rem 0' }}>Overview</h4>
                        <p style={{ margin: 0, lineHeight: '1.5' }}>{short_description}</p>
                    </div>
                )}

                {/* Key Capabilities */}
                {capabilities && capabilities.length > 0 && (
                    <div className="section-block">
                        <h4 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0.5rem 0' }}>Key Capabilities</h4>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.5' }}>
                            {capabilities.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                    </div>
                )}

                {/* Sensors */}
                {sensors && sensors.length > 0 && (
                    <div className="section-block">
                        <h4 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0.5rem 0' }}>Sensors</h4>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.5' }}>
                            {sensors.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                )}

                {/* AI Technologies */}
                {ai_technologies && ai_technologies.length > 0 && (
                    <div className="section-block">
                        <h4 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0.5rem 0' }}>AI Technologies</h4>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.5' }}>
                            {ai_technologies.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                    </div>
                )}

                {/* Navigation Technology */}
                {navigation && navigation.length > 0 && (
                    <div className="section-block">
                        <h4 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0.5rem 0' }}>Navigation</h4>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.5' }}>
                            {navigation.map((n, i) => <li key={i}>{n}</li>)}
                        </ul>
                    </div>
                )}

                {/* Applications */}
                {applications && applications.length > 0 && (
                    <div className="section-block">
                        <h4 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0.5rem 0' }}>Applications</h4>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.5' }}>
                            {applications.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                    </div>
                )}

                {/* Technical Specifications */}
                {specifications && Object.keys(specifications).length > 0 && (
                    <div className="section-block">
                        <h4 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0.5rem 0' }}>Technical Specifications</h4>
                        <div className="specs-table" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                            {Object.entries(specifications).map(([key, val], idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '0.2rem' }}>
                                    <span style={{ color: '#aaa' }}>{key}</span>
                                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Source details card */}
                <div className="source-card-sub" style={{
                    marginTop: '1rem',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '1rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.03)'
                }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>SOURCE REFERENCED</span>
                    <strong style={{ display: 'block', color: '#fff', fontSize: '0.85rem' }}>{name} Specifications Document</strong>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.5rem', color: '#888' }}>
                        <span>Authority: {entity.authority || 'DVJ Technologies'}</span>
                        <span>Confidence: High</span>
                    </div>

                    <button 
                        onClick={() => {
                            if (onCitationClick) {
                                onCitationClick({
                                    title: `${name} Agricultural Robot Specifications`,
                                    authority: entity.authority || "DVJ Technologies",
                                    organization: entity.authority || "DVJ Technologies",
                                    section: "Hardware Specifications",
                                    version: "1.0",
                                    score: 0.96,
                                    content: short_description,
                                    url: "https://dvj-agro.ai/specs"
                                });
                            }
                        }}
                        className="btn-example-paste"
                        style={{ width: '100%', marginTop: '0.8rem', padding: '0.4rem', fontSize: '0.8rem' }}
                    >
                        View Source Details
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RobotEntityCard;
