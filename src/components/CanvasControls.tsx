import { useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { ExportService } from '../services/exportService';
import { useToast } from '../context/ToastContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import './CanvasControls.css';

interface CanvasControlsProps {
  isAnimating: boolean;
  onAnimate: () => void;
  isEditing: boolean;
  onEditToggle: () => void;
  svgContent: string;
  className?: string;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFit?: () => void;
  onFitWidth?: () => void;
  onFitHeight?: () => void;
  onResetView?: () => void;
  zoom?: number;
}

const CanvasControls = ({ isAnimating, onAnimate, isEditing, onEditToggle, svgContent, className, onZoomIn, onZoomOut, onFit, onFitWidth, onFitHeight, onResetView, zoom }: CanvasControlsProps) => {
  const { currentProject } = useApp();
  const { showToast } = useToast();
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+e': () => {
      if (svgContent && currentProject) {
        handleExport();
      }
    },
    'ctrl+shift+e': () => {
      if (svgContent && currentProject) {
        handleExportSvg();
      }
    },
    'ctrl+d': () => {
      onEditToggle();
    }
  });
  
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
    <div className={["canvas-controls", className].filter(Boolean).join(' ')}>
      <div className="control-row">
        <Button variant={isAnimating ? 'secondary' : 'primary'} onClick={onAnimate} className="control-button">
          <Icon name={isAnimating ? 'stop' : 'play'} />
          {isAnimating ? 'Stop' : 'Play'}
        </Button>

        <Button variant="tonal" onClick={onEditToggle} aria-pressed={isEditing} className="control-button">
          <Icon name={isEditing ? 'check' : 'edit'} />
          {isEditing ? 'Done' : 'Edit'} (Ctrl+D)
        </Button>
        
        <Button variant="ghost" onClick={handleExport} disabled={!svgContent} className="control-button">
          <Icon name="image" /> PNG (Ctrl+E)
        </Button>

        <Button variant="ghost" onClick={handleExportSvg} disabled={!svgContent} className="control-button">
          <Icon name="file" /> SVG (Ctrl+Shift+E)
        </Button>

        {onZoomOut && (
          <Button variant="ghost" onClick={onZoomOut} disabled={!svgContent} className="control-button" aria-label="Zoom out">
            − Zoom
          </Button>
        )}
        {onZoomIn && (
          <Button variant="ghost" onClick={onZoomIn} disabled={!svgContent} className="control-button" aria-label="Zoom in">
            + Zoom
          </Button>
        )}
        {onFit && (
          <Button variant="ghost" onClick={onFit} disabled={!svgContent} className="control-button" aria-label="Fit to screen">
            Fit
          </Button>
        )}
        {onFitWidth && (
          <Button variant="ghost" onClick={onFitWidth} disabled={!svgContent} className="control-button" aria-label="Fit to width">
            Fit W
          </Button>
        )}
        {onFitHeight && (
          <Button variant="ghost" onClick={onFitHeight} disabled={!svgContent} className="control-button" aria-label="Fit to height">
            Fit H
          </Button>
        )}
        {onResetView && (
          <Button variant="ghost" onClick={onResetView} disabled={!svgContent} className="control-button" aria-label="Reset view">
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default CanvasControls;
