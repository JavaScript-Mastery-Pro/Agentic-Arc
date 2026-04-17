import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

import { canAccessProject, getAuthIdentity } from "@/lib/project-access";
import prisma from "@/lib/prisma";

const CANVAS_DIR = join(process.cwd(), "data", "canvas");

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const identity = await getAuthIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;

  const hasAccess = await canAccessProject(projectId, identity);

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project?.canvasJsonPath) {
    return NextResponse.json({ nodes: [], edges: [] });
  }

  try {
    const raw = await readFile(project.canvasJsonPath, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ nodes: [], edges: [] });
  }
}

interface CanvasPayload {
  nodes: unknown[];
  edges: unknown[];
}

export async function PUT(request: Request, context: RouteContext) {
  const identity = await getAuthIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;

  const hasAccess = await canAccessProject(projectId, identity);

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    // Project hasn't been created in DB yet — skip save silently
    return NextResponse.json({ saved: false, reason: "project_not_found" });
  }

  const body = (await request.json()) as CanvasPayload;

  if (!Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
    return NextResponse.json(
      { error: "nodes and edges arrays are required." },
      { status: 400 },
    );
  }

  await mkdir(CANVAS_DIR, { recursive: true });

  const filePath = join(CANVAS_DIR, `${projectId}.json`);

  await writeFile(filePath, JSON.stringify(body, null, 2), "utf-8");

  if (project.canvasJsonPath !== filePath) {
    await prisma.project.update({
      where: { id: projectId },
      data: { canvasJsonPath: filePath },
    });
  }

  return NextResponse.json({ saved: true });
}
