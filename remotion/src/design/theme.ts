import brandJson from "../../../config/brand.json";
import type { BrandConfig } from "../lib/types";

/**
 * Single source of design truth: config/brand.json (§5.1). Components read
 * tokens from here — hex values never appear inline in components.
 */
export const brand = brandJson as BrandConfig;

export const C = brand.colors;

export const font = {
  heading: `'${brand.fonts.heading.family}', sans-serif`,
  body: `'${brand.fonts.body.family}', sans-serif`,
};

/** Soft, wide, low-opacity blue glow (§5.1) — for active/CTA states only. */
export function glow(intensity = 1): string {
  const a = (v: number) => Math.min(1, v * intensity);
  return [
    `0 0 ${18 * intensity}px rgba(0,114,255,${a(0.35)})`,
    `0 0 ${60 * intensity}px rgba(0,114,255,${a(0.16)})`,
  ].join(", ");
}

export function textGlow(intensity = 1): string {
  return [
    `0 0 ${14 * intensity}px rgba(0,114,255,${Math.min(1, 0.45 * intensity)})`,
    `0 0 ${44 * intensity}px rgba(0,114,255,${Math.min(1, 0.2 * intensity)})`,
  ].join(", ");
}
