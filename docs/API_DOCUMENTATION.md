# 🔗 DJ Group AI & Industrial Robotics API Reference Documentation

> **DecodeLabs Internship Project Submission**  
> **Backend Architecture:** Dual Microservices (Express Gateway + FastAPI AI Service)

---

## 📌 Microservice Endpoint Summary

| Service | Port | Base URL | Primary Role |
|---|---|---|---|
| **Express Gateway** | `5000` | `http://localhost:5000` | Core Robotics Knowledge, Articles, Assistant |
| **FastAPI AI Engine** | `8000` | `http://localhost:8000` | Grounding, Log Diagnostics, Trajectory Analytics |

---

## 1. 🚀 Node.js / Express API Endpoints (Port 5000)

### 1.1 Get Robotics Knowledge Base
- **Endpoint:** `GET /api/robotics`
- **Description:** Returns a structured list of robot classifications, specifications, and applications.
- **Response Format:**
  ```json
  [
    {
      "id": "industrial_robots",
      "title": "Industrial Robots",
      "description": "High-precision articulated arms used in manufacturing, welding, and assembly.",
      "applications": ["Automotive Assembly", "Spot Welding", "Palletizing"]
    }
  ]
  ```

### 1.2 Robotics AI Assistant Endpoint
- **Endpoint:** `POST /api/assistant`
- **Description:** Accepts natural language questions regarding robotics, drones, and automation.
- **Request Body:**
  ```json
  {
    "question": "What is the difference between AMR and AGV?"
  }
  ```
- **Response Format:**
  ```json
  {
    "answer": "Autonomous Mobile Robots (AMRs) navigate dynamically using onboard LiDAR and SLAM, whereas Automated Guided Vehicles (AGVs) rely on fixed magnetic strips or markers.",
    "category": "mobile_robotics",
    "timestamp": "2026-08-12T17:40:00Z"
  }
  ```

### 1.3 Robotics News & Articles
- **Endpoint:** `GET /api/articles`
- **Description:** Retrieves educational articles on ROS 2, computer vision, kinematics, and deep learning.

### 1.4 System Health Check
- **Endpoint:** `GET /api/status`
- **Response Format:**
  ```json
  {
    "status": "online",
    "uptime": 3600,
    "service": "DJ-Group-Express-Backend"
  }
  ```

---

## 2. ⚡ Python FastAPI AI Endpoints (Port 8000)

### 2.1 Service Health
- **Endpoint:** `GET /health`
- **Response Format:**
  ```json
  {
    "status": "healthy",
    "version": "1.0.0"
  }
  ```

### 2.2 ROS Log Diagnostic Analysis
- **Endpoint:** `POST /api/diagnostics/analyze-log`
- **Description:** Parses raw ROS / ROS 2 console outputs and extracts errors, warnings, stack traces, and affected nodes.
- **Request Body:**
  ```json
  {
    "log_text": "[ERROR] [1710000000.123]: Controller joint_trajectory_controller failed due to motor over-temperature warning on Joint 3."
  }
  ```
- **Response Format:**
  ```json
  {
    "severity": "HIGH",
    "affected_node": "joint_trajectory_controller",
    "root_cause": "Thermal threshold exceeded on motor joint 3",
    "suggested_actions": ["Cool down actuator", "Reduce joint velocity profile", "Check encoder feedback"]
  }
  ```

### 2.3 Knowledge Grounding Query
- **Endpoint:** `POST /api/grounding/query`
- **Description:** Executes grounded AI retrieval against verified robotics engineering documentation.
- **Request Body:**
  ```json
  {
    "query": "DH parameters for 6-DOF PUMA 560"
  }
  ```
- **Response Format:**
  ```json
  {
    "grounded": true,
    "source": "Standard Kinematic Database",
    "confidence": 0.98,
    "content": "PUMA 560 joint parameters: theta_1..6, d_1..6, a_1..6, alpha_1..6..."
  }
  ```

### 2.4 Claim Verification Endpoint
- **Endpoint:** `POST /api/grounding/verify-claim`
- **Description:** Validates user or AI-generated statements against physical kinematic laws.

---

## 🧪 Interactive Swagger Documentation

When running the FastAPI server, interactive OpenAPI / Swagger UI documentation is available at:
`http://localhost:8000/docs`
