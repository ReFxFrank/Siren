import { interpolate } from "remotion";

export const FPS = 30;

export const sec = (s: number): number => Math.round(s * FPS);

/** Ease-out expo — the house easing for panel slides and micro-moves (§5.2). */
export const easeOutExpo = (t: number): number =>
  t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);

/** 0→1 progress through [startF, startF+durF], eased, clamped. */
export function progress(
  frame: number,
  startF: number,
  durF: number,
  easing: (t: number) => number = easeOutExpo,
): number {
  if (durF <= 0) return frame >= startF ? 1 : 0;
  const t = interpolate(frame, [startF, startF + durF], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return easing(t);
}

/** Standard entrance: fade + slide from `fromPx` offset. */
export function enter(
  frame: number,
  startSec: number,
  durMs: number,
  fromPx = 28,
): { opacity: number; translate: number } {
  const p = progress(frame, sec(startSec), sec(durMs / 1000));
  return { opacity: p, translate: (1 - p) * fromPx };
}

/** Slow constant drift for footage/backgrounds — subtle, never bouncy. */
export function drift(frame: number, pxPerSec: number): number {
  return (frame / FPS) * pxPerSec;
}

/** Soft periodic pulse in [0,1], reserved for the CTA beat (§5.2). */
export function pulse(frame: number, periodSec = 1.6): number {
  const t = (frame / FPS) % periodSec;
  return 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / periodSec);
}
