import { runs } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

import { getAuthIdentity } from "@/lib/project-access";
import prisma from "@/lib/prisma";

interface CancelRequestBody {
  runId?: string;
}

export async function POST(request: Request) {
  const identity = await getAuthIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CancelRequestBody;
  const runId = body.runId?.trim();

  if (!runId) {
    return NextResponse.json({ error: "runId is required." }, { status: 400 });
  }

  // Verify the run belongs to the requesting user.
  const taskRun = await prisma.taskRun.findUnique({
    where: { runId },
    select: { userId: true },
  });

  if (!taskRun || taskRun.userId !== identity.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await runs.cancel(runId);

  return NextResponse.json({ cancelled: true });
}
