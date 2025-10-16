import { useState, useCallback, useEffect } from 'react';
import { Node } from '@xyflow/react';

interface SelectionGroup {
  id: string;
  name: string;
  nodeIds: string[];
  createdAt: Date;
}

export const useMultiSelection = () => {
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [groups, setGroups] = useState<SelectionGroup[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  
  // Add node to selection
  const addNodeToSelection = useCallback((nodeId: string) => {
    setSelectedNodeIds(prev => {
      const newSet = new Set(prev);
      newSet.add(nodeId);
      return newSet;
    });
  }, []);
  
  // Remove node from selection
  const removeNodeFromSelection = useCallback((nodeId: string) => {
    setSelectedNodeIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(nodeId);
      return newSet;
    });
  }, []);
  
  // Toggle node selection
  const toggleNodeSelection = useCallback((nodeId: string) => {
    setSelectedNodeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);
  
  // Select multiple nodes
  const selectMultipleNodes = useCallback((nodeIds: string[]) => {
    setSelectedNodeIds(new Set(nodeIds));
  }, []);
  
  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedNodeIds(new Set());
  }, []);
  
  // Check if node is selected
  const isNodeSelected = useCallback((nodeId: string) => {
    return selectedNodeIds.has(nodeId);
  }, [selectedNodeIds]);
  
  // Get selected node count
  const getSelectedNodeCount = useCallback(() => {
    return selectedNodeIds.size;
  }, [selectedNodeIds]);
  
  // Create a group from selected nodes
  const createGroup = useCallback((groupName: string) => {
    if (selectedNodeIds.size === 0) return null;
    
    const newGroup: SelectionGroup = {
      id: `group-${Date.now()}`,
      name: groupName,
      nodeIds: Array.from(selectedNodeIds),
      createdAt: new Date()
    };
    
    setGroups(prev => [...prev, newGroup]);
    return newGroup;
  }, [selectedNodeIds]);
  
  // Ungroup nodes
  const ungroupNodes = useCallback((groupId: string) => {
    setGroups(prev => prev.filter(group => group.id !== groupId));
  }, []);
  
  // Add nodes to existing group
  const addNodesToGroup = useCallback((groupId: string, nodeIds: string[]) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          nodeIds: [...new Set([...group.nodeIds, ...nodeIds])]
        };
      }
      return group;
    }));
  }, []);
  
  // Remove nodes from group
  const removeNodesFromGroup = useCallback((groupId: string, nodeIds: string[]) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          nodeIds: group.nodeIds.filter(id => !nodeIds.includes(id))
        };
      }
      return group;
    }).filter(group => group.nodeIds.length > 0)); // Remove empty groups
  }, []);
  
  // Get nodes in group
  const getNodesInGroup = useCallback((groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.nodeIds : [];
  }, [groups]);
  
  // Start drag selection
  const startDragSelection = useCallback((startX: number, startY: number) => {
    setIsDragging(true);
    setDragStart({ x: startX, y: startY });
  }, []);
  
  // Update drag selection
  const updateDragSelection = useCallback((
    currentX: number, 
    currentY: number, 
    allNodes: Node[]
  ) => {
    if (!isDragging || !dragStart) return;
    
    // Calculate selection box
    const minX = Math.min(dragStart.x, currentX);
    const minY = Math.min(dragStart.y, currentY);
    const maxX = Math.max(dragStart.x, currentX);
    const maxY = Math.max(dragStart.y, currentY);
    
    // Find nodes within selection box
    const nodesInBox = allNodes.filter(node => {
      if (!node.position || !node.width || !node.height) return false;
      
      const nodeLeft = node.position.x;
      const nodeRight = node.position.x + node.width;
      const nodeTop = node.position.y;
      const nodeBottom = node.position.y + node.height;
      
      // Check if node overlaps with selection box
      return !(nodeRight < minX || nodeLeft > maxX || nodeBottom < minY || nodeTop > maxY);
    });
    
    // Update selection
    setSelectedNodeIds(new Set(nodesInBox.map(node => node.id)));
  }, [isDragging, dragStart]);
  
  // End drag selection
  const endDragSelection = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);
  
  return {
    // Selection state
    selectedNodeIds,
    isDragging,
    dragStart,
    
    // Selection methods
    addNodeToSelection,
    removeNodeFromSelection,
    toggleNodeSelection,
    selectMultipleNodes,
    clearSelection,
    isNodeSelected,
    getSelectedNodeCount,
    
    // Grouping methods
    groups,
    createGroup,
    ungroupNodes,
    addNodesToGroup,
    removeNodesFromGroup,
    getNodesInGroup,
    
    // Drag selection methods
    startDragSelection,
    updateDragSelection,
    endDragSelection
  };
};