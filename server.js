import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

function getRobotAnswer(question) {
    const q = question.toLowerCase();

    if (q.includes("type of robot") || q.includes("types of robot")) {
        return `There are many types of robots such as:
Industrial Robots, Humanoid Robots, Medical Robots, Agricultural Robots,
Underwater Robots, Drone Robots(UAV), Military Robots, Service Robots,
Educational Robots, Autonomous Mobile Robots(AMR), Collaborative Robots(Cobots),
Delta Robots, Swarm Robots, Logistics Robots, Space Robots,
Entertainment Robots, Inspection Robots, Cleaning Robots, Security Robots,
and AI Powered Robots.`;
    } else if (q.includes("industrial robot")) {
        return `Industrial robots are automated machines used in factories.
They perform tasks like welding, painting, assembly, packaging,
and material handling with high precision and speed.`;
    } else if (q.includes("humanoid robot")) {
        return `Humanoid robots are robots designed to look and behave like humans.
They are used in research, service industries, customer interaction,
and advanced AI development.`;
    } else if (q.includes("medical robot")) {
        return `Medical robots assist doctors in performing precise surgeries,
rehabilitation therapy, patient monitoring, and hospital automation.`;
    } else if (q.includes("agriculture robot") || q.includes("agricultural robot")) {
        return `Agricultural robots help farmers with tasks like planting,
harvesting crops, spraying fertilizers, monitoring soil health,
and crop inspection using AI sensors.`;
    } else if (q.includes("drone") || q.includes("uav")) {
        return `Drone robots (UAVs) are flying robots used for surveillance,
delivery services, agriculture monitoring, aerial photography,
mapping, and disaster management.`;
    } else if (q.includes("underwater robot")) {
        return `Underwater robots (ROV or AUV) are used for ocean exploration,
pipeline inspection, underwater research, and deep-sea mining.`;
    } else if (q.includes("military robot")) {
        return `Military robots are used by defense forces for bomb disposal,
surveillance, reconnaissance missions, and battlefield support.`;
    } else if (q.includes("education robot") || q.includes("educational robot")) {
        return `Educational robots help students learn coding,
robotics engineering, artificial intelligence, and STEM concepts
through practical hands-on learning.`;
    } else if (q.includes("service robot")) {
        return `Service robots assist humans in daily activities.
Examples include hotel robots, hospital robots, cleaning robots,
and delivery robots.`;
    } else if (q.includes("autonomous robot")) {
        return `Autonomous robots operate independently using AI,
sensors, cameras, and navigation systems without human control.`;
    } else if (q.includes("what is robot") || q === "robot") {
        return `A robot is a programmable machine capable of carrying out
tasks automatically using sensors, software, and mechanical systems.
Robots are widely used in industries, healthcare, agriculture,
defense, logistics, and research.`;
    } else if (q.includes("hello") || q.includes("hi") || q.includes("hlo")) {
        return "Hello 👋 I am the Dj Group AI Expert Assistant. How can I help you with robotics today?";
    } else if (q.includes("path planning") || q.includes("robotics path planning")) {
        return `Robotics Path Planning calculates collision-free paths from a start pose to a goal pose. 
It uses algorithms like RRT*, A*, D*, Dijkstra, and Quintic Polynomial trajectory generation to ensure continuous C^2 velocity and acceleration profiles.`;
    } else if (q.includes("forward kinematics")) {
        return `Forward Kinematics (FK) calculates the 3D position and orientation (pose) of the end-effector from given joint angles (θ1...θ6) using Denavit-Hartenberg (DH) transformation matrices.`;
    } else if (q.includes("inverse kinematics")) {
        return `Inverse Kinematics (IK) calculates the required joint angles (θ1...θ6) to place the end-effector at a specific 6D target pose (X, Y, Z, Roll, Pitch, Yaw) using analytical or Damped Least Squares (DLS) numerical solvers.`;
    } else if (q.includes("jacobian matrix") || q.includes("jacobian")) {
        return `The Jacobian Matrix J(θ) relates joint angular velocities to end-effector linear and angular velocities (x_dot = J * q_dot). Its determinant det(J J^T) determines singular configurations where degrees of freedom are lost.`;
    } else if (q.includes("ros2") || q.includes("ros 2")) {
        return `ROS 2 (Robot Operating System) is an open-source middleware suite for robotics development. It uses DDS for real-time pub/sub communication, QoS profiles, TF2 transform trees, and modular action servers.`;
    } else if (q.includes("three.js robotics") || q.includes("three.js") || q.includes("threejs")) {
        return `Three.js Robotics provides real-time WebGL 3D rendering for robot arms, AMRs, URDF meshes, coordinate frames, collision hulls, and trajectory lines directly in web browsers at high frame rates.`;
    } else if (q.includes("opencv")) {
        return `OpenCV (Open Source Computer Vision) is a library of programming functions for real-time computer vision, image processing, edge detection, contour analysis, binarization, and object classification.`;
    } else if (q.includes("computer vision")) {
        return `Computer Vision enables robotic systems to process visual inputs from RGB/Depth cameras, perform feature detection, 3D point cloud reconstruction, defect classification, and spatial measurements.`;
    } else if (q.includes("quality inspection") || q.includes("automated quality inspection")) {
        return `Automated Quality Inspection combines OpenCV processing pipelines (15 visual stages) with high-speed optical camera triggers to detect manufacturing defects like missing gear teeth, surface cracks, and dimension variances.`;
    } else if (q.includes("industrial ai")) {
        return `Industrial AI integrates autonomous path planning, 3D WebGL digital twins, OpenCV vision inspection, and low-latency ROS 2 telemetry to optimize smart factory throughput and manufacturing reliability.`;
    } else {
        return "I am the Dj Group AI Expert Assistant 🤖. Ask me anything about robotics, AI robots, drones, automation, or technology.";
    }
}

