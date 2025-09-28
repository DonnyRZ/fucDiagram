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
  setEditorPaneSize: (size: number) => void;
  setPreviewPaneSize: (size: number) => void;
  setShowHistory: (show: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const defaultState: AppState = {
  projects: [],
  currentProject: null,
  isAnimating: false,
  isLoading: false,
  error: null,
  editorPaneSize: 40,
  previewPaneSize: 60,
  showHistory: false,
  theme: 'light'
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
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const project = ProjectManager.createProject(name, mermaidCode);
      setState(prev => ({ 
        ...prev, 
        projects: [...prev.projects, project], 
        currentProject: project,
        isLoading: false 
      }));
      return project;
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to create project', isLoading: false }));
      throw error;
    }
  }, []);

  const updateProject = useCallback((project: DiagramProject): void => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      ProjectManager.updateProject(project);
      setState(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === project.id ? project : p),
        currentProject: prev.currentProject?.id === project.id ? project : prev.currentProject,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to update project', isLoading: false }));
    }
  }, []);

  const deleteProject = useCallback((id: string): void => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      ProjectManager.deleteProject(id);
      setState(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== id),
        currentProject: prev.currentProject?.id === id ? null : prev.currentProject,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to delete project', isLoading: false }));
    }
  }, []);

  const loadProject = useCallback((id: string): void => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const project = ProjectManager.getProject(id);
      if (import.meta.env.DEV) console.log('Project found:', project);
      if (project) {
        setState(prev => {
          if (import.meta.env.DEV) console.log('Setting current project in state:', {
            ...project,
            lastOpened: new Date()
          });
          return {
            ...prev,
            currentProject: {
              ...project,
              lastOpened: new Date()
            },
            error: null,
            isLoading: false
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
        if (import.meta.env.DEV) console.log('Project not found');
        setState(prev => ({ ...prev, currentProject: null, error: 'Project not found', isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setState(prev => ({ ...prev, error: 'Failed to load project', isLoading: false }));
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

  const setEditorPaneSize = useCallback((size: number): void => {
    setState(prev => {
      const total = prev.editorPaneSize + prev.previewPaneSize;
      const previewSize = total - size;
      return {
        ...prev,
        editorPaneSize: size,
        previewPaneSize: previewSize
      };
    });
  }, []);

  const setPreviewPaneSize = useCallback((size: number): void => {
    setState(prev => {
      const total = prev.editorPaneSize + prev.previewPaneSize;
      const editorSize = total - size;
      return {
        ...prev,
        editorPaneSize: editorSize,
        previewPaneSize: size
      };
    });
  }, []);

  const setShowHistory = useCallback((show: boolean): void => {
    setState(prev => ({ ...prev, showHistory: show }));
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark'): void => {
    setState(prev => ({ ...prev, theme }));
    // Update the class on the document for CSS theme switching
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
    clearError,
    setEditorPaneSize,
    setPreviewPaneSize,
    setShowHistory,
    setTheme
  }), [state, createProject, updateProject, deleteProject, loadProject, setCurrentProjectCode, toggleAnimation, setAnimating, clearError, setEditorPaneSize, setPreviewPaneSize, setShowHistory, setTheme]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
