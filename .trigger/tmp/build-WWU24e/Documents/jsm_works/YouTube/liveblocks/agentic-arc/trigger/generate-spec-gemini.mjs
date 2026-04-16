import {
  createGoogleGenerativeAI
} from "../../../../../../chunk-NIQCOBT6.mjs";
import {
  external_exports,
  generateText
} from "../../../../../../chunk-74QZRFK3.mjs";
import "../../../../../../chunk-RQYKA76I.mjs";
import {
  metadata,
  task
} from "../../../../../../chunk-PX67KK3X.mjs";
import "../../../../../../chunk-HCD45DYG.mjs";
import {
  __name,
  init_esm
} from "../../../../../../chunk-3R76H35D.mjs";

// trigger/generate-spec-gemini.ts
init_esm();
var specPayloadSchema = external_exports.object({
  projectId: external_exports.string(),
  roomId: external_exports.string(),
  chatHistory: external_exports.array(
    external_exports.object({
      role: external_exports.enum(["user", "assistant"]),
      content: external_exports.string()
    })
  ),
  nodes: external_exports.array(external_exports.record(external_exports.string(), external_exports.unknown())),
  edges: external_exports.array(external_exports.record(external_exports.string(), external_exports.unknown()))
});
var generateSpecGemini = task({
  id: "generate-spec-gemini",
  retry: {
    maxAttempts: 2
  },
  run: /* @__PURE__ */ __name(async (payload) => {
    const parsed = specPayloadSchema.parse(payload);
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set.");
    const gemini = createGoogleGenerativeAI({ apiKey });
    await metadata.set("status", "generating");
    await metadata.set("progress", 10);
    const chatContext = parsed.chatHistory.map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`).join("\n");
    const canvasJson = JSON.stringify(
      { nodes: parsed.nodes, edges: parsed.edges },
      null,
      2
    );
    await metadata.set("progress", 20);
    const result = await generateText({
      model: gemini(
        process.env.GEMINI_SPEC_MODEL ?? process.env.GEMINI_MODEL ?? "gemini-2.0-flash"
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

Generate a comprehensive technical specification for this system.`
    });
    await metadata.set("progress", 80);
    const specContent = result.text;
    await metadata.set("progress", 100);
    await metadata.set("status", "complete");
    return {
      specContent,
      roomId: parsed.roomId,
      projectId: parsed.projectId
    };
  }, "run")
});
export {
  generateSpecGemini
};
//# sourceMappingURL=generate-spec-gemini.mjs.map