const robotTypes = [
    {
        id: "industrial",
        title: "Industrial Automation",
        description: "Automated machines used in factories. They perform tasks like welding, painting, assembly, packaging, and material handling with high precision and speed.",
        spec: "Payload: Up to 500kg | Precision: ±0.02mm",
        icon: "industrial"
    },
    {
        id: "humanoid",
        title: "Humanoid Robots",
        description: "Robots designed to look and behave like humans. They are used in research, service industries, customer interaction, and advanced AI development.",
        spec: "DoF: 53 | AI Core: Neural-Motion v4",
        icon: "humanoid"
    },
    {
        id: "medical",
        title: "Medical Robots",
        description: "Assist doctors in performing precise surgeries, rehabilitation therapy, patient monitoring, and hospital automation.",
        spec: "Latency: <1.2ms | Accuracy: Sub-millimeter",
        icon: "medical"
    },
    {
        id: "agricultural",
        title: "Agricultural Robots",
        description: "Help farmers with tasks like planting, harvesting crops, spraying fertilizers, monitoring soil health, and crop inspection using AI sensors.",
        spec: "Autonomy: Level 4 | Coverage: 50 acres/day",
        icon: "agriculture"
    },
    {
        id: "uav",
        title: "Drone Robots (UAV)",
        description: "Flying robots used for surveillance, delivery services, agriculture monitoring, aerial photography, mapping, and disaster management.",
        spec: "Flight Time: 60 mins | Sensors: LiDAR & Multi-spectral",
        icon: "drone"
    },
    {
        id: "underwater",
        title: "Underwater Robots",
        description: "Used for ocean exploration, pipeline inspection, underwater research, and deep-sea mining (ROV or AUV).",
        spec: "Depth: Up to 6000m | Navigation: Acoustic SLAM",
        icon: "underwater"
    },
    {
        id: "military",
        title: "Military Robots",
        description: "Used by defense forces for bomb disposal, surveillance, reconnaissance missions, and battlefield support.",
        spec: "Traction: Tracked / All-Terrain | Payload: Weaponry & Sensors",
        icon: "military"
    },
    {
        id: "service",
        title: "Service Robots",
        description: "Assist humans in daily activities. Examples include hotel robots, hospital robots, cleaning robots, and delivery robots.",
        spec: "Interaction: Natural Language | Navigation: Indoor SLAM",
        icon: "service"
    },
    {
        id: "educational",
        title: "Educational Robots",
        description: "Help students learn coding, robotics engineering, artificial intelligence, and STEM concepts through practical hands-on learning.",
        spec: "Software: Blockly & Python | Connectivity: Bluetooth/Wi-Fi",
        icon: "educational"
    },
    {
        id: "amr",
        title: "Autonomous Mobile Robots (AMR)",
        description: "Self-navigating warehouse and logistics systems that optimize material flow with dynamic pathfinding.",
        spec: "Speed: 2.0 m/s | Navigation: SLAM Visual-LiDAR",
        icon: "logistics"
    }
];


