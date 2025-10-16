import React from 'react';
import './MultiSelectionBox.css';

interface MultiSelectionBoxProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isVisible: boolean;
}

const MultiSelectionBox: React.FC<MultiSelectionBoxProps> = ({ 
  startX, 
  startY, 
  endX, 
  endY,
  isVisible
}) => {
  if (!isVisible) return null;
  
  // Calculate box dimensions
  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);
  
  return (
    <div 
      className="multi-selection-box"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
};

export default MultiSelectionBox;