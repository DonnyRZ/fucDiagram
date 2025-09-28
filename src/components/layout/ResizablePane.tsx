import React, { useState, useRef, useEffect } from 'react';
import './ResizablePane.css';

interface ResizablePaneProps {
  children: React.ReactNode[];
  initialSizes?: [number, number];
  minSizes?: [number, number];
  onResize?: (size: number) => void;
}

const ResizablePane: React.FC<ResizablePaneProps> = ({
  children,
  initialSizes = [40, 60],
  minSizes = [300, 400],
  onResize
}) => {
  const [leftSize, setLeftSize] = useState(initialSizes[0]);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ensure we have exactly 2 children
  const [leftChild, rightChild] = React.Children.toArray(children);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      
      // Calculate new left pane size as percentage
      const newLeftSize = (e.clientX - containerRect.left) / containerWidth * 100;
      
      // Apply min/max constraints
      const minSizePercent = (minSizes[0] / containerWidth) * 100;
      const maxSizePercent = 100 - (minSizes[1] / containerWidth) * 100;
      
      const clampedSize = Math.max(minSizePercent, Math.min(newLeftSize, maxSizePercent));
      setLeftSize(clampedSize);
      
      // Call the onResize callback if provided
      if (onResize) {
        onResize(clampedSize);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isResizing, minSizes, onResize]);

  return (
    <div className="resizable-container" ref={containerRef}>
      <div 
        className="pane editor-pane" 
        style={{ flex: `0 0 ${leftSize}%` }}
      >
        {leftChild}
      </div>
      
      <div 
        className="resizer" 
        onMouseDown={handleMouseDown}
        aria-label="Resize panes"
        role="separator"
      />
      
      <div 
        className="pane preview-pane" 
        style={{ flex: `0 0 ${100 - leftSize}%` }}
      >
        {rightChild}
      </div>
    </div>
  );
};

export default ResizablePane;