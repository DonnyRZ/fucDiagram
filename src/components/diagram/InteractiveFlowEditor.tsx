import React, { useCallback, useState, useEffect } from 'react';
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
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

import { useApp } from '../../hooks/useApp';
import { DiagramModel, DiagramNode, DiagramEdge } from '../../types/diagramModel';
import { UnifiedMermaidConverter } from '../../services/UnifiedMermaidConverter';
import PropertiesPanel from '../ui/PropertiesPanel';
import ShapeLibrarySidebar from '../ui/ShapeLibrarySidebar';
import AlignmentGuides from './AlignmentGuides';
import MultiSelectionBox from './MultiSelectionBox';
import { ProcessValidation } from '../../services/processValidation';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

type VisualNodeData = {
  label?: string;
  style?: React.CSSProperties;
  classes?: string[];
};

const buildClassName = (base: string, data?: VisualNodeData) => {
  const extra = Array.isArray(data?.classes) ? data.classes!.join(' ') : '';
  return `${base} ${extra}`.trim();
};

const mergeNodeStyles = (base: React.CSSProperties, data?: VisualNodeData): React.CSSProperties => {
  const overrides = (data?.style as React.CSSProperties) || {};
  const background = (overrides.background ?? overrides.backgroundColor) as string | undefined;
  const merged: React.CSSProperties = {
    ...base,
  };
  if (background) {
    merged.background = background;
    merged.backgroundColor = background;
  }
  if (overrides.border) {
    merged.border = overrides.border as string;
  }
  if (overrides.color) {
    merged.color = overrides.color as string;
  }
  return {
    ...merged,
    ...overrides,
  };
};

const StartNode = ({ data }: NodeProps) => {
  const nodeData = (data as VisualNodeData) || {};
  const label = nodeData.label || 'Start';
  const nodeStyle = mergeNodeStyles(
    {
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
    },
    nodeData,
  );
  return (
    <div className={buildClassName('bpmn-node start-node', nodeData)} style={nodeStyle}>
      <div>{label}</div>
    </div>
  );
};

const EndNode = ({ data }: NodeProps) => {
  const nodeData = (data as VisualNodeData) || {};
  const label = nodeData.label || 'End';
  const nodeStyle = mergeNodeStyles(
    {
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
    },
    nodeData,
  );
  return (
    <div className={buildClassName('bpmn-node end-node', nodeData)} style={nodeStyle}>
      <div>{label}</div>
    </div>
  );
};

const TaskNode = ({ data }: NodeProps) => {
  const nodeData = (data as VisualNodeData) || {};
  const label = nodeData.label || 'Task';
  const nodeStyle = mergeNodeStyles(
    {
      padding: 'var(--spacing-md)',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--border-radius-md)',
      boxShadow: 'var(--shadow)',
      minWidth: '120px',
      textAlign: 'center',
      fontSize: 'var(--font-size-sm)',
      color: 'var(--color-text-primary)',
    },
    nodeData,
  );
  return (
    <div className={buildClassName('bpmn-node task-node', nodeData)} style={nodeStyle}>
      {label}
    </div>
  );
};

const GatewayNode = ({ data }: NodeProps) => {
  const nodeData = (data as VisualNodeData) || {};
  const label = nodeData.label || 'Gateway';
  const nodeStyle = mergeNodeStyles(
    {
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
    },
    nodeData,
  );
  return (
    <div className={buildClassName('bpmn-node gateway-node', nodeData)} style={nodeStyle}>
      <div style={{ transform: 'rotate(-45deg)' }}>{label}</div>
    </div>
  );
};

const EventNode = ({ data }: NodeProps) => {
  const nodeData = (data as VisualNodeData) || {};
  const label = nodeData.label || 'Event';
  const nodeStyle = mergeNodeStyles(
    {
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
    },
    nodeData,
  );
  return (
    <div className={buildClassName('bpmn-node event-node', nodeData)} style={nodeStyle}>
      <div>{label}</div>
    </div>
  );
};

const DefaultNode = ({ data }: NodeProps) => {
  const nodeData = (data as VisualNodeData) || {};
  const label = nodeData.label || 'Node';
  const nodeStyle = mergeNodeStyles(
    {
      padding: 'var(--spacing-md)',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--border-radius-md)',
      boxShadow: 'var(--shadow)',
      minWidth: '120px',
      textAlign: 'center',
      fontSize: 'var(--font-size-sm)',
      color: 'var(--color-text-primary)',
    },
    nodeData,
  );
  return (
    <div className={buildClassName('bpmn-node default-node', nodeData)} style={nodeStyle}>
      {label}
    </div>
  );
};

