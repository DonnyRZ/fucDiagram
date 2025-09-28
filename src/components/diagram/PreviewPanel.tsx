import React, { useEffect, useRef } from 'react';
import { AnimationEngine } from '../../services/animationEngine';
import { sanitizeSvg } from '../../utils/sanitize';
import './PreviewPanel.css';

interface PreviewPanelProps {
  svgContent: string;
  isAnimating: boolean;
  onToggleAnimation: () => void;
  onFitToScreen: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  svgContent,
  isAnimating,
  onToggleAnimation,
  onFitToScreen,
  onZoomIn,
  onZoomOut
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && svgContent) {
      // Clear previous content
      containerRef.current.innerHTML = sanitizeSvg(svgContent);
      
      // Get the SVG element
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        if (isAnimating) {
          AnimationEngine.injectAnimationStyles(containerRef.current);
          AnimationEngine.applyAnimation(svgElement, 'flow');
        } else {
          AnimationEngine.removeAnimation(svgElement);
        }
      }
    }
  }, [svgContent, isAnimating]);

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <h2>Diagram Preview</h2>
        <div className="preview-controls">
          <button 
            className="btn btn-secondary" 
            onClick={onToggleAnimation}
            title="Toggle Animation"
          >
            {isAnimating ? 'Stop' : 'Play'} Animation
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={onFitToScreen}
            title="Fit to Screen"
          >
            Fit
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={onZoomIn}
            title="Zoom In"
          >
            +
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={onZoomOut}
            title="Zoom Out"
          >
            -
          </button>
        </div>
      </div>
      
      <div className="preview-content" ref={containerRef}>
        {svgContent ? null : (
          <div className="preview-placeholder">
            Diagram will appear here
          </div>
        )}
      </div>
      
      <div className="preview-footer">
        <div className="preview-status">
          {svgContent ? 'Diagram loaded' : 'Waiting for diagram'}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;