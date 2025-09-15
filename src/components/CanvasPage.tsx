import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { useMermaidRenderer } from '../hooks/useMermaidRenderer';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import Header from './Header';
import DiagramViewer, { DiagramViewerHandle } from './DiagramViewer';
import CanvasControls from './CanvasControls';
import MermaidEditor from './MermaidEditor';
import { useToast } from '../context/ToastContext';
import './CanvasPage.css';
import { Button } from './ui/Button';

const CanvasPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, loadProject, setAnimating, isAnimating, error: appError, setCurrentProjectCode } = useApp();
  const { render, svg, isRendering, error: renderError } = useMermaidRenderer();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const viewerRef = useRef<DiagramViewerHandle>(null);

  if (import.meta.env.DEV) {
    console.log('CanvasPage render - projectId:', projectId);
    console.log('CanvasPage render - currentProject:', currentProject);
    console.log('CanvasPage render - svg:', svg);
    console.log('CanvasPage render - isRendering:', isRendering);
    console.log('CanvasPage render - appError:', appError);
    console.log('CanvasPage render - renderError:', renderError);
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+s': () => {
      if (isEditing) {
        // Save would be handled by the editor itself
      } else {
        // Toggle edit mode
        setIsEditing(v => !v);
      }
    },
    'ctrl+e': () => {
      if (!isEditing) {
        setIsEditing(true);
      }
    },
    'escape': () => {
      if (isEditing) {
        setIsEditing(false);
      }
    },
    ' ': () => {
      // Spacebar to toggle animation
      setAnimating(!isAnimating);
    }
  });

  // Load project when component mounts or projectId changes
  useEffect(() => {
    if (import.meta.env.DEV) console.log('CanvasPage useEffect - projectId:', projectId);
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]); // Removed loadProject from dependencies since it's now memoized

  // Render diagram when project code changes
  useEffect(() => {
    if (import.meta.env.DEV) console.log('CanvasPage useEffect - currentProject:', currentProject);
    if (currentProject && currentProject.mermaidCode) {
      if (import.meta.env.DEV) console.log('CanvasPage useEffect - calling render with mermaidCode:', currentProject.mermaidCode);
      render(currentProject.mermaidCode, 'canvas-diagram');
    }
  }, [currentProject, render]);

  const handleBack = () => {
    navigate('/history');
  };

  const handleAnimate = () => {
    setAnimating(!isAnimating);
  };

  const handleEditToggle = () => setIsEditing(v => !v);

  const handleZoomIn = () => setZoom(z => Math.min(3, parseFloat((z + 0.1).toFixed(2))));
  const handleZoomOut = () => setZoom(z => Math.max(0.2, parseFloat((z - 0.1).toFixed(2))));
  const handleFit = () => { setZoom(1); viewerRef.current?.resetPan(); };
  const handleFitWidth = () => viewerRef.current?.fitToWidth();
  const handleFitHeight = () => viewerRef.current?.fitToHeight();
  const handleResetView = () => { setZoom(1); viewerRef.current?.resetPan(); };

  const handleEditorSave = (code: string) => {
    if (!currentProject) return;
    setCurrentProjectCode(code);
    showToast('Diagram updated', 'success');
    setIsEditing(false);
  };

  // Check if we're trying to load a specific project but it's not found
  const isError = appError || renderError;
  const isProjectNotFound = projectId && !currentProject && !isRendering;
  
  if (import.meta.env.DEV) {
    console.log('CanvasPage render - isError:', isError);
    console.log('CanvasPage render - isProjectNotFound:', isProjectNotFound);
    console.log('CanvasPage render - isRendering:', isRendering);
    console.log('CanvasPage render - svg:', svg);
    console.log('CanvasPage render - conditions for DiagramViewer:', {
      svgExists: !!svg,
      isProjectNotFound,
      shouldShowDiagramViewer: svg && !isProjectNotFound
    });
  }

  return (
    <div className="canvas-page">
      <Header 
        title={currentProject?.name || "Diagram"}
        showBack={true}
        onBack={handleBack}
      />
      
      <main className="canvas-content">
        {/* Desktop/top controls (hidden on mobile via CSS) */}
        <div className="canvas-controls-wrapper--top">
          <CanvasControls
            isAnimating={isAnimating}
            onAnimate={handleAnimate}
            isEditing={isEditing}
            onEditToggle={handleEditToggle}
            svgContent={svg || ''}
            className="canvas-controls--top"
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFit={handleFit}
            onFitWidth={handleFitWidth}
            onFitHeight={handleFitHeight}
            onResetView={handleResetView}
            zoom={zoom}
          />
        </div>
        {isProjectNotFound && (
          <div className="error-container">
            <div className="error">Project not found. It may have been deleted.</div>
            <Button variant="tonal" onClick={() => navigate('/history')}>Back to History</Button>
          </div>
        )}
        
        {isEditing && currentProject && (
          <MermaidEditor
            initialValue={currentProject.mermaidCode}
            onSave={handleEditorSave}
          />
        )}

        {(isRendering || !svg) && !isError && !isProjectNotFound && !isEditing && (
          <div className="loading-container">
            <div className="loading">Rendering diagram... (isRendering: {String(isRendering)}, svg: {String(!!svg)})</div>
          </div>
        )}
        
        {isError && !isProjectNotFound && !isEditing && (
          <div className="error-container">
            <div className="error">{isError}</div>
            <Button variant="tonal" onClick={() => navigate('/history')}>Back to History</Button>
          </div>
        )}
        
        {svg && !isProjectNotFound && !isEditing && (
          <DiagramViewer
            ref={viewerRef}
            svgContent={svg}
            isAnimating={isAnimating}
            zoom={zoom}
            onZoomChange={setZoom}
          />
        )}
      </main>
      
      {!isProjectNotFound && (
        <div className="canvas-controls-wrapper--bottom">
          <CanvasControls
            isAnimating={isAnimating}
            onAnimate={handleAnimate}
            isEditing={isEditing}
            onEditToggle={handleEditToggle}
            svgContent={svg || ''}
            className="canvas-controls--bottom"
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFit={handleFit}
            onFitWidth={handleFitWidth}
            onFitHeight={handleFitHeight}
            onResetView={handleResetView}
            zoom={zoom}
          />
        </div>
      )}
    </div>
  );
};

export default CanvasPage;
