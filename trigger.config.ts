import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_tviwtamtthknpotvltfo",
  dirs: ["./trigger"],
  maxDuration: 5 * 60 * 1000, // 5 minutes
  retries: {
    enabledInDev: false,

    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 30000,

      factor: 2,
      randomize: true,
    },
  },
});
