import { Handle, Position, type NodeProps as RFNodeProps } from 'reactflow';
import '../styles.css';

type Data = { ms: number };

export function DelayNode({ data, selected }: RFNodeProps<Data>) {
  const seconds = Math.max(0, Math.round(data.ms / 100) / 10); // show 1 decimal
  return (
    <div className={`node-card ${selected ? 'node-card--selected' : ''}`}>
      <div className="node-card__header">Delay</div>
      <div className="node-card__body">Wait {seconds}s</div>
      <Handle type="target" position={Position.Left} id="in" style={{ width:8, height:8, background:'#111' }} />
      <Handle type="source" position={Position.Right} id="out" style={{ width:8, height:8, background:'#111' }} />
    </div>
  );
}

export function DelayInspector({
  node,
  onChange,
}: {
  node: { data: Data };
  onChange: (patch: Partial<Data>) => void;
}) {
  return (
    <>
      <div className="settings__header">Delay</div>
      <label className="settings__label">Milliseconds</label>
      <input
        className="settings__textarea"
        type="number"
        min={0}
        step={100}
        value={node.data.ms}
        onChange={(e) => onChange({ ms: Number(e.target.value || 0) })}
      />
    </>
  );
}
