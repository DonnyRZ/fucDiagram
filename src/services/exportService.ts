// This service handles exporting diagrams with a reliable approach
// that works around canvas tainting limitations

export class ExportService {
  static async exportAsGif(svgContent: string, projectName: string): Promise<void> {
    try {
      // Show message to user with clear explanation
      const userChoice = confirm(`"${projectName}" - Animated GIF Export:
      
Due to browser security restrictions with complex SVGs, we cannot generate animated GIFs directly in the browser.

However, you can still get an animated GIF by:
1. Click OK to download the SVG file
2. Visit https://cloudconvert.com/svg-to-gif or https://convertio.co/svg-gif
3. Upload your SVG file
4. Select animation options (if available)
5. Convert to animated GIF

Would you like to download the SVG file now?`);
      
      if (userChoice) {
        // Export as SVG file
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        this.downloadBlob(blob, `${projectName}.svg`);
        
        // Show success message with next steps
        alert(`"${projectName}" exported as SVG file!
        
To create an animated GIF:
1. Go to cloudconvert.com/svg-to-gif or convertio.co/svg-gif
2. Upload your downloaded SVG file
3. Look for animation settings in the conversion options
4. Convert and download your animated GIF`);
      }
    } catch (error: unknown) {
      console.error('Export failed:', error);
      throw new Error(`Failed to export diagram: ${(error as Error).message}`);
    }
  }
  
  static async exportAsPng(svgContent: string, projectName: string): Promise<void> {
    try {
      // Show loading message
      alert(`Exporting "${projectName}" as PNG. This may take a moment...`);
      
      // Convert SVG to PNG
      const pngBlob = await this.convertSvgToPng(svgContent);
      
      // Download the PNG
      this.downloadBlob(pngBlob, `${projectName}.png`);
      
      // Show success message
      alert(`"${projectName}" exported successfully as PNG!`);
    } catch (error: unknown) {
      console.error('Export failed:', error);
      throw new Error(`Failed to export diagram: ${(error as Error).message}`);
    }
  }
  
  private static async convertSvgToPng(svgContent: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // Parse the SVG to get dimensions
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;
      
      // Get dimensions
      const width = (svgElement as any).width?.baseVal?.value || 800;
      const height = (svgElement as any).height?.baseVal?.value || 600;
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Render SVG to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Create image from SVG
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(url);
          
          // Convert canvas to PNG blob
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not convert canvas to PNG'));
            }
          }, 'image/png');
        } catch (e) {
          URL.revokeObjectURL(url);
          reject(new Error(`Failed to draw image on canvas: ${e}`));
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not load SVG image'));
      };
      
      img.src = url;
    });
  }
  
  private static downloadBlob(blob: Blob, filename: string): void {
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}