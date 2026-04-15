import { auth } from "@clerk/nextjs/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

const SPEC_DIR = join(process.cwd(), "data", "specs");

interface RouteContext {
  params: Promise<{ roomId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roomId } = await context.params;
  const filePath = join(SPEC_DIR, `${roomId}.md`);

  try {
    const content = await readFile(filePath, "utf-8");

    // Update project record if not already set
    const project = await prisma.project.findUnique({
      where: { id: roomId },
      select: { specMarkdownPath: true },
    });

    if (project && !project.specMarkdownPath) {
      await prisma.project.update({
        where: { id: roomId },
        data: { specMarkdownPath: filePath },
      });
    }

    return NextResponse.json({ content, filePath });
  } catch {
    return NextResponse.json(
      { error: "Spec not found. Generate one first." },
      { status: 404 },
    );
  }
}
