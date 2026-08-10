export type AspectId = "9x16" | "16x9";
export type TemplateId = "spotlight" | "tutorial60" | "priceflex" | "hype";
export type Platform = "tiktok" | "shorts" | "reels";
export type RenderMode = "test" | "production";

export interface GameConfig {
  id: string;
  displayName: string;
  accent: string;
  tagline: string;
  ctaSlug: string;
  pricingFrom: string;
  features: string[];
  hashtags?: string[];
  footageDir: string;
  enabled: boolean;
}

export interface CopyEntry {
  id: string;
  text: string;
  approved: boolean;
}

export interface BodyEntry {
  id: string;
  lines: string[];
  approved: boolean;
}

export interface CopyBank {
  template: TemplateId;
  game: string;
  hooks: CopyEntry[];
  bodies: BodyEntry[];
  ctas: CopyEntry[];
}

export interface BrandColors {
  base: { deepest: string; deep: string; panel: string; raised: string };
  accent: {
    primary: string;
    secondary: string;
    lightText: string;
    paleHighlight: string;
  };
  text: {
    bright: string;
    brightAlt: string;
    secondary: string;
    muted: string;
    label: string;
  };
  surface: {
    panelBg: string;
    cardBg: string;
    borderFaint: string;
    borderSoft: string;
    borderAccentFaint: string;
    borderAccent: string;
  };
  glow: { soft: string; wide: string };
  shadow: string;
}

export interface BrandConfig {
  colors: BrandColors;
  fonts: {
    heading: { family: string; file: string };
    body: { family: string; file: string };
  };
  caption: {
    minFontPx9x16: number;
    base: string;
    activeWord: string;
    activeGlow: string;
  };
  safeArea: Record<AspectId, SafeAreaInsets>;
  motion: { microMs: [number, number]; panelMs: [number, number] };
  fps: number;
}

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface FootageClip {
  /** File name relative to the game's footage dir, e.g. "clip-03.mp4". */
  file: string;
  durationSec: number;
  placeholder: boolean;
}

/** One caption cue, template-timed. */
export interface CaptionCue {
  text: string;
  startSec: number;
  endSec: number;
}

/**
 * Everything a composition needs to render one video. Produced by the
 * assemble stage; fully JSON-serializable and recorded in the assembly
 * manifest so any output is reproducible from (template, game, seed).
 */
export interface AssembledJob {
  template: TemplateId;
  aspect: AspectId;
  seed: number;
  mode: RenderMode;
  game: GameConfig;
  hook: CopyEntry;
  body: BodyEntry;
  cta: CopyEntry;
  /** Tutorial60 steps / hype beats reuse body lines; templates read what they need. */
  clips: FootageClip[];
  musicFile: string | null;
  captions: CaptionCue[];
  durationSec: number;
  debugSafeArea?: boolean;
}
