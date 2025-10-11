import React from 'react';
import { useApp } from '../../hooks/useApp';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import ProjectList from '../features/project/ProjectList';
import '../../pages/Workspace.css';

interface WorkspaceHistoryViewProps {
  onOpenProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

const WorkspaceHistoryView: React.FC<WorkspaceHistoryViewProps> = ({
  onOpenProject,
  onDeleteProject
}) => {
  const { projects } = useApp();

  return (
    <div className="workspace-history-view">
      <div className="history-header">
        <h2>My Diagrams</h2>
      </div>
      <ProjectList
        projects={projects}
        onOpenProject={onOpenProject}
        onDeleteProject={onDeleteProject}
      />
    </div>
  );
};

export default WorkspaceHistoryView;