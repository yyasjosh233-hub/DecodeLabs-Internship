from flask import Flask, render_template, request, jsonify
import firebase_admin
from firebase_admin import credentials, db
from dotenv import load_dotenv
import json
from datetime import datetime
import os
import webbrowser
import threading
import time

load_dotenv()

app = Flask(__name__)

# Firebase configuration
firebase_config = {
    "projectId": os.getenv("FIREBASE_PROJECT_ID", "joee-bbf6f"),
    "databaseURL": os.getenv("FIREBASE_DATABASE_URL", "https://joee-bbf6f.firebaseio.com"),
    "apiKey": os.getenv("FIREBASE_API_KEY", ""),
}

FLASK_HOST = os.getenv("FLASK_HOST", os.getenv("GRADIO_SERVER_NAME", "0.0.0.0"))
FLASK_PORT = int(os.getenv("FLASK_PORT", os.getenv("GRADIO_SERVER_PORT", "5000")))
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "true").lower() == "true"
AUTO_OPEN_BROWSER = os.getenv("AUTO_OPEN_BROWSER", "true").lower() == "true"

# Local database file (fallback)
LOCAL_DB_FILE = "students_database.json"
USE_FIREBASE = False


def open_firebase_console():
    """Open Firebase console in browser after a short delay."""
    time.sleep(2)
    firebase_url = f"https://console.firebase.google.com/project/{firebase_config['projectId']}/database/data"
    print(f"\nOpening Firebase Console: {firebase_url}\n")
    webbrowser.open(firebase_url)


def open_local_app():
    """Open the local app in browser after a short delay."""
    time.sleep(1.5)
    local_url = f"http://127.0.0.1:{FLASK_PORT}/"
    print(f"\nOpening app in browser: {local_url}\n")
    webbrowser.open(local_url)


# Initialize Firebase
try:
    firebase_admin.get_app()
    USE_FIREBASE = True
except ValueError:
    try:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred, {
            "databaseURL": firebase_config["databaseURL"],
        })
        USE_FIREBASE = True
        print("Firebase connected successfully!")
        print("Opening Firebase Console...")
        threading.Thread(target=open_firebase_console, daemon=True).start()
    except FileNotFoundError:
        print("Using local JSON database (Firebase key not found)")
        print("App is fully functional. Firebase will be enabled when serviceAccountKey.json is added.")
        USE_FIREBASE = False
    except Exception as e:
        print(f"Using local JSON database ({str(e)})")
        USE_FIREBASE = False


if not USE_FIREBASE and not os.path.exists(LOCAL_DB_FILE):
    with open(LOCAL_DB_FILE, "w", encoding="utf-8") as f:
        json.dump({}, f)


