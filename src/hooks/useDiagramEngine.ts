import { useState, useEffect, useCallback } from 'react';
import { DiagramEngine } from '../services/DiagramEngine';
import { DiagramModel, DiagramNode, DiagramEdge, DiagramGroup } from '../types/diagramModel';

export const useDiagramEngine = (initialModel?: DiagramModel) => {
  const [engine] = useState(() => new DiagramEngine(initialModel));
  const [model, setModel] = useState<DiagramModel>(engine.getModel());

  useEffect(() => {
    const unsubscribe = engine.subscribe((newModel: DiagramModel) => {
      setModel(newModel);
    });
    
    return () => unsubscribe();
  }, [engine]);

  const setModelData = useCallback((newModel: DiagramModel) => {
    engine.setModel(newModel);
  }, [engine]);

  return {
    model,
    engine,
    setModel: setModelData,
    
    // Node operations
    addNode: useCallback((node: DiagramNode) => {
      engine.addNode(node);
    }, [engine]),
    updateNode: useCallback((id: string, updates: Partial<DiagramNode>) => {
      engine.updateNode(id, updates);
    }, [engine]),
    removeNode: useCallback((id: string) => {
      engine.removeNode(id);
    }, [engine]),
    
    // Edge operations
    addEdge: useCallback((edge: DiagramEdge) => {
      engine.addEdge(edge);
    }, [engine]),
    updateEdge: useCallback((id: string, updates: Partial<DiagramEdge>) => {
      engine.updateEdge(id, updates);
    }, [engine]),
    removeEdge: useCallback((id: string) => {
      engine.removeEdge(id);
    }, [engine]),
    
    // Group operations
    addGroup: useCallback((group: DiagramGroup) => {
      engine.addGroup(group);
    }, [engine]),
    updateGroup: useCallback((id: string, updates: Partial<DiagramGroup>) => {
      engine.updateGroup(id, updates);
    }, [engine]),
    removeGroup: useCallback((id: string) => {
      engine.removeGroup(id);
    }, [engine]),
  };
};