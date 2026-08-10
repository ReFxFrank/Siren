import type { AspectId, BrandConfig, SafeAreaInsets } from "./types";

export const DIMS: Record<AspectId, { width: number; height: number }> = {
  "9x16": { width: 1080, height: 1920 },
  "16x9": { width: 1920, height: 1080 },
};

export interface AspectLayout {
  aspect: AspectId;
  width: number;
  height: number;
  isVertical: boolean;
  safe: SafeAreaInsets;
  /** Content box after safe-area insets. */
  content: { x: number; y: number; width: number; height: number };
  /** Base type scale multiplier — 16:9 frames read at a larger viewing size. */
  typeScale: number;
}

export function layoutFor(aspect: AspectId, brand: BrandConfig): AspectLayout {
  const { width, height } = DIMS[aspect];
  const safe = brand.safeArea[aspect];
  return {
    aspect,
    width,
    height,
    isVertical: aspect === "9x16",
    safe,
    content: {
      x: safe.left,
      y: safe.top,
      width: width - safe.left - safe.right,
      height: height - safe.top - safe.bottom,
    },
    typeScale: aspect === "9x16" ? 1 : 0.92,
  };
}
