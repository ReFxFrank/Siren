import type { CaptionCue } from "../../lib/types";

/**
 * T4 HYPE beat sheet (§8): wipe day / update countdown. Timer motif, high
 * energy inside the restrained motion grammar. 12s total (spec 8–15s).
 */
export const T4 = {
  durationSec: 12,
  hook: { start: 0, end: 1.2 },
  countdown: { start: 1.2, end: 8.5 },
  cta: { start: 8.5, end: 12 },
  /** Timer counts down from this many seconds to zero across the beat. */
  timerFromSec: 10,
  clipWindows: [
    [1.2, 4.8],
    [4.8, 8.5],
  ] as Array<[number, number]>,
} as const;

export const T4_CLIPS_NEEDED = T4.clipWindows.length;

export function t4CaptionCues(lines: string[]): CaptionCue[] {
  const windows: Array<[number, number]> = [
    [1.6, 5.0],
    [5.0, 8.3],
  ];
  return lines.slice(0, windows.length).map((text, i) => {
    const w = windows[i] as [number, number];
    return { text, startSec: w[0], endSec: w[1] };
  });
}
