import React, { useCallback, useState, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ReactFlowProvider,
  Panel,
  NodeProps,
  ReactFlowInstance,
  MiniMap,
  useReactFlow,
  MarkerType,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

import { useApp } from '../../hooks/useApp';
import { MermaidConverter } from '../../services/mermaidConverter';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Default node type for our flow
const defaultNodeTypes = {
  default: ({ data, ...props }: NodeProps) => (
    <div 
      style={{
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-md)',
        boxShadow: 'var(--shadow)',
        minWidth: '120px',
        textAlign: 'center',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-primary)',
      }}
    >
      {data?.label || 'Node'}
    </div>
  ),
};

interface InteractiveFlowEditorProps {
  initialCode: string;
  onElementsChange?: (nodes: Node[], edges: Edge[]) => void;
}

const FlowEditor: React.FC<InteractiveFlowEditorProps> = ({ initialCode, onElementsChange }) => {
  const { currentProject, setCurrentProjectCode } = useApp();
  const { fitView, zoomTo } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Parse initial code and initialize nodes/edges
  React.useEffect(() => {
    if (initialCode) {
      const { nodes: parsedNodes, edges: parsedEdges } = MermaidConverter.mermaidToReactFlow(initialCode);
      setNodes(parsedNodes);
      setEdges(parsedEdges);
      
      // Apply DAGRE layout after a short delay to ensure proper rendering
      setTimeout(() => {
        onApplyLayout('TB'); // Apply vertical layout by default
      }, 100);
      
      if (onElementsChange) {
        onElementsChange(parsedNodes, parsedEdges);
      }
    }
  }, [initialCode, setNodes, setEdges, onElementsChange]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        markerEnd: { type: MarkerType.Arrow },
        animated: true,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onSaveDiagram = () => {
    if (currentProject) {
      const mermaidCode = MermaidConverter.reactFlowToMermaid(nodes, edges);
      setCurrentProjectCode(mermaidCode);
    }
  };

  const onApplyLayout = (direction: 'TB' | 'LR' = 'TB') => {
    if (nodes.length === 0) return;
    
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

    // Set up nodes with fixed dimensions for layout calculation
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 120, height: 40 });
    });

    // Set up edges
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // Perform the layout
    dagre.layout(dagreGraph);

    // Update node positions based on layout
    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        position: {
          x: nodeWithPosition.x - 60, // Adjust for node width
          y: nodeWithPosition.y - 20, // Adjust for node height
        },
      };
    });

    setNodes(layoutedNodes);
    
    // Apply fit view to show all nodes properly after layout
    setTimeout(() => {
      fitView({ padding: 0.4, duration: 400 });
    }, 100);
  };

  const onFitView = useCallback(() => {
    fitView({ padding: 0.4 });
  }, [fitView]);

  const onAddNode = useCallback(() => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: 'default',
      position: { 
        x: reactFlowInstance?.getZoom() ? reactFlowInstance.project({ x: window.innerWidth / 2, y: 200 }).x : 200, 
        y: reactFlowInstance?.getZoom() ? reactFlowInstance.project({ x: window.innerWidth / 2, y: 200 }).y : 200 
      },
      data: { label: 'New Node' },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
    
    setNodes((nds) => nds.concat(newNode));
    if (onElementsChange) {
      onElementsChange([...nodes, newNode], edges);
    }
  }, [setNodes, nodes, edges, onElementsChange, reactFlowInstance]);

  return (
    <div 
      className="w-full h-full" 
      style={{ 
        height: '100%', 
        width: '100%', 
        display: 'flex',
        backgroundColor: 'var(--color-background)',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        nodeTypes={defaultNodeTypes}
        attributionPosition="bottom-left"
        fitView
        fitViewOptions={{ padding: 0.4 }}
        minZoom={0.1}
        maxZoom={1.5}
        panOnScroll
        zoomOnPinch
        panOnScrollMode="free"
        selectionOnDrag
        edgeUpdaterRadius={30}
        selectNodesOnDrag={false}
        style={{
          borderRadius: 'var(--border-radius-lg)',
        }}
      >
        <Background variant="dots" gap={12} size={1} />
        <Controls 
          showInteractive={false} 
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-md)',
            boxShadow: 'var(--shadow-md)',
            backdropFilter: 'blur(10px)',
          }}
        />
        <MiniMap 
          nodeColor={(node) => {
            if (node.selected) return 'var(--color-primary)';
            return '#d9d9d9';
          }} 
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-md)',
            boxShadow: 'var(--shadow-md)',
            backdropFilter: 'blur(10px)',
          }}
        />
        
        {/* Top-right panel with layout and view controls */}
        <Panel 
          position="top-right" 
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-md)',
            padding: 'var(--spacing-md)',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <button 
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius-sm)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                boxShadow: 'var(--shadow)',
                minWidth: '120px',
              }}
              onClick={onAddNode}
              title="Add new node"
            >
              Add Node
            </button>
            <div 
              style={{
                display: 'flex',
                gap: 'var(--spacing-xs)',
                background: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-sm)',
                padding: 'var(--spacing-xs)',
              }}
            >
              <button 
                style={{
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  fontSize: 'var(--font-size-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-secondary)',
                }}
                onClick={() => onApplyLayout('TB')}
                title="Apply vertical layout"
              >
                Vertical
              </button>
              <button 
                style={{
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  fontSize: 'var(--font-size-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-secondary)',
                }}
                onClick={() => onApplyLayout('LR')}
                title="Apply horizontal layout"
              >
                Horizontal
              </button>
            </div>
            <button 
              style={{
                backgroundColor: 'var(--color-primary-dark)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius-sm)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                boxShadow: 'var(--shadow)',
                minWidth: '120px',
              }}
              onClick={onFitView}
              title="Fit all nodes in view"
            >
              Fit View
            </button>
          </div>
        </Panel>
        
        {/* Bottom-right panel with additional controls */}
        <Panel 
          position="bottom-right" 
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-md)',
            padding: 'var(--spacing-md)',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <button 
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius-sm)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                boxShadow: 'var(--shadow)',
                minWidth: '160px',
              }}
              onClick={onSaveDiagram}
              title="Update Mermaid code from current flow"
            >
              Update Mermaid Code
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

const InteractiveFlowEditor: React.FC<InteractiveFlowEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <FlowEditor {...props} />
    </ReactFlowProvider>
  );
};

export default InteractiveFlowEditor;