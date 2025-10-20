import type { CSSProperties } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { MarkerType, Position } from '@xyflow/react';

import { MermaidRenderer } from './mermaidRenderer';

interface ExtendedNodeData {
  label: string;
  nodeType?: string;
}

interface ParsedGroup {
  id: string;
  label: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  classes: string[];
  style: CSSProperties;
}

interface DiagramMetadata {
  diagramType: string;
  diagramDirection: string;
}

export class MermaidConverter {
  static async mermaidToReactFlow(
    mermaidCode: string,
  ): Promise<{
    nodes: Node[];
    edges: Edge[];
    groups: ParsedGroup[];
    diagramType: string;
    diagramDirection: string;
  }> {
    const metadata = this.extractDiagramMetadata(mermaidCode);

    if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
      try {
        const { svg } = await MermaidRenderer.render(`reactflow-${Date.now()}`, mermaidCode);
        const parsed = this.parseSvgDiagram(svg);

        if (parsed.nodes.length > 0) {
          return { ...parsed, ...metadata };
        }
      } catch (error) {
        console.warn('MermaidConverter: SVG parsing failed, falling back to legacy parser.', error);
      }
    }

    const fallback = this.legacyMermaidToReactFlow(mermaidCode);
    return { ...fallback, ...metadata };
  }

  private static parseSvgDiagram(svg: string): {
    nodes: Node[];
    edges: Edge[];
    groups: ParsedGroup[];
  } {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');

    if (doc.querySelector('parsererror')) {
      throw new Error('Failed to parse Mermaid SVG output');
    }

    const rootGroup = doc.querySelector('svg > g');
    const rootOffset = this.parseTranslate(rootGroup?.getAttribute('transform'));

    const nodes: Node[] = [];
    const nodeElements = Array.from(doc.querySelectorAll<SVGGElement>('g.node'));
    nodeElements.forEach((element, index) => {
      const node = this.createNodeFromSvgElement(element, rootOffset);
      if (node) {
        node.zIndex = index;
        nodes.push(node);
      }
    });

    const groups: ParsedGroup[] = [];
    const groupElements = Array.from(doc.querySelectorAll<SVGGElement>('g.cluster'));
    groupElements.forEach((element) => {
      const group = this.createGroupFromSvgElement(element, rootOffset);
      if (group) {
        groups.push(group);
      }
    });

    const allXPositions = [
      ...nodes.map((node) => node.position.x),
      ...groups.map((group) => group.position.x),
    ];
    const allYPositions = [
      ...nodes.map((node) => node.position.y),
      ...groups.map((group) => group.position.y),
    ];

    if (allXPositions.length > 0 && allYPositions.length > 0) {
      const minX = Math.min(...allXPositions);
      const minY = Math.min(...allYPositions);
      const offsetX = minX < 0 ? -minX + 20 : 20;
      const offsetY = minY < 0 ? -minY + 20 : 20;

      nodes.forEach((node) => {
        node.position = {
          x: node.position.x + offsetX,
          y: node.position.y + offsetY,
        };
      });

      groups.forEach((group) => {
        group.position = {
          x: group.position.x + offsetX,
          y: group.position.y + offsetY,
        };
      });
    }

    const edges: Edge[] = [];
    const edgeElements = Array.from(doc.querySelectorAll<SVGGElement>('g.edgePath'));
    edgeElements.forEach((element, index) => {
      const edge = this.createEdgeFromSvgElement(element, index);
      if (edge) {
        edges.push(edge);
      }
    });

    return { nodes, edges, groups };
  }

  private static createNodeFromSvgElement(
    element: SVGGElement,
    rootOffset: { x: number; y: number },
  ): Node | null {
    const rawId = element.getAttribute('id') || '';
    const id = this.normalizeId(rawId);

    if (!id) {
      return null;
    }

    const transform = element.getAttribute('transform') || '';
    const translate = this.parseTranslate(transform);
    const classes = this.extractClassList(element.getAttribute('class'));

    const dimensions = this.extractDimensions(element);
    const position = {
      x: translate.x + rootOffset.x - dimensions.width / 2,
      y: translate.y + rootOffset.y - dimensions.height / 2,
    };

    const label = this.extractLabel(element, id);
    const style = this.extractNodeStyle(element);
    const nodeType = this.inferNodeType(element, classes);

    return {
      id,
      type: nodeType,
      position,
      data: {
        label,
        classes,
        style,
      },
      width: dimensions.width,
      height: dimensions.height,
      style,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      dragging: false,
      selected: false,
    };
  }

  private static createEdgeFromSvgElement(element: SVGGElement, index: number): Edge | null {
    const classAttr = element.getAttribute('class') || '';
    const sourceMatch = classAttr.match(/LS-([^\s]+)/);
    const targetMatch = classAttr.match(/LE-([^\s]+)/);

    if (!sourceMatch || !targetMatch) {
      return null;
    }

    const source = this.normalizeId(sourceMatch[1]);
    const target = this.normalizeId(targetMatch[1]);

    if (!source || !target) {
      return null;
    }

    const classes = this.extractClassList(classAttr);
    const label = this.extractEdgeLabel(element);
    const style = this.extractEdgeStyle(element);

    return {
      id: `edge-${source}-${target}-${index}`,
      source,
      target,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 },
      label,
      style,
      data: {
        label,
        classes,
      },
    };
  }

  private static extractDimensions(element: SVGGElement): { width: number; height: number } {
    const rect = element.querySelector('rect');
    if (rect) {
      const width = parseFloat(rect.getAttribute('width') || '120');
      const height = parseFloat(rect.getAttribute('height') || '60');
      return { width, height };
    }

    const ellipse = element.querySelector('ellipse');
    if (ellipse) {
      const width = 2 * parseFloat(ellipse.getAttribute('rx') || '40');
      const height = 2 * parseFloat(ellipse.getAttribute('ry') || '40');
      return { width, height };
    }

    const circle = element.querySelector('circle');
    if (circle) {
      const radius = parseFloat(circle.getAttribute('r') || '30');
      return { width: radius * 2, height: radius * 2 };
    }

    const polygon = element.querySelector('polygon');
    if (polygon) {
      const points = (polygon.getAttribute('points') || '')
        .trim()
        .split(/\s+/)
        .map((pair) => pair.split(',').map(Number))
        .filter(([x, y]) => !Number.isNaN(x) && !Number.isNaN(y));

      if (points.length > 0) {
        const xs = points.map(([x]) => x);
        const ys = points.map(([, y]) => y);
        return {
          width: Math.max(...xs) - Math.min(...xs),
          height: Math.max(...ys) - Math.min(...ys),
        };
      }
    }

    return { width: 160, height: 60 };
  }

  private static extractLabel(element: SVGGElement, fallback: string): string {
    const foreignObject = element.querySelector('foreignObject');
    if (foreignObject) {
      const div = foreignObject.querySelector('div');
      if (div && div.textContent) {
        const text = div.textContent.trim();
        if (text) {
          return text;
        }
      }
    }

    const textElement = element.querySelector('text');
    if (textElement?.textContent) {
      const text = textElement.textContent.trim();
      if (text) {
        return text;
      }
    }

    return fallback;
  }

  private static extractNodeStyle(element: SVGGElement): CSSProperties {
    const shape = element.querySelector<SVGElement>('rect, ellipse, circle, polygon, path');
    const style: CSSProperties = {};

    if (shape) {
      const fill = shape.getAttribute('fill');
      const stroke = shape.getAttribute('stroke');
      const strokeWidth = shape.getAttribute('stroke-width');

      if (fill && fill !== 'none') {
        style.background = fill;
      }

      if (stroke && stroke !== 'none') {
        style.border = `${strokeWidth || 1}px solid ${stroke}`;
      }
    }

    return style;
  }

  private static extractEdgeLabel(element: SVGGElement): string | undefined {
    const directLabel =
      element.querySelector('text') ||
      element.querySelector('foreignObject div') ||
      element.parentElement?.querySelector('g.edgeLabel text') ||
      element.parentElement?.querySelector('g.edgeLabel foreignObject div');

    const label = directLabel?.textContent?.trim();
    return label || undefined;
  }

  private static extractEdgeStyle(element: SVGGElement): CSSProperties {
    const path = element.querySelector('path');
    const style: CSSProperties = {};

    if (path) {
      const stroke = path.getAttribute('stroke');
      const strokeWidth = path.getAttribute('stroke-width');
      const dashArray = path.getAttribute('stroke-dasharray');

      if (stroke && stroke !== 'none') {
        style.stroke = stroke;
      }

      if (strokeWidth) {
        const numeric = Number(strokeWidth);
        if (!Number.isNaN(numeric)) {
          style.strokeWidth = numeric;
        }
      }

      if (dashArray) {
        style.strokeDasharray = dashArray;
      }
    }

    return style;
  }

  private static createGroupFromSvgElement(
    element: SVGGElement,
    rootOffset: { x: number; y: number },
  ): ParsedGroup | null {
    const rawId = element.getAttribute('id') || '';
    const id = this.normalizeId(rawId);
    if (!id) {
      return null;
    }

    const rect = element.querySelector('rect');
    if (!rect) {
      return null;
    }

    const translate = this.parseTranslate(element.getAttribute('transform') || '');
    const classes = this.extractClassList(element.getAttribute('class'));

    const x = parseFloat(rect.getAttribute('x') || '0');
    const y = parseFloat(rect.getAttribute('y') || '0');
    const width = parseFloat(rect.getAttribute('width') || '0');
    const height = parseFloat(rect.getAttribute('height') || '0');

    const position = {
      x: x + translate.x + rootOffset.x,
      y: y + translate.y + rootOffset.y,
    };

    const label = this.extractLabel(element, id);
    const style = this.extractNodeStyle(element);

    return {
      id,
      label,
      position,
      width,
      height,
      classes,
      style,
    };
  }

  private static inferNodeType(element: SVGGElement, classes: string[]): string {
    const shape = element.querySelector('ellipse, circle, polygon');
    if (shape?.tagName === 'ellipse' || shape?.tagName === 'circle') {
      return 'event';
    }

    if (shape?.tagName === 'polygon') {
      return 'gateway';
    }

    if (classes.some((cls) => /start|end|event/i.test(cls))) {
      return 'event';
    }

    return 'task';
  }

  private static extractClassList(classAttr: string | null): string[] {
    if (!classAttr) {
      return [];
    }
    return classAttr
      .split(/\s+/)
      .map((cls) => cls.trim())
      .filter(Boolean);
  }

  private static parseTranslate(transform?: string | null): { x: number; y: number } {
    if (!transform) {
      return { x: 0, y: 0 };
    }

    const match = transform.match(/translate\(\s*([-\d.]+)(?:\s*,\s*([-\d.]+))?\s*\)/);
    if (!match) {
      return { x: 0, y: 0 };
    }

    const x = parseFloat(match[1] || '0');
    const y = parseFloat(match[2] || '0');
    return {
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : 0,
    };
  }

  private static normalizeId(rawId: string): string {
    if (!rawId) {
      return '';
    }

    return rawId
      .replace(/^flowchart-/, '')
      .replace(/^stateDiagram-/, '')
      .replace(/^classDiagram-/, '')
      .replace(/^sequenceDiagram-/, '')
      .trim();
  }

  private static extractDiagramMetadata(mermaidCode: string): DiagramMetadata {
    let diagramType = 'graph';
    let diagramDirection = 'TD';

    const lines = mermaidCode.split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('%%')) {
        continue;
      }

      const match = line.match(/^(graph|flowchart)\s+(TD|TB|LR|RL|BT)/i);
      if (match) {
        diagramType = match[1];
        diagramDirection = match[2];
        break;
      }
    }

    return { diagramType, diagramDirection };
  }

  private static legacyMermaidToReactFlow(mermaidCode: string): {
    nodes: Node[];
    edges: Edge[];
    groups: ParsedGroup[];
  } {
    const lines = mermaidCode.split('\n');
    const edges: { source: string; target: string }[] = [];
    const nodeMap = new Map<string, ExtendedNodeData>();

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('%%')) {
        continue;
      }

      const nodeRegex = /([A-Za-z0-9_-]+)(?:\[(.*?)\]|{(.*?)}|\((.*?)\))/gi;
      let nodeMatch;
      while ((nodeMatch = nodeRegex.exec(trimmedLine)) !== null) {
        const nodeId = nodeMatch[1];
        const rectLabel = nodeMatch[2];
        const diamondLabel = nodeMatch[3];
        const circleLabel = nodeMatch[4];

        let nodeLabel = rectLabel || diamondLabel || circleLabel || nodeId;
        let nodeType: string | undefined;

        if (circleLabel !== undefined) {
          nodeType = 'event';
        } else if (diamondLabel !== undefined) {
          nodeType = 'gateway';
        } else if (rectLabel !== undefined) {
          nodeType = 'task';
        } else {
          nodeType = 'default';
        }

        if (!nodeMap.has(nodeId)) {
          nodeMap.set(nodeId, { label: nodeLabel, nodeType });
        }
      }

      const sanitizedLine = trimmedLine
        .replace(/\|\s*[^|]*\s*\|/g, '')
        .replace(/--[^-<>]*?-->/g, '-->')
        .replace(/-\.?[^.<>]*?\.->/g, '-.->')
        .replace(/==[^=<>]*?=>/g, '==>')
        .replace(/~~[^~<>]*?~>/g, '~~>');

      const connectorPatterns = [
        '-->',
        '==>',
        '-\\.->',
        '\\.\\.>',
        '~~>',
        '->',
        '<-',
        '<-->',
        '<->',
        '--',
        '==',
        '~~',
      ].join('|');

      const edgeRegex = new RegExp(
        `([A-Za-z0-9_-]+)(?:\\[(.*?)\\]|{(.*?)}|\\((.*?)\\))?\\s*(?:${connectorPatterns})\\s*([A-Za-z0-9_-]+)(?:\\[(.*?)\\]|{(.*?)}|\\((.*?)\\))?`,
        'gi',
      );

      let edgeMatch;
      while ((edgeMatch = edgeRegex.exec(sanitizedLine)) !== null) {
        const sourceId = edgeMatch[1];
        const targetId = edgeMatch[5];

        if (!nodeMap.has(sourceId)) {
          nodeMap.set(sourceId, { label: sourceId, nodeType: 'default' });
        }

        if (!nodeMap.has(targetId)) {
          nodeMap.set(targetId, { label: targetId, nodeType: 'default' });
        }

        if (!edges.some((edge) => edge.source === sourceId && edge.target === targetId)) {
          edges.push({ source: sourceId, target: targetId });
        }
      }
    }

    const positions = this.calculateLegacyPositions(edges, Array.from(nodeMap.keys()));

    const nodes: Node[] = [];
    for (const [id, nodeData] of nodeMap) {
      const pos = positions.get(id) || { x: 100, y: 100 };
      nodes.push({
        id,
        type: nodeData.nodeType || 'default',
        position: pos,
        data: { label: nodeData.label },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        width: 120,
        height: 60,
        selected: false,
        dragging: false,
      });
    }

    const reactFlowEdges: Edge[] = edges.map((edge, index) => ({
      id: `legacy-edge-${edge.source}-${edge.target}-${index}`,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 },
      data: {},
    }));

    return { nodes, edges: reactFlowEdges, groups: [] };
  }

  private static calculateLegacyPositions(
    edges: { source: string; target: string }[],
    allNodeIds: string[],
  ): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>();

    const allTargets = new Set(edges.map((edge) => edge.target));
    const rootNodes = allNodeIds.filter((id) => !allTargets.has(id));

    if (rootNodes.length === 0) {
      return this.arrangeInLegacyGrid(allNodeIds);
    }

    const outgoingEdges = new Map<string, string[]>();
    for (const edge of edges) {
      if (!outgoingEdges.has(edge.source)) {
        outgoingEdges.set(edge.source, []);
      }
      outgoingEdges.get(edge.source)!.push(edge.target);
    }

    const processed = new Set<string>();
    const queue = [...rootNodes];
    const levels = new Map<string, number>();

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (processed.has(nodeId)) continue;

      processed.add(nodeId);

      let nodeLevel = 0;
      if (!rootNodes.includes(nodeId)) {
        const incomingEdges = edges.filter((edge) => edge.target === nodeId);
        if (incomingEdges.length > 0) {
          const parentLevels = incomingEdges
            .map((edge) => levels.get(edge.source))
            .filter((level): level is number => level !== undefined);
          if (parentLevels.length > 0) {
            nodeLevel = Math.max(...parentLevels) + 1;
          }
        }
      }
      levels.set(nodeId, nodeLevel);

      const children = outgoingEdges.get(nodeId) || [];
      for (const child of children) {
        if (!processed.has(child)) {
          queue.push(child);
        }
      }
    }

    const nodesByLevel = new Map<number, string[]>();
    for (const [node, level] of levels) {
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)!.push(node);
    }

    for (const [level, nodesAtLevel] of nodesByLevel) {
      const xStart = 200;
      const xSpacing = 300;
      const y = 150 + level * 200;

      nodesAtLevel.forEach((nodeId, index) => {
        const x = xStart + index * xSpacing;
        positions.set(nodeId, { x, y });
      });
    }

    for (const nodeId of allNodeIds) {
      if (!positions.has(nodeId)) {
        const index = allNodeIds.indexOf(nodeId);
        const x = 200 + (index % 5) * 300;
        const y = 150 + Math.floor(index / 5) * 200;
        positions.set(nodeId, { x, y });
      }
    }

    return positions;
  }

  private static arrangeInLegacyGrid(nodeIds: string[]): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>();
    const cols = 5;
    const xSpacing = 300;
    const ySpacing = 200;

    nodeIds.forEach((id, index) => {
      const x = 200 + (index % cols) * xSpacing;
      const y = 150 + Math.floor(index / cols) * ySpacing;
      positions.set(id, { x, y });
    });

    return positions;
  }

  static reactFlowToMermaid(
    nodes: Node[],
    edges: Edge[],
    diagramType: string = 'graph',
    diagramDirection: string = 'TD',
  ): string {
    const nodeStatements = nodes
      .map((node) => {
        const label = (node.data as any)?.label || node.id;
        switch (node.type) {
          case 'gateway':
            return `${node.id}{${label}}`;
          case 'event':
          case 'start':
          case 'end':
            return `${node.id}(${label})`;
          case 'task':
          default:
            return `${node.id}[${label}]`;
        }
      })
      .join('\n    ');

    const edgeStatements = edges.map((edge) => `${edge.source} --> ${edge.target}`).join('\n    ');

    return `${diagramType} ${diagramDirection}\n    ${nodeStatements}\n    ${edgeStatements}`;
  }
}
