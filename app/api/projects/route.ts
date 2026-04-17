import { currentUser, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { normalizeEmail } from "@/lib/project-access";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress
    ? normalizeEmail(user.primaryEmailAddress.emailAddress)
    : null;

  const myProjects = await prisma.project.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, status: true, createdAt: true },
  });

  const sharedProjects = email
    ? await prisma.project.findMany({
        where: {
          creatorId: { not: userId },
          collaborators: {
            some: {
              collaboratorEmail: {
                equals: email,
                mode: "insensitive",
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, status: true, createdAt: true },
      })
    : [];

  return NextResponse.json({ myProjects, sharedProjects });
}

interface CreateProjectBody {
  name?: string;
  roomId?: string;
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateProjectBody;
  const name = body.name?.trim();
  const roomId = body.roomId?.trim();

  if (!name || !roomId) {
    return NextResponse.json(
      { error: "name and roomId are required." },
      { status: 400 },
    );
  }

  // Prevent duplicate projects with the same roomId for this user
  const existing = await prisma.project.findFirst({
    where: { id: roomId, creatorId: userId },
  });

  if (existing) {
    return NextResponse.json(existing);
  }

  const project = await prisma.project.create({
    data: {
      id: roomId,
      creatorId: userId,
      name,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
