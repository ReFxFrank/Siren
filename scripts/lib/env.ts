import { existsSync } from "node:fs";
import { cpus } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Repo root derived from this file's location — safe under any cwd. */
export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const ENTRY_POINT = resolve(REPO_ROOT, "remotion/src/index.ts");
export const PUBLIC_DIR = resolve(REPO_ROOT, "assets");

/**
 * Browser resolution order: explicit env override → container-provided
 * headless shell → null (Remotion resolves its own browser, e.g. on
 * Frank's Windows machine).
 */
const CONTAINER_SHELL =
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";

export function browserExecutable(): string | null {
  if (process.env.SIREN_BROWSER) return process.env.SIREN_BROWSER;
  if (existsSync(CONTAINER_SHELL)) return CONTAINER_SHELL;
  return null;
}

/** Software GL only when we forced our own browser (headless container). */
export function glRenderer(): "swangle" | null {
  return browserExecutable() ? "swangle" : null;
}

export function renderConcurrency(): number {
  const env = Number(process.env.SIREN_CONCURRENCY);
  if (Number.isFinite(env) && env > 0) return env;
  return Math.max(2, Math.floor(cpus().length / 2));
}
