import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import StartPage from './components/StartPage';
import HistoryPage from './components/HistoryPage';
import CanvasPage from './components/CanvasPage';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<StartPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/canvas" element={<CanvasPage />} />
            <Route path="/canvas/:projectId" element={<CanvasPage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;