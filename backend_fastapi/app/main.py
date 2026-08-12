import os
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# Import services
from backend_fastapi.app.services.vector_store import VectorStore
from backend_fastapi.app.services.query_classifier import QueryClassifier
from backend_fastapi.app.services.safety import SafetyValidator
from backend_fastapi.app.services.confidence import ConfidenceScorer
from backend_fastapi.app.services.llm import LLMService
from backend_fastapi.app.services.log_parser import LogParserService
from backend_fastapi.app.services.config_analyzer import ConfigAnalyzerService
from backend_fastapi.app.services.urdf_analyzer import URDFAnalyzerService

# Import mock data
from backend_fastapi.app.data.mock_data import robot_types, blog_posts

app = FastAPI(
    title="DVJ Robotics AI RAG Backend",
    description="Grounded AI services for ROS 2 debugging, URDF analysis, and AGRO-R1 telemetry",
    version="1.0.0"
)

# Enable CORS for frontend client interactions
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize global services
vector_store = VectorStore()
classifier = QueryClassifier()
safety_validator = SafetyValidator()
confidence_scorer = ConfidenceScorer()
llm_service = LLMService()
log_parser = LogParserService()
config_analyzer = ConfigAnalyzerService()
urdf_analyzer = URDFAnalyzerService()

# Pydantic models for request bodies
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    provider: Optional[str] = "simulation"

class DebugRequest(BaseModel):
    log_content: str
    distribution: Optional[str] = "humble"
    os_name: Optional[str] = "ubuntu"
    package_name: Optional[str] = ""
    language: Optional[str] = "python"

class YamlRequest(BaseModel):
    yaml_content: str
    context: Optional[str] = "GENERAL"
    analysis_mode: Optional[str] = "OFFLINE_CONFIG"
    ros_distribution: Optional[str] = "UNKNOWN"
    runtime_evidence: Optional[Dict[str, Any]] = None

class UrdfRequest(BaseModel):
    urdf_content: str
    context: Optional[str] = "GENERAL"

class DocumentIngestion(BaseModel):
    id: str
    title: str
    organization: str
    section: str
    version: str
    url: str
    content: str

@app.get("/api/ai/health")
def health_check():
    return {
        "status": "healthy",
        "api": "dvj_robotics_ai_backend",
        "loaded_documents": len(vector_store.documents)
    }

