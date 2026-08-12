/**
 * Central State & Execution Engine for Week 3 - Robotic Process Automation (RPA)
 */

export const INITIAL_BOTS = [
    { id: 'BOT-01', name: 'Invoice Processing Bot', status: 'RUNNING', workflow: 'ERP Invoice Automation', assignedTasks: 42, successRate: 98.4, cpu: 34, memory: 420, lastRun: '2 mins ago' },
    { id: 'BOT-02', name: 'Email Attachment Scraper', status: 'RUNNING', workflow: 'PO Email Scraping Pipeline', assignedTasks: 128, successRate: 99.1, cpu: 18, memory: 280, lastRun: 'Just now' },
    { id: 'BOT-03', name: 'Excel Financial Auditor', status: 'IDLE', workflow: 'Quarterly Ledger Reconciler', assignedTasks: 14, successRate: 96.0, cpu: 4, memory: 150, lastRun: '15 mins ago' },
    { id: 'BOT-04', name: 'Database Sync Robot', status: 'RUNNING', workflow: 'PostgreSQL-MongoDB Sync', assignedTasks: 310, successRate: 100.0, cpu: 52, memory: 610, lastRun: '1 min ago' },
    { id: 'BOT-05', name: 'OCR Vendor Scanner', status: 'IDLE', workflow: 'Multi-Format Vendor OCR', assignedTasks: 67, successRate: 95.5, cpu: 2, memory: 190, lastRun: '1 hour ago' },
    { id: 'BOT-06', name: 'File Backup & Archive Bot', status: 'PAUSED', workflow: 'Hourly FTP Backup', assignedTasks: 88, successRate: 94.2, cpu: 0, memory: 90, lastRun: '3 hours ago' }
];

export const INITIAL_WORKFLOWS = [
    {
        id: 'WF-101',
        name: 'ERP Invoice Automation',
        category: 'Document Automation',
        blockCount: 9,
        created: '2026-02-15',
        status: 'Active',
        blocks: [
            { id: 'n1', type: 'Start', label: 'Start Flow', x: 50, y: 50, config: { trigger: 'Scheduled Cron' } },
            { id: 'n2', type: 'Read Email', label: 'Fetch Invoices Email', x: 220, y: 50, config: { folder: 'Inbox/Invoices', unreadOnly: true } },
            { id: 'n3', type: 'Download Attachment', label: 'Save PDF Invoices', x: 410, y: 50, config: { savePath: './temp/invoices' } },
            { id: 'n4', type: 'OCR', label: 'EasyOCR Extract', x: 600, y: 50, config: { engine: 'EasyOCR', confidenceMin: 0.85 } },
            { id: 'n5', type: 'Extract Data', label: 'Parse Invoice Fields', x: 600, y: 180, config: { fields: ['Invoice', 'Amount', 'Date', 'GST'] } },
            { id: 'n6', type: 'Validate Data', label: 'Verify PO Match', x: 410, y: 180, config: { rule: 'Amount > 0 AND PO != null' } },
            { id: 'n7', type: 'Database Insert', label: 'Push to PostgreSQL', x: 220, y: 180, config: { table: 'erp_invoices' } },
            { id: 'n8', type: 'Send Email', label: 'Notify Accounts Team', x: 50, y: 180, config: { recipient: 'accounts@dvjgroup.ai' } },
            { id: 'n9', type: 'End', label: 'Finish Workflow', x: 50, y: 310, config: {} }
        ]
    },
    {
        id: 'WF-102',
        name: 'PO Email Scraping Pipeline',
        category: 'Email & File RPA',
        blockCount: 6,
        created: '2026-02-20',
        status: 'Active',
        blocks: [
            { id: 'n1', type: 'Start', label: 'Trigger Event', x: 50, y: 60, config: {} },
            { id: 'n2', type: 'Read Email', label: 'Scan Outlook Orders', x: 230, y: 60, config: {} },
            { id: 'n3', type: 'Read Excel', label: 'Parse Master PO List', x: 420, y: 60, config: {} },
            { id: 'n4', type: 'Decision', label: 'Valid Vendor?', x: 420, y: 200, config: {} },
            { id: 'n5', type: 'Database Update', label: 'Update DB Orders', x: 230, y: 200, config: {} },
            { id: 'n6', type: 'End', label: 'Task Complete', x: 50, y: 200, config: {} }
        ]
    }
];

