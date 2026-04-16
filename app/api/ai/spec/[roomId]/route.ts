import { auth } from "@clerk/nextjs/server";
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ roomId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roomId } = await context.params;

  // Get the most recent spec for this project
  const spec = await prisma.projectSpec.findFirst({
    where: { project: { id: roomId, ownerClerkId: userId } },
    orderBy: { createdAt: "desc" },
    select: { id: true, filePath: true, createdAt: true },
  });

  if (!spec?.filePath) {
    return NextResponse.json(
      { error: "Spec not found. Generate one first." },
      { status: 404 },
    );
  }

  try {
    const content = await readFile(spec.filePath, "utf-8");
    return NextResponse.json({ spec: content, specId: spec.id });
  } catch {
    return NextResponse.json(
      { error: "Spec file missing. Please regenerate." },
      { status: 404 },
    );
  }
}
