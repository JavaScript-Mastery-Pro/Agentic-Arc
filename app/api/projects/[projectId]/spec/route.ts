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
  const { projectId } = await context.params;
  const body = (await request.json()) as SaveSpecBody;

  // Allow internal calls from Trigger.dev tasks using a shared secret.
  // Set INTERNAL_API_SECRET in both Next.js and Trigger.dev environment variables.
  const internalSecret = request.headers.get("x-internal-secret");
  const isInternalRequest =
    internalSecret != null &&
    process.env.INTERNAL_API_SECRET != null &&
    internalSecret === process.env.INTERNAL_API_SECRET;

  if (!isInternalRequest) {
    const identity = await getAuthIdentity();

    if (!identity) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasAccess = await canAccessProject(projectId, identity);

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (!body.specContent) {
    return NextResponse.json(
      { error: "specContent is required." },
      { status: 400 },
    );
  }

  // Atomic persistence: pre-compute canonical ID and path, write the file,
  // then create the DB record in a single step with the real path.
  // This eliminates the empty-placeholder pattern that left dangling records.
  const specId = crypto.randomUUID();
  const projectSpecDir = join(SPEC_DIR, projectId);
  const filePath = join(projectSpecDir, `${specId}.md`);

  await mkdir(projectSpecDir, { recursive: true });
  await writeFile(filePath, body.specContent, "utf-8");

  const specRecord = await prisma.projectSpec.create({
    data: { id: specId, projectId, filePath },
  });

  return NextResponse.json({ specId: specRecord.id, ok: true });
}
