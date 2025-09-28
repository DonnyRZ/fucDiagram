import React from 'react';
import { DiagramProject } from '../../types';
import { useNavigation } from '../../context/NavigationContext';
import { useApp } from '../../hooks/useApp';
import './TabPanel.css';

interface TabPanelProps {
  onTabClose?: (id: string) => void;
}

const TabPanel: React.FC<TabPanelProps> = ({ onTabClose }) => {
  const { openDiagrams, activeDiagramId, setActiveDiagram, removeFromOpen } = useNavigation();
  const { hasUnsavedChanges, setHasUnsavedChanges } = useApp();

  const handleTabClick = (id: string) => {
    setActiveDiagram(id);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromOpen(id);
    if (onTabClose) {
      onTabClose(id);
    }
    
    // If we're closing the active diagram, switch to another one
    if (activeDiagramId === id) {
      const index = openDiagrams.findIndex(d => d.id === id);
      if (index > 0) {
        setActiveDiagram(openDiagrams[index - 1].id);
      } else if (openDiagrams.length > 1) {
        setActiveDiagram(openDiagrams[1].id);
      } else {
        setActiveDiagram(null);
      }
    }
  };

  if (openDiagrams.length === 0) {
    return null;
  }

  return (
    <div className="tab-panel">
      <div className="tab-list">
        {openDiagrams.map((diagram) => {
          const isActive = activeDiagramId === diagram.id;
          const isUnsaved = hasUnsavedChanges && isActive; // Simplified - in reality we'd need to track per-diagram changes

          return (
            <div
              key={diagram.id}
              className={`tab-item ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(diagram.id)}
            >
              <span className="tab-title">{diagram.name}</span>
              {isUnsaved && <span className="tab-unsaved">*</span>}
              <button 
                className="tab-close" 
                onClick={(e) => handleCloseTab(diagram.id, e)}
                aria-label={`Close ${diagram.name}`}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TabPanel;