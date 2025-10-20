import React from 'react';
import { useApp } from '../../hooks/useApp';
import { DiagramModel } from '../../types/diagramModel';
import InteractiveFlowEditor from '../diagram/InteractiveFlowEditor';
import '../../pages/Workspace.css';

interface WorkspaceFlowViewProps {
  model: DiagramModel;
  setModel: (model: DiagramModel) => void;
  engineMethods: any;
  code: string;
  editorMode: 'mermaid' | 'flow';
  setEditorMode: (mode: 'mermaid' | 'flow') => void;
}

const WorkspaceFlowView: React.FC<WorkspaceFlowViewProps> = ({
  model,
  setModel,
  engineMethods,
  code,
  editorMode,
  setEditorMode
}) => {
  const { currentProject } = useApp();

  return (
    <div className="workspace-editor-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div 
        className="flex-1 h-full w-full" 
        style={{ 
          minHeight: '500px', 
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 200px)'
        }}
      >
        <InteractiveFlowEditor 
          model={model}
          setModel={setModel}
          engineMethods={engineMethods}
        />
      </div>
    </div>
  );
};

export default WorkspaceFlowView;