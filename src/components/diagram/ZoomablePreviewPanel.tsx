import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnimationEngine } from '../../services/animationEngine';
import { MermaidRenderer } from '../../services/mermaidRenderer';
import './ZoomablePreviewPanel.css';

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
  const svgCacheRef = useRef<Record<string, string>>({});
  const [cachedRenderId, setCachedRenderId] = useState<string | null>(null);
  const [cachedSvg, setCachedSvg] = useState<string | null>(null);

  useEffect(() => {
    // Initialize cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
    
    let isMounted = true;
    
    const renderDiagram = async () => {
      if (!code || !containerRef.current) {
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = '<div class="preview-placeholder">Diagram will appear here</div>';
        }
        return;
      }
      
      try {
        // Check if we have a cached version of this SVG
        const svgCacheKey = `${code}-${isAnimating}`;
        const cachedSvg = svgCacheRef.current[svgCacheKey];
        
        if (cachedSvg && containerRef.current) {
          // Use cached SVG if available
          const parser = new DOMParser();
          const doc = parser.parseFromString(cachedSvg, 'image/svg+xml');
          const svgElement = doc.querySelector('svg');
          
          if (svgElement) {
            // Clear container
            containerRef.current.innerHTML = '';
            
            // Append the parsed SVG element
            containerRef.current.appendChild(svgElement);
            
            // Apply styling and transform
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.position = 'relative';
            svgElement.style.zIndex = '1';
            svgElement.style.transformOrigin = 'center center';
            svgElement.style.cursor = 'grab';
            svgElement.style.transform = `scale(${scale}) translate(${position.x}px, ${position.y}px)`;
            svgElement.style.transformOrigin = 'center center';
            
            // Apply animation if needed
            if (isAnimating) {
              AnimationEngine.injectAnimationStyles(containerRef.current);
              AnimationEngine.applyAnimation(svgElement, 'flow');
            } else {
              AnimationEngine.removeAnimation(svgElement);
            }
            return;
          }
        }
        
        // Show loading state
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = '<div class="preview-placeholder">Rendering diagram...</div>';
        }
        
        // Generate unique ID for this render (following mermaid-live-editor pattern)
        const renderId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Render diagram to get SVG string (following mermaid-live-editor pattern)
        const { svg } = await MermaidRenderer.render(renderId, code);
        
        // Safely parse and insert the SVG content
        if (isMounted && containerRef.current) {
          // Parse the SVG string safely
          const parser = new DOMParser();
          const doc = parser.parseFromString(svg, 'image/svg+xml');
          const svgElement = doc.querySelector('svg');
          
          if (svgElement) {
            // Clear container
            containerRef.current.innerHTML = '';
            
            // Append the parsed SVG element
            containerRef.current.appendChild(svgElement);
            
            // Apply initial styling for proper display
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.position = 'relative'; // Ensure proper stacking
            svgElement.style.zIndex = '1'; // Keep SVG below header/footer
            svgElement.style.transformOrigin = 'center center';
            svgElement.style.cursor = 'grab';
            
            // Apply initial transform
            svgElement.style.transform = `scale(${scale}) translate(${position.x}px, ${position.y}px)`;
            svgElement.style.transformOrigin = 'center center';
            
            if (isAnimating) {
              AnimationEngine.injectAnimationStyles(containerRef.current);
              AnimationEngine.applyAnimation(svgElement, 'flow');
            } else {
              AnimationEngine.removeAnimation(svgElement);
            }
            
            // Cache the SVG for faster re-rendering with same code
            svgCacheRef.current[svgCacheKey] = svg;
          } else {
            // If parsing failed, display an error
            containerRef.current.innerHTML = '<div class="preview-placeholder">Error parsing diagram SVG</div>';
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
    
    // Also update the SVG transform immediately
    if (containerRef.current) {
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        (svgElement as SVGElement).style.transform = 'scale(1) translate(0px, 0px)';
        (svgElement as SVGElement).style.transformOrigin = 'center center';
      }
    }
  }, [code]);

  // Apply zoom transform directly to the SVG element when scale or position changes
  useEffect(() => {
    if (containerRef.current) {
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        // Apply transform only to the SVG, not the entire container
        (svgElement as SVGElement).style.transform = `scale(${scale}) translate(${position.x}px, ${position.y}px)`;
        (svgElement as SVGElement).style.transformOrigin = 'center center';
      }
    }
  }, [scale, position]);

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
    
    // Update cursor on the container
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
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
    
    // Reset cursor on the container
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Disable text selection while dragging
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      // Reset cursor on cleanup
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
      }
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
      
      <div className="preview-content-wrapper">
        <div 
          className="preview-content" 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onKeyDown={(e) => {
            // Add keyboard controls for zooming and panning
            switch(e.key) {
              case '+':
              case '=':
                handleZoomIn();
                e.preventDefault();
                break;
              case '-':
                handleZoomOut();
                e.preventDefault();
                break;
              case '0':
                handleFitToScreen();
                e.preventDefault();
                break;
              case 'ArrowLeft':
                setPosition(prev => ({...prev, x: prev.x - 20}));
                e.preventDefault();
                break;
              case 'ArrowRight':
                setPosition(prev => ({...prev, x: prev.x + 20}));
                e.preventDefault();
                break;
              case 'ArrowUp':
                setPosition(prev => ({...prev, y: prev.y - 20}));
                e.preventDefault();
                break;
              case 'ArrowDown':
                setPosition(prev => ({...prev, y: prev.y + 20}));
                e.preventDefault();
                break;
            }
          }}
          tabIndex={0}
          role="img"
          aria-label="Diagram preview"
          aria-describedby="diagram-description"
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        />
        <div id="diagram-description" className="sr-only">Interactive diagram preview. Use arrow keys to pan, +/- to zoom, and 0 to fit.</div>
      </div>
      
      <div className="preview-footer">
        <div className="preview-status">
          {code ? `Zoom: ${Math.round(scale * 100)}%` : 'Waiting for diagram'}
        </div>
      </div>
    </div>
  );
};

export default ZoomablePreviewPanel;