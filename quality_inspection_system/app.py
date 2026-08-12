import os
os.environ["OPENCV_LOG_LEVEL"] = "OFF"
os.environ["OPENCV_VIDEOIO_PRIORITY_MSMF"] = "0" # Prefer DirectShow over MSMF on Windows

from flask import Flask, render_template, request, jsonify, send_file, Response, send_from_directory
import uuid
import time
import cv2
import json
import sys
import threading
from datetime import datetime

from database import init_db, save_inspection, get_stats, get_history, get_inspection_by_id
from cv_engine import process_inspection_pipeline
from synthetic_data import generate_all_samples, create_gear_image
from report_generator import generate_pdf_report, generate_csv_report, generate_excel_report, generate_json_report

from amr_engine import AMRNavigationEngine

# Initialize Project 3 AMR Engine
amr_engine = AMRNavigationEngine()

def _run_amr_simulation_loop():
    """Background thread running continuous 20Hz simulation step for AMR navigation."""
    while True:
        try:
            amr_engine.update_simulation_step(dt=0.05)
        except Exception as e:
            print(f"[AMR Loop Error]: {e}")
        time.sleep(0.05)

threading.Thread(target=_run_amr_simulation_loop, daemon=True).start()

app = Flask(__name__)

BASE_DIR = os.path.dirname(__file__)
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
PROCESSED_FOLDER = os.path.join(BASE_DIR, "processed")
SAMPLE_FOLDER = os.path.join(BASE_DIR, "sample_dataset")
# Week 1 Robotics Path Planner built dist folder
WEEK1_DIST = os.path.join(BASE_DIR, "..", "dist")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)
os.makedirs(SAMPLE_FOLDER, exist_ok=True)

init_db()
if not os.path.exists(os.path.join(SAMPLE_FOLDER, "pass", "good_gear.png")):
    generate_all_samples(SAMPLE_FOLDER)

# ---------------------------------------------------------
# Camera State - Lazy initialization on-demand
# ---------------------------------------------------------
_camera = None
_camera_lock = threading.Lock()
_camera_available = False
_camera_initialized = False
_stream_active = False   # Disabled on startup; opens on-demand
_camera_index = 0

def try_open_camera(idx):
    """Attempt to open camera index with DirectShow, MediaFoundation, and default backend."""
    backends = []
    if hasattr(cv2, 'CAP_DSHOW'): backends.append(cv2.CAP_DSHOW)
    if hasattr(cv2, 'CAP_MSMF'):  backends.append(cv2.CAP_MSMF)
    backends.append(None)

    for backend in backends:
        try:
            cap = cv2.VideoCapture(idx, backend) if backend is not None else cv2.VideoCapture(idx)
            if cap.isOpened():
                ret, frame = cap.read()
                if ret and frame is not None and frame.size > 0:
                    return cap
                cap.release()
        except Exception:
            pass
    return None

def _init_camera():
    global _camera, _camera_available, _camera_index, _camera_initialized
    with _camera_lock:
        if _camera_initialized and _camera is not None and _camera.isOpened():
            return
        if _camera is not None:
            try:
                _camera.release()
            except Exception:
                pass
            _camera = None
        _camera_available = False

        for idx in range(4):
            cap = try_open_camera(idx)
            if cap is not None:
                _camera = cap
                _camera_available = True
                _camera_index = idx
                _camera_initialized = True
                print(f"  [OK] Lazy webcam initialized on-demand (Camera Index {idx})")
                return
        
        _camera_initialized = True
        print("  [INFO] No physical webcam detected on indices 0..3 - using synthetic optical stream.")


# ---------------------------------------------------------
# ROUTES: UNIFIED PORTAL & WEEK 1, 2, 3 SERVE
# ---------------------------------------------------------
@app.route('/')
def portal():
    """Unified landing portal with project cards linking to Week 1, Week 2, and Project 3 AMR."""
    return render_template('portal.html')

@app.route('/split')
def split_view():
    """Full-screen side-by-side split view of projects."""
    return render_template('split.html')


