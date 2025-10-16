import { useCallback } from 'react';
import { Node } from '@xyflow/react';

export const useLayerManagement = () => {
  // Bring node to front (highest z-index)
  const bringToFront = useCallback((nodeId: string, nodes: Node[]) => {
    return nodes.map(node => 
      node.id === nodeId 
        ? { ...node, zIndex: getMaxZIndex(nodes) + 1 } 
        : node
    );
  }, []);
  
  // Send node to back (lowest z-index)
  const sendToBack = useCallback((nodeId: string, nodes: Node[]) => {
    return nodes.map(node => 
      node.id === nodeId 
        ? { ...node, zIndex: getMinZIndex(nodes) - 1 } 
        : node
    );
  }, []);
  
  // Bring node forward (increase z-index by 1)
  const bringForward = useCallback((nodeId: string, nodes: Node[]) => {
    return nodes.map(node => 
      node.id === nodeId 
        ? { ...node, zIndex: (node.zIndex || 0) + 1 } 
        : node
    );
  }, []);
  
  // Send node backward (decrease z-index by 1)
  const sendBackward = useCallback((nodeId: string, nodes: Node[]) => {
    return nodes.map(node => 
      node.id === nodeId 
        ? { ...node, zIndex: (node.zIndex || 0) - 1 } 
        : node
    );
  }, []);
  
  // Get maximum z-index from nodes
  const getMaxZIndex = useCallback((nodes: Node[]) => {
    return Math.max(...nodes.map(n => n.zIndex || 0), 0);
  }, []);
  
  // Get minimum z-index from nodes
  const getMinZIndex = useCallback((nodes: Node[]) => {
    return Math.min(...nodes.map(n => n.zIndex || 0), 0);
  }, []);
  
  // Reset all z-indices to default ordering
  const resetZIndices = useCallback((nodes: Node[]) => {
    return nodes.map((node, index) => ({
      ...node,
      zIndex: index
    }));
  }, []);
  
  return {
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    getMaxZIndex,
    getMinZIndex,
    resetZIndices
  };
};

// Helper function to sort nodes by z-index for rendering
export const sortNodesByZIndex = (nodes: Node[]) => {
  return [...nodes].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
};