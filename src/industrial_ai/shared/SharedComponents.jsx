import React, { useState } from 'react';

/**
 * JsonTreeViewer Component
 * Interactive formatted JSON display with copy to clipboard
 */
export const JsonTreeViewer = ({ data, title = 'RAW JSON TELEMETRY' }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{
            background: '#040914',
            border: '1px solid rgba(255, 222, 89, 0.2)',
            borderRadius: '10px',
            padding: '1rem',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            color: '#38bdf8',
            maxHeight: '360px',
            overflowY: 'auto',
            position: 'relative'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.8rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: '0.4rem'
            }}>
                <span style={{ color: '#ffde59', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    {title}
                </span>
                <button
                    onClick={handleCopy}
                    style={{
                        background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 222, 89, 0.1)',
                        border: copied ? '1px solid #10b981' : '1px solid rgba(255, 222, 89, 0.3)',
                        color: copied ? '#10b981' : '#ffde59',
                        borderRadius: '4px',
                        padding: '0.2rem 0.6rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                    }}
                >
                    {copied ? '✓ Copied' : 'Copy JSON'}
                </button>
            </div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#a5f3fc' }}>
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
};

/**
 * StatusBadge Component
 */
export const StatusBadge = ({ status, text }) => {
    let bg = 'rgba(100, 116, 139, 0.2)';
    let color = '#94a3b8';
    let border = 'rgba(100, 116, 139, 0.3)';

    if (status === 'ONLINE' || status === 'PASS' || status === 'HEALTHY' || status === 'RUNNING') {
        bg = 'rgba(16, 185, 129, 0.15)';
        color = '#10b981';
        border = 'rgba(16, 185, 129, 0.3)';
    } else if (status === 'FAIL' || status === 'ERROR' || status === 'ESTOP') {
        bg = 'rgba(239, 68, 68, 0.15)';
        color = '#ef4444';
        border = 'rgba(239, 68, 68, 0.3)';
    } else if (status === 'WARNING' || status === 'SINGULARITY' || status === 'BUSY') {
        bg = 'rgba(245, 158, 11, 0.15)';
        color = '#f59e0b';
        border = 'rgba(245, 158, 11, 0.3)';
    }

    return (
        <span style={{
            background: bg,
            color: color,
            border: `1px solid ${border}`,
            borderRadius: '50px',
            padding: '0.2rem 0.7rem',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
        }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
            {text || status}
        </span>
    );
};

/**
 * MetricTile Component
 */
export const MetricTile = ({ label, value, subtext, icon, color = '#ffde59' }) => {
    return (
        <div className="stat-card glass" style={{ borderLeft: `3px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                <span className="stat-card-val" style={{ color: color }}>{value}</span>
            </div>
            <span className="stat-card-label" style={{ marginTop: '0.3rem' }}>{label}</span>
            {subtext && <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>{subtext}</span>}
        </div>
    );
};
