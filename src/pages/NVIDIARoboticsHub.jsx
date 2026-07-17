import React from 'react';
import RoboticsImage from '../components/RoboticsImage';

const NVIDIARoboticsHub = () => {
    const benchmarks = [
        { task: 'Visual SLAM tracking', cpu: '45ms (22 Hz)', gpu: '1.2ms (833 Hz)', speedup: '37x' },
        { task: 'DNN Crop Object Detection', cpu: '110ms (9 Hz)', gpu: '4.5ms (222 Hz)', speedup: '24x' },
        { task: 'Stereo Depth Map generation', cpu: '82ms (12 Hz)', gpu: '3.1ms (322 Hz)', speedup: '26x' },
        { task: 'Point Cloud 3D Segmentation', cpu: '190ms (5 Hz)', gpu: '8.0ms (125 Hz)', speedup: '23x' }
    ];

    return (
        <div className="nvidia-hub-page page-container">
            <h1 className="page-title">NVIDIA Robotics & Physical AI Hub</h1>
            <p className="page-description">
                Leverage GPU-accelerated perception pipelines, Isaac simulation tools, and NVIDIA Jetson edge compute frameworks for autonomous systems.
            </p>

            {/* Architecture Pipeline Visual */}
            <div className="architecture-panel glass">
                <h3>GPU-ACCELERATED PERCEPTION & DECISION PIPELINE</h3>
                <div className="pipeline-flow-container">
                    <div className="pipeline-node sensor">
                        <span className="node-icon">📷</span>
                        <div className="node-text">
                            <strong>Robot Sensors</strong>
                            <p>RealSense D435i / LiDAR</p>
                        </div>
                    </div>
                    <div className="pipeline-arrow">➔</div>
                    
                    <div className="pipeline-node ros2">
                        <span className="node-icon">🔄</span>
                        <div className="node-text">
                            <strong>ROS 2 DDS Nodes</strong>
                            <p>Publishing Image raw streams</p>
                        </div>
                    </div>
                    <div className="pipeline-arrow">➔</div>
                    
                    <div className="pipeline-node isaac">
                        <span className="node-icon">🟢</span>
                        <div className="node-text">
                            <strong>Isaac ROS GPU Acceleration</strong>
                            <p>CUDA Stereo SLAM / TensorRT</p>
                        </div>
                    </div>
                    <div className="pipeline-arrow">➔</div>
                    
                    <div className="pipeline-node compute">
                        <span className="node-icon">💻</span>
                        <div className="node-text">
                            <strong>Jetson AGX Orin</strong>
                            <p>275 TOPS Edge AI Compute</p>
                        </div>
                    </div>
                    <div className="pipeline-arrow">➔</div>
                    
                    <div className="pipeline-node actuator">
                        <span className="node-icon">🚜</span>
                        <div className="node-text">
                            <strong>Actuation</strong>
                            <p>Nav2 speed outputs (cmd_vel)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submodules details */}
            <div className="nvidia-submodules-grid">
                
                {/* Isaac ROS */}
                <div className="hub-module-card glass">
                    <div className="module-img-container">
                        <RoboticsImage imageKey="jetson" category="NVIDIA Hardware" />
                    </div>
                    <div className="module-content">
                        <div className="module-badge">GPU PERCEPTION</div>
                        <h3>NVIDIA Isaac ROS</h3>
                        <p>
                            Isaac ROS provides hardware-accelerated packages for image processing, stereo visual odometry, and deep neural network inference.
                            By offloading dense matrix computations directly to Jetson CUDA cores, nodes run visual slam models at high frequencies with minimal CPU overhead.
                        </p>
                        <ul>
                            <li><strong>Isaac ROS Visual SLAM</strong>: GPU visual tracking using stereo cameras.</li>
                            <li><strong>TensorRT DNN Inference</strong>: Accelerated weed and crop semantic segmentation.</li>
                        </ul>
                    </div>
                </div>

                {/* Isaac Sim */}
                <div className="hub-module-card glass">
                    <div className="module-img-container">
                        <RoboticsImage imageKey="humanoid" category="Simulation" />
                    </div>
                    <div className="module-content">
                        <div className="module-badge">PHYSICS SIMULATION</div>
                        <h3>NVIDIA Isaac Sim</h3>
                        <p>
                            Isaac Sim is a photorealistic robot simulation platform built on Omniverse. It enables developers to test robot navigation policies in physics-accurate digital twin workspaces.
                            Workflows feature **Domain Randomization** (varying friction, illumination, and actuator joint noise) to guarantee successful sim-to-real transfer onto active farm fields.
                        </p>
                        <ul>
                            <li><strong>Omniverse Replicator</strong>: Synthetic camera image generation with automatic bounding labeling.</li>
                            <li><strong>ROS 2 Action Graphs</strong>: Bridge virtual sensors directly to active ROS nodes.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Benchmark comparison card */}
            <div className="dashboard-card glass" style={{ marginTop: '2.5rem' }}>
                <div className="card-header">
                    <h3>PERFORMANCE BENCHMARKS: CPU VS NVIDIA GPU ACCELERATION</h3>
                    <span className="live-pulse-label">ORIN AGX STABLE</span>
                </div>
                <div className="table-responsive">
                    <table className="engineering-table">
                        <thead>
                            <tr>
                                <th>Compute Task</th>
                                <th>CPU Baseline (6-Core ARM)</th>
                                <th>NVIDIA GPU (AGX Orin CUDA)</th>
                                <th>Performance Gain</th>
                            </tr>
                        </thead>
                        <tbody>
                            {benchmarks.map((b, idx) => (
                                <tr key={idx}>
                                    <td><strong>{b.task}</strong></td>
                                    <td>{b.cpu}</td>
                                    <td style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{b.gpu}</td>
                                    <td className="speedup-col">{b.speedup} Speedup</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="topic-sources-tray" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                    <strong>Verify specifications:</strong> Reference NVIDIA Isaac ROS benchmark logs [1]. GPU acceleration values tested on Jetson AGX Orin 64GB under standard 50W Max-Power profile constraints.
                </div>
            </div>
        </div>
    );
};

export default NVIDIARoboticsHub;
