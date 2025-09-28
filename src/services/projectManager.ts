import { DiagramProject, ProjectVersion } from '../types';

const STORAGE_KEY = 'animated-diagrams-projects';

export class ProjectManager {
  static getAllProjects(): DiagramProject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      console.log('ProjectManager - getAllProjects - raw data:', data);
      const result = data ? JSON.parse(data, this.dateReviver) : [];
      console.log('ProjectManager - getAllProjects - parsed result:', result);
      return result;
    } catch (error) {
      console.error('Error loading projects from localStorage:', error);
      return [];
    }
  }

  static getProject(id: string): DiagramProject | null {
    console.log('ProjectManager - getProject - id:', id);
    const projects = this.getAllProjects();
    console.log('ProjectManager - getProject - all projects:', projects);
    const result = projects.find(p => p.id === id) || null;
    console.log('ProjectManager - getProject - result:', result);
    return result;
  }

  static createProject(name: string, mermaidCode: string): DiagramProject {
    const project: DiagramProject = {
      id: this.generateId(),
      name,
      mermaidCode,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastOpened: new Date(),
      versionHistory: [],
      animationSettings: {
        enabled: true,
        speed: 'medium',
        style: 'flow',
        autoPlay: false
      }
    };

    this.saveProject(project);
    return project;
  }

  static updateProject(project: DiagramProject): void {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    if (index !== -1) {
      projects[index] = { 
        ...project, 
        updatedAt: new Date() 
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  }

  static deleteProject(id: string): void {
    const projects = this.getAllProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  static addVersion(projectId: string, name: string, mermaidCode: string): void {
    const project = this.getProject(projectId);
    if (project) {
      const version: ProjectVersion = {
        id: this.generateId(),
        timestamp: new Date(),
        mermaidCode,
        name
      };
      project.versionHistory.push(version);
      this.updateProject(project);
    }
  }

  static saveProject(project: DiagramProject): void {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    if (index !== -1) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static dateReviver(key: string, value: any): any {
    if (typeof value === 'string' && key.endsWith('At')) {
      return new Date(value);
    }
    if (typeof value === 'string' && key === 'timestamp') {
      return new Date(value);
    }
    if (typeof value === 'string' && key === 'lastOpened') {
      return new Date(value);
    }
    return value;
  }
}
