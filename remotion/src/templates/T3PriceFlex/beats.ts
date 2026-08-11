import type { CaptionCue } from "../../lib/types";

/**
 * T3 PRICEFLEX beat sheet (§8): pricing/feature flex, fastest cut of the
 * four. 15s total (spec window 12–18s).
 */
export const T3 = {
  durationSec: 15,
  hook: { start: 0, end: 1.2 },
  price: { start: 1.2, end: 4.6 },
  ticker: { start: 4.6, end: 11 },
  cta: { start: 11, end: 15 },
  /** Ticker shows one feature at a time — three quick rotations. */
  tickerStagger: [4.6, 6.8, 9.0],
  clipWindows: [
    [1.2, 4.6],
    [4.6, 8],
    [8, 11],
  ] as Array<[number, number]>,
} as const;

export const T3_CLIPS_NEEDED = T3.clipWindows.length;

/** Two caption cues — the fast cut only has room for two lines. */
export function t3CaptionCues(lines: string[]): CaptionCue[] {
  const windows: Array<[number, number]> = [
    [1.6, 4.4],
    [4.8, 10.6],
  ];
  return lines.slice(0, windows.length).map((text, i) => {
    const w = windows[i] as [number, number];
    return { text, startSec: w[0], endSec: w[1] };
  });
}
