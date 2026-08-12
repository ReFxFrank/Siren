import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { loadGames } from "./lib/configs";
import { REPO_ROOT } from "./lib/env";
import { probe } from "./lib/ffmpeg";
import { run } from "./lib/run";

/**
 * Records real refx.gg storefront pages (our own property — no licensing
 * questions) as smooth-scroll b-roll: each game's /games/<slug> page plus the
 * shared games catalog. This is genuine product footage — the §7.4 "real
 * capture" for a pipeline that uses no gameplay (2026-08-12 decision).
 *
 *   npx tsx scripts/capture-site.ts [--force]
 *
 * Output: assets/footage/<game>/site-<slug>-NN.mp4 (1080p30, ~16s each).
 */
const SCROLL_SECONDS = 16;
const SETTLE_MS = 2500;

const force = process.argv.includes("--force");
const tmpDir = resolve(REPO_ROOT, "out", "site-capture-tmp");

const games = loadGames().filter((g) => g.enabled);
// In the cloud container Playwright's own browser build isn't downloaded;
// use the environment-provided Chromium. Locally (Frank's machine) the env
// var is unset and Playwright resolves its own browser as usual.
const executablePath = process.env.SIREN_CHROMIUM ?? (process.platform === "linux" ? "/opt/pw-browsers/chromium" : undefined);
// Managed environments route HTTPS via a proxy Chromium won't pick up from
// env vars — pass it explicitly. Direct connection everywhere else.
const proxyServer = process.env.HTTPS_PROXY ?? process.env.https_proxy;
const browser = await chromium.launch({
  executablePath,
  proxy: proxyServer ? { server: proxyServer } : undefined,
  args: ["--no-sandbox", "--disable-gpu"],
});

try {
  for (const game of games) {
    const outDir = resolve(REPO_ROOT, game.footageDir);
    mkdirSync(outDir, { recursive: true });
    const existing = readdirSync(outDir).filter((f) => f.startsWith("site-") && f.endsWith(".mp4"));
    if (!force && existing.length > 0) {
      console.log(`${game.id}: ${existing.length} site captures present — skip (use --force)`);
      continue;
    }
    const pages: Array<[label: string, url: string]> = [
      [`site-${game.ctaSlug}-01`, `https://refx.gg/games/${game.ctaSlug}`],
      [`site-${game.ctaSlug}-02`, "https://refx.gg/games"],
    ];
    for (const [label, url] of pages) {
      rmSync(tmpDir, { recursive: true, force: true });
      mkdirSync(tmpDir, { recursive: true });
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        recordVideo: { dir: tmpDir, size: { width: 1920, height: 1080 } },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      } catch {
        await page.waitForTimeout(3000); // slow assets — record what we have
      }
      await page.waitForTimeout(SETTLE_MS);
      // Slow, even scroll: ~70px/s reads as an intentional camera move.
      const steps = SCROLL_SECONDS * 25;
      for (let i = 0; i < steps; i++) {
        await page.evaluate(() => window.scrollBy({ top: 3, behavior: "instant" as ScrollBehavior }));
        await page.waitForTimeout(1000 / 25);
      }
      await context.close(); // flushes the webm

      const webm = readdirSync(tmpDir).find((f) => f.endsWith(".webm"));
      if (!webm) {
        console.error(`✗ ${label}: no video recorded`);
        process.exitCode = 1;
        continue;
      }
      const out = join(outDir, `${label}.mp4`);
      await run("ffmpeg", [
        "-y", "-v", "error",
        "-i", join(tmpDir, webm),
        "-ss", (SETTLE_MS / 1000 / 2).toFixed(1),
        "-vf", "fps=30,scale=1920:1080",
        "-an",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        out,
      ]);
      const info = await probe(out);
      console.log(`✓ ${game.id}/${label}.mp4 (${info.durationSec.toFixed(1)}s)`);
    }
  }
} finally {
  await browser.close();
  rmSync(tmpDir, { recursive: true, force: true });
}
console.log("site capture done");