app.get("/api/robotics", (req, res) => {
    res.json(robotTypes);
});

const blogPosts = [
    {
        id: 1,
        tag: 'OCEAN TECH',
        category: 'Robotics',
        date: 'February 24, 2026',
        title: 'Underwater Robots',
        content: 'Underwater robots (ROVs or AUVs) play a crucial role in ocean exploration, underwater mining, and pipeline inspections, reaching depths inaccessible to human divers.',
        imageKey: 'underwater'
    },
    {
        id: 2,
        tag: 'EDTECH',
        category: 'Education',
        date: 'February 24, 2026',
        title: 'Educational Robots',
        content: 'Educational robots are specifically designed to facilitate hands-on learning in coding and robotics, preparing the next generation for an automated world.',
        imageKey: 'educational'
    },
    {
        id: 3,
        tag: 'AGRI-TECH',
        category: 'Robotics',
        date: 'February 24, 2026',
        title: 'Agricultural Robots',
        content: 'From precision planting to health monitoring via AI sensors, agricultural robots are transforming farming into a high-tech, efficiency-driven industry.',
        imageKey: 'agricultural'
    },
    {
        id: 4,
        tag: 'HEALTH-CARE',
        category: 'Medical',
        date: 'February 24, 2026',
        title: 'Medical Robots',
        content: 'Enhancing precision in surgical procedures and reducing recovery times, medical robots are a cornerstone of modern minimally invasive surgery.',
        imageKey: 'medical'
    },
    {
        id: 5,
        tag: 'HUMANOID',
        category: 'AI',
        date: 'February 24, 2026',
        title: 'Humanoid Assembly Systems',
        content: 'Clean-room humanoid robots executing micro-inspections and delicate assembly tasks with high precision on automated production lines.',
        imageKey: 'humanoidRobotLine'
    },
    {
        id: 6,
        tag: 'AUTOMATION',
        category: 'Industry',
        date: 'February 24, 2026',
        title: 'High-Volume Automation',
        content: 'Industrial automation robots built for pure throughput and sub-millimeter precision, essential for global manufacturing elite.',
        imageKey: 'orangeRoboticArmsFactory'
    },
    {
        id: 7,
        tag: 'RPA',
        category: 'Industry',
        date: 'February 28, 2026',
        title: 'Robotic Process Automation',
        content: 'Optimizing and securing intricate factory workflows while enhancing operator safety across all manufacturing sectors.',
        image: 'https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?auto=format&fit=crop&q=80&w=1200'
    },
    {
        id: 8,
        tag: 'LOGISTICS',
        category: 'Robotics',
        date: 'February 28, 2026',
        title: 'Autonomous Mobile Robots (AMR)',
        content: 'Revolutionizing warehouse logistics, AMRs navigate dynamically using sensors and AI to transport goods safely in busy environments.',
        image: 'https://images.unsplash.com/photo-1589254066007-898d52d910d3?auto=format&fit=crop&q=80&w=1200'
    },
    {
        id: 9,
        tag: 'FABRICATION',
        category: 'Industry',
        date: 'February 28, 2026',
        title: 'Advanced Robotic Welding',
        content: 'Automated welding cells that integrate real-time vision to adapt to part variances, ensuring perfect seam integrity every time.',
        imageKey: 'welding'
    },
    {
        id: 10,
        tag: 'CYBER-TECH',
        category: 'Industry',
        date: 'February 28, 2026',
        title: 'Cyber-Physical Sewing Systems',
        content: 'Next-generation computerized sewing automation integrating visual sensors to execute precise stitching on dynamic fabrics.',
        imageKey: 'sewingMachine'
    },
    {
        id: 11,
        tag: 'AI-VISION',
        category: 'AI',
        date: 'February 28, 2026',
        title: 'Precision Target Calibration',
        content: 'Optic sensor testing and alignment rigs utilizing high-frequency telemetry tracking to achieve sub-micron precision.',
        imageKey: 'glowingDartboard'
    },
    {
        id: 12,
        tag: 'SWARM-TECH',
        category: 'Robotics',
        date: 'February 28, 2026',
        title: 'Swarm Robotics Systems',
        content: 'Coordinating large numbers of simple robots to accomplish complex tasks collaboratively, providing extreme fault tolerance.',
        imageKey: 'swarm'
    },
    {
        id: 13,
        tag: 'SELF-DRIVING',
        category: 'AI',
        date: 'February 28, 2026',
        title: 'Autonomous Robot Car',
        content: 'Next-gen mobility systems built with self-driving capability, reshaping urban transportation and logistical delivery.',
        imageKey: 'car'
    },
    {
        id: 14,
        tag: 'TELEMATICS',
        category: 'AI',
        date: 'February 28, 2026',
        title: 'High-Speed Vehicle Telematics',
        content: 'Telemetry processing platforms streaming motor metrics and chassis balance points at ultra-low latencies.',
        imageKey: 'formulaRaceCar'
    },
    {
        id: 15,
        tag: 'TEXTILE-TECH',
        category: 'Industry',
        date: 'February 28, 2026',
        title: 'Textile Factory Automation',
        content: 'High-speed automated yarn spinning facilities utilizing IoT sensors to maintain perfect thread tension and throughput.',
        imageKey: 'textileAutomation'
    },
    {
        id: 16,
        tag: 'MOBILITY',
        category: 'Robotics',
        date: 'February 28, 2026',
        title: 'Legged Locomotion',
        content: 'Robots based on advanced movement types, utilizing biomimetic legged mobility to conquer terrains inaccessible to wheels.',
        image: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=1200'
    },
    {
        id: 17,
        tag: 'LOGISTICS',
        category: 'Automation',
        date: 'March 01, 2026',
        title: 'Robotic Palletizing Systems',
        content: 'Advanced robotic articulators operating at high-speed load-bearing cycles, stacking heavy cargo cases in optimal grids.',
        image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=1200'
    },
    {
        id: 18,
        tag: 'CNC-TECH',
        category: 'Manufacturing',
        date: 'March 01, 2026',
        title: 'CNC Machine Tending Robots',
        content: 'Integrating multi-gripper loaders with active machine doors to automate tool spindle loading and raw material feeding.',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200'
    },
    {
        id: 19,
        tag: 'FABRICATION',
        category: 'Manufacturing',
        date: 'March 01, 2026',
        title: 'Robotic Laser Cutting & Slicing',
        content: 'High-power multi-axis laser cut units profiling complex contours in steel plate feeds with sub-micron tolerances.',
        image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1200'
    },
    {
        id: 20,
        tag: 'COATING',
        category: 'Automation',
        date: 'March 01, 2026',
        title: 'Robotic Painting & Coating Cells',
        content: 'Explosion-proof paint sprayers operating in isolated enclosures to deliver flawless finishes on heavy manufacturing parts.',
        image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=1200'
    },
    {
        id: 21,
        tag: 'PACKAGING',
        category: 'Robotics',
        date: 'March 01, 2026',
        title: 'Delta Pick-and-Place Systems',
        content: 'Spider-like high-frequency parallel robots packaging pharmaceuticals, food items, and delicate electronics at top speed.',
        image: 'https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?auto=format&fit=crop&q=80&w=1200'
    },
    {
        id: 22,
        tag: 'FOUNDRY',
        category: 'Manufacturing',
        date: 'March 01, 2026',
        title: 'Metallurgical Foundry Robots',
        content: 'Heavy payload thermal-shielded robotic arms performing casting extraction and molten metal pouring under extreme heat.',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200'
    },
    {
        id: 23,
        tag: 'DOCK-TECH',
        category: 'Logistics',
        date: 'March 01, 2026',
        title: 'Autonomous Forklift Fleets',
        content: 'Advanced driverless lift trucks navigating warehouse spaces via 3D LiDAR meshes to automate high-rack pallet loading.',
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200'
    },
    {
        id: 24,
        tag: 'FINISHING',
        category: 'Automation',
        date: 'March 01, 2026',
        title: 'Robotic De-burring & Polishing',
        content: 'Force-feedback grinding robots stripping weld seams and polishing castings automatically to achieve uniform smoothness.',
        imageKey: 'deburring'
    }
];

