import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import Header from './Header';
import MermaidEditor from './MermaidEditor';
import './StartPage.css';
import { Input } from './ui/Input';

const DEFAULT_MERMAID_TEMPLATE = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`;

const StartPage = () => {
  const navigate = useNavigate();
  const { createProject } = useApp();
  const [diagramName, setDiagramName] = useState('My Diagram');

  const handleSave = (code: string) => {
    try {
      const project = createProject(diagramName, code);
      navigate(`/canvas/${project.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="start-page">
      <Header title="Create New Diagram" />
      
      <main className="start-content">
        <div className="name-input-container">
          <Input
            label="Diagram Name"
            placeholder="Enter diagram name"
            value={diagramName}
            onChange={(e) => setDiagramName(e.target.value)}
          />
        </div>
        
        <MermaidEditor
          initialValue={DEFAULT_MERMAID_TEMPLATE}
          onSave={handleSave}
        />
      </main>
    </div>
  );
};

export default StartPage;
