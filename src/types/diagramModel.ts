export interface DiagramNode {
  id: string;
  label: string;
  type: 'start' | 'end' | 'task' | 'gateway' | 'event' | 'default' | string; // Support custom types
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
  style?: {
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    borderRadius?: number;
    borderWidth?: number;
  };
  properties?: Record<string, any>; // For custom properties
  metadata?: {
    originalMermaidSyntax?: string; // Original node syntax from Mermaid code
    subgraphId?: string; // ID of subgraph this node belongs to
    classList?: string[]; // Classes assigned to this node
    comments?: string[]; // Comments associated with this node
    [key: string]: any; // Additional metadata
  };
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: 'default' | 'arrow' | 'dashed' | 'dotted' | 'solid' | string;
  style?: {
    color?: string;
    strokeWidth?: number;
    lineStyle?: 'solid' | 'dashed' | 'dotted';
  };
  properties?: Record<string, any>;
  metadata?: {
    originalMermaidSyntax?: string; // Original edge syntax from Mermaid code
    classList?: string[]; // Classes assigned to this edge
    comments?: string[]; // Comments associated with this edge
    [key: string]: any; // Additional metadata
  };
}

export interface DiagramGroup {
  id: string;
  name: string;
  nodeIds: string[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    padding?: number;
    color?: string;
  };
  metadata?: {
    originalMermaidSyntax?: string; // Original subgraph syntax from Mermaid code
    classList?: string[]; // Classes assigned to this group
    comments?: string[]; // Comments associated with this group
    layout?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    [key: string]: any; // Additional metadata
  };
}

export interface DiagramMetadata {
  diagramType?: string;        // 'graph' or 'flowchart'
  diagramDirection?: string;   // 'TD', 'LR', 'RL', 'BT'
  classDefs?: Record<string, string>;  // Class definitions
  comments?: string[];         // Comment lines
  originalMermaidCode?: string; // Complete original Mermaid code for reference
  theme?: string;
  animationSettings?: {
    enabled: boolean;
    speed: 'slow' | 'medium' | 'fast';
    style: 'flow' | 'pulse' | 'bounce';
    autoPlay: boolean;
  };
  createdDate: Date;
  lastModified: Date;
  version: string;
}

export interface DiagramModel {
  id: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups: DiagramGroup[];
  metadata: DiagramMetadata;
  // Additional diagram-specific properties can be added here
}
