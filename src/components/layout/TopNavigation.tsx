import React from 'react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import './TopNavigation.css';

interface TopNavigationProps {
  onNewDiagram: () => void;
  onSaveDiagram: () => void;
  onShareDiagram: () => void;
  onToggleHistory: () => void;
  onToggleSidebar?: () => void;
  onToggleEditorMode?: () => void;
  isLoading?: boolean;
  hasUnsavedChanges?: boolean;
  editorMode?: 'mermaid' | 'flow';
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  onNewDiagram,
  onSaveDiagram,
  onShareDiagram,
  onToggleHistory,
  onToggleSidebar,
  onToggleEditorMode,
  hasUnsavedChanges,
  isLoading = false,
  editorMode = 'mermaid'
}) => {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Mermaid Editor</h1>
      </div>
      
      <div className="header-actions">
        <Button 
          variant="secondary" 
          onClick={onNewDiagram} 
          className="btn" 
          title="New Diagram"
          disabled={isLoading}
        >
          <Icon name="plus" size={18} />
          New
        </Button>
        
        <Button 
          variant="primary" 
          onClick={onSaveDiagram} 
          className={`btn ${hasUnsavedChanges ? 'btn-save-unsaved' : ''}`}
          title={hasUnsavedChanges ? "Save Diagram" : "No changes to save"}
          disabled={isLoading || !hasUnsavedChanges}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span> Saving...
            </>
          ) : hasUnsavedChanges ? (
            <>
              <Icon name="file" size={18} />
              Save*
            </>
          ) : (
            <>
              <Icon name="file" size={18} />
              Saved
            </>
          )}
        </Button>
        
        <Button 
          variant="secondary" 
          onClick={onShareDiagram} 
          className="btn" 
          title="Share Diagram"
          disabled={isLoading}
        >
          <Icon name="back" size={18} />
          Share
        </Button>
        
        <Button 
          variant="secondary" 
          onClick={onToggleHistory} 
          className="btn" 
          title="Toggle History"
          disabled={isLoading}
        >
          <Icon name="history" size={18} />
          History
        </Button>
        
        {onToggleSidebar && (
          <Button 
            variant="secondary" 
            onClick={onToggleSidebar} 
            className="btn" 
            title="Show Sidebar"
            disabled={isLoading}
          >
            <Icon name="menu" size={18} />
            Menu
          </Button>
        )}
        
        {onToggleEditorMode && (
          <Button 
            variant={editorMode === 'mermaid' ? "primary" : "secondary"} 
            onClick={onToggleEditorMode} 
            className="btn" 
            title={editorMode === 'mermaid' ? "Switch to Visual Editor" : "Switch to Mermaid Editor"}
            disabled={isLoading}
          >
            <Icon name={editorMode === 'mermaid' ? "edit" : "image"} size={18} />
            {editorMode === 'mermaid' ? "Visual Editor" : "Mermaid Editor"}
          </Button>
        )}
      </div>
    </header>
  );
};

export default TopNavigation;