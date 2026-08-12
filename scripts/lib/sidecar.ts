import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { ctaTrackedUrl } from "../../remotion/src/lib/cta";
import { stableStringify } from "../../remotion/src/lib/manifest";
import type { AssembledJob, Platform } from "../../remotion/src/lib/types";

export interface PlatformMeta {
  title: string;
  caption: string;
  hashtags: string[];
  ctaUrl: string;
}

export interface Sidecar {
  kind: "siren-sidecar";
  version: 1;
  video: string;
  template: string;
  game: string;
  aspect: string;
  seed: number;
  mode: string;
  watermarked: boolean;
  copy: { hookId: string; bodyId: string; ctaId: string };
  clips: string[];
  music: string | null;
  durationSec: number;
  sha256: string;
  renderedAt: string;
  platforms: Partial<Record<Platform, PlatformMeta>>;
}

export function ctaUrl(slug: string, platform: Platform, template: string): string {
  return ctaTrackedUrl(slug, platform, template);
}

/**
 * Stage 7 (§9): manual upload becomes copy-paste. Exactly one CTA, ≤4
 * hashtags, ≤2 emoji (we use zero) — §7.3 enforced structurally here.
 */
export function buildSidecar(
  job: AssembledJob,
  opts: { videoFile: string; sha256: string; platforms: Platform[]; renderedAt: string },
): Sidecar {
  const platforms: Partial<Record<Platform, PlatformMeta>> = {};
  const hashtags = (job.game.hashtags ?? []).slice(0, 4);
  for (const platform of opts.platforms) {
    const url = ctaUrl(job.game.ctaSlug, platform, job.template);
    platforms[platform] = {
      title: job.hook.text,
      caption: `${job.hook.text}\n\n${job.cta.text} → ${url}${hashtags.length ? `\n\n${hashtags.join(" ")}` : ""}`,
      hashtags,
      ctaUrl: url,
    };
  }
  return {
    kind: "siren-sidecar",
    version: 1,
    video: basename(opts.videoFile),
    template: job.template,
    game: job.game.id,
    aspect: job.aspect,
    seed: job.seed,
    mode: job.mode,
    watermarked: job.mode !== "production",
    copy: { hookId: job.hook.id, bodyId: job.body.id, ctaId: job.cta.id },
    clips: job.clips.map((c) => c.file),
    music: job.musicFile,
    durationSec: job.durationSec,
    sha256: opts.sha256,
    renderedAt: opts.renderedAt,
    platforms,
  };
}

export function serializeSidecar(sidecar: Sidecar): string {
  return stableStringify(sidecar);
}

export function sha256File(path: string): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    const hash = createHash("sha256");
    createReadStream(path)
      .on("data", (chunk) => hash.update(chunk))
      .on("end", () => resolvePromise(hash.digest("hex")))
      .on("error", reject);
  });
}
