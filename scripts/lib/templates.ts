import { t1CaptionCues, T1, T1_CLIPS_NEEDED } from "../../remotion/src/templates/T1Spotlight/beats";
import { t2CaptionCues, T2, T2_CLIPS_NEEDED } from "../../remotion/src/templates/T2Tutorial60/beats";
import { t3CaptionCues, T3, T3_CLIPS_NEEDED } from "../../remotion/src/templates/T3PriceFlex/beats";
import { t4CaptionCues, T4, T4_CLIPS_NEEDED } from "../../remotion/src/templates/T4Hype/beats";
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
  tutorial60: {
    compPrefix: "T2Tutorial60",
    durationSec: T2.durationSec,
    clipsNeeded: T2_CLIPS_NEEDED,
    captionCues: t2CaptionCues,
  },
  priceflex: {
    compPrefix: "T3PriceFlex",
    durationSec: T3.durationSec,
    clipsNeeded: T3_CLIPS_NEEDED,
    captionCues: t3CaptionCues,
  },
  hype: {
    compPrefix: "T4Hype",
    durationSec: T4.durationSec,
    clipsNeeded: T4_CLIPS_NEEDED,
    captionCues: t4CaptionCues,
  },
};

export function templateSpec(template: TemplateId): TemplateSpec {
  const spec = SPECS[template];
  if (!spec) {
    throw new Error(`Template '${template}' has no spec registered`);
  }
  return spec;
}

export function implementedTemplates(): TemplateId[] {
  return Object.keys(SPECS) as TemplateId[];
}

export function registerTemplateSpec(template: TemplateId, spec: TemplateSpec): void {
  SPECS[template] = spec;
}
