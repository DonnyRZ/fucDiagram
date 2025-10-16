import { useCallback, useEffect, useRef } from 'react';
import { Node, useReactFlow, useViewport, getConnectedEdges } from '@xyflow/react';

export const useCanvasInteractions = (nodes: Node[], selectedNodes: Node[]) => {
  const { fitView, zoomIn, zoomOut, setViewport } = useReactFlow();
  const { zoom } = useViewport();
  const lastWheelEventTime = useRef<number>(0);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Zoom in: Ctrl + Plus
      if (event.ctrlKey && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        zoomIn();
      }
      // Zoom out: Ctrl + Minus
      else if (event.ctrlKey && event.key === '-') {
        event.preventDefault();
        zoomOut();
      }
      // Zoom to 100%: Ctrl + 0
      else if (event.ctrlKey && event.key === '0') {
        event.preventDefault();
        setViewport({ x: 0, y: 0, zoom: 1 });
      }
      // Fit view: Ctrl + 1
      else if (event.ctrlKey && event.key === '1') {
        event.preventDefault();
        fitView({ duration: 500, padding: 0.4 });
      }
      // Select all: Ctrl + A
      else if (event.ctrlKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        // Note: This would require access to the nodes setter to select all
        // This is just a placeholder for the interaction pattern
      }
      // Delete selected: Delete or Backspace
      else if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodes.length > 0) {
        event.preventDefault();
        // Note: This would require access to node deletion logic
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, setViewport, fitView, selectedNodes]);

  // Enhanced wheel zoom with smooth animation
  const handleWheel = useCallback((e: WheelEvent) => {
    // Only zoom when Ctrl key is held
    if (e.ctrlKey) {
      e.preventDefault();
      
      // Limit zoom events to prevent excessive calls
      const now = Date.now();
      if (now - lastWheelEventTime.current < 50) {
        return;
      }
      lastWheelEventTime.current = now;
      
      if (e.deltaY < 0) {
        zoomIn({ duration: 80 });
      } else {
        zoomOut({ duration: 80 });
      }
    }
  }, [zoomIn, zoomOut]);

  // Register wheel event listener
  useEffect(() => {
    const canvas = document.querySelector('.react-flow');
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Add grid snap functionality
  const snapNodeToGrid = useCallback((node: Node, gridSize: number = 20): Node => {
    return {
      ...node,
      position: {
        x: Math.round(node.position.x / gridSize) * gridSize,
        y: Math.round(node.position.y / gridSize) * gridSize
      }
    };
  }, []);

  // Focus selected elements
  const focusSelected = useCallback(() => {
    if (selectedNodes.length > 0) {
      const connectedEdges = getConnectedEdges(selectedNodes, []);
      const nodesAndEdges = [...selectedNodes, ...connectedEdges];
      
      // Calculate bounding box of selected elements
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      nodesAndEdges.forEach(el => {
        if ('position' in el && 'width' in el && 'height' in el) {
          minX = Math.min(minX, el.position.x);
          minY = Math.min(minY, el.position.y);
          maxX = Math.max(maxX, el.position.x + (el.width || 100));
          maxY = Math.max(maxY, el.position.y + (el.height || 100));
        }
      });
      
      // Fit view to selected elements
      if (isFinite(minX) && isFinite(minY) && isFinite(maxX) && isFinite(maxY)) {
        const padding = 50;
        const width = maxX - minX + padding * 2;
        const height = maxY - minY + padding * 2;
        
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        
        // Calculate the zoom needed to fit the elements
        const containerWidth = window.innerWidth * 0.8;
        const containerHeight = window.innerHeight * 0.6;
        
        const zoomX = containerWidth / width;
        const zoomY = containerHeight / height;
        const newZoom = Math.min(zoomX, zoomY, 1.5); // Max zoom of 1.5 to prevent overscaling
        
        setViewport({
          x: (containerWidth / 2) - (centerX * newZoom),
          y: (containerHeight / 2) - (centerY * newZoom),
          zoom: newZoom,
        }, { duration: 500 });
      }
    }
  }, [selectedNodes, setViewport]);

  return {
    zoom,
    snapNodeToGrid,
    focusSelected,
    handleWheel
  };
};