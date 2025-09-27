import { useState, useEffect, useRef } from 'react';
import { useMermaidRenderer } from '../hooks/useMermaidRenderer';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import './MermaidEditor.css';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { sanitizeSvg } from '../utils/sanitize';

interface MermaidEditorProps {
  initialValue: string;
  onSave: (code: string) => void;
}

const MermaidEditor = ({ initialValue, onSave }: MermaidEditorProps) => {
  const [code, setCode] = useState(initialValue);
  const { render, isRendering, svg, error } = useMermaidRenderer();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+s': () => {
      if (code.trim() && !isRendering) {
        onSave(code);
      }
    }
  });

  // Render preview when code changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      render(code, 'preview');
    }, 500);

    return () => clearTimeout(timer);
  }, [code, render]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCode(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  return (
    <div className="mermaid-editor-container">
      <div className="editor-section">
        <div className="editor-header">
          <h2>Mermaid Code</h2>
          <Button variant="tonal" className="paste-button" onClick={handlePaste} aria-label="Paste from clipboard">
            <Icon name="file" /> Paste
          </Button>
        </div>
        
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your Mermaid.js code here..."
          className="mermaid-textarea"
          rows={15}
        />
        
        <div className="editor-actions">
          <Button 
            variant="primary" 
            className="save-button"
            onClick={() => onSave(code)}
            disabled={!code.trim() || isRendering}
          >
            {isRendering ? (
              <>
                <span className="spinner"></span>
                Rendering…
              </>
            ) : (
              'Save Diagram (Ctrl+S)'
            )}
          </Button>
        </div>
      </div>
      
      <div className="preview-section">
        <h2>Preview</h2>
        <div className="preview-container">
          {isRendering ? (
            <div className="loading">Rendering diagram...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : svg ? (
            <div 
              className="diagram-preview"
              dangerouslySetInnerHTML={{ __html: sanitizeSvg(svg) }}
            />
          ) : (
            <div className="preview-placeholder">
              Enter Mermaid code to see preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MermaidEditor;
