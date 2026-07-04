import { resolve } from "node:path";

export const SPANNER_VERSION = "0.0.0";

/** Resolve `$SPANNER_HOME` (default `~/.spanner`). */
export function resolveSpannerHome(env: NodeJS.ProcessEnv = process.env): string {
  const fromEnv = env.SPANNER_HOME;
  if (fromEnv && fromEnv.trim().length > 0) {
    return resolve(fromEnv);
  }
  const home = env.HOME ?? env.USERPROFILE ?? "/tmp";
  return resolve(home, ".spanner");
}
