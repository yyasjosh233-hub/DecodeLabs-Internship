import unittest
import os
import sys
import json
import tempfile
import uuid

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from synthetic_data import generate_all_samples, create_gear_image
from cv_engine import process_inspection_pipeline
from database import init_db, save_inspection, get_stats, get_history, get_inspection_by_id
from report_generator import generate_pdf_report, generate_csv_report, generate_excel_report, generate_json_report
from app import app

class TestQualityInspectionSystem(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.test_dir = tempfile.mkdtemp()
        generate_all_samples(cls.test_dir)
        init_db()

    def test_01_synthetic_dataset_generation(self):
        pass_dir = os.path.join(self.test_dir, "pass")
        fail_dir = os.path.join(self.test_dir, "fail")
        self.assertTrue(os.path.exists(os.path.join(pass_dir, "good_gear.png")))
        self.assertTrue(os.path.exists(os.path.join(fail_dir, "missing_gear_tooth.png")))
        self.assertTrue(os.path.exists(os.path.join(fail_dir, "crack.png")))

    def test_02_cv_pipeline_pass_image(self):
        good_gear_path = os.path.join(self.test_dir, "pass", "good_gear.png")
        results = process_inspection_pipeline(good_gear_path)
        self.assertEqual(results["result"], "PASS")
        self.assertEqual(results["defect"], "None")
        self.assertEqual(len(results["stages"]), 15)
        self.assertGreater(results["confidence"], 0.85)

    def test_03_cv_pipeline_fail_image(self):
        missing_tooth_path = os.path.join(self.test_dir, "fail", "missing_gear_tooth.png")
        results = process_inspection_pipeline(missing_tooth_path)
        self.assertEqual(results["result"], "FAIL")
        self.assertEqual(results["defect"], "Missing Gear Tooth")
        self.assertEqual(len(results["stages"]), 15)

    def test_04_database_persistence_and_stats(self):
        uid = f"TEST-INS-{uuid.uuid4().hex[:6]}"
        test_data = {
            "inspection_id": uid,
            "timestamp": "2026-08-09T10:00:00",
            "filename": "good_gear.png",
            "product_type": "Gear",
            "result": "PASS",
            "defect": "None",
            "confidence": 0.98,
            "measurements": {"width_mm": 50.0, "height_mm": 50.0, "area_mm2": 1963.5},
            "total_time_ms": 25.0,
            "image_path": "/uploads/good_gear.png",
            "annotated_path": "/processed/annotated_good_gear.png",
            "stages": [{"number": 1, "name": "Read Image", "time_ms": 2.0, "status": "PASS", "explanation": "OK"}]
        }
        save_inspection(test_data)
        
        fetched = get_inspection_by_id(uid)
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched["result"], "PASS")

        stats = get_stats()
        self.assertGreater(stats["total_inspected"], 0)

    def test_05_report_generators(self):
        uid = f"TEST-INS-{uuid.uuid4().hex[:6]}"
        test_data = {
            "id": uid,
            "timestamp": "2026-08-09T10:05:00",
            "filename": "good_gear.png",
            "product_type": "Gear",
            "result": "PASS",
            "defect": "None",
            "confidence": 0.98,
            "total_time_ms": 30.0,
            "width_mm": 50.0,
            "height_mm": 50.0,
            "area_mm2": 1963.5,
            "stages": [{"number": 1, "name": "Read Image", "time_ms": 2.0, "status": "PASS", "explanation": "OK"}]
        }

        pdf_path = generate_pdf_report(test_data)
        csv_path = generate_csv_report(test_data)
        excel_path = generate_excel_report(test_data)
        json_path = generate_json_report(test_data)

        self.assertTrue(os.path.exists(pdf_path))
        self.assertTrue(os.path.exists(csv_path))
        self.assertTrue(os.path.exists(excel_path))
        self.assertTrue(os.path.exists(json_path))

    def test_06_flask_api_routes(self):
        client = app.test_client()
        response = client.get('/api/stats')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("total_inspected", data)

        sample_resp = client.post('/api/inspect', json={"sample_path": "sample_dataset/pass/good_gear.png"})
        self.assertEqual(sample_resp.status_code, 200)
        sample_data = sample_resp.get_json()
        self.assertEqual(sample_data["result"], "PASS")

if __name__ == "__main__":
    unittest.main()
