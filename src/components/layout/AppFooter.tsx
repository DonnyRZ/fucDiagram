import React from 'react';
import './AppFooter.css';

interface AppFooterProps {
  currentPage?: string;
}

const AppFooter: React.FC<AppFooterProps> = ({ currentPage = 'Home' }) => {
  return (
    <footer className="app-footer" role="contentinfo" aria-label="application footer">
      <div className="footer-content">
        <p className="footer-info">
          Current page: <span className="current-page">{currentPage}</span>
        </p>
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} Animated Diagrams. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default AppFooter;