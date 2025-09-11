import './Header.css';
import { Icon } from './ui/Icon';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

const Header = ({ title, showBack = false, onBack }: HeaderProps) => {
  return (
    <header className="app-header">
      <div className="header-content">
        {showBack && (
          <button 
            className="back-button touch-target" 
            onClick={onBack}
            aria-label="Go back"
          >
            <Icon name="arrow-left" />
          </button>
        )}
        
        <h1 className="header-title">{title}</h1>
        
        <div className="header-actions">
          {/* We can add user actions here in the future */}
        </div>
      </div>
    </header>
  );
};

export default Header;