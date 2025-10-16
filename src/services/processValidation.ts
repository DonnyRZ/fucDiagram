export interface ProcessValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ProcessValidation {
  // Validate BPMN connection rules
  static validateConnection(sourceType: string, targetType: string): ProcessValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic BPMN connection rules
    switch(sourceType) {
      case 'start':
        if (targetType === 'start') {
          errors.push('Start events cannot connect to other start events');
        }
        break;
        
      case 'end':
        if (targetType !== 'end') {
          errors.push('End events can only connect to other end events or nothing');
        }
        break;
        
      case 'gateway':
        if (targetType === 'start') {
          errors.push('Gateways cannot connect to start events');
        }
        break;
        
      case 'task':
        if (targetType === 'start') {
          errors.push('Tasks cannot connect to start events');
        }
        break;
    }
    
    // Check for valid target
    const validTargets = ['task', 'gateway', 'end', 'event'];
    if (!validTargets.includes(targetType) && targetType !== 'start') {
      warnings.push(`Unusual connection: ${sourceType} connecting to ${targetType}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  // Validate process completeness
  static validateProcess(nodes: any[], edges: any[]): ProcessValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for start node
    const startNodes = nodes.filter(node => node.type === 'start');
    if (startNodes.length === 0) {
      errors.push('Process must have at least one start event');
    } else if (startNodes.length > 1) {
      warnings.push('Multiple start events detected');
    }
    
    // Check for end node
    const endNodes = nodes.filter(node => node.type === 'end');
    if (endNodes.length === 0) {
      warnings.push('Process has no end events (may not terminate)');
    }
    
    // Check for isolated nodes (nodes with no connections)
    nodes.forEach(node => {
      const hasIncoming = edges.some(edge => edge.target === node.id);
      const hasOutgoing = edges.some(edge => edge.source === node.id);
      
      if (!hasIncoming && !hasOutgoing && node.type !== 'start' && node.type !== 'end') {
        warnings.push(`Node "${node.data?.label || node.id}" is isolated with no connections`);
      }
    });
    
    // Check for cycles in the process (simplified)
    if (this.hasPotentialCycles(edges, nodes)) {
      warnings.push('Potential cycle detected in process flow');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  // Simple cycle detection
  private static hasPotentialCycles(edges: any[], nodes: any[]): boolean {
    if (edges.length === 0) return false;
    
    // Build adjacency list
    const adjacencyList: Record<string, string[]> = {};
    nodes.forEach(node => {
      adjacencyList[node.id] = [];
    });
    
    edges.forEach(edge => {
      if (adjacencyList[edge.source]) {
        adjacencyList[edge.source].push(edge.target);
      }
    });
    
    // Check for cycles using DFS
    const visited: Record<string, boolean> = {};
    const recStack: Record<string, boolean> = {};
    
    const hasCycleUtil = (nodeId: string): boolean => {
      if (!visited[nodeId]) {
        visited[nodeId] = true;
        recStack[nodeId] = true;
        
        const neighbors = adjacencyList[nodeId] || [];
        for (const neighbor of neighbors) {
          if (!visited[neighbor] && hasCycleUtil(neighbor)) {
            return true;
          } else if (recStack[neighbor]) {
            return true;
          }
        }
      }
      recStack[nodeId] = false;
      return false;
    };
    
    for (const node of nodes) {
      if (!visited[node.id] && hasCycleUtil(node.id)) {
        return true;
      }
    }
    
    return false;
  }
}