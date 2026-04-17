import { tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

import { canAccessProject, getAuthIdentity } from "@/lib/project-access";
import type { designAgent } from "@/trigger/design-agent";

interface DesignRequestBody {
  roomId?: string;
  prompt?: string;
}

export async function POST(request: Request) {
  const identity = await getAuthIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as DesignRequestBody;
  const roomId = body.roomId?.trim();
  const prompt = body.prompt?.trim();

  if (!roomId || !prompt) {
    return NextResponse.json(
      { error: "roomId and prompt are required." },
      { status: 400 },
    );
  }

  const hasAccess = await canAccessProject(roomId, identity);

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const handle = await tasks.trigger<typeof designAgent>("design-agent", {
    roomId,
    prompt,
  });

  return NextResponse.json({ runId: handle.id, status: "triggered" });
}
