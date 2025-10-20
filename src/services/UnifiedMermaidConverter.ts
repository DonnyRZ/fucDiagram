import { DiagramModel, DiagramNode, DiagramEdge, DiagramGroup } from '../types/diagramModel';
import { MermaidConverter } from './mermaidConverter';

export class UnifiedMermaidConverter {
  // Convert from Mermaid code to DiagramModel (preserving ALL rich information)
  static async mermaidToModel(mermaidCode: string): Promise<DiagramModel> {
    // First, use the enhanced converter to get basic nodes and edges with diagram type info
    const {
      nodes: basicNodes,
      edges: basicEdges,
      groups: parsedSvgGroups,
      diagramType,
      diagramDirection,
    } =
      await MermaidConverter.mermaidToReactFlow(mermaidCode);
    
    // Parse ALL additional information including subgraphs, styling, comments, and original syntax
    const groups = this.parseSubgraphs(mermaidCode);
    const { classDefs, nodeStyles } = this.parseStyling(mermaidCode);
    const comments = this.parseComments(mermaidCode);
    const classStyleMap = this.buildClassStyleMap(classDefs);
    const svgGroupById = new Map(parsedSvgGroups.map(group => [group.id, group]));
    const svgGroupByLabel = new Map(parsedSvgGroups.map(group => [group.label, group]));
    
    // Convert basic nodes to rich DiagramNodes with preserved metadata
    const diagramNodes: DiagramNode[] = basicNodes.map(node => {
      // Extract original syntax for this specific node
      const originalSyntax = this.extractNodeSyntax(mermaidCode, node.id);
      
      // Determine which subgraph this node belongs to
      const subgraphId = this.findNodeSubgraph(node.id, groups);
      
      // Get styling information for this node
      const svgClasses = Array.isArray((node.data as any)?.classes)
        ? (node.data as any).classes
        : [];
      const classList = Array.from(new Set([...(nodeStyles[node.id] || []), ...svgClasses]));
      const svgStyle = (node.style || (node.data as any)?.style || {}) as Record<string, any>;
      const classStyle = this.combineClassStyles(classList, classStyleMap, true);
      const nodeStyle = { ...classStyle, ...svgStyle };
      
      return {
        id: node.id,
        label: (node.data as any)?.label || node.id,
        type: node.type || 'default',
        x: node.position?.x || 0,
        y: node.position?.y || 0,
        width: node.width || 100,
        height: node.height || 50,
        zIndex: node.zIndex,
        style: nodeStyle,
        properties: {
          ...(node.data || {}),
          classes: classList,
        },
        metadata: {
          originalMermaidSyntax: originalSyntax,
          subgraphId: subgraphId,
          classList: classList,
          comments: this.extractNodeComments(mermaidCode, node.id),
          visualStyle: nodeStyle,
        }
      };
    });
    
    // Convert basic edges to rich DiagramEdges with preserved metadata
    const diagramEdges: DiagramEdge[] = basicEdges.map(edge => {
      // Extract original syntax for this specific edge
      const originalSyntax = this.extractEdgeSyntax(mermaidCode, edge.id);
      const classList = Array.isArray((edge.data as any)?.classes)
        ? (edge.data as any).classes
        : [];
      const classStyle = this.combineClassStyles(classList, classStyleMap, false);
      const edgeStyle = {
        ...classStyle,
        ...(edge.style as Record<string, any>),
      };
      
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label || (edge.data as any)?.label || '',
        type: edge.type || 'default',
        style: edgeStyle,
        properties: {
          ...(edge.data || {}),
          classes: classList,
        },
        metadata: {
          originalMermaidSyntax: originalSyntax,
          classList,
          comments: this.extractEdgeComments(mermaidCode, edge.id)
        }
      };
    });
    