app.get("/api/posts", (req, res) => {
    res.json(blogPosts);
});


app.post("/api/ai/chat", (req, res) => {
    const { message } = req.body;
    const reply = getRobotAnswer(message || "");
    res.json({ reply });
});

app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body;
    console.log("Received contact inquiry:", { name, email, message });
    res.json({ success: true, message: "Inquiry received" });
});

// ==========================================
// INDUSTRIAL AI PLATFORM NEW REST APIS
// ==========================================
const robotSessionsDB = [
    { sessionId: 'SESS-101', robotModel: '6-DOF Industrial Arm', status: 'ONLINE', mode: 'AUTOMATIC', jointCount: 6, createdTime: new Date().toISOString() }
];

const trajectoriesDB = [
    { trajectoryId: 'TRAJ-001', jointName: 'Arm_Group', waypointsCount: 120, durationSec: 3.0, status: 'COMPLETED' }
];

const inspectionsDB = [
    { inspectionId: 'INSP-849102', timestamp: new Date().toISOString(), partType: 'GEAR', status: 'PASS', confidenceScore: 98.6, defects: [] }
];

const reportsDB = [
    { reportId: 'REP-9001', type: 'PDF', generatedAt: new Date().toISOString(), recordsCount: 1 }
];

const activityLogsDB = [
    { id: 1, action: 'Platform Ingest', detail: 'Industrial AI Platform initialized cleanly.', time: 'Just now' }
];

