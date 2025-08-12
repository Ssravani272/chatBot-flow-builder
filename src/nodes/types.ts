import type {
  Node as RFNode,
  NodeProps as RFNodeProps,
} from 'reactflow';
import React from 'react';

export type NodeKind = 'text' | 'delay' | 'button';

/** Each node type's data lives here */
export type NodeDataMap = {
  text: { text: string };
  delay: { ms: number };
  button: { text: string; label: string };
};

export type AnyData = NodeDataMap[keyof NodeDataMap];

/** Convenience types */
export type ChatNode<K extends NodeKind = NodeKind> =
  RFNode<NodeDataMap[K], K>;

export type InspectorProps<K extends NodeKind> = {
  node: ChatNode<K>;
  onChange: (patch: Partial<NodeDataMap[K]>) => void;
};

/** What every node definition must provide */
export type NodeDef<K extends NodeKind> = {
  kind: K;
  label: string;
  icon?: React.ReactNode;
  makeData(): NodeDataMap[K];
  Component: React.ComponentType<RFNodeProps<NodeDataMap[K]>>;
  Inspector: React.ComponentType<InspectorProps<K>>;
  /** Optional per-type rules */
  rules?: {
    maxOutgoing?: number; // defaults to 1
  };
};