    // Enrich groups with original syntax
    const enrichedGroups: DiagramGroup[] = groups.map(group => {
      const svgGroup =
        svgGroupById.get(group.id) ||
        svgGroupByLabel.get(group.name) ||
        svgGroupById.get(group.id.replace(/cluster-/, '')) ||
        svgGroupById.get(group.name.replace(/\s+/g, '_'));

      const backgroundColor =
        (svgGroup?.style.background as string | undefined) ??
        (svgGroup?.style.backgroundColor as string | undefined);
      let borderColor: string | undefined;
      let borderWidth: number | undefined;
      const svgBorder = svgGroup?.style.border as string | undefined;
      if (svgBorder) {
        const borderParts = svgBorder.split(' ');
        const widthPart = borderParts.find(part => part.endsWith('px'));
        if (widthPart) {
          const parsed = parseFloat(widthPart);
          if (!Number.isNaN(parsed)) {
            borderWidth = parsed;
          }
        }
        const colorPart = borderParts[borderParts.length - 1];
        if (colorPart && !colorPart.endsWith('px')) {
          borderColor = colorPart;
        }
      }

      const svgClassList = svgGroup?.classes || [];
      const existingClasses = group.metadata?.classList || [];
      const mergedClassList = Array.from(new Set([...existingClasses, ...svgClassList]));
      const classStyle = this.combineClassStyles(mergedClassList, classStyleMap, true);
      const mergedStyle = {
        ...(group.style || {}),
        ...classStyle,
      };

      return {
        ...group,
        x: svgGroup?.position.x ?? group.x,
        y: svgGroup?.position.y ?? group.y,
        width: svgGroup?.width ?? group.width,
        height: svgGroup?.height ?? group.height,
        style: {
          ...mergedStyle,
          backgroundColor: backgroundColor ?? mergedStyle.backgroundColor,
          borderColor: borderColor ?? mergedStyle.borderColor,
          borderWidth: borderWidth ?? mergedStyle.borderWidth,
        },
        metadata: {
          originalMermaidSyntax: this.extractGroupSyntax(mermaidCode, group.id),
          classList: mergedClassList,
          comments: this.extractGroupComments(mermaidCode, group.id),
          layout: svgGroup
            ? {
                x: svgGroup.position.x,
                y: svgGroup.position.y,
                width: svgGroup.width,
                height: svgGroup.height,
              }
            : group.metadata?.layout,
        }
      };
    });
    