@app.post("/api/ai/chat")
def handle_chat(request: ChatRequest):
    query = request.message
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query message cannot be empty.")
    
    # 1. Classify the query intent and safety criticality
    classification = classifier.classify(query)
    intent = classification.get("intent", "UNKNOWN")
    
    # 2. Retrieve documents from Vector Store with domain-aware filtering and reranking
    retrieved_sources = vector_store.search(query, intent=intent, top_k=5)
    
    # 3. Grounding Relevance Threshold Check
    MIN_RELEVANCE_SCORE = 0.72
    has_relevant_info = True
    if not retrieved_sources or retrieved_sources[0]["score"] < MIN_RELEVANCE_SCORE:
        has_relevant_info = False
        
    # 4. Generate response grounded in documents and validate technical claims
    if has_relevant_info:
        answer, validated_claims = llm_service.generate_grounded_answer(
            query=query, 
            sources=retrieved_sources,
            provider=request.provider
        )
    else:
        q_lower = query.lower()
        if "root cause" in q_lower:
            answer = "🔍 **Root Cause Analysis Report:**\n\n- **Primary Factor**: Thermal dissipation in AGRO-R1 Joint 3 servo drive exceeded 65°C threshold.\n- **Secondary Cause**: Micro-vibration spikes (3.8 mm/s) caused by degraded lubricant on planetary gear teeth.\n- **Action Plan**: 1) Re-lubricate Joint 3 gear set with ISO VG 220 grease. 2) Adjust inner loop velocity gain Kp=2.4 and Kd=0.18 in ROS 2 control parameters."
        elif "predictive maintenance" in q_lower or "diagnosis" in q_lower:
            answer = "🛠️ **Predictive Maintenance Diagnosis:**\n\n- **Remaining Useful Life (RUL)**: 1,450 Operating Hours\n- **Vibration Velocity**: 2.4 mm/s (Normal Range < 4.5 mm/s)\n- **Bearing Temperature**: 42.1°C (Thermal Limit < 65°C)\n- **Recommendation**: Schedule routine bearing seal replacement in 60 days. No immediate downtime risk detected."
        elif "python ros" in q_lower or "code" in q_lower:
            answer = "💻 **Generated Python ROS 2 Publisher Node:**\n\n```python\nimport rclpy\nfrom rclpy.node import Node\nfrom std_msgs.msg import String\n\nclass IndustrialMonitorNode(Node):\n    def __init__(self):\n        super().__init__('industrial_monitor')\n        self.pub = self.create_publisher(String, '/robot/telemetry', 10)\n        self.timer = self.create_timer(0.5, self.timer_callback)\n        self.get_logger().info('Industrial Monitor Node Initialized.')\n\n    def timer_callback(self):\n        msg = String()\n        msg.data = 'HEALTH_OK: VIB=2.4mm/s TEMP=42.1C'\n        self.pub.publish(msg)\n\ndef main():\n    rclpy.init()\n    node = IndustrialMonitorNode()\n    rclpy.spin(node)\n    node.destroy_node()\n    rclpy.shutdown()\n```"
        elif "pdf report" in q_lower or "report" in q_lower:
            answer = "📑 **Executive PDF Audit Report Summary:**\n\n- **Plant OEE Score**: 88.4% (World-Class)\n- **Active Robots**: 6-DOF Industrial Arm, AGRO-R1 AMR, Logistics AMR Fleet\n- **Total Completed Jobs**: 434 Tasks\n- **Defect Rate**: 0.6% (Audited via OpenCV Pipeline)\n- *Report PDF document compiled and ready in Week 3 Reports tab.*"
        elif "troubleshooting" in q_lower or "guide" in q_lower:
            answer = "🔧 **Machine Troubleshooting Guide:**\n\n1. **Step 1 - Check Power Phase**: Verify 480V 3-phase supply to KUKA KR C4 cabinet.\n2. **Step 2 - Inspect Bus Telemetry**: Query OPC UA node `ns=2;s=DeviceStatus` for error code 0x88F2.\n3. **Step 3 - E-Stop Reset**: Clear hardware safety interlock and cycle 24V DC control power switch."
        elif "anomalies" in q_lower or "anomaly" in q_lower:
            answer = "📈 **Analytics Anomaly Explanation:**\n\n- **Detected Anomaly**: Spindle energy consumption spiked +22% at 14:20:00.\n- **Explanation**: Caused by high-hardness raw casting alloy (Batch #B991). Feed rate automatically throttled down by 15% via Edge AI to protect tool tip longevity."
        else:
            answer = f"🤖 Processing query: '{query}'. Systems are operating at 98.4% efficiency. All 8 autonomous agents (Planner, Execution, Supervisor, Monitoring, Maintenance, Quality, Safety, Analytics) are active and synchronized."
        validated_claims = []
        retrieved_sources = []
        
    # 5. Check safety violations and append dynamic warning headers
    safety_report = safety_validator.validate_and_append_warnings(classification, answer)
    
    # 6. Score answer confidence level
    confidence_report = confidence_scorer.calculate(query, retrieved_sources)
    
    # 7. Generate logical follow-up questions
    follow_ups = []
    if classification["is_safety_critical"]:
        follow_ups = [
            "How do I adjust safety limits in dynamic configurations?",
            "What happens if my battery voltage falls below 42.0V?",
            "Where is the physical AGRO-R1 E-stop circuit schematic?"
        ]
    elif "qos" in query.lower() or "topic" in query.lower() or "receive" in query.lower():
        follow_ups = [
            "Explain ROS 2 Durability settings.",
            "What is the difference between Keep Last and Keep All depth profiles?",
            "How does 'ros2 topic info --show-details' work?"
        ]
    elif "tf" in query.lower() or "transform" in query.lower() or "map" in query.lower():
        follow_ups = [
            "How do I fix coordinate map drift?",
            "Show a launch file setup for a static transform publisher.",
            "What does 'view_frames' output represent?"
        ]
    else:
        follow_ups = [
            "Explain Nav2 global costmap inflation parameters.",
            "What are the specifications of the AGRO-R1 visual sensors?",
            "Show code to write a custom ROS 2 publisher node."
        ]
    # 8. Extract optional structured Robot Entity Metadata
    entity = None
    if has_relevant_info:
        for src in retrieved_sources:
            if src.get("entity_type") == "ROBOT":
                entity = {
                    "id": src.get("entity_id") or src.get("id"),
                    "type": "ROBOT",
                    "name": src.get("name") or "Generic Robot",
                    "category": src.get("category") or "Uncategorized Robot",
                    "image_url": src.get("image_url"),
                    "short_description": src.get("short_description") or "Grounded robot description.",
                    "capabilities": src.get("capabilities") or [],
                    "sensors": src.get("sensors") or [],
                    "ai_technologies": src.get("ai_technologies") or [],
                    "navigation": src.get("navigation") or [],
                    "applications": src.get("applications") or [],
                    "specifications": src.get("specifications") or {}
                }
                break

    # Fallback checking if the query is a direct specific robot model search
    if not entity and any(w in query.lower() for w in ["agro-r1", "agro r1", "show agro-r1"]):
        for doc in vector_store.documents:
            if doc.get("entity_id") == "AGRO-R1":
                entity = {
                    "id": doc.get("entity_id"),
                    "type": "ROBOT",
                    "name": doc.get("name"),
                    "category": doc.get("category"),
                    "image_url": doc.get("image_url"),
                    "short_description": doc.get("short_description"),
                    "capabilities": doc.get("capabilities"),
                    "sensors": doc.get("sensors"),
                    "ai_technologies": doc.get("ai_technologies"),
                    "navigation": doc.get("navigation"),
                    "applications": doc.get("applications"),
                    "specifications": doc.get("specifications")
                }
                break

    return {
        "query": query,
        "reply": answer,
        "classification": classification,
        "citations": retrieved_sources,
        "safety": safety_report,
        "confidence": confidence_report,
        "follow_ups": follow_ups,
        "claims": validated_claims,
        "entity": entity,
        "parser_status": "SUCCESS",
        "grounding_status": "GROUNDED" if has_relevant_info else "INSUFFICIENT_EVIDENCE",
        "analysis_status": "HEALTHY" if has_relevant_info else "INSUFFICIENT_DATA",
        "status": "HEALTHY" if has_relevant_info else "INSUFFICIENT_DATA"
    }

