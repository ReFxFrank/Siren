import rust from "../../../config/games/rust.json";
import { t1CaptionCues, T1 } from "../templates/T1Spotlight/beats";
import { t2CaptionCues, T2 } from "../templates/T2Tutorial60/beats";
import { t3CaptionCues, T3 } from "../templates/T3PriceFlex/beats";
import { t4CaptionCues, T4 } from "../templates/T4Hype/beats";
import { tempBank } from "./temp-copy";
import type { AspectId, AssembledJob, CaptionCue, GameConfig, TemplateId } from "./types";

const TEMPLATE_DEMO: Record<TemplateId, { durationSec: number; cues: (lines: string[]) => CaptionCue[] }> = {
  spotlight: { durationSec: T1.durationSec, cues: t1CaptionCues },
  tutorial60: { durationSec: T2.durationSec, cues: t2CaptionCues },
  priceflex: { durationSec: T3.durationSec, cues: t3CaptionCues },
  hype: { durationSec: T4.durationSec, cues: t4CaptionCues },
};

/**
 * Studio-preview job: real rust config, temp copy, no footage (the
 * BackgroundFootage fallback renders the dark base). Never used by
 * render.ts — the assemble stage builds real jobs.
 */
export function demoJob(aspect: AspectId, template: TemplateId = "spotlight"): AssembledJob {
  const game = rust as GameConfig;
  const bank = tempBank(template, game);
  const body = bank.bodies[0]!;
  const spec = TEMPLATE_DEMO[template];
  return {
    template,
    aspect,
    seed: 1,
    mode: "test",
    game,
    hook: bank.hooks[0]!,
    body,
    cta: bank.ctas[0]!,
    clips: [],
    musicFile: null,
    captions: spec.cues(body.lines),
    durationSec: spec.durationSec,
    debugSafeArea: false,
  };
}
