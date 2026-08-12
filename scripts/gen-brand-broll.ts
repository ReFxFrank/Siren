import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadGames } from "./lib/configs";
import { REPO_ROOT } from "./lib/env";
import { probe } from "./lib/ffmpeg";
import { run } from "./lib/run";

/**
 * PRODUCTION brand b-roll: polished abstract motion backgrounds in the ReFx
 * world (aurora washes, grid parallax, light sweeps) tinted per game accent.
 * Unlike gen-placeholders.ts output these carry no watermark and no
 * placeholder tag — they are publishable brand visuals, not stand-ins for
 * gameplay, per the 2026-08-12 decision (BRIEF addendum): SIREN videos use
 * branded motion + real refx.gg storefront captures instead of gameplay.
 *
 *   npx tsx scripts/gen-brand-broll.ts [--force]
 */
const CLIP_SECONDS = 12;
const CLIPS_PER_GAME = 6;
const BRAND_TAG = "SIREN_BRAND_BROLL";

function mix(hexA: string, hexB: string, t: number): string {
  const a = parseInt(hexA.slice(1), 16);
  const b = parseInt(hexB.slice(1), 16);
  const ch = (shift: number) =>
    Math.round(((a >> shift) & 0xff) * (1 - t) + ((b >> shift) & 0xff) * t);
  return `0x${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0")}`;
}

const DARK = "#0a111d";
const DARKEST = "#070b12";

/** Layered recipes — deeper than the placeholder set, no watermark. */
function recipe(kind: number, accent: string, seed: number): string[] {
  const glow = mix(DARK, accent, 0.5);
  const dim = mix(DARKEST, accent, 0.26);
  const faint = mix(DARKEST, accent, 0.1);
  const grain = "noise=alls=4:allf=t";
  switch (kind % 3) {
    case 0: // aurora drift — two gradient layers blended, slow counter-motion
      return [
        "-f", "lavfi", "-i", `gradients=s=1920x1080:rate=30:c0=${faint}:c1=${glow}:c2=${mix(DARKEST, accent, 0.18)}:nb_colors=3:seed=${seed}:speed=0.011`,
        "-f", "lavfi", "-i", `gradients=s=1920x1080:rate=30:c0=${DARKEST.replace("#", "0x")}:c1=${dim}:nb_colors=2:type=radial:seed=${seed + 5}:speed=0.019`,
        "-filter_complex", `[0:v][1:v]blend=all_mode=screen:all_opacity=0.55,vignette=PI/4.6,${grain}`,
      ];
    case 1: // grid parallax — two grid layers panning at different depths
      return [
        "-f", "lavfi", "-i", `color=c=${faint}:s=2400x1560:rate=30`,
        "-f", "lavfi", "-i", `gradients=s=1920x1080:rate=30:c0=${DARKEST.replace("#", "0x")}:c1=${glow}:nb_colors=2:type=radial:seed=${seed}:speed=0.014`,
        "-filter_complex", [
          `[0:v]drawgrid=w=120:h=120:t=1:color=${dim}@0.5,drawgrid=w=600:h=600:t=2:color=${glow}@0.3,crop=1920:1080:x='240+200*sin(t/${8 + (seed % 3)})':y='240+140*cos(t/${10 + (seed % 4)})'[grid]`,
          `[grid][1:v]blend=all_mode=screen:all_opacity=0.5,vignette=PI/4.4,${grain}`,
        ].join(";"),
      ];
    default: // light sweep — soft highlight traversing a dark wash
      return [
        "-f", "lavfi", "-i", `gradients=s=1920x1080:rate=30:c0=${faint}:c1=${mix(DARKEST, accent, 0.2)}:nb_colors=2:seed=${seed}:speed=0.009`,
        "-f", "lavfi", "-i", `gradients=s=2400x1400:rate=30:c0=${glow}:c1=${DARKEST.replace("#", "0x")}:nb_colors=2:type=radial:seed=${seed + 9}:speed=0.006`,
        "-filter_complex", `[1:v]crop=1920:1080:x='240+220*sin(t/6)':y='160+120*sin(t/9)'[sweep];[0:v][sweep]blend=all_mode=lighten:all_opacity=0.65,vignette=PI/4.8,${grain}`,
      ];
  }
}

const force = process.argv.includes("--force");
for (const game of loadGames().filter((g) => g.enabled)) {
  const dir = resolve(REPO_ROOT, game.footageDir);
  mkdirSync(dir, { recursive: true });
  const existing = readdirSync(dir).filter((f) => f.startsWith("brand-") && f.endsWith(".mp4"));
  if (!force && existing.length >= CLIPS_PER_GAME) {
    console.log(`${game.id}: ${existing.length} brand clips present — skip (use --force)`);
    continue;
  }
  for (let i = 0; i < CLIPS_PER_GAME; i++) {
    const out = join(dir, `brand-${game.id}-${String(i + 1).padStart(2, "0")}.mp4`);
    if (!force && existsSync(out)) continue;
    await run("ffmpeg", [
      "-y", "-v", "error",
      ...recipe(i, game.accent, 200 + i * 23 + game.id.length * 7),
      "-t", String(CLIP_SECONDS),
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", "18",
      "-pix_fmt", "yuv420p",
      "-metadata", `comment=${BRAND_TAG}`,
      "-movflags", "+faststart",
      out,
    ], { cwd: REPO_ROOT });
    const info = await probe(out);
    const ok = info.width === 1920 && info.height === 1080 && Math.abs(info.fps - 30) < 0.05;
    console.log(`${ok ? "✓" : "✗"} ${game.id}/${out.split("/").pop()} (${info.durationSec.toFixed(1)}s)`);
    if (!ok) process.exitCode = 1;
  }
}