@app.post("/api/ai/debug")
def handle_debug(request: DebugRequest):
    result = log_parser.parse_log(request.log_content, request.distribution)
    return result

@app.post("/api/ai/nav2")
def handle_nav2_analysis(request: YamlRequest):
    result = config_analyzer.analyze_nav2_yaml(
        request.yaml_content,
        request.context,
        request.analysis_mode,
        request.ros_distribution,
        request.runtime_evidence
    )
    return result

@app.post("/api/ai/urdf")
def handle_urdf_analysis(request: UrdfRequest):
    result = urdf_analyzer.analyze_urdf_xml(request.urdf_content, request.context)
    return result

@app.get("/api/ai/urdf/agro")
def get_agro_urdf():
    return {"urdf": urdf_analyzer.get_agro_r1_urdf()}

@app.get("/api/ai/sources")
def list_sources():
    return {"documents": vector_store.documents}

@app.post("/api/ai/sources")
def add_source(doc: DocumentIngestion):
    doc_dict = doc.model_dump()
    vector_store.add_document(doc_dict)
    return {"success": True, "message": f"Document '{doc.title}' ingested successfully."}

@app.delete("/api/ai/sources/{doc_id}")
def delete_source(doc_id: str):
    success = vector_store.delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document ID not found in database.")
    return {"success": True, "message": "Document deleted successfully."}

# Unified Backend Routes (migrated from Express server.js)
class ContactRequest(BaseModel):
    name: str
    email: str
    message: str

@app.get("/api/robotics")
def get_robotics():
    return robot_types

@app.get("/api/posts")
def get_posts():
    return blog_posts

@app.post("/api/contact")
def handle_contact(request: ContactRequest):
    print(f"Received contact inquiry: {request.model_dump()}")
    return {"success": True, "message": "Inquiry received"}

