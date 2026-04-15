# Project Context: Agentic System Architect

## Overview

The "Agentic System Architect" is a real-time, multiplayer system planning tool. A user inputs a prompt (e.g., "Design an e-commerce backend"), and an AI Agent physically drags and drops nodes onto a shared canvas to build a visual architecture in real-time. Human engineers can then collaboratively edit the canvas. Finally, the app generates a highly detailed, multi-page Markdown technical spec based on the visual graph.

## Tech Stack

- **Framework:** Next.js 15 (App Router) & TypeScript
- **Auth & Identity:** Clerk (Provides human avatars/names for the canvas)
- **Multiplayer Canvas:** @liveblocks/react-flow (Handles WebSocket sync, node coordinates, and AI cursor presence)
- **AI Orchestration:** Trigger.dev (Handles long-running background loops for cursor simulation and LLM streaming)
- **Database:** PostgreSQL & Prisma ORM (Hosted on a VPS)
- **File Storage:** Local File System via Node `fs/promises` (Saves JSON canvas maps and Markdown specs to the disk)
- **Styling:** Tailwind CSS + Shadcn UI (Dark mode "Cyber-Blueprint" theme: zinc-950 background, neon accents for nodes)

## The Core Application Flow

### 1. The "Ghost Teammate" Canvas (Liveblocks + React Flow)

- A full-screen drag-and-drop node canvas.
- Authenticated users enter a Liveblocks Room.
- React Flow handles the UI; Liveblocks syncs the exact X/Y coordinates and human cursor movements instantly.

### 2. The AI Architect Generation (Trigger.dev Task 1)

- User types a prompt.
- A Trigger.dev background task calls an LLM via OpenRouter (e.g., Claude 3.5 Sonnet) to map out strict JSON architecture nodes and edges.
- Trigger.dev uses the Liveblocks Node.js API to inject an "AI User" into the room.
- A loop runs, calculating math for smooth X/Y cursor interpolation and calling `addNode()` sequentially. Viewers watch the AI physically draw the map.

### 3. Human-in-the-Loop Editing

- Once the AI finishes drawing, human teammates take over, collaboratively deleting, adding, and reconnecting nodes.

### 4. Graph-to-Markdown Engine & Storage (Trigger.dev Task 2)

- The team clicks "Generate Spec."
- The frontend passes the final React Flow JSON state to a second Trigger.dev task.
- Trigger.dev prompts an LLM via OpenRouter (e.g., MiniMax M2.5) to write the API routes and DB schema based on the nodes.
- The Markdown streams into a slide-out side panel.
- **Save Operation:** The final React Flow JSON state and the generated Markdown string are saved as physical files to the local server disk. The file paths are saved to the PostgreSQL database using Prisma.

## AI Model Strategy (OpenRouter)

- **Task 1 (Architecture to JSON):** Requires strict schema adherence. Use highly capable models like Claude 3.5 Sonnet or GPT-4o.
- **Task 2 (Graph to Markdown Code):** Requires long-context generation. Use fast, cost-effective models like MiniMax M2.5 or Llama 3.1 70B.
