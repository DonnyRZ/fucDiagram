import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { useNavigation } from '../../context/NavigationContext';
import { useMermaidRenderer } from '../../hooks/useMermaidRenderer';
import { useToast } from '../../context/ToastContext';
import { useAutoSave } from '../../hooks/useAutoSave';
import { Tab } from '../../types';
import { DiagramModel } from '../../types/diagramModel';
import { UnifiedMermaidConverter } from '../../services/UnifiedMermaidConverter';
import AdvancedResizablePane from '../layout/AdvancedResizablePane';
import EnhancedEditorPanel from '../editor/EnhancedEditorPanel';
import ConfigPanel from '../editor/ConfigPanel';
import ZoomablePreviewPanel from '../diagram/ZoomablePreviewPanel';
import '../../pages/Workspace.css';

interface WorkspaceEditorViewProps {
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  model: DiagramModel;
  setModel: (model: DiagramModel) => void;
  engineMethods: any;
  activeTab: 'code' | 'config';
  setActiveTab: React.Dispatch<React.SetStateAction<'code' | 'config'>>;
  editorMode: 'mermaid' | 'flow';
  setEditorMode: (mode: 'mermaid' | 'flow') => void;
  setCurrentView: (view: 'editor' | 'history' | 'templates' | 'settings') => void;
}

const WorkspaceEditorView: React.FC<WorkspaceEditorViewProps> = ({
  code,
  setCode,
  model,
  setModel,
  engineMethods,
  activeTab,
  setActiveTab,
  editorMode,
  setEditorMode,
  setCurrentView
}) => {
  const navigate = useNavigate();
  const { 
    currentProject, 
    updateProject, 
    editorPaneSize,
    setEditorPaneSize,
    showHistory,
    setShowHistory,
    isAnimating,
    toggleAnimation,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    recentProjects
  } = useApp();
  const { addToOpen, removeFromOpen } = useNavigation();
  const { isRendering } = useMermaidRenderer();
  const { showToast } = useToast();
  
  const [mermaidConfig, setMermaidConfig] = useState<any>({});

  const editorTabs: Tab[] = [
    {
      id: 'code',
      title: 'Code'
    },
    {
      id: 'config',
      title: 'Config'
    }
  ];

  // Bidirectional: When code changes, update the model
  const handleCodeChange = React.useCallback((newCode: string) => {
    setCode(newCode);

    (async () => {
      try {
        const newModel = await UnifiedMermaidConverter.mermaidToModel(newCode);
        setModel(newModel);
      } catch (error) {
        console.error('Error converting code to model:', error);
      }
    })();

    const hasChanges = newCode.trim() !== (currentProject?.mermaidCode || '').trim();
    setHasUnsavedChanges(hasChanges);
  }, [currentProject?.mermaidCode, setModel, setHasUnsavedChanges]);

  // Bidirectional: When model changes, update the code ONLY when necessary
  // useEffect(() => {
  //   const updatedCode = UnifiedMermaidConverter.modelToMermaid(model);
  //   setCode(updatedCode);
  // }, [model, setCode]);

  const handleConfigChange = React.useCallback((newConfig: any) => {
    setMermaidConfig(newConfig);
  }, []);

  const handleTabChange = React.useCallback((tabId: 'code' | 'config') => {
    setActiveTab(tabId);
  }, []);

  const handleToggleAnimation = React.useCallback(() => {
    toggleAnimation();
  }, [toggleAnimation]);

  const handleOpenProject = React.useCallback((id: string) => {
    navigate(`/canvas/${id}`);
  }, [navigate]);

  // Auto-save functionality
  useAutoSave(
    code,
    React.useCallback((content: string) => {
      if (currentProject && hasUnsavedChanges) {
        updateProject({
          ...currentProject,
          mermaidCode: content,
          updatedAt: new Date()
        });
        setHasUnsavedChanges(false);
        showToast('Diagram auto-saved', 'info');
      }
    }, [currentProject, hasUnsavedChanges, updateProject, setHasUnsavedChanges, showToast]),
    30000
  );

  return (
    <div className="workspace-editor-container">
      <AdvancedResizablePane 
        initialSizes={[30, 50, 20]}
        showHistory={showHistory}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={editorTabs}
        onResize={setEditorPaneSize}
        editorContent={
          activeTab === 'code' ? (
            <EnhancedEditorPanel
              code={code}
              config={mermaidConfig}
              onCodeChange={handleCodeChange}
              onConfigChange={handleConfigChange}
              isRendering={isRendering}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          ) : (
            <ConfigPanel
              config={mermaidConfig}
              onChange={handleConfigChange}
            />
          )
        }
        previewContent={
          <ZoomablePreviewPanel 
            code={code}
            isAnimating={isAnimating}
            onToggleAnimation={handleToggleAnimation}
          />
        }
        historyContent={
          <div className="history-panel">
            <div className="history-panel-header">
              <h3>Recent Diagrams</h3>
            </div>
            <div className="recent-list">
              {recentProjects.slice(0, 10).map(project => (
                <div 
                  key={project.id} 
                  className="recent-item"
                  onClick={() => handleOpenProject(project.id)}
                >
                  <div className="recent-item-name">{project.name}</div>
                  <div className="recent-item-date">
                    {new Date(project.lastOpened || project.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="history-panel-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setCurrentView('history');
                }}
              >
                View All Diagrams
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default WorkspaceEditorView;
