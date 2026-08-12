import subprocess
import sys
import os

if __name__ == "__main__":
    app_path = os.path.join(os.path.dirname(__file__), "app.py")
    port = sys.argv[1] if len(sys.argv) > 1 else "5000"
    print(f"Starting Automated Quality Inspection System on port {port}...")
    subprocess.run([sys.executable, app_path, port])
