import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { layoutFor, type AspectLayout } from "../../lib/aspect";
import { activeCue } from "../../lib/captions";
import { enter, FPS, progress, sec } from "../../lib/timing";
import type { AssembledJob, FootageClip } from "../../lib/types";
import { AccentBeam } from "../../design/AccentBeam";
import { Backdrop } from "../../design/Backdrop";
import { BackgroundFootage } from "../../design/BackgroundFootage";
import { CaptionPlate } from "../../design/CaptionPlate";
import { CTAButton } from "../../design/CTAButton";
import { EyebrowLabel } from "../../design/EyebrowLabel";
import { FeatureCard } from "../../design/FeatureCard";
import { GlassPanel } from "../../design/GlassPanel";
import { GlowText } from "../../design/GlowText";
import { SafeAreaOverlay } from "../../design/SafeAreaOverlay";
import { brand, C, font } from "../../design/theme";
import { Watermark } from "../../design/Watermark";
import { T1 } from "./beats";

/** Sample pricing for watermarked test renders while pricingFrom is TODO —
 * production refuses TODO pricing in the render gates long before here. */
function resolvePricing(pricingFrom: string): { display: string; isSample: boolean } {
  if (pricingFrom.startsWith("TODO")) return { display: "€4.99", isSample: true };
  return { display: pricingFrom, isSample: false };
}

const clipAt = (clips: FootageClip[], index: number): FootageClip | null =>
  clips.length === 0 ? null : (clips[index % clips.length] as FootageClip);

/** Continuous footage bed from the beat sheet's clip windows. */
const FootageBed: React.FC<{ job: AssembledJob; dim: number }> = ({ job, dim }) => (
  <>
    {T1.clipWindows.map(([from, to], i) => (
      <Sequence key={i} from={sec(from)} durationInFrames={sec(to - from)}>
        <BackgroundFootage
          clip={clipAt(job.clips, i)}
          gameId={job.game.id}
          dim={dim}
          startFromSec={0.5}
        />
      </Sequence>
    ))}
  </>
);

const SceneHook: React.FC<{ job: AssembledJob; layout: AspectLayout }> = ({ job, layout }) => {
  const frame = useCurrentFrame();
  const a = enter(frame, 0.02, 220, 20);
  const s = layout.typeScale;
  const size = layout.isVertical ? 104 : 118;
  return (
    <Backdrop accent={job.game.accent}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: `0 ${layout.safe.left + 40}px` }}>
        <div style={{ opacity: a.opacity, transform: `translateY(${a.translate}px)`, display: "flex", flexDirection: "column", gap: 30 * s, alignItems: "center" }}>
          <EyebrowLabel text={job.game.displayName} size={30 * s} accent={job.game.accent} />
          <GlowText size={size * s} weight={700} intensity={0.75} align="center">
            {job.hook.text}
          </GlowText>
          <AccentBeam width={360 * s} startSec={0.25} durMs={450} />
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};

const MontageOverlay: React.FC<{ job: AssembledJob; layout: AspectLayout }> = ({ job, layout }) => {
  const frame = useCurrentFrame();
  const a = enter(frame, 0.15, 350, 16);
  const s = layout.typeScale;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: layout.safe.left,
          top: layout.safe.top + 10,
          opacity: a.opacity,
          transform: `translateY(${a.translate}px)`,
        }}
      >
        <EyebrowLabel text={`${job.game.displayName} · hosting`} size={28 * s} accent={job.game.accent} />
      </div>
    </AbsoluteFill>
  );
};

const SceneFeatures: React.FC<{ job: AssembledJob; layout: AspectLayout }> = ({ job, layout }) => {
  const frame = useCurrentFrame();
  const s = layout.typeScale;
  const features = job.game.features.filter((f) => !f.startsWith("TODO")).slice(0, 3);
  const cardW = layout.isVertical ? layout.content.width : Math.min(560, layout.content.width * 0.34);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: layout.safe.left,
          ...(layout.isVertical
            ? { top: layout.safe.top + 120, width: layout.content.width }
            : { top: layout.safe.top + 60, width: cardW }),
          display: "flex",
          flexDirection: "column",
          gap: 22 * s,
        }}
      >
        {features.map((feature, i) => {
          const startSec = (T1.featureCardStagger[i] ?? 9.6) - T1.features.start;
          const p = progress(frame, sec(startSec), sec(0.5));
          return (
            <div
              key={feature}
              style={{ opacity: p, transform: `translateX(${(1 - p) * -44}px)` }}
            >
              <FeatureCard title={feature} accent={job.game.accent} fontSize={44 * s} width="100%" />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const ScenePricing: React.FC<{ job: AssembledJob; layout: AspectLayout }> = ({ job, layout }) => {
  const frame = useCurrentFrame();
  const a = enter(frame, 0.1, 550, 46);
  const s = layout.typeScale;
  const pricing = resolvePricing(job.game.pricingFrom);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: a.opacity, transform: `translateY(${a.translate}px)` }}>
        <GlassPanel accented padding={`${52 * s}px ${76 * s}px`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 * s }}>
          <EyebrowLabel text="hosting from" size={26 * s} accent={job.game.accent} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 * s }}>
            <GlowText size={150 * s} weight={700} intensity={0.85}>
              {pricing.display}
            </GlowText>
            <span style={{ fontFamily: font.body, fontSize: 40 * s, fontWeight: 500, color: C.text.secondary }}>
              /month
            </span>
          </div>
          {pricing.isSample ? (
            <span style={{ fontFamily: font.body, fontSize: 22 * s, color: C.text.muted, letterSpacing: "0.08em" }}>
              sample price — pending config
            </span>
          ) : null}
          <div style={{ fontFamily: font.body, fontSize: 34 * s, color: C.text.secondary }}>
            {job.game.tagline}
          </div>
        </GlassPanel>
      </div>
    </AbsoluteFill>
  );
};

