import { useCallback, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles.css';
import { nanoid } from 'nanoid';

// ---- type-only imports (works with "verbatimModuleSyntax": true)
import type {
  Connection as RFConnection,
  Edge as RFEdge,
  Node as RFNode,
} from 'reactflow';
import type { ChatNode, NodeKind, NodeDataMap } from './nodes/types';
import { nodeTypes, palette, makeDataByKind, getDef } from './nodes/registry';

/* ================= Top Bar ================= */
function TopBar({
  canSave,
  showError,
  onSave,
}: {
  canSave: boolean;
  showError: boolean;
  onSave: () => void;
}) {
  return (
    <div className="topbar">
      <div />
      <button
        className={`save-btn ${canSave ? 'save-btn--primary' : 'save-btn--disabled'}`}
        onClick={onSave}
      >
        Save Changes
      </button>
      {showError && <div className="error-pill">Cannot save Flow</div>}
    </div>
  );
}

/* ================= Right: Nodes Panel (auto from registry) ================= */
function NodesPanel() {
  const onDragStart = (e: React.DragEvent, kind: NodeKind) => {
    e.dataTransfer.setData('application/reactflow', kind);
    e.dataTransfer.effectAllowed = 'move';
  };
  return (
    <aside className="side-panel">
      {palette.map((p) => (
        <button
          key={p.kind}
          className="tile"
          draggable
          onDragStart={(e) => onDragStart(e, p.kind)}
          title="Drag to canvas"
        >
          <span className="tile__icon">{p.icon}</span>
          <span className="tile__label">{p.label}</span>
        </button>
      ))}
    </aside>
  );
}

/* ================= Right: Settings Panel (renders per-type inspector) ================= */
function SettingsPanel({
  selected,
  onPatch,
  onBack,
}: {
  selected: ChatNode | null;
  onPatch: (patch: Record<string, unknown>) => void;
  onBack: () => void;        // <-- new
}) {
  if (!selected) return null;

  const def = getDef(selected.type as NodeKind);
  const Inspector: any = def.Inspector;

  return (
    <aside className="side-panel">
      <div className="settings__top">
 <button
          type="button"
          className="back-btn"
          onClick={onBack}
          aria-label="Back to nodes"
          title="Back"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ display: 'block' }}
          >
            <path
              d="M15 6l-6 6 6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="settings__title">{def.label}</div>
      </div>

      {/* actual settings UI for the selected node */}
      <Inspector node={selected} onChange={onPatch} />
    </aside>
  );
}


/*  Canvas */
function CanvasInner() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const rf = useReactFlow();

  // IMPORTANT: pass the *data* union to useNodesState (supports many node kinds)
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeDataMap[NodeKind]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge>([]);
  const [selected, setSelected] = useState<ChatNode | null>(null);

  // Per-type connection rule: by default 1 outgoing; can be overridden in registry.rules.maxOutgoing
  const isValidConnection = useCallback(
    (c: RFConnection) => {
      if (!c.source || !c.sourceHandle) return false;

      const source = (nodes as ChatNode[]).find((n) => n.id === c.source);
      const maxOut = source ? getDef(source.type as NodeKind).rules?.maxOutgoing ?? 1 : 1;

      const existing = edges.filter(
        (e) => e.source === c.source && e.sourceHandle === c.sourceHandle
      ).length;

      return existing < maxOut;
    },
    [nodes, edges]
  );

  const onConnect = useCallback(
    (c: RFConnection) => {
      if (!isValidConnection(c)) return;
      setEdges((eds) => addEdge({ ...c }, eds));
    },
    [isValidConnection, setEdges]
  );

  // Edge right arrow marker 
  const defaultEdgeOptions = {
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: '#111827',
  },
  style: { stroke: '#111827', strokeWidth: 1.5 },
} as const;


  // drag & drop new node (kind is provided by NodesPanel via dataTransfer)
  const onDrop = useCallback(
    (evt: React.DragEvent) => {
      evt.preventDefault();
      const kind = evt.dataTransfer.getData('application/reactflow') as NodeKind;
      if (!kind || !wrapperRef.current) return;

      const bounds = wrapperRef.current.getBoundingClientRect();
      const projected = rf.project({
        x: evt.clientX - bounds.left,
        y: evt.clientY - bounds.top,
      });

      const newNode: ChatNode = {
        id: nanoid(6),
        type: kind,
        position: { x: projected.x - 150, y: projected.y - 20 },
        data: makeDataByKind(kind) as any,
      };

      setNodes((nds) => [...(nds as ChatNode[]), newNode]);
    },
    [rf, setNodes]
  );

  const onDragOver = (evt: React.DragEvent) => {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'move';
  };

  const onNodeClick = useCallback(( node: ChatNode) => setSelected(node), []);
  const onPaneClick = useCallback(() => setSelected(null), []);

  // Inspector patcher (type-agnostic)
  const patchSelected = (patch: Record<string, unknown>) => {
    if (!selected) return;
    setNodes((nds) =>
      (nds as ChatNode[]).map((n) =>
        n.id === selected.id ? ({ ...n, data: { ...n.data, ...patch } } as ChatNode) : n
      )
    );
    setSelected({ ...selected, data: { ...selected.data, ...patch } });
  };

  // Save validation: if >1 nodes and >1 node has zero incoming edges -> error
  const startNodeCount = useMemo(() => {
    const incoming = new Map<string, number>();
    (nodes as ChatNode[]).forEach((n) => incoming.set(n.id, 0));
    edges.forEach((e) => incoming.set(e.target, (incoming.get(e.target) || 0) + 1));
    let zeros = 0;
    incoming.forEach((v) => v === 0 && zeros++);
    return zeros;
  }, [nodes, edges]);

  const canSave = useMemo(() => {
    if ((nodes as ChatNode[]).length <= 1) return true;
    return startNodeCount <= 1;
  }, [nodes, startNodeCount]);

  const onSave = () => {
    if (!canSave) return;
    localStorage.setItem('chatbot-flow', JSON.stringify({ nodes, edges }));
    alert('Saved ✅');
  };

  return (
    <div className="app">
      <TopBar
        canSave={canSave}
        showError={!canSave && (nodes as ChatNode[]).length > 1}
        onSave={onSave}
      />

      <div className="workspace">
        <div ref={wrapperRef} className="canvas" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes as RFNode[]}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            isValidConnection={isValidConnection}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        {selected ? (
          <SettingsPanel
            selected={selected}
            onPatch={patchSelected}        // your existing patcher
            onBack={() => setSelected(null)} // <-- deselect to return to Nodes panel
          />
        ) : (
          <NodesPanel />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
