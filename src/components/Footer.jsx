import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const handleScrollToTop = (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="mega-footer">
            <div className="footer-grid">
                
                {/* Column 1: Info & Brand */}
                <div className="footer-col">
                    <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--accent-color)', fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 600 }}>DJ GROUP</h2>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '0.95rem', marginBottom: '2rem' }}>
                        Architecting sovereign cognitive automation stacks for global high-output manufacturing sectors.
                    </p>
                    <div className="social-links">
                        <a href="https://twitter.com" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.56v-.09c-.59.26-1.22.44-1.88.52.68-.41 1.2-1.05 1.45-1.81-.64.38-1.34.65-2.09.8a3.29 3.29 0 00-5.6 3 9.33 9.33 0 01-6.78-3.44 3.28 3.28 0 001.02 4.38c-.53-.02-1.03-.16-1.47-.4v.04c0 1.59 1.13 2.92 2.63 3.22a3.28 3.28 0 01-1.48.06c.42 1.3 1.63 2.25 3.07 2.28A6.59 6.59 0 010 19.54a9.3 9.3 0 005.04 1.48c6.05 0 9.36-5.01 9.36-9.36 0-.14 0-.29-.01-.43A6.69 6.69 0 0024 4.56z"/></svg>
                        </a>
                        <a href="https://linkedin.com" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </a>
                        <a href="https://github.com" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        </a>
                    </div>
                </div>

                {/* Column 2: Quick Links */}
                <div className="footer-col">
                    <h3>Directives</h3>
                    <ul className="footer-links">
                        <li><Link to="/">Home Base</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/services">Services Offered</Link></li>
                        <li><Link to="/blog">Press & Insights</Link></li>
                        <li><Link to="/contact">Contact Channels</Link></li>
                    </ul>
                </div>

                {/* Column 3: Services categories */}
                <div className="footer-col">
                    <h3>Focus Fields</h3>
                    <ul className="footer-links">
                        <li><Link to="/services">Industrial Cobots</Link></li>
                        <li><Link to="/services">Computer Vision</Link></li>
                        <li><Link to="/services">Machine Learning</Link></li>
                        <li><Link to="/services">Warehouse AMRs</Link></li>
                        <li><Link to="/services">Digital Twins</Link></li>
                    </ul>
                </div>

                {/* Column 4: Newsletter */}
                <div className="footer-col">
                    <h3>Ecosystem Updates</h3>
                    <p>Subscribe to our telemetry newsletter for breakthroughs in machine intelligence.</p>
                    <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully.'); }}>
                        <input type="email" placeholder="Enter email address" required />
                        <button type="submit" className="send-btn">
                            &rarr;
                        </button>
                    </form>
                </div>
            </div>

            <div className="footer-bottom">
                <p>Copyright &copy; 2026 Dj Group of Industry. All systems operational.</p>
                <a href="#top" onClick={handleScrollToTop} style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 'bold' }}>
                    Scroll to Top &uarr;
                </a>
            </div>
        </footer>
    );
};

export default Footer;
