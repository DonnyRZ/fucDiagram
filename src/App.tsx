import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import StartPage from './components/StartPage';
import HistoryPage from './components/HistoryPage';
import CanvasPage from './components/CanvasPage';
import './App.css';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <ToastProvider>
      <AppProvider>
        <Router>
          <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => !v)} />
            <main className="main">
              <Routes>
                <Route path="/" element={<StartPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/canvas" element={<CanvasPage />} />
                <Route path="/canvas/:projectId" element={<CanvasPage />} />
              </Routes>
              <BottomNav />
            </main>
          </div>
        </Router>
      </AppProvider>
    </ToastProvider>
  );
}

export default App;
