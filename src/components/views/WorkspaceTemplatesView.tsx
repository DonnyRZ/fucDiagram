import React from 'react';
import { useApp } from '../../hooks/useApp';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import '../../pages/Workspace.css';

interface WorkspaceTemplatesViewProps {
  onNewDiagram: () => void;
}

const WorkspaceTemplatesView: React.FC<WorkspaceTemplatesViewProps> = ({
  onNewDiagram
}) => {
  return (
    <div className="workspace-templates-view">
      <h2>Templates</h2>
      <div className="template-options">
        <button onClick={onNewDiagram} className="btn btn-primary">
          Create from Scratch
        </button>
        <p>More templates coming soon...</p>
      </div>
    </div>
  );
};

export default WorkspaceTemplatesView;