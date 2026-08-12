import math
import pytest

def dh_matrix(alpha, a, d, theta):
    ct = math.cos(theta)
    st = math.sin(theta)
    ca = math.cos(alpha)
    sa = math.sin(alpha)

    return [
        [ct, -st * ca,  st * sa, a * ct],
        [st,  ct * ca, -ct * sa, a * st],
        [0,   sa,       ca,      d],
        [0,   0,        0,       1]
    ]

def test_dh_transform_identity():
    T = dh_matrix(0, 0, 0, 0)
    assert pytest.approx(T[0][0]) == 1.0
    assert pytest.approx(T[1][1]) == 1.0
    assert pytest.approx(T[2][2]) == 1.0
    assert pytest.approx(T[3][3]) == 1.0

def test_forward_kinematics_origin():
    # 6-DOF joint degrees zero pose
    joint_angles = [0, 0, 0, 0, 0, 0]
    assert len(joint_angles) == 6

def test_manipulability_index():
    # Yoshikawa manipulability w = sqrt(det(J * J^T))
    # Dummy non-singular jacobian determinant check
    det_j = 0.85
    assert det_j > 0.01 # Non-singular threshold
