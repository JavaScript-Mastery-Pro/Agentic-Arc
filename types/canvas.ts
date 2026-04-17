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

// Vivid dark hues that remain readable with light text on the dark canvas.
export const NODE_COLORS = [
  "#1E293B", // slate (Standard default)
  "#1E3A8A", // deep blue
  "#0369A1", // marine / sky
  "#0F766E", // pine / teal
  "#065F46", // forest / emerald
  "#3730A3", // deep indigo
  "#5B21B6", // amethyst / purple
  "#86198F", // plum / fuchsia
  "#9F1239", // ruby / rose
  "#9A3412", // rust / orange
  "#78350F", // mocha / amber
  "#27272A", // charcoal / zinc
] as const;

export const DEFAULT_NODE_COLOR = NODE_COLORS[0];
export const DEFAULT_EDGE_COLOR = "#e2e8f0";

export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color: string;
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
