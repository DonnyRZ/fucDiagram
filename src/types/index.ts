export interface DiagramProject {
  id: string;
  name: string;
  mermaidCode: string;
  createdAt: Date;
  updatedAt: Date;
  lastOpened: Date;
  versionHistory: ProjectVersion[];
  animationSettings: AnimationSettings;
}

export interface ProjectVersion {
  id: string;
  timestamp: Date;
  mermaidCode: string;
  name: string;
}

export interface AnimationSettings {
  enabled: boolean;
  speed: 'slow' | 'medium' | 'fast';
  style: 'flow' | 'pulse' | 'bounce';
  autoPlay: boolean;
}

export interface Tab {
  id: string;
  title: string;
  icon?: any; // ReactNode
}

export interface AppState {
  projects: DiagramProject[];
  currentProject: DiagramProject | null;
  isAnimating: boolean;
  isLoading: boolean;
  error: string | null;
  editorPaneSize: number;
  previewPaneSize: number;
  showHistory: boolean;
  theme: 'light' | 'dark';
  hasUnsavedChanges: boolean;
  recentProjects: DiagramProject[];
}

export interface MermaidConfig {
  theme?: string;
  securityLevel?: 'strict' | 'loose' | 'antiscript' | 'sandbox';
  startOnLoad?: boolean;
  arrowMarkerAbsolute?: boolean;
  flowchart?: {
    diagramPadding?: number;
    nodeSpacing?: number;
    rankSpacing?: number;
    curve?: string;
    padding?: number;
    titleTopMargin?: number;
  };
  sequence?: {
    diagramMarginX?: number;
    diagramMarginY?: number;
    actorMargin?: number;
    width?: number;
    height?: number;
    boxMargin?: number;
    boxTextMargin?: number;
    noteMargin?: number;
    messageMargin?: number;
    messageAlign?: string;
    mirrorActors?: boolean;
    bottomMarginAdj?: number;
    useMaxWidth?: boolean;
  };
  gantt?: {
    titleTopMargin?: number;
    barHeight?: number;
    barGap?: number;
    topPadding?: number;
    rightPadding?: number;
    leftPadding?: number;
    gridLineStartPadding?: number;
    fontSize?: number;
    fontFamily?: string;
    numberSectionStyles?: number;
    axisFormat?: string;
    useMaxWidth?: boolean;
  };
  // Add more config options as needed
}