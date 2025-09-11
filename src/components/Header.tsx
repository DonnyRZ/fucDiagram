import { useNavigate } from 'react-router-dom';
import './Header.css';
import { Icon } from './ui/Icon';
import { IconButton } from './ui/Button';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

const Header = ({ title, showBack = false, onBack }: HeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        {showBack && (
          <IconButton className="back-button" onClick={handleBack} aria-label="Go back">
            <Icon name="back" />
          </IconButton>
        )}
        <h1 className="header-title">{title}</h1>
        <div className="header-spacer"></div>
      </div>
    </header>
  );
};

export default Header;