const GroupNode = ({ data }: NodeProps) => {
  const nodeData = (data as VisualNodeData) || {};
  const label = nodeData.label || '';
  const mergedStyle = mergeNodeStyles(
    {
      width: '100%',
      height: '100%',
      border: '1px dashed rgba(148, 163, 184, 0.8)',
      background: 'rgba(148, 163, 184, 0.12)',
      borderRadius: '16px',
      pointerEvents: 'none',
      position: 'relative',
    },
    nodeData,
  );
  return (
    <div className={buildClassName('diagram-group-node', nodeData)} style={mergedStyle}>
      {label && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 12,
            fontWeight: 600,
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary-theme)',
            pointerEvents: 'auto',
          }}
        >
          {label}
        </div>
      )}
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
  group: GroupNode,
};

interface InteractiveFlowEditorProps {
  model: DiagramModel;
  setModel: (model: DiagramModel) => void;
  engineMethods: any;
}

// Convert DiagramModel nodes to React Flow format
const convertModelNodesToReactFlow = (model: DiagramModel): Node[] => {
  const groupNodes: Node[] = (model.groups || []).map(group => {
    const classes = group.metadata?.classList ?? [];
    const width = group.width ?? group.metadata?.layout?.width ?? 320;
    const height = group.height ?? group.metadata?.layout?.height ?? 240;
    const borderWidth = typeof group.style?.borderWidth === 'number'
      ? `${group.style?.borderWidth}px`
      : group.style?.borderWidth;
    const borderColor = group.style?.borderColor;
    return {
      id: group.id,
      type: 'group',
      position: {
        x: group.x ?? group.metadata?.layout?.x ?? 0,
        y: group.y ?? group.metadata?.layout?.y ?? 0,
      },
      data: {
        label: group.name,
        style: {
          pointerEvents: 'none',
          background: group.style?.backgroundColor,
          backgroundColor: group.style?.backgroundColor,
          border: borderColor
            ? `${borderWidth ?? 1}px solid ${borderColor}`
            : undefined,
          color: group.style?.color,
        },
        classes,
      },
      width,
      height,
      draggable: false,
      selectable: false,
      focusable: false,
      zIndex: -100,
      className: classes.join(' '),
    } as Node;
  });

  const childNodes: Node[] = model.nodes.map(node => {
    const classes = Array.isArray(node.metadata?.classList) ? node.metadata!.classList : [];
    return {
      id: node.id,
      type: node.type || 'default',
      position: { x: node.x, y: node.y },
      data: {
        ...node.properties,
        label: node.label,
        style: node.style,
        classes,
      },
      width: node.width,
      height: node.height,
      measured: undefined,
      selected: false,
      dragging: false,
      className: classes.join(' '),
      zIndex: node.zIndex,
    } as Node;
  });

  return [...groupNodes, ...childNodes];
};

// Convert DiagramModel edges to React Flow format
const convertModelEdgesToReactFlow = (modelEdges: DiagramEdge[]): Edge[] => {
  return modelEdges.map(edge => {
    const edgeStyle = edge.style ? (edge.style as React.CSSProperties) : undefined;
    const classes = edge.metadata?.classList ?? [];
    return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: edge.properties?.animated ?? false,
    type: edge.type === 'default' ? 'smoothstep' : edge.type,
    markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: edgeStyle?.stroke as string | undefined },
    label: edge.label,
    style: edgeStyle,
    data: {
      ...edge.properties,
      label: edge.label,
      classes,
    },
    className: classes.join(' '),
  } as Edge;
  });
};

