import { MarkerType } from "@xyflow/react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";

// Color shorthand refs for template use
const C = {
  dark: NODE_COLORS[0], // #1F1F1F / neutral dark (databases, infra)
  blue: NODE_COLORS[1], // #10233D / blue (clients, repos)
  purple: NODE_COLORS[2], // #2E1938 / purple (services, buses)
  orange: NODE_COLORS[3], // #331B00 / orange (staging, deploy)
  red: NODE_COLORS[4], // #3C1618 / red (errors, DLQ, smoke)
  pink: NODE_COLORS[5], // #3A1726 / pink
  green: NODE_COLORS[6], // #0F2E18 / green (success, tests)
  teal: NODE_COLORS[7], // #062822 / teal (gateways, services)
} as const;

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

// ── Helpers ───────────────────────────────────────────────────────

function mkNode(
  id: string,
  label: string,
  c: { readonly nodeColor: string; readonly textColor: string },
  shape: CanvasNode["data"]["shape"],
  x: number,
  y: number,
  width: number,
  height: number,
): CanvasNode {
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    data: { label, color: c.nodeColor, textColor: c.textColor, shape },
    width,
    height,
  };
}

function mkEdge(id: string, source: string, target: string): CanvasEdge {
  return {
    id,
    source,
    target,
    type: "canvasEdge",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#e2e8f0",
      width: 14,
      height: 14,
    },
    style: { stroke: "#e2e8f0", strokeWidth: 1.8 },
  };
}

// ── Template 1: Microservices Architecture ────────────────────────

const MICROSERVICES: CanvasTemplate = {
  id: "microservices",
  name: "Microservices",
  description:
    "API Gateway routes traffic to isolated services, each backed by a dedicated database and connected via a shared message bus.",
  nodes: [
    mkNode("client", "Web Client", C.blue, "pill", 60, 290, 180, 60),
    mkNode("gateway", "API Gateway", C.teal, "rectangle", 320, 270, 200, 80),
    mkNode("auth-svc", "Auth Service", C.purple, "rectangle", 600, 80, 190, 70),
    mkNode(
      "user-svc",
      "User Service",
      C.purple,
      "rectangle",
      600,
      220,
      190,
      70,
    ),
    mkNode(
      "order-svc",
      "Order Service",
      C.purple,
      "rectangle",
      600,
      360,
      190,
      70,
    ),
    mkNode(
      "product-svc",
      "Product Service",
      C.purple,
      "rectangle",
      600,
      500,
      190,
      70,
    ),
    mkNode("msg-bus", "Message Bus", C.purple, "hexagon", 310, 470, 180, 160),
    mkNode("auth-db", "Auth DB", C.dark, "cylinder", 860, 60, 140, 130),
    mkNode("user-db", "User DB", C.dark, "cylinder", 860, 200, 140, 130),
    mkNode("order-db", "Order DB", C.dark, "cylinder", 860, 340, 140, 130),
    mkNode("product-db", "Product DB", C.dark, "cylinder", 860, 480, 140, 130),
  ],
  edges: [
    mkEdge("e1", "client", "gateway"),
    mkEdge("e2", "gateway", "auth-svc"),
    mkEdge("e3", "gateway", "user-svc"),
    mkEdge("e4", "gateway", "order-svc"),
    mkEdge("e5", "gateway", "product-svc"),
    mkEdge("e6", "auth-svc", "auth-db"),
    mkEdge("e7", "user-svc", "user-db"),
    mkEdge("e8", "order-svc", "order-db"),
    mkEdge("e9", "product-svc", "product-db"),
    mkEdge("e10", "user-svc", "msg-bus"),
    mkEdge("e11", "order-svc", "msg-bus"),
  ],
};

// ── Template 2: CI/CD Pipeline ────────────────────────────────────

const CICD: CanvasTemplate = {
  id: "cicd",
  name: "CI/CD Pipeline",
  description:
    "End-to-end delivery from source commit through build, test, containerisation, and staged deployment to production.",
  nodes: [
    mkNode("repo", "Code Repository", C.blue, "cylinder", 60, 190, 150, 140),
    mkNode("build", "CI Build", C.teal, "rectangle", 290, 220, 170, 80),
    mkNode("tests", "Run Tests", C.green, "rectangle", 530, 220, 170, 80),
    mkNode("docker", "Build Image", C.purple, "rectangle", 770, 220, 170, 80),
    mkNode(
      "registry",
      "Push Registry",
      C.purple,
      "cylinder",
      1010,
      190,
      150,
      140,
    ),
    mkNode(
      "staging",
      "Deploy Staging",
      C.orange,
      "rectangle",
      1230,
      220,
      190,
      80,
    ),
    mkNode("smoke", "Smoke Test", C.red, "diamond", 1490, 190, 160, 160),
    mkNode("prod", "Go Live", C.green, "pill", 1720, 230, 200, 60),
  ],
  edges: [
    mkEdge("e1", "repo", "build"),
    mkEdge("e2", "build", "tests"),
    mkEdge("e3", "tests", "docker"),
    mkEdge("e4", "docker", "registry"),
    mkEdge("e5", "registry", "staging"),
    mkEdge("e6", "staging", "smoke"),
    mkEdge("e7", "smoke", "prod"),
  ],
};

// ── Template 3: Event-Driven Architecture ────────────────────────

const EVENT_DRIVEN: CanvasTemplate = {
  id: "event-driven",
  name: "Event-Driven System",
  description:
    "Producers publish events to a central bus. Independent consumers handle emails, push notifications, analytics, and error queues.",
  nodes: [
    mkNode("web-app", "Web App", C.blue, "pill", 60, 80, 180, 60),
    mkNode("mobile-app", "Mobile App", C.blue, "pill", 60, 260, 180, 60),
    mkNode("ext-api", "External API", C.blue, "pill", 60, 440, 180, 60),
    mkNode("event-bus", "Event Bus", C.purple, "hexagon", 330, 220, 200, 200),
    mkNode("email-svc", "Email Service", C.teal, "rectangle", 620, 60, 190, 70),
    mkNode(
      "push-svc",
      "Push Notifications",
      C.teal,
      "rectangle",
      620,
      200,
      190,
      70,
    ),
    mkNode("analytics", "Analytics", C.teal, "rectangle", 620, 340, 190, 70),
    mkNode("dlq", "Dead Letter Queue", C.red, "rectangle", 620, 480, 190, 70),
    mkNode("email-db", "Email Log", C.dark, "cylinder", 880, 50, 140, 130),
    mkNode("push-db", "Notif Store", C.dark, "cylinder", 880, 190, 140, 130),
    mkNode(
      "analytics-db",
      "Analytics DB",
      C.dark,
      "cylinder",
      880,
      330,
      140,
      130,
    ),
  ],
  edges: [
    mkEdge("e1", "web-app", "event-bus"),
    mkEdge("e2", "mobile-app", "event-bus"),
    mkEdge("e3", "ext-api", "event-bus"),
    mkEdge("e4", "event-bus", "email-svc"),
    mkEdge("e5", "event-bus", "push-svc"),
    mkEdge("e6", "event-bus", "analytics"),
    mkEdge("e7", "event-bus", "dlq"),
    mkEdge("e8", "email-svc", "email-db"),
    mkEdge("e9", "push-svc", "push-db"),
    mkEdge("e10", "analytics", "analytics-db"),
  ],
};

// ── Exported catalogue ────────────────────────────────────────────

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  MICROSERVICES,
  CICD,
  EVENT_DRIVEN,
];
