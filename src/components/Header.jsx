import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo_circle.png';

const Header = () => {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu when location changes
    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    return (
        <header className={scrolled ? 'scrolled' : ''}>
            <nav className="navbar">
                <Link to="/" className="logo">
                    <div className="logo-container">
                        <img 
                            src={logoImg} 
                            alt="Dj Group Logo" 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowLightbox(true);
                            }}
                            title="Click to view full crest logo"
                            style={{ cursor: 'zoom-in' }}
                        />
                    </div>
                    <span>
                        <span className="brand-dj">Dj</span>
                        <span className="brand-text">Group of Industry</span>
                    </span>
                </Link>

                {/* Hamburger Button */}
                <button 
                    className={`hamburger ${menuOpen ? 'open' : ''}`} 
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle Menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                    <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
                    <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link>
                    <Link to="/services" className={location.pathname === '/services' ? 'active' : ''}>Services</Link>
                    <Link to="/illustrations" className={location.pathname === '/illustrations' ? 'active' : ''}>Illustrations</Link>
                    <Link to="/blog" className={location.pathname === '/blog' ? 'active' : ''}>Blog</Link>
                    <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
                    <Link to="/workspace" className="btn-nav" style={{ background: 'var(--accent-color)', color: '#000', border: 'none' }}>Platform Workspace</Link>
                </div>
            </nav>
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
        </header>
    );
};

export default Header;

