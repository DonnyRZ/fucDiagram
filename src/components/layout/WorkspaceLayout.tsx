import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import Breadcrumb from '../navigation/Breadcrumb';
import TabPanel from '../navigation/TabPanel';
import Sidebar from '../navigation/Sidebar';
import Header from '../shared/Header';
import TopNavigation from './TopNavigation';
import '../../pages/Workspace.css';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  onToggleSidebar: () => void;
  onNewDiagram: () => void;
  onSaveDiagram: () => void;
  onToggleEditorMode: () => void;
  onToggleHistory: () => void;
  sidebarOpen: boolean;
  sidebarActiveTab: 'history' | 'templates' | 'settings';
  setSidebarActiveTab: (tab: 'history' | 'templates' | 'settings') => void;
  editorMode: 'mermaid' | 'flow';
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  error?: string;
}

const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  children,
  onToggleSidebar,
  onNewDiagram,
  onSaveDiagram,
  onToggleEditorMode,
  onToggleHistory,
  sidebarOpen,
  sidebarActiveTab,
  setSidebarActiveTab,
  editorMode,
  isLoading,
  hasUnsavedChanges,
  showHistory,
  setShowHistory,
  error
}) => {
  const navigate = useNavigate();
  const { currentProject, projects, loadProject } = useApp();
  const { 
    removeFromOpen,
    currentView,
    setCurrentView
  } = useNavigation();
  const { showToast } = useToast();
  const location = useLocation();
  
  const [sidebarOpenState, setSidebarOpenState] = useState(sidebarOpen);

  // Handle URL changes and load corresponding project
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const projectId = pathParts[2]; // /canvas/:projectId
    
    if (projectId && projectId !== 'canvas') {
      loadProject(projectId);
      setCurrentView('editor');
    } else if (location.pathname === '/history') {
      setCurrentView('history');
    } else if (location.pathname === '/templates' || location.pathname === '/new') {
      setCurrentView('templates');
    } else if (location.pathname === '/') {
      setCurrentView('start');
    }
  }, [location.pathname, loadProject, setCurrentView]);

  const handleToggleSidebar = () => {
    setSidebarOpenState(!sidebarOpenState);
    onToggleSidebar();
  };

  const handleTabClose = (id: string) => {
    removeFromOpen(id);
    if (id === currentProject?.id) {
      // If closing the current project, navigate to history
      navigate('/history');
    }
  };

  return (
    <div className="workspace">
      <Breadcrumb 
        items={[
          { title: 'Home', path: '/' },
          { title: currentProject?.name || 'Diagram Editor' }
        ]} 
      />
      <TabPanel onTabClose={handleTabClose} />
      <Header 
        title={currentProject?.name || 'Diagram Editor'} 
        showBack={false} // No back button in workspace
      />
      <TopNavigation 
        onNewDiagram={onNewDiagram}
        onSaveDiagram={onSaveDiagram}
        onShareDiagram={() => {
          showToast('Share functionality coming soon', 'info');
        }}
        onToggleHistory={onToggleHistory}
        onToggleSidebar={handleToggleSidebar}
        onToggleEditorMode={onToggleEditorMode}
        editorMode={editorMode}
        isLoading={isLoading}
        hasUnsavedChanges={hasUnsavedChanges}
      />
      {sidebarOpenState && (
        <div 
          className="sidebar-overlay open" 
          onClick={() => setSidebarOpenState(false)}
        />
      )}
      <Sidebar 
        isOpen={sidebarOpenState}
        onClose={() => setSidebarOpenState(false)}
        activeTab={sidebarActiveTab}
        onTabChange={setSidebarActiveTab}
      />
      
      <main className="workspace-main">
        {children}
      </main>
      
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}
    </div>
  );
};

export default WorkspaceLayout;