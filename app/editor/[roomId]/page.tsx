import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/AccessDenied";
import { Editor } from "@/components/editor/editor";
import { canAccessProject, getAuthIdentity } from "@/lib/project-access";
import prisma from "@/lib/prisma";

interface EditorPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const identity = await getAuthIdentity();

  if (!identity) {
    redirect("/sign-in");
  }

  const { roomId: rawRoomId } = await params;
  const roomId = decodeURIComponent(rawRoomId);

  const hasAccess = await canAccessProject(roomId, identity);

  if (!hasAccess) {
    return <AccessDenied />;
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

  const currentProject = await prisma.project.findUnique({
    where: { id: roomId },
    select: { creatorId: true },
  });

  return (
    <Editor
      roomId={roomId}
      myProjects={myProjects}
      sharedProjects={sharedProjects}
      canManageSharing={currentProject?.creatorId === identity.userId}
    />
  );
}
