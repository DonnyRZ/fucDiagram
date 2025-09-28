import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { useMermaidRenderer } from '../hooks/useMermaidRenderer';
import { useToast } from '../context/ToastContext';
import Header from '../components/shared/Header';
import TopNavigation from '../components/layout/TopNavigation';
import ResizablePane from '../components/layout/ResizablePane';
import EditorPanel from '../components/editor/EditorPanel';
import ZoomablePreviewPanel from '../components/diagram/ZoomablePreviewPanel';
import './EditorPage.css';

const EditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();
  const { 
    currentProject, 
    createProject, 
    updateProject, 
    loadProject,
    showHistory, 
    setShowHistory,
    editorPaneSize,
    setEditorPaneSize,
    isAnimating,
    toggleAnimation,
    isLoading
  } = useApp();
  const { render, svg, error } = useMermaidRenderer();
  const { showToast } = useToast();
  
  const [code, setCode] = useState(currentProject?.mermaidCode || '');

  // Load project when component mounts or projectId changes
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  // Set initial code when current project changes
  useEffect(() => {
    if (currentProject) {
      setCode(currentProject.mermaidCode);
      // Auto-render when project loads
      render(currentProject.mermaidCode, 'editor-preview');
    }
  }, [currentProject, render]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const handleNewDiagram = useCallback(() => {
    setCode('');
    // Go back to start page to create a new diagram
    navigate('/');
  }, [navigate]);

  const handleSaveDiagram = useCallback(() => {
    if (currentProject) {
      // Update existing project
      updateProject({
        ...currentProject,
        mermaidCode: code,
        updatedAt: new Date()
      });
      showToast('Diagram saved successfully', 'success');
    } else {
      // Create new project
      try {
        createProject('New Diagram', code);
        showToast('Diagram created successfully', 'success');
      } catch (err) {
        showToast('Failed to save diagram', 'error');
      }
    }
  }, [currentProject, code, updateProject, createProject, showToast]);

  const handleToggleAnimation = useCallback(() => {
    toggleAnimation();
  }, [toggleAnimation]);

  const handleToggleHistory = useCallback(() => {
    setShowHistory(!showHistory);
  }, [showHistory, setShowHistory]);

  const handleShareDiagram = useCallback(() => {
    if (currentProject && svg) {
      // Create a shareable URL with the diagram code
      const encodedCode = encodeURIComponent(currentProject.mermaidCode);
      const shareUrl = `${window.location.origin}${window.location.pathname}#code=${encodedCode}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Share link copied to clipboard!', 'success');
      }).catch(() => {
        // Fallback: show the URL in a prompt
        showToast('Share link copied to clipboard!', 'success');
      });
    } else {
      showToast('No diagram to share', 'error');
    }
  }, [currentProject, svg, showToast]);

  return (
    <div className="editor-page">
      <Header 
        title={currentProject?.name || 'Diagram Editor'} 
        showBack={true} 
        backPath={currentProject ? '/history' : '/'} 
      />
      <TopNavigation 
        onNewDiagram={handleNewDiagram}
        onSaveDiagram={handleSaveDiagram}
        onShareDiagram={handleShareDiagram}
        onToggleHistory={handleToggleHistory}
        isLoading={isLoading}
      />
      
      <div className="layout-container">
        <ResizablePane initialSizes={[editorPaneSize, 100 - editorPaneSize]} onResize={setEditorPaneSize}>
          <EditorPanel 
            code={code}
            onCodeChange={handleCodeChange}
          />
          <ZoomablePreviewPanel 
            code={code}
            isAnimating={isAnimating}
            onToggleAnimation={handleToggleAnimation}
          />
        </ResizablePane>
      </div>
      
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}
    </div>
  );
};

export default EditorPage;