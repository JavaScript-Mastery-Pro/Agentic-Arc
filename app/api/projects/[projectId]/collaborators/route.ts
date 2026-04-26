import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { normalizeEmail } from "@/lib/project-access";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

interface InviteBody {
  email?: string;
}

interface DeleteCollaboratorBody {
  collaboratorId?: string;
}

type CollaboratorRecord = {
  id: string;
  collaboratorEmail: string;
  createdAt: Date;
};

async function withClerkProfiles(collaborators: CollaboratorRecord[]) {
  const emails = collaborators.map(
    (collaborator) => collaborator.collaboratorEmail,
  );

  if (!emails.length) {
    return collaborators.map((collaborator) => ({
      ...collaborator,
      displayName: null,
      avatarUrl: null,
      clerkUserId: null,
    }));
  }

  try {
    const client = await clerkClient();
    const users = await client.users.getUserList({ emailAddress: emails });
    const usersByEmail = new Map(
      users.data.flatMap((user) =>
        user.emailAddresses.map((emailAddress) => [
          normalizeEmail(emailAddress.emailAddress),
          user,
        ]),
      ),
    );

    return collaborators.map((collaborator) => {
      const user = usersByEmail.get(
        normalizeEmail(collaborator.collaboratorEmail),
      );

      return {
        ...collaborator,
        displayName: user?.fullName || user?.username || null,
        avatarUrl: user?.imageUrl || null,
        clerkUserId: user?.id || null,
      };
    });
  } catch (error) {
    console.error("Failed to load collaborator Clerk profiles", error);

    return collaborators.map((collaborator) => ({
      ...collaborator,
      displayName: null,
      avatarUrl: null,
      clerkUserId: null,
    }));
  }
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

  return NextResponse.json({
    collaborators: await withClerkProfiles(collaborators),
  });
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

export async function DELETE(request: Request, context: RouteContext) {
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

  const body = (await request.json()) as DeleteCollaboratorBody;
  const collaboratorId = body.collaboratorId?.trim();

  if (!collaboratorId) {
    return NextResponse.json(
      { error: "Collaborator id is required." },
      { status: 400 },
    );
  }

  const result = await prisma.projectCollaborator.deleteMany({
    where: {
      id: collaboratorId,
      projectId,
    },
  });

  if (!result.count) {
    return NextResponse.json(
      { error: "Collaborator invite not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
