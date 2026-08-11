import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { webpackOverride } from "../../remotion/webpack-override";
import { DIMS } from "../../remotion/src/lib/aspect";
import type { AspectId, AssembledJob, BrandConfig, Platform, RenderMode, TemplateId } from "../../remotion/src/lib/types";
import { assemble, assemblyManifest, withAspect, type Assembly } from "./assemble";
import { loadBrand, loadGame, TEMPLATE_BOUNDS } from "./configs";
import { browserExecutable, ENTRY_POINT, glRenderer, PUBLIC_DIR, renderConcurrency, REPO_ROOT } from "./env";
import { contactSheet, hasFaststart, measureLoudness, postProcess, probe } from "./ffmpeg";
import { buildSidecar, serializeSidecar, sha256File, type Sidecar } from "./sidecar";
import { templateSpec } from "./templates";

export interface JobRequest {
  template: TemplateId;
  game: string;
  aspects: AspectId[];
  seed: number;
  mode: RenderMode;
  music: "auto" | "none" | string;
  platforms: Platform[];
  debugSafeArea?: boolean;
  outRoot?: string;
}

export interface CheckResult {
  name: string;
  pass: boolean;
  detail: string;
}

export interface VideoResult {
  aspect: AspectId;
  videoPath: string;
  sidecarPath: string;
  manifestPath: string;
  sheetPath: string;
  renderSeconds: number;
  checks: CheckResult[];
  pass: boolean;
}

export interface JobResult {
  request: JobRequest;
  videos: VideoResult[];
  pass: boolean;
}

const DATE = new Date().toISOString().slice(0, 10);

let cachedBundle: Promise<string> | null = null;

/** Bundle once per process — every job shares it. */
export function getBundle(): Promise<string> {
  cachedBundle ??= bundle({
    entryPoint: ENTRY_POINT,
    publicDir: PUBLIC_DIR,
    webpackOverride,
    onProgress: () => undefined,
  });
  return cachedBundle;
}

/**
 * Production gates (§7.2, §7.4, §7.5). Hard failures — a production render
 * that violates the anti-slop guardrails must refuse to run.
 */
export function productionGates(
  assembly: Assembly,
  request: JobRequest,
  outRoot: string,
): string[] {
  const problems: string[] = [];
  const { base } = assembly;
  if (assembly.bankSource === "temp") {
    problems.push(`no copy bank for ${base.template}.${base.game.id} — temp copy is never publishable`);
  }
  for (const [label, entry] of [["hook", base.hook], ["body", base.body], ["cta", base.cta]] as const) {
    if (!entry.approved) problems.push(`${label} '${entry.id}' is not approved (§7.2)`);
  }
  if (assembly.clipsPlaceholder) {
    problems.push("footage contains placeholder-watermarked clips (§7.4)");
  }
  if (base.clips.length === 0) {
    problems.push("no footage clips — production renders need real capture");
  }
  if (base.game.pricingFrom.startsWith("TODO")) {
    problems.push("pricingFrom is TODO(frank) — resolve §12 before production");
  }
  if (request.debugSafeArea) {
    problems.push("debug safe-area overlay must be off in production");
  }
  const counts = productionCountsToday(outRoot);
  for (const platform of request.platforms) {
    if ((counts[platform] ?? 0) + 1 > 3) {
      problems.push(`volume cap: already ${counts[platform]} production renders for ${platform} today (max 3/day, §7.5)`);
    }
  }
  return problems;
}

function productionCountsToday(outRoot: string): Partial<Record<Platform, number>> {
  const dayDir = join(outRoot, DATE);
  const counts: Partial<Record<Platform, number>> = {};
  if (!existsSync(dayDir)) return counts;
  for (const game of readdirSync(dayDir)) {
    const gameDir = join(dayDir, game);
    for (const file of existsSync(gameDir) ? readdirSync(gameDir) : []) {
      if (!file.endsWith(".sidecar.json")) continue;
      try {
        const sidecar = JSON.parse(readFileSync(join(gameDir, file), "utf8")) as Sidecar;
        if (sidecar.mode !== "production") continue;
        for (const platform of Object.keys(sidecar.platforms) as Platform[]) {
          counts[platform] = (counts[platform] ?? 0) + 1;
        }
      } catch {
        // unreadable sidecar — ignore for counting
      }
    }
  }
  return counts;
}

