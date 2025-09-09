import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { useMermaidRenderer } from '../hooks/useMermaidRenderer';
import Header from './Header';
import DiagramViewer from './DiagramViewer';
import CanvasControls from './CanvasControls';
import './CanvasPage.css';

const CanvasPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, loadProject, setAnimating, isAnimating, error: appError } = useApp();
  const { render, svg, isRendering, error: renderError } = useMermaidRenderer();

  console.log('CanvasPage render - projectId:', projectId);
  console.log('CanvasPage render - currentProject:', currentProject);
  console.log('CanvasPage render - svg:', svg);
  console.log('CanvasPage render - isRendering:', isRendering);
  console.log('CanvasPage render - appError:', appError);
  console.log('CanvasPage render - renderError:', renderError);

  // Load project when component mounts or projectId changes
  useEffect(() => {
    console.log('CanvasPage useEffect - projectId:', projectId);
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]); // Removed loadProject from dependencies since it's now memoized

  // Render diagram when project code changes
  useEffect(() => {
    console.log('CanvasPage useEffect - currentProject:', currentProject);
    if (currentProject && currentProject.mermaidCode) {
      console.log('CanvasPage useEffect - calling render with mermaidCode:', currentProject.mermaidCode);
      render(currentProject.mermaidCode, 'canvas-diagram');
    }
  }, [currentProject, render]);

  const handleBack = () => {
    navigate('/history');
  };

  const handleAnimate = () => {
    setAnimating(!isAnimating);
  };

  const handleSave = () => {
    // Save is handled automatically through the context
    alert('Diagram saved successfully!');
  };

  // Check if we're trying to load a specific project but it's not found
  const isError = appError || renderError;
  const isProjectNotFound = projectId && !currentProject && !isRendering;
  
  console.log('CanvasPage render - isError:', isError);
  console.log('CanvasPage render - isProjectNotFound:', isProjectNotFound);
  console.log('CanvasPage render - isRendering:', isRendering);
  console.log('CanvasPage render - svg:', svg);
  console.log('CanvasPage render - conditions for DiagramViewer:', {
    svgExists: !!svg,
    isProjectNotFound,
    shouldShowDiagramViewer: svg && !isProjectNotFound
  });

  return (
    <div className="canvas-page">
      <Header 
        title={currentProject?.name || "Diagram"}
        showBack={true}
        onBack={handleBack}
      />
      
      <main className="canvas-content">
        {isProjectNotFound && (
          <div className="error-container">
            <div className="error">Project not found. It may have been deleted.</div>
            <button 
              className="touch-button secondary"
              onClick={() => navigate('/history')}
            >
              Back to History
            </button>
          </div>
        )}
        
        {(isRendering || !svg) && !isError && !isProjectNotFound && (
          <div className="loading-container">
            <div className="loading">Rendering diagram... (isRendering: {String(isRendering)}, svg: {String(!!svg)})</div>
          </div>
        )}
        
        {isError && !isProjectNotFound && (
          <div className="error-container">
            <div className="error">{isError}</div>
            <button 
              className="touch-button secondary"
              onClick={() => navigate('/history')}
            >
              Back to History
            </button>
          </div>
        )}
        
        {svg && !isProjectNotFound && (
          <DiagramViewer
            svgContent={svg}
            isAnimating={isAnimating}
          />
        )}
      </main>
      
      {!isProjectNotFound && (
        <CanvasControls
          isAnimating={isAnimating}
          onAnimate={handleAnimate}
          onSave={handleSave}
          svgContent={svg || ''}
        />
      )}
    </div>
  );
};

export default CanvasPage;