import { currentUser, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getLiveblocks, getUserColor } from "@/lib/liveblocks";

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

    const liveblocks = getLiveblocks();
    const user = await currentUser();

    await liveblocks.getOrCreateRoom(roomId, {
      defaultAccesses: ["room:write"],
      metadata: {
        title: roomId,
      },
    });

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
