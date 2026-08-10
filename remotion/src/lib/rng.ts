/**
 * Deterministic PRNG. Same seed ⇒ same sequence on every platform, which is
 * what makes an assembly manifest byte-identical across runs (§6.4).
 */
export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable 32-bit hash so per-purpose streams don't collide (copy vs. clips). */
export function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rngFor(seed: number, purpose: string): Rng {
  return mulberry32((seed ^ hashString(purpose)) >>> 0);
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error("pick() from empty list");
  }
  const item = items[Math.floor(rng() * items.length)];
  return item as T;
}

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = out[i] as T;
    out[i] = out[j] as T;
    out[j] = a;
  }
  return out;
}
