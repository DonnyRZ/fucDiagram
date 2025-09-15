import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { AnimationEngine } from '../services/animationEngine';
import './DiagramViewer.css';
import { sanitizeSvg } from '../utils/sanitize';

interface DiagramViewerProps {
  svgContent: string;
  isAnimating: boolean;
  zoom?: number;
  onZoomChange?: (z: number) => void;
}

export interface DiagramViewerHandle {
  fitToWidth: () => void;
  fitToHeight: () => void;
  resetPan: () => void;
}

const DiagramViewer = forwardRef<DiagramViewerHandle, DiagramViewerProps>(({ svgContent, isAnimating, zoom = 1, onZoomChange }, ref) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('DiagramViewer - svgContent:', svgContent);
      console.log('DiagramViewer - isAnimating:', isAnimating);
      console.log('DiagramViewer - viewerRef.current:', viewerRef.current);
    }
    
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

  // Pointer-based panning
  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      // Only left mouse or touch/pen
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      if (zoom <= 1) return; // pan only when zoomed in
      isPanningRef.current = true;
      panStartRef.current = { ...pan };
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
      el.classList.add('panning');
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPanningRef.current || !panStartRef.current || !pointerStartRef.current) return;
      const dx = e.clientX - pointerStartRef.current.x;
      const dy = e.clientY - pointerStartRef.current.y;
      setPan({ x: panStartRef.current.x + dx, y: panStartRef.current.y + dy });
    };

    const endPan = (e: PointerEvent) => {
      if (!isPanningRef.current) return;
      isPanningRef.current = false;
      panStartRef.current = null;
      pointerStartRef.current = null;
      try { el.releasePointerCapture(e.pointerId); } catch (_) {}
      el.classList.remove('panning');
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', endPan);
    el.addEventListener('pointercancel', endPan);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', endPan);
      el.removeEventListener('pointercancel', endPan);
    };
  }, [zoom, pan]);

  // Expose fit methods to parent
  useImperativeHandle(ref, () => ({
    fitToWidth: () => {
      const dims = getDims();
      if (!dims) return;
      const { availWidth, contentWidth, availHeight, contentHeight } = dims;
      if (contentWidth <= 0 || contentHeight <= 0) return;
      const scale = clamp(availWidth / contentWidth, 0.2, 3);
      // Center vertically if content smaller than height
      const centeredPan = centerFor(scale, availWidth, availHeight, contentWidth, contentHeight);
      setPan(centeredPan);
      onZoomChange?.(scale);
    },
    fitToHeight: () => {
      const dims = getDims();
      if (!dims) return;
      const { availWidth, contentWidth, availHeight, contentHeight } = dims;
      if (contentWidth <= 0 || contentHeight <= 0) return;
      const scale = clamp(availHeight / contentHeight, 0.2, 3);
      const centeredPan = centerFor(scale, availWidth, availHeight, contentWidth, contentHeight);
      setPan(centeredPan);
      onZoomChange?.(scale);
    },
    resetPan: () => setPan({ x: 0, y: 0 })
  }));

  const centerFor = (scale: number, availW: number, availH: number, contentW: number, contentH: number) => {
    const dx = (availW - contentW * scale) / 2;
    const dy = (availH - contentH * scale) / 2;
    return { x: dx, y: dy };
  };

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const getDims = () => {
    const wrapper = viewerRef.current;
    if (!wrapper) return null;
    const svg = wrapper.querySelector('svg');
    if (!svg) return null;
    const rect = wrapper.getBoundingClientRect();
    const style = window.getComputedStyle(wrapper);
    const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const availWidth = rect.width - paddingX;
    const availHeight = rect.height - paddingY;
    let contentWidth = 0;
    let contentHeight = 0;
    const vb = (svg as any).viewBox?.baseVal;
    if (vb && vb.width && vb.height) {
      contentWidth = vb.width;
      contentHeight = vb.height;
    } else {
      const bb = (svg as SVGGraphicsElement).getBBox?.();
      if (bb) { contentWidth = bb.width; contentHeight = bb.height; }
      else {
        const br = svg.getBoundingClientRect();
        contentWidth = br.width / zoom;
        contentHeight = br.height / zoom;
      }
    }
    return { availWidth, availHeight, contentWidth, contentHeight };
  };

  return (
    <div 
      ref={viewerRef}
      className={`diagram-viewer ${isAnimating ? 'animated' : ''}`}
    >
      <div 
        className="diagram-container"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'top left' }}
        dangerouslySetInnerHTML={{ __html: sanitizeSvg(svgContent) }}
      />
    </div>
  );
});

export default DiagramViewer;
