import React, { useState } from 'react';

const AnalysisDiagnosticsPanel = ({ analysis, context = "GENERAL" }) => {
    const [expandedIssue, setExpandedIssue] = useState(null);

    if (!analysis) return null;

    const {
        parser_status = "SUCCESS",
        analysis_status = "HEALTHY",
        issues = [],
        message = ""
    } = analysis;

    // Color/Icon configuration based on status
    const getStatusConfig = (status) => {
        switch (status?.toUpperCase()) {
            case 'HEALTHY':
                return {
                    label: 'HEALTHY',
                    icon: '✔️',
                    color: '#10B981',
                    bg: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                };
            case 'ADVISORY':
                return {
                    label: 'ADVISORY',
                    icon: 'ℹ️',
                    color: '#3B82F6',
                    bg: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                };
            case 'WARNING':
                return {
                    label: 'WARNING',
                    icon: '⚠️',
                    color: '#F59E0B',
                    bg: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                };
            case 'ERROR':
                return {
                    label: 'ERROR',
                    icon: '❌',
                    color: '#EF4444',
                    bg: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                };
            case 'CRITICAL':
                return {
                    label: 'CRITICAL',
                    icon: '🔥',
                    color: '#EC4899',
                    bg: 'rgba(236, 72, 153, 0.1)',
                    border: '1px solid rgba(236, 72, 153, 0.3)'
                };
            case 'INSUFFICIENT_DATA':
                return {
                    label: 'INSUFFICIENT DATA',
                    icon: '❓',
                    color: '#6B7280',
                    bg: 'rgba(107, 114, 128, 0.1)',
                    border: '1px solid rgba(107, 114, 128, 0.2)'
                };
            default:
                return {
                    label: 'UNKNOWN',
                    icon: '🛑',
                    color: '#9CA3AF',
                    bg: 'rgba(156, 163, 175, 0.1)',
                    border: '1px solid rgba(156, 163, 175, 0.2)'
                };
        }
    };

    const getSeverityColor = (sev) => {
        switch (sev?.toUpperCase()) {
            case 'CRITICAL': return '#EC4899';
            case 'ERROR': return '#EF4444';
            case 'WARNING': return '#F59E0B';
            case 'SUGGESTION': return '#3B82F6';
            default: return '#10B981';
        }
    };

    const statusConfig = getStatusConfig(analysis_status);

    // Compute compact issue counts
    const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
    const errorCount = issues.filter(i => i.severity === 'ERROR').length;
    const warningCount = issues.filter(i => i.severity === 'WARNING').length;
    const suggestionCount = issues.filter(i => i.severity === 'SUGGESTION').length;
    const infoCount = issues.filter(i => i.severity === 'INFO').length;

    const countParts = [];
    if (criticalCount > 0) countParts.push(`${criticalCount} Critical`);
    if (errorCount > 0) countParts.push(`${errorCount} Error${errorCount > 1 ? 's' : ''}`);
    if (warningCount > 0) countParts.push(`${warningCount} Warning${warningCount > 1 ? 's' : ''}`);
    if (suggestionCount > 0) countParts.push(`${suggestionCount} Suggestion${suggestionCount > 1 ? 's' : ''}`);
    if (infoCount > 0) countParts.push(`${infoCount} Info`);

    const countString = countParts.join(' • ');

    return (
        <div className="diagnostics-panel glass" style={{ margin: '1rem 0', padding: '1.5rem', borderRadius: '8px' }}>
            <div className="panel-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '0.5px' }}>DIAGNOSTICS & STATUS REPORT</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Analysis Context: <strong style={{ color: 'var(--accent-color)' }}>{context.toUpperCase()}</strong></span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {/* Parser Status Badge */}
                    <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.3rem 0.6rem', 
                        borderRadius: '4px', 
                        border: parser_status === 'SUCCESS' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                        color: parser_status === 'SUCCESS' ? '#10B981' : '#EF4444',
                        background: 'rgba(0,0,0,0.2)',
                        fontWeight: 'bold'
                    }}>
                        Parser: {parser_status}
                    </span>

                    {/* Analysis Status Badge */}
                    <span style={{
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        color: statusConfig.color,
                        background: statusConfig.bg,
                        border: statusConfig.border,
                        padding: '0.35rem 0.75rem',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}>
                        {statusConfig.icon} {statusConfig.label}
                    </span>
                </div>
            </div>

            <p style={{ fontSize: '0.95rem', color: '#e5e7eb', marginBottom: '1rem' }}>{message}</p>

            {countString && (
                <div style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--text-muted)', 
                    background: 'rgba(0,0,0,0.15)', 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '4px', 
                    display: 'inline-block',
                    marginBottom: '1rem',
                    fontWeight: '500'
                }}>
                    Summary: {countString}
                </div>
            )}

            {issues.length > 0 && (
                <div className="issues-accordion-container" style={{ marginTop: '1rem' }}>
                    <h5 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detected Issues ({issues.length})</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {issues.map((iss, index) => {
                            const isExpanded = expandedIssue === index;
                            const sevColor = getSeverityColor(iss.severity);
                            return (
                                <div 
                                    key={index} 
                                    className="issue-item-wrapper" 
                                    style={{ 
                                        border: isExpanded ? `1px solid ${sevColor}` : '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '6px',
                                        background: 'rgba(0,0,0,0.15)',
                                        overflow: 'hidden',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div 
                                        className="issue-item-header" 
                                        onClick={() => setExpandedIssue(isExpanded ? null : index)}
                                        style={{ 
                                            padding: '0.75rem 1rem', 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ 
                                                fontSize: '0.7rem', 
                                                fontWeight: 'bold', 
                                                background: sevColor, 
                                                color: '#000', 
                                                padding: '0.15rem 0.4rem', 
                                                borderRadius: '3px',
                                                textTransform: 'uppercase'
                                            }}>
                                                {iss.severity}
                                            </span>
                                            <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{iss.title}</strong>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{iss.category}</span>
                                            <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--text-muted)' }}>▼</span>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="issue-item-body" style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.88rem', color: '#d1d5db', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <div>
                                                <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Description</strong>
                                                <p>{iss.message}</p>
                                            </div>

                                            {iss.impact && (
                                                <div>
                                                    <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Potential Impact</strong>
                                                    <p style={{ color: '#fca5a5' }}>{iss.impact}</p>
                                                </div>
                                            )}

                                            {iss.recommendation && (
                                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '4px', borderLeft: `3px solid ${sevColor}` }}>
                                                    <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Resolution Action</strong>
                                                    <p style={{ color: '#93c5fd' }}>{iss.recommendation}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalysisDiagnosticsPanel;
