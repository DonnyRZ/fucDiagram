import ProjectCard from './ProjectCard';
import './ProjectList.css';

interface ProjectListProps {
  projects: any[];
  onOpenProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

const ProjectList = ({ projects, onOpenProject, onDeleteProject }: ProjectListProps) => {
  return (
    <div className="project-list">
      <div className="projects-container">
        {projects
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={() => onOpenProject(project.id)}
              onDelete={() => onDeleteProject(project.id)}
            />
          ))}
      </div>
    </div>
  );
};

export default ProjectList;