# Project Guidelines

## Build And Run

- Use npm scripts only: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`.
- There is no test script yet. Do not assume `npm test` exists unless you add it.

## Architecture

- Stack: Next.js 16 App Router + TypeScript + Tailwind + Clerk + Liveblocks + Trigger.dev + Prisma v7.
- Keep boundaries clear:
  - API routes in `app/api/**` handle auth, task triggering, and persistence.
  - Trigger tasks in `trigger/**` handle long-running AI work.
  - Shared infra clients stay in `lib/**`.
- Persist artifacts with hybrid storage: metadata in PostgreSQL (Prisma), content on disk via `fs/promises` (`data/canvas/**`, `data/specs/**`).

## Conventions

- Treat this as Next.js 16 codebase. Do not rely on older Next patterns; check `AGENTS.md` guidance and local Next docs when in doubt.
- Default to React Server Components. Add `"use client"` only when hooks/browser interactivity are required (Liveblocks/React Flow UI).
- Keep TypeScript strict. Avoid `any`; prefer `interface` for object contracts.
- Use Prisma via project-generated client imports from `app/generated/prisma/**` and shared setup in `lib/prisma.ts`.
- Preserve Prisma runtime dual-mode support in `lib/prisma.ts` (`prisma+postgres` accelerate URL vs `@prisma/adapter-pg`).
- Trigger.dev tasks must use `@trigger.dev/sdk` task APIs. Do not use deprecated v2 job APIs.
- In this repo, trigger flows are enqueue-and-subscribe (`tasks.trigger` + realtime token routes), not blocking `triggerAndWait` from request handlers.
- Current production spec flow uses `trigger/generate-spec-gemini.ts`; treat `trigger/generate-spec.ts` as legacy unless explicitly rewired.
- Maintain auth model:
  - Global protection via Clerk middleware.
  - Owner checks on project/spec mutation and download routes.

## Link First

- Product and feature behavior: `docs/FEATURES.md`.
- System overview and state docs (may contain historical context): `docs/PROJECT_CONTEXT.md`, `docs/STATE_SCHEMA.md`.
- Trigger.dev implementation rules by scope: `.github/instructions/trigger-*.instructions.md`.
