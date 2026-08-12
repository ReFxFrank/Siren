import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadGames } from "./lib/configs";
import { REPO_ROOT } from "./lib/env";
import { PLACEHOLDER_TAG, probe } from "./lib/ffmpeg";
import { run } from "./lib/run";

/**
 * Procedural placeholder b-roll (§7.4): drifting gradients, grid sweeps and
 * particle-noise fields in the game's accent color. Obviously abstract —
 * never gameplay, never AI footage — with a burned corner watermark and a
 * SIREN_PLACEHOLDER container tag so production renders can refuse them.
 *
 * Clips mimic real capture geometry: 1920×1080 @30fps, 12s, H.264.
 */
const CLIP_SECONDS = 12;
const CLIPS_PER_GAME = 6;
const FONT = resolve(REPO_ROOT, "assets/fonts/Inter.ttf");
// ffmpeg filtergraph option values treat ':' and '\' as syntax — Windows
// absolute paths (C:\dev\...) must be normalized to C\:/dev/... form.
const FONT_FILTER = FONT.replace(/\\/g, "/").replace(/:/g, "\\:");
const WATERMARK = `drawtext=fontfile=${FONT_FILTER}:text='PLACEHOLDER - NOT FOR PUBLISH':x=w-tw-42:y=h-th-38:fontsize=34:fontcolor=white@0.5:box=1:boxcolor=black@0.35:boxborderw=14`;

function mix(hexA: string, hexB: string, t: number): string {
  const a = parseInt(hexA.slice(1), 16);
  const b = parseInt(hexB.slice(1), 16);
  const ch = (shift: number) =>
    Math.round(((a >> shift) & 0xff) * (1 - t) + ((b >> shift) & 0xff) * t);
  return `0x${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0")}`;
}

const DARK = "#0a111d";
const DARKEST = "#070b12";

/** Three abstract recipes, cycled with variations for six clips per game. */
function recipe(kind: number, accent: string, seed: number): { input: string[]; vf: string } {
  const accentMid = mix(DARK, accent, 0.62);
  const accentDim = mix(DARK, accent, 0.42);
  const accentGlow = mix(DARKEST, accent, 0.38);
  switch (kind) {
    case 0: // drifting linear gradient wash
      return {
        input: ["-f", "lavfi", "-i", `gradients=s=1920x1080:rate=30:c0=${mix(DARKEST, accent, 0.1)}:c1=${accentMid}:c2=${mix(DARKEST, accent, 0.24)}:nb_colors=3:seed=${seed}:speed=0.013`],
        vf: `vignette=PI/4.8,noise=alls=5:allf=t,${WATERMARK}`,
      };
    case 1: // tactical grid sweep
      return {
        input: ["-f", "lavfi", "-i", `color=c=${mix(DARKEST, accent, 0.09)}:s=2340x1500:rate=30`],
        vf: [
          `drawgrid=w=117:h=117:t=1:color=${accentMid}@0.5`,
          `drawgrid=w=585:h=585:t=3:color=${accentMid}@0.38`,
          `crop=1920:1080:x='210+170*sin(t/${7 + (seed % 4)})':y='210+130*cos(t/${9 + (seed % 3)})'`,
          "vignette=PI/4.2",
          WATERMARK,
        ].join(","),
      };
    default: // radial particle-noise pulse
      return {
        input: ["-f", "lavfi", "-i", `gradients=s=1920x1080:rate=30:c0=${accentGlow}:c1=${mix(DARKEST, accent, 0.06)}:nb_colors=2:type=radial:seed=${seed}:speed=0.02`],
        vf: `noise=alls=10:allf=t+u,vignette=PI/5,${WATERMARK}`,
      };
  }
}

async function generate(): Promise<void> {
  const force = process.argv.includes("--force");
  const games = loadGames().filter((g) => g.enabled);
  for (const game of games) {
    const dir = resolve(REPO_ROOT, game.footageDir);
    mkdirSync(dir, { recursive: true });
    const existing = readdirSync(dir).filter((f) => f.startsWith("ph-") && f.endsWith(".mp4"));
    if (!force && existing.length >= CLIPS_PER_GAME) {
      console.log(`${game.id}: ${existing.length} placeholder clips present — skip (use --force to regenerate)`);
      continue;
    }
    for (let i = 0; i < CLIPS_PER_GAME; i++) {
      const out = join(dir, `ph-${game.id}-${String(i + 1).padStart(2, "0")}.mp4`);
      if (!force && existsSync(out)) continue;
      const { input, vf } = recipe(i % 3, game.accent, 100 + i * 17 + game.id.length);
      await run("ffmpeg", [
        "-y", "-v", "error",
        ...input,
        "-t", String(CLIP_SECONDS),
        "-vf", vf,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "21",
        "-pix_fmt", "yuv420p",
        "-metadata", `comment=${PLACEHOLDER_TAG}`,
        "-movflags", "+faststart",
        out,
      ]);
      const info = await probe(out);
      const ok = info.width === 1920 && info.height === 1080 && Math.abs(info.fps - 30) < 0.05;
      console.log(`${ok ? "✓" : "✗"} ${out} (${info.durationSec.toFixed(1)}s)`);
      if (!ok) process.exitCode = 1;
    }
  }
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
