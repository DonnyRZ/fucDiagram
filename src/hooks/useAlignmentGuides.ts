import { useState, useCallback, useEffect } from 'react';
import { Node } from '@xyflow/react';

interface AlignmentLine {
  id: string;
  type: 'vertical' | 'horizontal';
  position: number;
  nodes: string[];
}

interface SnapPosition {
  x?: number;
  y?: number;
}

export const useAlignmentGuides = (nodes: Node[]) => {
  const [alignmentLines, setAlignmentLines] = useState<AlignmentLine[]>([]);
  const [snapPosition, setSnapPosition] = useState<SnapPosition>({});
  
  // Calculate alignment lines based on node positions
  const calculateAlignmentLines = useCallback(() => {
    if (nodes.length < 2) {
      setAlignmentLines([]);
      return;
    }
    
    const lines: AlignmentLine[] = [];
    const verticalLines = new Map<number, string[]>();
    const horizontalLines = new Map<number, string[]>();
    
    // Collect potential alignment positions
    nodes.forEach(node => {
      if (!node.position || !node.width || !node.height) return;
      
      const centerX = node.position.x + node.width / 2;
      const centerY = node.position.y + node.height / 2;
      const left = node.position.x;
      const right = node.position.x + node.width;
      const top = node.position.y;
      const bottom = node.position.y + node.height;
      
      // Vertical alignments (left, center, right)
      [left, centerX, right].forEach(pos => {
        const roundedPos = Math.round(pos / 10) * 10; // Snap to 10px grid
        if (!verticalLines.has(roundedPos)) {
          verticalLines.set(roundedPos, []);
        }
        verticalLines.get(roundedPos)!.push(node.id);
      });
      
      // Horizontal alignments (top, center, bottom)
      [top, centerY, bottom].forEach(pos => {
        const roundedPos = Math.round(pos / 10) * 10; // Snap to 10px grid
        if (!horizontalLines.has(roundedPos)) {
          horizontalLines.set(roundedPos, []);
        }
        horizontalLines.get(roundedPos)!.push(node.id);
      });
    });
    
    // Create vertical alignment lines (at least 2 nodes aligned)
    verticalLines.forEach((nodeIds, position) => {
      if (nodeIds.length >= 2) {
        lines.push({
          id: `v-${position}`,
          type: 'vertical',
          position,
          nodes: nodeIds
        });
      }
    });
    
    // Create horizontal alignment lines (at least 2 nodes aligned)
    horizontalLines.forEach((nodeIds, position) => {
      if (nodeIds.length >= 2) {
        lines.push({
          id: `h-${position}`,
          type: 'horizontal',
          position,
          nodes: nodeIds
        });
      }
    });
    
    setAlignmentLines(lines);
  }, [nodes]);
  
  // Calculate snap position for a moving node
  const calculateSnapPosition = useCallback((
    nodeX: number, 
    nodeY: number, 
    nodeWidth: number, 
    nodeHeight: number,
    movingNodeId: string
  ) => {
    const snapThreshold = 10; // Pixels within which to snap
    let snappedX = nodeX;
    let snappedY = nodeY;
    
    // Check for vertical snapping
    const centerX = nodeX + nodeWidth / 2;
    const left = nodeX;
    const right = nodeX + nodeWidth;
    
    for (const line of alignmentLines) {
      if (line.type === 'vertical') {
        // Check if any edge or center is close to this line
        if (Math.abs(left - line.position) < snapThreshold) {
          snappedX = line.position;
          setSnapPosition({ x: line.position });
          break;
        } else if (Math.abs(centerX - line.position) < snapThreshold) {
          snappedX = line.position - nodeWidth / 2;
          setSnapPosition({ x: line.position });
          break;
        } else if (Math.abs(right - line.position) < snapThreshold) {
          snappedX = line.position - nodeWidth;
          setSnapPosition({ x: line.position });
          break;
        }
      }
    }
    
    // Check for horizontal snapping
    const centerY = nodeY + nodeHeight / 2;
    const top = nodeY;
    const bottom = nodeY + nodeHeight;
    
    for (const line of alignmentLines) {
      if (line.type === 'horizontal') {
        // Check if any edge or center is close to this line
        if (Math.abs(top - line.position) < snapThreshold) {
          snappedY = line.position;
          setSnapPosition(prev => ({ ...prev, y: line.position }));
          break;
        } else if (Math.abs(centerY - line.position) < snapThreshold) {
          snappedY = line.position - nodeHeight / 2;
          setSnapPosition(prev => ({ ...prev, y: line.position }));
          break;
        } else if (Math.abs(bottom - line.position) < snapThreshold) {
          snappedY = line.position - nodeHeight;
          setSnapPosition(prev => ({ ...prev, y: line.position }));
          break;
        }
      }
    }
    
    return { x: snappedX, y: snappedY };
  }, [alignmentLines]);
  
  // Clear snap position
  const clearSnapPosition = useCallback(() => {
    setSnapPosition({});
  }, []);
  
  // Recalculate alignment lines when nodes change
  useEffect(() => {
    calculateAlignmentLines();
  }, [nodes, calculateAlignmentLines]);
  
  return {
    alignmentLines,
    snapPosition,
    calculateSnapPosition,
    clearSnapPosition
  };
};