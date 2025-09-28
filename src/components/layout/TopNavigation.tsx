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
  isLoading?: boolean; // Add loading state prop
  hasUnsavedChanges?: boolean;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  onNewDiagram,
  onSaveDiagram,
  onShareDiagram,
  onToggleHistory,
  onToggleSidebar,
  hasUnsavedChanges,
  isLoading = false
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
          variant="secondary" 
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
      </div>
    </header>
  );
};

export default TopNavigation;