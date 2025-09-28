import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from './context/AppContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { NavigationProvider } from './context/NavigationContext';
import Workspace from './pages/Workspace';
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
        <NavigationProvider>
          <Router>
            <div className="app-container">
              <Routes>
                {/* Redirect old routes to workspace */}
                <Route path="/" element={<Workspace />} />
                <Route path="/history" element={<Workspace />} />
                <Route path="/canvas" element={<Workspace />} />
                <Route path="/canvas/:projectId" element={<Workspace />} />
                <Route path="/editor" element={<Workspace />} />
                <Route path="/new" element={<Workspace />} />
                {/* Catch-all redirect to workspace */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <ErrorDisplay />
            </div>
          </Router>
        </NavigationProvider>
      </AppProvider>
    </ToastProvider>
  );
}

export default App;
