export class AnimationEngine {
  private static readonly ANIMATION_STYLES = {
    flow: {
      keyframes: `
        @keyframes dashdraw-flow {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
      `,
      css: `
        .edge-animation-flow {
          stroke-dasharray: 10;
          animation: dashdraw-flow 2s linear infinite;
        }
      `
    },
    pulse: {
      keyframes: `
        @keyframes dashdraw-pulse {
          0% { stroke-dashoffset: 100; opacity: 0.3; }
          50% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.3; }
        }
      `,
      css: `
        .edge-animation-pulse {
          stroke-dasharray: 10;
          animation: dashdraw-pulse 2s ease-in-out infinite;
        }
      `
    },
    bounce: {
      keyframes: `
        @keyframes dashdraw-bounce {
          0%, 100% { stroke-dashoffset: 100; transform: scale(1); }
          50% { stroke-dashoffset: 50; transform: scale(1.05); }
        }
      `,
      css: `
        .edge-animation-bounce {
          stroke-dasharray: 10;
          animation: dashdraw-bounce 1.5s ease-in-out infinite;
        }
      `
    }
  };

  static injectAnimationStyles(container: HTMLElement): void {
    // Respect reduced motion
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    // Create or update style element with animation CSS
    let styleElement = container.querySelector('#animation-styles') as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'animation-styles';
      container.appendChild(styleElement);
    }
    
    // Combine all keyframes and CSS
    const allStyles = Object.values(this.ANIMATION_STYLES)
      .map(style => style.keyframes + style.css)
      .join('\n');
    
    styleElement.textContent = allStyles;
  }

  static applyAnimation(svgElement: SVGElement, animationType: string = 'flow'): void {
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    // Find all edge paths in the SVG
    // In Mermaid diagrams, edges are typically represented as <path> elements
    const edgePaths = svgElement.querySelectorAll('path');
    
    // Remove any existing animation classes
    edgePaths.forEach(path => {
      path.classList.remove(
        'edge-animation-flow',
        'edge-animation-pulse',
        'edge-animation-bounce'
      );
    });
    
    // Apply animation class based on type
    edgePaths.forEach(path => {
      // Only apply animation to actual edges (not other SVG elements)
      // Edges typically have stroke properties
      const computedStyle = window.getComputedStyle(path);
      if (computedStyle.stroke && computedStyle.stroke !== 'none' && computedStyle.fill !== 'black') {
        path.classList.add(`edge-animation-${animationType}`);
        // Ensure the path has the necessary properties for animation
        path.style.strokeDasharray = '10';
      }
    });
  }
  
  static removeAnimation(svgElement: SVGElement): void {
    // Find all edge paths in the SVG
    const edgePaths = svgElement.querySelectorAll('path');
    
    // Remove all animation classes and properties
    edgePaths.forEach(path => {
      path.classList.remove(
        'edge-animation-flow',
        'edge-animation-pulse',
        'edge-animation-bounce'
      );
      // Remove the stroke-dasharray property we added
      path.style.strokeDasharray = '';
    });
  }
}
