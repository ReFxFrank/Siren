import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type {
  AspectId,
  BrandConfig,
  CopyBank,
  GameConfig,
  Platform,
  TemplateId,
} from "../../remotion/src/lib/types";
import { REPO_ROOT } from "./env";

export interface Issue {
  level: "error" | "warn";
  where: string;
  msg: string;
}

export interface MatrixJob {
  template: TemplateId;
  game: string;
  aspects: AspectId[];
  seed: number;
  vo: boolean;
  music: "auto" | "none" | string;
  platforms: Platform[];
}

export interface MatrixConfig {
  maxProductionPerDayPerPlatform: number;
  jobs: MatrixJob[];
}

export const TEMPLATES: TemplateId[] = ["spotlight", "tutorial60", "priceflex", "hype"];
export const ASPECTS: AspectId[] = ["9x16", "16x9"];
export const PLATFORMS: Platform[] = ["tiktok", "shorts", "reels"];

/** Template duration bounds in seconds (§8) — verify stage checks these. */
export const TEMPLATE_BOUNDS: Record<TemplateId, [number, number]> = {
  spotlight: [20, 30],
  tutorial60: [45, 60],
  priceflex: [12, 18],
  hype: [8, 15],
};

const CONFIG_DIR = resolve(REPO_ROOT, "config");

export function loadBrand(): BrandConfig {
  return readJson<BrandConfig>(join(CONFIG_DIR, "brand.json"));
}

export function loadGames(): GameConfig[] {
  const dir = join(CONFIG_DIR, "games");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => readJson<GameConfig>(join(dir, f)));
}

export function loadGame(id: string): GameConfig {
  const game = loadGames().find((g) => g.id === id);
  if (!game) throw new Error(`Unknown game '${id}' — no config/games/${id}.json`);
  return game;
}

export function bankPath(template: TemplateId, game: string): string {
  return join(CONFIG_DIR, "copy", `${template}.${game}.json`);
}

export function loadBank(template: TemplateId, game: string): CopyBank | null {
  const path = bankPath(template, game);
  if (!existsSync(path)) return null;
  return readJson<CopyBank>(path);
}

export function loadMatrix(): MatrixConfig {
  const raw = readJson<Partial<MatrixConfig>>(join(CONFIG_DIR, "render-matrix.json"));
  return {
    maxProductionPerDayPerPlatform: raw.maxProductionPerDayPerPlatform ?? 3,
    jobs: raw.jobs ?? [],
  };
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

// ---------------------------------------------------------------------------
// Validation (§9.1)
// ---------------------------------------------------------------------------

/** Core §5.1 tokens — brand.json drifting from these is an error. */
const TOKEN_INTEGRITY: Array<[path: string, expected: string]> = [
  ["colors.base.deepest", "#070b12"],
  ["colors.base.deep", "#0a111d"],
  ["colors.base.panel", "#0f1828"],
  ["colors.base.raised", "#101a2b"],
  ["colors.accent.primary", "#0072ff"],
  ["colors.accent.secondary", "#58A7D3"],
  ["colors.accent.lightText", "#7db7ff"],
  ["colors.accent.paleHighlight", "#9dccff"],
  ["caption.base", "#eef6ff"],
  ["caption.activeWord", "#7db7ff"],
  ["caption.activeGlow", "#0072ff"],
];

export function validateBrand(brand: BrandConfig): Issue[] {
  const issues: Issue[] = [];
  const err = (msg: string) => issues.push({ level: "error", where: "brand.json", msg });
  for (const [path, expected] of TOKEN_INTEGRITY) {
    const actual = path
      .split(".")
      .reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], brand);
    if (actual !== expected) {
      err(`token integrity: ${path} = ${JSON.stringify(actual)}, expected ${expected}`);
    }
  }
  if (brand.fps !== 30) err(`fps must be 30, got ${brand.fps}`);
  if (brand.caption.minFontPx9x16 < 54) {
    err(`caption.minFontPx9x16 must be ≥54 (§5.2), got ${brand.caption.minFontPx9x16}`);
  }
  for (const aspect of ASPECTS) {
    const sa = brand.safeArea[aspect];
    if (!sa || [sa.top, sa.bottom, sa.left, sa.right].some((v) => typeof v !== "number")) {
      err(`safeArea.${aspect} missing or malformed`);
    }
  }
  const sa916 = brand.safeArea["9x16"];
  if (sa916 && (sa916.bottom < 250 || sa916.right < 120 || sa916.top < 150)) {
    err(`safeArea.9x16 must keep ≥250 bottom / ≥120 right / ≥150 top (§5.2)`);
  }
  return issues;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const SLUG_RE = /^[a-z0-9-]+$/;

