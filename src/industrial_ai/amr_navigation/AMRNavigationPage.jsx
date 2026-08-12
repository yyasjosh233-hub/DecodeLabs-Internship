import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    GRID_SIZE,
    DEFAULT_STATIC_MAP,
    manhattanHeuristic,
    generateGlobalCostmap,
    findPathAStar,
    simulateLiDARSweep,
    ekfLocalizationStep
} from './AMRNavEngine';

const AMRNavigationPage = () => {
    // Robot & Goal States
    const [robotPose, setRobotPose] = useState({ x: 1, y: 1, theta: 0 });
    const [goalPose, setGoalPose] = useState({ x: 18, y: 18 });
    const [path, setPath] = useState([]);
    const [pathIndex, setPathIndex] = useState(0);

    // Dynamic Obstacles & Environment
    const [dynamicObstacles, setDynamicObstacles] = useState([
        { x: 9, y: 10 },
        { x: 10, y: 9 }
    ]);
    const [inflationRadius, setInflationRadius] = useState(2);

    // Navigation State Machine
    // States: 'IDLE', 'GOAL_SET', 'PLANNING', 'NAVIGATING', 'DECELERATING', 'REPLANNING', 'GOAL_REACHED', 'EMERGENCY_STOP'
    const [navState, setNavState] = useState('IDLE');
    const [speed, setSpeed] = useState(300); // Step interval ms
    const [statusMessage, setStatusMessage] = useState('System Initialized. Ready to set navigation goal.');

    // Sensor & Localization States
    const [lidarData, setLidarData] = useState([]);
    const [ekfState, setEkfState] = useState({ x: 1, y: 1, theta: 0, covariance: [0.01, 0.01, 0.01] });

    // TF Tree State
    const [tfTree] = useState({
        mapToOdom: { tx: 0, ty: 0, yaw: 0 },
        odomToBaseLink: { tx: 1, ty: 1, yaw: 0 },
        baseLinkToLaser: { tx: 0.2, ty: 0, yaw: 0 }
    });

    // Costmap State
    const [costmap, setCostmap] = useState(() =>
        generateGlobalCostmap(DEFAULT_STATIC_MAP, dynamicObstacles, inflationRadius)
    );

    // Re-generate costmap when static/dynamic obstacles or inflation change
    useEffect(() => {
        setCostmap(generateGlobalCostmap(DEFAULT_STATIC_MAP, dynamicObstacles, inflationRadius));
    }, [dynamicObstacles, inflationRadius]);

    // 1. Plan Path using Custom A* (Manhattan Heuristic)
    const handlePlanPath = useCallback(() => {
        setNavState('PLANNING');
        setStatusMessage('Computing A* Global Path using Manhattan Heuristic & Inflation Costmap...');

        setTimeout(() => {
            const currentCostmap = generateGlobalCostmap(DEFAULT_STATIC_MAP, dynamicObstacles, inflationRadius);
            const computedPath = findPathAStar(robotPose, goalPose, currentCostmap);

            if (computedPath && computedPath.length > 0) {
                setPath(computedPath);
                setPathIndex(0);
                setNavState('GOAL_SET');
                setStatusMessage(`Path successfully planned! Total nodes: ${computedPath.length}. Click 'START NAVIGATION' to begin.`);
            } else {
                setPath([]);
                setNavState('IDLE');
                setStatusMessage('🚨 Path Planning Failed! Target or start position blocked by costmap inflation.');
            }
        }, 300);
    }, [robotPose, goalPose, dynamicObstacles, inflationRadius]);

    // 2. Start Navigation Execution
    const handleStartNavigation = () => {
        if (path.length === 0) return;
        setNavState('NAVIGATING');
        setStatusMessage('🚀 AMR Autonomous Navigation active. Streaming LiDAR & EKF telemetry...');
    };

    // 3. Emergency Stop Trigger
    const handleEmergencyStop = () => {
        setNavState('EMERGENCY_STOP');
        setStatusMessage('🛑 EMERGENCY STOP ACTIVATED! All motor controllers halted.');
    };

    // 4. Inject Dynamic Obstacle & Trigger Dynamic Re-planning
    const handleInjectDynamicObstacle = () => {
        if (path.length === 0 || pathIndex >= path.length - 1) return;

        // Place obstacle directly in front on current path
        const nextNode = path[Math.min(pathIndex + 2, path.length - 1)];
        if (!nextNode) return;

        const newObs = { x: nextNode.x, y: nextNode.y };
        setDynamicObstacles(prev => [...prev, newObs]);
        setNavState('DECELERATING');
        setStatusMessage(`⚠️ Dynamic obstacle detected at grid (${newObs.x}, ${newObs.y})! Decelerating AMR...`);

        // Trigger dynamic re-planning after deceleration delay
        setTimeout(() => {
            setNavState('REPLANNING');
            setStatusMessage('🔄 Dynamic Re-planning initiated! Re-calculating A* trajectory around new obstacle...');

            setTimeout(() => {
                const updatedCostmap = generateGlobalCostmap(DEFAULT_STATIC_MAP, [...dynamicObstacles, newObs], inflationRadius);
                const currentCell = { x: Math.round(robotPose.x), y: Math.round(robotPose.y) };
                const newPath = findPathAStar(currentCell, goalPose, updatedCostmap);

                if (newPath) {
                    setPath(newPath);
                    setPathIndex(0);
                    setNavState('NAVIGATING');
                    setStatusMessage('✅ New path computed! Navigation resumed seamlessly.');
                } else {
                    setNavState('EMERGENCY_STOP');
                    setStatusMessage('🚨 Dynamic re-planning failed! No safe path exists. Motor halted.');
                }
            }, 500);
        }, 600);
    };

    // 5. Reset Simulation
    const handleReset = () => {
        setRobotPose({ x: 1, y: 1, theta: 0 });
        setGoalPose({ x: 18, y: 18 });
        setPath([]);
        setPathIndex(0);
        setDynamicObstacles([{ x: 9, y: 10 }, { x: 10, y: 9 }]);
        setNavState('IDLE');
        setStatusMessage('System Reset. Select a goal point or click Plan Path.');
    };

    // Main Navigation Loop & Simulation Step
    useEffect(() => {
        if (navState !== 'NAVIGATING') return;

        const interval = setInterval(() => {
            if (pathIndex >= path.length - 1) {
                setNavState('GOAL_REACHED');
                setStatusMessage('🎯 Goal Position Reached Successfully! EKF pose locked.');
                return;
            }

            const current = path[pathIndex];
            const next = path[pathIndex + 1];

            // Check if next step is blocked by dynamic obstacle
            const isBlocked = dynamicObstacles.some(obs => obs.x === next.x && obs.y === next.y);
            if (isBlocked) {
                handleInjectDynamicObstacle();
                return;
            }

            // Move Robot to next step
            const dx = next.x - current.x;
            const dy = next.y - current.y;
            const theta = Math.atan2(dy, dx);

            const updatedPose = { x: next.x, y: next.y, theta };
            setRobotPose(updatedPose);
            setPathIndex(prev => prev + 1);

            // LiDAR Raycasting Sweep
            const rays = simulateLiDARSweep(updatedPose, costmap);
            setLidarData(rays);

            // EKF Localization Step
            const ekfUpdate = ekfLocalizationStep(ekfState, { dx, dy, dTheta: 0.05 }, rays);
            setEkfState(ekfUpdate);
        }, speed);

        return () => clearInterval(interval);
    }, [navState, path, pathIndex, dynamicObstacles, costmap, speed, ekfState]);

    // Handle canvas click to set Goal Position
    const handleGridClick = (x, y) => {
        if (DEFAULT_STATIC_MAP[y][x] === 100) return; // Cannot set goal inside wall
        setGoalPose({ x, y });
        setNavState('IDLE');
        setStatusMessage(`Goal set to Coordinates (X: ${x}, Y: ${y}). Click 'PLAN PATH' to calculate route.`);
    };

    return (
        <div className="amr-navigation-page page-container" style={{ padding: '2rem', color: '#fff' }}>
            <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2rem', color: '#38BDF8', margin: '0 0 0.5rem 0' }}>
                    🤖 Autonomous Mobile Robot (AMR) Navigation Simulator
                </h1>
                <p style={{ color: '#94A3B8' }}>
                    Custom A* Pathfinding (Manhattan Heuristic), EKF Localization, LiDAR Sweeps, Costmap Inflation, & Dynamic Obstacle Avoidance.
                </p>
            </div>

            {/* Workflow Action Control Bar */}
            <div className="control-bar glass" style={{
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: '1.5rem'
            }}>
                <button
                    className="btn"
                    onClick={handlePlanPath}
                    disabled={navState === 'NAVIGATING'}
                    style={{ background: '#0284C7', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    1. PLAN PATH (A*)
                </button>

                <button
                    className="btn"
                    onClick={handleStartNavigation}
                    disabled={path.length === 0 || navState === 'NAVIGATING'}
                    style={{ background: '#10B981', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    2. START NAVIGATION
                </button>

                <button
                    className="btn"
                    onClick={handleInjectDynamicObstacle}
                    disabled={navState !== 'NAVIGATING'}
                    style={{ background: '#F59E0B', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    ⚠️ SPAWN DYNAMIC OBSTACLE
                </button>

                <button
                    className="btn"
                    onClick={handleEmergencyStop}
                    style={{ background: '#EF4444', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    🛑 EMERGENCY STOP
                </button>

                <button
                    className="btn"
                    onClick={handleReset}
                    style={{ background: '#64748B', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    🔄 RESET
                </button>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>SPEED:</span>
                    <input
                        type="range"
                        min="100"
                        max="600"
                        step="50"
                        value={speed}
                        onChange={e => setSpeed(Number(e.target.value))}
                    />
                </div>
            </div>

            {/* Status Alert Banner */}
            <div style={{
                background: navState === 'EMERGENCY_STOP' ? 'rgba(239, 68, 68, 0.2)' : navState === 'GOAL_REACHED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.1)',
                border: `1px solid ${navState === 'EMERGENCY_STOP' ? '#EF4444' : navState === 'GOAL_REACHED' ? '#10B981' : '#38BDF8'}`,
                color: '#F8FAFC',
                padding: '0.8rem 1.2rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontWeight: '600',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <span>STATUS: {statusMessage}</span>
                <span style={{ textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(0,0,0,0.4)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                    STATE: {navState}
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
                {/* Occupancy Grid & Path Canvas Viewport */}
                <div className="glass" style={{ background: '#090d16', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                        <h3 style={{ margin: 0, color: '#38BDF8', fontSize: '1rem' }}>📍 OCCUPANCY GRID & INFLATION COSTMAP (20x20)</h3>
                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Click grid cell to set Goal Point</span>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                        gap: '2px',
                        background: '#040711',
                        padding: '4px',
                        borderRadius: '8px',
                        aspectRatio: '1/1',
                        maxHeight: '520px'
                    }}>
                        {Array.from({ length: GRID_SIZE }).map((_, r) =>
                            Array.from({ length: GRID_SIZE }).map((_, c) => {
                                const isRobot = robotPose.x === c && robotPose.y === r;
                                const isGoal = goalPose.x === c && goalPose.y === r;
                                const isPath = path.some(p => p.x === c && p.y === r);
                                const isStaticWall = DEFAULT_STATIC_MAP[r][c] === 100;
                                const isDynamicObs = dynamicObstacles.some(d => d.x === c && d.y === r);
                                const cellCost = costmap[r][c];

                                let cellBg = '#0b1329';
                                if (isStaticWall) cellBg = '#334155';
                                else if (isDynamicObs) cellBg = '#EF4444';
                                else if (isRobot) cellBg = '#38BDF8';
                                else if (isGoal) cellBg = '#10B981';
                                else if (isPath) cellBg = 'rgba(56, 189, 248, 0.4)';
                                else if (cellCost > 0) cellBg = `rgba(245, 158, 11, ${cellCost / 350})`;

                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        onClick={() => handleGridClick(c, r)}
                                        style={{
                                            background: cellBg,
                                            borderRadius: '2px',
                                            cursor: isStaticWall ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            transition: 'background 0.2s'
                                        }}
                                        title={`Cell (${c}, ${r}) Cost: ${cellCost}`}
                                    >
                                        {isRobot ? '🤖' : isGoal ? '🎯' : isDynamicObs ? '⚠️' : ''}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: '1.2rem', marginTop: '1rem', fontSize: '0.85rem', color: '#94A3B8' }}>
                        <span>🤖 AMR Robot</span>
                        <span>🎯 Goal</span>
                        <span>🟦 Planned Path</span>
                        <span>⚠️ Dynamic Obstacle</span>
                        <span>⬛ Wall</span>
                        <span>🟧 Inflation Layer</span>
                    </div>
                </div>

                {/* Telemetry & Diagnostics Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* EKF State Card */}
                    <div className="glass" style={{ background: '#0f172a', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h4 style={{ margin: '0 0 0.8rem 0', color: '#38BDF8' }}>📡 EKF LOCALIZATION ESTIMATE</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                            <div>X Position: <strong>{ekfState.x} m</strong></div>
                            <div>Y Position: <strong>{ekfState.y} m</strong></div>
                            <div>Heading (θ): <strong>{(ekfState.theta * 180 / Math.PI).toFixed(1)}°</strong></div>
                            <div>Covariance: <strong>±{ekfState.covariance[0]}</strong></div>
                        </div>
                    </div>

                    {/* TF Frame Tree */}
                    <div className="glass" style={{ background: '#0f172a', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h4 style={{ margin: '0 0 0.8rem 0', color: '#F59E0B' }}>🌴 TRANSFORM TREE (TF)</h4>
                        <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#CBD5E1' }}>
                            <div>map → odom (Broadcaster: EKF)</div>
                            <div>  └─ odom → base_link (Broadcaster: Encoders)</div>
                            <div>      └─ base_link → laser_frame (Static LiDAR)</div>
                        </div>
                    </div>

                    {/* LiDAR Live Sensor Feed */}
                    <div className="glass" style={{ background: '#0f172a', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h4 style={{ margin: '0 0 0.8rem 0', color: '#10B981' }}>📊 360° LIDAR RAYCAST SWEEP</h4>
                        <div style={{ height: '140px', background: '#040711', borderRadius: '6px', overflow: 'hidden', padding: '0.5rem' }}>
                            <svg width="100%" height="100%">
                                {lidarData.slice(0, 24).map((ray, idx) => (
                                    <rect
                                        key={idx}
                                        x={idx * 12}
                                        y={120 - ray.distance * 20}
                                        width="8"
                                        height={ray.distance * 20}
                                        fill={ray.hit ? '#EF4444' : '#10B981'}
                                    />
                                ))}
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AMRNavigationPage;
