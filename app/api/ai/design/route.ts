import { auth } from "@clerk/nextjs/server";
import { tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

import type { designAgent } from "@/trigger/design-agent";

interface DesignRequestBody {
  roomId?: string;
  prompt?: string;
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
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

  const handle = await tasks.trigger<typeof designAgent>("design-agent", {
    roomId,
    prompt,
  });

  return NextResponse.json({ runId: handle.id, status: "triggered" });
}
