# DecodeLabs Internship — API Reference Documentation

## Overview

The DecodeLabs Industrial Automation Portal provides RESTful API endpoints for Quality Inspection, AMR Navigation, Robotics Kinematics, and System Telemetry.

---

## 1. Project 2 — Quality Inspection API

### 1.1 Process Image Inspection
- **Endpoint**: `POST /api/inspect`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `file`: Image file (`.png`, `.jpg`, `.jpeg`)
- **Response** `200 OK`:
  ```json
  {
    "status": "success",
    "inspection_id": "INS-618AA998",
    "verdict": "PASS",
    "confidence": 0.984,
    "measurements": {
      "outer_diameter_mm": 120.04,
      "pitch_circle_mm": 95.01,
      "concentricity_error_mm": 0.032
    },
    "defects": [],
    "annotated_image_url": "/static/processed/annotated_INS-618AA998.png"
  }
  ```

### 1.2 Multi-Format Report Generation
- **Endpoint**: `GET /api/reports/download/<inspection_id>/<format>`
- **URL Parameters**:
  - `inspection_id`: String (e.g. `INS-618AA998`)
  - `format`: `pdf` | `csv` | `xlsx` | `json`
- **Response**: Binary File Download (`application/pdf`, `text/csv`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `application/json`).

---

## 2. Project 3 — AMR Navigation API

### 2.1 Get AMR State
- **Endpoint**: `GET /api/amr/state`
- **Response** `200 OK`:
  ```json
  {
    "status": "success",
    "state": {
      "mode": "SIMULATION",
      "nav_status": "NAVIGATING_TO_GOAL",
      "ekf_pose": { "x": 4.25, "y": 2.10, "yaw": 0.785 },
      "velocity": { "linear": 0.45, "angular": 0.02 },
      "battery_percent": 94.5,
      "path": [[0.5, 0.5], [1.0, 1.0], [4.25, 2.10]],
      "dynamic_obstacle_active": false
    }
  }
  ```

### 2.2 Set Navigation Goal
- **Endpoint**: `POST /api/amr/set_goal`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "x": 8.5,
    "y": 6.0
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "status": "success",
    "message": "Goal updated successfully",
    "plan": {
      "path_nodes": 42,
      "path_length_m": 11.2,
      "planning_time_ms": 3.8
    }
  }
  ```

### 2.3 Trigger Dynamic Obstacle Injection
- **Endpoint**: `POST /api/amr/inject_obstacle`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "x": 4.5,
    "y": 2.2,
    "radius": 0.4
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "status": "success",
    "obstacle": { "id": "dyn-1", "x": 4.5, "y": 2.2 },
    "replanned": true,
    "deceleration_active": true
  }
  ```

### 2.4 Emergency Stop & Reset
- **Endpoint**: `POST /api/amr/estop`
- **Response** `200 OK`:
  ```json
  {
    "status": "success",
    "nav_status": "EMERGENCY_STOP",
    "velocity": { "linear": 0.0, "angular": 0.0 }
  }
  ```

---

## 3. Project 1 — Robotics Kinematics API (ROS 2 Bridge)

### 3.1 Inverse Kinematics Endpoint
- **Endpoint**: `POST /api/robotics/ik`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "target_pose": { "x": 0.4, "y": 0.2, "z": 0.5, "roll": 0, "pitch": 0, "yaw": 0 },
    "seed_joints": { "q1": 0, "q2": 0, "q3": 0, "q4": 0, "q5": 0, "q6": 0 }
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "solution": { "q1": 26.57, "q2": -18.42, "q3": 34.15, "q4": 0.0, "q5": 44.27, "q6": -26.57 },
    "error_distance_mm": 1.2,
    "iterations": 14
  }
  ```
