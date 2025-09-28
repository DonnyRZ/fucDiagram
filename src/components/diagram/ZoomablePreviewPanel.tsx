import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnimationEngine } from '../../services/animationEngine';
import { MermaidRenderer } from '../../services/mermaidRenderer';
import './PreviewPanel.css';

interface ZoomablePreviewPanelProps {
  code: string; // Instead of svgContent, accept the mermaid code
  isAnimating: boolean;
  onToggleAnimation: () => void;
}

const ZoomablePreviewPanel: React.FC<ZoomablePreviewPanelProps> = ({
  code,
  isAnimating,
  onToggleAnimation
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let isMounted = true;
    
    const renderDiagram = async () => {
      if (!code || !containerRef.current) {
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = '<div class="preview-placeholder">Diagram will appear here</div>';
        }
        return;
      }
      
      try {
        // Show loading state
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = '<div class="preview-placeholder">Rendering diagram...</div>';
        }
        
        // Generate unique ID for this render (following mermaid-live-editor pattern)
        const renderId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Render diagram to get SVG string (following mermaid-live-editor pattern)
        const { svg } = await MermaidRenderer.render(renderId, code);
        
        // FOLLOW MERMAID-LIVE-EDITOR PATTERN EXACTLY:
        // Replace entire container content with rendered SVG
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
          
          // Query for the rendered element within the PERSISTENT container
          const renderedElement = containerRef.current.querySelector(`#${renderId}`);
          if (renderedElement) {
            // Apply initial styling for proper display
            (renderedElement as SVGElement).style.maxWidth = '100%';
            (renderedElement as SVGElement).style.height = 'auto';
            
            if (isAnimating) {
              AnimationEngine.injectAnimationStyles(containerRef.current);
              AnimationEngine.applyAnimation(renderedElement as SVGElement, 'flow');
            } else {
              AnimationEngine.removeAnimation(renderedElement as SVGElement);
            }
          }
        }
      } catch (error) {
        console.error('Error rendering diagram:', error);
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = `<div class="preview-placeholder">Error rendering diagram: ${(error as Error).message}</div>`;
        }
      }
    };
    
    renderDiagram();
    
    return () => {
      isMounted = false;
    };
  }, [code, isAnimating]);

  // Reset position and scale when SVG content changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [code]);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.2, 3)); // Max zoom 3x
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.2, 0.2)); // Min zoom 0.2x
  }, []);

  const handleFitToScreen = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const svgElement = container.querySelector('svg');
      
      if (svgElement) {
        const containerRect = container.getBoundingClientRect();
        const svgRect = svgElement.getBoundingClientRect();
        
        // Calculate scale to fit SVG in container with some padding
        const scaleX = (containerRect.width * 0.8) / svgRect.width;
        const scaleY = (containerRect.height * 0.7) / svgRect.height;  // Account for header/footer
        const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 1x
        
        setScale(newScale);
        setPosition({ x: 0, y: 0 }); // Reset position when fitting
      }
    }
  }, []);

  // Mouse drag functionality for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault(); // Prevent text selection
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Disable text selection while dragging
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Add wheel event for zooming with Ctrl
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        setScale(prevScale => {
          const newScale = prevScale * zoomFactor;
          return Math.max(0.2, Math.min(newScale, 3)); // Clamp between 0.2 and 3
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

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
            onClick={handleFitToScreen}
            title="Fit to Screen"
          >
            Fit
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleZoomIn}
            title="Zoom In"
          >
            +
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            -
          </button>
        </div>
      </div>
      
      <div 
        className="preview-content" 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          transformOrigin: 'center center'
        }}
      />
      
      <div className="preview-footer">
        <div className="preview-status">
          {code ? `Zoom: ${Math.round(scale * 100)}%` : 'Waiting for diagram'}
        </div>
      </div>
    </div>
  );
};

export default ZoomablePreviewPanel;