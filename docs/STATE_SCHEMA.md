# State Schema: Agentic System Architect

This document defines the core state/data schema for the real-time, AI-powered multiplayer canvas and spec generation system.

---

## 1. Canvas State (React Flow + Liveblocks)

### Room

- `roomId: string` — Unique Liveblocks Room identifier
- `users: UserPresence[]` — List of connected users (human or AI)
- `nodes: CanvasNode[]` — All nodes on the canvas
- `edges: CanvasEdge[]` — All edges connecting nodes
- `aiStatus: "idle" | "drawing" | "complete"` — AI teammate state

### UserPresence

- `userId: string` — Clerk or AI user ID
- `name: string`
- `avatarUrl: string`
- `cursor: { x: number; y: number }`
- `isAI: boolean`

### CanvasNode

- `id: string`
- `type: string` (e.g., "db", "api", "service", "queue")
- `label: string`
- `position: { x: number; y: number }`
- `data: Record<string, unknown>`

### CanvasEdge

- `id: string`
- `source: string` (node id)
- `target: string` (node id)
- `label?: string`

---

## 2. Spec Generation State

### SpecJob

- `jobId: string`
- `roomId: string`
- `status: "pending" | "generating" | "complete" | "error"`
- `inputGraph: { nodes: CanvasNode[]; edges: CanvasEdge[] }`
- `outputMarkdownPath: string | null`
- `error?: string`

---

## 3. Database (Prisma Models)

- `User` (Clerk user info)
- `Room` (Liveblocks room info)
- `CanvasFile` (JSON file path, roomId, createdBy)
- `SpecFile` (Markdown file path, roomId, createdBy)

---

## 4. File Storage

- Canvas JSON: `/data/canvas/{roomId}.json`
- Spec Markdown: `/data/specs/{roomId}.md`

---

## 5. AI Task State

- `aiTaskId: string`
- `type: "draw" | "spec-gen"`
- `status: "pending" | "running" | "complete" | "error"`
- `model: string` (e.g., "claude-3.5-sonnet", "minimax-m2.5")
- `input: any`
- `output: any`
- `error?: string`

---

> Update this schema as your app evolves. Strict typing and clear state shape are critical for robust AI and multiplayer features.
