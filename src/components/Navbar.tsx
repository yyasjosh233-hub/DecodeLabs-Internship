import React from 'react';
import { Axis3D, Calculator, TrendingUp, ShieldAlert, Terminal, BookOpen } from 'lucide-react';

export type RoboticsTab = 'viewport' | 'kinematics' | 'trajectory' | 'collision' | 'telemetry' | 'architecture';

interface NavbarProps {
  activeTab: RoboticsTab;
  setActiveTab: (tab: RoboticsTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="border-b border-[#1c233c] bg-[#090c17]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2 overflow-x-auto font-mono text-xs">
        
        <button
          onClick={() => setActiveTab('viewport')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'viewport'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-bold border-b-2 border-b-blue-500'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Axis3D className="w-4 h-4 text-blue-400" />
          3D Viewport & Dashboard
        </button>

        <button
          onClick={() => setActiveTab('kinematics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'kinematics'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-bold border-b-2 border-b-blue-500'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calculator className="w-4 h-4 text-purple-400" />
          Kinematics (FK / IK)
        </button>

        <button
          onClick={() => setActiveTab('trajectory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'trajectory'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-bold border-b-2 border-b-blue-500'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Trajectory Planner
        </button>

        <button
          onClick={() => setActiveTab('collision')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'collision'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-bold border-b-2 border-b-blue-500'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Collision Monitor
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'telemetry'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-bold border-b-2 border-b-blue-500'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Terminal className="w-4 h-4 text-emerald-400" />
          ROS 2 & Telemetry
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'architecture'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-bold border-b-2 border-b-blue-500'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-400" />
          Architecture & Math
        </button>

      </div>
    </nav>
  );
};
