import { createOpenAI } from "@ai-sdk/openai";
import { task, metadata } from "@trigger.dev/sdk";
import { generateText } from "ai";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
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
  nodes: z.array(z.record(z.unknown())),
  edges: z.array(z.record(z.unknown())),
});

type SpecPayload = z.infer<typeof specPayloadSchema>;

// ── OpenRouter client ───────────────────────────────────────────────
function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set.");

  return createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });
}

// ── Constants ───────────────────────────────────────────────────────
const SPEC_DIR = join(process.cwd(), "data", "specs");

// ── Task ────────────────────────────────────────────────────────────
export const generateSpec = task({
  id: "generate-spec",
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: SpecPayload) => {
    const parsed = specPayloadSchema.parse(payload);
    const openrouter = getOpenRouterClient();

    // ── Step 1: Update status ─────────────────────────────────────
    await metadata.set("status", "generating");
    await metadata.set("progress", 10);

    // ── Step 2: Build context from chat history + canvas ──────────
    const chatContext = parsed.chatHistory
      .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
      .join("\n");

    const canvasJson = JSON.stringify(
      { nodes: parsed.nodes, edges: parsed.edges },
      null,
      2,
    );

    await metadata.set("progress", 20);

    // ── Step 3: Generate spec via LLM ─────────────────────────────
    const result = await generateText({
      model: openrouter.chat(
        process.env.OPENROUTER_SPEC_MODEL ??
          process.env.OPENROUTER_MODEL ??
          "google/gemini-2.0-flash-exp:free",
      ),
      maxOutputTokens: 8192,
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

    // ── Step 4: Save spec to disk ─────────────────────────────────
    const specContent = result.text;
    await mkdir(SPEC_DIR, { recursive: true });

    const filePath = join(SPEC_DIR, `${parsed.roomId}.md`);
    await writeFile(filePath, specContent, "utf-8");

    await metadata.set("progress", 90);

    // ── Step 5: Update project in DB ──────────────────────────────
    // We use a dynamic import to avoid bundling prisma in the trigger worker
    // The API route will handle the DB update instead via the callback
    await metadata.set("progress", 100);
    await metadata.set("status", "complete");

    return {
      filePath,
      specLength: specContent.length,
      roomId: parsed.roomId,
      projectId: parsed.projectId,
    };
  },
});
