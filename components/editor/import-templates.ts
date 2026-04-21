import { MarkerType } from "@xyflow/react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

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
  color: string,
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
    data: { label, color, shape },
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
    mkNode("client", "Web Client", "#0369A1", "pill", 60, 290, 180, 60),
    mkNode("gateway", "API Gateway", "#0F766E", "rectangle", 320, 270, 200, 80),
    mkNode(
      "auth-svc",
      "Auth Service",
      "#3730A3",
      "rectangle",
      600,
      80,
      190,
      70,
    ),
    mkNode(
      "user-svc",
      "User Service",
      "#3730A3",
      "rectangle",
      600,
      220,
      190,
      70,
    ),
    mkNode(
      "order-svc",
      "Order Service",
      "#3730A3",
      "rectangle",
      600,
      360,
      190,
      70,
    ),
    mkNode(
      "product-svc",
      "Product Service",
      "#3730A3",
      "rectangle",
      600,
      500,
      190,
      70,
    ),
    mkNode("msg-bus", "Message Bus", "#5B21B6", "hexagon", 310, 470, 180, 160),
    mkNode("auth-db", "Auth DB", "#1E293B", "cylinder", 860, 60, 140, 130),
    mkNode("user-db", "User DB", "#1E293B", "cylinder", 860, 200, 140, 130),
    mkNode("order-db", "Order DB", "#1E293B", "cylinder", 860, 340, 140, 130),
    mkNode(
      "product-db",
      "Product DB",
      "#1E293B",
      "cylinder",
      860,
      480,
      140,
      130,
    ),
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
    mkNode("repo", "Code Repository", "#0369A1", "cylinder", 60, 190, 150, 140),
    mkNode("build", "CI Build", "#0F766E", "rectangle", 290, 220, 170, 80),
    mkNode("tests", "Run Tests", "#065F46", "rectangle", 530, 220, 170, 80),
    mkNode("docker", "Build Image", "#3730A3", "rectangle", 770, 220, 170, 80),
    mkNode(
      "registry",
      "Push Registry",
      "#5B21B6",
      "cylinder",
      1010,
      190,
      150,
      140,
    ),
    mkNode(
      "staging",
      "Deploy Staging",
      "#78350F",
      "rectangle",
      1230,
      220,
      190,
      80,
    ),
    mkNode("smoke", "Smoke Test", "#9A3412", "diamond", 1490, 190, 160, 160),
    mkNode("prod", "Go Live", "#065F46", "pill", 1720, 230, 200, 60),
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
    mkNode("web-app", "Web App", "#0369A1", "pill", 60, 80, 180, 60),
    mkNode("mobile-app", "Mobile App", "#0369A1", "pill", 60, 260, 180, 60),
    mkNode("ext-api", "External API", "#0369A1", "pill", 60, 440, 180, 60),
    mkNode("event-bus", "Event Bus", "#5B21B6", "hexagon", 330, 220, 200, 200),
    mkNode(
      "email-svc",
      "Email Service",
      "#0F766E",
      "rectangle",
      620,
      60,
      190,
      70,
    ),
    mkNode(
      "push-svc",
      "Push Notifications",
      "#0F766E",
      "rectangle",
      620,
      200,
      190,
      70,
    ),
    mkNode("analytics", "Analytics", "#0F766E", "rectangle", 620, 340, 190, 70),
    mkNode(
      "dlq",
      "Dead Letter Queue",
      "#9F1239",
      "rectangle",
      620,
      480,
      190,
      70,
    ),
    mkNode("email-db", "Email Log", "#1E293B", "cylinder", 880, 50, 140, 130),
    mkNode("push-db", "Notif Store", "#1E293B", "cylinder", 880, 190, 140, 130),
    mkNode(
      "analytics-db",
      "Analytics DB",
      "#1E293B",
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
