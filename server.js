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
    // In a real app, you would send an email or save to DB here
    res.json({ success: true, message: "Inquiry received" });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});
