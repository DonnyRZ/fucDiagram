import { useApp } from '../hooks/useApp';
import { ExportService } from '../services/exportService';
import './CanvasControls.css';

interface CanvasControlsProps {
  isAnimating: boolean;
  onAnimate: () => void;
  onSave: () => void;
  svgContent: string;
}

const CanvasControls = ({ isAnimating, onAnimate, onSave, svgContent }: CanvasControlsProps) => {
  const { currentProject } = useApp();
  
  const handleExport = async () => {
    if (!currentProject) {
      alert('No project to export');
      return;
    }
    
    try {
      await ExportService.exportAsGif(svgContent, currentProject.name);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="canvas-controls">
      <div className="control-row">
        <button
          className={`control-button touch-button ${isAnimating ? 'active' : ''}`}
          onClick={onAnimate}
        >
          {isAnimating ? '⏹️ Stop' : '▶️ Animate'}
        </button>
        
        <button
          className="control-button touch-button"
          onClick={onSave}
        >
          💾 Save
        </button>
        
        <button
          className="control-button touch-button"
          onClick={handleExport}
          disabled={!svgContent}
        >
          📤 Export
        </button>
      </div>
    </div>
  );
};

export default CanvasControls;