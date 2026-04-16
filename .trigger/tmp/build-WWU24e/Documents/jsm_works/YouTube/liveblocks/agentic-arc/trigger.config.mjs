import {
  defineConfig
} from "../../../../../chunk-PX67KK3X.mjs";
import "../../../../../chunk-HCD45DYG.mjs";
import {
  init_esm
} from "../../../../../chunk-3R76H35D.mjs";

// trigger.config.ts
init_esm();
var trigger_config_default = defineConfig({
  project: "proj_tviwtamtthknpotvltfo",
  dirs: ["./trigger"],
  // 5 minutes
  maxDuration: 5 * 60 * 1e3,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1e3,
      maxTimeoutInMs: 3e4,
      factor: 2,
      randomize: true
    }
  },
  build: {}
});
var resolveEnvVars = void 0;
export {
  trigger_config_default as default,
  resolveEnvVars
};
//# sourceMappingURL=trigger.config.mjs.map
