import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useMermaidRenderer } from '../../hooks/useMermaidRenderer';
import { defineMermaidLanguage } from '../../utils/monacoMermaidLanguage';
import './EnhancedEditorPanel.css';

interface EnhancedEditorPanelProps {
  code: string;
  config: any; // Mermaid config
  onCodeChange: (code: string) => void;
  onConfigChange: (config: any) => void; // Mermaid config
  isRendering: boolean;
  hasUnsavedChanges?: boolean;
}

const EnhancedEditorPanel: React.FC<EnhancedEditorPanelProps> = ({
  code,
  config,
  onCodeChange,
  onConfigChange,
  isRendering,
  hasUnsavedChanges
}) => {
  const [localCode, setLocalCode] = useState(code);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const { renderDebounced } = useMermaidRenderer();

  // Sync local state with prop
  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    const newCode = value || '';
    setLocalCode(newCode);
    onCodeChange(newCode);
    
    // Use debounced rendering for better performance
    renderDebounced(newCode, 'editor-preview', 500);
  }, [onCodeChange, renderDebounced]);

  const handleEditorWillMount = (monaco: any) => {
    // Define Mermaid language for syntax highlighting
    defineMermaidLanguage(monaco);
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Set the language to mermaid after mounting
    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, 'mermaid');
    }
    setIsEditorReady(true);
  };

  return (
    <div className="enhanced-editor-panel">
      <div className="editor-header">
        <h2>Diagram Code</h2>
        <div className="editor-status">
          {isRendering ? (
            <span className="status-rendering">Rendering...</span>
          ) : hasUnsavedChanges ? (
            <span className="status-unsaved">Unsaved Changes</span>
          ) : (
            <span className="status-saved">Saved</span>
          )}
        </div>
      </div>
      
      <div className="editor-content">
        <Editor
          height="100%"
          defaultLanguage="javascript" // Default to JavaScript initially
          value={localCode}
          onChange={handleEditorChange}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            tabSize: 2,
            fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
            lineNumbers: true,
            folding: true,
          }}
        />
      </div>
    </div>
  );
};

export default EnhancedEditorPanel;