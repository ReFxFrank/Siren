import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { layoutFor, type AspectLayout } from "../../lib/aspect";
import { enter, progress, sec } from "../../lib/timing";
import type { AssembledJob, FootageClip } from "../../lib/types";
import { AccentBeam } from "../../design/AccentBeam";
import { Backdrop } from "../../design/Backdrop";
import { BackgroundFootage } from "../../design/BackgroundFootage";
import { CTAButton } from "../../design/CTAButton";
import { EyebrowLabel } from "../../design/EyebrowLabel";
import { GlassPanel } from "../../design/GlassPanel";
import { GlowText } from "../../design/GlowText";
import { MusicBed } from "../../design/MusicBed";
import { SafeAreaOverlay } from "../../design/SafeAreaOverlay";
import { brand, C, font } from "../../design/theme";
import { Watermark } from "../../design/Watermark";
import { T2 } from "./beats";

const clipAt = (clips: FootageClip[], index: number): FootageClip | null =>
  clips.length === 0 ? null : (clips[index % clips.length] as FootageClip);

const SceneHook: React.FC<{ job: AssembledJob; layout: AspectLayout }> = ({ job, layout }) => {
  const frame = useCurrentFrame();
  const a = enter(frame, 0.05, 260, 22);
  const s = layout.typeScale;
  return (
    <Backdrop accent={job.game.accent}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: `0 ${layout.safe.left + 40}px` }}>
        <div style={{ opacity: a.opacity, transform: `translateY(${a.translate}px)`, display: "flex", flexDirection: "column", gap: 30 * s, alignItems: "center" }}>
          <EyebrowLabel text={`${job.game.displayName} · tutorial`} size={28 * s} accent={job.game.accent} />
          <GlowText size={(layout.isVertical ? 96 : 110) * s} weight={700} intensity={0.7} align="center">
            {job.hook.text}
          </GlowText>
          <AccentBeam width={360 * s} startSec={0.4} durMs={450} />
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};

/** Segmented step progress — top of frame, inside safe area. */
const StepProgress: React.FC<{ layout: AspectLayout; activeStep: number; accent: string }> = ({ layout, activeStep, accent }) => (
  <div
    style={{
      position: "absolute",
      top: layout.safe.top + 14,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      gap: 12,
    }}
  >
    {T2.steps.map((_, i) => (
      <div
        key={i}
        style={{
          width: 64 * layout.typeScale,
          height: 5,
          borderRadius: 3,
          background: i <= activeStep ? accent : "rgba(255,255,255,0.14)",
          boxShadow: i === activeStep ? `0 0 12px ${accent}88` : "none",
        }}
      />
    ))}
  </div>
);

const StepCard: React.FC<{
  job: AssembledJob;
  layout: AspectLayout;
  index: number;
  title: string;
  caption: string | undefined;
}> = ({ job, layout, index, title, caption }) => {
  const frame = useCurrentFrame();
  const a = enter(frame, 0.15, 500, 40);
  const s = layout.typeScale;
  const captionPx = Math.max(brand.caption.minFontPx9x16 * (layout.isVertical ? 1 : 0.85), 46);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: layout.safe.left,
          right: layout.isVertical ? layout.safe.right : undefined,
          bottom: layout.safe.bottom + (layout.isVertical ? 90 : 40),
          width: layout.isVertical ? undefined : Math.min(760, layout.content.width * 0.48),
          opacity: a.opacity,
          transform: `translateY(${a.translate}px)`,
        }}
      >
        <GlassPanel accented padding={`${34 * s}px ${40 * s}px`} style={{ display: "flex", gap: 30 * s, alignItems: "flex-start" }}>
          <div
            style={{
              fontFamily: font.heading,
              fontSize: 76 * s,
              fontWeight: 700,
              lineHeight: 1,
              color: C.accent.lightText,
              textShadow: `0 0 22px rgba(0,114,255,0.45)`,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 * s, minWidth: 0 }}>
            <div style={{ fontFamily: font.heading, fontSize: 54 * s, fontWeight: 700, color: C.text.bright, letterSpacing: "-0.01em" }}>
              {title}
            </div>
            {caption ? (
              <div style={{ fontFamily: font.body, fontSize: captionPx * s, fontWeight: 600, lineHeight: 1.3, color: brand.caption.base }}>
                {caption}
              </div>
            ) : null}
          </div>
        </GlassPanel>
      </div>
    </AbsoluteFill>
  );
};

const SceneCta: React.FC<{ job: AssembledJob; layout: AspectLayout }> = ({ job, layout }) => {
  const frame = useCurrentFrame();
  const a = enter(frame, 0.1, 450, 26);
  const s = layout.typeScale;
  return (
    <Backdrop accent={job.game.accent}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: a.opacity, transform: `translateY(${a.translate}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 38 * s }}>
          <EyebrowLabel text="that's the whole setup" size={26 * s} accent={job.game.accent} />
          {/* Soft CTA: no glow pulse on the educational template (§8 T2). */}
          <CTAButton text={job.cta.text} url={`refx.gg/${job.game.ctaSlug}`} fontSize={56 * s} pulsing={false} />
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};

export const T2Tutorial60: React.FC<{ job: AssembledJob }> = ({ job }) => {
  const layout = layoutFor(job.aspect, brand);
  return (
    <AbsoluteFill style={{ background: C.base.deepest }}>
      <Sequence durationInFrames={sec(T2.hook.end)} name="hook">
        <SceneHook job={job} layout={layout} />
      </Sequence>

      {T2.steps.map((step, i) => (
        <Sequence key={step.title} from={sec(step.start)} durationInFrames={sec(step.end - step.start)} name={`step-${i + 1}`}>
          <AbsoluteFill>
            <BackgroundFootage clip={clipAt(job.clips, i)} gameId={job.game.id} dim={0.45} startFromSec={0.5} />
            <StepProgress layout={layout} activeStep={i} accent={job.game.accent} />
            <StepCard job={job} layout={layout} index={i} title={step.title} caption={job.body.lines[i]} />
          </AbsoluteFill>
        </Sequence>
      ))}

      <Sequence from={sec(T2.cta.start)} durationInFrames={sec(T2.cta.end - T2.cta.start)} name="cta">
        <SceneCta job={job} layout={layout} />
      </Sequence>

      <MusicBed musicFile={job.musicFile} durationSec={job.durationSec} duckAtSec={T2.cta.start} />
      {job.mode !== "production" ? <Watermark /> : null}
      {job.debugSafeArea ? <SafeAreaOverlay layout={layout} /> : null}
    </AbsoluteFill>
  );
};
