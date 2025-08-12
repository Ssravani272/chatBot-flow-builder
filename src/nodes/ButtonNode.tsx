import { Handle, Position, type NodeProps as RFNodeProps } from 'reactflow';
import '../styles.css';

type Data = { text: string; label: string };

export function ButtonNode({ data, selected }: RFNodeProps<Data>) {
  return (
    <div className={`node-card ${selected ? 'node-card--selected' : ''}`}>
      <div className="node-card__header">Button</div>
      <div className="node-card__body" style={{ display:'grid', gap:8 }}>
        <div>{data.text}</div>
        <button
          type="button"
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #CBD5E1',
            background: '#fff',
            cursor: 'default',
            width: 'fit-content'
          }}
        >
          {data.label}
        </button>
      </div>

      {/* many incoming allowed */}
      <Handle type="target" position={Position.Left} id="in" style={{ width:8, height:8, background:'#111' }} />
      {/* one outgoing enforced by your isValidConnection */}
      <Handle type="source" position={Position.Right} id="out" style={{ width:8, height:8, background:'#111' }} />
    </div>
  );
}

export function ButtonInspector({
  node,
  onChange,
}: {
  node: { data: Data };
  onChange: (patch: Partial<Data>) => void;
}) {
  return (
    <>
      <div className="settings__header">Button</div>

      <label className="settings__label">Text</label>
      <textarea
        className="settings__textarea"
        rows={4}
        value={node.data.text}
        onChange={(e) => onChange({ text: e.target.value })}
      />

      <label className="settings__label">Button label</label>
      <input
        className="settings__textarea"
        value={node.data.label}
        onChange={(e) => onChange({ label: e.target.value })}
      />
    </>
  );
}
