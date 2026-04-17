"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Liveblocks } from "@liveblocks/node";
import { mutateFlow } from "@liveblocks/react-flow/node";
import { generateText, stepCountIs, tool } from "ai";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  easeInOutCubic,
  getBoundsFromNodes,
  getEdgeHandles,
  getMidpoint,
  getNodeCenter,
  getRandomPointInBounds,
  sleep,
} from "@/lib/canvas-utils";
import {
  DEFAULT_EDGE_COLOR,
  DEFAULT_NODE_COLOR,
  NODE_COLORS,
  NODE_SHAPES,
  type Bounds,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeData,
  type Point,
} from "@/types/canvas";

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

// ── Gemini client ───────────────────────────────────────────────────
function getGeminiClient() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set.");

  return createGoogleGenerativeAI({ apiKey });
}

function getLiveblocksClient() {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) throw new Error("LIVEBLOCKS_SECRET_KEY is not set.");
  return new Liveblocks({ secret });
}

// ── Zod schemas for tools ───────────────────────────────────────────
const pointSchema = z.object({ x: z.number(), y: z.number() });
const sizeSchema = z.number().min(60).max(400);

// ── Main agent function ─────────────────────────────────────────────
export async function runDesignAgentGemini(roomId: string, prompt: string) {
  const gemini = getGeminiClient();
  const liveblocks = getLiveblocksClient();

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
        await generateText({
          model: gemini(process.env.GEMINI_MODEL ?? "gemini-2.0-flash"),
          maxOutputTokens: 4096,
          system: `You edit a live collaborative React Flow diagram for system architecture design.

Node shape: { id, position: { x, y }, width, height, data: { label, shape, color } }.
Edge shape: { id, source, target, sourceHandle, targetHandle }.

Rules:
- All nodes use type "canvasNode".
- Shapes: ${NODE_SHAPES.join(" | ")}.
- Colors (hex): ${NODE_COLORS.join(", ")}.
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
                position: pointSchema,
                width: sizeSchema.optional(),
                height: sizeSchema.optional(),
                label: z.string().optional(),
                shape: z.enum(NODE_SHAPES).optional(),
                color: z.enum(NODE_COLORS).optional(),
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

                  flow.addNode({
                    id,
                    type: "canvasNode",
                    position: input.position,
                    width: w,
                    height: h,
                    data: {
                      label: input.label ?? "",
                      color: input.color ?? DEFAULT_NODE_COLOR,
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
                position: pointSchema,
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
                width: sizeSchema.optional(),
                height: sizeSchema.optional(),
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
                  if (input.height !== undefined) partial.height = input.height;
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
                shape: z.enum(NODE_SHAPES).optional(),
                color: z.enum(NODE_COLORS).optional(),
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
                  if (input.color !== undefined) data.color = input.color;
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
                    style: { stroke: DEFAULT_EDGE_COLOR, strokeWidth: 1.8 },
                    markerEnd: {
                      type: "arrowclosed" as unknown as import("@xyflow/react").MarkerType,
                      color: DEFAULT_EDGE_COLOR,
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
          experimental_onToolCallStart: stopThinking,
        });
      } finally {
        stopThinking();
      }
    },
  );

  // Short TTL so AI presence disappears after finishing
  await setPresence({ ttl: 3 });
}
