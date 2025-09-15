import './ProjectCard.css';
import { DiagramProject } from '../types';
import { Icon } from './ui/Icon';

interface ProjectCardProps {
  project: DiagramProject;
  onOpen: () => void;
  onDelete: () => void;
}

const ProjectCard = ({ project, onOpen, onDelete }: ProjectCardProps) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="project-card">
      <div className="project-info" onClick={onOpen}>
        <h3 className="project-name">{project.name}</h3>
        <p className="project-date">
          Modified: {formatDate(project.updatedAt)}
        </p>
        <p className="project-date">
          Created: {formatDate(project.createdAt)}
        </p>
      </div>
      
      <div className="project-actions">
        <button
          className="touch-target delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${project.name}`}
          title="Delete"
        >
          <Icon name="trash" />
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
