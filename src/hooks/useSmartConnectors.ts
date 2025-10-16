import { useCallback } from 'react';
import { Edge, MarkerType } from '@xyflow/react';
import Elk, { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';

const elk = new Elk({
  defaultLayoutOptions: {
    'elk.algorithm': 'layered',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.nodeNode': '80',
    'elk.direction': 'DOWN',
    'elk.edgeRouting': 'ORTHOGONAL'
  }
});

export const useSmartConnectors = () => {
  // Create smart connector with automatic routing
  const createSmartConnector = useCallback((
    sourceNodeId: string,
    targetNodeId: string,
    edges: Edge[],
    connectorType: 'straight' | 'orthogonal' | 'curved' = 'orthogonal'
  ) => {
    const newEdge: Edge = {
      id: `edge-${sourceNodeId}-${targetNodeId}-${Date.now()}`,
      source: sourceNodeId,
      target: targetNodeId,
      type: connectorType === 'orthogonal' ? 'elk' : connectorType === 'curved' ? 'smoothstep' : 'default',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 12,
        height: 12
      },
      data: {
        label: '',
        type: connectorType
      },
      zIndex: 0 // Behind nodes
    };
    
    return [...edges, newEdge];
  }, []);
  
  // Auto-route all connectors to avoid overlapping nodes
  const autoRouteConnectors = useCallback(async (
    nodes: any[],
    edges: Edge[]
  ) => {
    try {
      // Create ELK graph structure
      const graph: ElkNode = {
        id: 'root',
        layoutOptions: {
          'elk.algorithm': 'layered',
          'elk.layered.spacing.nodeNodeBetweenLayers': '100',
          'elk.spacing.nodeNode': '80',
          'elk.direction': 'DOWN'
        },
        children: nodes.map(node => ({
          id: node.id,
          width: node.width || 100,
          height: node.height || 50,
          x: node.position?.x || 0,
          y: node.position?.y || 0
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          sources: [edge.source],
          targets: [edge.target]
        }))
      };
      
      // Perform layout calculation
      const layoutedGraph = await elk.layout(graph);
      
      // Update node positions based on layout
      const layoutedNodes = nodes.map(node => {
        const layoutedNode = layoutedGraph.children?.find(child => child.id === node.id);
        if (layoutedNode && layoutedNode.x !== undefined && layoutedNode.y !== undefined) {
          return {
            ...node,
            position: {
              x: layoutedNode.x,
              y: layoutedNode.y
            }
          };
        }
        return node;
      });
      
      return { nodes: layoutedNodes, edges };
    } catch (error) {
      console.error('Error auto-routing connectors:', error);
      return { nodes, edges };
    }
  }, []);
  
  // Update connector type
  const updateConnectorType = useCallback((
    edgeId: string,
    newType: 'straight' | 'orthogonal' | 'curved',
    edges: Edge[]
  ) => {
    return edges.map(edge => 
      edge.id === edgeId
        ? {
            ...edge,
            type: newType === 'orthogonal' ? 'elk' : newType === 'curved' ? 'smoothstep' : 'default',
            data: {
              ...edge.data,
              type: newType
            }
          }
        : edge
    );
  }, []);
  
  // Add label to connector
  const addConnectorLabel = useCallback((
    edgeId: string,
    label: string,
    edges: Edge[]
  ) => {
    return edges.map(edge => 
      edge.id === edgeId
        ? {
            ...edge,
            data: {
              ...edge.data,
              label
            }
          }
        : edge
    );
  }, []);
  
  // Remove connector
  const removeConnector = useCallback((
    edgeId: string,
    edges: Edge[]
  ) => {
    return edges.filter(edge => edge.id !== edgeId);
  }, []);
  
  // Reverse connector direction
  const reverseConnector = useCallback((
    edgeId: string,
    edges: Edge[]
  ) => {
    return edges.map(edge => 
      edge.id === edgeId
        ? {
            ...edge,
            source: edge.target,
            target: edge.source
          }
        : edge
    );
  }, []);
  
  return {
    createSmartConnector,
    autoRouteConnectors,
    updateConnectorType,
    addConnectorLabel,
    removeConnector,
    reverseConnector
  };
};