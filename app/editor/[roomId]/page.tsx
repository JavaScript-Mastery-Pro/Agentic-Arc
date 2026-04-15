import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Editor } from "@/components/editor/editor";
import prisma from "@/lib/prisma";

interface EditorPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { roomId: rawRoomId } = await params;
  const roomId = decodeURIComponent(rawRoomId);

  const projects = await prisma.project.findMany({
    where: { ownerClerkId: userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });

  return <Editor roomId={roomId} projects={projects} />;
}
