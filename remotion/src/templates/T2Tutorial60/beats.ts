import type { CaptionCue } from "../../lib/types";

/**
 * T2 TUTORIAL60 beat sheet (§8): "host a ___ server in 60 seconds."
 * Educational tone, numbered glass step cards, soft CTA on the final beat
 * only. 50s total (spec window 45–60s).
 *
 * Step TITLES are template skeleton (§7.1, authored here in code); the
 * picked body's lines fill the per-step caption slot. Step 2's footage
 * window is the designated SCREEN-CAPTURE SLOT — real control-panel
 * capture replaces placeholder b-roll there in Phase 6 (see CAPTURE-KIT).
 */
export const T2 = {
  durationSec: 50,
  hook: { start: 0, end: 2.5 },
  steps: [
    { title: "Pick your plan", start: 2.5, end: 13 },
    { title: "Setup runs itself", start: 13, end: 23.5, screenCaptureSlot: true },
    { title: "Make it yours", start: 23.5, end: 34 },
    { title: "Bring your people", start: 34, end: 44.5 },
  ],
  cta: { start: 44.5, end: 50 },
  clipWindows: [
    [2.5, 13],
    [13, 23.5],
    [23.5, 34],
    [34, 44.5],
  ] as Array<[number, number]>,
} as const;

export const T2_CLIPS_NEEDED = T2.clipWindows.length;

/**
 * T2 renders body lines inside the step cards (the caption role) — no
 * separate caption track, so no cues here.
 */
export function t2CaptionCues(_lines: string[]): CaptionCue[] {
  return [];
}
