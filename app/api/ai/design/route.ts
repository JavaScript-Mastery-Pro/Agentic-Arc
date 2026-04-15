import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { runDesignAgent } from "@/lib/ai-agent";

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

  try {
    await runDesignAgent(roomId, prompt);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("AI design agent error:", error);
    return NextResponse.json(
      { error: "AI agent failed. Please try again." },
      { status: 500 },
    );
  }
}
