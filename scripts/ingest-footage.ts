import { existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { loadGames } from "./lib/configs";
import { REPO_ROOT } from "./lib/env";
import { probe } from "./lib/ffmpeg";
import { run } from "./lib/run";

/**
 * Turns raw capture recordings into render-ready b-roll clips (§7.4 real
 * footage). Record freely with OBS (any length), drop the files into
 * assets/footage-raw/<game>/, then:
 *
 *   npx tsx scripts/ingest-footage.ts [--clean] [--clip-seconds 15] [--max 12]
 *
 * Each recording is sliced into evenly spaced clips (skipping the first/last
 * 3s), fitted to 1920×1080 @30fps, audio stripped. --clean deletes the ph-*
 * placeholder clips for games that received real footage.
 */
const argNum = (name: string, fallback: number): number => {
  const i = process.argv.indexOf(`--${name}`);
  const v = i === -1 ? NaN : Number(process.argv[i + 1]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};
const CLIP_SECONDS = argNum("clip-seconds", 15);
const MAX_CLIPS = argNum("max", 12);
const CLEAN = process.argv.includes("--clean");
const TRIM_EDGES = 3;

const RAW_ROOT = resolve(REPO_ROOT, "assets/footage-raw");
const VIDEO_EXT = /\.(mp4|mkv|mov|avi|webm)$/i;

if (!existsSync(RAW_ROOT)) {
  console.log("No assets/footage-raw/ directory. Create assets/footage-raw/<game>/ and drop OBS recordings in.");
  process.exit(0);
}

for (const game of loadGames().filter((g) => g.enabled)) {
  const rawDir = join(RAW_ROOT, game.id);
  if (!existsSync(rawDir)) continue;
  const rawFiles = readdirSync(rawDir).filter((f) => VIDEO_EXT.test(f)).sort();
  if (rawFiles.length === 0) continue;

  const outDir = resolve(REPO_ROOT, game.footageDir);
  mkdirSync(outDir, { recursive: true });
  let made = 0;

  for (const raw of rawFiles) {
    if (made >= MAX_CLIPS) break;
    const rawPath = join(rawDir, raw);
    const info = await probe(rawPath);
    const usable = info.durationSec - TRIM_EDGES * 2;
    if (usable < CLIP_SECONDS) {
      console.log(`· ${game.id}/${raw}: too short (${info.durationSec.toFixed(0)}s) — skip`);
      continue;
    }
    const slots = Math.min(Math.floor(usable / CLIP_SECONDS), MAX_CLIPS - made);
    const stride = usable / slots;
    const stem = basename(raw, extname(raw)).replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
    for (let i = 0; i < slots; i++) {
      const start = TRIM_EDGES + i * stride;
      const out = join(outDir, `cap-${stem}-${String(i + 1).padStart(2, "0")}.mp4`);
      await run("ffmpeg", [
        "-y", "-v", "error",
        "-ss", start.toFixed(2),
        "-i", rawPath,
        "-t", String(CLIP_SECONDS),
        "-vf", "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30",
        "-an",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        out,
      ]);
      made += 1;
      console.log(`✓ ${game.id}: ${basename(out)} (${CLIP_SECONDS}s @ ${start.toFixed(0)}s)`);
      if (made >= MAX_CLIPS) break;
    }
  }

  if (made > 0 && CLEAN) {
    for (const ph of readdirSync(outDir).filter((f) => f.startsWith("ph-"))) {
      unlinkSync(join(outDir, ph));
      console.log(`✗ ${game.id}: removed placeholder ${ph}`);
    }
  } else if (made > 0) {
    const leftover = readdirSync(outDir).filter((f) => f.startsWith("ph-")).length;
    if (leftover > 0) {
      console.log(`! ${game.id}: ${leftover} placeholder clips still present — rerun with --clean to remove them`);
    }
  }
}
console.log("\ningest done");