    // Create a rich model that preserves ALL original information
    const model: DiagramModel = {
      id: `model-${Date.now()}`,
      nodes: diagramNodes,
      edges: diagramEdges,
      groups: enrichedGroups,
      metadata: {
        diagramType: diagramType,
        diagramDirection: diagramDirection,
        classDefs: classDefs,
        comments: comments,
        originalMermaidCode: mermaidCode, // Preserve the complete original code
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
    
    return model;
  }

  private static buildClassStyleMap(classDefs: Record<string, string> | undefined): Record<string, Record<string, string>> {
    const map: Record<string, Record<string, string>> = {};
    if (!classDefs) {
      return map;
    }

    for (const [className, definition] of Object.entries(classDefs)) {
      const style: Record<string, string> = {};
      definition
        .split(',')
        .map(part => part.trim())
        .filter(Boolean)
        .forEach(part => {
          const [rawKey, ...rest] = part.split(':');
          if (!rawKey || rest.length === 0) {
            return;
          }
          const key = this.normalizeCssProperty(rawKey.trim());
          const value = rest.join(':').trim().replace(/;$/, '');
          style[key] = value;
        });
      map[className] = style;
    }

    return map;
  }

  private static combineClassStyles(
    classList: string[],
    classStyleMap: Record<string, Record<string, string>>,
    isNode: boolean,
  ): Record<string, any> {
    const style: Record<string, any> = {};
    classList.forEach(className => {
      const classStyle = classStyleMap[className];
      if (!classStyle) return;

      Object.entries(classStyle).forEach(([key, value]) => {
        switch (key) {
          case 'fill': {
            style.fill = value;
            if (isNode) {
              style.background = value;
              style.backgroundColor = value;
            }
            break;
          }
          case 'stroke': {
            style.stroke = value;
            if (isNode) {
              style.borderColor = value;
            }
            break;
          }
          case 'strokeWidth': {
            style.strokeWidth = value;
            if (isNode) {
              style.borderWidth = value;
            }
            break;
          }
          default:
            style[key] = value;
        }
      });
    });

    if (isNode && style.borderColor && style.borderWidth && !style.border) {
      style.border = `${style.borderWidth} solid ${style.borderColor}`;
    }

    return style;
  }

  private static normalizeCssProperty(key: string): string {
    return key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
  }

  // Convert from DiagramModel to Mermaid code (preserving ALL information)
  static modelToMermaid(model: DiagramModel): string {
    // Start with the exact diagram type and direction from the original
    const diagramType = model.metadata.diagramType || 'graph';
    const diagramDirection = model.metadata.diagramDirection || 'TD';
    let mermaidCode = `${diagramType} ${diagramDirection}\n\n`;
    
    // Add comments first if any
    if (model.metadata.comments && model.metadata.comments.length > 0) {
      mermaidCode += model.metadata.comments.join('\n') + '\n\n';
    }
    
    // Add class definitions if any
    if (model.metadata.classDefs) {
      Object.entries(model.metadata.classDefs).forEach(([className, definition]) => {
        mermaidCode += `classDef ${className} ${definition}\n`;
      });
      mermaidCode += '\n';
    }
    
    // Add empty line for separation if we have class definitions
    if (model.metadata.classDefs && Object.keys(model.metadata.classDefs).length > 0) {
      mermaidCode += '\n';
    }
    
    // Add groups/subgraphs with their original syntax when possible
    model.groups.forEach(group => {
      // Try to use original syntax if available
      if (group.metadata?.originalMermaidSyntax) {
        mermaidCode += `${group.metadata.originalMermaidSyntax}\n`;
        // Add nodes in this group using their original syntax
        group.nodeIds.forEach(nodeId => {
          const node = model.nodes.find(n => n.id === nodeId);
          if (node && node.metadata?.originalMermaidSyntax) {
            mermaidCode += `    ${node.metadata.originalMermaidSyntax}\n`;
          } else if (node) {
            // Fallback to generated syntax
            const nodeSyntax = this.nodeToMermaidSyntax(node);
            if (nodeSyntax) {
              mermaidCode += `    ${nodeSyntax}\n`;
            }
          }
        });
        mermaidCode += `end\n\n`;
      } else {
        // Generate subgraph with proper naming
        mermaidCode += `subgraph ${group.id}["${group.name}"]\n`;
        // Add nodes in this group using their original syntax when available
        group.nodeIds.forEach(nodeId => {
          const node = model.nodes.find(n => n.id === nodeId);
          if (node && node.metadata?.originalMermaidSyntax) {
            mermaidCode += `    ${node.metadata.originalMermaidSyntax}\n`;
          } else if (node) {
            // Fallback to generated syntax
            const nodeSyntax = this.nodeToMermaidSyntax(node);
            if (nodeSyntax) {
              mermaidCode += `    ${nodeSyntax}\n`;
            }
          }
        });
        mermaidCode += `end\n\n`;
      }
    });
    
    // Add standalone nodes (not in groups) using their original syntax when available
    const groupedNodeIds = model.groups.flatMap(g => g.nodeIds);
    model.nodes
      .filter(node => !groupedNodeIds.includes(node.id))
      .forEach(node => {
        if (node.metadata?.originalMermaidSyntax) {
          mermaidCode += `${node.metadata.originalMermaidSyntax}\n`;
        } else {
          // Fallback to generated syntax
          const nodeSyntax = this.nodeToMermaidSyntax(node);
          if (nodeSyntax) {
            mermaidCode += `${nodeSyntax}\n`;
          }
        }
      });
    
    // Add empty line for separation before edges
    mermaidCode += '\n';
    
    // Add edges using their original syntax when available
    model.edges.forEach(edge => {
      if (edge.metadata?.originalMermaidSyntax) {
        mermaidCode += `${edge.metadata.originalMermaidSyntax}\n`;
      } else {
        // Fallback to generated syntax
        mermaidCode += `${edge.source} --> ${edge.target}\n`;
      }
    });
    
    return mermaidCode;
  }
  
  // Helper methods for enhanced parsing
  private static parseSubgraphs(mermaidCode: string): DiagramGroup[] {
    const groups: DiagramGroup[] = [];
    const lines = mermaidCode.split('\n');
    let inSubgraph = false;
    let currentGroup: Partial<DiagramGroup> = {};
    const currentNodes: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Detect subgraph start
      const subgraphMatch = trimmedLine.match(/^subgraph\s+([A-Za-z0-9_]+)(?:\s*\[(.*?)\])?/i);
      if (subgraphMatch) {
        inSubgraph = true;
        currentGroup = {
          id: subgraphMatch[1],
          name: subgraphMatch[2] || subgraphMatch[1],
          nodeIds: []
        };
        currentNodes.length = 0; // Clear nodes array
        continue;
      }
      
      // Detect subgraph end
      if (inSubgraph && trimmedLine === 'end') {
        inSubgraph = false;
        if (currentGroup.id) {
          // Collect nodes from the current subgraph
          const nodeIds = [...currentNodes];
          groups.push({
            ...currentGroup as DiagramGroup,
            nodeIds: nodeIds
          } as DiagramGroup);
        }
        currentGroup = {};
        currentNodes.length = 0; // Clear nodes array
        continue;
      }
      
      // Collect nodes within subgraph
      if (inSubgraph) {
        // Extract node IDs from the line using a more comprehensive regex
        const nodePattern = /([A-Z0-9_]+)(?:\[(.*?)\]|{(.*?)}|\((.*?)\))?/gi;
        let nodeMatch;
        while ((nodeMatch = nodePattern.exec(trimmedLine)) !== null) {
          const nodeId = nodeMatch[1];
          if (nodeId && !['subgraph', 'end', 'classDef', 'class'].includes(nodeId)) {
            currentNodes.push(nodeId);
          }
        }
      }
    }
    
    return groups;
  }
  
