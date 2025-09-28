import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Tab } from '../../types';
import './AdvancedResizablePane.css';

interface AdvancedResizablePaneProps {
  editorContent: React.ReactNode; // Content for editor/config tab
  previewContent: React.ReactNode; // Preview content
  historyContent?: React.ReactNode; // History content (optional)
  initialSizes?: [number, number, number?];
  showHistory?: boolean;
  activeTab: 'code' | 'config';
  onTabChange: (tab: 'code' | 'config') => void;
  tabs: Tab[];
  onResize?: (size: number) => void;
}

const AdvancedResizablePane: React.FC<AdvancedResizablePaneProps> = ({
  editorContent,
  previewContent,
  historyContent,
  initialSizes = [30, 50, 20],
  showHistory = false,
  activeTab,
  onTabChange,
  tabs,
  onResize
}) => {
  return (
    <PanelGroup 
      direction="horizontal" 
      className="advanced-resizable-container"
      onLayout={(sizes) => {
        if (onResize && sizes[0]) {
          onResize(sizes[0]);
        }
      }}
    >
      <Panel 
        defaultSize={initialSizes[0]} 
        minSize={20} 
        className="pane editor-config-pane"
      >
        <div className="tab-container">
          <div className="tab-header">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => onTabChange(tab.id as 'code' | 'config')}
              >
                {tab.title}
              </button>
            ))}
          </div>
          <div className="tab-content">
            {editorContent}
          </div>
        </div>
      </Panel>
      
      <PanelResizeHandle 
        className="resizer" 
        aria-label="Resize panes"
      />
      
      <Panel 
        defaultSize={initialSizes[1]} 
        minSize={20} 
        className="pane preview-pane"
      >
        {previewContent}
      </Panel>
      
      {showHistory && historyContent && (
        <>
          <PanelResizeHandle 
            className="resizer" 
            aria-label="Resize history pane"
          />
          <Panel 
            defaultSize={initialSizes[2]} 
            minSize={15} 
            className="pane history-pane"
          >
            {historyContent}
          </Panel>
        </>
      )}
    </PanelGroup>
  );
};

export default AdvancedResizablePane;