@app.route('/week1/')
@app.route('/week1')
def week1_index():
    """Serve Week 1 Robotics Path Planner React app index."""
    dist_index = os.path.join(WEEK1_DIST, "index.html")
    if not os.path.exists(dist_index):
        return "<h2>Week 1 dist not found. Run: <code>npm run build</code> in the Robotics&Automation directory.</h2>", 404
    return send_from_directory(WEEK1_DIST, "index.html")

@app.route('/week1/<path:filename>')
def week1_static(filename):
    """Serve Week 1 built static assets (JS, CSS, etc.)."""
    file_path = os.path.join(WEEK1_DIST, filename)
    if os.path.exists(file_path):
        return send_from_directory(WEEK1_DIST, filename)
    # Fallback: SPA routing — return index.html
    return send_from_directory(WEEK1_DIST, "index.html")

@app.route('/week2/')
@app.route('/week2')
def week2_index():
    """Serve Week 2 Quality Inspection System dashboard."""
    return render_template('index.html')

@app.route('/week3/')
@app.route('/week3')
def week3_index():
    """Serve Project 3 AMR Navigation System dashboard."""
    return render_template('project3_amr.html')

# ---------------------------------------------------------
# ROUTES: PROJECT 3 AMR NAVIGATION REST API
# ---------------------------------------------------------
@app.route('/api/amr/state', methods=['GET'])
def api_amr_state():
    return jsonify(amr_engine.get_full_state_dict())

@app.route('/api/amr/start', methods=['POST'])
def api_amr_start():
    data = request.json or {}
    sx = float(data.get('x', 1.0))
    sy = float(data.get('y', 1.0))
    amr_engine.start_pose = (sx, sy)
    amr_engine.gt_x = sx
    amr_engine.gt_y = sy
    amr_engine.ekf.x[0, 0] = sx
    amr_engine.ekf.x[1, 0] = sy
    amr_engine.add_log("INFO", f"Start Pose set to ({sx:.1f}, {sy:.1f}).")
    return jsonify({"status": "success", "start_pose": amr_engine.start_pose})

@app.route('/api/amr/goal', methods=['POST'])
def api_amr_goal():
    data = request.json or {}
    gx = float(data.get('x', 8.0))
    gy = float(data.get('y', 7.0))
    amr_engine.goal_pose = (gx, gy)
    amr_engine.add_log("INFO", f"Goal Pose set to ({gx:.1f}, {gy:.1f}).")
    success, path = amr_engine.plan_custom_a_star()
    return jsonify({
        "status": "success" if success else "error",
        "goal_pose": amr_engine.goal_pose,
        "a_star_diagnostics": amr_engine.a_star_diagnostics,
        "path": path
    })

@app.route('/api/amr/plan', methods=['POST'])
def api_amr_plan():
    success, path = amr_engine.plan_custom_a_star()
    return jsonify({
        "status": "success" if success else "error",
        "a_star_diagnostics": amr_engine.a_star_diagnostics,
        "path": path
    })

@app.route('/api/amr/navigate', methods=['POST'])
def api_amr_navigate():
    data = request.json or {}
    action = data.get('action', 'start')
    if action == 'start':
        if not amr_engine.global_path:
            success, path = amr_engine.plan_custom_a_star()
            if not success:
                return jsonify({"status": "error", "message": "Planning failed"}), 400
        amr_engine.is_paused = False
        amr_engine.nav_state = "NAVIGATING"
        amr_engine.add_log("INFO", "Navigation started toward goal.")
    elif action == 'pause':
        amr_engine.is_paused = True
        amr_engine.cmd_linear_vel = 0.0
        amr_engine.cmd_angular_vel = 0.0
        amr_engine.add_log("WARNING", "Navigation paused by user.")
    elif action == 'resume':
        amr_engine.is_paused = False
        amr_engine.nav_state = "NAVIGATING"
        amr_engine.add_log("INFO", "Navigation resumed.")
    elif action == 'stop':
        amr_engine.cmd_linear_vel = 0.0
        amr_engine.cmd_angular_vel = 0.0
        amr_engine.nav_state = "IDLE"
        amr_engine.add_log("INFO", "Navigation stopped.")
    return jsonify({"status": "success", "nav_state": amr_engine.nav_state})

@app.route('/api/amr/estop', methods=['POST'])
def api_amr_estop():
    amr_engine.trigger_emergency_stop()
    return jsonify({"status": "success", "nav_state": amr_engine.nav_state})

