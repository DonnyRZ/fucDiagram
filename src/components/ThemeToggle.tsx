import { useEffect, useState } from 'react';
import { Icon } from './ui/Icon';
import './ThemeToggle.css';

type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  // default: follow system
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
      {theme === 'dark' ? (
        <span className="theme-toggle__inner" title="Switch to light">
          <Icon name="sun" />
          <span className="label">Light</span>
        </span>
      ) : (
        <span className="theme-toggle__inner" title="Switch to dark">
          <Icon name="moon" />
          <span className="label">Dark</span>
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