  private static parseStyling(mermaidCode: string): { 
    classDefs: Record<string, string>; 
    nodeStyles: Record<string, string[]> 
  } {
    const classDefs: Record<string, string> = {};
    const nodeStyles: Record<string, string[]> = {};
    
    const lines = mermaidCode.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Parse class definitions
      const classDefMatch = trimmedLine.match(/^classDef\s+([A-Za-z0-9_]+)\s+(.*)$/);
      if (classDefMatch) {
        classDefs[classDefMatch[1]] = classDefMatch[2];
        continue;
      }
      
      // Parse style assignments
      const classMatch = trimmedLine.match(/^class\s+([A-Z0-9_,\s]+)\s+([A-Za-z0-9_\s,]+)$/);
      if (classMatch) {
        const nodeIds = classMatch[1].split(',').map(id => id.trim());
        const classList = classMatch[2].split(',').map(cls => cls.trim());
        nodeIds.forEach(nodeId => {
          if (!nodeStyles[nodeId]) nodeStyles[nodeId] = [];
          nodeStyles[nodeId].push(...classList);
        });
      }
    }
    
    return { classDefs, nodeStyles };
  }
  
  private static parseComments(mermaidCode: string): string[] {
    const comments: string[] = [];
    const lines = mermaidCode.split('\n');
    
    for (const line of lines) {
      if (line.trim().startsWith('%%')) {
        comments.push(line.trim());
      }
    }
    
    return comments;
  }
  
  private static extractNodeSyntax(mermaidCode: string, nodeId: string): string {
    const lines = mermaidCode.split('\n');
    for (const line of lines) {
      if (line.includes(nodeId) && !line.trim().startsWith('%%') && line.includes('-->')) {
        return line.trim();
      }
    }
    return '';
  }
  
  private static extractEdgeSyntax(mermaidCode: string, edgeId: string): string {
    // This would need to be implemented with more advanced parsing
    return '';
  }
  
  private static extractGroupSyntax(mermaidCode: string, groupId: string): string {
    const lines = mermaidCode.split('\n');
    let inSubgraph = false;
    let subgraphLines: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Detect subgraph start
      const subgraphMatch = trimmedLine.match(/^subgraph\s+([A-Za-z0-9_]+)(?:\s*\[(.*?)\])?/i);
      if (subgraphMatch && subgraphMatch[1] === groupId) {
        inSubgraph = true;
        subgraphLines.push(line); // Keep original indentation
        continue;
      }
      
      // Detect subgraph end
      if (inSubgraph && trimmedLine === 'end') {
        subgraphLines.push(line); // Keep original indentation
        inSubgraph = false;
        break;
      }
      
      // Collect lines within subgraph
      if (inSubgraph) {
        subgraphLines.push(line); // Keep original indentation
      }
    }
    
    return subgraphLines.join('\n');
  }
  
  private static extractNodeComments(mermaidCode: string, nodeId: string): string[] {
    // This would need to be implemented with more advanced parsing
    return [];
  }
  
  private static extractEdgeComments(mermaidCode: string, edgeId: string): string[] {
    // This would need to be implemented with more advanced parsing
    return [];
  }
  
  private static extractGroupComments(mermaidCode: string, groupId: string): string[] {
    // This would need to be implemented with more advanced parsing
    return [];
  }
  
  private static findNodeSubgraph(nodeId: string, groups: DiagramGroup[]): string | undefined {
    for (const group of groups) {
      if (group.nodeIds.includes(nodeId)) {
        return group.id;
      }
    }
    return undefined;
  }
  
  private static nodeToMermaidSyntax(node: DiagramNode): string {
    // Determine shape based on node type
    let nodeSyntax = '';
    switch(node.type) {
      case 'start':
      case 'end':
      case 'event':
        nodeSyntax = `${node.id}(${node.label})`;
        break;
      case 'gateway':
        nodeSyntax = `${node.id}{${node.label}}`;
        break;
      default:
        nodeSyntax = `${node.id}[${node.label}]`;
        break;
    }
    return nodeSyntax;
  }
}
