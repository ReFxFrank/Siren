import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { RenderMode } from "../remotion/src/lib/types";
import { loadMatrix, validateAll } from "./lib/configs";
import { REPO_ROOT } from "./lib/env";
import { runJob, type JobRequest, type JobResult } from "./lib/pipeline";

/**
 * Phase 5 batch runner (§10): the whole matrix in one command, sequential
 * (renders are CPU-bound), resumable, with a consolidated QA report.
 *
 *   tsx scripts/render-matrix.ts [--mode test|production] [--skip-existing]
 *     [--only spotlight.fivem,hype.*] [--out-root out]
 */
const arg = (name: string, fallback?: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = process.argv[i + 1];
  return !v || v.startsWith("--") ? fallback : v;
};
const flag = (name: string): boolean => process.argv.includes(`--${name}`);

const mode = (arg("mode", "test") as RenderMode) ?? "test";
const skipExisting = flag("skip-existing");
const only = arg("only");
const outRoot = arg("out-root", "out") as string;

const { errors, warnings } = validateAll();
for (const w of warnings) console.log(`WARN  ${w.where}: ${w.msg}`);
if (errors.length > 0) {
  for (const e of errors) console.error(`ERROR ${e.where}: ${e.msg}`);
  console.error(`validation failed with ${errors.length} error(s) — refusing to render (§9.1)`);
  process.exit(1);
}

const matrix = loadMatrix();
const onlyFilters = only
  ? only.split(",").map((f) => {
      const [t, g] = f.split(".");
      return { template: t, game: g === "*" || !g ? null : g };
    })
  : null;

const jobs = matrix.jobs.filter((job) => {
  if (job.vo) console.warn(`jobs[${job.template}.${job.game}]: vo requested — VO stage not installed, rendering without (§3)`);
  if (!onlyFilters) return true;
  return onlyFilters.some((f) => f.template === job.template && (f.game === null || f.game === job.game));
});

console.log(`matrix: ${jobs.length} job(s) × aspects, mode=${mode}\n`);

const date = new Date().toISOString().slice(0, 10);
const results: JobResult[] = [];
let failed = 0;

for (const job of jobs) {
  const aspects = job.aspects.filter((aspect) => {
    if (!skipExisting) return true;
    const path = join(resolve(REPO_ROOT, outRoot), date, job.game, `${job.template}.${job.game}.${aspect}.s${job.seed}.${mode}.mp4`);
    if (existsSync(path)) {
      console.log(`skip existing ${job.template}.${job.game}.${aspect}.s${job.seed}.${mode}`);
      return false;
    }
    return true;
  });
  if (aspects.length === 0) continue;
  const request: JobRequest = {
    template: job.template,
    game: job.game,
    aspects,
    seed: job.seed,
    mode,
    music: job.music,
    platforms: job.platforms,
    outRoot,
  };
  try {
    const result = await runJob(request, (msg) => console.log(msg));
    results.push(result);
    if (!result.pass) failed += 1;
  } catch (err) {
    failed += 1;
    console.error(`✗ ${job.template}.${job.game}: ${(err as Error).message}`);
    results.push({ request, videos: [], pass: false });
  }
}

// Consolidated QA report (§10 P5) — phone-readable markdown.
const lines: string[] = [
  "# SIREN matrix QA report",
  "",
  `_${new Date().toISOString().slice(0, 16).replace("T", " ")}Z · mode=${mode} · ${results.length} job(s)_`,
  "",
  "| job | aspect | render | checks | result |",
  "|---|---|---|---|---|",
];
for (const result of results) {
  const name = `${result.request.template}.${result.request.game}`;
  if (result.videos.length === 0) {
    lines.push(`| ${name} | — | — | — | ✗ refused/errored |`);
    continue;
  }
  for (const video of result.videos) {
    const checkSummary = video.checks.map((c) => (c.pass ? "" : `✗${c.name} `)).join("").trim() || "all green";
    lines.push(`| ${name} | ${video.aspect} | ${video.renderSeconds.toFixed(0)}s | ${checkSummary} | ${video.pass ? "✓" : "✗"} |`);
  }
}
const passCount = results.filter((r) => r.pass).length;
lines.push("", `**${passCount}/${results.length} jobs green.** Contact sheets: \`out/review/sheets/\`.`, "");

const reportDir = resolve(REPO_ROOT, outRoot, "review");
mkdirSync(reportDir, { recursive: true });
writeFileSync(join(reportDir, "QA-MATRIX.md"), lines.join("\n"));
console.log(`\nQA report → ${join(reportDir, "QA-MATRIX.md")}`);
console.log(failed === 0 ? "✓ matrix green" : `✗ ${failed} job(s) failed`);
process.exit(failed === 0 ? 0 : 1);
