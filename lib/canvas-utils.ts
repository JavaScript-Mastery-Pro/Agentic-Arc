import type { Bounds, CanvasNode, Point } from "@/types/canvas";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function getNodeCenter(node: CanvasNode): Point {
  const w = node.width ?? 260;
  const h = node.height ?? 120;

  return {
    x: (node.position?.x ?? 0) + w / 2,
    y: (node.position?.y ?? 0) + h / 2,
  };
}

export function getBoundsFromNodes(nodes: CanvasNode[]): Bounds | null {
  if (nodes.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    const x = node.position?.x ?? 0;
    const y = node.position?.y ?? 0;
    const w = node.width ?? 260;
    const h = node.height ?? 120;

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + w > maxX) maxX = x + w;
    if (y + h > maxY) maxY = y + h;
  }

  return { minX, minY, maxX, maxY };
}

export function getRandomPointInBounds(bounds: Bounds): Point {
  return {
    x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
    y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
  };
}

export function getMidpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function getEdgeHandles(
  source: CanvasNode,
  target: CanvasNode,
): { sourceHandle: string; targetHandle: string } {
  const sc = getNodeCenter(source);
  const tc = getNodeCenter(target);
  const dx = tc.x - sc.x;
  const dy = tc.y - sc.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0
      ? { sourceHandle: "right", targetHandle: "left" }
      : { sourceHandle: "left", targetHandle: "right" };
  }

  return dy > 0
    ? { sourceHandle: "bottom", targetHandle: "top" }
    : { sourceHandle: "top", targetHandle: "bottom" };
}
