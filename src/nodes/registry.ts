// src/nodes/registry.ts
import type { NodeTypes, NodeProps as RFNodeProps } from 'reactflow';
import type { NodeDef } from './types';
import { TextNode, TextInspector } from './TextNode';
import { DelayNode, DelayInspector } from './DelayNode';
import { ButtonNode, ButtonInspector } from './ButtonNode';

/** Strongly-typed registry entries (each entry pins its own data type) */
export const REGISTRY = [
  {
    kind: 'text',
    label: 'Message',
    icon: '💬',
    makeData: () => ({ text: 'text message' }),
    Component: TextNode,
    Inspector: TextInspector,
    rules: { maxOutgoing: 1 },
  } satisfies NodeDef<'text'>,

  {
    kind: 'delay',
    label: 'Delay',
    icon: '⏱️',
    makeData: () => ({ ms: 1000 }),
    Component: DelayNode,
    Inspector: DelayInspector,
    rules: { maxOutgoing: 1 },
  } satisfies NodeDef<'delay'>,

   {
    kind: 'button',
    label: 'Button',
    icon: '🔘',
    makeData: () => ({ text: 'Show this and…', label: 'Click me' }),
    Component: ButtonNode,
    Inspector: ButtonInspector,
    rules: { maxOutgoing: 1 }, // keep one edge from source handle
  } satisfies NodeDef<'button'>,
] as const;

export type Registry = typeof REGISTRY;

/** Palette for the Nodes Panel */
export const palette = REGISTRY.map((d) => ({
  kind: d.kind,
  label: d.label,
  icon: d.icon,
}));

/** Helpers */
export const getDef = <K extends Registry[number]['kind']>(kind: K) =>
  REGISTRY.find((d) => d.kind === kind)!;

export const makeDataByKind = (kind: Registry[number]['kind']) =>
  getDef(kind).makeData();

/** ---- Bridge to React Flow's NodeTypes ----
 * NodeTypes requires a uniform component signature: ComponentType<NodeProps<any>>
 * Our components are typed per-node (NodeProps<{text}> / NodeProps<{ms}>).
 * Widen them to 'any' at this boundary only.
 */
type AnyNodeComponent = React.ComponentType<RFNodeProps<any>>;

export const nodeTypes: NodeTypes = Object.fromEntries(
  REGISTRY.map((d) => [d.kind, d.Component as AnyNodeComponent])
) as NodeTypes;
