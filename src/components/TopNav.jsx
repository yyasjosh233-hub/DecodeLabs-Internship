import React, { useState } from 'react';

const TopNav = ({ toggleSidebar, activeProject }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'WARNING', msg: 'AGRO-R1: Wheel slip detected in Sector 4 (12% slip rate).', time: '2m ago' },
        { id: 2, type: 'INFO', msg: 'ROS 2: Node /isaac_visual_slam fully synchronized.', time: '5m ago' },
        { id: 3, type: 'SAFETY', msg: 'Estop validation test completed. Diagnostics clear.', time: '10m ago' }
    ]);

    const handleSearch = (e) => {
        e.preventDefault();
        alert(`Search initiated for: "${searchQuery}" in active workspace.`);
    };

    const clearNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <header className="platform-topnav">
            <div className="topnav-left">
                <button className="mobile-sidebar-toggle" onClick={toggleSidebar}>
                    ☰
                </button>
                <form onSubmit={handleSearch} className="global-search-form">
                    <span className="search-icon">🔍</span>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search logs, nodes, topics, TF frames or RAG docs..." 
                        className="global-search-input"
                    />
                </form>
            </div>

            <div className="topnav-right">
                {/* Robot Status Widget */}
                <div className="robot-status-widget">
                    <div className="status-dot online"></div>
                    <span className="robot-name">AGRO-R1</span>
                    <span className="status-badge">ONLINE</span>
                    <div className="divider"></div>
                    <span className="hz-badge">ROS 2: HEALTHY</span>
                    <span className="ping-badge">92ms</span>
                </div>

                {/* Notifications Center */}
                <div className="notifications-container">
                    <button 
                        className="btn-icon topnav-btn" 
                        onClick={() => setShowNotifications(!showNotifications)}
                        title="Alerts Center"
                    >
                        🔔
                        {notifications.length > 0 && (
                            <span className="notification-count">{notifications.length}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="notifications-dropdown glass">
                            <div className="dropdown-header">
                                <h3>SYSTEM NOTIFICATIONS</h3>
                                <span className="active-count">{notifications.length} Active</span>
                            </div>
                            <ul className="notification-list">
                                {notifications.length === 0 ? (
                                    <li className="empty-notifications">No active alerts. Hardware nominal.</li>
                                ) : (
                                    notifications.map(n => (
                                        <li key={n.id} className={`notification-item ${n.type.toLowerCase()}`}>
                                            <div className="item-content">
                                                <span className="item-tag">{n.type}</span>
                                                <p>{n.msg}</p>
                                                <span className="item-time">{n.time}</span>
                                            </div>
                                            <button 
                                                className="btn-close-notification" 
                                                onClick={() => clearNotification(n.id)}
                                            >
                                                &times;
                                            </button>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                {/* User Profile */}
                <div className="user-profile-widget">
                    <div className="avatar-badge">OP</div>
                    <div className="user-details">
                        <span className="user-name">Operator_01</span>
                        <span className="user-role">Lead Roboticist</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNav;
