import React, { useState } from 'react';
import axios from 'axios';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [toasts, setToasts] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        showToast('Establishing secure link...', 'info');

        try {
            await axios.post('/api/contact', formData);
            showToast('Inquiry successfully transmitted!', 'success');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('Error submitting form:', error);
            showToast('Transmission error. Check network connection.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-page animate-fade-in" style={{ position: 'relative' }}>
            
            {/* Toast Notifications Container */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div 
                        key={toast.id} 
                        className="toast"
                        style={{
                            borderColor: toast.type === 'error' ? '#ff4d4d' : toast.type === 'info' ? '#3399ff' : 'var(--accent-color)'
                        }}
                    >
                        <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: toast.type === 'error' ? '#ff4d4d' : toast.type === 'info' ? '#3399ff' : 'var(--accent-color)'
                        }}></div>
                        <span>{toast.message}</span>
                    </div>
                ))}
            </div>

            <section className="blog-hero" style={{ height: '45vh', background: 'linear-gradient(rgba(5, 21, 21, 0.7), rgba(5, 21, 21, 0.9)), url("https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=2000")' }}>
                <span className="subtitle" style={{ letterSpacing: '6px' }}>GET IN TOUCH</span>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 900 }}>Contact <span style={{ color: 'var(--accent-color)' }}>Engineering</span></h1>
            </section>

            <section className="content-section" style={{ padding: '8rem 2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem' }}>
                    
                    {/* Contact Info Card */}
                    <div className="glass" style={{ padding: '4rem', borderRadius: '24px', border: '1px solid rgba(255, 222, 89, 0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                        <span className="subtitle">STAY CONNECTED</span>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>Let’s Create <span style={{ color: 'var(--accent-color)' }}>Together</span></h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
                            Connect with us to explore how we can make your vision a reality. Join us in shaping the future of manufacturing and advanced robotics.
                        </p>
                        <div style={{ padding: '2rem', borderRadius: '12px', background: 'rgba(255, 222, 89, 0.05)', border: '1px solid rgba(255, 222, 89, 0.1)' }}>
                            <p style={{ color: 'var(--accent-color)', fontSize: '0.8rem', letterSpacing: '2px', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Direct Channel</p>
                            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white' }}>+1 202-555-0188</p>
                        </div>
                    </div>

                    {/* Inquiry Form Card with Floating Labels */}
                    <div className="glass" style={{ padding: '4rem', borderRadius: '24px', border: '1px solid rgba(255, 222, 89, 0.1)' }}>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '3rem', fontWeight: 700, textAlign: 'center' }}>Send an <span style={{ color: 'var(--accent-color)' }}>Inquiry</span></h3>
                        
                        <form onSubmit={handleSubmit} id="contactForm">
                            <div className="floating-input-group">
                                <input 
                                    type="text" 
                                    id="name" 
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder=" "
                                />
                                <label htmlFor="name">Full Name</label>
                            </div>
                            
                            <div className="floating-input-group">
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder=" "
                                />
                                <label htmlFor="email">Corporate Email</label>
                            </div>

                            <div className="floating-input-group">
                                <textarea 
                                    id="message" 
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    placeholder=" "
                                ></textarea>
                                <label htmlFor="message">Project Details</label>
                            </div>

                            <button 
                                type="submit" 
                                className="btn" 
                                style={{ width: '100%', padding: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                                disabled={loading}
                            >
                                {loading ? 'Transmitting...' : 'Transmit Inquiry'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
