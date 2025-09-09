import { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { DiagramProject, AppState } from '../types';
import { ProjectManager } from '../services/projectManager';

interface AppContextType extends AppState {
  createProject: (name: string, mermaidCode: string) => DiagramProject;
  updateProject: (project: DiagramProject) => void;
  deleteProject: (id: string) => void;
  loadProject: (id: string) => void;
  setCurrentProjectCode: (code: string) => void;
  toggleAnimation: () => void;
  setAnimating: (isAnimating: boolean) => void;
  clearError: () => void;
}

const defaultState: AppState = {
  projects: [],
  currentProject: null,
  isAnimating: false,
  isLoading: false,
  error: null
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(defaultState);

  // Load projects from localStorage on initial render
  useEffect(() => {
    try {
      const projects = ProjectManager.getAllProjects();
      setState(prev => ({ ...prev, projects }));
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to load projects' }));
    }
  }, []);

  const createProject = useCallback((name: string, mermaidCode: string): DiagramProject => {
    try {
      const project = ProjectManager.createProject(name, mermaidCode);
      setState(prev => ({
        ...prev,
        projects: [...prev.projects, project],
        currentProject: project
      }));
      return project;
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to create project' }));
      throw error;
    }
  }, []);

  const updateProject = useCallback((project: DiagramProject): void => {
    try {
      ProjectManager.updateProject(project);
      setState(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === project.id ? project : p),
        currentProject: prev.currentProject?.id === project.id ? project : prev.currentProject
      }));
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to update project' }));
    }
  }, []);

  const deleteProject = useCallback((id: string): void => {
    try {
      ProjectManager.deleteProject(id);
      setState(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== id),
        currentProject: prev.currentProject?.id === id ? null : prev.currentProject
      }));
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to delete project' }));
    }
  }, []);

  const loadProject = useCallback((id: string): void => {
    try {
      const project = ProjectManager.getProject(id);
      console.log('Project found:', project);
      if (project) {
        setState(prev => {
          console.log('Setting current project in state:', {
            ...project,
            lastOpened: new Date()
          });
          return {
            ...prev,
            currentProject: {
              ...project,
              lastOpened: new Date()
            },
            error: null
          };
        });
        
        // Update the last opened timestamp in localStorage separately
        // without triggering a state update
        try {
          const projectToUpdate = {
            ...project,
            lastOpened: new Date()
          };
          ProjectManager.updateProject(projectToUpdate);
        } catch (updateError) {
          console.error('Failed to update project lastOpened timestamp:', updateError);
        }
      } else {
        console.log('Project not found');
        setState(prev => ({ ...prev, currentProject: null, error: 'Project not found' }));
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setState(prev => ({ ...prev, error: 'Failed to load project' }));
    }
  }, []);

  const setCurrentProjectCode = useCallback((code: string): void => {
    setState(prev => {
      if (prev.currentProject) {
        const updatedProject = {
          ...prev.currentProject,
          mermaidCode: code,
          updatedAt: new Date()
        };
        ProjectManager.updateProject(updatedProject);
        return {
          ...prev,
          currentProject: updatedProject,
          projects: prev.projects.map(p => p.id === updatedProject.id ? updatedProject : p)
        };
      }
      return prev;
    });
  }, []);

  const toggleAnimation = useCallback((): void => {
    setState(prev => ({ ...prev, isAnimating: !prev.isAnimating }));
  }, []);

  const setAnimating = useCallback((isAnimating: boolean): void => {
    setState(prev => ({ ...prev, isAnimating }));
  }, []);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const value = useMemo(() => ({
    ...state,
    createProject,
    updateProject,
    deleteProject,
    loadProject,
    setCurrentProjectCode,
    toggleAnimation,
    setAnimating,
    clearError
  }), [state, createProject, updateProject, deleteProject, loadProject, setCurrentProjectCode, toggleAnimation, setAnimating, clearError]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};