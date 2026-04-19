import { auth as clerkAuth } from "@clerk/nextjs/server";
import { auth } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

interface TokenRequestBody {
  runId?: string;
}

export async function POST(request: Request) {
  const { userId } = await clerkAuth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as TokenRequestBody;
  const runId = body.runId?.trim();

  if (!runId) {
    return NextResponse.json({ error: "runId is required." }, { status: 400 });
  }

  // Verify the run belongs to the requesting user.
  const taskRun = await prisma.taskRun.findUnique({
    where: { runId },
    select: { userId: true },
  });

  if (!taskRun || taskRun.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const publicToken = await auth.createPublicToken({
    scopes: {
      read: {
        runs: [runId],
      },
    },
    expirationTime: "1h",
  });

  return NextResponse.json({ publicToken });
}
