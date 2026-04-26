import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { schemaTask, metadata } from "@trigger.dev/sdk";
import { generateText } from "ai";
import { z } from "zod";

// ── Payload schema ──────────────────────────────────────────────────
const specPayloadSchema = z.object({
  projectId: z.string(),
  roomId: z.string(),
  chatHistory: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
  nodes: z.array(z.record(z.string(), z.unknown())),
  edges: z.array(z.record(z.string(), z.unknown())),
});

// ── Constants ───────────────────────────────────────────────────────
// (spec content is returned as task output and saved to DB by the caller)

// ── Task ────────────────────────────────────────────────────────────
export const generateSpecGemini = schemaTask({
  id: "generate-spec",
  maxDuration: 300,
  schema: specPayloadSchema,
  retry: {
    maxAttempts: 5,
    minTimeoutInMs: 10_000,
    maxTimeoutInMs: 60_000,
    factor: 2,
    randomize: true,
  },
  run: async (payload) => {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set.");

    const gemini = createGoogleGenerativeAI({ apiKey });

    // ── Step 1: Update status ─────────────────────────────────────
    await metadata.set("status", "generating");
    await metadata.set("progress", 10);

    // ── Step 2: Build context from chat history + canvas ──────────
    const chatContext = payload.chatHistory
      .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
      .join("\n");

    const canvasJson = JSON.stringify(
      { nodes: payload.nodes, edges: payload.edges },
      null,
      2,
    );

    await metadata.set("progress", 20);

    // ── Step 3: Generate spec via Gemini ──────────────────────────
    const result = await generateText({
      maxRetries: 0, // disable AI SDK retries — let Trigger.dev handle outer retries
      model: gemini(
        process.env.GEMINI_SPEC_MODEL ??
          process.env.GEMINI_MODEL ??
          "gemini-2.0-flash",
      ),
      system: `You are a senior software architect. You generate comprehensive, production-ready technical specifications in Markdown format.

Given a system architecture diagram (nodes and edges) and the conversation history between a user and an AI architect, produce a detailed project specification.

The spec MUST include ALL of the following sections:

# Project Overview
Brief description of the system and its purpose.

# System Architecture
High-level description of all components and how they interact. Reference the nodes and edges.

# Component Details
For EACH node in the diagram, provide:
- **Purpose**: What it does
- **Technology**: Recommended stack
- **Key Responsibilities**: Bullet list
- **API Endpoints** (if applicable): Method, path, description

# Data Flow
Describe how data flows through the system based on the edges/connections.

# Database Schema
Propose tables/collections with fields, types, and relationships.

# API Specification
Full REST or GraphQL API design with endpoints, request/response shapes.

# Authentication & Authorization
How users and services authenticate.

# Deployment Architecture
Hosting, scaling, CI/CD recommendations.

# Error Handling & Monitoring
Logging, alerting, error recovery strategies.

# Security Considerations
OWASP-aligned security measures.

# Development Phases
Break the project into milestones with deliverables.

Output ONLY valid Markdown. No code fences wrapping the entire document. Be thorough and specific.`,

      prompt: `<conversation-history>
${chatContext}
</conversation-history>

<system-architecture>
${canvasJson}
</system-architecture>

Generate a comprehensive technical specification for this system.`,
    });

    await metadata.set("progress", 80);

    const specContent = result.text;

    // ── Step 4: Persist spec via the app API ──────────────────────
    // The task calls the Next.js spec endpoint with a shared secret so that
    // the spec is saved even if the originating client disconnects.
    // Required env vars (set in both Next.js and Trigger.dev):
    //   APP_URL             — e.g. https://your-app.com (no trailing slash)
    //   INTERNAL_API_SECRET — a long random secret shared between both sides
    // APP_URL falls back to localhost so the task works even when the
    // Trigger.dev CLI does not forward .env.local to the worker process.
    const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(
      /\/$/,
      "",
    );
    // console.log("app url: ", appUrl);
    const internalSecret = process.env.INTERNAL_API_SECRET;

    if (!internalSecret)
      throw new Error(
        "INTERNAL_API_SECRET env var is required. Add it to .env.local (Next.js) and to the Trigger.dev environment variables.",
      );

    await metadata.set("progress", 90);

    const saveRes = await fetch(
      `${appUrl}/api/projects/${payload.projectId}/spec`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": internalSecret,
        },
        body: JSON.stringify({ specContent }),
      },
    );

    if (!saveRes.ok) {
      const errText = await saveRes.text();
      throw new Error(
        `Spec persistence failed (${saveRes.status}): ${errText}`,
      );
    }

    const { specId } = (await saveRes.json()) as { specId: string };

    await metadata.set("progress", 100);
    await metadata.set("status", "complete");

    return {
      specContent,
      specId,
      roomId: payload.roomId,
      projectId: payload.projectId,
    };
  },
});
