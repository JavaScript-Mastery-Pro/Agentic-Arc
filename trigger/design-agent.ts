import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Liveblocks } from "@liveblocks/node";
import { mutateFlow } from "@liveblocks/react-flow/node";
import { task } from "@trigger.dev/sdk";
import { generateText, stepCountIs, tool } from "ai";
import { nanoid } from "nanoid";
import { z } from "zod";
import type { Edge, Node } from "@xyflow/react";
import {
  NODE_COLORS as CANVAS_NODE_COLORS,
  NODE_SHAPES as CANVAS_NODE_SHAPES,
} from "@/types/canvas";

// ── Types ───────────────────────────────────────────────────────────
interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color: string;
  textColor?: string;
  shape?: string;
}

type CanvasNode = Node<CanvasNodeData, "canvasNode">;
type CanvasEdge = Edge;

interface Point {
  x: number;
  y: number;
}

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

// ── Constants ───────────────────────────────────────────────────────
const PRESENCE_TTL = 20;
const AGENT_PAUSE_MS = 120;
const CURSOR_THINK_INTERVAL_MS = 1000;
const DEFAULT_BOUNDS_RADIUS = 300;
const ANIMATION_STEPS = 10;

const AGENT_ID = "ai-architect";
const AGENT_INFO = {
  name: "AI Architect",
  avatar: "",
  color: "#6366f1",
};

const NODE_COLOR_VALUES = CANVAS_NODE_COLORS.map((c) => c.nodeColor) as [
  string,
  ...string[],
];
const COLOR_TO_TEXT = Object.fromEntries(
  CANVAS_NODE_COLORS.map((c) => [c.nodeColor, c.textColor]),
) as Record<string, string>;

// ── Helpers ─────────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getNodeCenter(node: CanvasNode): Point {
  const w = node.width ?? 260;
  const h = node.height ?? 120;
  return {
    x: (node.position?.x ?? 0) + w / 2,
    y: (node.position?.y ?? 0) + h / 2,
  };
}

