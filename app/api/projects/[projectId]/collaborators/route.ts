import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { normalizeEmail } from "@/lib/project-access";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

interface InviteBody {
  email?: string;
}

export async function GET(_request: Request, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, creatorId: userId },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      collaboratorEmail: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ collaborators });
}

export async function POST(request: Request, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, creatorId: userId },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as InviteBody;
  const emailRaw = body.email?.trim();

  if (!emailRaw) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const email = normalizeEmail(emailRaw);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email." },
      { status: 400 },
    );
  }

  const collaborator = await prisma.projectCollaborator.upsert({
    where: {
      projectId_collaboratorEmail: {
        projectId,
        collaboratorEmail: email,
      },
    },
    create: {
      projectId,
      collaboratorEmail: email,
    },
    update: {},
    select: {
      id: true,
      collaboratorEmail: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ collaborator }, { status: 201 });
}
