import { ASPECTS, PLATFORMS, validateAll } from "./lib/configs";
import { runJob, type JobRequest } from "./lib/pipeline";
import type { AspectId, Platform, RenderMode, TemplateId } from "../remotion/src/lib/types";

/**
 * Single-job pipeline (§9): validate → assemble → captions → render →
 * post → sidecar → contact sheet → verify.
 *
 * Usage:
 *   tsx scripts/render.ts --template spotlight --game rust \
 *     [--aspects 9x16,16x9] [--seed 41] [--mode test|production] \
 *     [--music auto|none|<file>] [--platforms tiktok,shorts,reels] \
 *     [--debug-safe-area] [--vo]
 */
function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const value = process.argv[i + 1];
  if (!value || value.startsWith("--")) return fallback;
  return value;
}

const flag = (name: string): boolean => process.argv.includes(`--${name}`);

const template = arg("template") as TemplateId | undefined;
const game = arg("game");
if (!template || !game) {
  console.error("usage: tsx scripts/render.ts --template <id> --game <id> [options]");
  process.exit(2);
}

const request: JobRequest = {
  template,
  game,
  aspects: (arg("aspects", "9x16,16x9") as string).split(",") as AspectId[],
  seed: Number(arg("seed", "41")),
  mode: (arg("mode", "test") as RenderMode) ?? "test",
  music: arg("music", "auto") as JobRequest["music"],
  platforms: (arg("platforms", PLATFORMS.join(",")) as string).split(",") as Platform[],
  debugSafeArea: flag("debug-safe-area"),
  outRoot: arg("out-root", "out"),
};

if (request.aspects.some((a) => !ASPECTS.includes(a))) {
  console.error(`aspects must be from: ${ASPECTS.join(", ")}`);
  process.exit(2);
}
if (flag("vo")) {
  // §3: VO is optional and OFF by default; Kokoro is only installed when
  // exercised. Not implemented until a phase needs it — never a blocker.
  console.warn("--vo requested but VO stage is not installed; continuing without VO (§3 optional dep policy)");
}

// Stage 1: validate everything before any rendering.
const { errors, warnings } = validateAll();
for (const w of warnings) console.log(`WARN  ${w.where}: ${w.msg}`);
if (errors.length > 0) {
  for (const e of errors) console.error(`ERROR ${e.where}: ${e.msg}`);
  console.error(`\nvalidation failed with ${errors.length} error(s) — refusing to render (§9.1)`);
  process.exit(1);
}

const result = await runJob(request, (msg) => console.log(msg)).catch((err: Error) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
for (const video of result.videos) {
  for (const check of video.checks) {
    console.log(`  [${check.pass ? "pass" : "FAIL"}] ${video.aspect} ${check.name}: ${check.detail}`);
  }
}
console.log(result.pass ? "\n✓ job green" : "\n✗ job has failures");
process.exit(result.pass ? 0 : 1);
