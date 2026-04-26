import { get, put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { canAccessProject, getAuthIdentity } from "@/lib/project-access";
import prisma from "@/lib/prisma";

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
        const blob = await get(record.filePath, { access: "private" });
        if (blob?.statusCode === 200) {
          content = await new Response(blob.stream).text();
        }
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
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage is not configured." },
      { status: 500 },
    );
  }

  const specId = crypto.randomUUID();
  const blobPathname = `specs/${projectId}/${specId}.md`;
  const blob = await put(blobPathname, body.specContent, {
    access: "private",
    addRandomSuffix: false,
    contentType: "text/markdown; charset=utf-8",
  });

  const specRecord = await prisma.projectSpec.create({
    data: { id: specId, projectId, filePath: blob.url },
  });

  return NextResponse.json({ specId: specRecord.id, ok: true });
}
