import React, { useState } from 'react';

const EmailAutomation = () => {
    const [protocol, setProtocol] = useState('IMAP');
    const [emails, setEmails] = useState([
        { id: 1, sender: 'purchasing@acmeind.com', subject: 'Urgent: PO-8891 Invoice & Details Attached', category: 'Invoices', priority: 'High', date: '10 mins ago', attachment: 'PO_8891.pdf' },
        { id: 2, sender: 'support@robotics-supplier.org', subject: 'Re: Joint Motor Delivery Schedule', category: 'Inquiries', priority: 'Medium', date: '45 mins ago', attachment: 'Schedule.xlsx' },
        { id: 3, sender: 'billing@energy-grid.com', subject: 'Monthly Power Consumption Statement', category: 'Invoices', priority: 'Normal', date: '2 hours ago', attachment: 'Bill_Feb2026.pdf' }
    ]);
    const [selectedEmail, setSelectedEmail] = useState(emails[0]);

    const handleAction = (actionName) => {
        alert(`Email action executed: [${actionName}] for email ID ${selectedEmail.id}`);
    };

    return (
        <div className="rpa-email-automation">
            <div className="rpa-card" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ color: '#ffde59', margin: 0 }}>📧 Email Automation & AI Inbox Classifier</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>Connect SMTP, IMAP, and Microsoft Outlook endpoints to automate mail workflows, attachment scraping, and AI response rules.</p>
            </div>

            {/* Protocol Bar */}
            <div className="rpa-card" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Active Mail Gateway:</span>
                    {['IMAP', 'SMTP', 'Microsoft Outlook'].map(p => (
                        <button key={p} className={`rpa-btn rpa-btn-sm ${protocol === p ? 'rpa-btn-primary' : ''}`} onClick={() => setProtocol(p)}>
                            {p === 'Microsoft Outlook' ? '🔷 Outlook 365' : p}
                        </button>
                    ))}
                </div>
                <span className="rpa-status-tag rpa-status-running"><span className="rpa-dot rpa-dot-running"></span> Connected to Server</span>
            </div>

            <div className="rpa-grid-2">
                {/* Inbox Table */}
                <div className="rpa-card">
                    <h4 style={{ color: '#ffde59', marginBottom: '0.75rem' }}>📥 Automated Inbox Listener</h4>
                    <div className="rpa-table-wrapper">
                        <table className="rpa-table">
                            <thead>
                                <tr>
                                    <th>Sender</th>
                                    <th>Subject</th>
                                    <th>AI Class</th>
                                </tr>
                            </thead>
                            <tbody>
                                {emails.map(e => (
                                    <tr key={e.id} onClick={() => setSelectedEmail(e)} style={{ cursor: 'pointer', background: selectedEmail.id === e.id ? 'rgba(255,222,89,0.1)' : 'transparent' }}>
                                        <td style={{ fontWeight: 600, color: '#f8fafc' }}>{e.sender}</td>
                                        <td style={{ fontSize: '0.8rem' }}>{e.subject}</td>
                                        <td>
                                            <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                                                {e.category}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Email Action & Detail View */}
                <div className="rpa-card">
                    <h4 style={{ color: '#ffde59', marginBottom: '0.75rem' }}>✉️ Email Inspector & Automation Actions</h4>
                    
                    {selectedEmail && (
                        <div>
                            <div style={{ background: 'rgba(5,21,21,0.6)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>From: <span style={{ color: '#ffffff' }}>{selectedEmail.sender}</span></div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffde59', margin: '0.3rem 0' }}>{selectedEmail.subject}</div>
                                <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Attachment: 📎 {selectedEmail.attachment}</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                <button className="rpa-btn rpa-btn-primary" onClick={() => handleAction('Read Email')}>📥 Read Email Data</button>
                                <button className="rpa-btn" onClick={() => handleAction('Download Attachment')}>📎 Download Attachment</button>
                                <button className="rpa-btn" onClick={() => handleAction('Auto Reply')}>🤖 Trigger Auto Reply</button>
                                <button className="rpa-btn" onClick={() => handleAction('Move Email')}>📁 Move to Processed</button>
                                <button className="rpa-btn rpa-btn-danger" onClick={() => handleAction('Delete Email')} style={{ gridColumn: 'span 2' }}>🗑️ Delete Email</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailAutomation;
