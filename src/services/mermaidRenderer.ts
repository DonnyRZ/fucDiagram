import mermaid from 'mermaid';

// Initialize Mermaid
mermaid.initialize({ 
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose'
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
      
      // The render function returns the SVG string directly in newer versions
      const svgResult: any = await mermaid.render(id, cleanCode);
      if (import.meta.env.DEV) console.log('MermaidRenderer - raw result:', svgResult);
      // Handle both string and object return types
      const svg = typeof svgResult === 'string' ? svgResult : svgResult.svg;
      
      // Check if the SVG is valid
      if (!svg || typeof svg !== 'string') {
        throw new Error('Invalid SVG returned from Mermaid');
      }
      
      // Check if the SVG contains actual content
      if (svg.trim().length === 0) {
        throw new Error('Empty SVG returned from Mermaid');
      }
      
      if (import.meta.env.DEV) console.log('MermaidRenderer - processed svg:', svg);
      return { svg, diagramType: 'unknown' }; // mermaid.render doesn't return diagramType in newer versions
    } catch (error: unknown) {
      console.error('Mermaid rendering error:', error);
      throw new Error(`Failed to render diagram: ${(error as Error).message}`);
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
