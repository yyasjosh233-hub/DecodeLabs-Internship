import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "quality_inspection.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Inspections main table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inspections (
            id TEXT PRIMARY KEY,
            timestamp DATETIME NOT NULL,
            filename TEXT NOT NULL,
            product_type TEXT NOT NULL,
            result TEXT NOT NULL,
            defect_type TEXT NOT NULL,
            confidence REAL NOT NULL,
            width_mm REAL NOT NULL,
            height_mm REAL NOT NULL,
            area_mm2 REAL NOT NULL,
            total_time_ms REAL NOT NULL,
            image_path TEXT NOT NULL,
            annotated_path TEXT NOT NULL,
            stage_data JSON
        )
    ''')
    
    # Detailed stage results table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inspection_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inspection_id TEXT NOT NULL,
            stage_number INTEGER NOT NULL,
            stage_name TEXT NOT NULL,
            execution_time_ms REAL NOT NULL,
            status TEXT NOT NULL,
            explanation TEXT NOT NULL,
            FOREIGN KEY (inspection_id) REFERENCES inspections (id)
        )
    ''')

    # Reports generated table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inspection_id TEXT NOT NULL,
            report_type TEXT NOT NULL,
            file_path TEXT NOT NULL,
            created_at DATETIME NOT NULL,
            FOREIGN KEY (inspection_id) REFERENCES inspections (id)
        )
    ''')

    # System operational log table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME NOT NULL,
            level TEXT NOT NULL,
            message TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

def save_inspection(data):
    conn = get_db()
    cursor = conn.cursor()
    
    stage_data_json = json.dumps(data.get("stages", []))
    
    cursor.execute('''
        INSERT INTO inspections (
            id, timestamp, filename, product_type, result, defect_type,
            confidence, width_mm, height_mm, area_mm2, total_time_ms,
            image_path, annotated_path, stage_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data["inspection_id"],
        data["timestamp"],
        data["filename"],
        data["product_type"],
        data["result"],
        data["defect"],
        data["confidence"],
        data["measurements"]["width_mm"],
        data["measurements"]["height_mm"],
        data["measurements"]["area_mm2"],
        data["total_time_ms"],
        data["image_path"],
        data["annotated_path"],
        stage_data_json
    ))
    
    for stage in data.get("stages", []):
        cursor.execute('''
            INSERT INTO inspection_results (
                inspection_id, stage_number, stage_name, execution_time_ms, status, explanation
            ) VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            data["inspection_id"],
            stage["number"],
            stage["name"],
            stage["time_ms"],
            stage["status"],
            stage["explanation"]
        ))
        
    cursor.execute('INSERT INTO system_logs (timestamp, level, message) VALUES (?, ?, ?)',
                   (datetime.now().isoformat(), 'INFO', f'Inspection {data["inspection_id"]} recorded: {data["result"]}'))
        
    conn.commit()
    conn.close()

def get_stats():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) as total FROM inspections')
    total = cursor.fetchone()['total']
    
    if total == 0:
        conn.close()
        return {
            "total_inspected": 0,
            "passed_items": 0,
            "failed_items": 0,
            "accuracy_rate": 100.0,
            "average_latency": 0.0,
            "average_confidence": 0.0,
            "defect_distribution": {}
        }
        
    cursor.execute("SELECT COUNT(*) as passed FROM inspections WHERE result = 'PASS'")
    passed = cursor.fetchone()['passed']
    
    cursor.execute("SELECT COUNT(*) as failed FROM inspections WHERE result = 'FAIL'")
    failed = cursor.fetchone()['failed']
    
    cursor.execute("SELECT AVG(total_time_ms) as avg_latency FROM inspections")
    avg_latency = round(cursor.fetchone()['avg_latency'] or 0.0, 2)
    
    cursor.execute("SELECT AVG(confidence) as avg_conf FROM inspections")
    avg_confidence = round((cursor.fetchone()['avg_conf'] or 0.0) * 100, 1)
    
    accuracy = round((passed / total) * 100, 1) if total > 0 else 100.0
    
    # Defect distribution
    cursor.execute("SELECT defect_type, COUNT(*) as count FROM inspections WHERE result = 'FAIL' GROUP BY defect_type")
    defects = {row['defect_type']: row['count'] for row in cursor.fetchall()}
    
    conn.close()
    
    return {
        "total_inspected": total,
        "passed_items": passed,
        "failed_items": failed,
        "accuracy_rate": accuracy,
        "average_latency": avg_latency,
        "average_confidence": avg_confidence,
        "defect_distribution": defects
    }

def get_history(limit=50, search=None, result_filter=None):
    conn = get_db()
    cursor = conn.cursor()
    
    query = "SELECT * FROM inspections WHERE 1=1"
    params = []
    
    if search:
        query += " AND (id LIKE ? OR filename LIKE ? OR product_type LIKE ? OR defect_type LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term, term])
        
    if result_filter in ['PASS', 'FAIL']:
        query += " AND result = ?"
        params.append(result_filter)
        
    query += " ORDER BY timestamp DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    history = []
    for r in rows:
        item = dict(r)
        if item.get("stage_data"):
            try:
                item["stages"] = json.loads(item["stage_data"])
            except Exception:
                item["stages"] = []
        history.append(item)
        
    conn.close()
    return history

def get_inspection_by_id(inspection_id):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM inspections WHERE id = ?", (inspection_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
        
    data = dict(row)
    if data.get("stage_data"):
        try:
            data["stages"] = json.loads(data["stage_data"])
        except Exception:
            data["stages"] = []
            
    cursor.execute("SELECT * FROM inspection_results WHERE inspection_id = ? ORDER BY stage_number ASC", (inspection_id,))
    data["stage_results"] = [dict(s) for s in cursor.fetchall()]
    
    conn.close()
    return data
