import type { CaptionCue } from "./types";
import { FPS } from "./timing";

export interface WordTiming {
  word: string;
  startF: number;
  endF: number;
}

/**
 * Template-timed word spread: words of a cue share its window weighted by
 * word length, so long words hold the highlight a touch longer. No VO, no
 * alignment dependency (§1) — WhisperX timings would replace this only when
 * --vo is exercised.
 */
export function wordTimings(cue: CaptionCue): WordTiming[] {
  const words = cue.text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const startF = Math.round(cue.startSec * FPS);
  const endF = Math.round(cue.endSec * FPS);
  const weights = words.map((w) => Math.max(2, w.length));
  const total = weights.reduce((a, b) => a + b, 0);
  const out: WordTiming[] = [];
  let cursor = startF;
  words.forEach((word, i) => {
    const span = Math.round(((endF - startF) * (weights[i] as number)) / total);
    const wordEnd = i === words.length - 1 ? endF : cursor + span;
    out.push({ word, startF: cursor, endF: wordEnd });
    cursor = wordEnd;
  });
  return out;
}

export function activeCue(
  captions: CaptionCue[],
  frame: number,
): CaptionCue | null {
  const t = frame / FPS;
  return captions.find((c) => t >= c.startSec && t < c.endSec) ?? null;
}
