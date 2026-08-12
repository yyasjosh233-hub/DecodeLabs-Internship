# DecodeLabs Internship — Comprehensive Project Documentation

## Executive Summary

This repository contains the complete industrial engineering suite developed for the **DecodeLabs Internship Program**. The platform unites three core industrial automation projects into a cohesive, high-performance web and backend system:

1. **Project 1 — 6-DOF Robotics Path Planner PRO**: Forward & Inverse Kinematics, Jacobian Singularity Analysis, Quintic Trajectory Generation, 3D Collision Detection, Emergency Stop, and ROS 2 Integration.
2. **Project 2 — Automated Quality Inspection System**: 15-Stage OpenCV Computer Vision Pipeline, Synthetic Industrial Component Dataset Generator, Real-time Defect Classification, Telecentric Dimensioning, and Automated Multi-Format Reporting (PDF, CSV, Excel, JSON).
3. **Project 3 — Autonomous Mobile Robot (AMR) Navigation**: 2D Occupancy Grid Mapping, Extended Kalman Filter (EKF) Localization, Custom A* Pathfinding (Manhattan Heuristic), Global & Local Obstacle Inflation Costmaps, Dynamic Obstacle Avoidance with Tanh Deceleration Curves, and Reflex Re-planning.

---

## 1. Project 1 — 6-DOF Robotics Path Planner

### Architecture & Physics Engine
- **Kinematics**: Standard 6-DOF Industrial Manipulator Denavit-Hartenberg (DH) parameterization. Forward Kinematics computes $T_{06} \in SE(3)$ transformation matrices and 3D joint node positions.
- **Inverse Kinematics (IK)**: Damped Least Squares (DLS) numerical optimization with Jacobian transpose damping. Computes up to 8 valid joint configurations while respecting joint angular limits.
- **Jacobian & Singularities**: $6 \times 6$ velocity Jacobian calculation. Determinant $\det(J)$, manipulability index $w = \sqrt{\det(J J^T)}$, and condition number $\kappa(J) = \frac{\sigma_{\max}}{\sigma_{\min}}$ warning thresholding.
- **Trajectory Generation**: 5th-degree (Quintic) polynomial interpolation ensuring $C^2$ continuity (smooth position, velocity, and acceleration profiles) with zero start/end boundary velocities.
- **3D Collision Engine**: Point-to-segment distance algorithm for primitive volumes (Sphere, Box, Cylinder) and self-collision avoidance between non-adjacent arm links.
- **ROS 2 Interface**: Formats trajectories into standard `trajectory_msgs/JointTrajectory` and `sensor_msgs/JointState` JSON payloads.

---

## 2. Project 2 — Automated Quality Inspection System

### 15-Stage Computer Vision Pipeline
The vision engine processes high-resolution industrial component images through a deterministic 15-stage OpenCV pipeline:
1. **Raw Input Acquisition**: Image loading and spatial dimension normalization ($640 \times 480$).
2. **Grayscale Conversion**: Single-channel intensity mapping.
3. **Gaussian Blur**: Surface noise reduction using a $5 \times 5$ kernel ($\sigma = 1.2$).
4. **CLAHE Equalization**: Contrast Limited Adaptive Histogram Equalization for metallic reflection mitigation.
5. **Otsu Thresholding**: Automatic bimodal background segmentation.
6. **Canny Edge Detection**: Dual-threshold edge extraction ($L_1 = 50$, $L_2 = 150$).
7. **Morphological Opening**: Elliptical kernel erosion/dilation for specular noise removal.
8. **Contour Extraction**: Hierarchical contour retrieval (`RETR_TREE`).
9. **Component Bounding Boxes**: Oriented Bounding Box (OBB) & Axis-Aligned Bounding Box (AABB) fitting.
10. **Gear Tooth / Feature Segmentation**: Polar coordinate conversion and circular frequency analysis.
11. **Telecentric Metric Dimensioning**: Pixel-to-millimeter ratio calibration ($0.125 \text{ mm/pixel}$) for Pitch Circle, Outer Diameter, and Inner Bore measurement.
12. **Defect Isolation**: Difference mask extraction against ideal CAD templates.
13. **Distance Transform**: Medial axis calculation for surface crack propagation depth.
14. **Visual Anomaly Overlay**: Color-coded bounding box & contour annotation (Red = Critical Crack, Amber = Surface Corrosion, Green = Pass Feature).
15. **Verdict Generation**: Final confidence-weighted PASS/FAIL decision.

---

## 3. Project 3 — Autonomous Mobile Robot (AMR) Navigation

### Navigation Algorithms & Sensor Fusion
- **Occupancy Grid Mapping**: $50 \times 50$ 2D grid map with log-odds occupancy updating from 360° LiDAR raycasting.
- **EKF Sensor Fusion**: Extended Kalman Filter estimating 6-state pose vector $\mathbf{x} = [x, y, \theta, v_x, v_y, \omega]^T$ by fusing wheel odometry and 6-DOF IMU telemetry.
- **Custom A* Pathfinding**: Global path planning using Manhattan distance heuristic $h(n) = |x_g - x_n| + |y_g - y_n|$ with 8-connectivity motion primitives.
- **Inflation Layers**:
  - *Global Costmap*: Euclidean distance transform inflating static walls by safety margin ($r_{inf} = 0.35\text{ m}$).
  - *Local Costmap*: Real-time $15 \times 15$ window around robot tracking dynamic obstacles.
- **Dynamic Obstacle Avoidance**: Reflex Tanh deceleration curve $v(d) = v_{max} \cdot \tanh(\gamma \cdot (d - d_{min}))$ enforcing smooth slowing when an obstacle enters the local costmap, triggering dynamic A* re-planning if path is blocked.

---

## Technical Stack Overview

| Domain | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite, TailwindCSS / CSS Modules |
| **3D Rendering** | Three.js, WebGL, `@types/three` |
| **Icons & Design** | Lucide React, Glassmorphic Modern Dark Theme |
| **Backend Service** | Python 3.10+, Flask, SQLite3, ReportLab (PDF), OpenPyXL, Pandas |
| **Computer Vision** | OpenCV (`opencv-python-headless`), NumPy, SciPy |
| **ROS 2 Simulation** | ROS 2 Humble / Iron package structure (`amr_bringup`, `amr_planner`, `amr_description`) |
| **Testing** | Node.js TSX test runner, Python `unittest` framework |
