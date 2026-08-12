import React, { useState, useEffect } from 'react';
import './shared/RPAStyles.css';

import {
    INITIAL_BOTS,
    INITIAL_WORKFLOWS,
    INITIAL_JOBS,
    INITIAL_LOGS,
    INITIAL_SCHEDULES,
    apiFetch
} from './shared/rpaEngine';

import RPADashboard from './dashboard/RPADashboard';
import WorkflowDesigner from './workflow/WorkflowDesigner';
import BotManager from './bots/BotManager';
import TaskScheduler from './scheduler/TaskScheduler';
import DocumentProcessing from './automation/DocumentProcessing';
import EmailAutomation from './automation/EmailAutomation';
import ExcelAutomation from './automation/ExcelAutomation';
import PDFAutomation from './automation/PDFAutomation';
import DatabaseAutomation from './automation/DatabaseAutomation';
import FileAutomation from './automation/FileAutomation';
import OCRModule from './automation/OCRModule';
import AIFeatures from './automation/AIFeatures';
import RPAReports from './reports/RPAReports';
import RPAAnalytics from './analytics/RPAAnalytics';
import RPASettings from './shared/RPASettings';
import RPALogs from './shared/RPALogs';

const RPAPage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [bots, setBots] = useState(INITIAL_BOTS);
    const [workflows, setWorkflows] = useState(INITIAL_WORKFLOWS);
    const [jobs, setJobs] = useState(INITIAL_JOBS);
    const [logs, setLogs] = useState(INITIAL_LOGS);
    const [schedules, setSchedules] = useState(INITIAL_SCHEDULES);
    const [notifications, setNotifications] = useState(3);

    // Initial API Sync
    useEffect(() => {
        const syncData = async () => {
            const apiBots = await apiFetch('/api/rpa/bots');
            if (apiBots && Array.isArray(apiBots) && apiBots.length > 0) setBots(apiBots);

            const apiWorkflows = await apiFetch('/api/rpa/workflows');
            if (apiWorkflows && Array.isArray(apiWorkflows) && apiWorkflows.length > 0) {
                const mergedWfs = apiWorkflows.map(w => {
                    const localMatch = INITIAL_WORKFLOWS.find(iw => iw.id === w.id);
                    return { ...w, blocks: (w.blocks && w.blocks.length > 0) ? w.blocks : (localMatch ? localMatch.blocks : []) };
                });
                setWorkflows(mergedWfs);
            }

            const apiJobs = await apiFetch('/api/rpa/jobs');
            if (apiJobs && Array.isArray(apiJobs) && apiJobs.length > 0) setJobs(apiJobs);

            const apiLogs = await apiFetch('/api/rpa/logs');
            if (apiLogs && Array.isArray(apiLogs) && apiLogs.length > 0) setLogs(apiLogs);

            const apiSchedules = await apiFetch('/api/rpa/scheduler');
            if (apiSchedules && Array.isArray(apiSchedules) && apiSchedules.length > 0) setSchedules(apiSchedules);
        };
        syncData();
    }, []);

    // Handlers
    const handleUpdateBotStatus = (botId, newStatus) => {
        setBots(bots.map(b => b.id === botId ? { ...b, status: newStatus } : b));
        apiFetch(`/api/rpa/bots/${botId}/action`, { method: 'POST', body: JSON.stringify({ action: newStatus.toLowerCase() }) });
    };

    const handleCreateBot = (newBot) => {
        const botObj = {
            id: `BOT-0${bots.length + 1}`,
            name: newBot.name,
            status: 'IDLE',
            workflow: newBot.workflow,
            assignedTasks: 0,
            successRate: 100.0,
            cpu: 0,
            memory: 120,
            lastRun: 'Just created'
        };
        setBots([...bots, botObj]);
        apiFetch('/api/rpa/bots', { method: 'POST', body: JSON.stringify(botObj) });
    };

    const handleDeleteBot = (botId) => {
        setBots(bots.filter(b => b.id !== botId));
        apiFetch(`/api/rpa/bots/${botId}`, { method: 'DELETE' });
    };

    const handleSaveWorkflow = (newWf) => {
        const wfObj = {
            id: `WF-${Date.now().toString().slice(-3)}`,
            name: newWf.name,
            category: 'Custom Flow',
            blockCount: newWf.blocks.length,
            created: new Date().toISOString().split('T')[0],
            status: 'Active',
            blocks: newWf.blocks
        };
        setWorkflows([wfObj, ...workflows]);
        apiFetch('/api/rpa/workflows', { method: 'POST', body: JSON.stringify(wfObj) });
        alert(`Workflow "${newWf.name}" saved successfully!`);
    };

    const handleAddSchedule = (sch) => {
        const schObj = {
            id: `SCH-0${schedules.length + 1}`,
            ...sch
        };
        setSchedules([...schedules, schObj]);
        apiFetch('/api/rpa/scheduler', { method: 'POST', body: JSON.stringify(schObj) });
    };

    const handleToggleSchedule = (schId) => {
        setSchedules(schedules.map(s => s.id === schId ? { ...s, status: s.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : s));
    };

    const tabs = [
        { id: 'dashboard', label: 'RPA Dashboard', icon: '📊' },
        { id: 'workflow', label: 'Workflow Designer', icon: '🎨' },
        { id: 'bots', label: 'Bot Manager', icon: '🤖' },
        { id: 'scheduler', label: 'Task Scheduler', icon: '⏱️' },
        { id: 'document', label: 'Document Processing', icon: '📄' },
        { id: 'email', label: 'Email Automation', icon: '📧' },
        { id: 'excel', label: 'Excel Automation', icon: '📈' },
        { id: 'pdf', label: 'PDF Automation', icon: '📃' },
        { id: 'database', label: 'Database Automation', icon: '🗄️' },
        { id: 'file', label: 'File Automation', icon: '📁' },
        { id: 'ocr', label: 'OCR Engine', icon: '🔍' },
        { id: 'ai', label: 'AI Features', icon: '🧠' },
        { id: 'reports', label: 'Reports', icon: '📑' },
        { id: 'analytics', label: 'Analytics', icon: '📉' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
        { id: 'logs', label: 'Logs Console', icon: '📜' }
    ];

    return (
        <div className="rpa-container">
            {/* Header Banner */}
            <div className="rpa-header-card">
                <div className="rpa-title-group">
                    <h1>
                        Industrial Robotic Process Automation Platform
                    </h1>
                    <p>Enterprise Workflow Automation, Intelligent OCR & Bot Control</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="rpa-badge-accent">Industrial RPA Module</span>
                    <button className="rpa-btn rpa-btn-sm" onClick={() => setNotifications(0)}>
                        🔔 Notifications ({notifications})
                    </button>
                </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="rpa-tabs-container">
                {tabs.map(t => (
                    <button 
                        key={t.id}
                        className={`rpa-tab-btn ${activeTab === t.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(t.id)}
                    >
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab View Content Rendering */}
            <div className="rpa-tab-content">
                {activeTab === 'dashboard' && <RPADashboard bots={bots} jobs={jobs} logs={logs} onQuickAction={setActiveTab} />}
                {activeTab === 'workflow' && <WorkflowDesigner workflows={workflows} onSaveWorkflow={handleSaveWorkflow} />}
                {activeTab === 'bots' && <BotManager bots={bots} onUpdateBotStatus={handleUpdateBotStatus} onCreateBot={handleCreateBot} onDeleteBot={handleDeleteBot} />}
                {activeTab === 'scheduler' && <TaskScheduler schedules={schedules} onAddSchedule={handleAddSchedule} onToggleSchedule={handleToggleSchedule} />}
                {activeTab === 'document' && <DocumentProcessing />}
                {activeTab === 'email' && <EmailAutomation />}
                {activeTab === 'excel' && <ExcelAutomation />}
                {activeTab === 'pdf' && <PDFAutomation />}
                {activeTab === 'database' && <DatabaseAutomation />}
                {activeTab === 'file' && <FileAutomation />}
                {activeTab === 'ocr' && <OCRModule />}
                {activeTab === 'ai' && <AIFeatures />}
                {activeTab === 'reports' && <RPAReports bots={bots} jobs={jobs} logs={logs} />}
                {activeTab === 'analytics' && <RPAAnalytics bots={bots} jobs={jobs} />}
                {activeTab === 'settings' && <RPASettings />}
                {activeTab === 'logs' && <RPALogs logs={logs} />}
            </div>
        </div>
    );
};

export default RPAPage;
