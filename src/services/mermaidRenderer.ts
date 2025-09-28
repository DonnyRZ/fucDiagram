import mermaid from 'mermaid';

// Initialize Mermaid
mermaid.initialize({ 
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose', // Changed from 'strict' to 'loose' to allow more functionality
  fontFamily: 'inherit',
  fontSize: 16,
  // Enable diagram-specific configurations
  flowchart: { 
    useMaxWidth: false,
    htmlLabels: true
  },
  sequence: {
    diagramMarginX: 50,
    diagramMarginY: 10,
    useMaxWidth: false
  }
});

export class MermaidRenderer {
  static async render(id: string, code: string): Promise<{ svg: string; diagramType: string }> {
    try {
      if (import.meta.env.DEV) console.log('MermaidRenderer - render called with:', { id, code });
      // Clean the code by removing extra whitespace
      const cleanCode = code.trim();
      
      if (!cleanCode) {
        throw new Error('Empty diagram code');
      }
      
      // In mermaid 10.x, the render function renders directly to an existing DOM element
      // and returns the SVG string and bindFunctions array
      // We need to ensure the target element exists in the DOM before calling render
      const renderResult = await mermaid.render(id, cleanCode);
      
      // In mermaid 10.x, render returns [svgString, bindFunctions] as an array
      // or it renders directly to the DOM element with the given ID and returns the SVG string
      let svg: string;
      if (Array.isArray(renderResult)) {
        svg = renderResult[0];
      } else {
        svg = typeof renderResult === 'string' ? renderResult : (renderResult as any).svg;
      }
      
      // Check if the SVG is valid
      if (!svg || typeof svg !== 'string') {
        throw new Error('Invalid SVG returned from Mermaid');
      }
      
      // Check if the SVG contains actual content
      if (svg.trim().length === 0) {
        throw new Error('Empty SVG returned from Mermaid');
      }
      
      if (import.meta.env.DEV) console.log('MermaidRenderer - processed svg:', svg);
      return { svg, diagramType: 'unknown' }; // diagramType extraction not directly supported in this version
    } catch (error: unknown) {
      console.error('Mermaid rendering error:', error);
      // If rendering fails, return an error SVG
      const errorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
        <rect width="100%" height="100%" fill="#fee" />
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#900" font-family="Arial" font-size="14">
          Diagram rendering error: ${(error as Error).message || 'Unknown error'}
        </text>
      </svg>`;
      return { svg: errorSvg, diagramType: 'error' };
    }
  }
  
  static async renderWithAnimation(
    id: string, 
    code: string
  ): Promise<string> {
    try {
      const { svg } = await this.render(id, code);
      
      // If we want to add animation, we would inject the styles here
      // For now, we'll return the SVG as-is and handle animation in the component
      return svg;
    } catch (error: unknown) {
      throw new Error(`Failed to render animated diagram: ${(error as Error).message}`);
    }
  }
}
