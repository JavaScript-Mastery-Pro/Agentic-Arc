import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Editor } from "@/components/editor/editor";

interface EditorPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

const starterProjects = [
  { id: "system-blueprint", name: "System Blueprint" },
  { id: "payments-architecture", name: "Payments Architecture" },
  { id: "agent-runtime", name: "Agent Runtime" },
];

function formatRoomName(roomId: string) {
  return roomId
    .split("-")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { roomId: rawRoomId } = await params;
  const roomId = decodeURIComponent(rawRoomId);
  const projects = starterProjects.some((project) => project.id === roomId)
    ? starterProjects
    : [{ id: roomId, name: formatRoomName(roomId) }, ...starterProjects];

  return <Editor roomId={roomId} projects={projects} />;
}
