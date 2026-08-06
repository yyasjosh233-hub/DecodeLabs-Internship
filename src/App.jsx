import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

// Public layout, components & pages
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Illustrations from './pages/Illustrations';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import ChatWidget from './components/ChatWidget';
import ScrollToTop from './components/ScrollToTop';
import LoadingScreen from './components/LoadingScreen';
import PageTransition from './components/PageTransition';

// Platform layout, components & pages
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import ROS2KnowledgeHub from './pages/ROS2KnowledgeHub';
import ROS2ErrorDebugger from './pages/ROS2ErrorDebugger';
import NVIDIARoboticsHub from './pages/NVIDIARoboticsHub';
import Nav2Assistant from './pages/Nav2Assistant';
import SLAMExplorer from './pages/SLAMExplorer';
import URDFAnalyzer from './pages/URDFAnalyzer';
import RobotKB from './pages/RobotKB';
import RobotIntelligenceLab from './pages/RobotIntelligenceLab';
import ProjectsWorkspace from './pages/ProjectsWorkspace';
import TrustedSources from './pages/TrustedSources';
import Settings from './pages/Settings';
import GlobalRoboticsCompanies from './pages/GlobalRoboticsCompanies';
import PathPlannerPage from './industrial_ai/robotics_path_planner/PathPlannerPage';
import QualityInspectionPage from './industrial_ai/quality_inspection/QualityInspectionPage';

// Public layout wrapper
const PublicLayout = () => {
  return (
    <>
      <Header />
      <main>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
};

// Platform Workspace layout wrapper
const PlatformLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeProject, setActiveProject] = useState('agro_r1');

  return (
    <div className="platform-layout-wrapper">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeProject={activeProject}
        setActiveProject={setActiveProject}
      />
      <div className={`platform-main-body ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        <TopNav 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeProject={activeProject}
        />
        <main className="platform-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Routes>
          {/* Public Website Portfolio */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/illustrations" element={<Illustrations />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Platform Workspace Console */}
          <Route element={<PlatformLayout />}>
            <Route path="/workspace" element={<Dashboard />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/ros2-hub" element={<ROS2KnowledgeHub />} />
            <Route path="/ros2-debugger" element={<ROS2ErrorDebugger />} />
            <Route path="/nvidia-hub" element={<NVIDIARoboticsHub />} />
            <Route path="/nav2-assistant" element={<Nav2Assistant />} />
            <Route path="/slam-explorer" element={<SLAMExplorer />} />
            <Route path="/urdf-analyzer" element={<URDFAnalyzer />} />
            <Route path="/robot-kb" element={<RobotKB />} />
            <Route path="/robot-lab" element={<RobotIntelligenceLab />} />
            <Route path="/robot-lab/:tab" element={<RobotIntelligenceLab />} />
            <Route path="/projects-workspace" element={<ProjectsWorkspace />} />
            <Route path="/trusted-sources" element={<TrustedSources />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/robotics-companies" element={<GlobalRoboticsCompanies />} />
            <Route path="/industrial-ai/robotics-path-planner" element={<PathPlannerPage />} />
            <Route path="/industrial-ai/quality-inspection" element={<QualityInspectionPage />} />
          </Route>

          {/* Fallback to Platform Workspace */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

