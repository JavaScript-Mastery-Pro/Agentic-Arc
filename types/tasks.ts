/**
 * Zod schemas and TypeScript types for Trigger.dev task output and metadata
 * boundaries. Use these instead of `as` casts at realtime subscription sites.
 */

import { z } from "zod";

// ── Spec generation task (generate-spec-gemini) ──────────────────────────────

export const specTaskOutputSchema = z.object({
  specContent: z.string(),
  specId: z.string(),
  roomId: z.string(),
  projectId: z.string(),
});

export type SpecTaskOutput = z.infer<typeof specTaskOutputSchema>;

export const specTaskMetadataSchema = z.object({
  progress: z.number().optional(),
  status: z.string().optional(),
});

export type SpecTaskMetadata = z.infer<typeof specTaskMetadataSchema>;

// ── Liveblocks feed message data ─────────────────────────────────────────────

/** Shape of messages written to the "ai-chat" Liveblocks feed. */
export const chatFeedMessageDataSchema = z.object({
  role: z.enum(["user", "assistant"]).default("user"),
  content: z.string().default(""),
});

export type ChatFeedMessageData = z.infer<typeof chatFeedMessageDataSchema>;

/** Shape of messages written to the "ai-status-feed" Liveblocks feed. */
export const aiFeedMessageDataSchema = z.object({
  text: z.string().optional(),
});

export type AiFeedMessageData = z.infer<typeof aiFeedMessageDataSchema>;

// ── API response shapes ───────────────────────────────────────────────────────

/** Response from POST /api/ai/spec or POST /api/ai/design */
export const triggerResponseSchema = z.object({
  runId: z.string(),
});

/** Response from POST /api/ai/spec/token or /api/ai/design/token */
export const tokenResponseSchema = z.object({
  publicToken: z.string(),
});
