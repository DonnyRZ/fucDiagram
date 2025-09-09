import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import Header from './Header';
import ProjectList from './ProjectList';
import './HistoryPage.css';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { projects, deleteProject } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenProject = (id: string) => {
    navigate(`/canvas/${id}`);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="history-page">
      <Header title="My Diagrams" />
      
      <main className="history-content">
        <div className="search-container">
          <input
            type="search"
            placeholder="Search diagrams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <ProjectList
          projects={filteredProjects}
          onOpenProject={handleOpenProject}
          onDeleteProject={handleDeleteProject}
        />
        
        {filteredProjects.length === 0 && (
          <div className="empty-state">
            <p>{searchQuery ? "No matching diagrams found" : "No diagrams yet"}</p>
            {!searchQuery && (
              <button 
                className="touch-button primary"
                onClick={() => navigate('/')}
              >
                Create Your First Diagram
              </button>
            )}
            {searchQuery && (
              <button 
                className="touch-button secondary"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;