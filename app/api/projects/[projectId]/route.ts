import { rm, unlink } from "node:fs/promises";
import { join } from "node:path";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

const CANVAS_DIR = join(process.cwd(), "data", "canvas");
const SPEC_DIR = join(process.cwd(), "data", "specs");

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const body = (await request.json()) as { name?: string };
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { creatorId: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (project.creatorId !== userId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { name },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { creatorId: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (project.creatorId !== userId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await prisma.project.delete({ where: { id: projectId } });

  // Non-fatal artifact cleanup — orphaned files should not fail the response.
  const cleanupResults = await Promise.allSettled([
    unlink(join(CANVAS_DIR, `${projectId}.json`)),
    rm(join(SPEC_DIR, projectId), { recursive: true, force: true }),
  ]);
  for (const result of cleanupResults) {
    if (result.status === "rejected") {
      console.error("[project-delete] Artifact cleanup error:", result.reason);
    }
  }

  return new NextResponse(null, { status: 204 });
}
