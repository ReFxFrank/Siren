import fivem from "../../../config/games/fivem.json";
import { t1CaptionCues, T1 } from "../templates/T1Spotlight/beats";
import { tempBank } from "./temp-copy";
import type { AspectId, AssembledJob, GameConfig } from "./types";

/**
 * Studio-preview job: real fivem config, temp copy, no footage (the
 * BackgroundFootage fallback renders the dark base). Never used by
 * render.ts — the assemble stage builds real jobs.
 */
export function demoJob(aspect: AspectId): AssembledJob {
  const game = fivem as GameConfig;
  const bank = tempBank("spotlight", game);
  const body = bank.bodies[0]!;
  return {
    template: "spotlight",
    aspect,
    seed: 1,
    mode: "test",
    game,
    hook: bank.hooks[0]!,
    body,
    cta: bank.ctas[0]!,
    clips: [],
    musicFile: null,
    captions: t1CaptionCues(body.lines),
    durationSec: T1.durationSec,
    debugSafeArea: false,
  };
}
