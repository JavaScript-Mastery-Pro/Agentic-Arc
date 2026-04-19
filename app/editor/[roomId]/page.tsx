import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/AccessDenied";
import { Editor } from "@/components/editor/editor";
import { canAccessProject, getAuthIdentity } from "@/lib/project-access";
import prisma from "@/lib/prisma";
import { getProjectListForUser } from "@/lib/project-queries";

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

  const [{ myProjects, sharedProjects }, currentProject] = await Promise.all([
    getProjectListForUser(identity),
    prisma.project.findUnique({
      where: { id: roomId },
      select: { creatorId: true },
    }),
  ]);

  return (
    <Editor
      roomId={roomId}
      myProjects={myProjects}
      sharedProjects={sharedProjects}
      canManageSharing={currentProject?.creatorId === identity.userId}
    />
  );
}
