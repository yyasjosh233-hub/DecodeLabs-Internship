import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChatWidget = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [messages, setMessages] = useState([
        { 
            text: "Hello! I am the Dj Group AI Expert. How can I assist you with our robotics solutions today?", 
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const toggleChat = () => setIsOpen(!isOpen);

    // Audio beep play helper
    const playNotificationSound = () => {
        if (!soundEnabled) return;
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.type = 'sine';
            oscillator.frequency.value = 600;
            gain.gain.setValueAtTime(0.1, context.currentTime);
            oscillator.start();
            oscillator.stop(context.currentTime + 0.15);
        } catch (e) {
            console.warn("Audio context blocked or not supported", e);
        }
    };

    const handleSend = async (textToSend) => {
        const text = textToSend || inputValue.trim();
        if (!text || isTyping) return;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => [...prev, { text, isUser: true, timestamp }]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await axios.post('/api/ai/chat', { message: text });
            const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setMessages(prev => [...prev, { text: response.data.reply, isUser: false, timestamp: replyTime }]);
            playNotificationSound();
        } catch (error) {
            console.warn("Local API failed, trying Netlify function...", error);
            try {
                const response = await axios.post('/.netlify/functions/chat', { message: text });
                const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                setMessages(prev => [...prev, { text: response.data.reply, isUser: false, timestamp: replyTime }]);
                playNotificationSound();
            } catch (netError) {
                console.error("Chat Error:", netError);
                const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                setMessages(prev => [...prev, { text: "Connection error. Check if AI server is running.", isUser: false, timestamp: replyTime }]);
            }
        } finally {
            setIsTyping(false);
        }
    };

    const suggestions = [
        "What is a robot?",
        "Types of robot?",
        "Industrial robots?",
        "Humanoid robots?",
        "Medical robots?"
    ];

    return (
        <div className="chat-widget-container">
            <button className="chat-toggle-btn" onClick={toggleChat} aria-label="Toggle Chat">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </button>

            <div className={`chat-window ${isOpen ? '' : 'hidden'}`}>
                <div className="chat-header">
                    <div className="ai-avatar">AI</div>
                    <div className="ai-title" style={{ flexGrow: 1 }}>
                        <h3>Dj Expert Assistant</h3>
                        <span className="online-status">Online</span>
                    </div>
                    {/* Audio Sound Toggle */}
                    <button 
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: soundEnabled ? 'var(--accent-color)' : 'var(--text-muted)',
                            marginRight: '0.4rem',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        title={soundEnabled ? "Mute audio response" : "Enable audio beep"}
                    >
                        {soundEnabled ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                        )}
                    </button>
                    {/* Open Full Screen button */}
                    <button 
                        onClick={() => {
                            setIsOpen(false);
                            navigate('/ai-assistant');
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            marginRight: '0.8rem',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        title="Open full screen Robotics Workspace"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        </svg>
                    </button>
                    <button className="chat-close-btn" onClick={toggleChat}>&times;</button>
                </div>

                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.isUser ? 'user-message' : 'ai-message'}`} style={{ position: 'relative' }}>
                            <p style={{ margin: 0, paddingBottom: '0.4rem' }}>{msg.text}</p>
                            <span style={{
                                fontSize: '0.65rem',
                                color: 'rgba(255, 255, 255, 0.35)',
                                display: 'block',
                                textAlign: 'right'
                            }}>
                                {msg.timestamp}
                            </span>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="typing-indicator">
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions Chips list */}
                <div style={{
                    display: 'flex',
                    gap: '0.4rem',
                    padding: '0.5rem 1rem',
                    overflowX: 'auto',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(0,0,0,0.1)',
                    scrollbarWidth: 'none'
                }}>
                    {suggestions.map((sug, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(sug)}
                            style={{
                                background: 'rgba(255, 222, 89, 0.05)',
                                border: '1px solid rgba(255, 222, 89, 0.15)',
                                color: '#ffde59',
                                borderRadius: '50px',
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.75rem',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.background = 'rgba(255,222,89,0.15)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = 'rgba(255,222,89,0.05)';
                            }}
                        >
                            {sug}
                        </button>
                    ))}
                </div>

                <div className="chat-input-area">
                    <input
                        type="text"
                        placeholder="Ask a question..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={() => handleSend()} className="send-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWidget;
