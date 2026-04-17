import { redirect } from "next/navigation";

import { EditorHome } from "@/components/editor/editor-home";
import { getAuthIdentity } from "@/lib/project-access";
import prisma from "@/lib/prisma";

export default async function EditorHomePage() {
  const identity = await getAuthIdentity();

  if (!identity) {
    redirect("/sign-in");
  }

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

  return <EditorHome myProjects={myProjects} sharedProjects={sharedProjects} />;
}
