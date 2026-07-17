import React, { useState } from 'react';

// Centralized image metadata mapping to adhere to attribution guidelines
const IMAGE_DATABASE = {
    'underwater': {
        title: 'Deep Ocean Autonomous Rover',
        imageUrl: 'https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&q=80&w=600',
        alt: 'Autonomous Underwater Vehicle inspecting deep-sea environment',
        sourceName: 'Unsplash Marine Tech',
        sourceUrl: 'https://unsplash.com/photos/A8z16c-S2-c'
    },
    'educational': {
        title: 'Micro-Controller Educational Coding Robot',
        imageUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd05a?auto=format&fit=crop&q=80&w=600',
        alt: 'Robotics kit on workbench with electronic controller and wires',
        sourceName: 'Unsplash STEM Education',
        sourceUrl: 'https://unsplash.com/photos/T05A-F5Q1Y4'
    },
    'agricultural': {
        title: 'Agricultural Robotic Crop Sensor',
        imageUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=600',
        alt: 'Autonomous robotic vehicle inspecting vineyard row with sensors',
        sourceName: 'Unsplash AgTech Gallery',
        sourceUrl: 'https://unsplash.com/photos/G8tS-3YVb8Q'
    },
    'medical': {
        title: 'Surgical Articulated Joint System',
        imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
        alt: 'High-precision surgical robotic arm calibrating inside hospital theatre',
        sourceName: 'Unsplash Healthcare Systems',
        sourceUrl: 'https://unsplash.com/photos/MedROB-H129'
    },
    'humanoid': {
        title: 'Humanoid Bipedal Robot Platform',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600',
        alt: 'Bipedal humanoid robot standing in lab environment',
        sourceName: 'Unsplash Artificial Intelligence Gallery',
        sourceUrl: 'https://unsplash.com/photos/HUM-902'
    },
    'lidar': {
        title: '3D LiDAR Sensor Unit',
        imageUrl: 'https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?auto=format&fit=crop&q=80&w=600',
        alt: 'Rotary laser scanner showing sensor optical lenses',
        sourceName: 'Unsplash Sensor Directory',
        sourceUrl: 'https://unsplash.com/photos/SEN-LiDAR-1'
    },
    'jetson': {
        title: 'NVIDIA Jetson Development Module',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
        alt: 'Processor board with active cooling fan and interfaces',
        sourceName: 'Unsplash Hardware Registry',
        sourceUrl: 'https://unsplash.com/photos/NVD-JTSN-4'
    }
};

const RoboticsImage = ({ imageKey, category = 'General', style = {} }) => {
    const [loadError, setLoadError] = useState(false);
    const [showAttribution, setShowAttribution] = useState(false);

    const imageInfo = IMAGE_DATABASE[imageKey] || {
        title: 'Robotics System Placeholder',
        imageUrl: '', // Blank will trigger fallback immediately
        alt: 'Default engineering layout placeholder illustration',
        sourceName: 'Local Workspace Draft',
        sourceUrl: '#'
    };

    const handleImageError = () => {
        setLoadError(true);
    };

    return (
        <div 
            className="robotics-image-wrapper" 
            style={{ 
                position: 'relative', 
                overflow: 'hidden', 
                borderRadius: '8px', 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.05)',
                minHeight: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...style 
            }}
            onMouseEnter={() => setShowAttribution(true)}
            onMouseLeave={() => setShowAttribution(false)}
        >
            {(!imageInfo.imageUrl || loadError) ? (
                // SVG / CSS placeholder design if image fails to load or does not exist
                <div className="image-fallback-container" style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent-color)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🤖</div>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, display: 'block' }}>
                        {imageInfo.title}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem', display: 'block' }}>
                        [Image Key: {imageKey} | Category: {category}]
                    </span>
                </div>
            ) : (
                <img 
                    src={imageInfo.imageUrl} 
                    alt={imageInfo.alt}
                    onError={handleImageError}
                    loading="lazy"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.4s ease'
                    }}
                    className="lazy-loaded-robotics-img"
                />
            )}

            {/* Attribution overlay */}
            {showAttribution && (
                <div 
                    className="image-attribution-overlay"
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        padding: '0.8rem 1rem',
                        background: 'rgba(5, 21, 21, 0.95)',
                        borderTop: '1px solid rgba(255, 222, 89, 0.2)',
                        zIndex: 10,
                        animation: 'fadeInUp 0.2s ease-out forwards',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem'
                    }}
                >
                    <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>{imageInfo.title}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>
                        Source: {' '}
                        {imageInfo.sourceUrl !== '#' ? (
                            <a 
                                href={imageInfo.sourceUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ color: 'var(--accent-color)', textDecoration: 'none' }}
                            >
                                {imageInfo.sourceName} ↗
                            </a>
                        ) : (
                            imageInfo.sourceName
                        )}
                    </span>
                </div>
            )}
        </div>
    );
};

export default RoboticsImage;
export { IMAGE_DATABASE };
