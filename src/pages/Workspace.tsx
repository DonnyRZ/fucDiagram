import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { useNavigation } from '../context/NavigationContext';
import { useMermaidRenderer } from '../hooks/useMermaidRenderer';
import { useToast } from '../context/ToastContext';
import { useAutoSave } from '../hooks/useAutoSave';
import { Tab } from '../types';
import Breadcrumb from '../components/navigation/Breadcrumb';
import TabPanel from '../components/navigation/TabPanel';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/shared/Header';
import TopNavigation from '../components/layout/TopNavigation';
import AdvancedResizablePane from '../components/layout/AdvancedResizablePane';
import EnhancedEditorPanel from '../components/editor/EnhancedEditorPanel';
import ConfigPanel from '../components/editor/ConfigPanel';
import ZoomablePreviewPanel from '../components/diagram/ZoomablePreviewPanel';
import ProjectList from '../components/features/project/ProjectList';
import './Workspace.css';

const Workspace: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    currentProject, 
    createProject, 
    updateProject, 
    loadProject,
    projects,
    showHistory, 
    setShowHistory,
    editorPaneSize,
    setEditorPaneSize,
    isAnimating,
    toggleAnimation,
    isLoading,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    recentProjects,
    updateRecentProjects
  } = useApp();
  const { 
    currentView, 
    setCurrentView, 
    setActiveDiagram, 
    addToOpen, 
    removeFromOpen,
    addToRecent 
  } = useNavigation();
  const { render, svg, error, isRendering } = useMermaidRenderer();
  const { showToast } = useToast();
  
  const [code, setCode] = useState(currentProject?.mermaidCode || '');
  const [mermaidConfig, setMermaidConfig] = useState<any>({}); // Default Mermaid config
  const [activeTab, setActiveTab] = useState<'code' | 'config'>('code');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarActiveTab, setSidebarActiveTab] = useState<'history' | 'templates' | 'settings'>('history');
  const [workspaceReady, setWorkspaceReady] = useState(false);

  // Define tabs
  const editorTabs: Tab[] = [
    {
      id: 'code',
      title: 'Code'
    },
    {
      id: 'config',
      title: 'Config'
    }
  ];

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

  // Update local code when current project changes
  useEffect(() => {
    if (currentProject) {
      setCode(currentProject.mermaidCode);
      // Add to open diagrams
      addToOpen(currentProject);
      // Add to recent projects
      addToRecent(currentProject);
      // Update navigation context
      setActiveDiagram(currentProject.id);
      setWorkspaceReady(true);
    } else {
      setWorkspaceReady(false);
    }
  }, [currentProject, addToOpen, addToRecent, setActiveDiagram]);

  const handleCodeChange = React.useCallback((newCode: string) => {
    setCode(newCode);
    
    // Check if the code differs from the pristine version to determine if there are unsaved changes
    const hasChanges = newCode.trim() !== (currentProject?.mermaidCode || '').trim();
    setHasUnsavedChanges(hasChanges);
  }, [currentProject?.mermaidCode, setHasUnsavedChanges]);

  // Auto-save functionality
  useAutoSave(
    code,
    React.useCallback((content: string) => {
      if (currentProject && hasUnsavedChanges) {
        // Update the project with the current code
        updateProject({
          ...currentProject,
          mermaidCode: content,
          updatedAt: new Date()
        });
        setHasUnsavedChanges(false);
        showToast('Diagram auto-saved', 'info');
      }
    }, [currentProject, hasUnsavedChanges, updateProject, setHasUnsavedChanges, showToast]),
    30000 // Auto-save every 30 seconds
  );

  const handleConfigChange = React.useCallback((newConfig: any) => {
    setMermaidConfig(newConfig);
  }, []);

  const handleTabChange = React.useCallback((tabId: 'code' | 'config') => {
    setActiveTab(tabId);
  }, []);

  const handleNewDiagram = React.useCallback(() => {
    // Create a new untitled project
    try {
      const newProject = createProject('Untitled Diagram', `graph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action]\n    B -->|No| D[End]`);
      addToOpen(newProject);
      addToRecent(newProject);
      setActiveDiagram(newProject.id);
      navigate(`/canvas/${newProject.id}`);
      showToast('New diagram created', 'success');
    } catch (err) {
      showToast('Failed to create diagram', 'error');
    }
  }, [createProject, addToOpen, addToRecent, setActiveDiagram, navigate, showToast]);

  const handleSaveDiagram = React.useCallback(() => {
    if (currentProject) {
      // Update existing project
      const updatedProject = {
        ...currentProject,
        mermaidCode: code,
        updatedAt: new Date()
      };
      updateProject(updatedProject);
      setHasUnsavedChanges(false);
      addToRecent(updatedProject);
      showToast('Diagram saved successfully', 'success');
    } else {
      // This shouldn't happen in workspace mode, but just in case
      showToast('No diagram to save', 'error');
    }
  }, [currentProject, code, updateProject, setHasUnsavedChanges, addToRecent, showToast]);

  const handleToggleAnimation = React.useCallback(() => {
    toggleAnimation();
  }, [toggleAnimation]);

  const handleToggleSidebar = React.useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  const handleOpenProject = React.useCallback((id: string) => {
    navigate(`/canvas/${id}`);
    setSidebarOpen(false);
  }, [navigate]);

  const handleDeleteProject = React.useCallback((id: string) => {
    // Note: This would need confirmation in a real implementation
    // For now, just navigate away if this is the current project
    if (currentProject?.id === id) {
      navigate('/');
    }
  }, [currentProject?.id, navigate]);

  // Handle beforeunload event to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Update document title to reflect save status
  useEffect(() => {
    const baseTitle = currentProject?.name || 'Diagram Editor';
    document.title = hasUnsavedChanges ? `* ${baseTitle}` : baseTitle;
    return () => {
      document.title = 'Diagram Editor';
    };
  }, [currentProject?.name, hasUnsavedChanges]);

  const renderCurrentView = () => {
    if (currentView === 'history') {
      return (
        <div className="workspace-history-view">
          <div className="history-header">
            <h2>My Diagrams</h2>
          </div>
          <ProjectList
            projects={projects}
            onOpenProject={handleOpenProject}
            onDeleteProject={handleDeleteProject}
          />
        </div>
      );
    }

    if (currentView === 'templates') {
      return (
        <div className="workspace-templates-view">
          <h2>Templates</h2>
          <div className="template-options">
            <button onClick={handleNewDiagram} className="btn btn-primary">
              Create from Scratch
            </button>
            <p>More templates coming soon...</p>
          </div>
        </div>
      );
    }

    // Default to editor view
    return (
      <>
        <div className="workspace-editor-container">
          <AdvancedResizablePane 
            initialSizes={[30, 50, 20]}
            showHistory={showHistory}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            tabs={editorTabs}
            onResize={setEditorPaneSize}
            editorContent={
              activeTab === 'code' ? (
                <EnhancedEditorPanel
                  code={code}
                  config={mermaidConfig}
                  onCodeChange={handleCodeChange}
                  onConfigChange={handleConfigChange}
                  isRendering={isRendering}
                  hasUnsavedChanges={hasUnsavedChanges}
                />
              ) : (
                <ConfigPanel
                  config={mermaidConfig}
                  onChange={handleConfigChange}
                />
              )
            }
            previewContent={
              <ZoomablePreviewPanel 
                code={code}
                isAnimating={isAnimating}
                onToggleAnimation={handleToggleAnimation}
              />
            }
            historyContent={
              <div className="history-panel">
                <div className="history-panel-header">
                  <h3>Recent Diagrams</h3>
                </div>
                <div className="recent-list">
                  {recentProjects.slice(0, 10).map(project => (
                    <div 
                      key={project.id} 
                      className="recent-item"
                      onClick={() => handleOpenProject(project.id)}
                    >
                      <div className="recent-item-name">{project.name}</div>
                      <div className="recent-item-date">
                        {new Date(project.lastOpened || project.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="history-panel-footer">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setCurrentView('history');
                      setSidebarOpen(false);
                    }}
                  >
                    View All Diagrams
                  </button>
                </div>
              </div>
            }
          />
        </div>
      </>
    );
  };

  return (
    <div className="workspace">
      <Breadcrumb 
        items={[
          { title: 'Home', path: '/' },
          { title: currentProject?.name || 'Diagram Editor' }
        ]} 
      />
      <TabPanel 
        onTabClose={(id) => {
          removeFromOpen(id);
          if (id === currentProject?.id) {
            // If closing the current project, navigate to history
            navigate('/history');
          }
        }}
      />
      <Header 
        title={currentProject?.name || 'Diagram Editor'} 
        showBack={false} // No back button in workspace
      />
      <TopNavigation 
        onNewDiagram={handleNewDiagram}
        onSaveDiagram={handleSaveDiagram}
        onShareDiagram={() => {
          // Share functionality would go here
          showToast('Share functionality coming soon', 'info');
        }}
        onToggleHistory={() => {
          // Toggle built-in history panel
          setShowHistory(!showHistory);
        }}
        onToggleSidebar={handleToggleSidebar}
        isLoading={isLoading}
        hasUnsavedChanges={hasUnsavedChanges}
      />
      {sidebarOpen && (
        <div 
          className="sidebar-overlay open" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={sidebarActiveTab}
        onTabChange={setSidebarActiveTab}
      />
      
      <main className="workspace-main">
        {renderCurrentView()}
      </main>
      
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}
    </div>
  );
};

export default Workspace;