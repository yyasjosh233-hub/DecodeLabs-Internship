from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='amr_localization',
            executable='ekf_localization_node.py',
            name='ekf_localization'
        ),
        Node(
            package='amr_mapping',
            executable='occupancy_grid_mapper.py',
            name='occupancy_grid_mapper'
        ),
        Node(
            package='amr_planner',
            executable='custom_ast_planner.py',
            name='custom_ast_planner'
        ),
        Node(
            package='amr_controller',
            executable='dynamic_obstacle_avoidance_node.py',
            name='dynamic_obstacle_avoidance'
        ),
        Node(
            package='amr_navigation',
            executable='navigation_state_machine.py',
            name='navigation_state_machine'
        ),
    ])
