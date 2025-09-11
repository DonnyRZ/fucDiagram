import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import './Sidebar.css';
import { Icon } from './ui/Icon';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ collapsed = false, onToggle }: SidebarProps) => {
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
    <nav className={["sidebar", collapsed ? 'sidebar--collapsed' : ''].join(' ')} aria-label="Primary">
      <div className="sidebar__logo">
        <h2>Animated Diagrams</h2>
        <button className="sidebar__collapse-btn" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? '»' : '«'}
        </button>
      </div>
      
      <div className="sidebar__menu">
        <button
          className={`sidebar__btn ${isRoute('/') && !isRoute('/history') && !isRoute('/canvas') ? 'active' : ''}`}
          onClick={goCreate}
          aria-current={isRoute('/') && !isRoute('/history') && !isRoute('/canvas') ? 'page' : undefined}
          aria-label="Create"
        >
          <Icon name="plus" /> <span className="sidebar__label">Create</span>
        </button>
        
        <button
          className={`sidebar__btn ${isRoute('/history') ? 'active' : ''}`}
          onClick={goHistory}
          aria-current={isRoute('/history') ? 'page' : undefined}
          aria-label="History"
        >
          <Icon name="history" /> <span className="sidebar__label">History</span>
        </button>
        
        <button
          className={`sidebar__btn ${isRoute('/canvas') ? 'active' : ''}`}
          onClick={goCanvas}
          aria-current={isRoute('/canvas') ? 'page' : undefined}
          aria-label="Canvas"
        >
          <Icon name="canvas" /> <span className="sidebar__label">Canvas</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
