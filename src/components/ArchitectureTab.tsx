import React, { useState } from 'react';
import { BookOpen, Layers, Share2, ChevronDown, ChevronRight } from 'lucide-react';
import type { EEPose } from '../types/robotics';
import { DH_TABLE } from '../robotics/kinematics';

interface ArchitectureTabProps {
  fkResult: {
    eePose: EEPose;
    T_all: number[][][];
    jointPositions: [number, number, number][];
  };
  jacobianResult: {
    J: number[][];
    manipulability: number;
    detJ: number;
    conditionNumber: number;
    status: 'Safe' | 'Warning' | 'Singular';
  };
  targetPose: EEPose;
}

const ROS2_NODE_DIAGRAM = `
  ┌──────────────────────────────────────────────────────────────────────┐
  │                    ROS 2 (Jazzy Jalisco) Node Graph                  │
  │                          SIMULATION MODE                             │
  ├──────────────────────────────────────────────────────────────────────┤
  │                                                                      │
  │   [joint_state_publisher]──────/joint_states──────►[robot_state_publisher]
  │                                                            │         │
  │                                                    /tf, /tf_static   │
  │                                                            │         │
  │                                              ┌────────────┘         │
  │                                              ▼                       │
  │   [ik_solver_node]◄────/solve_ik────── [Web UI / moveit_commander]  │
  │         │                                     │                      │
  │         └────────►/joint_trajectory────►[trajectory_controller]     │
  │                                               │                      │
  │                                       /follow_joint_trajectory       │
  │                                               ▼                      │
  │                                        [Robot Arm / Sim]             │
  │                                                                      │
  │   [collision_checker]◄──/check_collision──[Web UI / planner]        │
  │         │                                                            │
  │         └────────────►/diagnostics──────►[diagnostic_aggregator]    │
  └──────────────────────────────────────────────────────────────────────┘`;

const TF2_TREE = `
  world
  └── base_link
      └── link1 (shoulder_pan_joint)
          └── link2 (shoulder_lift_joint)
              └── link3 (elbow_joint)
                  └── link4 (wrist_1_joint)
                      └── link5 (wrist_2_joint)
                          └── link6 (wrist_3_joint)
                              └── end_effector (tool_center_point)`;

const URDF_JOINTS = [
  { name: 'shoulder_pan_joint',  type: 'revolute', axis: 'Z', parent: 'base_link', child: 'link1',  lim: '-π … +π' },
  { name: 'shoulder_lift_joint', type: 'revolute', axis: 'Y', parent: 'link1',     child: 'link2',  lim: '-3π/4 … 3π/4' },
  { name: 'elbow_joint',         type: 'revolute', axis: 'Y', parent: 'link2',     child: 'link3',  lim: '-5π/6 … 5π/6' },
  { name: 'wrist_1_joint',       type: 'revolute', axis: 'Z', parent: 'link3',     child: 'link4',  lim: '-π … +π' },
  { name: 'wrist_2_joint',       type: 'revolute', axis: 'Y', parent: 'link4',     child: 'link5',  lim: '-2π/3 … 2π/3' },
  { name: 'wrist_3_joint',       type: 'revolute', axis: 'Z', parent: 'link5',     child: 'link6',  lim: '-2π … 2π' },
];

const LAUNCH_FILE = `# display.launch.py (excerpt)
from launch import LaunchDescription
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            parameters=[{'robot_description': urdf_content}],
        ),
        Node(
            package='joint_state_publisher_gui',
            executable='joint_state_publisher_gui',
        ),
        Node(
            package='rviz2',
            executable='rviz2',
            arguments=['-d', rviz_config_path],
        ),
    ])`;

