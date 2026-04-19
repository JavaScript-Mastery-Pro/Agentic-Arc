import { redirect } from "next/navigation";

import { EditorHome } from "@/components/editor/editor-home";
import { getAuthIdentity } from "@/lib/project-access";
import { getProjectListForUser } from "@/lib/project-queries";

export default async function EditorHomePage() {
  const identity = await getAuthIdentity();

  if (!identity) {
    redirect("/sign-in");
  }

  const { myProjects, sharedProjects } = await getProjectListForUser(identity);

  return <EditorHome myProjects={myProjects} sharedProjects={sharedProjects} />;
}