export const INITIAL_JOBS = [
    { id: 'JOB-901', botName: 'Invoice Processing Bot', workflowName: 'ERP Invoice Automation', status: 'COMPLETED', duration: '4.2s', itemsProcessed: 14, timestamp: '2026-03-01 16:40' },
    { id: 'JOB-902', botName: 'Email Attachment Scraper', workflowName: 'PO Email Scraping Pipeline', status: 'COMPLETED', duration: '1.8s', itemsProcessed: 5, timestamp: '2026-03-01 16:35' },
    { id: 'JOB-903', botName: 'Database Sync Robot', workflowName: 'PostgreSQL-MongoDB Sync', status: 'RUNNING', duration: '12.4s', itemsProcessed: 180, timestamp: '2026-03-01 16:44' },
    { id: 'JOB-904', botName: 'Excel Financial Auditor', workflowName: 'Quarterly Ledger Reconciler', status: 'FAILED', duration: '0.6s', itemsProcessed: 0, timestamp: '2026-03-01 15:10', error: 'Missing column header: GST_Tax_ID' }
];

export const INITIAL_LOGS = [
    { id: 1, timestamp: '16:44:12', level: 'INFO', botId: 'BOT-04', message: 'Database Sync Robot initiated batch transfer of 200 records.' },
    { id: 2, timestamp: '16:42:05', level: 'SUCCESS', botId: 'BOT-01', message: 'Invoice Processing Bot completed extraction for INV-2026-889. GST matched.' },
    { id: 3, timestamp: '16:38:19', level: 'WARN', botId: 'BOT-02', message: 'Attachment scan detected unverified PDF encoding. Retrying via Tesseract engine.' },
    { id: 4, timestamp: '15:10:44', level: 'ERROR', botId: 'BOT-04', message: 'Quarterly Ledger Reconciler failed: Column GST_Tax_ID missing in Ledger_Q1.xlsx' }
];

export const INITIAL_SCHEDULES = [
    { id: 'SCH-01', workflowName: 'ERP Invoice Automation', botName: 'Invoice Processing Bot', cron: '*/15 * * * *', nextRun: 'In 6 mins', status: 'ACTIVE' },
    { id: 'SCH-02', workflowName: 'PO Email Scraping Pipeline', botName: 'Email Attachment Scraper', cron: '0 * * * *', nextRun: 'In 16 mins', status: 'ACTIVE' },
    { id: 'SCH-03', workflowName: 'PostgreSQL-MongoDB Sync', botName: 'Database Sync Robot', cron: '*/5 * * * *', nextRun: 'In 1 min', status: 'ACTIVE' }
];

export const WORKFLOW_BLOCK_TYPES = [
    { type: 'Start', icon: '🚀', category: 'Control', color: '#10b981' },
    { type: 'Read Email', icon: '📩', category: 'Email', color: '#3b82f6' },
    { type: 'Download Attachment', icon: '📎', category: 'Email', color: '#3b82f6' },
    { type: 'Read Excel', icon: '📊', category: 'Data', color: '#10b981' },
    { type: 'Read PDF', icon: '📄', category: 'Document', color: '#ef4444' },
    { type: 'OCR', icon: '🔍', category: 'AI & Vision', color: '#8b5cf6' },
    { type: 'Extract Data', icon: '🧩', category: 'Data', color: '#ec4899' },
    { type: 'Validate Data', icon: '🛡️', category: 'Logic', color: '#f59e0b' },
    { type: 'Decision', icon: '🔀', category: 'Logic', color: '#f59e0b' },
    { type: 'Loop', icon: '🔄', category: 'Logic', color: '#f59e0b' },
    { type: 'API Call', icon: '🌐', category: 'Integration', color: '#06b6d4' },
    { type: 'Database Insert', icon: '📥', category: 'Database', color: '#6366f1' },
    { type: 'Database Update', icon: '📤', category: 'Database', color: '#6366f1' },
    { type: 'Move File', icon: '📁', category: 'File', color: '#64748b' },
    { type: 'Rename File', icon: '✏️', category: 'File', color: '#64748b' },
    { type: 'Send Email', icon: '📤', category: 'Email', color: '#3b82f6' },
    { type: 'Generate Report', icon: '📑', category: 'Report', color: '#84cc16' },
    { type: 'End', icon: '🏁', category: 'Control', color: '#ef4444' }
];

// Helper API Fetcher with Fallback
export async function apiFetch(endpoint, options = {}) {
    try {
        const res = await fetch(endpoint, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (err) {
        console.warn(`API call to ${endpoint} failed, utilizing local engine fallback:`, err.message);
    }
    return null;
}
