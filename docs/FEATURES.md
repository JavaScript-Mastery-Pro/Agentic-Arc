# Agentic Arc — Accomplished Features

## Stack

| Layer                  | Technology                                                  |
| ---------------------- | ----------------------------------------------------------- |
| Framework              | Next.js (App Router) + TypeScript                           |
| Styling                | Tailwind CSS — dark "Cyber-Blueprint" theme (zinc-950 base) |
| Auth                   | Clerk                                                       |
| Realtime collaboration | Liveblocks                                                  |
| Canvas                 | React Flow (`@xyflow/react`) + `@liveblocks/react-flow`     |
| Database               | PostgreSQL via Prisma ORM (schema ready, Prisma v7 config)  |

---

## Authentication

- Clerk is fully integrated via `clerkMiddleware` — all routes are protected by default.
- `/sign-in` and `/sign-up` pages are scaffolded using Clerk's hosted UI.
- The editor route (`/editor/[roomId]`) performs a server-side auth check; unauthenticated users are redirected to `/sign-in`.
- The Liveblocks auth endpoint (`POST /api/liveblocks-auth`) validates the Clerk session before issuing a Liveblocks token, so the realtime canvas is never accessible without a valid user session.

---

## Landing Page

- Full-screen dark hero section at `/`.
- Tagline, description, and two CTAs: **Sign In** and **Sign Up**.
- Direct shortcut link to the collaborative editor room `system-blueprint` for quick access.
- Radial gradient ambient background (sky + green tones) for visual depth.

---

## Collaborative Canvas Editor (`/editor/[roomId]`)

### Room system

- URL-driven rooms — any slug becomes a Liveblocks room (e.g., `/editor/payments-architecture`).
- Three starter rooms pre-seeded in the sidebar: **System Blueprint**, **Payments Architecture**, **Agent Runtime**.
- If the URL room ID does not match a starter room, it is appended to the list automatically.
- Room name is prettified from the slug (e.g., `agent-runtime` → `Agent Runtime`).

### Realtime sync

- Nodes and edges are fully synced across all connected clients via `useLiveblocksFlow`.
- Live cursors rendered on canvas for all other users via the `<Cursors />` component.
- Presence avatars (up to 5) displayed in the canvas top-right, showing name initials or profile photo.
- Presence data (name, avatar URL, accent color) pulled from the Clerk user and sent through Liveblocks `UserMeta`.

### Canvas nodes

- Custom `canvasNode` type rendered by `CanvasNodeView`.
- Nodes display centered label text — placeholder "Add Text" shown when empty.
- **Double-click** a node to enter edit mode; a textarea appears for multiline text entry. Blur or Escape exits edit mode.
- **Click** anywhere on the node body to select/drag — the body is not an input by default.
- Node selection shows a subtle white border and glow.
- **NodeResizer** appears only when a node is selected, with minimum dimensions enforced (140×80).
- Four initial architecture nodes pre-loaded: Client App, API Gateway, Worker Service, Database.

### Node color toolbar

- Selecting a node reveals a floating **NodeToolbar** above it.
- 12 color swatches, each a distinct vivid dark hue (slate, blue, sky, teal, emerald, indigo, violet, purple, rose, orange, amber, stone) — chosen to be clearly distinguishable on a dark canvas while keeping white text readable.
- Active color is highlighted with a white border ring and slight scale.
- Color change is synced to all collaborators in realtime via `updateNodeData`.

### Connectors / edges

- All four sides of each node have connection handles (top, right, bottom, left).
- Handles are hidden by default and fade in on node hover for a clean canvas.
- `ConnectionMode.Loose` is enabled — drag from any handle to any handle on any node.
- Edges render as `smoothstep` curves with a near-white stroke (`#e2e8f0`) and closed arrowhead.
- Live connection preview uses a dashed near-white line while dragging.
- MiniMap node colors reflect each node's actual background color.

### Canvas controls

- **Zoom in / Zoom out / Fit view** — floating control cluster in the bottom-left corner.
- **Reset** button in the navbar calls `fitView` with a smooth animation.
- React Flow default pan/zoom interactions (scroll, pinch, drag canvas) are active.

### Project sidebar

- Floating sidebar (slides in from the left) listing all available rooms.
- Active room is highlighted.
- **Create project** button opens a modal dialog.
- Project name is typed → slug is computed and previewed live → navigates to the new room on confirm.
- Sidebar can be dismissed by clicking the close button or the backdrop overlay.
- Sidebar toggle button in the top-left navbar.

### Navbar

- Minimal top bar: sidebar toggle (left), room name centered, Reset + Share (right).
- **Share** button copies the current page URL to the clipboard and shows a "Copied" confirmation for 1.5 s.

### Error handling

- `EditorErrorBoundary` wraps the canvas — if Liveblocks fails to connect (bad config, missing secret key) a readable error card is shown instead of a crash.
- `ClientSideSuspense` shows a loading state while the canvas initialises.

---

## API

| Route                  | Method | Purpose                                                                                                 |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| `/api/liveblocks-auth` | POST   | Validates Clerk session, issues Liveblocks access token with user identity (name, avatar, accent color) |

---

## Database (ready, not yet wired to UI)

- Prisma v7 schema configured with PostgreSQL.
- Prisma client output pointed to `app/generated/prisma`.
- `prisma.config.ts` present for Prisma Postgres / Accelerate compatibility.
- Schema is minimal (datasource + generator) — ready to extend with Project/User models when persistence is needed.
