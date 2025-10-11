import React, { useCallback, useState } from 'react';
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
  ReactFlowInstance
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useApp } from '../../hooks/useApp';
import { MermaidConverter } from '../../services/mermaidConverter';

// Default node type for our flow
const defaultNodeTypes = {
  default: ({ data, ...props }: NodeProps) => (
    <div className="px-4 py-2 text-sm bg-white border border-gray-300 rounded shadow-sm">
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
  const [isContainerReady, setIsContainerReady] = useState(false);
  
  // Parse initial code and use as initial state
  const initialElements = React.useMemo(() => {
    if (initialCode) {
      return MermaidConverter.mermaidToReactFlow(initialCode);
    }
    return { nodes: [], edges: [] };
  }, [initialCode]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialElements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialElements.edges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Check if container is properly sized
  React.useEffect(() => {
    // Check if the parent container has proper dimensions after a brief moment
    const timer = setTimeout(() => {
      const container = document.querySelector('.react-flow');
      if (container) {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setIsContainerReady(true);
        } else {
          // Retry if dimensions are still 0
          setTimeout(() => {
            const retryRect = container.getBoundingClientRect();
            if (retryRect.width > 0 && retryRect.height > 0) {
              setIsContainerReady(true);
            }
          }, 100);
        }
      } else {
        // The ReactFlow component hasn't mounted yet, so we'll check again after render
        setTimeout(() => {
          const retryContainer = document.querySelector('.react-flow');
          if (retryContainer) {
            const retryRect = retryContainer.getBoundingClientRect();
            if (retryRect.width > 0 && retryRect.height > 0) {
              setIsContainerReady(true);
            }
          }
        }, 100);
      }
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  // Update nodes/edges when initialCode changes
  React.useEffect(() => {
    if (initialCode) {
      const { nodes: newNodes, edges: newEdges } = MermaidConverter.mermaidToReactFlow(initialCode);
      setNodes(newNodes);
      setEdges(newEdges);
      if (onElementsChange) {
        onElementsChange(newNodes, newEdges);
      }
    }
  }, [initialCode, setNodes, setEdges, onElementsChange]);

  // Fit view when nodes change and ReactFlow instance is available
  React.useEffect(() => {
    if (reactFlowInstance && nodes.length > 0) {
      // Use a short delay to ensure the nodes are rendered before fitting
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.5 });
      }, 100); // Slightly longer delay
    }
  }, [nodes, reactFlowInstance]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onSaveDiagram = () => {
    if (currentProject) {
      const mermaidCode = MermaidConverter.reactFlowToMermaid(nodes, edges);
      setCurrentProjectCode(mermaidCode);
    }
  };

  const onLayout = useCallback(() => {
    // Simple layout algorithm to organize nodes
    setNodes(prevNodes => {
      const updatedNodes = [...prevNodes];
      updatedNodes.forEach((node, index) => {
        node.position = { x: 100 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 150 };
      });
      if (onElementsChange) {
        onElementsChange(updatedNodes, edges);
      }
      return updatedNodes;
    });
  }, [setNodes, edges, onElementsChange]);

  const onAddNode = useCallback(() => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: 'New Node' },
    };
    setNodes((nds) => nds.concat(newNode));
    if (onElementsChange) {
      onElementsChange([...nodes, newNode], edges);
    }
  }, [setNodes, nodes, edges, onElementsChange]);

  return (
    <div className="w-full h-full" style={{ height: '100%', width: '100%', display: 'flex', minHeight: '500px' }}>
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
        fitViewOptions={{ padding: 0.5 }}
      >
        <Background variant="dots" gap={12} size={1} />
        <Controls />
        
        <Panel position="top-right">
          <div className="flex flex-col gap-2">
            <button 
              className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={onAddNode}
            >
              Add Node
            </button>
            <button 
              className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              onClick={onLayout}
            >
              Layout
            </button>
            <button 
              className="px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
              onClick={onSaveDiagram}
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