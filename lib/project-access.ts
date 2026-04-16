import { auth, currentUser } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

export interface AuthIdentity {
  userId: string;
  email: string | null;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getAuthIdentity(): Promise<AuthIdentity | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress
    ? normalizeEmail(user.primaryEmailAddress.emailAddress)
    : null;

  return { userId, email };
}

export async function canAccessProject(
  projectId: string,
  identity: AuthIdentity,
): Promise<boolean> {
  const clauses: Array<Record<string, unknown>> = [
    { creatorId: identity.userId },
  ];

  if (identity.email) {
    clauses.push({
      collaborators: {
        some: {
          collaboratorEmail: {
            equals: identity.email,
            mode: "insensitive",
          },
        },
      },
    });
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: clauses,
    },
    select: { id: true },
  });

  return Boolean(project);
}

export async function isProjectCreator(
  projectId: string,
  userId: string,
): Promise<boolean> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      creatorId: userId,
    },
    select: { id: true },
  });

  return Boolean(project);
}
