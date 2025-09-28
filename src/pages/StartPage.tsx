import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import Header from '../components/shared/Header';
import './StartPage.css';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const DEFAULT_MERMAID_TEMPLATE = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`;

const StartPage = () => {
  const navigate = useNavigate();
  const { createProject, projects } = useApp();
  const [diagramName, setDiagramName] = useState('My Diagram');

  const handleCreateNew = () => {
    // Create a new project and navigate to the editor
    try {
      const project = createProject(diagramName, DEFAULT_MERMAID_TEMPLATE);
      navigate(`/canvas/${project.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleOpenEditor = () => {
    // Navigate directly to the editor
    navigate('/editor');
  };

  return (
    <div className="start-page">
      <Header 
        title="Mermaid Diagram Editor" 
        showBack={projects.length > 0} 
        backPath="/history" 
      />
      
      <main className="start-content">
        <div className="welcome-section">
          <h2>Create a New Diagram</h2>
          <p>Start creating beautiful Mermaid diagrams with real-time preview</p>
          
          <div className="button-group">
            <Button variant="primary" onClick={handleCreateNew} className="btn">
              Create New Diagram
            </Button>
            <Button variant="secondary" onClick={handleOpenEditor} className="btn">
              Open Editor Directly
            </Button>
          </div>
          
          <div className="name-input-container">
            <Input
              label="Diagram Name"
              placeholder="Enter diagram name"
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StartPage;
