import { useEffect, useRef, useCallback } from 'react';

export const useAutoSave = (
  content: string,
  onSave: (content: string) => void,
  delay: number = 30000 // 30 seconds default
) => {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousContentRef = useRef<string>(content);

  const startAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      onSave(content);
      previousContentRef.current = content;
    }, delay);
  }, [content, onSave, delay]);

  const cancelAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, []);

  // Start auto-save when content changes
  useEffect(() => {
    // Only start auto-save if content has actually changed
    if (content !== previousContentRef.current) {
      startAutoSave();
    }
    
    // Update previous content reference
    previousContentRef.current = content;
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, startAutoSave]);

  return { cancelAutoSave };
};