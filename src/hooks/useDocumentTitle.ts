import { useEffect } from 'react';

export const useDocumentTitle = (projectName: string | undefined, hasUnsavedChanges: boolean) => {
  useEffect(() => {
    const baseTitle = projectName || 'Diagram Editor';
    document.title = hasUnsavedChanges ? `* ${baseTitle}` : baseTitle;
    return () => {
      document.title = 'Diagram Editor';
    };
  }, [projectName, hasUnsavedChanges]);
};