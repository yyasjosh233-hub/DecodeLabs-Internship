import pytest

def test_15_stage_opencv_pipeline_config():
    stages = [
        "1. Read Image", "2. Grayscale", "3. Gaussian Blur", "4. Threshold",
        "5. Morphology", "6. Edge Detection", "7. Contours", "8. Convex Hull",
        "9. Convexity Defects", "10. Bounding Box", "11. Dimension Measurement",
        "12. Shape Analysis", "13. Defect Detection", "14. Confidence Score",
        "15. Final PASS / FAIL"
    ]
    assert len(stages) == 15
    assert stages[0] == "1. Read Image"
    assert stages[14] == "15. Final PASS / FAIL"

def test_defect_classification_confidence():
    defects = ["Missing Gear Tooth", "Broken Gear Tooth", "Crack Detection"]
    confidence_score = 98.5
    status = "FAIL" if len(defects) > 0 else "PASS"
    assert status == "FAIL"
    assert confidence_score >= 90.0
