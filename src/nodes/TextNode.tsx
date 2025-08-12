import { Handle, Position, type NodeProps as RFNodeProps } from 'reactflow';
import React from 'react';
import '../styles.css';

type Data = { text: string };

export function TextNode({ data, selected }: RFNodeProps<Data>) {
  return (
    <div className={`node-card ${selected ? 'node-card--selected' : ''}`}>
      <div className="node-card__header">Send Message</div>
      <div className="node-card__body">{data.text}</div>
      <Handle type="target" position={Position.Left} id="in" style={{ width:8, height:8, background:'#111' }} />
      <Handle type="source" position={Position.Right} id="out" style={{ width:8, height:8, background:'#111' }} />
    </div>
  );
}

export function TextInspector({
  node,
  onChange,
}: {
  node: { data: Data };
  onChange: (patch: Partial<Data>) => void;
}) {
  return (
    <>
      <div className="settings__header">Message</div>
      <label className="settings__label">Text</label>
      <textarea
        className="settings__textarea"
        rows={6}
        value={node.data.text}
        onChange={(e) => onChange({ text: e.target.value })}
      />
    </>
  );
}
