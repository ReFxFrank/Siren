import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { layoutFor, type AspectLayout } from "../../lib/aspect";
import { ctaDisplayUrl } from "../../lib/cta";
import { activeCue } from "../../lib/captions";
import { enter, progress, sec } from "../../lib/timing";
import type { AssembledJob, FootageClip } from "../../lib/types";
import { AccentBeam } from "../../design/AccentBeam";
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
import { T3 } from "./beats";

function resolvePricing(pricingFrom: string): { display: string; isSample: boolean } {
  if (pricingFrom.startsWith("TODO")) return { display: "€4.99", isSample: true };
  return { display: pricingFrom, isSample: false };
}

const clipAt = (clips: FootageClip[], index: number): FootageClip | null =>
  clips.length === 0 ? null : (clips[index % clips.length] as FootageClip);

const SceneHook: React.FC<{ job: AssembledJob; layout: AspectLayout }> = ({ job, layout }) => {
  const frame = useCurrentFrame();
  const a = enter(frame, 0.02, 200, 18);
  const s = layout.typeScale;
  return (
    <Backdrop accent={job.game.accent}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: `0 ${layout.safe.left + 40}px` }}>
        <div style={{ opacity: a.opacity, transform: `translateY(${a.translate}px)`, display: "flex", flexDirection: "column", gap: 26 * s, alignItems: "center" }}>
          <EyebrowLabel text={job.game.displayName} size={28 * s} accent={job.game.accent} />
          <GlowText size={(layout.isVertical ? 100 : 112) * s} weight={700} intensity={0.75} align="center">
            {job.hook.text}
          </GlowText>
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};

const ScenePrice: React.FC<{ job: AssembledJob; layout: AspectLayout }> = ({ job, layout }) => {
  const frame = useCurrentFrame();
  const a = enter(frame, 0.06, 380, 40);
  const s = layout.typeScale;
  const pricing = resolvePricing(job.game.pricingFrom);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: a.opacity, transform: `translateY(${a.translate}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 * s }}>
        <EyebrowLabel text="hosting from" size={30 * s} accent={job.game.accent} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 * s }}>
          <GlowText size={210 * s} weight={700} intensity={1}>
            {pricing.display}
          </GlowText>
          <span style={{ fontFamily: font.body, fontSize: 48 * s, fontWeight: 600, color: C.text.secondary }}>
            /month
          </span>
        </div>
        {pricing.isSample ? (
          <span style={{ fontFamily: font.body, fontSize: 24 * s, color: C.text.muted, letterSpacing: "0.08em" }}>
            sample price — pending config
          </span>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/** One feature at a time, quick rotation — the flex ticker. */
const SceneTicker: React.FC<{ job: AssembledJob; layout: AspectLayout }> = ({ job, layout }) => {
  const frame = useCurrentFrame();
  const s = layout.typeScale;
  const features = job.game.features.filter((f) => !f.startsWith("TODO")).slice(0, 3);
  const t = frame / 30 + T3.ticker.start;
  const stagger = T3.tickerStagger;
  let active = 0;
  for (let i = 0; i < stagger.length; i++) {
    if (t >= (stagger[i] as number)) active = i;
  }
  const activeStart = (stagger[active] as number) - T3.ticker.start;
  const p = progress(frame, sec(activeStart), sec(0.28));
  const feature = features[active % features.length] ?? "";
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 26 * s,
          opacity: p,
          transform: `translateX(${(1 - p) * 40}px)`,
        }}
      >
        <div
          style={{
            width: 30 * s,
            height: 30 * s,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${job.game.accent}, rgba(0,114,255,0.7))`,
            boxShadow: "0 0 18px rgba(0,114,255,0.5)",
          }}
        />
        <GlowText size={(layout.isVertical ? 78 : 88) * s} weight={700} intensity={0.6}>
          {feature}
        </GlowText>
      </div>
    </AbsoluteFill>
  );
};

const SceneCta: React.FC<{ job: AssembledJob; layout: AspectLayout }> = ({ job, layout }) => {
  const frame = useCurrentFrame();
  const a = enter(frame, 0.05, 350, 26);
  const s = layout.typeScale;
  return (
    <Backdrop accent={job.game.accent}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: a.opacity, transform: `translateY(${a.translate}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 40 * s }}>
          <EyebrowLabel text={job.game.tagline} size={26 * s} accent={job.game.accent} withTick={false} />
          <CTAButton text={job.cta.text} url={ctaDisplayUrl(job.game.ctaSlug)} fontSize={58 * s} pulsing />
          <AccentBeam width={300 * s} startSec={0.45} durMs={450} />
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};

const Captions: React.FC<{ job: AssembledJob; layout: AspectLayout }> = ({ job, layout }) => {
  const frame = useCurrentFrame();
  const cue = activeCue(job.captions, frame);
  if (!cue) return null;
  const p = progress(frame, sec(cue.startSec), sec(0.22));
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
          transform: `translateY(${(1 - p) * 16}px)`,
        }}
      >
        <CaptionPlate cue={cue} fontSize={layout.isVertical ? brand.caption.minFontPx9x16 : 48} maxWidth={layout.content.width} />
      </div>
    </AbsoluteFill>
  );
};

export const T3PriceFlex: React.FC<{ job: AssembledJob }> = ({ job }) => {
  const layout = layoutFor(job.aspect, brand);
  return (
    <AbsoluteFill style={{ background: C.base.deepest }}>
      <Sequence durationInFrames={sec(T3.hook.end)} name="hook">
        <SceneHook job={job} layout={layout} />
      </Sequence>

      {T3.clipWindows.map(([from, to], i) => (
        <Sequence key={i} from={sec(from)} durationInFrames={sec(to - from)} name={`footage-${i}`}>
          <BackgroundFootage clip={clipAt(job.clips, i)} gameId={job.game.id} dim={i === 0 ? 0.7 : 0.5} startFromSec={0.5} />
        </Sequence>
      ))}

      <Sequence from={sec(T3.price.start)} durationInFrames={sec(T3.price.end - T3.price.start)} name="price">
        <ScenePrice job={job} layout={layout} />
      </Sequence>

      <Sequence from={sec(T3.ticker.start)} durationInFrames={sec(T3.ticker.end - T3.ticker.start)} name="ticker">
        <SceneTicker job={job} layout={layout} />
      </Sequence>

      <Sequence from={sec(T3.cta.start)} durationInFrames={sec(T3.cta.end - T3.cta.start)} name="cta">
        <SceneCta job={job} layout={layout} />
      </Sequence>

      <Captions job={job} layout={layout} />
      <MusicBed musicFile={job.musicFile} durationSec={job.durationSec} duckAtSec={T3.cta.start} />
      {job.mode !== "production" ? <Watermark /> : null}
      {job.debugSafeArea ? <SafeAreaOverlay layout={layout} /> : null}
    </AbsoluteFill>
  );
};
