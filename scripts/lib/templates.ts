import { t1CaptionCues, T1, T1_CLIPS_NEEDED } from "../../remotion/src/templates/T1Spotlight/beats";
import type { CaptionCue, TemplateId } from "../../remotion/src/lib/types";

/** Node-side template registry: composition ids + assembly hooks. */
export interface TemplateSpec {
  compPrefix: string;
  durationSec: number;
  clipsNeeded: number;
  captionCues: (bodyLines: string[]) => CaptionCue[];
}

const SPECS: Partial<Record<TemplateId, TemplateSpec>> = {
  spotlight: {
    compPrefix: "T1Spotlight",
    durationSec: T1.durationSec,
    clipsNeeded: T1_CLIPS_NEEDED,
    captionCues: t1CaptionCues,
  },
};

export function templateSpec(template: TemplateId): TemplateSpec {
  const spec = SPECS[template];
  if (!spec) {
    throw new Error(`Template '${template}' is not implemented yet (Phase 4 adds tutorial60/priceflex/hype)`);
  }
  return spec;
}

export function implementedTemplates(): TemplateId[] {
  return Object.keys(SPECS) as TemplateId[];
}

export function registerTemplateSpec(template: TemplateId, spec: TemplateSpec): void {
  SPECS[template] = spec;
}