@app.route('/api/amr/reset', methods=['POST'])
def api_amr_reset():
    amr_engine.reset_system()
    return jsonify({"status": "success", "message": "AMR System Reset"})

@app.route('/api/amr/teleop', methods=['POST'])
def api_amr_teleop():
    data = request.json or {}
    command = data.get('command', 'stop')
    if amr_engine.is_e_stopped and command != 'reset':
        return jsonify({"status": "error", "message": "Safety Override Active! Clear E-STOP first."}), 400

    if command == 'forward':
        amr_engine.cmd_linear_vel = min(amr_engine.max_speed, 0.4)
        amr_engine.cmd_angular_vel = 0.0
    elif command == 'backward':
        amr_engine.cmd_linear_vel = -0.3
        amr_engine.cmd_angular_vel = 0.0
    elif command == 'left':
        amr_engine.cmd_linear_vel = 0.1
        amr_engine.cmd_angular_vel = 0.8
    elif command == 'right':
        amr_engine.cmd_linear_vel = 0.1
        amr_engine.cmd_angular_vel = -0.8
    elif command == 'stop':
        amr_engine.cmd_linear_vel = 0.0
        amr_engine.cmd_angular_vel = 0.0
    return jsonify({"status": "success", "linear_vel": amr_engine.cmd_linear_vel, "angular_vel": amr_engine.cmd_angular_vel})

@app.route('/api/amr/obstacle', methods=['POST'])
def api_amr_obstacle():
    data = request.json or {}
    action = data.get('action', 'add')
    if action == 'add':
        ox = float(data.get('x', 3.0))
        oy = float(data.get('y', 3.0))
        new_obs = {"id": f"dyn_{len(amr_engine.dynamic_obstacles)+1}", "type": "cylinder", "x": ox, "y": oy, "radius": 0.35, "vx": 0.1, "vy": 0.1, "active": True}
        amr_engine.dynamic_obstacles.append(new_obs)
        amr_engine.add_log("WARNING", f"Dynamic obstacle added at ({ox:.1f}, {oy:.1f}).")
    elif action == 'clear':
        amr_engine.dynamic_obstacles = []
        amr_engine.add_log("INFO", "Dynamic obstacles cleared.")
    return jsonify({"status": "success", "dynamic_obstacles": amr_engine.dynamic_obstacles})

@app.route('/api/amr/export/json', methods=['GET'])
def api_amr_export_json():
    json_str = amr_engine.export_data_json()
    return Response(json_str, mimetype='application/json', headers={'Content-Disposition': 'attachment;filename=amr_navigation_data.json'})

@app.route('/api/amr/export/csv', methods=['GET'])
def api_amr_export_csv():
    csv_str = amr_engine.export_data_csv()
    return Response(csv_str, mimetype='text/csv', headers={'Content-Disposition': 'attachment;filename=amr_navigation_telemetry.csv'})


