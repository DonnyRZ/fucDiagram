import React, { useState, useCallback } from 'react';
import { NodeProps, useStoreApi, useReactFlow, Node } from '@xyflow/react';
import './ResizableNode.css';

interface ResizableNodeData {
  label: string;
  [key: string]: any;
}

const ResizableNode: React.FC<NodeProps<{ label: string }>> = ({ 
  id, 
  data, 
  position,
  selected,
  width = 100,
  height = 50
}) => {
  const xPos = position.x;
  const yPos = position.y;
  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  
  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      // Adjust dimensions based on resize direction
      switch (direction) {
        case 'right':
          newWidth = Math.max(50, startWidth + dx);
          break;
        case 'left':
          newWidth = Math.max(50, startWidth - dx);
          break;
        case 'bottom':
          newHeight = Math.max(30, startHeight + dy);
          break;
        case 'top':
          newHeight = Math.max(30, startHeight - dy);
          break;
        case 'bottom-right':
          newWidth = Math.max(50, startWidth + dx);
          newHeight = Math.max(30, startHeight + dy);
          break;
        case 'bottom-left':
          newWidth = Math.max(50, startWidth - dx);
          newHeight = Math.max(30, startHeight + dy);
          break;
        case 'top-right':
          newWidth = Math.max(50, startWidth + dx);
          newHeight = Math.max(30, startHeight - dy);
          break;
        case 'top-left':
          newWidth = Math.max(50, startWidth - dx);
          newHeight = Math.max(30, startHeight - dy);
          break;
      }
      
      // Update node dimensions
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              width: newWidth,
              height: newHeight
            };
          }
          return node;
        })
      );
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [id, setNodes, width, height]);
  
  // Handle rotation start
  const handleRotateStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRotating(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const nodeCenterX = xPos + width / 2;
    const nodeCenterY = yPos + height / 2;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - nodeCenterX;
      const dy = moveEvent.clientY - nodeCenterY;
      
      // Calculate rotation angle in degrees
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      // Update node rotation
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                rotation: angle
              }
            };
          }
          return node;
        })
      );
    };
    
    const handleMouseUp = () => {
      setIsRotating(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [id, setNodes, xPos, yPos, width, height]);
  
  // Apply rotation transformation
  const rotationStyle = data.rotation ? {
    transform: `rotate(${data.rotation}deg)`,
    transformOrigin: 'center center'
  } : {};
  
  return (
    <div 
      className={`resizable-node ${selected ? 'selected' : ''} ${isResizing ? 'resizing' : ''} ${isRotating ? 'rotating' : ''}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        ...rotationStyle
      }}
    >
      {/* Node content */}
      <div className="node-content">
        {data.label || 'Node'}
      </div>
      
      {/* Resize handles - only show when selected */}
      {selected && (
        <>
          <div 
            className="resize-handle resize-n" 
            onMouseDown={(e) => handleResizeStart(e, 'top')}
          />
          <div 
            className="resize-handle resize-e" 
            onMouseDown={(e) => handleResizeStart(e, 'right')}
          />
          <div 
            className="resize-handle resize-s" 
            onMouseDown={(e) => handleResizeStart(e, 'bottom')}
          />
          <div 
            className="resize-handle resize-w" 
            onMouseDown={(e) => handleResizeStart(e, 'left')}
          />
          <div 
            className="resize-handle resize-ne" 
            onMouseDown={(e) => handleResizeStart(e, 'top-right')}
          />
          <div 
            className="resize-handle resize-se" 
            onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
          />
          <div 
            className="resize-handle resize-sw" 
            onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
          />
          <div 
            className="resize-handle resize-nw" 
            onMouseDown={(e) => handleResizeStart(e, 'top-left')}
          />
          
          {/* Rotation handle */}
          <div 
            className="rotate-handle" 
            onMouseDown={handleRotateStart}
          >
            ↻
          </div>
        </>
      )}
    </div>
  );
};

export default ResizableNode;