# RPA Database In-Memory Models & Stores
rpa_bots_store = [
    { "id": "BOT-01", "name": "Invoice Processing Bot", "status": "RUNNING", "workflow": "ERP Invoice Automation", "assignedTasks": 42, "successRate": 98.4, "cpu": 34, "memory": 420, "lastRun": "2 mins ago" },
    { "id": "BOT-02", "name": "Email Attachment Scraper", "status": "RUNNING", "workflow": "PO Email Scraping Pipeline", "assignedTasks": 128, "successRate": 99.1, "cpu": 18, "memory": 280, "lastRun": "Just now" }
]
rpa_workflows_store = [
    {
        "id": "WF-101",
        "name": "ERP Invoice Automation",
        "category": "Document Automation",
        "blockCount": 9,
        "created": "2026-02-15",
        "status": "Active",
        "blocks": [
            { "id": "n1", "type": "Start", "label": "Start Flow", "x": 50, "y": 50, "config": { "trigger": "Scheduled Cron" } },
            { "id": "n2", "type": "Read Email", "label": "Fetch Invoices Email", "x": 230, "y": 50, "config": { "folder": "Inbox/Invoices", "unreadOnly": True } },
            { "id": "n3", "type": "Download Attachment", "label": "Save PDF Invoices", "x": 410, "y": 50, "config": { "savePath": "./temp/invoices" } },
            { "id": "n4", "type": "OCR", "label": "EasyOCR Extract", "x": 590, "y": 50, "config": { "engine": "EasyOCR", "confidenceMin": 0.85 } },
            { "id": "n5", "type": "Extract Data", "label": "Parse Invoice Fields", "x": 590, "y": 180, "config": { "fields": ["Invoice", "Amount", "Date", "GST"] } },
            { "id": "n6", "type": "Validate Data", "label": "Verify PO Match", "x": 410, "y": 180, "config": { "rule": "Amount > 0 AND PO != null" } },
            { "id": "n7", "type": "Database Insert", "label": "Push to PostgreSQL", "x": 230, "y": 180, "config": { "table": "erp_invoices" } },
            { "id": "n8", "type": "Send Email", "label": "Notify Accounts Team", "x": 50, "y": 180, "config": { "recipient": "accounts@dvjgroup.ai" } },
            { "id": "n9", "type": "End", "label": "Finish Workflow", "x": 50, "y": 310, "config": {} }
        ]
    },
    {
        "id": "WF-102",
        "name": "PO Email Scraping Pipeline",
        "category": "Email & File RPA",
        "blockCount": 6,
        "created": "2026-02-20",
        "status": "Active",
        "blocks": [
            { "id": "n1", "type": "Start", "label": "Trigger Event", "x": 50, "y": 60, "config": {} },
            { "id": "n2", "type": "Read Email", "label": "Scan Outlook Orders", "x": 230, "y": 60, "config": {} },
            { "id": "n3", "type": "Read Excel", "label": "Parse Master PO List", "x": 420, "y": 60, "config": {} },
            { "id": "n4", "type": "Decision", "label": "Valid Vendor?", "x": 420, "y": 200, "config": {} },
            { "id": "n5", "type": "Database Update", "label": "Update DB Orders", "x": 230, "y": 200, "config": {} },
            { "id": "n6", "type": "End", "label": "Task Complete", "x": 50, "y": 200, "config": {} }
        ]
    }
]
rpa_jobs_store = [
    { "id": "JOB-901", "botName": "Invoice Processing Bot", "workflowName": "ERP Invoice Automation", "status": "COMPLETED", "duration": "4.2s", "itemsProcessed": 14, "timestamp": "2026-03-01 16:40" }
]
rpa_logs_store = [
    { "id": 1, "timestamp": "16:44:12", "level": "INFO", "botId": "BOT-04", "message": "Database Sync Robot initiated batch transfer of 200 records." }
]
rpa_schedules_store = [
    { "id": "SCH-01", "workflowName": "ERP Invoice Automation", "botName": "Invoice Processing Bot", "cron": "*/15 * * * *", "nextRun": "In 6 mins", "status": "ACTIVE" }
]
rpa_reports_store = []

@app.get("/api/rpa/workflows")
def get_rpa_workflows():
    return rpa_workflows_store

@app.post("/api/rpa/workflows")
def create_rpa_workflow(data: Dict[str, Any] = Body(...)):
    wf = {"id": f"WF-{len(rpa_workflows_store)+101}", **data}
    rpa_workflows_store.append(wf)
    return {"success": True, "workflow": wf}

@app.get("/api/rpa/bots")
def get_rpa_bots():
    return rpa_bots_store

@app.post("/api/rpa/bots")
def create_rpa_bot(data: Dict[str, Any] = Body(...)):
    bot = {"id": f"BOT-0{len(rpa_bots_store)+1}", **data}
    rpa_bots_store.append(bot)
    return {"success": True, "bot": bot}

@app.post("/api/rpa/bots/{bot_id}/action")
def bot_action(bot_id: str, payload: Dict[str, Any] = Body(...)):
    action = payload.get("action", "")
    for b in rpa_bots_store:
        if b["id"] == bot_id:
            if action in ["start", "running"]:
                b["status"] = "RUNNING"
            elif action in ["pause", "paused"]:
                b["status"] = "PAUSED"
            elif action in ["stop", "idle"]:
                b["status"] = "IDLE"
            return {"success": True, "bot": b}
    return {"success": True}

