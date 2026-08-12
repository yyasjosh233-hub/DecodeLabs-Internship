import cv2
import numpy as np
import math
import os

def create_gear_image(teeth=12, outer_r=120, inner_r=80, missing_teeth=None, broken_teeth=None, size=(400, 400), wrong_shape=False, out_of_spec=False):
    img = np.full((size[1], size[0], 3), 40, dtype=np.uint8) # dark industrial background
    cx, cy = size[0] // 2, size[1] // 2
    
    if out_of_spec:
        outer_r = int(outer_r * 1.35) # Out of tolerance dimensions
        
    missing_teeth = missing_teeth or []
    broken_teeth = broken_teeth or []
    
    points = []
    angle_step = 2 * math.pi / teeth
    
    for i in range(teeth):
        a_base = i * angle_step
        if i in missing_teeth:
            # Missing tooth: stay at inner radius
            for a_offset in [0, angle_step * 0.25, angle_step * 0.5, angle_step * 0.75]:
                a = a_base + a_offset
                points.append((cx + int(inner_r * math.cos(a)), cy + int(inner_r * math.sin(a))))
        elif i in broken_teeth:
            # Broken tooth: half radius tooth
            broken_r = (outer_r + inner_r) / 2
            a1 = a_base + angle_step * 0.1
            a2 = a_base + angle_step * 0.3
            a3 = a_base + angle_step * 0.6
            a4 = a_base + angle_step * 0.8
            points.append((cx + int(inner_r * math.cos(a1)), cy + int(inner_r * math.sin(a1))))
            points.append((cx + int(broken_r * math.cos(a2)), cy + int(broken_r * math.sin(a2))))
            points.append((cx + int(broken_r * math.cos(a3)), cy + int(broken_r * math.sin(a3))))
            points.append((cx + int(inner_r * math.cos(a4)), cy + int(inner_r * math.sin(a4))))
        else:
            # Normal tooth profile
            a1 = a_base + angle_step * 0.1
            a2 = a_base + angle_step * 0.3
            a3 = a_base + angle_step * 0.6
            a4 = a_base + angle_step * 0.8
            points.append((cx + int(inner_r * math.cos(a1)), cy + int(inner_r * math.sin(a1))))
            points.append((cx + int(outer_r * math.cos(a2)), cy + int(outer_r * math.sin(a2))))
            points.append((cx + int(outer_r * math.cos(a3)), cy + int(outer_r * math.sin(a3))))
            points.append((cx + int(inner_r * math.cos(a4)), cy + int(inner_r * math.sin(a4))))

    pts = np.array(points, np.int32).reshape((-1, 1, 2))
    
    if wrong_shape:
        # Deform bottom-right side
        pts[len(pts)//2 : len(pts)//2 + 5] += np.array([40, -50])

    # Draw metallic gear shape
    cv2.fillPoly(img, [pts], (180, 185, 190))
    cv2.polylines(img, [pts], True, (220, 225, 230), 2)
    
    # Shaft hole in middle
    hole_r = int(inner_r * 0.45)
    cv2.circle(img, (cx, cy), hole_r, (40, 40, 40), -1)
    cv2.circle(img, (cx, cy), hole_r, (100, 105, 110), 2)
    
    # Keyway notch
    cv2.rectangle(img, (cx - 6, cy - hole_r - 8), (cx + 6, cy - hole_r + 4), (40, 40, 40), -1)
    
    return img

def create_surface_plate(scratch=False, crack=False, size=(400, 400)):
    img = np.full((size[1], size[0], 3), 45, dtype=np.uint8)
    
    # Steel plate body
    pad = 40
    cv2.rectangle(img, (pad, pad), (size[0] - pad, size[1] - pad), (190, 195, 200), -1)
    cv2.rectangle(img, (pad, pad), (size[0] - pad, size[1] - pad), (230, 235, 240), 3)
    
    # Screw holes at corners
    holes = [(pad + 25, pad + 25), (size[0] - pad - 25, pad + 25),
             (pad + 25, size[1] - pad - 25), (size[0] - pad - 25, size[1] - pad - 25)]
    for hx, hy in holes:
        cv2.circle(img, (hx, hy), 12, (45, 45, 45), -1)
        cv2.circle(img, (hx, hy), 6, (120, 125, 130), -1)

    if scratch:
        # High contrast scratch streak
        cv2.line(img, (100, 120), (280, 260), (255, 255, 255), 2)
        cv2.line(img, (105, 125), (275, 255), (10, 10, 10), 1)

    if crack:
        # Jagged continuous crack line
        crack_pts = np.array([[120, 80], [145, 130], [135, 175], [160, 220], [150, 270], [175, 310]], np.int32)
        cv2.polylines(img, [crack_pts], False, (10, 10, 10), 2)
        cv2.polylines(img, [crack_pts + 1], False, (220, 220, 220), 1)

    return img

def create_bolt_image(missing_screw=False, wrong_dims=False, size=(400, 400)):
    img = np.full((size[1], size[0], 3), 40, dtype=np.uint8)
    cx, cy = size[0] // 2, size[1] // 2
    
    head_w = 160 if not wrong_dims else 250
    head_h = 60
    stem_w = 70
    stem_h = 200
    
    # Hex Head
    head_pts = np.array([
        [cx - head_w//2, cy - stem_h//2],
        [cx + head_w//2, cy - stem_h//2],
        [cx + head_w//2 + 20, cy - stem_h//2 + head_h],
        [cx - head_w//2 - 20, cy - stem_h//2 + head_h]
    ], np.int32)
    
    cv2.fillPoly(img, [head_pts], (170, 175, 180))
    cv2.polylines(img, [head_pts], True, (210, 215, 220), 2)
    
    if not missing_screw:
        # Bolt stem with thread ridges
        stem_rect = (cx - stem_w//2, cy - stem_h//2 + head_h, stem_w, stem_h)
        cv2.rectangle(img, (stem_rect[0], stem_rect[1]), (stem_rect[0] + stem_w, stem_rect[1] + stem_h), (150, 155, 160), -1)
        # Threads
        for y in range(stem_rect[1] + 10, stem_rect[1] + stem_h - 10, 15):
            cv2.line(img, (stem_rect[0], y), (stem_rect[0] + stem_w, y + 5), (80, 85, 90), 2)

    return img

def create_pcb_image(missing_screw=False, size=(400, 400)):
    img = np.full((size[1], size[0], 3), 35, dtype=np.uint8)
    # Green PCB board
    cv2.rectangle(img, (50, 50), (350, 350), (30, 110, 50), -1)
    cv2.rectangle(img, (50, 50), (350, 350), (60, 180, 90), 3)
    
    # Gold traces
    cv2.line(img, (80, 100), (250, 100), (50, 200, 220), 3)
    cv2.line(img, (250, 100), (250, 220), (50, 200, 220), 3)
    cv2.line(img, (120, 150), (120, 300), (50, 200, 220), 2)
    
    # Main IC Chip
    cv2.rectangle(img, (150, 150), (270, 270), (20, 20, 20), -1)
    cv2.rectangle(img, (150, 150), (270, 270), (80, 80, 80), 2)
    
    # Screws on 4 corners
    screw_positions = [(75, 75), (325, 75), (75, 325), (325, 325)]
    for idx, (sx, sy) in enumerate(screw_positions):
        if idx == 3 and missing_screw:
            # Missing screw hole
            cv2.circle(img, (sx, sy), 14, (15, 60, 25), -1)
            cv2.circle(img, (sx, sy), 10, (5, 30, 10), -1)
        else:
            # Shiny screw head
            cv2.circle(img, (sx, sy), 14, (200, 205, 210), -1)
            cv2.line(img, (sx - 8, sy), (sx + 8, sy), (40, 40, 40), 3)
            cv2.line(img, (sx, sy - 8), (sx, sy + 8), (40, 40, 40), 3)
            
    return img

def generate_all_samples(output_dir):
    pass_dir = os.path.join(output_dir, "pass")
    fail_dir = os.path.join(output_dir, "fail")
    os.makedirs(pass_dir, exist_ok=True)
    os.makedirs(fail_dir, exist_ok=True)
    
    # PASS SAMPLES
    cv2.imwrite(os.path.join(pass_dir, "good_gear.png"), create_gear_image())
    cv2.imwrite(os.path.join(pass_dir, "good_bolt.png"), create_bolt_image())
    cv2.imwrite(os.path.join(pass_dir, "good_surface.png"), create_surface_plate())
    cv2.imwrite(os.path.join(pass_dir, "good_pcb.png"), create_pcb_image())
    
    # FAIL SAMPLES
    cv2.imwrite(os.path.join(fail_dir, "missing_gear_tooth.png"), create_gear_image(missing_teeth=[3]))
    cv2.imwrite(os.path.join(fail_dir, "broken_gear_tooth.png"), create_gear_image(broken_teeth=[7]))
    cv2.imwrite(os.path.join(fail_dir, "crack.png"), create_surface_plate(crack=True))
    cv2.imwrite(os.path.join(fail_dir, "missing_screw.png"), create_pcb_image(missing_screw=True))
    cv2.imwrite(os.path.join(fail_dir, "surface_scratch.png"), create_surface_plate(scratch=True))
    cv2.imwrite(os.path.join(fail_dir, "wrong_shape.png"), create_gear_image(wrong_shape=True))
    cv2.imwrite(os.path.join(fail_dir, "incorrect_dimensions.png"), create_gear_image(out_of_spec=True))

if __name__ == "__main__":
    generate_all_samples("sample_dataset")
    print("Generated sample dataset in sample_dataset/")
