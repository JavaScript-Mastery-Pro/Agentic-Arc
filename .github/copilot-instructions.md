# Global Copilot Instructions

- **Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Shadcn UI, Prisma ORM, PostgreSQL.
- **Styling:** We use a dark mode "Cyber-Blueprint" theme (zinc-950 background, subtle borders).
- **TypeScript:** Always use strict typing. Avoid `any`. Use interfaces over types where possible.
- **Components:** Use functional React components and React Server Components (RSC) by default. Only add `"use client"` when hooks or interactivity (like Liveblocks/React Flow) are strictly required.
- **Backend & Storage:** Use Prisma for all database queries. For file storage (Canvas JSON and Markdown specs), use native Node.js `fs/promises` to save files locally to the server disk.