function Section({ title, children, icon: Icon, defaultOpen = false, accent = 'text-blue-300' }: {
  title: string;
  children: React.ReactNode;
  icon: React.ElementType;
  defaultOpen?: boolean;
  accent?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-panel bg-[#0d101d]/90 border-[#1c233c] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 border-b border-white/10 hover:bg-white/[0.02] transition-all"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${accent}`} />
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
      </button>
      {open && (
        <div className="p-5">
          {children}
        </div>
      )}
    </div>
  );
}

export const ArchitectureTab: React.FC<ArchitectureTabProps> = ({ fkResult, jacobianResult, targetPose: _targetPose }) => {
  const { T_all } = fkResult;
  const T06 = T_all[5] ?? [];

  return (
    <div className="flex flex-col gap-5 font-sans">

      {/* Banner */}
      <div className="glass-panel p-5 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-indigo-400" />
        <div>
          <h2 className="text-base font-semibold text-white">Architecture, Mathematics & ROS 2 Integration</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Denavit-Hartenberg convention, SE(3) Lie group theory, Jacobian kinematics, URDF/Xacro, TF2 tree, ROS 2 node graph.
          </p>
        </div>
      </div>

      {/* DH Math */}
      <Section title="Denavit-Hartenberg (DH) Convention & FK Math" icon={Layers} defaultOpen accent="text-purple-300">
        <div className="font-mono text-xs text-gray-300 space-y-4">
          <div>
            <p className="text-gray-400 mb-2">Each joint transformation follows the modified DH convention:</p>
            <div className="p-3 rounded-xl bg-[#060812] border border-purple-500/20 text-purple-200 leading-loose">
              {`Aᵢ(θᵢ) = Rot(z,θᵢ) · Trans(z,dᵢ) · Trans(x,aᵢ) · Rot(x,αᵢ)

⎡ cos θᵢ  -sin θᵢ cos αᵢ   sin θᵢ sin αᵢ   aᵢ cos θᵢ ⎤
⎢ sin θᵢ   cos θᵢ cos αᵢ  -cos θᵢ sin αᵢ   aᵢ sin θᵢ ⎥
⎢    0        sin αᵢ            cos αᵢ           dᵢ    ⎥
⎣    0           0               0               1     ⎦`}
            </div>
          </div>

          <div>
            <p className="text-gray-400 mb-2">Total FK: T₀⁶ = A₁ · A₂ · A₃ · A₄ · A₅ · A₆</p>
            <p className="text-gray-400 mb-2">Live T₀⁶ result (from current joint angles):</p>
            {T06.length === 4 && (
              <div className="p-3 rounded-xl bg-[#060812] border border-blue-500/20 text-blue-200 text-[11px] leading-6">
                {T06.map((row, ri) => (
                  <div key={ri} className="flex gap-4">
                    {row.map((v, ci) => (
                      <span key={ci} className="w-12 text-right">{v.toFixed(4)}</span>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-gray-400 mb-2">Jacobian Construction (Geometric):</p>
            <div className="p-3 rounded-xl bg-[#060812] border border-cyan-500/20 text-cyan-200 leading-loose">
              {`J = [J_p]   where  J_p_i = z_{i-1} × (p_e - p_{i-1})
    [J_o]          J_o_i = z_{i-1}  (revolute joint)

det(J) = ${jacobianResult.detJ}  (singularity metric)
κ(J)   = ${jacobianResult.conditionNumber}  (condition number)
μ(q)   = ${jacobianResult.manipulability}  (manipulability index)`}
            </div>
          </div>

          <div>
            <p className="text-gray-400 mb-2">IK – Damped Least Squares (DLS):</p>
            <div className="p-3 rounded-xl bg-[#060812] border border-indigo-500/20 text-indigo-200 leading-loose">
              {`Δq = Jᵀ(JJᵀ + λ²I)⁻¹ Δx

Where:  λ = 0.1  (damping factor)
        max_iter = 50
        tolerance = 5mm`}
            </div>
          </div>
        </div>
      </Section>

      {/* DH Table */}
      <Section title="DH Parameter Table (all joints)" icon={Layers} defaultOpen accent="text-blue-300">
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#080b15]">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#0f1424] text-gray-400 text-[10px] uppercase">
                <th className="py-2 px-3">i</th>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">θᵢ (base)</th>
                <th className="py-2 px-3">dᵢ (m)</th>
                <th className="py-2 px-3">aᵢ (m)</th>
                <th className="py-2 px-3">αᵢ (°)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {DH_TABLE.map(row => (
                <tr key={row.joint} className="hover:bg-white/[0.02]">
                  <td className="py-2 px-3 font-bold text-blue-400">{row.joint}</td>
                  <td className="py-2 px-3 text-gray-300">{row.name}</td>
                  <td className="py-2 px-3 text-amber-300">{row.theta}°</td>
                  <td className="py-2 px-3">{row.d}</td>
                  <td className="py-2 px-3">{row.a}</td>
                  <td className="py-2 px-3">{row.alpha}°</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ROS 2 Node Graph */}
      <Section title="ROS 2 Node Architecture Diagram" icon={Share2} accent="text-emerald-300">
        <div className="p-4 bg-[#060812] rounded-xl border border-emerald-500/20 font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre-wrap">
          {ROS2_NODE_DIAGRAM}
        </div>
        <div className="mt-3 text-[10px] text-gray-500 font-mono">
          ⚠ This node graph represents the intended ROS 2 architecture. All nodes run in SIMULATION_MODE in this environment.
        </div>
      </Section>

      {/* TF2 Frame Tree */}
      <Section title="TF2 Frame Tree" icon={Share2} accent="text-cyan-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#060812] rounded-xl border border-cyan-500/20 font-mono text-[11px] text-cyan-300 whitespace-pre">
            {TF2_TREE}
          </div>
          <div className="flex flex-col gap-2 font-mono text-[10px]">
            <p className="text-gray-400">Live joint positions from FK:</p>
            {fkResult.jointPositions.map(([x, y, z], i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-gray-500 w-20 shrink-0">frame_{i === 0 ? 'base' : `link${i}`}:</span>
                <span className="text-cyan-300">[{x.toFixed(4)}, {y.toFixed(4)}, {z.toFixed(4)}]m</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* URDF/Xacro Joint Table */}
      <Section title="URDF / Xacro Joint Table" icon={Layers} accent="text-amber-300">
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#080b15]">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#0f1424] text-gray-400 text-[10px] uppercase">
                <th className="py-2 px-3">Joint Name</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Axis</th>
                <th className="py-2 px-3">Parent</th>
                <th className="py-2 px-3">Child</th>
                <th className="py-2 px-3">Limits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {URDF_JOINTS.map(j => (
                <tr key={j.name} className="hover:bg-white/[0.02]">
                  <td className="py-2 px-3 text-amber-300 font-semibold text-[11px]">{j.name}</td>
                  <td className="py-2 px-3">{j.type}</td>
                  <td className="py-2 px-3 text-cyan-400">{j.axis}</td>
                  <td className="py-2 px-3 text-gray-400">{j.parent}</td>
                  <td className="py-2 px-3 text-gray-400">{j.child}</td>
                  <td className="py-2 px-3 text-purple-400 text-[10px]">{j.lim}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 bg-[#060812] rounded-xl border border-amber-500/20 font-mono text-[10px] text-amber-200">
          <p className="font-bold mb-1">Xacro macro (excerpt):</p>
          {'<xacro:macro name="arm_joint" params="name parent child origin_xyz origin_rpy axis_xyz lower_limit upper_limit">\n  <joint name="${name}" type="revolute">\n    <parent link="${parent}"/>\n    <child link="${child}"/>\n    <origin xyz="${origin_xyz}" rpy="${origin_rpy}"/>\n    <axis xyz="${axis_xyz}"/>\n    <limit lower="${lower_limit}" upper="${upper_limit}" effort="100" velocity="3.14"/>\n  </joint>\n</xacro:macro>'}
        </div>
      </Section>

      {/* Launch File */}
      <Section title="ROS 2 Launch File Documentation" icon={BookOpen} accent="text-indigo-300">
        <pre className="p-4 bg-[#060812] rounded-xl border border-indigo-500/20 font-mono text-[11px] text-indigo-300 overflow-x-auto whitespace-pre-wrap">
          {LAUNCH_FILE}
        </pre>
        <p className="mt-2 text-[10px] text-gray-500 font-mono">
          RViz2, Gazebo Sim, and MoveIt 2 would be launched alongside. In this environment, all physics is simulated by our in-browser engine.
        </p>
      </Section>

    </div>
  );
};