export function validateGame(game: GameConfig): Issue[] {
  const where = `games/${game.id}.json`;
  const issues: Issue[] = [];
  const err = (msg: string) => issues.push({ level: "error", where, msg });
  const warn = (msg: string) => issues.push({ level: "warn", where, msg });
  if (!SLUG_RE.test(game.id)) err(`id '${game.id}' must be a slug`);
  if (!game.displayName) err("displayName missing");
  if (!HEX_RE.test(game.accent)) err(`accent '${game.accent}' is not #rrggbb`);
  if (!SLUG_RE.test(game.ctaSlug)) err(`ctaSlug '${game.ctaSlug}' must be a slug`);
  if (!game.tagline) err("tagline missing");
  const realFeatures = game.features.filter((f) => !f.startsWith("TODO"));
  if (realFeatures.length < 3) err("needs ≥3 non-TODO features (T1 renders three cards)");
  if (game.pricingFrom.startsWith("TODO")) {
    warn("pricingFrom is TODO(frank) — test renders show a marked sample price; production refuses");
  }
  if ((game.hashtags ?? []).length > 4) {
    err("≤4 hashtags per platform caption (§7.3) — trim the hashtags array");
  }
  for (const tag of game.hashtags ?? []) {
    if (!tag.startsWith("#")) err(`hashtag '${tag}' must start with #`);
  }
  return issues;
}

// ---------------------------------------------------------------------------
// Copy lint (§7.3)
// ---------------------------------------------------------------------------

const BANNED_PHRASES = [
  "game-changer",
  "game changing",
  "game-changing",
  "unleash",
  "revolutionize",
  "next-level",
  "next level",
  "take it to the next level",
  "elevate",
  "seamless",
  "🔥🔥",
  "insane deal",
];

const EMOJI_RE = /\p{Extended_Pictographic}/gu;
const SUPERLATIVE_ERRORS: Array<[RegExp, string]> = [
  [/#\s?1\b|\bno\.?\s?1\b|\bnumber one\b/i, "'#1' claims are banned"],
  [/\bfastest\b[^.]*\bworld\b|\bworld'?s\s+(fastest|best)\b/i, "'fastest in the world' claims are banned"],
];
const NUMERIC_CLAIM_RE = /\d+(?:\.\d+)?\s?(?:%|ms\b|gbps\b|gbit\b|gb\b|tb\b|tps\b|players?\b|slots?\b)/gi;
const DURATION_RE = /^\d+\s?(?:seconds?|secs?|minutes?|mins?|hours?|days?)$/i;

export interface LintContext {
  template: TemplateId;
  game: GameConfig;
  kind: "hook" | "body" | "cta" | "caption";
  where: string;
}

export function lintCopyText(text: string, ctx: LintContext): Issue[] {
  const issues: Issue[] = [];
  const err = (msg: string) => issues.push({ level: "error", where: ctx.where, msg });
  const warn = (msg: string) => issues.push({ level: "warn", where: ctx.where, msg });
  const lower = text.toLowerCase();

  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) err(`banned phrase '${phrase}' in: "${text}"`);
  }

  if (ctx.kind === "hook") {
    const words = text.trim().split(/\s+/).length;
    if (words > 8) err(`hook is ${words} words (max 8): "${text}"`);
  }

  const emoji = text.match(EMOJI_RE) ?? [];
  if (emoji.length > 2) err(`${emoji.length} emoji (max 2): "${text}"`);

  // ALL-CAPS runs > 2 words (§7.3). Words like NVMe/DDoS have lowercase and
  // don't count.
  const capsWords = text.split(/\s+/).map((w) => /^[A-Z0-9]{2,}$/.test(w.replace(/[^\w]/g, "")));
  let runLength = 0;
  for (const isCaps of capsWords) {
    runLength = isCaps ? runLength + 1 : 0;
    if (runLength > 2) {
      err(`ALL-CAPS run longer than 2 words: "${text}"`);
      break;
    }
  }

  for (const [re, msg] of SUPERLATIVE_ERRORS) {
    if (re.test(text)) err(`${msg}: "${text}"`);
  }
  if (/\bbest\b/i.test(text)) warn(`unverifiable superlative 'best': "${text}"`);

  // Claims lint: number+unit claims must come from the game config (§7.3).
  const allowedClaimSources = [...ctx.game.features, ctx.game.pricingFrom]
    .join(" · ")
    .toLowerCase();
  for (const match of text.matchAll(NUMERIC_CLAIM_RE)) {
    const claim = match[0].toLowerCase().replace(/\s+/g, "");
    if (!allowedClaimSources.replace(/\s+/g, "").includes(claim)) {
      err(`numeric claim '${match[0]}' not present in games/${ctx.game.id}.json features: "${text}"`);
    }
  }
  if (/24\s?\/\s?7/.test(text) && !/24\s?\/\s?7/.test(allowedClaimSources)) {
    err(`'24/7' claim not present in games/${ctx.game.id}.json features: "${text}"`);
  }
  // Bare durations ("60 seconds") are the tutorial/hype premise, not stats.
  if (ctx.template !== "tutorial60" && ctx.template !== "hype") {
    for (const match of text.matchAll(/\b\d+\s?(?:seconds?|secs?|minutes?|mins?)\b/gi)) {
      if (DURATION_RE.test(match[0]) && !allowedClaimSources.includes(match[0].toLowerCase())) {
        warn(`duration claim '${match[0]}' outside tutorial60/hype: "${text}"`);
      }
    }
  }
  return issues;
}