const FlowEditor: React.FC<InteractiveFlowEditorProps> = ({ model, setModel, engineMethods }) => {
  const { currentProject, setCurrentProjectCode } = useApp();
  const { fitView, zoomTo, screenToFlowPosition } = useReactFlow();
  
  // Convert model nodes and edges to React Flow format
  const initialReactFlowNodes = convertModelNodesToReactFlow(model);
  const initialReactFlowEdges = convertModelEdgesToReactFlow(model.edges);
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialReactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialReactFlowEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  // Sync React Flow nodes/edges when model changes externally
  useEffect(() => {
    // Convert updated model to React Flow format
    const updatedReactFlowNodes = convertModelNodesToReactFlow(model);
    const updatedReactFlowEdges = convertModelEdgesToReactFlow(model.edges);
    
    // Update React Flow state
    setNodes(updatedReactFlowNodes);
    setEdges(updatedReactFlowEdges);
  }, [model, setNodes, setEdges]);

  // Sync changes from React Flow back to unified model
  useEffect(() => {
    // Update nodes in the unified model when React Flow nodes change
    const updatedModel = { ...model };
    
    // Update nodes in the model with data from React Flow WHILE preserving rich metadata
    updatedModel.nodes = updatedModel.nodes.map(modelNode => {
      const flowNode = nodes.find(fn => fn.id === modelNode.id);
      if (flowNode) {
        return {
          ...modelNode,  // Preserve ALL original properties including rich metadata
          x: flowNode.position.x,  // Update only position
          y: flowNode.position.y,
          width: flowNode.width || modelNode.width,  // Update only dimensions
          height: flowNode.height || modelNode.height,
          properties: { 
            ...modelNode.properties,  // Preserve ALL original properties
            ...flowNode.data  // Add/update with React Flow data
          }
          // NOTE: We're NOT overwriting the metadata which contains the rich information
        };
      }
      return modelNode;
    });
    
    setModel(updatedModel);
  }, [nodes, setModel, model]);

  useEffect(() => {
    // Update edges in the unified model when React Flow edges change
    const updatedModel = { ...model };
    
    // Update edges in the model with data from React Flow WHILE preserving rich metadata
    updatedModel.edges = updatedModel.edges.map(modelEdge => {
      const flowEdge = edges.find(fe => fe.id === modelEdge.id);
      if (flowEdge) {
        return {
          ...modelEdge,  // Preserve ALL original properties including rich metadata
          properties: { 
            ...modelEdge.properties,  // Preserve ALL original properties
            ...flowEdge.data  // Add/update with React Flow data
          }
          // NOTE: We're NOT overwriting the metadata which contains the rich information
        };
      }
      return modelEdge;
    });
    
    setModel(updatedModel);
  }, [edges, setModel, model]);

  // Validate the process on changes
  const validateProcess = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    const validation = ProcessValidation.validateProcess(currentNodes, currentEdges);
    setValidationErrors(validation.errors);
    setValidationWarnings(validation.warnings);
    
    return validation;
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      // Add edge to unified model via engine methods
      const newEdge: DiagramEdge = {
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        source: params.source,
        target: params.target,
        label: '',
        type: 'default',
        properties: {},
        metadata: {}
      };
      
      engineMethods.addEdge(newEdge);
      
      // React Flow will handle the visual update
      const newEdgeReactFlow: Edge = {
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        source: params.source,
        target: params.target,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10 },
        data: { label: '' }
      };
      
      setEdges((eds) => addEdge(newEdgeReactFlow, eds));
    },
    [setEdges, engineMethods]
  );

  const onSaveDiagram = () => {
    if (currentProject) {
      const mermaidCode = UnifiedMermaidConverter.modelToMermaid(model);
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
    const newNode: DiagramNode = {
      id: `node_${Date.now()}`,
      label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
      type: nodeType,
      x: 200,
      y: 200,
      width: 100,
      height: 50,
      style: {},
      properties: {},
      metadata: {}
    };
    
    // Add to unified model via engine
    engineMethods.addNode(newNode);
  }, [engineMethods]);

  // Handle node changes from properties panel
  const handleNodeChange = useCallback((node: Node) => {
    setNodes((nds) => 
      nds.map(n => (n.id === node.id ? node : n))
    );
    
    // Update selected node state
    if (selectedNode && selectedNode.id === node.id) {
      setSelectedNode(node);
    }
    
    // Update model via engine WHILE preserving ALL rich metadata
    if (selectedNode) {
      // Find the original node in the model to preserve its metadata
      const originalModelNode = model.nodes.find(n => n.id === selectedNode.id);
      
      // Create updated node with preserved metadata
      const updatedNode: DiagramNode = {
        ...originalModelNode!, // Preserve ALL original properties including rich metadata
        x: node.position.x,    // Update only position
        y: node.position.y,
        label: node.data?.label || node.id,  // Update label
        width: node.width || originalModelNode!.width,  // Update dimensions
        height: node.height || originalModelNode!.height,
        properties: { 
          ...originalModelNode!.properties, // Preserve ALL original properties
          ...node.data  // Add/update with React Flow data
        }
        // NOTE: We're NOT overwriting the metadata which contains the rich information
      };
      
      engineMethods.updateNode(selectedNode.id, updatedNode);
    }
  }, [setNodes, selectedNode, engineMethods, model.nodes]);

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
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      // Get the shape data from the drag event
      const shapeData = event.dataTransfer.getData('application/reactflow');
      if (!shapeData) return;
      
      try {
        const shape = JSON.parse(shapeData);
        
        // Create a new node based on the dropped shape
        const newNode: DiagramNode = {
          id: `node_${Date.now()}`,
          type: shape.type,
          label: shape.label || 'New Node',
          x: position.x,
          y: position.y,
          width: 100,
          height: 50,
          style: {},
          properties: {},
          metadata: {}
        };
        
        engineMethods.addNode(newNode);
      } catch (error) {
        console.error('Error parsing dropped shape data:', error);
      }
    },
    [reactFlowInstance, screenToFlowPosition, engineMethods]
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
        minZoom={0.1}
        maxZoom={1.5}
        panOnScroll
        zoomOnScroll
        panOnDrag
        selectionOnDrag
        connectionRadius={20}
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
