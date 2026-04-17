import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

import { canAccessProject, getAuthIdentity } from "@/lib/project-access";
import prisma from "@/lib/prisma";

const SPEC_DIR = join(process.cwd(), "data", "specs");

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

interface SaveSpecBody {
  specContent?: string;
}

export async function GET(_request: Request, context: RouteContext) {
  const identity = await getAuthIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;

  const hasAccess = await canAccessProject(projectId, identity);

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const records = await prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { id: true, filePath: true, createdAt: true },
  });

  const specs = await Promise.all(
    records.map(async (record, index) => {
      let content = "";
      try {
        content = await readFile(record.filePath, "utf-8");
      } catch {
        // file missing — skip silently, return empty content
      }
      return {
        id: record.id,
        title: `Spec v${index + 1}`,
        content,
        createdAt: record.createdAt.toISOString(),
      };
    }),
  );

  return NextResponse.json({ specs });
}

export async function POST(request: Request, context: RouteContext) {
  const identity = await getAuthIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const body = (await request.json()) as SaveSpecBody;

  const hasAccess = await canAccessProject(projectId, identity);

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!body.specContent) {
    return NextResponse.json(
      { error: "specContent is required." },
      { status: 400 },
    );
  }

  // Create a DB record first to get the ID for the filename
  const specRecord = await prisma.projectSpec.create({
    data: {
      projectId,
      filePath: "", // placeholder until we know the ID
    },
  });

  const projectSpecDir = join(SPEC_DIR, projectId);
  await mkdir(projectSpecDir, { recursive: true });

  const fileName = `${specRecord.id}.md`;
  const filePath = join(projectSpecDir, fileName);
  await writeFile(filePath, body.specContent, "utf-8");

  // Update the record with the real file path
  await prisma.projectSpec.update({
    where: { id: specRecord.id },
    data: { filePath },
  });

  return NextResponse.json({ specId: specRecord.id, ok: true });
}
