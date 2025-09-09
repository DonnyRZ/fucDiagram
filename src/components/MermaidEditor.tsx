import { useState, useEffect } from 'react';
import { useMermaidRenderer } from '../hooks/useMermaidRenderer';
import './MermaidEditor.css';

interface MermaidEditorProps {
  initialValue: string;
  onSave: (code: string) => void;
}

const MermaidEditor = ({ initialValue, onSave }: MermaidEditorProps) => {
  const [code, setCode] = useState(initialValue);
  const { render, isRendering, svg, error } = useMermaidRenderer();

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
          <button 
            className="touch-button secondary paste-button"
            onClick={handlePaste}
          >
            📋 Paste
          </button>
        </div>
        
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your Mermaid.js code here..."
          className="mermaid-textarea"
          rows={15}
        />
        
        <div className="editor-actions">
          <button 
            className="touch-button primary save-button"
            onClick={() => onSave(code)}
            disabled={!code.trim() || isRendering}
          >
            {isRendering ? 'Rendering...' : '💾 Save Diagram'}
          </button>
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
              dangerouslySetInnerHTML={{ __html: svg }}
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