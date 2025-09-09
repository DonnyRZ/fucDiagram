export interface DiagramProject {
  id: string;
  name: string;
  mermaidCode: string;
  createdAt: Date;
  updatedAt: Date;
  lastOpened: Date;
  versionHistory: ProjectVersion[];
  animationSettings: AnimationSettings;
  exportSettings: ExportSettings;
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

export interface ExportSettings {
  gifQuality: number;
  gifSpeed: number;
  includeAnimation: boolean;
}

export interface AppState {
  projects: DiagramProject[];
  currentProject: DiagramProject | null;
  isAnimating: boolean;
  isLoading: boolean;
  error: string | null;
}