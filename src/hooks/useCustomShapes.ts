import { useState, useCallback } from 'react';

interface CustomShape {
  id: string;
  name: string;
  svgData: string;
  category: string;
  createdAt: Date;
}

export const useCustomShapes = () => {
  const [customShapes, setCustomShapes] = useState<CustomShape[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  
  // Import custom shape from SVG file
  const importCustomShape = useCallback(async (
    file: File,
    shapeName: string,
    category: string = 'Custom'
  ) => {
    setIsImporting(true);
    
    try {
      // Read file as text
      const svgText = await readFileAsText(file);
      
      // Validate SVG content
      if (!isValidSvg(svgText)) {
        throw new Error('Invalid SVG file');
      }
      
      // Create new custom shape
      const newShape: CustomShape = {
        id: `custom-${Date.now()}`,
        name: shapeName,
        svgData: svgText,
        category,
        createdAt: new Date()
      };
      
      // Add to custom shapes
      setCustomShapes(prev => [...prev, newShape]);
      
      return newShape;
    } catch (error) {
      console.error('Error importing custom shape:', error);
      throw error;
    } finally {
      setIsImporting(false);
    }
  }, []);
  
  // Remove custom shape
  const removeCustomShape = useCallback((shapeId: string) => {
    setCustomShapes(prev => prev.filter(shape => shape.id !== shapeId));
  }, []);
  
  // Update custom shape name
  const updateCustomShapeName = useCallback((shapeId: string, newName: string) => {
    setCustomShapes(prev => 
      prev.map(shape => 
        shape.id === shapeId 
          ? { ...shape, name: newName } 
          : shape
      )
    );
  }, []);
  
  // Update custom shape category
  const updateCustomShapeCategory = useCallback((shapeId: string, newCategory: string) => {
    setCustomShapes(prev => 
      prev.map(shape => 
        shape.id === shapeId 
          ? { ...shape, category: newCategory } 
          : shape
      )
    );
  }, []);
  
  // Get custom shapes by category
  const getShapesByCategory = useCallback((category: string) => {
    return customShapes.filter(shape => shape.category === category);
  }, [customShapes]);
  
  // Get all categories
  const getAllCategories = useCallback(() => {
    const categories = new Set(customShapes.map(shape => shape.category));
    return Array.from(categories);
  }, [customShapes]);
  
  // Export custom shape as SVG file
  const exportCustomShape = useCallback((shapeId: string) => {
    const shape = customShapes.find(s => s.id === shapeId);
    if (!shape) return;
    
    // Create blob from SVG data
    const blob = new Blob([shape.svgData], { type: 'image/svg+xml' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${shape.name}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [customShapes]);
  
  // Helper function to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };
  
  // Helper function to validate SVG
  const isValidSvg = (svgText: string): boolean => {
    // Basic SVG validation
    return svgText.trim().startsWith('<svg') && 
           svgText.trim().endsWith('</svg>') &&
           svgText.includes('xmlns="http://www.w3.org/2000/svg"');
  };
  
  return {
    customShapes,
    isImporting,
    importCustomShape,
    removeCustomShape,
    updateCustomShapeName,
    updateCustomShapeCategory,
    getShapesByCategory,
    getAllCategories,
    exportCustomShape
  };
};