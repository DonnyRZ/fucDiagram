import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import StartPage from './components/StartPage';
import HistoryPage from './components/HistoryPage';
import CanvasPage from './components/CanvasPage';
import './App.css';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <Router>
          <div className="app-container">
            <Routes>
              <Route path="/" element={<StartPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/canvas" element={<CanvasPage />} />
              <Route path="/canvas/:projectId" element={<CanvasPage />} />
            </Routes>
            <BottomNav />
          </div>
        </Router>
      </AppProvider>
    </ToastProvider>
  );
}

export default App;
