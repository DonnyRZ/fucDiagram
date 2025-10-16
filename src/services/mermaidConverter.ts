import type { Node, Edge } from '@xyflow/react';
import { Position } from '@xyflow/react';

interface MermaidNode {
  id: string;
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

interface MermaidEdge {
  source: string;
  target: string;
  label?: string;
}

interface ExtendedNodeData {
  label: string;
  nodeType?: string;
}

export class MermaidConverter {
  static mermaidToReactFlow(mermaidCode: string): { nodes: Node[]; edges: Edge[] } {
    // Parse Mermaid code to extract nodes and edges using a hierarchical layout
    const lines = mermaidCode.split('\n');
    const edges: { source: string; target: string }[] = [];
    const nodeMap = new Map<string, ExtendedNodeData>();
    
    // First pass: collect all unique node IDs and their labels with potential BPMN types
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip graph/flowchart declaration
      if (trimmedLine.startsWith('graph') || trimmedLine.startsWith('flowchart')) {
        continue;
      }
      
      // Extract node patterns with special handling for different shapes that might indicate BPMN types
      // Start event: (id) - circle
      // End event: (id) - circle  
      // Task: [id] - rectangle
      // Gateway: {id} - diamond
      const nodeRegex = /([A-Z0-9_]+)(?:\[(.*?)\]|{(.*?)}|\((.*?)\))/gi;
      let nodeMatch;
      while ((nodeMatch = nodeRegex.exec(trimmedLine)) !== null) {
        const nodeId = nodeMatch[1];
        const rectLabel = nodeMatch[2];  // [label] - rectangle, likely a task
        const diamondLabel = nodeMatch[3];  // {label} - diamond, likely a gateway
        const circleLabel = nodeMatch[4];  // (label) - circle, likely an event
        
        let nodeLabel = rectLabel || diamondLabel || circleLabel || nodeId;
        let nodeType: string | undefined;
        
        // Determine node type based on shape
        if (circleLabel !== undefined) {
          nodeType = 'event'; // Use event for circles since it can represent start/end
        } else if (diamondLabel !== undefined) {
          nodeType = 'gateway';
        } else if (rectLabel !== undefined) {
          nodeType = 'task';
        } else {
          nodeType = 'default';
        }
        
        if (!nodeMap.has(nodeId)) {
          nodeMap.set(nodeId, { label: nodeLabel, nodeType });
        }
      }
      
      // Extract edge patterns: source --> target (may include node definitions in the same line)
      const edgeRegex = /([A-Z0-9_]+)(?:\[(.*?)\]|{(.*?)}|\((.*?)\))?\s*(?:--|==>|\.\.>|-\\|>|\.|~|==|<-->|<->)\s*([A-Z0-9_]+)(?:\[(.*?)\]|{(.*?)}|\((.*?)\))?/gi;
      let edgeMatch;
      while ((edgeMatch = edgeRegex.exec(trimmedLine)) !== null) {
        const sourceId = edgeMatch[1];
        const targetId = edgeMatch[5];
        
        // Add source node if not already in map
        if (!nodeMap.has(sourceId)) {
          nodeMap.set(sourceId, { label: sourceId, nodeType: 'default' });
        }
        
        // Add target node if not already in map
        if (!nodeMap.has(targetId)) {
          nodeMap.set(targetId, { label: targetId, nodeType: 'default' });
        }
        
        // Add edge if not already present
        if (!edges.some(e => e.source === sourceId && e.target === targetId)) {
          edges.push({
            source: sourceId,
            target: targetId
          });
        }
      }
    }
    
    // Calculate positions based on the graph structure to create a hierarchical layout
    const positions = this.calculateHierarchicalPositions(edges, Array.from(nodeMap.keys()));
    
    // Create nodes with calculated positions
    const resultNodes: Node[] = [];
    for (const [id, nodeData] of nodeMap) {
      const pos = positions.get(id) || { x: 100, y: 100 }; // fallback position
      resultNodes.push({
        id,
        type: nodeData.nodeType || 'default',
        position: pos,
        data: { label: nodeData.label },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        width: 100,  // Add required width property
        height: 50,  // Add required height property
        measured: undefined,  // Required by newer versions
        selected: false,
        dragging: false,
      });
    }
    
