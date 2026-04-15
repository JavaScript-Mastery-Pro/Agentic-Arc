import { Liveblocks } from "@liveblocks/node";

const USER_COLORS = ["#22d3ee", "#f59e0b", "#34d399", "#fb7185", "#a78bfa"];

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined;
};

export function getLiveblocks() {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not set.");
  }

  if (!globalForLiveblocks.liveblocks) {
    globalForLiveblocks.liveblocks = new Liveblocks({ secret });
  }

  return globalForLiveblocks.liveblocks;
}

export function getUserColor(userId: string) {
  const index = Array.from(userId).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return USER_COLORS[index % USER_COLORS.length];
}
