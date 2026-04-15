import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_placeholder", // Replace with your Trigger.dev project ref
  dirs: ["./trigger"],
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 30000,
      factor: 2,
    },
  },
});
