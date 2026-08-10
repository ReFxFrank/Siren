import { AbsoluteFill, useCurrentFrame } from "remotion";
import { layoutFor } from "../lib/aspect";
import type { AspectId } from "../lib/types";
import { enter } from "../lib/timing";
import { AccentBeam } from "../design/AccentBeam";
import { Backdrop } from "../design/Backdrop";
import { EyebrowLabel } from "../design/EyebrowLabel";
import { GlassPanel } from "../design/GlassPanel";
import { GlowText } from "../design/GlowText";
import { brand, C, font } from "../design/theme";
import { Watermark } from "../design/Watermark";

/**
 * Phase 0 toolchain proof: one branded slate, both aspects, no external
 * assets beyond fonts. If this renders headless to a playable MP4, the
 * engine, browser, fonts and public-dir wiring all work.
 */
export const P0Sample: React.FC<{ aspect: AspectId }> = ({ aspect }) => {
  const frame = useCurrentFrame();
  const layout = layoutFor(aspect, brand);
  const title = enter(frame, 0.15, 500);
  const sub = enter(frame, 0.55, 400);
  const scale = layout.isVertical ? 1 : 0.9;
  return (
    <Backdrop>
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", gap: 34 * scale }}
      >
        <div style={{ opacity: title.opacity, transform: `translateY(${title.translate}px)` }}>
          <GlassPanel padding={`${44 * scale}px ${72 * scale}px`} accented>
            <div style={{ display: "flex", flexDirection: "column", gap: 26 * scale }}>
              <EyebrowLabel text="refx.gg render pipeline" size={26 * scale} />
              <GlowText size={148 * scale} weight={700} intensity={0.9}>
                SIREN
              </GlowText>
              <AccentBeam width={420 * scale} startSec={0.45} />
            </div>
          </GlassPanel>
        </div>
        <div
          style={{
            opacity: sub.opacity,
            transform: `translateY(${sub.translate}px)`,
            fontFamily: font.body,
            fontSize: 40 * scale,
            fontWeight: 500,
            color: C.text.secondary,
          }}
        >
          toolchain online — {aspect} @ {layout.width}×{layout.height}
        </div>
      </AbsoluteFill>
      <Watermark label="PHASE 0 SAMPLE — NOT FOR PUBLISH" />
    </Backdrop>
  );
};
