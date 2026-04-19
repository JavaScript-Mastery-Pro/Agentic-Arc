# Ghost Arc — AI-Powered Collaborative System Architect

> A real-time, multiplayer system design tool where an AI agent physically draws architecture diagrams onto a shared canvas while human engineers collaborate alongside it — then generates a detailed technical specification from the resulting graph.

---

## Project Summary

Ghost Arc is an agentic planning application built for software teams. A user submits a natural-language prompt (e.g., _"Design a scalable e-commerce backend"_) and a Google Gemini-powered AI agent autonomously places nodes and edges onto a shared React Flow canvas in real-time. Human teammates can watch the AI build the diagram live, then jump in to collaboratively refine it. Once the team is satisfied, a second AI background task converts the visual graph into a comprehensive, multi-page Markdown technical specification that can be downloaded directly from the app.

---

## Tech Stack

### Framework & Language

| Technology                               | Version | Purpose                     |
| ---------------------------------------- | ------- | --------------------------- |
| [Next.js](https://nextjs.org)            | 16.2.3  | App Router, API routes, SSR |
| [React](https://react.dev)               | 19      | UI component library        |
| [TypeScript](https://typescriptlang.org) | 5       | Static typing throughout    |

### Real-time, Auth & Infrastructure

| Technology                          | Version | Purpose                                                  |
| ----------------------------------- | ------- | -------------------------------------------------------- |
| [Liveblocks](https://liveblocks.io) | 3.18    | Multiplayer canvas sync, live cursors, presence          |
| [Clerk](https://clerk.com)          | 7.2     | Authentication, user identity, session management        |
| [Trigger.dev](https://trigger.dev)  | 4.4     | Durable background tasks for AI design & spec generation |

### AI

| Technology                                                                                | Version | Purpose                                                |
| ----------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------ |
| [Vercel AI SDK](https://sdk.vercel.ai)                                                    | 6       | Unified AI interface                                   |
| [`@ai-sdk/google`](https://sdk.vercel.ai/providers/ai-sdk-providers/google-generative-ai) | 3       | Google Gemini integration (`gemini-2.0-flash` default) |

### Database & ORM

| Technology                                                                           | Version | Purpose                               |
| ------------------------------------------------------------------------------------ | ------- | ------------------------------------- |
| [Prisma ORM](https://prisma.io)                                                      | 7.7     | Type-safe database client, migrations |
| [`@prisma/adapter-pg`](https://www.prisma.io/docs/orm/overview/databases/postgresql) | 7.7     | PostgreSQL driver adapter (local dev) |
| [PostgreSQL](https://postgresql.org)                                                 | —       | Primary relational database           |

### Canvas & UI

| Technology                                                                                 | Version | Purpose                                              |
| ------------------------------------------------------------------------------------------ | ------- | ---------------------------------------------------- |
| [`@xyflow/react`](https://reactflow.dev)                                                   | 12.10   | Drag-and-drop node canvas                            |
| [`@liveblocks/react-flow`](https://liveblocks.io/docs/api-reference/liveblocks-react-flow) | 3.18    | Liveblocks × React Flow bridge                       |
| [Tailwind CSS](https://tailwindcss.com)                                                    | 4       | Utility-first styling (dark "Cyber-Blueprint" theme) |
| [Radix UI](https://radix-ui.com)                                                           | —       | Accessible Dialog, Tabs, ScrollArea primitives       |
| [Lucide React](https://lucide.dev)                                                         | —       | Icon library                                         |
| [shadcn/ui](https://ui.shadcn.com)                                                         | —       | Component system built on Radix + Tailwind           |

---

## Key Features

- **AI Architecture Agent** — Submit a plain-English prompt; Gemini draws nodes and edges onto the live canvas in real-time via Trigger.dev background tasks and the Liveblocks Node.js SDK.
- **Multiplayer Canvas** — Full real-time collaboration powered by Liveblocks: synchronized node/edge state, live cursor positions, and presence avatars for every connected user.
- **Custom Canvas Nodes** — Double-click to edit node labels inline; select to resize with `NodeResizer`; choose from 12 colour swatches via a floating `NodeToolbar` — all synced across clients instantly.
- **AI Spec Generation** — One click converts the current graph into a detailed Markdown technical specification using a second Gemini-powered Trigger.dev task.
- **Multi-Spec Storage** — Each project stores multiple specs. Metadata lives in PostgreSQL (Prisma); content is stored as Markdown files on disk (`data/specs/{projectId}/{specId}.md`).
- **Downloadable Specs** — Every generated spec is available via a dedicated download API route.
- **Clerk Authentication** — Global route protection via `clerkMiddleware`; Liveblocks tokens are only issued to authenticated users.
- **Auto-Save Canvas** — The canvas state is debounced-saved to `data/canvas/{projectId}.json` every 3 seconds of inactivity.
- **Project Management** — Create projects from a slide-in sidebar; project slugs auto-generate room IDs; the active room is highlighted.
- **Share** — One-click URL copy with a 1.5 s "Copied" confirmation.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10
- A running **PostgreSQL** instance (local or cloud)
- Accounts on [Clerk](https://clerk.com), [Liveblocks](https://liveblocks.io), [Trigger.dev](https://trigger.dev), and [Google AI Studio](https://aistudio.google.com)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/agentic-arc.git
cd agentic-arc
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the template below into a `.env.local` file in the project root and fill in your credentials (see [Environment Variables](#environment-variables) for details).

### 4. Apply Database Migrations

```bash
npm run prisma:migrate
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Run Trigger.dev (Background Tasks)

In a second terminal, start the Trigger.dev dev worker so background AI tasks execute locally:

```bash
npx trigger.dev@latest dev
```

---

## Environment Variables

Create a `.env.local` file in the project root with the following keys. All keys are required unless marked optional.

```bash
# ─── Clerk (Authentication) ───────────────────────────────────────────────────
# https://dashboard.clerk.com → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Clerk redirect paths (optional — defaults shown)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# ─── Liveblocks (Real-time collaboration) ─────────────────────────────────────
# https://liveblocks.io/dashboard → Project → API Keys
LIVEBLOCKS_SECRET_KEY=

# ─── Google Gemini (AI generation) ────────────────────────────────────────────
# https://aistudio.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=

# Optional: override the default Gemini model (default: gemini-2.0-flash)
GEMINI_MODEL=
# Optional: override model used specifically for spec generation
GEMINI_SPEC_MODEL=

# ─── Trigger.dev (Background task orchestration) ──────────────────────────────
# https://cloud.trigger.dev → Project → API Keys
TRIGGER_SECRET_KEY=
NEXT_PUBLIC_TRIGGER_PUBLIC_API_KEY=

# ─── Database (PostgreSQL) ────────────────────────────────────────────────────
# Standard PostgreSQL connection string for Prisma
DATABASE_URL=postgresql://user:password@localhost:5432/agentic_arc

# ─── Internal API Security ────────────────────────────────────────────────────
# Shared secret that allows Trigger.dev tasks to call internal Next.js API routes.
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
INTERNAL_API_SECRET=

# ─── App URL (used by Trigger.dev tasks for callbacks) ────────────────────────
# Local development default; set to your deployed URL in production.
APP_URL=http://localhost:3000
```

---

## Available Scripts

| Command                   | Description                           |
| ------------------------- | ------------------------------------- |
| `npm run dev`             | Start Next.js development server      |
| `npm run build`           | Build for production                  |
| `npm run start`           | Start production server               |
| `npm run lint`            | Run ESLint                            |
| `npm run prisma:generate` | Regenerate Prisma client              |
| `npm run prisma:migrate`  | Create and apply a new migration      |
| `npm run prisma:deploy`   | Apply pending migrations (production) |
| `npm run prisma:studio`   | Open Prisma Studio GUI                |

---

## Project Structure

```
.
├── app/
│   ├── api/              # Next.js API routes (auth, AI, projects, specs)
│   ├── editor/           # Canvas editor pages
│   ├── generated/prisma/ # Auto-generated Prisma client
│   ├── sign-in/          # Clerk sign-in page
│   └── sign-up/          # Clerk sign-up page
├── components/
│   ├── editor/           # Canvas UI components (editor, sidebar, AI chat)
│   └── ui/               # Reusable shadcn/ui primitives
├── data/
│   ├── canvas/           # Auto-saved React Flow graph JSON per project
│   └── specs/            # Generated Markdown specs per project
├── docs/                 # Project documentation
├── hooks/                # Custom React hooks (auto-save, keyboard shortcuts)
├── lib/                  # Shared utilities (Prisma client, Liveblocks, AI agents)
├── prisma/               # Prisma schema and migrations
├── trigger/              # Trigger.dev background task definitions
│   ├── design-agent.ts   # AI canvas generation task
│   └── generate-spec-gemini.ts  # AI spec generation task
└── types/                # Shared TypeScript types
```

---

## License

This project is private. All rights reserved.
