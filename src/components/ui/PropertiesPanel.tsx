import React from 'react';
import { Node } from '@xyflow/react';
import './PropertiesPanel.css';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeChange: (node: Node) => void;
  onClose: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, onNodeChange, onClose }) => {
  if (!selectedNode) {
    return (
      <div className="properties-panel">
        <div className="properties-header">
          <h3>Properties</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="properties-content">
          <p>No element selected</p>
        </div>
      </div>
    );
  }

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedNode) {
      onNodeChange({
        ...selectedNode,
        data: {
          ...selectedNode.data,
          label: e.target.value
        }
      });
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedNode) {
      onNodeChange({
        ...selectedNode,
        type: e.target.value
      });
    }
  };

  return (
    <div className="properties-panel">
      <div className="properties-header">
        <h3>Properties</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      <div className="properties-content">
        <div className="property-group">
          <label>Label</label>
          <input
            type="text"
            value={selectedNode.data?.label || ''}
            onChange={handleLabelChange}
          />
        </div>
        
        <div className="property-group">
          <label>Node Type</label>
          <select
            value={selectedNode.type || 'default'}
            onChange={handleTypeChange}
          >
            <option value="start">Start Event</option>
            <option value="end">End Event</option>
            <option value="task">Task</option>
            <option value="gateway">Gateway</option>
            <option value="event">Event</option>
            <option value="default">Default</option>
          </select>
        </div>
        
        {/* Additional properties based on node type */}
        {selectedNode.type === 'task' && (
          <div className="property-group">
            <label>Task Type</label>
            <select>
              <option value="user">User Task</option>
              <option value="service">Service Task</option>
              <option value="script">Script Task</option>
              <option value="receive">Receive Task</option>
              <option value="send">Send Task</option>
            </select>
          </div>
        )}
        
        {selectedNode.type === 'gateway' && (
          <div className="property-group">
            <label>Gateway Type</label>
            <select>
              <option value="exclusive">Exclusive (XOR)</option>
              <option value="inclusive">Inclusive (OR)</option>
              <option value="parallel">Parallel (AND)</option>
            </select>
          </div>
        )}
        
        {selectedNode.type === 'event' && (
          <div className="property-group">
            <label>Event Type</label>
            <select>
              <option value="start">Start Event</option>
              <option value="intermediate">Intermediate Event</option>
              <option value="end">End Event</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;