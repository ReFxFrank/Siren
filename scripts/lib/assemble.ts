import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { stableStringify } from "../../remotion/src/lib/manifest";
import { pick, rngFor, shuffle } from "../../remotion/src/lib/rng";
import { tempBank } from "../../remotion/src/lib/temp-copy";
import type {
  AspectId,
  AssembledJob,
  BodyEntry,
  BrandConfig,
  CopyBank,
  CopyEntry,
  FootageClip,
  GameConfig,
  RenderMode,
  TemplateId,
} from "../../remotion/src/lib/types";
import { loadBank } from "./configs";
import { REPO_ROOT } from "./env";
import { probe, isPlaceholderClip } from "./ffmpeg";
import { templateSpec } from "./templates";

export interface AssembleInput {
  template: TemplateId;
  game: GameConfig;
  seed: number;
  mode: RenderMode;
  music: "auto" | "none" | string;
  brand: BrandConfig;
}

export interface Assembly {
  /** Aspect-independent job core; stamp an aspect via withAspect(). */
  base: Omit<AssembledJob, "aspect">;
  bankSource: "bank" | "temp";
  clipsPlaceholder: boolean;
}

/**
 * Stage 2 (§9): seeded picks from the copy bank + footage ordering. Pure
 * function of (configs on disk, template, game, seed, mode) — the RNG
 * streams are namespaced so copy and clip picks don't interfere. The same
 * seed therefore yields a byte-identical assembly manifest.
 */
export async function assemble(input: AssembleInput): Promise<Assembly> {
  const { template, game, seed, mode, brand } = input;
  const spec = templateSpec(template);

  const bankOnDisk = loadBank(template, game.id);
  const bankSource: "bank" | "temp" = bankOnDisk ? "bank" : "temp";
  const bank: CopyBank = bankOnDisk ?? tempBank(template, game);

  const pool = <T extends CopyEntry | BodyEntry>(entries: T[], label: string): T[] => {
    if (mode !== "production") return entries;
    const approved = entries.filter((e) => e.approved);
    if (approved.length === 0) {
      throw new Error(
        `production gate: no approved ${label} in copy/${template}.${game.id}.json (§7.2)`,
      );
    }
    return approved;
  };

  const copyRng = rngFor(seed, `${template}:${game.id}:copy`);
  const hook = pick(copyRng, pool(bank.hooks, "hooks"));
  const body = pick(copyRng, pool(bank.bodies, "bodies"));
  const cta = pick(copyRng, pool(bank.ctas, "ctas"));

  const clips = await pickClips(game, seed, template, spec.clipsNeeded);

  const musicFile = pickMusic(input);

  const base: Omit<AssembledJob, "aspect"> = {
    template,
    seed,
    mode,
    game,
    hook,
    body,
    cta,
    clips: clips.list,
    musicFile,
    captions: spec.captionCues(body.lines),
    durationSec: spec.durationSec,
  };
  return { base, bankSource, clipsPlaceholder: clips.anyPlaceholder };
}

export function withAspect(assembly: Assembly, aspect: AspectId): AssembledJob {
  return { ...assembly.base, aspect };
}

/** The §6.4 reproducibility record. Excludes volatile fields by design. */
export function assemblyManifest(assembly: Assembly, aspect: AspectId): string {
  return stableStringify({
    kind: "siren-assembly-manifest",
    version: 1,
    aspect,
    bankSource: assembly.bankSource,
    job: assembly.base,
  });
}

async function pickClips(
  game: GameConfig,
  seed: number,
  template: TemplateId,
  needed: number,
): Promise<{ list: FootageClip[]; anyPlaceholder: boolean }> {
  const dir = resolve(REPO_ROOT, game.footageDir);
  if (!existsSync(dir)) return { list: [], anyPlaceholder: false };
  const files = readdirSync(dir).filter((f) => f.endsWith(".mp4")).sort();
  if (files.length === 0) return { list: [], anyPlaceholder: false };

  const rng = rngFor(seed, `${template}:${game.id}:clips`);
  const ordered = shuffle(rng, files).slice(0, Math.max(needed, Math.min(files.length, needed)));
  const list: FootageClip[] = [];
  let anyPlaceholder = false;
  for (const file of ordered) {
    const path = join(dir, file);
    const info = await probe(path);
    const placeholder = await isPlaceholderClip(path);
    anyPlaceholder ||= placeholder;
    list.push({ file, durationSec: Number(info.durationSec.toFixed(3)), placeholder });
  }
  return { list, anyPlaceholder };
}

function pickMusic(input: AssembleInput): string | null {
  const dir = resolve(REPO_ROOT, "assets/music");
  if (input.music === "none") return null;
  if (input.music !== "auto") {
    if (!existsSync(join(dir, input.music))) {
      throw new Error(`music '${input.music}' not found in assets/music/`);
    }
    return input.music;
  }
  if (!existsSync(dir)) return null;
  const tracks = readdirSync(dir)
    .filter((f) => /\.(mp3|wav|m4a)$/i.test(f))
    .sort();
  if (tracks.length === 0) return null; // empty music folder ⇒ silent bed (§1)
  const rng = rngFor(input.seed, `${input.template}:${input.game.id}:music`);
  return pick(rng, tracks);
}