const SceneCta: React.FC<{ job: AssembledJob; layout: AspectLayout }> = ({ job, layout }) => {
  const frame = useCurrentFrame();
  const a = enter(frame, 0.08, 420, 30);
  const s = layout.typeScale;
  return (
    <Backdrop accent={job.game.accent}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 44 * s }}>
        <div style={{ opacity: a.opacity, transform: `translateY(${a.translate}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 40 * s }}>
          <EyebrowLabel text={job.game.displayName} size={28 * s} accent={job.game.accent} />
          <GlowText size={64 * s} weight={600} intensity={0.5} align="center">
            {job.game.tagline}
          </GlowText>
          <CTAButton text={job.cta.text} url={`refx.gg/${job.game.ctaSlug}`} fontSize={60 * s} pulsing />
          <AccentBeam width={320 * s} startSec={0.5} durMs={500} />
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};

const Captions: React.FC<{ job: AssembledJob; layout: AspectLayout }> = ({ job, layout }) => {
  const frame = useCurrentFrame();
  const cue = activeCue(job.captions, frame);
  if (!cue) return null;
  const cueStartF = sec(cue.startSec);
  const p = progress(frame, cueStartF, sec(0.24));
  const fontSize = layout.isVertical ? brand.caption.minFontPx9x16 : 48;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: layout.safe.left,
          right: layout.safe.right,
          bottom: layout.safe.bottom + (layout.isVertical ? 60 : 30),
          display: "flex",
          justifyContent: "center",
          opacity: p,
          transform: `translateY(${(1 - p) * 18}px)`,
        }}
      >
        <CaptionPlate cue={cue} fontSize={fontSize} maxWidth={layout.content.width} />
      </div>
    </AbsoluteFill>
  );
};

const MusicBed: React.FC<{ job: AssembledJob }> = ({ job }) => {
  if (!job.musicFile) return null;
  const total = sec(job.durationSec);
  return (
    <Audio
      src={staticFile(`music/${job.musicFile}`)}
      volume={(f) =>
        interpolate(
          f,
          // Fade in, duck slightly under the CTA beat, fade out at the end.
          [0, sec(0.6), sec(T1.cta.start - 0.4), sec(T1.cta.start + 0.4), total - sec(0.8), total],
          [0, 0.85, 0.85, 0.6, 0.6, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      }
    />
  );
};

export const T1Spotlight: React.FC<{ job: AssembledJob }> = ({ job }) => {
  const layout = layoutFor(job.aspect, brand);
  return (
    <AbsoluteFill style={{ background: C.base.deepest }}>
      <Sequence durationInFrames={sec(T1.hook.end)} name="hook">
        <SceneHook job={job} layout={layout} />
      </Sequence>

      {/* Continuous footage bed under montage + features. */}
      <Sequence from={sec(T1.montage.start)} durationInFrames={sec(T1.features.end - T1.montage.start)} name="footage">
        <AbsoluteFill>
          <FootageBed job={job} dim={0.35} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={sec(T1.montage.start)} durationInFrames={sec(T1.montage.end - T1.montage.start)} name="montage-overlay">
        <MontageOverlay job={job} layout={layout} />
      </Sequence>

      <Sequence from={sec(T1.features.start)} durationInFrames={sec(T1.features.end - T1.features.start)} name="features">
        <SceneFeatures job={job} layout={layout} />
      </Sequence>

      {/* Pricing: footage lingers heavily dimmed beneath the panel. */}
      <Sequence from={sec(T1.pricing.start)} durationInFrames={sec(T1.pricing.end - T1.pricing.start)} name="pricing">
        <AbsoluteFill>
          <BackgroundFootage clip={clipAt(job.clips, T1.clipWindows.length - 1)} gameId={job.game.id} dim={0.8} startFromSec={5.5} />
          <ScenePricing job={job} layout={layout} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={sec(T1.cta.start)} durationInFrames={sec(T1.cta.end - T1.cta.start)} name="cta">
        <SceneCta job={job} layout={layout} />
      </Sequence>

      <Captions job={job} layout={layout} />
      <MusicBed job={job} />

      {job.mode !== "production" ? <Watermark /> : null}
      {job.debugSafeArea ? <SafeAreaOverlay layout={layout} /> : null}
    </AbsoluteFill>
  );
};