    // Create edges from the collected edge list
    const resultEdges: Edge[] = edges.map(edge => ({
      id: `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      animated: true,
      type: 'smoothstep',
      data: { label: '' }
    }));
    
    // If no nodes were found, create a default start node
    if (resultNodes.length === 0) {
      return {
        nodes: [{
          id: 'start',
          type: 'start',
          position: { x: 100, y: 100 },
          data: { label: 'Start' }
        }],
        edges: []
      };
    }
    
    return { nodes: resultNodes, edges: resultEdges };
  }
  
  private static calculateHierarchicalPositions(edges: { source: string; target: string }[], allNodeIds: string[]): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>();
    
    // Find all nodes with no incoming edges (root/source nodes)
    const allTargets = new Set(edges.map(e => e.target));
    const rootNodes = allNodeIds.filter(id => !allTargets.has(id));
    
    // If no root nodes found (circular or complex graph), just arrange in grid
    if (rootNodes.length === 0) {
      return this.arrangeInGrid(allNodeIds);
    }
    
    // Create a map of outgoing edges for each node
    const outgoingEdges = new Map<string, string[]>();
    for (const edge of edges) {
      if (!outgoingEdges.has(edge.source)) {
        outgoingEdges.set(edge.source, []);
      }
      outgoingEdges.get(edge.source)!.push(edge.target);
    }
    
    // Arrange in a hierarchical layout starting from root nodes
    const processed = new Set<string>();
    const queue = [...rootNodes];
    const levels = new Map<string, number>(); // Track depth level of each node
    
    // BFS to determine levels
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (processed.has(nodeId)) continue;
      
      processed.add(nodeId);
      
      // Get the level (depth) for this node
      let nodeLevel = 0;
      if (!rootNodes.includes(nodeId)) { // Not a root node
        // Find max level of parent nodes
        const incomingEdges = edges.filter(e => e.target === nodeId);
        if (incomingEdges.length > 0) {
          const parentLevels = incomingEdges.map(e => levels.get(e.source)!);
          nodeLevel = Math.max(...parentLevels) + 1;
        }
      }
      levels.set(nodeId, nodeLevel);
      
      // Add children to queue
      const children = outgoingEdges.get(nodeId) || [];
      for (const child of children) {
        if (!processed.has(child)) {
          queue.push(child);
        }
      }
    }
    
    // Group nodes by level and position them
    const nodesByLevel = new Map<number, string[]>();
    for (const [node, level] of levels) {
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)!.push(node);
    }
    
    // Position nodes by level - with wider spacing
    for (const [level, nodesAtLevel] of nodesByLevel) {
      const xStart = 200;
      const xSpacing = 300; // Increased spacing
      const y = 150 + (level * 200); // Increased vertical spacing
      
      nodesAtLevel.forEach((nodeId, index) => {
        const x = xStart + (index * xSpacing);
        positions.set(nodeId, { x, y });
      });
    }
    
    // Position any unprocessed nodes (nodes with no connections)
    for (const nodeId of allNodeIds) {
      if (!positions.has(nodeId)) {
        const unconnectedNodes = allNodeIds.filter(id => !levels.has(id));
        const index = unconnectedNodes.indexOf(nodeId);
        if (index !== -1) {
          const x = 200 + (index % 5) * 300;
          const y = 150 + Math.floor(index / 5) * 200;
          positions.set(nodeId, { x, y });
        }
      }
    }
    
    return positions;
  }
  
  private static arrangeInGrid(nodeIds: string[]): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>();
    const cols = 5;
    const xSpacing = 300; // Increased spacing
    const ySpacing = 200; // Increased spacing
    
    nodeIds.forEach((id, index) => {
      const x = 200 + (index % cols) * xSpacing;
      const y = 150 + Math.floor(index / cols) * ySpacing;
      positions.set(id, { x, y });
    });
    
    return positions;
  }

  static reactFlowToMermaid(nodes: Node[], edges: Edge[]): string {
    // Convert enhanced node types back to Mermaid syntax
    // Tasks use rectangle syntax [label], gateways use diamond {label}, events use circle (label)
    const nodeStatements = nodes.map(node => {
      const label = node.data?.label || node.id;
      switch (node.type) {
        case 'gateway':
          return `${node.id}{${label}}`;
        case 'event':
        case 'start':
        case 'end':
          return `${node.id}(${label})`;
        case 'task':
          return `${node.id}[${label}]`;
        default:
          return `${node.id}[${label}]`; // Default to rectangle
      }
    }).join('\n    ');
    
    const edgeStatements = edges.map(edge => 
      `${edge.source} --> ${edge.target}`
    ).join('\n    ');
    
    return `graph TD\n    ${nodeStatements}\n    ${edgeStatements}`;
  }
}