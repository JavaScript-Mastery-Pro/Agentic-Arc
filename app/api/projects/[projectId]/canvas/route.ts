import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { canAccessProject, getAuthIdentity } from "@/lib/project-access";
import prisma from "@/lib/prisma";

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
    const res = await fetch(project.canvasJsonPath);
    if (!res.ok) return NextResponse.json({ nodes: [], edges: [] });
    return NextResponse.json(await res.json());
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

  const blob = await put(`canvas/${projectId}.json`, JSON.stringify(body), {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
  });

  if (project.canvasJsonPath !== blob.url) {
    await prisma.project.update({
      where: { id: projectId },
      data: { canvasJsonPath: blob.url },
    });
  }

  return NextResponse.json({ saved: true });
}
