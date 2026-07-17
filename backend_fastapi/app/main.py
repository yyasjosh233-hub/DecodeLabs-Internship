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
        answer = "I couldn't find sufficiently relevant information in the approved robotics sources."
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
