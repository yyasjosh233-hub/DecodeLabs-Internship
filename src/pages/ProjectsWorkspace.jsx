import React, { useState } from 'react';

const ProjectsWorkspace = () => {
    const [projects, setProjects] = useState([
        { id: 'agro_r1', name: 'AGRO-R1 Vineyard Spraying', task: 'Crop Weed Inspection & Spot Spraying', nodes: 8, status: 'Active' },
        { id: 'warehouse_amr', name: 'Warehouse AMR Logistics Fleet', task: 'Pallet cargo transport planning', nodes: 14, status: 'Idle' },
        { id: 'cobot_arm', name: '6-DoF Industrial Assembly Cobot', task: 'Delicate parts sorting & pick-and-place', nodes: 6, status: 'Offline' }
    ]);

    const [selectedProject, setSelectedProject] = useState(projects[0]);
    const [launchFile, setLaunchFile] = useState(
        `# base_launch.py\nfrom launch import LaunchDescription\nfrom launch_ros.actions import Node\n\ndef generate_launch_description():\n    return LaunchDescription([\n        Node(\n            package='agro_control',\n            executable='rover_driver',\n            name='agro_driver_node',\n            parameters=[{'max_speed': 1.5}]\n        )\n    ])`
    );

    return (
        <div className="projects-workspace-page page-container">
            <h1 className="page-title">Projects & Launches Workspace</h1>
            <p className="page-description">Manage active robotic deployments, launch setup parameters, and config files for different hardware fleets.</p>

            <div className="debugger-layout-grid">
                {/* List Projects */}
                <div className="debugger-form-panel glass">
                    <h3>ROBOTIC PROJECTS</h3>
                    <ul className="popular-topics-list" style={{ marginTop: '1rem' }}>
                        {projects.map(p => (
                            <li 
                                key={p.id}
                                onClick={() => {
                                    setSelectedProject(p);
                                    if (p.id === 'agro_r1') {
                                        setLaunchFile(`# base_launch.py\nfrom launch import LaunchDescription\nfrom launch_ros.actions import Node\n\ndef generate_launch_description():\n    return LaunchDescription([\n        Node(\n            package='agro_control',\n            executable='rover_driver',\n            name='agro_driver_node',\n            parameters=[{'max_speed': 1.5}]\n        )\n    ])`);
                                    } else {
                                        setLaunchFile(`# warehouse_amr_launch.py\nfrom launch import LaunchDescription\nfrom launch_ros.actions import Node\n\ndef generate_launch_description():\n    return LaunchDescription([\n        Node(\n            package='nav2_bringup',\n            executable='bringup_node',\n            name='nav2_bringup_node',\n            parameters=['/config/amr_nav2_params.yaml']\n        )\n    ])`);
                                    }
                                }}
                                className={selectedProject.id === p.id ? 'active-item' : ''}
                                style={{ cursor: 'pointer', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong>{p.name}</strong>
                                    <span className={`status-badge-lbl ${p.status.toLowerCase()}`}>{p.status}</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#aaa', margin: '0.2rem 0 0 0' }}>{p.task}</p>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => alert('New workspace templates initialization requires file permissions.')} className="btn-submit-debug" style={{ marginTop: '1rem' }}>
                        + Initialize New Project Workspace
                    </button>
                </div>

                {/* View Configuration Launch file */}
                <div className="debugger-result-panel glass">
                    <div className="panel-header-actions">
                        <h3>ACTIVE LAUNCH CODE</h3>
                        <span className="live-pulse-label">READ-ONLY</span>
                    </div>
                    <pre className="source-code-block" style={{ height: '300px', overflowY: 'auto', marginTop: '1rem' }}>
                        <code>{launchFile}</code>
                    </pre>
                    <div className="topic-sources-tray" style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
                        <strong>Active references:</strong> This project operates with {selectedProject.nodes} concurrent ROS 2 nodes in the active overlay.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectsWorkspace;