# ---------------------------------------------------------
# ROUTES: WEEK 2 QUALITY INSPECTION REST API
# ---------------------------------------------------------
@app.route('/api/inspect', methods=['POST'])
def api_inspect():
    try:
        if 'image' in request.files:
            file = request.files['image']
            if file.filename == '':
                return jsonify({"error": "Empty file uploaded"}), 400
            file_bytes = file.read()
            filename = file.filename
        elif request.is_json and 'sample_path' in request.json:
            sample_rel = request.json['sample_path']
            sample_full = os.path.abspath(os.path.join(BASE_DIR, sample_rel))
            if not os.path.exists(sample_full):
                sample_full = os.path.abspath(sample_rel)
            if not os.path.exists(sample_full):
                return jsonify({"error": f"Sample path {sample_rel} does not exist."}), 404
            with open(sample_full, 'rb') as f:
                file_bytes = f.read()
            filename = os.path.basename(sample_full)

        else:
            return jsonify({"error": "No image file or sample path provided"}), 400

        results = process_inspection_pipeline(file_bytes)

        insp_id = f"INS-{uuid.uuid4().hex[:8].upper()}"
        now_str = datetime.now().isoformat()

        img_path = os.path.join(UPLOAD_FOLDER, f"{insp_id}_{filename}")
        with open(img_path, 'wb') as f:
            f.write(file_bytes)

        annotated_filename = f"annotated_{insp_id}.png"
        annotated_path = os.path.join(PROCESSED_FOLDER, annotated_filename)

        b64_data = results["annotated_b64"].split(",")[1]
        import base64
        with open(annotated_path, 'wb') as f:
            f.write(base64.b64decode(b64_data))

        inspection_data = {
            "inspection_id": insp_id,
            "timestamp": now_str,
            "filename": filename,
            "product_type": results["product_type"],
            "result": results["result"],
            "defect": results["defect"],
            "confidence": results["confidence"],
            "measurements": results["measurements"],
            "total_time_ms": results["total_time_ms"],
            "image_path": f"/uploads/{os.path.basename(img_path)}",
            "annotated_path": f"/processed/{annotated_filename}",
            "stages": results["stages"]
        }

        save_inspection(inspection_data)
        return jsonify(inspection_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-samples', methods=['POST'])
def api_generate_samples():
    try:
        generate_all_samples(SAMPLE_FOLDER)
        return jsonify({"status": "success", "message": "Synthetic dataset samples successfully generated."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def api_stats():
    return jsonify(get_stats())

@app.route('/api/history', methods=['GET'])
def api_history():
    search = request.args.get('search')
    result_filter = request.args.get('filter')
    history = get_history(limit=100, search=search, result_filter=result_filter)
    return jsonify(history)

@app.route('/api/inspection/<inspection_id>', methods=['GET'])
def api_inspection_detail(inspection_id):
    data = get_inspection_by_id(inspection_id)
    if not data:
        return jsonify({"error": "Inspection record not found"}), 404
    return jsonify(data)

@app.route('/api/report/<inspection_id>/pdf', methods=['GET'])
def download_pdf_report(inspection_id):
    data = get_inspection_by_id(inspection_id)
    if not data:
        return jsonify({"error": "Inspection record not found"}), 404
    filepath = generate_pdf_report(data)
    return send_file(filepath, as_attachment=True)

@app.route('/api/report/<inspection_id>/csv', methods=['GET'])
def download_csv_report(inspection_id):
    data = get_inspection_by_id(inspection_id)
    if not data:
        return jsonify({"error": "Inspection record not found"}), 404
    filepath = generate_csv_report(data)
    return send_file(filepath, as_attachment=True)

@app.route('/api/report/<inspection_id>/excel', methods=['GET'])
def download_excel_report(inspection_id):
    data = get_inspection_by_id(inspection_id)
    if not data:
        return jsonify({"error": "Inspection record not found"}), 404
    filepath = generate_excel_report(data)
    return send_file(filepath, as_attachment=True)

@app.route('/api/report/<inspection_id>/json', methods=['GET'])
def download_json_report(inspection_id):
    data = get_inspection_by_id(inspection_id)
    if not data:
        return jsonify({"error": "Inspection record not found"}), 404
    filepath = generate_json_report(data)
    return send_file(filepath, as_attachment=True)

@app.route('/uploads/<filename>')
def serve_upload(filename):
    return send_file(os.path.join(UPLOAD_FOLDER, filename))

@app.route('/processed/<filename>')
def serve_processed(filename):
    return send_file(os.path.join(PROCESSED_FOLDER, filename))

@app.route('/sample_dataset/<path:filepath>')
def serve_sample(filepath):
    return send_file(os.path.join(SAMPLE_FOLDER, filepath))

@app.route('/api/camera-status', methods=['GET'])
def camera_status():
    return jsonify({
        "available": _camera_available,
        "streaming": _stream_active,
        "camera_index": _camera_index
    })

@app.route('/api/camera/scan', methods=['POST'])
def camera_scan():
    _init_camera()
    return jsonify({
        "available": _camera_available,
        "streaming": _stream_active,
        "camera_index": _camera_index
    })

@app.route('/api/camera/stop', methods=['POST'])
def camera_stop():
    global _stream_active
    _stream_active = False
    return jsonify({"status": "stopped", "streaming": False})

@app.route('/api/camera/start', methods=['POST'])
def camera_start():
    global _stream_active, _camera_initialized
    _stream_active = True
    if not _camera_initialized:
        threading.Thread(target=_init_camera, daemon=True).start()
    return jsonify({"status": "started", "streaming": True})

# ---------------------------------------------------------
# VIDEO FEED: Real Webcam with Synthetic Fallback
# ---------------------------------------------------------
def _make_paused_frame():
    """Generate a static dark 'STREAM PAUSED' MJPEG frame."""
    import numpy as np
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    # Dark tinted background
    frame[:] = (10, 12, 22)
    # Two pause-bar rectangles (semi-transparent look via lines)
    cv2.rectangle(frame, (235, 160), (275, 320), (60, 60, 80), -1)
    cv2.rectangle(frame, (365, 160), (405, 320), (60, 60, 80), -1)
    # Label
    cv2.putText(frame, "CAMERA STREAM PAUSED", (90, 390),
                cv2.FONT_HERSHEY_SIMPLEX, 0.75, (100, 100, 120), 1)
    cv2.putText(frame, "Press START to resume", (145, 418),
                cv2.FONT_HERSHEY_SIMPLEX, 0.55, (60, 60, 80), 1)
    # Border
    cv2.rectangle(frame, (0, 0), (639, 479), (40, 40, 60), 2)
    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
    return buffer.tobytes()

def generate_video_frames():
    global _camera, _camera_available, _stream_active, _camera_initialized
    angle = 0

    while True:
        # ── PAUSED: send one static frame and idle ──────────────────
        if not _stream_active:
            paused_bytes = _make_paused_frame()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + paused_bytes + b'\r\n')
            time.sleep(0.5)   # low-rate heartbeat while paused
            continue

        if not _camera_initialized:
            _init_camera()


        frame_read = False

        # ── REAL WEBCAM ─────────────────────────────────────────────
        if _camera_available and _camera is not None:
            with _camera_lock:
                try:
                    ret, frame = _camera.read()
                    if ret and frame is not None:
                        frame = cv2.resize(frame, (640, 480))
                        now = datetime.now().strftime("%H:%M:%S.%f")[:-3]
                        cv2.rectangle(frame, (0, 0), (640, 34), (10, 10, 20), -1)
                        cv2.putText(frame, f"OPENCV CAM  LIVE FEED  {now}", (10, 22),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 240, 255), 1)
                        cv2.rectangle(frame, (0, 446), (640, 480), (10, 10, 20), -1)
                        cv2.putText(frame, "INSPECTION READY - CAPTURE & INSPECT", (10, 468),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 200, 100), 1)
                        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
                        frame_read = True
                        yield (b'--frame\r\n'
                               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
                except Exception:
                    _camera_available = False
                    _camera = None

        # ── SYNTHETIC FALLBACK ──────────────────────────────────────
        if not frame_read:
            gear_img = create_gear_image(teeth=12, outer_r=110, inner_r=75, size=(640, 480))
            cx, cy = 320, 240
            M = cv2.getRotationMatrix2D((cx, cy), angle, 1.0)
            rotated = cv2.warpAffine(gear_img, M, (640, 480))

            scan_x = int(200 + 240 * abs((angle % 180) / 90 - 1))
            cv2.line(rotated, (scan_x, 80), (scan_x, 400), (0, 240, 255), 2)
            cv2.rectangle(rotated, (0, 0), (640, 34), (10, 10, 20), -1)
            cv2.putText(rotated, "OPENCV CAM  SYNTHETIC OPTICAL STREAM", (10, 22),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 240, 255), 1)
            cv2.rectangle(rotated, (0, 446), (640, 480), (10, 10, 20), -1)
            cv2.putText(rotated, "SIMULATION MODE - NO PHYSICAL CAMERA DETECTED", (10, 468),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.42, (200, 150, 0), 1)

            _, buffer = cv2.imencode('.jpg', rotated, [cv2.IMWRITE_JPEG_QUALITY, 85])
            angle = (angle + 3) % 360
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.033)

@app.route('/video_feed')
def video_feed():
    return Response(generate_video_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    port = 5000
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    print(f"\n" + "="*58)
    print(f"  INDUSTRIAL AUTOMATION ENGINEERING PLATFORM - UNIFIED PORTAL")
    print(f"  Single Localhost Portal:  http://localhost:{port}/")
    print("="*58 + "\n")
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)

