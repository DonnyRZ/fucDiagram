import React from 'react';
import { DiagramProject } from '../../types';
import { useNavigate } from 'react-router-dom';
import './RecentDiagrams.css';

interface RecentDiagramsProps {
  recentProjects: DiagramProject[];
  onDiagramSelect: (id: string) => void;
}

const RecentDiagrams: React.FC<RecentDiagramsProps> = ({ recentProjects, onDiagramSelect }) => {
  const navigate = useNavigate();
  
  const handleDiagramClick = (id: string) => {
    navigate(`/canvas/${id}`);
    onDiagramSelect(id);
  };

  if (recentProjects.length === 0) {
    return null;
  }

  return (
    <div className="recent-diagrams-section">
      <h3>Recent Diagrams</h3>
      <div className="recent-diagrams-list">
        {recentProjects.slice(0, 5).map((project) => (
          <div 
            key={project.id} 
            className="recent-diagram-item"
            onClick={() => handleDiagramClick(project.id)}
          >
            <div className="recent-diagram-name">{project.name}</div>
            <div className="recent-diagram-date">
              {new Date(project.lastOpened || project.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentDiagrams;