import React from 'react';
import { useApp } from '../../hooks/useApp';
import InteractiveFlowEditor from '../diagram/InteractiveFlowEditor';
import '../../pages/Workspace.css';

interface WorkspaceFlowViewProps {
  code: string;
  editorMode: 'mermaid' | 'flow';
  setEditorMode: React.Dispatch<React.SetStateAction<'mermaid' | 'flow'>>;
}

const WorkspaceFlowView: React.FC<WorkspaceFlowViewProps> = ({
  code,
  editorMode,
  setEditorMode
}) => {
  const { currentProject } = useApp();
  return (
    <div className="workspace-editor-container">
      {/* Show Interactive Flow Editor - full height container */}
      <div className="h-full flex flex-col">
        <div 
          className="flow-editor-header" 
          style={{
            padding: 'var(--spacing-md) var(--spacing-lg)',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            fontSize: 'var(--font-size-base)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow)',
          }}
        >
          <h2 
            style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
            }}
          >
            <span 
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                boxShadow: '0 0 8px var(--color-primary-light)',
              }}
            ></span>
            Interactive Flow Editor
          </h2>
          <button 
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius-sm)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: 'var(--shadow)',
            }}
            onClick={() => setEditorMode('mermaid')}
          >
            Switch to Mermaid Editor
          </button>
        </div>
        <div className="flex-1 h-full w-full" style={{ minHeight: '500px' }}>
          <InteractiveFlowEditor 
            initialCode={code}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkspaceFlowView;