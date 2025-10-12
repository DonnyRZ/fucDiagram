import React from 'react';
import { useApp } from '../../hooks/useApp';
import InteractiveFlowEditor from '../diagram/InteractiveFlowEditor';
import '../../pages/Workspace.css';

interface WorkspaceFlowViewProps {
  code: string;
  editorMode: 'mermaid' | 'flow';
  setEditorMode: (mode: 'mermaid' | 'flow') => void;
}

const WorkspaceFlowView: React.FC<WorkspaceFlowViewProps> = ({
  code,
  editorMode,
  setEditorMode
}) => {
  const { currentProject } = useApp();

  return (
    <div className="workspace-editor-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Show Interactive Flow Editor - full height container */}
      <div 
        className="flex-1 h-full w-full" 
        style={{ 
          minHeight: '500px', 
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 200px)' // Adjust based on header heights
        }}
      >
        <InteractiveFlowEditor 
          initialCode={code}
        />
      </div>
    </div>
  );
};

export default WorkspaceFlowView;