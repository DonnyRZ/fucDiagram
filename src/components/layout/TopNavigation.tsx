import React from 'react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import './TopNavigation.css';

interface TopNavigationProps {
  onNewDiagram: () => void;
  onSaveDiagram: () => void;
  onShareDiagram: () => void;
  onToggleHistory: () => void;
  isLoading?: boolean; // Add loading state prop
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  onNewDiagram,
  onSaveDiagram,
  onShareDiagram,
  onToggleHistory,
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
          className="btn" 
          title="Save Diagram"
          disabled={isLoading}
        >
          <Icon name="file" size={18} />
          {isLoading ? (
            <>
              <span className="loading-spinner"></span> Saving...
            </>
          ) : (
            'Save'
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
      </div>
    </header>
  );
};

export default TopNavigation;