export async function runJob(request: JobRequest, log: (msg: string) => void): Promise<JobResult> {
  const brand: BrandConfig = loadBrand();
  const game = loadGame(request.game);
  if (!game.enabled) throw new Error(`game '${game.id}' is disabled in config`);
  const outRoot = resolve(REPO_ROOT, request.outRoot ?? "out");

  const assembly = await assemble({
    template: request.template,
    game,
    seed: request.seed,
    mode: request.mode,
    music: request.music,
    brand,
  });

  if (request.mode === "production") {
    const problems = productionGates(assembly, request, outRoot);
    if (problems.length > 0) {
      throw new Error(`PRODUCTION REFUSED:\n  - ${problems.join("\n  - ")}`);
    }
  }

  const spec = templateSpec(request.template);
  const outDir = join(outRoot, DATE, game.id);
  const sheetDir = join(outRoot, "review", "sheets");
  mkdirSync(outDir, { recursive: true });
  mkdirSync(sheetDir, { recursive: true });

  const serveUrl = await getBundle();
  const videos: VideoResult[] = [];

  for (const aspect of request.aspects) {
    const job: AssembledJob = { ...withAspect(assembly, aspect), debugSafeArea: request.debugSafeArea ?? false };
    const baseName = `${request.template}.${game.id}.${aspect}.s${request.seed}.${request.mode}`;
    const videoPath = join(outDir, `${baseName}.mp4`);
    const manifestPath = join(outDir, `${baseName}.manifest.json`);
    const sidecarPath = join(outDir, `${baseName}.sidecar.json`);
    const sheetPath = join(sheetDir, `${baseName}.png`);
    const tmpPath = join(outDir, `${baseName}.tmp.mp4`);

    writeFileSync(manifestPath, assemblyManifest(assembly, aspect));

    // Modest off-thread video cache: the default sizes itself to ~half of
    // system RAM, which OOMs constrained containers mid-batch.
    const videoCacheBytes = 512 * 1024 * 1024;

    const composition = await selectComposition({
      serveUrl,
      id: `${spec.compPrefix}-${aspect}`,
      inputProps: { job },
      browserExecutable: browserExecutable() ?? undefined,
      chromiumOptions: { gl: glRenderer() ?? undefined },
      timeoutInMilliseconds: 120000,
      offthreadVideoCacheSizeInBytes: videoCacheBytes,
    });

    log(`render ${baseName} (${DIMS[aspect].width}×${DIMS[aspect].height}, ${composition.durationInFrames}f)`);
    const started = Date.now();
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      crf: 18,
      imageFormat: "jpeg",
      jpegQuality: 90,
      x264Preset: "medium",
      enforceAudioTrack: true,
      outputLocation: tmpPath,
      inputProps: { job },
      browserExecutable: browserExecutable() ?? undefined,
      chromiumOptions: { gl: glRenderer() ?? undefined },
      concurrency: renderConcurrency(),
      timeoutInMilliseconds: 120000,
      offthreadVideoCacheSizeInBytes: videoCacheBytes,
      logLevel: "error",
    });
    const renderSeconds = (Date.now() - started) / 1000;

    await postProcess(tmpPath, videoPath, { normalizeAudio: job.musicFile !== null });
    unlinkSync(tmpPath);

    const sha256 = await sha256File(videoPath);
    const sidecar = buildSidecar(job, {
      videoFile: videoPath,
      sha256,
      platforms: request.platforms,
      renderedAt: new Date().toISOString(),
    });
    writeFileSync(sidecarPath, serializeSidecar(sidecar));

    await contactSheet(videoPath, sheetPath, {
      durationSec: job.durationSec,
      tileWidth: aspect === "9x16" ? 300 : 480,
    });

    const checks = await verifyVideo(videoPath, request.template, aspect, job.musicFile !== null);
    const pass = checks.every((c) => c.pass);
    log(`  ${pass ? "✓" : "✗"} ${baseName} rendered in ${renderSeconds.toFixed(0)}s${pass ? "" : ` — FAILED: ${checks.filter((c) => !c.pass).map((c) => c.name).join(", ")}`}`);
    videos.push({ aspect, videoPath, sidecarPath, manifestPath, sheetPath, renderSeconds, checks, pass });
  }

  return { request, videos, pass: videos.every((v) => v.pass) };
}

/** Stage 9 (§9): ffprobe verification. */
export async function verifyVideo(
  videoPath: string,
  template: TemplateId,
  aspect: AspectId,
  hasMusic: boolean,
): Promise<CheckResult[]> {
  const checks: CheckResult[] = [];
  const push = (name: string, pass: boolean, detail: string) => checks.push({ name, pass, detail });
  const info = await probe(videoPath);
  const dims = DIMS[aspect];
  push("resolution", info.width === dims.width && info.height === dims.height, `${info.width}×${info.height}`);
  push("fps", Math.abs(info.fps - 30) < 0.05, `${info.fps.toFixed(3)}`);
  const [min, max] = TEMPLATE_BOUNDS[template];
  push("duration", info.durationSec >= min - 0.25 && info.durationSec <= max + 0.25, `${info.durationSec.toFixed(2)}s (bounds ${min}–${max}s)`);
  push("codec", info.videoCodec === "h264", info.videoCodec);
  push("audio-track", info.hasAudio, info.hasAudio ? "present" : "missing");
  push("faststart", hasFaststart(videoPath), "moov before mdat");
  if (hasMusic) {
    const lufs = await measureLoudness(videoPath);
    push(
      "loudness",
      lufs !== null && lufs > -16 && lufs < -12,
      lufs === null ? "unmeasurable" : `${lufs.toFixed(1)} LUFS (target −14)`,
    );
  }
  return checks;
}
