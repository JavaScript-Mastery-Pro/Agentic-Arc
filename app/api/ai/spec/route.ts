import { tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

import { canAccessProject, getAuthIdentity } from "@/lib/project-access";
import type { generateSpecGemini } from "@/trigger/generate-spec-gemini";

interface GenerateSpecBody {
  roomId?: string;
  projectId?: string;
  chatHistory?: { role: "user" | "assistant"; content: string }[];
  nodes?: unknown[];
  edges?: unknown[];
}

export async function POST(request: Request) {
  const identity = await getAuthIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as GenerateSpecBody;

  if (!body.roomId || !body.nodes || !body.edges) {
    return NextResponse.json(
      { error: "roomId, nodes, and edges are required." },
      { status: 400 },
    );
  }

  const hasAccess = await canAccessProject(body.roomId, identity);

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const handle = await tasks.trigger<typeof generateSpecGemini>(
    "generate-spec-gemini",
    {
      projectId: body.projectId ?? body.roomId,
      roomId: body.roomId,
      chatHistory: body.chatHistory ?? [],
      nodes: body.nodes as Record<string, unknown>[],
      edges: body.edges as Record<string, unknown>[],
    },
  );

  return NextResponse.json({
    runId: handle.id,
    status: "triggered",
  });
}
