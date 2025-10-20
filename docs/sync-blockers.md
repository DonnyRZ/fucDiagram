# Visual Editor ↔ Mermaid Preview Mismatch

This document captures the current blockers that prevent the React Flow “visual editor” from presenting the same diagram that Mermaid renders in the code preview. All findings are based on a full review of the TypeScript/React implementation in this repository.

## 1. Cluster / Subgraph Hierarchy Is Lost

- Mermaid renders every `subgraph` as a `<g>` container with its own translation (`transform="translate(x,y)"`) and then positions each child node *relative* to that container.
- During conversion (`src/services/mermaidConverter.ts:56-237`) we flatten the DOM structure and record only the child node’s local `x/y`. The parent ID (and the accumulated transform chain) is discarded.
- React Flow therefore treats every node as top-level (`convertModelNodesToReactFlow`, `src/components/diagram/InteractiveFlowEditor.tsx:284-333`). Group nodes are drawn as independent rectangles with no children, so their members float at incorrect absolute positions, and clusters can never mirror the Mermaid preview.

### Required Fix
Parse the SVG hierarchy, store the full parent/child relationship (plus cumulative offsets), and when building React Flow state nest child nodes under their cluster using `parentNode` + `extent: 'parent'`. Without this, true “Single Source of Truth” alignment is impossible.

## 2. Edge Geometry Gets Rebuilt From Scratch

- Mermaid emits a `<path d="…">` describing the exact routed curve—including bends, control points, and arrow placement—for every connector.
- The converter keeps only the source/target IDs and throws away the path (`src/services/mermaidConverter.ts`), while the visual editor recreates each edge with React Flow’s default `smoothstep` (`src/components/diagram/InteractiveFlowEditor.tsx:340-368`).
- As a result, edges in the canvas take entirely different routes, lose labels, and frequently overlap nodes that Mermaid avoids.

### Required Fix
Persist Mermaid’s `d` attribute in the unified model and render a custom React Flow edge component that reuses the original SVG path. Otherwise the canvas will never match Mermaid’s topology.

## 3. Styling Only Partially Survives

- `UnifiedMermaidConverter.combineClassStyles` merges Mermaid `classDef` rules into inline styles, but the pipeline assumes every element is independent. Because hierarchy is missing, group styles (e.g., yellow cluster backgrounds) apply to a standalone rectangle rather than the nodes it should wrap.
- Edge styles defined via `class EDGE` or similar never propagate to the React Flow edge renderer, so stroke colour/dash instructions disappear.
- Class-based fonts, corner radii, and padding are inconsistently mapped, leaving the visual editor with fallbacks instead of the curated appearance seen in the Mermaid preview.

### Required Fix
Once hierarchy and edge geometry are preserved, extend the style mapping to:
1. Apply class-driven styles to the nested children inside each cluster.
2. Feed edge class styles (stroke, dasharray, arrow colour) into the custom edge renderer.
3. Respect font and padding values during node rendering so text blocks mirror Mermaid.

## 4. Round-Trip Synchronisation Remains Manual

- Even after Mermaid → React Flow alignment is solved, the reverse direction still depends on the user clicking “Update Mermaid Code” (`InteractiveFlowEditor.onSaveDiagram`). Dragging a node should feed the positional delta back into the unified model so the Mermaid editor stays in sync automatically.
- Without automated commits into the model (and subsequently the Mermaid code), the app keeps diverging as soon as the user edits on the canvas.

### Required Fix
After React Flow nodes adopt the hierarchical structure, capture movement/resize events, update the stored offsets, and regenerate Mermaid code immediately (or at least queue it via debounced updates). This closes the loop envisioned in `Single-Source-of-Truth.md`.

---

**Summary:** The mismatch is not a cosmetic bug but a pipeline gap. Mermaid already solves layout, clustering, and styling, but our converter discards that structure. To reach true single-source synchronisation we must preserve hierarchy, reuse edge paths, map class styles faithfully, and propagate canvas edits back to the Mermaid code. Until then, the Mermaid preview and the visual editor will continue to diverge. 
