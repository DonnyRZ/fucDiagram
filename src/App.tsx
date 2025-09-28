import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from './context/AppContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import StartPage from './pages/StartPage';
import HistoryPage from './pages/HistoryPage';
import EditorPage from './pages/EditorPage';
import './App.css';

const ErrorDisplay = () => {
  const { error, clearError } = useContext(AppContext)!;
  
  if (!error) return null;
  
  return (
    <div className="error-overlay">
      <div className="error-modal">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={clearError} className="btn btn-primary">Dismiss</button>
      </div>
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <Router>
          <div className="app-container">
            <Routes>
              <Route path="/" element={<StartPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/canvas" element={<EditorPage />} />
              <Route path="/canvas/:projectId" element={<EditorPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/new" element={<EditorPage />} />
            </Routes>
            <ErrorDisplay />
          </div>
        </Router>
      </AppProvider>
    </ToastProvider>
  );
}

export default App;
