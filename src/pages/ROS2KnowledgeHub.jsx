import React, { useState } from 'react';

const ROS2KnowledgeHub = () => {
    const [activeSection, setActiveSection] = useState('fundamentals');
    const [selectedTopic, setSelectedTopic] = useState(null);

    const sections = {
        fundamentals: {
            title: 'ROS 2 Fundamentals',
            topics: [
                {
                    title: 'Nodes & Graph Architecture',
                    definition: 'A Node in ROS 2 is a single executable responsible for a modular compute task. Nodes form a graph and coordinate actions asynchronously.',
                    desc: 'Nodes act as independent processes. By isolating functionalities (e.g. one node parses lidar ranges, another plans paths), the robot gains fault tolerance. If one sensor crashes, the other nodes survive.',
                    cmd: 'ros2 node list\nros2 node info /my_node',
                    code_py: 'import rclpy\nfrom rclpy.node import Node\n\nclass MyNode(Node):\n    def __init__(self):\n        super().__init__("my_node")\n        self.get_logger().info("Node initiated!")\n\ndef main():\n    rclpy.init()\n    rclpy.spin(MyNode())\n    rclpy.shutdown()',
                    mistakes: 'Initializing multiple nodes with the exact same name in a single environment namespace. This causes graph naming collisions.',
                    interview: 'Q: What is the benefit of node composition in ROS 2?\nA: Node composition allows multiple nodes to be run within a single OS process, reducing memory copy latency between publishers and subscribers via intra-process communication.',
                    sources: ['ROS 2 Nodes Guide']
                },
                {
                    title: 'Topics (Publish/Subscribe)',
                    definition: 'Topics carry messages asynchronously between publishers and subscribers using a many-to-many model.',
                    desc: 'Topics are the primary communication channels. Publishers broadcast data on a topic name without knowing who is listening, and subscribers receive messages automatically when they are published.',
                    cmd: 'ros2 topic list\nros2 topic echo /cmd_vel\nros2 topic hz /scan',
                    code_py: '# Publisher creation snippet\nself.pub = self.create_publisher(String, "chat", 10)\nself.pub.publish(String(data="Hello"))',
                    mistakes: 'Publishing high-frequency large messages (like cameras raw streams) over standard DDS without tuning queues, leading to massive memory bloat.',
                    interview: 'Q: Explain the difference between Topics and Services.\nA: Topics are asynchronous, continuous one-way data streams. Services are synchronous request-reply cycles designed for short transactions.',
                    sources: ['ROS 2 Topics Guide']
                }
            ]
        },
        communication: {
            title: 'Communication & QoS',
            topics: [
                {
                    title: 'QoS (Quality of Service)',
                    definition: 'QoS parameters define how ROS 2 manages DDS middleware queue reliability, lifespan, and compatibility.',
                    desc: 'Key parameters: 1. Reliability (Reliable vs Best Effort). 2. Durability (Transient Local vs Volatile). 3. History Depth. For connection success, a subscriber requesting Reliable requires a Reliable publisher. If the publisher is Best Effort, they fail to connect.',
                    cmd: 'ros2 topic info --show-details /scan',
                    code_py: 'from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy\n\nprofile = QoSProfile(\n    depth=5,\n    reliability=ReliabilityPolicy.BEST_EFFORT,\n    durability=DurabilityPolicy.VOLATILE\n)',
                    mistakes: 'Mismatched QoS settings causing a subscriber to silently receive zero messages while the topic is actively publishing.',
                    interview: 'Q: What is Durability Policy in ROS 2 QoS?\nA: Durability determines if messages are cached for late-joining subscribers. Transient Local stores past messages; Volatile discards them immediately.',
                    sources: ['QoS Settings Official Reference']
                }
            ]
        },
        development: {
            title: 'Development Workspaces',
            topics: [
                {
                    title: 'Workspace Overlay & colcon',
                    definition: 'A workspace is a structured directory layout containing your package source files, compiled assets, and source setup links.',
                    desc: 'Workspaces are compiled using the colcon tool. Sourcing the base ROS distro creates an underlay. Sourcing your compile folder installs an overlay, letting you override default package versions.',
                    cmd: 'colcon build --symlink-install\nsource install/setup.bash',
                    code_py: '# package.xml depend tag\n<depend>rclpy</depend>\n<depend>std_msgs</depend>',
                    mistakes: 'Forgetting to source the workspace setup file ("source install/setup.bash") after colcon build, leading to package-not-found run errors.',
                    interview: 'Q: What does --symlink-install do during colcon build?\nA: It links Python source files instead of copying them to install, allowing changes to be tested immediately without recompiling.',
                    sources: ['colcon Compilation Guide']
                }
            ]
        }
    };

    const activeList = sections[activeSection]?.topics || [];
    const currentTopic = selectedTopic || activeList[0];

    return (
        <div className="ros2-hub-page page-container">
            <h1 className="page-title">ROS 2 Engineering Knowledge Hub</h1>
            <p className="page-description">
                Explore the complete technical guidelines for ROS 2 graph communications, Quality of Service (QoS) specifications, and troubleshooting.
            </p>

            <div className="knowledge-hub-layout">
                {/* Left navigation column */}
                <aside className="knowledge-hub-sidebar glass">
                    <div className="section-tabs">
                        {Object.keys(sections).map(key => (
                            <button 
                                key={key}
                                onClick={() => {
                                    setActiveSection(key);
                                    setSelectedTopic(null); // Reset select to first item
                                }}
                                className={`btn-section-tab ${activeSection === key ? 'active' : ''}`}
                            >
                                {sections[key].title}
                            </button>
                        ))}
                    </div>

                    <div className="topics-list-container">
                        <h4>TOPICS</h4>
                        <ul className="topics-list">
                            {activeList.map((t, idx) => (
                                <li 
                                    key={idx}
                                    onClick={() => setSelectedTopic(t)}
                                    className={`topic-list-item ${currentTopic?.title === t.title ? 'active' : ''}`}
                                >
                                    {t.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Right content viewport */}
                <main className="knowledge-hub-content glass">
                    {currentTopic ? (
                        <div className="topic-detail-view">
                            <h2>{currentTopic.title}</h2>
                            <div className="topic-definition-box">
                                <strong>DEFINITION</strong>
                                <p>{currentTopic.definition}</p>
                            </div>

                            <div className="topic-section">
                                <h3>Technical Overview</h3>
                                <p>{currentTopic.desc}</p>
                            </div>

                            <div className="topic-section">
                                <h3>CLI Terminal Commands</h3>
                                <pre className="terminal-code">
                                    <code>{currentTopic.cmd}</code>
                                </pre>
                            </div>

                            {currentTopic.code_py && (
                                <div className="topic-section">
                                    <h3>Python Code Implementation</h3>
                                    <pre className="source-code-block">
                                        <code>{currentTopic.code_py}</code>
                                    </pre>
                                </div>
                            )}

                            <div className="topic-grid-mismatches">
                                <div className="mismatch-box error">
                                    <h4>⚠️ COMMON DEVELOPER MISTAKES</h4>
                                    <p>{currentTopic.mistakes}</p>
                                </div>
                                <div className="mismatch-box info">
                                    <h4>📋 TECHNICAL INTERVIEW PREPARATION</h4>
                                    <p>{currentTopic.interview}</p>
                                </div>
                            </div>

                            <div className="topic-sources-tray">
                                <strong>VERIFIED REFERENCE:</strong>
                                {currentTopic.sources.map((s, idx) => (
                                    <span key={idx} className="source-tag-bubble">{s}</span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-topic-state">Select a topic from the sidebar list.</div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ROS2KnowledgeHub;
