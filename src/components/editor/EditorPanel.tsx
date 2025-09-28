import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMermaidRenderer } from '../../hooks/useMermaidRenderer';
import EditorHistory from '../../utils/EditorHistory';
import './EditorPanel.css';

interface EditorPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  code,
  onCodeChange
}) => {
  const [localCode, setLocalCode] = useState(code);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef(new EditorHistory());
  const isUpdatingFromHistory = useRef(false); // Flag to prevent pushing to history during undo/redo
  const { renderDebounced, isRendering } = useMermaidRenderer();

  // Sync local state with prop
  useEffect(() => {
    if (!isUpdatingFromHistory.current) {
      setLocalCode(code);
      historyRef.current.push(code);
    }
  }, [code]);

  // Set up keyboard shortcuts for undo/redo
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      else if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') || 
               ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }
    };

    textarea.addEventListener('keydown', handleKeyDown);
    return () => {
      textarea.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setLocalCode(newCode);
    
    // Only push to history if not updating from undo/redo
    if (!isUpdatingFromHistory.current) {
      historyRef.current.push(newCode);
    }
    
    onCodeChange(newCode);
    
    // Use debounced rendering for better performance
    renderDebounced(newCode, 'editor-preview', 500);
  }, [onCodeChange, renderDebounced]);

  const handleUndo = () => {
    const previousCode = historyRef.current.undo();
    if (previousCode !== null) {
      isUpdatingFromHistory.current = true;
      setLocalCode(previousCode);
      onCodeChange(previousCode);
      
      // Reset the flag after a brief moment to allow new changes
      setTimeout(() => {
        isUpdatingFromHistory.current = false;
      }, 100);
    }
  };

  const handleRedo = () => {
    const nextCode = historyRef.current.redo();
    if (nextCode !== null) {
      isUpdatingFromHistory.current = true;
      setLocalCode(nextCode);
      onCodeChange(nextCode);
      
      // Reset the flag after a brief moment to allow new changes
      setTimeout(() => {
        isUpdatingFromHistory.current = false;
      }, 100);
    }
  };

  // Add buttons for undo/redo
  const canUndo = historyRef.current.canUndo();
  const canRedo = historyRef.current.canRedo();

  return (
    <div className="editor-panel">
      <div className="editor-header">
        <h2>Diagram Code</h2>
        <div className="editor-actions">
          <button 
            className={`btn btn-secondary ${!canUndo ? 'btn-disabled' : ''}`}
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (Ctrl/Cmd+Z)"
            aria-label="Undo"
          >
            ↶ Undo
          </button>
          <button 
            className={`btn btn-secondary ${!canRedo ? 'btn-disabled' : ''}`}
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo (Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z)"
            aria-label="Redo"
          >
            ↷ Redo
          </button>
        </div>
      </div>
      
      <div className="editor-content">
        <textarea
          ref={textareaRef}
          className="input editor-textarea"
          value={localCode}
          onChange={handleChange}
          placeholder="Enter your Mermaid diagram code here..."
          spellCheck="false"
          aria-label="Diagram code editor"
        />
      </div>
      
      <div className="editor-footer">
        <div className="editor-status">
          {isRendering ? (
            <span className="status-rendering">Rendering...</span>
          ) : (
            <span className="status-ready">Ready</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;