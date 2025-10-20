import { DiagramModel, DiagramNode, DiagramEdge, DiagramGroup } from '../types/diagramModel';

export class DiagramEngine {
  private model: DiagramModel;
  private subscribers: Array<(model: DiagramModel) => void> = [];

  constructor(initialModel?: DiagramModel) {
    this.model = initialModel || {
      id: this.generateId(),
      nodes: [],
      edges: [],
      groups: [],
      metadata: {
        createdDate: new Date(),
        lastModified: new Date(),
        version: '1.0.0',
        animationSettings: {
          enabled: true,
          speed: 'medium',
          style: 'flow',
          autoPlay: false
        }
      }
    };
  }

  // Subscribe to model changes
  subscribe(callback: (model: DiagramModel) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.model));
  }

  private updateTimestamp(): void {
    this.model.metadata.lastModified = new Date();
  }

  // Node operations
  addNode(node: DiagramNode): void {
    this.model.nodes.push(node);
    this.updateTimestamp();
    this.notifySubscribers();
  }

  updateNode(id: string, updates: Partial<DiagramNode>): void {
    const nodeIndex = this.model.nodes.findIndex(n => n.id === id);
    if (nodeIndex !== -1) {
      this.model.nodes[nodeIndex] = { ...this.model.nodes[nodeIndex], ...updates };
      this.updateTimestamp();
      this.notifySubscribers();
    }
  }

  removeNode(id: string): void {
    // Remove node
    this.model.nodes = this.model.nodes.filter(n => n.id !== id);
    // Remove edges connected to this node
    this.model.edges = this.model.edges.filter(e => e.source !== id && e.target !== id);
    // Remove from groups
    this.model.groups = this.model.groups.map(group => ({
      ...group,
      nodeIds: group.nodeIds.filter(nodeId => nodeId !== id)
    }));
    this.updateTimestamp();
    this.notifySubscribers();
  }

  // Edge operations
  addEdge(edge: DiagramEdge): void {
    this.model.edges.push(edge);
    this.updateTimestamp();
    this.notifySubscribers();
  }

  updateEdge(id: string, updates: Partial<DiagramEdge>): void {
    const edgeIndex = this.model.edges.findIndex(e => e.id === id);
    if (edgeIndex !== -1) {
      this.model.edges[edgeIndex] = { ...this.model.edges[edgeIndex], ...updates };
      this.updateTimestamp();
      this.notifySubscribers();
    }
  }

  removeEdge(id: string): void {
    this.model.edges = this.model.edges.filter(e => e.id !== id);
    this.updateTimestamp();
    this.notifySubscribers();
  }

  // Group operations
  addGroup(group: DiagramGroup): void {
    this.model.groups.push(group);
    this.updateTimestamp();
    this.notifySubscribers();
  }

  updateGroup(id: string, updates: Partial<DiagramGroup>): void {
    const groupIndex = this.model.groups.findIndex(g => g.id === id);
    if (groupIndex !== -1) {
      this.model.groups[groupIndex] = { ...this.model.groups[groupIndex], ...updates };
      this.updateTimestamp();
      this.notifySubscribers();
    }
  }

  removeGroup(id: string): void {
    this.model.groups = this.model.groups.filter(g => g.id !== id);
    this.updateTimestamp();
    this.notifySubscribers();
  }

  // Model operations
  updateModel(updates: Partial<DiagramModel>): void {
    this.model = { ...this.model, ...updates };
    this.updateTimestamp();
    this.notifySubscribers();
  }

  getModel(): DiagramModel {
    return { ...this.model };
  }

  setModel(model: DiagramModel): void {
    this.model = { ...model };
    this.updateTimestamp();
    this.notifySubscribers();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}