export const BANK_MINIMUMS = { hooks: 15, bodies: 8, ctas: 5 };

export function validateBank(bank: CopyBank, game: GameConfig): Issue[] {
  const where = `copy/${bank.template}.${bank.game}.json`;
  const issues: Issue[] = [];
  const err = (msg: string) => issues.push({ level: "error", where, msg });

  if (!TEMPLATES.includes(bank.template)) err(`unknown template '${bank.template}'`);
  if (bank.game !== game.id) err(`bank game '${bank.game}' ≠ '${game.id}'`);
  if (bank.hooks.length < BANK_MINIMUMS.hooks) {
    err(`${bank.hooks.length} hooks, need ≥${BANK_MINIMUMS.hooks}`);
  }
  if (bank.bodies.length < BANK_MINIMUMS.bodies) {
    err(`${bank.bodies.length} bodies, need ≥${BANK_MINIMUMS.bodies}`);
  }
  if (bank.ctas.length < BANK_MINIMUMS.ctas) {
    err(`${bank.ctas.length} ctas, need ≥${BANK_MINIMUMS.ctas}`);
  }
  const ids = new Set<string>();
  for (const list of [bank.hooks, bank.bodies, bank.ctas] as const) {
    for (const entry of list) {
      if (ids.has(entry.id)) err(`duplicate entry id '${entry.id}'`);
      ids.add(entry.id);
      if (typeof entry.approved !== "boolean") err(`entry '${entry.id}' missing approved flag`);
    }
  }
  for (const hook of bank.hooks) {
    issues.push(...lintCopyText(hook.text, { template: bank.template, game, kind: "hook", where: `${where}#${hook.id}` }));
  }
  for (const body of bank.bodies) {
    for (const line of body.lines) {
      issues.push(...lintCopyText(line, { template: bank.template, game, kind: "body", where: `${where}#${body.id}` }));
      if (line.length > 64) {
        issues.push({ level: "warn", where: `${where}#${body.id}`, msg: `body line >64 chars may wrap awkwardly: "${line}"` });
      }
    }
    if (body.lines.length < 3 || body.lines.length > 4) {
      issues.push({ level: "warn", where: `${where}#${body.id}`, msg: `bodies drive captions best with 3–4 lines, got ${body.lines.length}` });
    }
  }
  for (const cta of bank.ctas) {
    issues.push(...lintCopyText(cta.text, { template: bank.template, game, kind: "cta", where: `${where}#${cta.id}` }));
  }
  return issues;
}

export function validateMatrix(matrix: MatrixConfig, games: GameConfig[]): Issue[] {
  const where = "render-matrix.json";
  const issues: Issue[] = [];
  const err = (msg: string) => issues.push({ level: "error", where, msg });
  if (matrix.maxProductionPerDayPerPlatform > 3) {
    err(`maxProductionPerDayPerPlatform ${matrix.maxProductionPerDayPerPlatform} exceeds the §7.5 default cap of 3`);
  }
  matrix.jobs.forEach((job, i) => {
    const ref = `jobs[${i}]`;
    if (!TEMPLATES.includes(job.template)) err(`${ref}: unknown template '${job.template}'`);
    if (!games.some((g) => g.id === job.game)) err(`${ref}: unknown game '${job.game}'`);
    if (!job.aspects?.length || job.aspects.some((a) => !ASPECTS.includes(a))) {
      err(`${ref}: aspects must be non-empty subset of ${ASPECTS.join(", ")}`);
    }
    if (!Number.isInteger(job.seed)) err(`${ref}: seed must be an integer`);
    if (!job.platforms?.length || job.platforms.some((p) => !PLATFORMS.includes(p))) {
      err(`${ref}: platforms must be non-empty subset of ${PLATFORMS.join(", ")}`);
    }
  });
  return issues;
}

export interface ValidationReport {
  errors: Issue[];
  warnings: Issue[];
}

export function validateAll(): ValidationReport {
  const issues: Issue[] = [];
  const brand = loadBrand();
  issues.push(...validateBrand(brand));
  const games = loadGames();
  for (const game of games) issues.push(...validateGame(game));
  for (const game of games) {
    for (const template of TEMPLATES) {
      const bank = loadBank(template, game.id);
      if (bank) issues.push(...validateBank(bank, game));
    }
  }
  issues.push(...validateMatrix(loadMatrix(), games));
  return {
    errors: issues.filter((i) => i.level === "error"),
    warnings: issues.filter((i) => i.level === "warn"),
  };
}