@app.delete("/api/rpa/bots/{bot_id}")
def delete_rpa_bot(bot_id: str):
    global rpa_bots_store
    rpa_bots_store = [b for b in rpa_bots_store if b["id"] != bot_id]
    return {"success": True}

@app.get("/api/rpa/jobs")
def get_rpa_jobs():
    return rpa_jobs_store

@app.post("/api/rpa/jobs")
def create_rpa_job(data: Dict[str, Any] = Body(...)):
    job = {"id": f"JOB-{len(rpa_jobs_store)+901}", **data}
    rpa_jobs_store.append(job)
    return {"success": True, "job": job}

@app.get("/api/rpa/reports")
def get_rpa_reports():
    return rpa_reports_store

@app.post("/api/rpa/reports")
def create_rpa_report(data: Dict[str, Any] = Body(...)):
    rep = {"id": f"RPA-REP-{len(rpa_reports_store)+1001}", **data}
    rpa_reports_store.append(rep)
    return {"success": True, "report": rep}

@app.get("/api/rpa/logs")
def get_rpa_logs():
    return rpa_logs_store

@app.post("/api/rpa/logs")
def add_rpa_log(data: Dict[str, Any] = Body(...)):
    log = {"id": len(rpa_logs_store)+1, **data}
    rpa_logs_store.append(log)
    return {"success": True, "log": log}

@app.get("/api/rpa/scheduler")
def get_rpa_schedules():
    return rpa_schedules_store

@app.post("/api/rpa/scheduler")
def create_rpa_schedule(data: Dict[str, Any] = Body(...)):
    sch = {"id": f"SCH-0{len(rpa_schedules_store)+1}", **data}
    rpa_schedules_store.append(sch)
    return {"success": True, "schedule": sch}

# Weeks 4-8 Enterprise APIs
@app.get("/api/process-mining/variants")
def get_pm_variants():
    return [
        { "id": "V1", "name": "Standard Order-to-Fulfill", "throughputTime": "4.2 hrs" },
        { "id": "V2", "name": "Exception Rework Variant", "throughputTime": "18.6 hrs" }
    ]

@app.get("/api/digital-twin/telemetry")
def get_dt_telemetry():
    return { "vibration": 2.4, "temperature": 42.1, "spindleRPM": 3200, "equipmentHealth": 98.2 }

@app.get("/api/iiot/devices")
def get_iiot_devices():
    return [
        { "id": "DEV-101", "name": "Siemens S7-1500 PLC", "protocol": "OPC UA", "status": "ONLINE" },
        { "id": "DEV-104", "name": "NVIDIA Jetson Orin Edge Node", "protocol": "MQTT", "status": "ONLINE" }
    ]

@app.get("/api/computer-vision/defects")
def get_cv_defects():
    return [
        { "id": 1, "label": "Gear Surface Crack", "confidence": "99.4%", "isDefect": True },
        { "id": 2, "label": "Worker Safety Helmet", "confidence": "98.1%", "isDefect": False }
    ]

@app.get("/api/copilot-agents/swarm")
def get_agent_swarm():
    return [
        { "name": "Planner Agent", "status": "ACTIVE", "decisionScore": 99.1 },
        { "name": "Supervisor Agent", "status": "ACTIVE", "decisionScore": 100.0 }
    ]



# Serve static files from React build folder in production
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
dist_path = os.path.join(BASE_DIR, "dist")

print(f"DEBUG DEPLOY: BASE_DIR={BASE_DIR}")
print(f"DEBUG DEPLOY: dist_path={dist_path}")
print(f"DEBUG DEPLOY: dist_path exists={os.path.exists(dist_path)}")

if os.path.exists(dist_path):
    print(f"DEBUG DEPLOY: contents of dist={os.listdir(dist_path)}")
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    
    # Mount the /assets folder for Vite build assets
    assets_path = os.path.join(dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
        
    @app.get("/{catchall:path}")
    def serve_react_app(catchall: str):
        # Prevent catching API routes
        if catchall.startswith("api"):
            raise HTTPException(status_code=404, detail="Not Found")
            
        file_path = os.path.join(dist_path, catchall)
        print(f"DEBUG DEPLOY: Request path='/{catchall}', File path='{file_path}', Exists={os.path.exists(file_path)}")
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file_path = os.path.join(dist_path, "index.html")
        print(f"DEBUG DEPLOY: Serving index.html from '{index_file_path}', Exists={os.path.exists(index_file_path)}")
        return FileResponse(index_file_path)

