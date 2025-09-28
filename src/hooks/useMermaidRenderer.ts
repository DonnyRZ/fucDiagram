import { useState, useCallback, useRef, useEffect } from 'react';
import { MermaidRenderer } from '../services/mermaidRenderer';

export const useMermaidRenderer = () => {
  const [isRendering, setIsRendering] = useState(false);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagramType, setDiagramType] = useState<string | null>(null);
  const lastRenderParams = useRef<{code: string, id: string} | null>(null);
  const renderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const render = useCallback(async (code: string, id: string) => {
    if (import.meta.env.DEV) console.log('useMermaidRenderer - render called with:', { code, id });
    
    // Clear any existing timeout
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    
    // Check if we're already rendering with the same parameters
    if (lastRenderParams.current && 
        lastRenderParams.current.code === code && 
        lastRenderParams.current.id === id) {
      console.log('useMermaidRenderer - skipping render, same parameters as last call');
      return;
    }
    
    // Update last render parameters
    lastRenderParams.current = { code, id };
    
    if (!code.trim()) {
      console.log('useMermaidRenderer - empty code, setting svg to null');
      setSvg(null);
      setDiagramType(null);
      setError(null);
      return;
    }

    setIsRendering(true);
    setError(null);

    try {
      const result = await MermaidRenderer.render(id, code);
      if (import.meta.env.DEV) console.log('useMermaidRenderer - render result:', result);
      
      // Check if the result is valid
      if (!result || !result.svg) {
        throw new Error('Invalid render result');
      }
      
      // Check if the SVG is valid
      if (typeof result.svg !== 'string' || result.svg.trim().length === 0) {
        throw new Error('Invalid SVG in render result');
      }
      
      setSvg(result.svg);
      setDiagramType(result.diagramType);
    } catch (err: unknown) {
      console.error('useMermaidRenderer - render error:', err);
      setError((err as Error).message);
      setSvg(null);
      setDiagramType(null);
    } finally {
      setIsRendering(false);
    }
  }, []);

  // Debounced render function for editor scenarios
  const renderDebounced = useCallback((code: string, id: string, delay: number = 500) => {
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    
    renderTimeoutRef.current = setTimeout(() => {
      render(code, id);
    }, delay);
  }, [render]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, []);

  return { render, renderDebounced, isRendering, svg, error, diagramType };
};