app.get("/api/industrial/robot-sessions", (req, res) => res.json(robotSessionsDB));
app.post("/api/industrial/robot-sessions", (req, res) => {
    const session = { sessionId: `SESS-${Date.now()}`, ...req.body, createdTime: new Date().toISOString() };
    robotSessionsDB.push(session);
    res.json({ success: true, session });
});

app.get("/api/industrial/trajectories", (req, res) => res.json(trajectoriesDB));
app.post("/api/industrial/trajectories", (req, res) => {
    const trajectory = { trajectoryId: `TRAJ-${Date.now()}`, ...req.body };
    trajectoriesDB.push(trajectory);
    res.json({ success: true, trajectory });
});

app.get("/api/industrial/inspections", (req, res) => res.json(inspectionsDB));
app.post("/api/industrial/inspections", (req, res) => {
    const record = { inspectionId: `INSP-${Date.now().toString().slice(-6)}`, ...req.body };
    inspectionsDB.push(record);
    res.json({ success: true, record });
});

app.get("/api/industrial/reports", (req, res) => res.json(reportsDB));
app.post("/api/industrial/reports", (req, res) => {
    const report = { reportId: `REP-${Date.now().toString().slice(-4)}`, ...req.body, generatedAt: new Date().toISOString() };
    reportsDB.push(report);
    res.json({ success: true, report });
});

app.get("/api/industrial/activity-logs", (req, res) => res.json(activityLogsDB));
app.post("/api/industrial/activity-logs", (req, res) => {
    const log = { id: activityLogsDB.length + 1, ...req.body, time: 'Just now' };
    activityLogsDB.push(log);
    res.json({ success: true, log });
});

