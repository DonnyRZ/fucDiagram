import './Header.css';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  backPath?: string; // Optional path to navigate to when back button is clicked
}

const Header = ({ title, showBack = false, backPath }: HeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1); // Go back in history
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        {showBack && (
          <button 
            className="back-button touch-target" 
            onClick={handleBack}
            aria-label="Go back"
            title="Go back"
          >
            <Icon name="back" />
          </button>
        )}
        
        <h1 className="header-title">{title}</h1>
        
        <div className="header-actions">
        </div>
      </div>
    </header>
  );
};

export default Header;
