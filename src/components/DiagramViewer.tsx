import { useEffect, useRef } from 'react';
import { AnimationEngine } from '../services/animationEngine';
import './DiagramViewer.css';
import { sanitizeSvg } from '../utils/sanitize';

interface DiagramViewerProps {
  svgContent: string;
  isAnimating: boolean;
}

const DiagramViewer = ({ svgContent, isAnimating }: DiagramViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('DiagramViewer - svgContent:', svgContent);
    console.log('DiagramViewer - isAnimating:', isAnimating);
    console.log('DiagramViewer - viewerRef.current:', viewerRef.current);
    
    if (viewerRef.current) {
      if (isAnimating) {
        AnimationEngine.injectAnimationStyles(viewerRef.current);
        
        // Apply animation to SVG elements
        const svgElement = viewerRef.current.querySelector('svg');
        if (svgElement) {
          AnimationEngine.applyAnimation(svgElement as SVGElement, 'flow');
        }
      } else {
        // Remove animation from SVG elements
        const svgElement = viewerRef.current.querySelector('svg');
        if (svgElement) {
          AnimationEngine.removeAnimation(svgElement as SVGElement);
        }
      }
    }
  }, [isAnimating, svgContent]);

  return (
    <div 
      ref={viewerRef}
      className={`diagram-viewer ${isAnimating ? 'animated' : ''}`}
    >
      <div 
        className="diagram-container"
        dangerouslySetInnerHTML={{ __html: sanitizeSvg(svgContent) }}
      />
    </div>
  );
};

export default DiagramViewer;