// ==========================================
// WEEK 3 – ROBOTIC PROCESS AUTOMATION (RPA) REST APIS
// ==========================================
const rpaBotsDB = [
    { id: 'BOT-01', name: 'Invoice Processing Bot', status: 'RUNNING', workflow: 'ERP Invoice Automation', assignedTasks: 42, successRate: 98.4, cpu: 34, memory: 420, lastRun: '2 mins ago' },
    { id: 'BOT-02', name: 'Email Attachment Scraper', status: 'RUNNING', workflow: 'PO Email Scraping Pipeline', assignedTasks: 128, successRate: 99.1, cpu: 18, memory: 280, lastRun: 'Just now' },
    { id: 'BOT-03', name: 'Excel Financial Auditor', status: 'IDLE', workflow: 'Quarterly Ledger Reconciler', assignedTasks: 14, successRate: 96.0, cpu: 4, memory: 150, lastRun: '15 mins ago' },
    { id: 'BOT-04', name: 'Database Sync Robot', status: 'RUNNING', workflow: 'PostgreSQL-MongoDB Sync', assignedTasks: 310, successRate: 100.0, cpu: 52, memory: 610, lastRun: '1 min ago' }
];

const rpaWorkflowsDB = [
    {
        id: 'WF-101',
        name: 'ERP Invoice Automation',
        category: 'Document Automation',
        blockCount: 9,
        created: '2026-02-15',
        status: 'Active',
        blocks: [
            { id: 'n1', type: 'Start', label: 'Start Flow', x: 50, y: 50, config: { trigger: 'Scheduled Cron' } },
            { id: 'n2', type: 'Read Email', label: 'Fetch Invoices Email', x: 230, y: 50, config: { folder: 'Inbox/Invoices', unreadOnly: true } },
            { id: 'n3', type: 'Download Attachment', label: 'Save PDF Invoices', x: 410, y: 50, config: { savePath: './temp/invoices' } },
            { id: 'n4', type: 'OCR', label: 'EasyOCR Extract', x: 590, y: 50, config: { engine: 'EasyOCR', confidenceMin: 0.85 } },
            { id: 'n5', type: 'Extract Data', label: 'Parse Invoice Fields', x: 590, y: 180, config: { fields: ['Invoice', 'Amount', 'Date', 'GST'] } },
            { id: 'n6', type: 'Validate Data', label: 'Verify PO Match', x: 410, y: 180, config: { rule: 'Amount > 0 AND PO != null' } },
            { id: 'n7', type: 'Database Insert', label: 'Push to PostgreSQL', x: 230, y: 180, config: { table: 'erp_invoices' } },
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

const rpaJobsDB = [
    { id: 'JOB-901', botName: 'Invoice Processing Bot', workflowName: 'ERP Invoice Automation', status: 'COMPLETED', duration: '4.2s', itemsProcessed: 14, timestamp: '2026-03-01 16:40' },
    { id: 'JOB-902', botName: 'Email Attachment Scraper', workflowName: 'PO Email Scraping Pipeline', status: 'COMPLETED', duration: '1.8s', itemsProcessed: 5, timestamp: '2026-03-01 16:35' }
];

const rpaLogsDB = [
    { id: 1, timestamp: '16:44:12', level: 'INFO', botId: 'BOT-04', message: 'Database Sync Robot initiated batch transfer of 200 records.' },
    { id: 2, timestamp: '16:42:05', level: 'SUCCESS', botId: 'BOT-01', message: 'Invoice Processing Bot completed extraction for INV-2026-889.' }
];

const rpaSchedulesDB = [
    { id: 'SCH-01', workflowName: 'ERP Invoice Automation', botName: 'Invoice Processing Bot', cron: '*/15 * * * *', nextRun: 'In 6 mins', status: 'ACTIVE' },
    { id: 'SCH-02', workflowName: 'PO Email Scraping Pipeline', botName: 'Email Attachment Scraper', cron: '0 * * * *', nextRun: 'In 16 mins', status: 'ACTIVE' }
];

const rpaReportsDB = [];

// RPA Workflows API
app.get("/api/rpa/workflows", (req, res) => res.json(rpaWorkflowsDB));
app.post("/api/rpa/workflows", (req, res) => {
    const wf = { id: `WF-${Date.now().toString().slice(-3)}`, ...req.body };
    rpaWorkflowsDB.push(wf);
    res.json({ success: true, workflow: wf });
});

// RPA Bots API
app.get("/api/rpa/bots", (req, res) => res.json(rpaBotsDB));
app.post("/api/rpa/bots", (req, res) => {
    const bot = { id: `BOT-0${rpaBotsDB.length + 1}`, ...req.body };
    rpaBotsDB.push(bot);
    res.json({ success: true, bot });
});
app.post("/api/rpa/bots/:id/action", (req, res) => {
    const { action } = req.body;
    const bot = rpaBotsDB.find(b => b.id === req.params.id);
    if (bot) {
        if (action === 'start' || action === 'running') bot.status = 'RUNNING';
        if (action === 'pause' || action === 'paused') bot.status = 'PAUSED';
        if (action === 'stop' || action === 'idle') bot.status = 'IDLE';
    }
    res.json({ success: true, bot });
});
app.delete("/api/rpa/bots/:id", (req, res) => {
    const idx = rpaBotsDB.findIndex(b => b.id === req.params.id);
    if (idx !== -1) rpaBotsDB.splice(idx, 1);
    res.json({ success: true });
});

// RPA Jobs API
app.get("/api/rpa/jobs", (req, res) => res.json(rpaJobsDB));
app.post("/api/rpa/jobs", (req, res) => {
    const job = { id: `JOB-${Date.now().toString().slice(-3)}`, ...req.body };
    rpaJobsDB.push(job);
    res.json({ success: true, job });
});

// RPA Reports API
app.get("/api/rpa/reports", (req, res) => res.json(rpaReportsDB));
app.post("/api/rpa/reports", (req, res) => {
    const report = { id: `RPA-REP-${Date.now().toString().slice(-4)}`, ...req.body, created: new Date().toISOString() };
    rpaReportsDB.push(report);
    res.json({ success: true, report });
});

// RPA Logs API
app.get("/api/rpa/logs", (req, res) => res.json(rpaLogsDB));
app.post("/api/rpa/logs", (req, res) => {
    const log = { id: rpaLogsDB.length + 1, timestamp: new Date().toLocaleTimeString(), ...req.body };
    rpaLogsDB.push(log);
    res.json({ success: true, log });
});

// RPA Scheduler API
app.get("/api/rpa/scheduler", (req, res) => res.json(rpaSchedulesDB));
app.post("/api/rpa/scheduler", (req, res) => {
    const sch = { id: `SCH-0${rpaSchedulesDB.length + 1}`, ...req.body };
    rpaSchedulesDB.push(sch);
    res.json({ success: true, schedule: sch });
});

// ==========================================
// WEEKS 4-8 INDUSTRIAL ENTERPRISE REST APIS
// ==========================================
app.get("/api/process-mining/variants", (req, res) => {
    res.json([
        { id: 'V1', name: 'Standard Order-to-Fulfill', throughputTime: '4.2 hrs' },
        { id: 'V2', name: 'Exception Rework Variant', throughputTime: '18.6 hrs' }
    ]);
});

app.get("/api/digital-twin/telemetry", (req, res) => {
    res.json({ vibration: 2.4, temperature: 42.1, spindleRPM: 3200, equipmentHealth: 98.2 });
});

app.get("/api/iiot/devices", (req, res) => {
    res.json([
        { id: 'DEV-101', name: 'Siemens S7-1500 PLC', protocol: 'OPC UA', status: 'ONLINE' },
        { id: 'DEV-104', name: 'NVIDIA Jetson Orin Edge Node', protocol: 'MQTT', status: 'ONLINE' }
    ]);
});

app.get("/api/computer-vision/defects", (req, res) => {
    res.json([
        { id: 1, label: 'Gear Surface Crack', confidence: '99.4%', isDefect: true },
        { id: 2, label: 'Worker Safety Helmet', confidence: '98.1%', isDefect: false }
    ]);
});

app.get("/api/copilot-agents/swarm", (req, res) => {
    res.json([
        { name: 'Planner Agent', status: 'ACTIVE', decisionScore: 99.1 },
        { name: 'Supervisor Agent', status: 'ACTIVE', decisionScore: 100.0 }
    ]);
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});
