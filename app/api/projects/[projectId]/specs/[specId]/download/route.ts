import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";

import { canAccessProject, getAuthIdentity } from "@/lib/project-access";
import prisma from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ projectId: string; specId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const identity = await getAuthIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, specId } = await context.params;

  const hasAccess = await canAccessProject(projectId, identity);

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const spec = await prisma.projectSpec.findFirst({
    where: {
      id: specId,
      project: { id: projectId },
    },
    select: { filePath: true, createdAt: true },
  });

  if (!spec?.filePath) {
    return NextResponse.json({ error: "Spec not found." }, { status: 404 });
  }

  const content = await readFile(spec.filePath, "utf-8");
  const fileName = `spec-${spec.createdAt.toISOString().split("T")[0]}.md`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
