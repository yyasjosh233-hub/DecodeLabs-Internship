import React, { useState, useEffect, useRef } from 'react';
import { WORKFLOW_BLOCK_TYPES } from '../shared/rpaEngine';

const WorkflowDesigner = ({ workflows, onSaveWorkflow }) => {
    const [selectedWorkflow, setSelectedWorkflow] = useState(workflows[0] || null);
    const [nodes, setNodes] = useState(workflows[0]?.blocks || []);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [executingNodeId, setExecutingNodeId] = useState(null);
    const [execLogs, setExecLogs] = useState([]);
    const [workflowName, setWorkflowName] = useState(workflows[0]?.name || 'ERP Invoice Automation');
    
    // Dragging state
    const [draggingNodeId, setDraggingNodeId] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const canvasRef = useRef(null);

    // Sync nodes when workflows array prop updates
    useEffect(() => {
        if (workflows && workflows.length > 0) {
            const current = workflows.find(w => w.name === workflowName) || workflows[0];
            setSelectedWorkflow(current);
            setWorkflowName(current.name);
            if (current.blocks && current.blocks.length > 0) {
                setNodes(current.blocks);
            }
        }
    }, [workflows]);

    const handleSelectWorkflow = (wfId) => {
        const wf = workflows.find(w => w.id === wfId);
        if (wf) {
            setSelectedWorkflow(wf);
            setWorkflowName(wf.name);
            setNodes(wf.blocks || []);
            setSelectedNodeId(null);
        }
    };

    const handleAddBlock = (blockType) => {
        const newId = `node_${Date.now()}`;
        const count = nodes.length;
        const newX = 50 + (count % 4) * 180;
        const newY = 50 + Math.floor(count / 4) * 130;
        
        const newNode = {
            id: newId,
            type: blockType,
            label: `${blockType} Action`,
            x: newX,
            y: newY,
            config: { description: `Execute ${blockType} task` }
        };

        const updated = [...nodes, newNode];
        setNodes(updated);
        setSelectedNodeId(newId);
    };

    const handleNodeUpdate = (id, field, value) => {
        setNodes(nodes.map(n => n.id === id ? { ...n, [field]: value } : n));
    };

    const handleConfigUpdate = (id, key, value) => {
        setNodes(nodes.map(n => n.id === id ? { ...n, config: { ...n.config, [key]: value } } : n));
    };

    const handleRemoveNode = (id) => {
        setNodes(nodes.filter(n => n.id !== id));
        if (selectedNodeId === id) setSelectedNodeId(null);
    };

    // Node Dragging Handlers
    const handleMouseDownNode = (e, nodeId) => {
        e.stopPropagation();
        setSelectedNodeId(nodeId);
        setDraggingNodeId(nodeId);
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
            setDragOffset({
                x: e.clientX - node.x,
                y: e.clientY - node.y
            });
        }
    };

    const handleMouseMoveCanvas = (e) => {
        if (!draggingNodeId || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const newX = Math.max(10, Math.min(rect.width - 180, e.clientX - rect.left - 20));
        const newY = Math.max(10, Math.min(rect.height - 80, e.clientY - rect.top - 20));

        setNodes(nodes.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
    };

    const handleMouseUpCanvas = () => {
        setDraggingNodeId(null);
    };

    const runSimulation = async () => {
        if (nodes.length === 0) return;
        setIsExecuting(true);
        setExecLogs(['[SIMULATOR] Starting workflow execution engine...']);

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            setExecutingNodeId(node.id);
            const timeStr = new Date().toLocaleTimeString();
            setExecLogs(prev => [...prev, `[${timeStr}] Step ${i + 1}/${nodes.length}: Executing block [${node.type}] - ${node.label}`]);
            
            await new Promise(resolve => setTimeout(resolve, 700));
        }

        setExecutingNodeId(null);
        setIsExecuting(false);
        setExecLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Workflow completed successfully with 0 errors!`]);
    };

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    return (
        <div className="rpa-workflow-designer">
            {/* Designer Toolbar */}
            <div className="rpa-card" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                        type="text" 
                        className="rpa-input" 
                        value={workflowName} 
                        onChange={(e) => setWorkflowName(e.target.value)}
                        style={{ fontWeight: 700, fontSize: '1rem', width: '260px', color: '#ffde59' }}
                    />
                    <select 
                        className="rpa-input" 
                        style={{ width: '240px' }}
                        value={selectedWorkflow?.id || ''}
                        onChange={(e) => handleSelectWorkflow(e.target.value)}
                    >
                        {workflows.map(w => (
                            <option key={w.id} value={w.id}>{w.name} ({w.blocks ? w.blocks.length : (w.blockCount || 0)} blocks)</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button className="rpa-btn" onClick={() => setNodes([])}>Clear Canvas</button>
                    <button className="rpa-btn rpa-btn-primary" onClick={() => onSaveWorkflow({ name: workflowName, blocks: nodes })}>
                        💾 Save Workflow
                    </button>
                    <button 
                        className="rpa-btn" 
                        style={{ background: '#10b981', color: '#051515', fontWeight: 700, border: 'none' }}
                        onClick={runSimulation}
                        disabled={isExecuting}
                    >
                        {isExecuting ? '⏳ Running...' : '▶️ Execute Workflow'}
                    </button>
                </div>
            </div>

            {/* Workflow Builder Grid */}
            <div className="rpa-workflow-builder">
                {/* Block Palette */}
                <div className="rpa-palette">
                    <h4 style={{ color: '#ffde59', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Available Blocks ({WORKFLOW_BLOCK_TYPES.length})</h4>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>Click any block to add to visual workflow canvas.</p>
                    
                    {WORKFLOW_BLOCK_TYPES.map(b => (
                        <div 
                            key={b.type} 
                            className="rpa-palette-block"
                            onClick={() => handleAddBlock(b.type)}
                            title={`Click to add ${b.type} block`}
                        >
                            <span>{b.icon}</span>
                            <span style={{ flex: 1 }}>{b.type}</span>
                            <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700 }}>+ Add</span>
                        </div>
                    ))}
                </div>

                {/* SVG Visual Canvas */}
                <div 
                    className="rpa-canvas" 
                    ref={canvasRef}
                    onMouseMove={handleMouseMoveCanvas}
                    onMouseUp={handleMouseUpCanvas}
                >
                    {/* SVG Connector Lines */}
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                        <defs>
                            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffde59" />
                            </marker>
                        </defs>
                        {nodes.map((node, index) => {
                            if (index < nodes.length - 1) {
                                const nextNode = nodes[index + 1];
                                const startX = node.x + 85;
                                const startY = node.y + 35;
                                const endX = nextNode.x + 85;
                                const endY = nextNode.y;
                                return (
                                    <line 
                                        key={`link_${node.id}_${nextNode.id}`}
                                        x1={startX} 
                                        y1={startY} 
                                        x2={endX} 
                                        y2={endY} 
                                        stroke="#ffde59" 
                                        strokeWidth="2" 
                                        strokeDasharray="4"
                                        markerEnd="url(#arrow)"
                                    />
                                );
                            }
                            return null;
                        })}
                    </svg>

                    {/* Nodes Render */}
                    {nodes.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '8rem' }}>
                            <div style={{ fontSize: '3rem' }}>🧩</div>
                            <p style={{ marginTop: '0.5rem' }}>Workflow Canvas is empty. Click any block from the left palette to construct your RPA sequence.</p>
                        </div>
                    ) : (
                        nodes.map((node) => {
                            const bType = WORKFLOW_BLOCK_TYPES.find(b => b.type === node.type);
                            const isSelected = node.id === selectedNodeId;
                            const isExec = node.id === executingNodeId;

                            return (
                                <div 
                                    key={node.id}
                                    className={`rpa-canvas-node ${isSelected ? 'selected' : ''} ${isExec ? 'executing' : ''}`}
                                    style={{ left: `${node.x}px`, top: `${node.y}px`, cursor: 'move' }}
                                    onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>{bType?.icon || '⚙️'}</span>
                                        <span style={{ fontWeight: 700, color: '#ffde59', fontSize: '0.85rem' }}>{node.type}</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{node.label}</div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Configuration Panel & Logs */}
                <div className="rpa-config-panel">
                    <h4 style={{ color: '#ffde59', fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Block Configuration</h4>
                    
                    {selectedNode ? (
                        <div>
                            <div className="rpa-input-group">
                                <label>Block Label</label>
                                <input 
                                    type="text" 
                                    className="rpa-input" 
                                    value={selectedNode.label} 
                                    onChange={(e) => handleNodeUpdate(selectedNode.id, 'label', e.target.value)}
                                />
                            </div>

                            <div className="rpa-input-group">
                                <label>Block Type</label>
                                <input type="text" className="rpa-input" value={selectedNode.type} disabled style={{ opacity: 0.7 }} />
                            </div>

                            <div className="rpa-input-group">
                                <label>Description / Params</label>
                                <textarea 
                                    className="rpa-input" 
                                    rows="3"
                                    value={selectedNode.config?.description || ''} 
                                    onChange={(e) => handleConfigUpdate(selectedNode.id, 'description', e.target.value)}
                                />
                            </div>

                            <button className="rpa-btn rpa-btn-danger rpa-btn-sm" onClick={() => handleRemoveNode(selectedNode.id)} style={{ width: '100%', marginTop: '0.5rem' }}>
                                🗑️ Remove Block
                            </button>
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Select any block on the canvas to edit its properties.</p>
                    )}

                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                        <h4 style={{ color: '#ffde59', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Live Simulator Console</h4>
                        <div className="rpa-log-stream" style={{ height: '180px' }}>
                            {execLogs.length === 0 ? (
                                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Ready. Click "Execute Workflow" to test simulation.</div>
                            ) : (
                                execLogs.map((l, i) => <div key={i} className="rpa-log-row">{l}</div>)
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkflowDesigner;