function getBoundsFromNodes(nodes: CanvasNode[]): Bounds | null {
  if (nodes.length === 0) return null;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

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

function getRandomPointInBounds(bounds: Bounds): Point {
  return {
    x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
    y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
  };
}

function getMidpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function getEdgeHandles(
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

// ── Task ────────────────────────────────────────────────────────────
export const designAgent = task({
  id: "design-agent",
  maxDuration: 300,
  retry: {
    maxAttempts: 1,
  },
  run: async (payload: { roomId: string; prompt: string }) => {
    const { roomId, prompt } = payload;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set.");

    const secret = process.env.LIVEBLOCKS_SECRET_KEY;
    if (!secret) throw new Error("LIVEBLOCKS_SECRET_KEY is not set.");

    const gemini = createGoogleGenerativeAI({ apiKey });
    const liveblocks = new Liveblocks({ secret });

    // ── Liveblocks Feed helpers ──────────────────────────────────────
    const STATUS_FEED_ID = "ai-status-feed";

    // Ensure feeds exist (idempotent — no-op if already created)
    await Promise.allSettled([
      liveblocks.createFeed({ roomId, feedId: STATUS_FEED_ID }),
      liveblocks.createFeed({ roomId, feedId: "ai-chat" }),
    ]);

    async function pushStatus(text: string) {
      try {
        await liveblocks.createFeedMessage({
          roomId,
          feedId: STATUS_FEED_ID,
          data: { text },
        });
      } catch {
        // Never break the task if status push fails
      }
    }

    await pushStatus("Starting AI Architect...");

    let lastCursor: Point | null = null;
    let lastThinking = true;

    async function setPresence(opts: {
      cursor?: Point;
      thinking?: boolean;
      ttl?: number;
    }) {
      const cursor = opts.cursor ?? lastCursor;
      const thinking = opts.thinking ?? lastThinking;

      await liveblocks.setPresence(roomId, {
        userId: AGENT_ID,
        data: {
          cursor: cursor ? { x: cursor.x, y: cursor.y } : null,
          thinking,
        },
        userInfo: AGENT_INFO,
        ttl: opts.ttl ?? PRESENCE_TTL,
      });

      if (cursor) lastCursor = cursor;
      lastThinking = thinking;
    }

    function pause() {
      return sleep(AGENT_PAUSE_MS);
    }

    // Sequential queue to avoid race conditions
    let queue: Promise<unknown> = Promise.resolve();
    const enqueue = <T>(fn: () => Promise<T>): Promise<T> => {
      const run = queue.then(() => fn());
      queue = run.then(
        () => undefined,
        () => undefined,
      );
      return run;
    };

    await mutateFlow<CanvasNode, CanvasEdge>(
      { client: liveblocks, roomId },
      async (flow) => {
        const bounds: Bounds = getBoundsFromNodes([...flow.nodes]) ?? {
          minX: -DEFAULT_BOUNDS_RADIUS,
          minY: -DEFAULT_BOUNDS_RADIUS,
          maxX: DEFAULT_BOUNDS_RADIUS,
          maxY: DEFAULT_BOUNDS_RADIUS,
        };

        await setPresence({ cursor: getRandomPointInBounds(bounds) });

        let thinkingInterval: ReturnType<typeof setInterval> | undefined =
          setInterval(() => {
            void setPresence({ cursor: getRandomPointInBounds(bounds) });
          }, CURSOR_THINK_INTERVAL_MS);

        function stopThinking() {
          clearInterval(thinkingInterval);
          thinkingInterval = undefined;
          lastThinking = false;
        }

        try {
          await pushStatus("Analyzing your architecture request...");
          await generateText({
            model: gemini(process.env.GEMINI_MODEL ?? "gemini-2.0-flash"),
            maxOutputTokens: 4096,
            system: `You edit a live collaborative React Flow diagram for system architecture design.

Node shape: { id, position: { x, y }, width, height, data: { label, shape, color, textColor } }.
Edge shape: { id, source, target, sourceHandle, targetHandle }.

Rules:
- All nodes use type "canvasNode".
- Shapes: ${CANVAS_NODE_SHAPES.join(" | ")}.
- Colors (nodeColor hex — textColor is auto-set, do NOT specify it): ${NODE_COLOR_VALUES.join(", ")}.
- Make small, deliberate changes that are easy to follow visually.
- Keep labels short and descriptive.
- Maintain readable spacing and avoid overlap (minimum 50px gap between nodes).
- Use varied shapes and colors to distinguish different types of components (e.g. database=diamond, service=rectangle, queue=pill).
- When creating a system design, lay out nodes in a clean top-to-bottom or left-to-right flow.
- Edge handles should match spatial layout: "bottom"->"top" for vertical, "right"->"left" for horizontal.
- Use moveNode for position, resizeNode for size, updateNodeData for label/shape/color — never mix them.
- Delete nodes or edges only when the user clearly asks.`,

            prompt: `<current-diagram>
${JSON.stringify({ nodes: flow.nodes, edges: flow.edges }, null, 2)}
</current-diagram>

<user-request>
${prompt}
</user-request>`,

            tools: {
              addNode: tool({
                description: "Create one node on the canvas.",
                inputSchema: z.object({
                  id: z.string().optional(),
                  position: z.object({ x: z.number(), y: z.number() }),
                  width: z.number().min(60).max(400).optional(),
                  height: z.number().min(60).max(400).optional(),
                  label: z.string().optional(),
                  shape: z
                    .enum([...CANVAS_NODE_SHAPES] as [string, ...string[]])
                    .optional(),
                  color: z.enum(NODE_COLOR_VALUES).optional(),
                }),
                execute: (input) =>
                  enqueue(async () => {
                    const w = input.width ?? 260;
                    const h = input.height ?? 120;

                    await setPresence({
                      cursor: {
                        x: input.position.x + w / 2,
                        y: input.position.y + h / 2,
                      },
                      thinking: false,
                    });
                    await pause();

                    const id = input.id ?? `node-${nanoid(8)}`;
                    if (flow.getNode(id))
                      return { ok: false, reason: "id_exists", id };

                    const chosenColor =
                      input.color ?? CANVAS_NODE_COLORS[0].nodeColor;
                    flow.addNode({
                      id,
                      type: "canvasNode",
                      position: input.position,
                      width: w,
                      height: h,
                      data: {
                        label: input.label ?? "",
                        color: chosenColor,
                        textColor: COLOR_TO_TEXT[chosenColor],
                        shape: input.shape ?? "rectangle",
                      },
                    } as CanvasNode);

                    await pause();
                    return { ok: true, id };
                  }),
              }),

              moveNode: tool({
                description:
                  "Move one node to a new position with animated cursor.",
                inputSchema: z.object({
                  id: z.string(),
                  position: z.object({ x: z.number(), y: z.number() }),
                }),
                execute: (input) =>
                  enqueue(async () => {
                    const node = flow.getNode(input.id);
                    if (!node)
                      return { ok: false, reason: "not_found", id: input.id };

                    const w = node.width ?? 260;
                    const h = node.height ?? 120;
                    const from = node.position;

                    await setPresence({
                      cursor: getNodeCenter(node),
                      thinking: false,
                    });
                    await pause();

                    for (let i = 1; i <= ANIMATION_STEPS; i++) {
                      const t = easeInOutCubic(i / ANIMATION_STEPS);
                      const pos = {
                        x: from.x + (input.position.x - from.x) * t,
                        y: from.y + (input.position.y - from.y) * t,
                      };
                      flow.updateNode(input.id, { position: pos });
                      await setPresence({
                        cursor: { x: pos.x + w / 2, y: pos.y + h / 2 },
                      });
                    }

                    flow.updateNode(input.id, { position: input.position });
                    await pause();
                    return { ok: true, id: input.id };
                  }),
              }),

              resizeNode: tool({
                description: "Resize one node.",
                inputSchema: z.object({
                  id: z.string(),
                  width: z.number().min(60).max(400).optional(),
                  height: z.number().min(60).max(400).optional(),
                }),
                execute: (input) =>
                  enqueue(async () => {
                    const node = flow.getNode(input.id);
                    if (!node)
                      return { ok: false, reason: "not_found", id: input.id };

                    await setPresence({
                      cursor: getNodeCenter(node),
                      thinking: false,
                    });
                    await pause();

                    const partial: Partial<CanvasNode> = {};
                    if (input.width !== undefined) partial.width = input.width;
                    if (input.height !== undefined)
                      partial.height = input.height;
                    if (Object.keys(partial).length > 0)
                      flow.updateNode(input.id, partial);

                    await pause();
                    return { ok: true, id: input.id };
                  }),
              }),

              updateNodeData: tool({
                description: "Update one node's label, shape, or color.",
                inputSchema: z.object({
                  id: z.string(),
                  label: z.string().optional(),
                  shape: z
                    .enum([...CANVAS_NODE_SHAPES] as [string, ...string[]])
                    .optional(),
                  color: z.enum(NODE_COLOR_VALUES).optional(),
                }),
                execute: (input) =>
                  enqueue(async () => {
                    const node = flow.getNode(input.id);
                    if (!node)
                      return { ok: false, reason: "not_found", id: input.id };

                    await setPresence({
                      cursor: getNodeCenter(node),
                      thinking: false,
                    });
                    await pause();

                    const data: Partial<CanvasNodeData> = {};
                    if (input.label !== undefined) data.label = input.label;
                    if (input.shape !== undefined) data.shape = input.shape;
                    if (input.color !== undefined) {
                      data.color = input.color;
                      data.textColor = COLOR_TO_TEXT[input.color];
                    }
                    if (Object.keys(data).length > 0)
                      flow.updateNodeData(input.id, data);

                    await pause();
                    return { ok: true, id: input.id };
                  }),
              }),

              deleteNode: tool({
                description: "Delete one node.",
                inputSchema: z.object({ id: z.string() }),
                execute: ({ id }) =>
                  enqueue(async () => {
                    const node = flow.getNode(id);
                    if (!node) return { ok: false, reason: "not_found", id };

                    await setPresence({
                      cursor: getNodeCenter(node),
                      thinking: false,
                    });
                    await pause();

                    flow.removeNode(id);
                    await pause();
                    return { ok: true, id };
                  }),
              }),

              addEdge: tool({
                description: "Create one edge between two nodes.",
                inputSchema: z.object({
                  id: z.string().optional(),
                  source: z.string(),
                  target: z.string(),
                }),
                execute: (input) =>
                  enqueue(async () => {
                    const srcNode = flow.getNode(input.source);
                    const tgtNode = flow.getNode(input.target);
                    if (!srcNode || !tgtNode) {
                      return {
                        ok: false,
                        reason: "not_found",
                        source: input.source,
                        target: input.target,
                      };
                    }

                    await setPresence({
                      cursor: getNodeCenter(srcNode),
                      thinking: false,
                    });
                    await pause();
                    await setPresence({ cursor: getNodeCenter(tgtNode) });
                    await pause();

                    const id =
                      input.id ??
                      `e-${input.source}-${input.target}-${nanoid(6)}`;
                    if (flow.getEdge(id))
                      return { ok: false, reason: "id_exists", id };

                    const { sourceHandle, targetHandle } = getEdgeHandles(
                      srcNode,
                      tgtNode,
                    );

                    flow.addEdge({
                      id,
                      source: input.source,
                      target: input.target,
                      sourceHandle,
                      targetHandle,
                      type: "smoothstep",
                      style: { stroke: "#e2e8f0", strokeWidth: 1.8 },
                      markerEnd: {
                        type: "arrowclosed" as unknown as import("@xyflow/react").MarkerType,
                        color: "#e2e8f0",
                        width: 14,
                        height: 14,
                      },
                    } as CanvasEdge);

                    await pause();
                    return { ok: true, id };
                  }),
              }),

              deleteEdge: tool({
                description: "Delete one edge.",
                inputSchema: z.object({ id: z.string() }),
                execute: ({ id }) =>
                  enqueue(async () => {
                    const edge = flow.getEdge(id);
                    if (!edge) return { ok: false, reason: "not_found", id };

                    const srcNode = flow.getNode(edge.source);
                    const tgtNode = flow.getNode(edge.target);
                    if (srcNode && tgtNode) {
                      await setPresence({
                        cursor: getMidpoint(
                          getNodeCenter(srcNode),
                          getNodeCenter(tgtNode),
                        ),
                        thinking: false,
                      });
                      await pause();
                    }

                    flow.removeEdge(id);
                    await pause();
                    return { ok: true, id };
                  }),
              }),
            },

            stopWhen: stepCountIs(30),
            experimental_onToolCallStart: ({ toolCall }) => {
              void pushStatus(`Updating canvas: ${toolCall.toolName}...`);
              stopThinking();
            },
          });
        } finally {
          stopThinking();
        }
      },
    );

    // Short TTL so AI presence disappears after finishing
    await setPresence({ ttl: 3 });
    await pushStatus("Canvas update complete ✓");

    return { ok: true };
  },
});
