import React, { useCallback, useState, useRef, useEffect } from 'react';
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
import PropertiesPanel from '../ui/PropertiesPanel';
import ShapeLibrarySidebar from '../ui/ShapeLibrarySidebar';
import ResizableNode from './ResizableNode';
import AlignmentGuides from './AlignmentGuides';
import MultiSelectionBox from './MultiSelectionBox';
import { ProcessValidation } from '../../services/processValidation';
import { useAlignmentGuides } from '../../hooks/useAlignmentGuides';
import { useMultiSelection } from '../../hooks/useMultiSelection';
import { useLayerManagement } from '../../hooks/useLayerManagement';
import { useSmartConnectors } from '../../hooks/useSmartConnectors';
import { useCustomShapes } from '../../hooks/useCustomShapes';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Enhanced node types with BPMN-inspired elements
const StartNode = ({ data }: NodeProps<{ label: string }>) => {
  const label = data?.label || 'Start';
  return (
    <div 
      className="bpmn-node start-node"
      style={{
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-background)',
        border: '2px solid var(--color-success)',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow)',
        textAlign: 'center',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-primary)',
        minWidth: '60px',
        minHeight: '60px',
      }}
    >
      <div style={{ fontSize: '24px' }}>●</div>
    </div>
  );
};

const EndNode = ({ data }: NodeProps<{ label: string }>) => {
  const label = data?.label || 'End';
  return (
    <div 
      className="bpmn-node end-node"
      style={{
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-background)',
        border: '2px solid var(--color-error)',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow)',
        textAlign: 'center',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-primary)',
        minWidth: '60px',
        minHeight: '60px',
      }}
    >
      <div style={{ fontSize: '24px' }}>●</div>
    </div>
  );
};

const TaskNode = ({ data }: NodeProps<{ label: string }>) => {
  const label = data?.label || 'Task';
  return (
    <div 
      className="bpmn-node task-node"
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
      {label}
    </div>
  );
};

const GatewayNode = ({ data }: NodeProps<{ label: string }>) => {
  const label = data?.label || 'Gateway';
  return (
    <div 
      className="bpmn-node gateway-node"
      style={{
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-surface)',
        border: '2px solid var(--color-primary)',
        borderRadius: 'var(--border-radius-md)',
        boxShadow: 'var(--shadow)',
        minWidth: '80px',
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-primary)',
        transform: 'rotate(45deg)',
      }}
    >
      <div style={{ transform: 'rotate(-45deg)' }}>◇</div>
    </div>
  );
};

const EventNode = ({ data }: NodeProps<{ label: string }>) => {
  const label = data?.label || 'Event';
  return (
    <div 
      className="bpmn-node event-node"
      style={{
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-background)',
        border: '2px solid var(--color-warning)',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow)',
        textAlign: 'center',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-primary)',
        minWidth: '60px',
        minHeight: '60px',
      }}
    >
      <div style={{ fontSize: '20px' }}>○</div>
    </div>
  );
};

const DefaultNode = ({ data }: NodeProps<{ label: string }>) => {
  const label = data?.label || 'Node';
  return (
    <div 
      className="bpmn-node default-node"
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
      {label}
    </div>
  );
};

