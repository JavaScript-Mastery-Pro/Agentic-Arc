import type { AuthIdentity } from "@/lib/project-access";
import prisma from "@/lib/prisma";

export interface ProjectListItem {
  id: string;
  name: string;
}

export interface ProjectList {
  myProjects: ProjectListItem[];
  sharedProjects: ProjectListItem[];
}

/**
 * Returns the projects owned by the user and projects shared with them,
 * both ordered newest-first. Shared lookup is skipped when no email is
 * available on the identity (e.g. OAuth accounts without a verified address).
 */
export async function getProjectListForUser(
  identity: AuthIdentity,
): Promise<ProjectList> {
  const myProjects = await prisma.project.findMany({
    where: { creatorId: identity.userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });

  const sharedProjects = identity.email
    ? await prisma.project.findMany({
        where: {
          creatorId: { not: identity.userId },
          collaborators: {
            some: {
              collaboratorEmail: {
                equals: identity.email,
                mode: "insensitive",
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true },
      })
    : [];

  return { myProjects, sharedProjects };
}
