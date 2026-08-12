# WEEK 2 – AUTOMATED QUALITY INSPECTION SYSTEM
## Industrial Computer Vision & Automated Quality Inspection Workstation

An industrial-grade computer vision quality inspection system built with Python, OpenCV, Flask, SQLite, and HTML5 Canvas. Performs real pixel-matrix analysis on industrial component images (Gears, Bolts, PCBs, Surface Plates), running a 15-Stage OpenCV computer vision pipeline to classify parts as **PASS** or **FAIL** with visual evidence overlays, telecentric metric dimensioning, live Chart.js analytics, and automated multi-format report generation (PDF, CSV, Excel, JSON).

---

## 🌟 Key Features

1. **15-Stage OpenCV Computer Vision Pipeline**:
   - Stage 1: Read Image Matrix
   - Stage 2: Grayscale Conversion
   - Stage 3: 5x5 Gaussian Blur Noise Filtering
   - Stage 4: Otsu / Binary Thresholding
   - Stage 5: Morphological Closing & Opening Filters
   - Stage 6: Sobel Gx/Gy & Canny Edge Detection
   - Stage 7: Component Contour Tracing
   - Stage 8: Minimum Convex Hull Outer Envelope
   - Stage 9: Convexity Defects & Recess Analysis
   - Stage 10: Axis-Aligned & Oriented Minimum Area Bounding Boxes
   - Stage 11: Pixel-to-mm Calibrated Dimension Measurement
   - Stage 12: Invariant Shape Metrics (Circularity, Solidity, Aspect Ratio)
   - Stage 13: Feature Defect Classification (8 Categories)
   - Stage 14: Evidence-based Confidence Math Analysis
   - Stage 15: Final PASS/FAIL Classification & Annotated Image Render

2. **Defect Categories Supported**:
   - Missing Gear Tooth
   - Broken Gear Tooth
   - Crack Detection
   - Missing Screw/Bolt
   - Surface Scratch
   - Wrong Shape
   - Missing Component
   - Incorrect Dimensions

3. **High-Speed Optical Conveyor Simulator (60 FPS)**:
   - Real-time HTML5 Canvas animation of industrial rollers, moving components, and overhead laser scanning camera.

4. **Multi-Format Report Generator**:
   - PDF (ReportLab)
   - CSV (Standard library)
   - Excel (OpenPyXL)
   - JSON Telemetry Export

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- pip package manager

### Installation

```bash
cd quality_inspection_system
pip install -r requirements.txt
```

### Running the Application

Launch using `python app.py` or `python start_app.py`:

```bash
python app.py 5000
```

Open your browser and navigate to:
[http://localhost:5000](http://localhost:5000)

---

## 🧪 Running Automated Tests

Run the comprehensive unit & integration test suite:

```bash
python -m unittest discover -s tests
```
