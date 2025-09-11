import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're in an input/textarea
      const activeElement = document.activeElement;
      const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
      
      // Don't trigger shortcuts when in input fields
      if (isInput) return;
      
      // Format key combination
      const key = e.ctrlKey || e.metaKey ? `ctrl+${e.key.toLowerCase()}` : e.key.toLowerCase();
      
      // Execute shortcut if it exists
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};