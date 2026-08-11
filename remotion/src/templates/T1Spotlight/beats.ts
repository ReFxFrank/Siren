import type { CaptionCue } from "../../lib/types";

/**
 * T1 SPOTLIGHT beat sheet (§8). Authored by hand — copy banks only fill
 * slots (§7.1). Times in seconds. Total 27s (spec window 20–30s).
 */
export const T1 = {
  durationSec: 27,
  hook: { start: 0, end: 1.5 },
  montage: { start: 1.5, end: 8 },
  features: { start: 8, end: 18 },
  pricing: { start: 18, end: 24 },
  cta: { start: 24, end: 27 },
  /** Footage windows: three fast montage cuts, two slower feature beds. */
  clipWindows: [
    [1.5, 4.0],
    [4.0, 6.0],
    [6.0, 8.0],
    [8.0, 13.0],
    [13.0, 18.0],
  ] as Array<[number, number]>,
  featureCardStagger: [8.4, 9.0, 9.6],
} as const;

export const T1_CLIPS_NEEDED = T1.clipWindows.length;

/** Template-timed caption windows for up to four body lines (§9.4). */
export function t1CaptionCues(lines: string[]): CaptionCue[] {
  const windows: Array<[number, number]> = [
    [2.0, 7.5],
    [8.6, 13.0],
    [13.0, 17.5],
    [18.6, 23.4],
  ];
  return lines.slice(0, windows.length).map((text, i) => {
    const w = windows[i] as [number, number];
    return { text, startSec: w[0], endSec: w[1] };
  });
}
