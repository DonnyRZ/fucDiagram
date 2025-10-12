import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { useNavigation } from '../context/NavigationContext';
import { useMermaidRenderer } from '../hooks/useMermaidRenderer';
import { useToast } from '../context/ToastContext';
import WorkspaceLayout from '../components/layout/WorkspaceLayout';
import WorkspaceEditorView from '../components/views/WorkspaceEditorView';
import WorkspaceFlowView from '../components/views/WorkspaceFlowView';
import WorkspaceHistoryView from '../components/views/WorkspaceHistoryView';
import WorkspaceTemplatesView from '../components/views/WorkspaceTemplatesView';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import './Workspace.css';

const Workspace: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    currentProject, 
    createProject, 
    updateProject,
    projects,
    showHistory,
    setShowHistory,
    isAnimating,
    toggleAnimation,
    isLoading,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    recentProjects,
    editorMode,
    setEditorMode
  } = useApp();
  const { 
    currentView, 
    setCurrentView, 
    setActiveDiagram, 
    addToOpen,
    removeFromOpen,
    addToRecent: addRecent 
  } = useNavigation();
  const { showToast } = useToast();
  
  const [code, setCode] = useState(currentProject?.mermaidCode || '');
  const [activeTab, setActiveTab] = useState<'code' | 'config'>('code');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarActiveTab, setSidebarActiveTab] = useState<'history' | 'templates' | 'settings'>('history');

  // Update local code when current project changes
  useEffect(() => {
    if (currentProject) {
      setCode(currentProject.mermaidCode);
      // Add to open diagrams
      addToOpen(currentProject);
      // Add to recent projects
      addRecent(currentProject);
      // Update navigation context
      setActiveDiagram(currentProject.id);
    }
  }, [currentProject, addToOpen, addRecent, setActiveDiagram]);

  const handleNewDiagram = React.useCallback(() => {
    // Create a new untitled project
    try {
      const newProject = createProject('Untitled Diagram', `graph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action]\n    B -->|No| D[End]`);
      addToOpen(newProject);
      addRecent(newProject);
      setActiveDiagram(newProject.id);
      navigate(`/canvas/${newProject.id}`);
      showToast('New diagram created', 'success');
    } catch (err) {
      showToast('Failed to create diagram', 'error');
    }
  }, [createProject, addToOpen, addRecent, setActiveDiagram, navigate, showToast]);

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
      addRecent(updatedProject);
      showToast('Diagram saved successfully', 'success');
    } else {
      // This shouldn't happen in workspace mode, but just in case
      showToast('No diagram to save', 'error');
    }
  }, [currentProject, code, updateProject, setHasUnsavedChanges, addRecent, showToast]);

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
  useUnsavedChangesWarning(hasUnsavedChanges);

  // Update document title to reflect save status
  useDocumentTitle(currentProject?.name || undefined, hasUnsavedChanges);

  const renderCurrentView = () => {
    if (currentView === 'history') {
      return (
        <WorkspaceHistoryView 
          onOpenProject={handleOpenProject}
          onDeleteProject={handleDeleteProject}
        />
      );
    }

    if (currentView === 'templates') {
      return (
        <WorkspaceTemplatesView 
          onNewDiagram={handleNewDiagram}
        />
      );
    }

    // Default to editor view
    return editorMode === 'flow' ? (
      <WorkspaceFlowView
        code={code}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
      />
    ) : (
      <WorkspaceEditorView
        code={code}
        setCode={setCode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
        setCurrentView={setCurrentView}
      />
    );
  };

  const { error } = useMermaidRenderer();

  return (
    <WorkspaceLayout
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      onNewDiagram={handleNewDiagram}
      onSaveDiagram={handleSaveDiagram}
      onToggleEditorMode={() => setEditorMode(editorMode === 'mermaid' ? 'flow' : 'mermaid')}
      onToggleHistory={() => {
        // Always ensure the sidebar opens and set the active tab to history
        setSidebarOpen(true);
        setSidebarActiveTab('history');
      }}
      sidebarOpen={sidebarOpen}
      sidebarActiveTab={sidebarActiveTab}
      setSidebarActiveTab={setSidebarActiveTab}
      editorMode={editorMode}
      isLoading={isLoading}
      hasUnsavedChanges={hasUnsavedChanges}
      showHistory={showHistory}
      setShowHistory={setShowHistory}
      error={error || undefined}
    >
      {renderCurrentView()}
    </WorkspaceLayout>
  );
};

export default Workspace;