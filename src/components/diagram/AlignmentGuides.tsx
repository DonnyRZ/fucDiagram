import React from 'react';
import './AlignmentGuides.css';

interface AlignmentGuide {
  id: string;
  type: 'vertical' | 'horizontal';
  position: number;
  nodes: string[];
}

interface AlignmentGuidesProps {
  guides: AlignmentGuide[];
  canvasWidth: number;
  canvasHeight: number;
}

const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({ 
  guides, 
  canvasWidth, 
  canvasHeight 
}) => {
  return (
    <div className="alignment-guides-container">
      {guides.map(guide => {
        if (guide.type === 'vertical') {
          return (
            <div
              key={guide.id}
              className="alignment-guide vertical"
              style={{
                left: `${guide.position}px`,
                height: `${canvasHeight}px`,
              }}
            />
          );
        } else {
          return (
            <div
              key={guide.id}
              className="alignment-guide horizontal"
              style={{
                top: `${guide.position}px`,
                width: `${canvasWidth}px`,
              }}
            />
          );
        }
      })}
    </div>
  );
};

export default AlignmentGuides;