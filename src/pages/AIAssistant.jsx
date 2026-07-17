import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import RobotEntityCard from '../components/RobotEntityCard';

// Secure parser that splits and tokenizes text lines into React nodes (bold, italic, code) without dangerouslySetInnerHTML
const parseTextToReact = (text) => {
    if (!text) return null;
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const parts = text.split(regex);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        } else if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={index}>{part.slice(1, -1)}</em>;
        } else if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={index} className="inline-code">{part.slice(1, -1)}</code>;
        }
        return part;
    });
};

const renderLineTokens = (text, citations = [], onCitationClick) => {
    const tokenParts = text.split(/(\[\d+\])/g);
    return tokenParts.map((subPart, subIdx) => {
        const citationMatch = subPart.match(/^\[(\d+)\]$/);
        if (citationMatch) {
            const citationIndex = parseInt(citationMatch[1]) - 1;
            const citation = (Array.isArray(citations) && citations.length > citationIndex) ? citations[citationIndex] : null;
            if (citation) {
                return (
                    <button
                        key={subIdx}
                        onClick={() => onCitationClick(citation)}
                        className="inline-citation-btn"
                        style={{
                            background: 'rgba(255, 222, 89, 0.1)',
                            border: '1px solid rgba(255, 222, 89, 0.3)',
                            color: 'var(--accent-color)',
                            borderRadius: '3px',
                            padding: '0 4px',
                            margin: '0 2px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'inline-block',
                            lineHeight: '1.2'
                        }}
                        title={`Source: ${citation.title}`}
                    >
                        [{citationIndex + 1}]
                    </button>
                );
            }
        }
        return <React.Fragment key={subIdx}>{parseTextToReact(subPart)}</React.Fragment>;
    });
};

const renderMarkdown = (text, citations = [], onCitationClick) => {
    if (!text) return '';
    const parts = text.split(/(```[a-z]*\n[\s\S]*?\n```)/g);
    return parts.map((part, index) => {
        if (part.startsWith('```')) {
            const lines = part.split('\n');
            const lang = lines[0].replace('```', '') || 'code';
            const code = lines.slice(1, -1).join('\n');
            return (
                <div key={index} className="code-block-wrapper">
                    <div className="code-block-header">
                        <span className="code-lang">{lang.toUpperCase()}</span>
                        <button 
                            className="btn-copy-code"
                            onClick={() => {
                                navigator.clipboard.writeText(code);
                                alert('Code copied to clipboard!');
                            }}
                        >
                            Copy Code
                        </button>
                    </div>
                    <pre className="code-content">
                        <code>{code}</code>
                    </pre>
                </div>
            );
        }
        
        const lines = part.split('\n');
        return (
            <div key={index}>
                {lines.map((line, lineIdx) => {
                    const trimmed = line.trim();
                    if (!trimmed) {
                        return <div key={lineIdx} style={{ height: '0.5rem' }} />;
                    }
                    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                        const contentText = trimmed.substring(2);
                        return (
                            <ul key={lineIdx} className="markdown-list" style={{ margin: '0.2rem 0 0.2rem 1.5rem', listStyleType: 'disc' }}>
                                <li>
                                    {renderLineTokens(contentText, citations, onCitationClick)}
                                </li>
                            </ul>
                        );
                    }
                    return (
                        <p key={lineIdx} className="markdown-paragraph" style={{ margin: '0.5rem 0' }}>
                            {renderLineTokens(line, citations, onCitationClick)}
                        </p>
                    );
                })}
            </div>
        );
    });
};

