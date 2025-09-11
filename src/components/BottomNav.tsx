import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import './BottomNav.css';
import { Icon } from './ui/Icon';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentProject } = useApp();

  const goCreate = () => navigate('/');
  const goHistory = () => navigate('/history');
  const goCanvas = () => {
    if (currentProject) {
      navigate(`/canvas/${currentProject.id}`);
    } else {
      // If no current project, guide user to history to pick one
      navigate('/history');
    }
  };

  const isRoute = (path: string) => {
    // Mark as active if current path starts with the target
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav" aria-label="Primary">
      <div className="bottom-nav__bar">
        <button
          className="bottom-nav__btn"
          onClick={goCreate}
          aria-current={isRoute('/') && !isRoute('/history') && !isRoute('/canvas') ? 'page' : undefined}
          aria-label="Create"
        >
          <Icon name="plus" /> <span className="bottom-nav__label">Create</span>
        </button>
        <button
          className="bottom-nav__btn"
          onClick={goHistory}
          aria-current={isRoute('/history') ? 'page' : undefined}
          aria-label="History"
        >
          <Icon name="history" /> <span className="bottom-nav__label">History</span>
        </button>
        <button
          className="bottom-nav__btn"
          onClick={goCanvas}
          aria-current={isRoute('/canvas') ? 'page' : undefined}
          aria-label="Canvas"
        >
          <Icon name="canvas" /> <span className="bottom-nav__label">Canvas</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