// Enhanced node types for BPMN modeling
const enhancedNodeTypes = {
  start: StartNode,
  end: EndNode,
  task: TaskNode,
  gateway: GatewayNode,
  event: EventNode,
  default: DefaultNode,
  resizable: ResizableNode,
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
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

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
      
      // Validate the imported process
      validateProcess(parsedNodes, parsedEdges);
    }
  }, [initialCode, setNodes, setEdges, onElementsChange]);

  // Validate the process on changes
  const validateProcess = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    const validation = ProcessValidation.validateProcess(currentNodes, currentEdges);
    setValidationErrors(validation.errors);
    setValidationWarnings(validation.warnings);
    
    return validation;
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      // Validate connection before adding
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      if (sourceNode && targetNode) {
        const validation = ProcessValidation.validateConnection(
          sourceNode.type || 'default', 
          targetNode.type || 'default'
        );
        
        if (!validation.isValid) {
          alert(`Connection not allowed: ${validation.errors.join(', ')}`);
          return;
        }
      }
      
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10 },
        animated: true,
        type: 'smoothstep',
        data: { label: '' },
        sourceHandle: null,
        targetHandle: null
      };
      setEdges((eds) => addEdge(newEdge, eds));
      
      // Re-validate the process after connection
      setTimeout(() => validateProcess(nodes, [...edges, newEdge]), 0);
    },
    [setEdges, nodes, edges, validateProcess]
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

  // Handle node selection
  const handleNodeSelect = useCallback((node: Node) => {
    setSelectedNode(node);
  }, []);

  const onAddNode = useCallback((nodeType: 'start' | 'end' | 'task' | 'gateway' | 'event' | 'default' = 'default') => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: nodeType,
      position: { 
        x: 200, 
        y: 200 
      },
      data: { 
        label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1) 
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
    
    setNodes((nds) => nds.concat(newNode));
    if (onElementsChange) {
      onElementsChange([...nodes, newNode], edges);
    }
    
    // Validate the process after adding new node
    setTimeout(() => validateProcess([...nodes, newNode], edges), 0);
  }, [setNodes, nodes, edges, onElementsChange, validateProcess]);

  // Handle node changes from properties panel
  const handleNodeChange = useCallback((node: Node) => {
    setNodes((nds) => 
      nds.map(n => (n.id === node.id ? node : n))
    );
    
    // Update selected node state
    if (selectedNode && selectedNode.id === node.id) {
      setSelectedNode(node);
    }
    
    if (onElementsChange) {
      onElementsChange(nodes.map(n => (n.id === node.id ? node : n)), edges);
    }
    
    // Re-validate after node change
    setTimeout(() => validateProcess(nodes.map(n => (n.id === node.id ? node : n)), edges), 0);
  }, [setNodes, nodes, edges, onElementsChange, selectedNode, validateProcess]);

  // Handle drag over event for dropping shapes onto canvas
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop event for shapes dropped onto canvas
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      
      // Get the React Flow instance
      if (!reactFlowInstance) return;
      
      // Get the position where the shape was dropped
      const position = reactFlowInstance.project({
        x: event.clientX,
        y: event.clientY,
      });
      
      // Get the shape data from the drag event
      const shapeData = event.dataTransfer.getData('application/reactflow');
      if (!shapeData) return;
      
      try {
        const shape = JSON.parse(shapeData);
        
        // Create a new node based on the dropped shape
        const newNode: Node = {
          id: `node_${Date.now()}`,
          type: shape.type,
          position,
          data: { 
            label: shape.label || 'New Node' 
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          width: 100,
          height: 50,
        };
        
        setNodes((nds) => nds.concat(newNode));
        
        if (onElementsChange) {
          onElementsChange([...nodes, newNode], edges);
        }
      } catch (error) {
        console.error('Error parsing dropped shape data:', error);
      }
    },
    [reactFlowInstance, setNodes, nodes, edges, onElementsChange]
  );

  // Update node selection handler to work with React Flow
  const handleNodeSelectionChange = useCallback((e: any) => {
    const selectedNodes = e.nodes;
    if (selectedNodes.length > 0) {
      setSelectedNode(selectedNodes[0]);
    } else {
      setSelectedNode(null);
    }
  }, []);

  return (
    <div 
      className="w-full h-full" 
      style={{ 
        height: '100%', 
        width: '100%', 
        display: 'flex',
        backgroundColor: 'var(--color-background)',
        position: 'relative',
      }}
    >
      {/* Shape Library Sidebar */}
      <ShapeLibrarySidebar />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onNodeClick={(e, node) => setSelectedNode(node)}
        onSelectionChange={handleNodeSelectionChange}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        nodeTypes={enhancedNodeTypes}
        fitView
        fitZoom={(zoom: number) => zoom}
        minZoom={0.1}
        maxZoom={1.5}
        panOnScroll
        zoomOnScroll
        panOnDrag
        selectionOnDrag
        edgeUpdaterRadius={20}
        defaultEdgeOptions={{ 
          type: 'smoothstep', 
          markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10 },
          animated: true
        }}
        style={{
          borderRadius: 'var(--border-radius-lg)',
          width: '100%',
          height: '100%',
          marginLeft: '250px', // Account for shape library sidebar
        }}
      >
        <Background 
          gap={12} 
          size={1} 
        />
        <Controls 
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
        
        {/* Alignment Guides */}
        <AlignmentGuides 
          guides={[]} // Will be populated with actual guides
          canvasWidth={window.innerWidth}
          canvasHeight={window.innerHeight}
        />
        
        {/* Multi-Selection Box */}
        <MultiSelectionBox 
          startX={0}
          startY={0}
          endX={0}
          endY={0}
          isVisible={false}
        />
        
        {/* Top-right panel with layout and view controls */}
        <Controls 
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
            <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
              <button 
                style={{
                  backgroundColor: 'var(--color-success)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  boxShadow: 'var(--shadow)',
                  flex: 1,
                }}
                onClick={() => onAddNode('start')}
                title="Add start event"
              >
                Start
              </button>
              <button 
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  boxShadow: 'var(--shadow)',
                  flex: 1,
                }}
                onClick={() => onAddNode('task')}
                title="Add task"
              >
                Task
              </button>
              <button 
                style={{
                  backgroundColor: 'var(--color-primary-dark)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  boxShadow: 'var(--shadow)',
                  flex: 1,
                }}
                onClick={() => onAddNode('gateway')}
                title="Add gateway"
              >
                Gateway
              </button>
            </div>
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
            
            {/* Validation status indicator */}
            <div style={{ 
              padding: 'var(--spacing-xs)',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: validationErrors.length > 0 ? 'var(--color-error-light)' : 
                              validationWarnings.length > 0 ? 'var(--color-warning-light)' : 'var(--color-success-light)',
              border: `1px solid ${validationErrors.length > 0 ? 'var(--color-error)' : 
                       validationWarnings.length > 0 ? 'var(--color-warning)' : 'var(--color-success)'}`,
            }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                {validationErrors.length > 0 ? `Errors: ${validationErrors.length}` : 
                 validationWarnings.length > 0 ? `Warnings: ${validationWarnings.length}` : 'Valid'}
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
      
      {/* Properties Panel - Conditionally rendered when a node is selected */}
      {selectedNode && (
        <PropertiesPanel 
          selectedNode={selectedNode} 
          onNodeChange={handleNodeChange}
          onClose={() => setSelectedNode(null)}
        />
      )}
      
      {/* Validation messages panel */}
      {(validationErrors.length > 0 || validationWarnings.length > 0) && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          width: '300px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 99,
          padding: 'var(--spacing-md)',
        }}>
          <h4 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: 'var(--font-size-base)' }}>
            Process Validation
          </h4>
          {validationErrors.length > 0 && (
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <div style={{ color: 'var(--color-error)', fontWeight: 'var(--font-weight-semibold)' }}>
                Errors ({validationErrors.length}):
              </div>
              <ul style={{ margin: 0, paddingLeft: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>
                {validationErrors.map((error, idx) => (
                  <li key={idx} style={{ color: 'var(--color-error)' }}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {validationWarnings.length > 0 && (
            <div>
              <div style={{ color: 'var(--color-warning)', fontWeight: 'var(--font-weight-semibold)' }}>
                Warnings ({validationWarnings.length}):
              </div>
              <ul style={{ margin: 0, paddingLeft: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>
                {validationWarnings.map((warning, idx) => (
                  <li key={idx} style={{ color: 'var(--color-warning)' }}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
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