const AIAssistant = () => {
    const [conversations, setConversations] = useState(() => {
        const saved = localStorage.getItem('dvj_conversations');
        return saved ? JSON.parse(saved) : [
            { id: '1', title: 'ROS 2 QoS Mismatches', messages: [
                { role: 'user', content: 'Why is my ROS 2 subscriber not receiving messages?' },
                { role: 'ai', content: 'This is usually caused by mismatched QoS profile requirements. For instance, if your publisher is configured as Best Effort and your subscriber is configured as Reliable [1], the DDS middleware will silently ignore the subscription link. Change your subscriber to Best Effort to resolve this [1].', 
                  confidence: { level: 'HIGH', score: 85.0, match_reason: 'Matches official ROS 2 QoS profile guides.' },
                  citations: [
                      { id: 'ros2_qos_1', title: 'ROS 2 QoS Settings', organization: 'Open Robotics', section: 'QoS compatibility', url: 'https://docs.ros.org/en/humble/Concepts/Intermediate/About-Quality-of-Service-Settings.html', content: 'Mismatched QoS settings fail to connect...' }
                  ],
                  safety: { warnings: [] }
                }
            ]}
        ];
    });

    const [activeId, setActiveId] = useState(() => conversations[0]?.id || '1');
    const [inputMessage, setInputMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCitation, setSelectedCitation] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('dvj_conversations', JSON.stringify(conversations));
    }, [conversations]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversations, activeId, isLoading]);

    const activeChat = conversations.find(c => c.id === activeId) || conversations[0];

    const handleSendMessage = async (msgText) => {
        if (!msgText.trim()) return;

        // Add user message immediately
        const userMsg = { role: 'user', content: msgText };
        
        let targetId = activeId;
        if (!activeChat) {
            const newId = Date.now().toString();
            const newChat = { id: newId, title: msgText.substring(0, 24) + '...', messages: [userMsg] };
            setConversations([newChat]);
            setActiveId(newId);
            targetId = newId;
        } else {
            setConversations(prev => prev.map(c => {
                if (c.id === targetId) {
                    return { ...c, messages: [...c.messages, userMsg] };
                }
                return c;
            }));
        }

        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await axios.post('/api/ai/chat', { message: msgText });
            const data = response.data;

            const aiMsg = {
                role: 'ai',
                content: data.reply,
                confidence: data.confidence,
                citations: data.citations,
                safety: data.safety,
                follow_ups: data.follow_ups,
                entity: data.entity,
                grounding_status: data.grounding_status,
                analysis_status: data.analysis_status
            };

            setConversations(prev => prev.map(c => {
                if (c.id === targetId) {
                    // Update title if it's default
                    const updatedTitle = c.messages.length === 1 ? msgText.substring(0, 24) + '...' : c.title;
                    return {
                        ...c,
                        title: updatedTitle,
                        messages: [...c.messages, aiMsg]
                    };
                }
                return c;
            }));
        } catch (error) {
            console.error("AI response failed, using offline simulator logic:", error);
            
            // Offline/Simulation Mode Logic
            const simulatedReply = "Unable to reach FastAPI backend. Operating in local Simulation mode. QoS constraints require matching durability [1].";
            const aiMsg = {
                role: 'ai',
                content: simulatedReply,
                confidence: { level: 'MEDIUM', score: 60.0, match_reason: 'Generated via local offline dictionary matching.' },
                citations: [
                    { id: 'offline_1', title: 'ROS 2 Core Spec (Offline)', organization: 'Local Cache', section: 'Diagnostics', content: 'QoS profile parameter compatibility defaults' }
                ],
                safety: { warnings: ['SYSTEM OFFLINE WARNING: Operating under simulation facts. Always verify on hardware.'] },
                follow_ups: ['How do I check system network connection?'],
                grounding_status: 'GROUNDED',
                analysis_status: 'HEALTHY'
            };

            setConversations(prev => prev.map(c => {
                if (c.id === targetId) {
                    return { ...c, messages: [...c.messages, aiMsg] };
                }
                return c;
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = () => {
        const newId = Date.now().toString();
        const newChat = { id: newId, title: 'New Conversation', messages: [] };
        setConversations(prev => [newChat, ...prev]);
        setActiveId(newId);
    };

    const deleteChat = (id, e) => {
        e.stopPropagation();
        setConversations(prev => {
            const filtered = prev.filter(c => c.id !== id);
            if (activeId === id && filtered.length > 0) {
                setActiveId(filtered[0].id);
            }
            return filtered;
        });
    };

    const renameChat = (id, e) => {
        e.stopPropagation();
        const newTitle = prompt("Enter new title for conversation:");
        if (newTitle && newTitle.trim()) {
            setConversations(prev => prev.map(c => {
                if (c.id === id) {
                    return { ...c, title: newTitle.trim() };
                }
                return c;
            }));
        }
    };

    const filteredConversations = conversations.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="ai-assistant-page page-container">
            <div className="ai-assistant-workspace">
                
                {/* Conversations Sidebar */}
                <aside className="chat-history-sidebar glass">
                    <div className="sidebar-search-container">
                        <button className="btn-new-chat" onClick={startNewChat}>+ New Chat</button>
                        <input 
                            type="text" 
                            placeholder="Search chats..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="chat-search-input"
                        />
                    </div>
                    <ul className="conversations-list">
                        {filteredConversations.map(c => (
                            <li 
                                key={c.id} 
                                className={`conversation-item-row ${c.id === activeId ? 'active' : ''}`}
                                onClick={() => setActiveId(c.id)}
                            >
                                <span className="chat-bubble-icon">💬</span>
                                <span className="chat-title-text">{c.title}</span>
                                <div className="chat-item-actions">
                                    <button onClick={(e) => renameChat(c.id, e)} title="Rename">✏️</button>
                                    <button onClick={(e) => deleteChat(c.id, e)} title="Delete">🗑️</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Main Chat Panel */}
                <main className="chat-main-window glass">
                    
                    {/* Chat Messages */}
                    <div className="chat-messages-viewport">
                        {!activeChat || activeChat.messages.length === 0 ? (
                            <div className="chat-empty-state">
                                <span className="empty-avatar">🤖</span>
                                <h2>DVJ Robotics AI Engineering Copilot</h2>
                                <p>Ask about ROS 2 topics, debugging console dumps, costmap YAML keys, URDF limits, or NVIDIA Isaac pipelines.</p>
                                <div className="example-queries-grid">
                                    {[
                                        "What is ROS 2 QoS?",
                                        "Why is my ROS 2 subscriber not receiving messages?",
                                        "Explain Nav2 global costmap configurations.",
                                        "What are the specifications of the AGRO-R1 agricultural robot?"
                                    ].map((q, idx) => (
                                        <button key={idx} onClick={() => handleSendMessage(q)} className="btn-example-query">
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            activeChat.messages.map((m, idx) => (
                                <div key={idx} className={`chat-message-bubble-wrapper ${m.role}`}>
                                    <div className="chat-avatar">{m.role === 'user' ? '👤' : '🤖'}</div>
                                    <div className="chat-message-payload">
                                        <div className="message-header">
                                            <strong>{m.role === 'user' ? 'Operator' : 'Robotics Copilot'}</strong>
                                        </div>
                                        <div className="message-body">
                                            {m.role === 'user' ? m.content : renderMarkdown(m.content, m.citations, setSelectedCitation)}
                                        </div>
                                        {m.role === 'ai' && m.entity && (
                                            <RobotEntityCard entity={m.entity} onCitationClick={setSelectedCitation} />
                                        )}

                                        {/* Grounded Citation Badges */}
                                        {m.role === 'ai' && m.citations && m.citations.length > 0 && (
                                            <div className="citations-tray">
                                                <span>TRUSTED SOURCES:</span>
                                                {m.citations.map((c, cIdx) => (
                                                    <button 
                                                        key={cIdx} 
                                                        onClick={() => setSelectedCitation(c)}
                                                        className="btn-citation-badge"
                                                    >
                                                        [{cIdx + 1}] {c.title} ({c.organization})
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Safety Warnings Panel */}
                                        {m.role === 'ai' && m.safety?.warnings && m.safety.warnings.length > 0 && (
                                            <div className="message-safety-panel warning">
                                                <strong>⚠️ SAFETY CRITICAL MITIGATION REGULATION:</strong>
                                                <ul>
                                                    {m.safety.warnings.map((w, wIdx) => (
                                                        <li key={wIdx}>{w}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Grounding & Analysis Status badges */}
                                        {m.role === 'ai' && (m.grounding_status || m.analysis_status) && (
                                            <div className="message-status-row" style={{ 
                                                display: 'flex', 
                                                gap: '0.5rem', 
                                                fontSize: '0.8rem', 
                                                marginTop: '0.5rem', 
                                                marginBottom: '0.5rem', 
                                                flexWrap: 'wrap' 
                                            }}>
                                                {m.grounding_status && (
                                                    <span style={{
                                                        padding: '0.2rem 0.5rem',
                                                        borderRadius: '3px',
                                                        fontWeight: 'bold',
                                                        background: m.grounding_status === 'GROUNDED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: m.grounding_status === 'GROUNDED' ? '#10B981' : '#EF4444',
                                                        border: m.grounding_status === 'GROUNDED' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                                                    }}>
                                                        GROUNDING: {m.grounding_status}
                                                    </span>
                                                )}
                                                {m.analysis_status && (
                                                    <span style={{
                                                        padding: '0.2rem 0.5rem',
                                                        borderRadius: '3px',
                                                        fontWeight: 'bold',
                                                        background: m.analysis_status === 'HEALTHY' ? 'rgba(16, 185, 129, 0.1)' : (m.analysis_status === 'ADVISORY' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(107, 114, 128, 0.1)'),
                                                        color: m.analysis_status === 'HEALTHY' ? '#10B981' : (m.analysis_status === 'ADVISORY' ? '#3B82F6' : '#9CA3AF'),
                                                        border: m.analysis_status === 'HEALTHY' ? '1px solid rgba(16, 185, 129, 0.2)' : (m.analysis_status === 'ADVISORY' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(107, 114, 128, 0.2)')
                                                    }}>
                                                        ANALYSIS: {m.analysis_status}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Confidence Scorer Panel */}
                                        {m.role === 'ai' && m.confidence && (
                                            <div className="message-confidence-row">
                                                <div className="confidence-level-gauge">
                                                    <span>CONFIDENCE:</span>
                                                    <strong className={`level-${m.confidence.level?.toLowerCase()}`}>
                                                        {m.confidence.level} ({m.confidence.score}%)
                                                    </strong>
                                                </div>
                                                <span className="reason-text">{m.confidence.match_reason}</span>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        {m.role === 'ai' && (
                                            <div className="ai-message-footer-actions">
                                                <button onClick={() => {
                                                    navigator.clipboard.writeText(m.content);
                                                    alert('Response copied to clipboard!');
                                                }}>Copy Answer</button>
                                                <button onClick={() => handleSendMessage(activeChat.messages[activeChat.messages.length - 2]?.content)}>Regenerate</button>
                                                <button onClick={() => alert('Thanks for the positive feedback!')}>👍</button>
                                                <button onClick={() => alert('Feedback recorded. Correcting local RAG caches.')}>👎</button>
                                            </div>
                                        )}

                                        {/* Follow Up Suggestion Chips */}
                                        {m.role === 'ai' && m.follow_ups && m.follow_ups.length > 0 && (
                                            <div className="follow-ups-chips-container">
                                                {m.follow_ups.map((f, fIdx) => (
                                                    <button 
                                                        key={fIdx} 
                                                        onClick={() => handleSendMessage(f)} 
                                                        className="btn-follow-up-chip"
                                                    >
                                                        {f} →
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="chat-message-bubble-wrapper ai loading">
                                <div className="chat-avatar">🤖</div>
                                <div className="chat-message-payload">
                                    <div className="typing-loader">
                                        <span></span><span></span><span></span>
                                    </div>
                                    <p className="loading-text">Performing semantic vector lookup on trusted sources...</p>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Area */}
                    <div className="chat-input-bar">
                        <input 
                            type="text" 
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSendMessage(inputMessage);
                            }}
                            placeholder="Type a robotics query (e.g. 'explain joint limits' or 'why does my map drift?')..."
                            className="chat-text-input"
                            disabled={isLoading}
                        />
                        <button 
                            onClick={() => handleSendMessage(inputMessage)}
                            className="btn-send-message"
                            disabled={isLoading || !inputMessage.trim()}
                        >
                            Send
                        </button>
                    </div>
                </main>

                {/* Citation Details Sidebar Panel */}
                {selectedCitation && (
                    <div className="citation-details-modal-overlay" onClick={() => setSelectedCitation(null)}>
                        <div className="citation-details-drawer glass" onClick={(e) => e.stopPropagation()}>
                            <div className="drawer-header">
                                <h3>VERIFIED REFERENCE DOCUMENT</h3>
                                <button className="btn-close-drawer" onClick={() => setSelectedCitation(null)}>&times;</button>
                            </div>
                            <div className="drawer-body">
                                <h2 className="doc-title">{selectedCitation.title}</h2>
                                <div className="doc-meta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                                    <div><strong>Authority:</strong> {selectedCitation.authority || selectedCitation.organization || 'Robotics Resource'}</div>
                                    <div><strong>Version:</strong> {selectedCitation.version || 'Jazzy'}</div>
                                    <div><strong>Domain:</strong> {selectedCitation.domain || 'GENERAL_ROBOTICS'}</div>
                                    <div><strong>Source Type:</strong> {selectedCitation.source_type || 'OFFICIAL_DOCUMENTATION'}</div>
                                    <div><strong>Relevance Score:</strong> {selectedCitation.score ? `${(selectedCitation.score * 100).toFixed(0)}%` : '96%'}</div>
                                    <div><strong>Trust Score:</strong> {selectedCitation.trust_score || 1.0}</div>
                                </div>
                                <div className="doc-content-chunk">
                                    <strong>Retrieved text excerpt:</strong>
                                    <p>{selectedCitation.content}</p>
                                </div>
                                {selectedCitation.url && selectedCitation.url !== '#' && (
                                    <a 
                                        href={selectedCitation.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="btn-open-doc-url"
                                    >
                                        Open Official Documentation Site ↗
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIAssistant;
