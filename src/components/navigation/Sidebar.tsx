import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { DiagramProject } from '../../types';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'history' | 'templates' | 'settings';
  onTabChange: (tab: 'history' | 'templates' | 'settings') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const { projects, deleteProject } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const handleProjectClick = (id: string) => {
    navigate(`/canvas/${id}`);
    onClose();
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this diagram?')) {
      deleteProject(id);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

    // Sample templates - in a real implementation these would come from a template service
  const templates = [
    { id: 'flowchart', name: 'Flowchart', code: 'graph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action]\n    B -->|No| D[End]' },
    { id: 'sequence', name: 'Sequence', code: 'sequenceDiagram\n    Alice->>Bob: Hello Bob, how are you?\n    Bob-->>Alice: I am good thanks!' },
    { id: 'gantt', name: 'Gantt', code: 'gantt\n    title A Gantt Diagram\n    dateFormat  YYYY-MM-DD\n    section Section\n    A task           :a1, 2014-01-01, 30d\n    Another task     :after a1, 20d' },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h3>
          {activeTab === 'history' && 'History'}
          {activeTab === 'templates' && 'Templates'}
          {activeTab === 'settings' && 'Settings'}
        </h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="sidebar-tabs">
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => onTabChange('history')}
        >
          History
        </button>
        <button 
          className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => onTabChange('templates')}
        >
          Templates
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onTabChange('settings')}
        >
          Settings
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'history' && (
          <div className="history-content">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search diagrams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="projects-list">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project: DiagramProject) => (
                  <div 
                    key={project.id} 
                    className="project-item"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="project-info">
                      <div className="project-name">{project.name}</div>
                      <div className="project-date">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      aria-label={`Delete ${project.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  {searchQuery ? 'No matching diagrams found' : 'No diagrams yet'}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="templates-content">
            <div className="templates-list">
              {templates.map(template => (
                <div 
                  key={template.id} 
                  className="template-item"
                  onClick={() => {
                    // In a real implementation, this would create a new diagram from template
                    console.log('Create diagram from template:', template.name);
                  }}
                >
                  <div className="template-name">{template.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-content">
            <div className="setting-item">
              <label>Theme</label>
              <select>
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Auto-save</label>
              <input type="checkbox" defaultChecked />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;