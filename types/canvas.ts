import type { Edge, Node } from "@xyflow/react";

export type NodeShape =
  | "rectangle"
  | "diamond"
  | "circle"
  | "pill"
  | "cylinder"
  | "hexagon";

export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const;

// Node fill/text pairs tuned for readable labels on the dark canvas.
export const NODE_COLORS = [
  { nodeColor: "#1F1F1F", textColor: "#EDEDED" },
  { nodeColor: "#10233D", textColor: "#52A8FF" },
  { nodeColor: "#2E1938", textColor: "#BF7AF0" },
  { nodeColor: "#331B00", textColor: "#FF990A" },
  { nodeColor: "#3C1618", textColor: "#FF6166" },
  { nodeColor: "#3A1726", textColor: "#F75F8F" },
  { nodeColor: "#0F2E18", textColor: "#62C073" },
  { nodeColor: "#062822", textColor: "#0AC7B4" },
] as const;

export const DEFAULT_NODE_COLOR = NODE_COLORS[0].nodeColor;
export const DEFAULT_NODE_TEXT_COLOR = NODE_COLORS[0].textColor;
export const DEFAULT_EDGE_COLOR = "#f8fafc";

export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color: string;
  textColor?: string;
  shape?: NodeShape;
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">;
export type CanvasEdge = Edge;

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
