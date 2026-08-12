import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { layoutFor, type AspectLayout } from "../../lib/aspect";
import { ctaDisplayUrl } from "../../lib/cta";
import { activeCue } from "../../lib/captions";
import { enter, FPS, progress, sec } from "../../lib/timing";
import type { AssembledJob, FootageClip } from "../../lib/types";
import { Backdrop } from "../../design/Backdrop";
import { BackgroundFootage } from "../../design/BackgroundFootage";
import { CaptionPlate } from "../../design/CaptionPlate";
import { CTAButton } from "../../design/CTAButton";
import { EyebrowLabel } from "../../design/EyebrowLabel";
import { GlowText } from "../../design/GlowText";
import { MusicBed } from "../../design/MusicBed";
import { SafeAreaOverlay } from "../../design/SafeAreaOverlay";
import { brand, C, font } from "../../design/theme";
import { Watermark } from "../../design/Watermark";
import { T4 } from "./beats";

const clipAt = (clips: FootageClip[], index: number): FootageClip | null =>
  clips.length === 0 ? null : (clips[index % clips.length] as FootageClip);

const SceneHook: React.FC<{ job: AssembledJob; layout: AspectLayout }> = ({ job, layout }) => {
  const frame = useCurrentFrame();
  const a = enter(frame, 0.02, 180, 16);
  const s = layout.typeScale;
  return (
    <Backdrop accent={job.game.accent}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: `0 ${layout.safe.left + 40}px` }}>
        <div style={{ opacity: a.opacity, transform: `translateY(${a.translate}px)`, display: "flex", flexDirection: "column", gap: 24 * s, alignItems: "center" }}>
          <EyebrowLabel text={job.game.displayName} size={28 * s} accent={job.game.accent} />
          <GlowText size={(layout.isVertical ? 104 : 116) * s} weight={700} intensity={0.8} align="center">
            {job.hook.text}
          </GlowText>
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};

/**
 * Countdown timer motif: MM:SS.d counting down, subtle scale tick each
 * second — energy without strobing (§5.2).
 */
const SceneCountdown: React.FC<{ job: AssembledJob; layout: AspectLayout }> = ({ job, layout }) => {
  const frame = useCurrentFrame();
  const s = layout.typeScale;
  const a = enter(frame, 0.1, 300, 24);
  const beatLen = T4.countdown.end - T4.countdown.start;
  const remaining = Math.max(0, T4.timerFromSec * (1 - frame / FPS / beatLen));
  const minutes = Math.floor(remaining / 60);
  const seconds = Math.floor(remaining % 60);
  const tenths = Math.floor((remaining % 1) * 10);
  const sinceTick = (frame / FPS) % 1;
  const tick = 1 + 0.02 * Math.max(0, 1 - sinceTick * 6);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: a.opacity, transform: `translateY(${a.translate}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 * s }}>
        <EyebrowLabel text="wipe day" size={32 * s} accent={job.game.accent} />
        <div
          style={{
            fontFamily: font.heading,
            fontVariantNumeric: "tabular-nums",
            fontSize: 200 * s,
            fontWeight: 700,
            lineHeight: 1,
            color: C.text.brightAlt,
            textShadow: `0 0 26px rgba(0,114,255,0.5), 0 0 80px rgba(0,114,255,0.22)`,
            transform: `scale(${tick})`,
            letterSpacing: "0.02em",
          }}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          <span style={{ fontSize: 110 * s, color: C.accent.lightText }}>.{tenths}</span>
        </div>
        <div style={{ fontFamily: font.body, fontSize: 34 * s, fontWeight: 600, color: C.text.secondary, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          fresh map incoming
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SceneCta: React.FC<{ job: AssembledJob; layout: AspectLayout }> = ({ job, layout }) => {
  const frame = useCurrentFrame();
  const a = enter(frame, 0.04, 300, 22);
  const s = layout.typeScale;
  return (
    <Backdrop accent={job.game.accent}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: a.opacity, transform: `translateY(${a.translate}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 38 * s }}>
          <EyebrowLabel text="be there at zero" size={26 * s} accent={job.game.accent} />
          <CTAButton text={job.cta.text} url={ctaDisplayUrl(job.game.ctaSlug)} fontSize={58 * s} pulsing />
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};

const Captions: React.FC<{ job: AssembledJob; layout: AspectLayout }> = ({ job, layout }) => {
  const frame = useCurrentFrame();
  const cue = activeCue(job.captions, frame);
  if (!cue) return null;
  const p = progress(frame, sec(cue.startSec), sec(0.2));
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
          transform: `translateY(${(1 - p) * 14}px)`,
        }}
      >
        <CaptionPlate cue={cue} fontSize={layout.isVertical ? brand.caption.minFontPx9x16 : 48} maxWidth={layout.content.width} />
      </div>
    </AbsoluteFill>
  );
};

export const T4Hype: React.FC<{ job: AssembledJob }> = ({ job }) => {
  const layout = layoutFor(job.aspect, brand);
  return (
    <AbsoluteFill style={{ background: C.base.deepest }}>
      <Sequence durationInFrames={sec(T4.hook.end)} name="hook">
        <SceneHook job={job} layout={layout} />
      </Sequence>

      {T4.clipWindows.map(([from, to], i) => (
        <Sequence key={i} from={sec(from)} durationInFrames={sec(to - from)} name={`footage-${i}`}>
          <BackgroundFootage clip={clipAt(job.clips, i)} gameId={job.game.id} dim={0.55} startFromSec={0.5} />
        </Sequence>
      ))}

      <Sequence from={sec(T4.countdown.start)} durationInFrames={sec(T4.countdown.end - T4.countdown.start)} name="countdown">
        <SceneCountdown job={job} layout={layout} />
      </Sequence>

      <Sequence from={sec(T4.cta.start)} durationInFrames={sec(T4.cta.end - T4.cta.start)} name="cta">
        <SceneCta job={job} layout={layout} />
      </Sequence>

      <Captions job={job} layout={layout} />
      <MusicBed musicFile={job.musicFile} durationSec={job.durationSec} duckAtSec={T4.cta.start} />
      {job.mode !== "production" ? <Watermark /> : null}
      {job.debugSafeArea ? <SafeAreaOverlay layout={layout} /> : null}
    </AbsoluteFill>
  );
};
