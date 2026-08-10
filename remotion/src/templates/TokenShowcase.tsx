import { AbsoluteFill, useCurrentFrame } from "remotion";
import { layoutFor } from "../lib/aspect";
import type { AspectId, CaptionCue } from "../lib/types";
import { enter } from "../lib/timing";
import { AccentBeam } from "../design/AccentBeam";
import { Backdrop } from "../design/Backdrop";
import { CaptionPlate } from "../design/CaptionPlate";
import { CTAButton } from "../design/CTAButton";
import { EyebrowLabel } from "../design/EyebrowLabel";
import { FeatureCard } from "../design/FeatureCard";
import { GlassCard, GlassPanel } from "../design/GlassPanel";
import { GlowText } from "../design/GlowText";
import { SafeAreaOverlay } from "../design/SafeAreaOverlay";
import { brand, C, font } from "../design/theme";
import { Watermark } from "../design/Watermark";

const Swatch: React.FC<{ name: string; value: string; size: number }> = ({
  name,
  value,
  size,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        background: value,
        border: `1px solid ${C.surface.borderSoft}`,
      }}
    />
    <div style={{ fontFamily: font.body, fontSize: 22, color: C.text.muted }}>
      {name}
    </div>
  </div>
);

const SectionLabel: React.FC<{ text: string }> = ({ text }) => (
  <EyebrowLabel text={text} size={24} />
);

const DEMO_CUE: CaptionCue = {
  text: "Word by word caption highlight",
  startSec: 0,
  endSec: 4,
};

const GAME_ACCENTS: Array<[string, string]> = [
  ["FiveM", "#0072ff"],
  ["Garry's Mod", "#f2a33c"],
  ["Rust", "#e0623d"],
  ["Minecraft", "#5fb65c"],
];

/**
 * Phase 1 review artifact: every §5 primitive and token rendered live in
 * both aspects. Not a production template — the styling bar still applies.
 */
export const TokenShowcase: React.FC<{
  aspect: AspectId;
  debugSafeArea?: boolean;
}> = ({ aspect, debugSafeArea = false }) => {
  const frame = useCurrentFrame();
  const layout = layoutFor(aspect, brand);
  const head = enter(frame, 0.1, 400);
  const body = enter(frame, 0.4, 500);
  const s = layout.isVertical ? 1 : 0.82;

  const bases = Object.entries(C.base).map(([k, v]) => [k, v] as const);
  const accents = Object.entries(C.accent).map(([k, v]) => [k, v] as const);

  const colorSection = (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 * s }}>
      <SectionLabel text="tokens · bases + accents" />
      <div style={{ display: "flex", gap: 22 * s, flexWrap: "wrap" }}>
        {bases.map(([k, v]) => (
          <Swatch key={k} name={k} value={v} size={92 * s} />
        ))}
        {accents.map(([k, v]) => (
          <Swatch key={k} name={k} value={v} size={92 * s} />
        ))}
      </div>
    </div>
  );

  const textSection = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 * s }}>
      <SectionLabel text="text roles" />
      <div style={{ fontFamily: font.heading, fontSize: 52 * s, fontWeight: 700, color: C.text.bright }}>
        Bright heading — Space Grotesk
      </div>
      <div style={{ fontFamily: font.body, fontSize: 34 * s, color: C.text.secondary }}>
        Secondary body text — Inter
      </div>
      <div style={{ fontFamily: font.body, fontSize: 28 * s, color: C.text.muted }}>
        Muted metadata text
      </div>
      <EyebrowLabel text="eyebrow label · high tracking" size={26 * s} />
    </div>
  );

  const surfaceSection = (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 * s }}>
      <SectionLabel text="surfaces · panel / card / borders" />
      <div style={{ display: "flex", gap: 24 * s }}>
        <GlassPanel padding={26 * s} style={{ flex: 1 }}>
          <div style={{ fontFamily: font.body, fontSize: 26 * s, color: C.text.secondary }}>
            GlassPanel · panelBg + borderSoft
          </div>
        </GlassPanel>
        <GlassCard padding={26 * s} accented style={{ flex: 1 }}>
          <div style={{ fontFamily: font.body, fontSize: 26 * s, color: C.text.secondary }}>
            GlassCard · cardBg + borderAccentFaint
          </div>
        </GlassCard>
      </div>
    </div>
  );

  const componentSection = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 * s }}>
      <SectionLabel text="components" />
      <FeatureCard title="FeatureCard — NVMe hardware" fontSize={36 * s} />
      <div>
        <CaptionPlate cue={DEMO_CUE} fontSize={brand.caption.minFontPx9x16 * s} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 30 * s }}>
        <CTAButton text="CTA glow pulse" url="refx.gg" fontSize={40 * s} pulsing />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 * s }}>
          {GAME_ACCENTS.map(([name, accent]) => (
            <EyebrowLabel key={name} text={name} size={20 * s} accent={accent} />
          ))}
        </div>
      </div>
      <AccentBeam width={layout.content.width * 0.5} startSec={0.8} />
    </div>
  );

  return (
    <Backdrop>
      <AbsoluteFill
        style={{
          left: layout.content.x,
          top: layout.content.y,
          width: layout.content.width,
          height: layout.content.height,
        }}
      >
        <div style={{ opacity: head.opacity, transform: `translateY(${head.translate}px)`, marginBottom: 30 * s }}>
          <EyebrowLabel text="refx glassy · motion port" size={24 * s} />
          <GlowText size={72 * s} weight={700} style={{ marginTop: 14 * s }}>
            TokenShowcase
          </GlowText>
        </div>
        <div
          style={{
            opacity: body.opacity,
            transform: `translateY(${body.translate}px)`,
            display: layout.isVertical ? "flex" : "grid",
            flexDirection: "column",
            gridTemplateColumns: "1fr 1fr",
            gap: 34 * s,
            columnGap: 60 * s,
          }}
        >
          {layout.isVertical ? (
            <>
              {colorSection}
              {textSection}
              {surfaceSection}
              {componentSection}
            </>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 34 * s }}>
                {colorSection}
                {textSection}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 34 * s }}>
                {surfaceSection}
                {componentSection}
              </div>
            </>
          )}
        </div>
      </AbsoluteFill>
      <Watermark label="TOKEN SHOWCASE — NOT FOR PUBLISH" />
      {debugSafeArea ? <SafeAreaOverlay layout={layout} /> : null}
    </Backdrop>
  );
};
