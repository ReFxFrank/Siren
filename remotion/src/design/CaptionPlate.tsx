import { useCurrentFrame } from "remotion";
import { wordTimings } from "../lib/captions";
import type { CaptionCue } from "../lib/types";
import { brand, C, font } from "./theme";

/**
 * Burned-in caption on a subtle glass plate (§5.2): word-by-word highlight,
 * base #eef6ff, active word #7db7ff with a soft #0072ff glow. Most viewers
 * are muted — this is the primary information channel.
 */
export const CaptionPlate: React.FC<{
  cue: CaptionCue;
  fontSize?: number;
  maxWidth?: number;
}> = ({ cue, fontSize = brand.caption.minFontPx9x16, maxWidth = 880 }) => {
  const frame = useCurrentFrame();
  const words = wordTimings(cue);
  return (
    <div
      style={{
        display: "inline-block",
        background:
          "linear-gradient(180deg, rgba(10,18,32,0.78), rgba(7,13,24,0.82))",
        border: `1px solid ${C.surface.borderFaint}`,
        borderRadius: 20,
        padding: `${fontSize * 0.42}px ${fontSize * 0.7}px`,
        maxWidth,
        boxShadow: "0 12px 40px rgba(2,6,16,0.5)",
      }}
    >
      <span
        style={{
          fontFamily: font.body,
          fontSize,
          fontWeight: 600,
          lineHeight: 1.28,
          color: brand.caption.base,
        }}
      >
        {words.map((w, i) => {
          const active = frame >= w.startF && frame < w.endF;
          return (
            <span
              key={i}
              style={{
                color: active ? brand.caption.activeWord : brand.caption.base,
                textShadow: active
                  ? `0 0 16px ${brand.caption.activeGlow}99, 0 0 40px ${brand.caption.activeGlow}45`
                  : "none",
              }}
            >
              {w.word}
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </span>
    </div>
  );
};
