import { useApp } from '../hooks/useApp';
import { ExportService } from '../services/exportService';
import { useToast } from '../context/ToastContext';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import './CanvasControls.css';

interface CanvasControlsProps {
  isAnimating: boolean;
  onAnimate: () => void;
  isEditing: boolean;
  onEditToggle: () => void;
  svgContent: string;
}

const CanvasControls = ({ isAnimating, onAnimate, isEditing, onEditToggle, svgContent }: CanvasControlsProps) => {
  const { currentProject } = useApp();
  const { showToast } = useToast();
  
  const handleExport = async () => {
    if (!currentProject) {
      showToast('No project to export', 'error');
      return;
    }
    
    try {
      await ExportService.exportAsPng(svgContent, currentProject.name);
      showToast('Exported PNG to downloads', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Export failed. Please try again.', 'error');
    }
  };

  const handleExportSvg = async () => {
    if (!currentProject) {
      showToast('No project to export', 'error');
      return;
    }
    try {
      await ExportService.exportAsSvg(svgContent, currentProject.name);
      showToast('Exported SVG to downloads', 'success');
    } catch (e) {
      console.error(e);
      showToast('Export failed. Please try again.', 'error');
    }
  };

  return (
    <div className="canvas-controls">
      <div className="control-row">
        <Button variant={isAnimating ? 'secondary' : 'primary'} onClick={onAnimate} className="control-button">
          <Icon name={isAnimating ? 'stop' : 'play'} />
          {isAnimating ? 'Stop' : 'Play'}
        </Button>

        <Button variant="tonal" onClick={onEditToggle} aria-pressed={isEditing} className="control-button">
          <Icon name={isEditing ? 'check' : 'edit'} />
          {isEditing ? 'Done' : 'Edit'}
        </Button>
        
        <Button variant="ghost" onClick={handleExport} disabled={!svgContent} className="control-button">
          <Icon name="image" /> PNG
        </Button>

        <Button variant="ghost" onClick={handleExportSvg} disabled={!svgContent} className="control-button">
          <Icon name="file" /> SVG
        </Button>
      </div>
    </div>
  );
};

export default CanvasControls;
