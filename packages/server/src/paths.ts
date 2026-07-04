import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SPANNER_VERSION = "0.0.0";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/** Resolve `$SPANNER_HOME` (default `~/.spanner`). */
export function resolveSpannerHome(env: NodeJS.ProcessEnv = process.env): string {
  const fromEnv = env.SPANNER_HOME;
  if (fromEnv && fromEnv.trim().length > 0) {
    return resolve(fromEnv);
  }
  const home = env.HOME ?? env.USERPROFILE ?? "/tmp";
  return resolve(home, ".spanner");
}

export const PKG_ROOT = resolve(__dirname, "..");
export const SRC_ROOT = resolve(PKG_ROOT, "src");
