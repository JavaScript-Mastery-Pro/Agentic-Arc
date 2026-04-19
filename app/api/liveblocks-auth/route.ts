import { currentUser, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getLiveblocks, getUserColor } from "@/lib/liveblocks";
import { canAccessProject, normalizeEmail } from "@/lib/project-access";

function getDisplayName(user: Awaited<ReturnType<typeof currentUser>>) {
  return (
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "Anonymous"
  );
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = (await request.json()) as { room?: string };
    const roomId = body.room?.trim();

    if (!roomId) {
      return NextResponse.json(
        { error: "Room id is required." },
        { status: 400 },
      );
    }

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress
      ? normalizeEmail(user.primaryEmailAddress.emailAddress)
      : null;

    const hasAccess = await canAccessProject(roomId, {
      userId,
      email,
    });

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const liveblocks = getLiveblocks();

    await liveblocks.getOrCreateRoom(roomId, {
      defaultAccesses: ["room:write"],
      metadata: {
        title: roomId,
      },
    });

    // Ensure feeds exist for this room — idempotent, safe to call on every auth
    await Promise.allSettled([
      liveblocks.createFeed({ roomId, feedId: "ai-chat" }),
      liveblocks.createFeed({ roomId, feedId: "ai-status-feed" }),
    ]);

    const { status, body: liveblocksBody } = await liveblocks.identifyUser(
      {
        userId,
        groupIds: [],
      },
      {
        userInfo: {
          name: getDisplayName(user),
          avatar: user?.imageUrl || "",
          color: getUserColor(userId),
        },
      },
    );

    return new NextResponse(liveblocksBody, { status });
  } catch (error) {
    console.error("Failed to authenticate with Liveblocks", error);

    return NextResponse.json(
      {
        error:
          process.env.LIVEBLOCKS_SECRET_KEY == null
            ? "LIVEBLOCKS_SECRET_KEY is not configured."
            : "Failed to authenticate with Liveblocks.",
      },
      { status: 500 },
    );
  }
}