def get_local_students():
    """Get all students from local JSON database."""
    try:
        if os.path.exists(LOCAL_DB_FILE):
            with open(LOCAL_DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return {}


def save_local_students(students_data):
    """Save students to local JSON database."""
    try:
        with open(LOCAL_DB_FILE, "w", encoding="utf-8") as f:
            json.dump(students_data, f, indent=2)
    except Exception as e:
        print(f"Error saving to local database: {e}")


def get_students_ref():
    """Return Firebase students reference when available."""
    if USE_FIREBASE:
        try:
            return db.reference("students")
        except Exception:
            return None
    return None


@app.route("/")
def index():
    """Render the main page."""
    return render_template("index.html")


@app.route("/api/add-student", methods=["POST"])
def add_student():
    """Add a new student."""
    try:
        data = request.json or {}

        student_id = data.get("student_id", "").strip()
        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        phone = data.get("phone", "").strip()
        grade = data.get("grade", "").strip()
        enrollment_date = data.get("enrollment_date", "").strip()

        if not student_id or not name or not email:
            return jsonify({"success": False, "message": "Student ID, Name, and Email are required."}), 400

        student_data = {
            "student_id": student_id,
            "name": name,
            "email": email,
            "phone": phone,
            "grade": grade,
            "enrollment_date": enrollment_date,
            "created_at": datetime.now().isoformat(),
        }

        if USE_FIREBASE:
            try:
                students_ref = get_students_ref()
                if not students_ref:
                    return jsonify({"success": False, "message": "Database connection error"}), 500

                existing = students_ref.child(student_id).get()
                if existing is not None and existing.val() is not None:
                    return jsonify({"success": False, "message": f"Student with ID {student_id} already exists."}), 400

                students_ref.child(student_id).set(student_data)
            except Exception as e:
                return jsonify({"success": False, "message": f"Firebase error: {str(e)}"}), 500
        else:
            students = get_local_students()
            if student_id in students:
                return jsonify({"success": False, "message": f"Student with ID {student_id} already exists."}), 400

            students[student_id] = student_data
            save_local_students(students)

        return jsonify({"success": True, "message": f"Student {name} added successfully!"}), 201

    except Exception as e:
        return jsonify({"success": False, "message": f"Error adding student: {str(e)}"}), 500


@app.route("/api/search-student", methods=["GET"])
def search_student():
    """Search for students."""
    try:
        search_query = request.args.get("q", "").strip().lower()

        if not search_query:
            return jsonify({"success": False, "message": "Please enter a search term."}), 400

        results = []

        if USE_FIREBASE:
            try:
                students_ref = get_students_ref()
                if not students_ref:
                    return jsonify({"success": False, "message": "Database connection error"}), 500

                students_data = students_ref.get()

                if students_data is None or students_data.val() is None:
                    return jsonify({"success": True, "results": [], "message": "No students found in database."}), 200

                for student_id, student_info in students_data.val().items():
                    if (
                        search_query in student_id.lower()
                        or search_query in student_info.get("name", "").lower()
                        or search_query in student_info.get("email", "").lower()
                    ):
                        results.append({
                            "student_id": student_id,
                            "name": student_info.get("name", "N/A"),
                            "email": student_info.get("email", "N/A"),
                            "phone": student_info.get("phone", "N/A"),
                            "grade": student_info.get("grade", "N/A"),
                            "enrollment_date": student_info.get("enrollment_date", "N/A"),
                        })
            except Exception as e:
                return jsonify({"success": False, "message": f"Firebase error: {str(e)}"}), 500
        else:
            students_data = get_local_students()

            if not students_data:
                return jsonify({"success": True, "results": [], "message": "No students found in database."}), 200

            for student_id, student_info in students_data.items():
                if (
                    search_query in student_id.lower()
                    or search_query in student_info.get("name", "").lower()
                    or search_query in student_info.get("email", "").lower()
                ):
                    results.append({
                        "student_id": student_id,
                        "name": student_info.get("name", "N/A"),
                        "email": student_info.get("email", "N/A"),
                        "phone": student_info.get("phone", "N/A"),
                        "grade": student_info.get("grade", "N/A"),
                        "enrollment_date": student_info.get("enrollment_date", "N/A"),
                    })

        if not results:
            return jsonify({"success": True, "results": [], "message": f'No students found matching "{search_query}".'}), 200

        results.sort(key=lambda x: x["name"])
        return jsonify({"success": True, "results": results, "message": f"Found {len(results)} student(s)."}), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error searching students: {str(e)}"}), 500


@app.route("/api/all-students", methods=["GET"])
def get_all_students():
    """Get all students."""
    try:
        results = []

        if USE_FIREBASE:
            try:
                students_ref = get_students_ref()
                if not students_ref:
                    return jsonify({"success": False, "message": "Database connection error"}), 500

                students_data = students_ref.get()

                if students_data is None or students_data.val() is None:
                    return jsonify({"success": True, "results": [], "message": "No students found in database."}), 200

                for student_id, student_info in students_data.val().items():
                    results.append({
                        "student_id": student_id,
                        "name": student_info.get("name", "N/A"),
                        "email": student_info.get("email", "N/A"),
                        "phone": student_info.get("phone", "N/A"),
                        "grade": student_info.get("grade", "N/A"),
                        "enrollment_date": student_info.get("enrollment_date", "N/A"),
                    })
            except Exception as e:
                return jsonify({"success": False, "message": f"Firebase error: {str(e)}"}), 500
        else:
            students_data = get_local_students()

            if not students_data:
                return jsonify({"success": True, "results": [], "message": "No students found in database."}), 200

            for student_id, student_info in students_data.items():
                results.append({
                    "student_id": student_id,
                    "name": student_info.get("name", "N/A"),
                    "email": student_info.get("email", "N/A"),
                    "phone": student_info.get("phone", "N/A"),
                    "grade": student_info.get("grade", "N/A"),
                    "enrollment_date": student_info.get("enrollment_date", "N/A"),
                })

        results.sort(key=lambda x: x["name"])
        return jsonify({"success": True, "results": results, "message": f"Total: {len(results)} student(s)."}), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error retrieving students: {str(e)}"}), 500


@app.route("/api/delete-student", methods=["DELETE"])
def delete_student():
    """Delete a student."""
    try:
        data = request.json or {}
        student_id = data.get("student_id", "").strip()

        if not student_id:
            return jsonify({"success": False, "message": "Please enter a Student ID."}), 400

        if USE_FIREBASE:
            try:
                students_ref = get_students_ref()
                if not students_ref:
                    return jsonify({"success": False, "message": "Database connection error"}), 500

                existing = students_ref.child(student_id).get()
                if existing is None or existing.val() is None:
                    return jsonify({"success": False, "message": f"Student with ID {student_id} not found."}), 404

                students_ref.child(student_id).delete()
            except Exception as e:
                return jsonify({"success": False, "message": f"Firebase error: {str(e)}"}), 500
        else:
            students = get_local_students()

            if student_id not in students:
                return jsonify({"success": False, "message": f"Student with ID {student_id} not found."}), 404

            del students[student_id]
            save_local_students(students)

        return jsonify({"success": True, "message": f"Student {student_id} deleted successfully!"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error deleting student: {str(e)}"}), 500


@app.route("/api/status", methods=["GET"])
def get_status():
    """Get system status."""
    return jsonify({
        "database": "Firebase (Cloud)" if USE_FIREBASE else "Local JSON",
        "status": "Connected" if USE_FIREBASE else "Ready",
        "message": (
            "Using Firebase Realtime Database"
            if USE_FIREBASE
            else "Using local JSON storage. Add serviceAccountKey.json to enable Firebase."
        ),
        "firebase_url": (
            f"https://console.firebase.google.com/project/{firebase_config['projectId']}/database/data"
            if USE_FIREBASE
            else None
        ),
    }), 200


@app.route("/api/open-firebase", methods=["GET"])
def open_firebase():
    """Trigger opening Firebase console."""
    if USE_FIREBASE:
        firebase_url = f"https://console.firebase.google.com/project/{firebase_config['projectId']}/database/data"
        webbrowser.open(firebase_url)
        return jsonify({"success": True, "message": "Opening Firebase Console..."}), 200
    return jsonify({"success": False, "message": "Firebase not connected"}), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "message": "Not found"}), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({"success": False, "message": "Server error"}), 500


if __name__ == "__main__":
    if AUTO_OPEN_BROWSER and os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        threading.Thread(target=open_local_app, daemon=True).start()
    app.run(debug=FLASK_DEBUG, host=FLASK_HOST, port=FLASK_PORT)
