import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { DiagramProject } from '../types';

interface NavigationState {
  currentView: 'editor' | 'history' | 'templates' | 'settings';
  activeDiagramId: string | null;
  recentDiagrams: DiagramProject[];
  openDiagrams: DiagramProject[]; // For tab management
  navigationHistory: string[]; // For back/forward functionality
  historyIndex: number; // Current position in navigation history
  breadcrumbs: { title: string; path: string; }[];
}

interface NavigationActions {
  setCurrentView: (view: 'editor' | 'history' | 'templates' | 'settings') => void;
  setActiveDiagram: (id: string | null) => void;
  addToRecent: (project: DiagramProject) => void;
  addToOpen: (project: DiagramProject) => void;
  removeFromOpen: (id: string) => void;
  addToHistory: (path: string) => void;
  navigateBack: () => void;
  navigateForward: () => void;
  setBreadcrumbs: (breadcrumbs: { title: string; path: string; }[]) => void;
  canNavigateBack: boolean;
  canNavigateForward: boolean;
}

interface NavigationContextType extends NavigationState, NavigationActions {}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentView, setCurrentView] = useState<NavigationState['currentView']>('editor');
  const [activeDiagramId, setActiveDiagramId] = useState<string | null>(null);
  const [recentDiagrams, setRecentDiagrams] = useState<DiagramProject[]>([]);
  const [openDiagrams, setOpenDiagrams] = useState<DiagramProject[]>([]);
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['/']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [breadcrumbs, setBreadcrumbs] = useState<{ title: string; path: string; }[]>([]);

  const canNavigateBack = historyIndex > 0;
  const canNavigateForward = historyIndex < navigationHistory.length - 1;

  const setCurrentViewCallback = useCallback((view: 'editor' | 'history' | 'templates' | 'settings') => {
    setCurrentView(view);
  }, []);

  const setActiveDiagram = useCallback((id: string | null) => {
    setActiveDiagramId(id);
  }, []);

  const addToRecent = useCallback((project: DiagramProject) => {
    setRecentDiagrams(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p.id !== project.id);
      // Add to the beginning
      return [project, ...filtered].slice(0, 10); // Keep only 10 most recent
    });
  }, []);

  const addToOpen = useCallback((project: DiagramProject) => {
    setOpenDiagrams(prev => {
      // Don't add if already open
      if (prev.some(p => p.id === project.id)) {
        return prev;
      }
      return [...prev, project];
    });
  }, []);

  const removeFromOpen = useCallback((id: string) => {
    setOpenDiagrams(prev => prev.filter(p => p.id !== id));
  }, []);

  const addToHistory = useCallback((path: string) => {
    setNavigationHistory(prev => {
      // If we're not at the end of the history, truncate it
      const truncated = prev.slice(0, historyIndex + 1);
      return [...truncated, path];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const navigateBack = useCallback(() => {
    if (canNavigateBack) {
      setHistoryIndex(prev => prev - 1);
    }
  }, [canNavigateBack]);

  const navigateForward = useCallback(() => {
    if (canNavigateForward) {
      setHistoryIndex(prev => prev + 1);
    }
  }, [canNavigateForward]);

  const setBreadcrumbsCallback = useCallback((newBreadcrumbs: { title: string; path: string; }[]) => {
    setBreadcrumbs(newBreadcrumbs);
  }, []);

  const value: NavigationContextType = {
    currentView,
    activeDiagramId,
    recentDiagrams,
    openDiagrams,
    navigationHistory,
    historyIndex,
    breadcrumbs,
    setCurrentView: setCurrentViewCallback,
    setActiveDiagram,
    addToRecent,
    addToOpen,
    removeFromOpen,
    addToHistory,
    navigateBack,
    navigateForward,
    setBreadcrumbs: setBreadcrumbsCallback,
    canNavigateBack,
    canNavigateForward
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};