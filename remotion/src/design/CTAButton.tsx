import { useCurrentFrame } from "remotion";
import { pulse } from "../lib/timing";
import { C, font, glow } from "./theme";

/**
 * The CTA treatment. Glow pulse is reserved for this component and only on
 * the CTA beat (§5.2) — `pulsing` stays false anywhere else.
 */
export const CTAButton: React.FC<{
  text: string;
  url: string;
  fontSize?: number;
  pulsing?: boolean;
}> = ({ text, url, fontSize = 58, pulsing = false }) => {
  const frame = useCurrentFrame();
  const p = pulsing ? pulse(frame) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: fontSize * 0.5 }}>
      <div
        style={{
          background: `linear-gradient(180deg, rgba(0,114,255,${0.92 + p * 0.08}), rgba(0,86,204,0.94))`,
          border: `1px solid rgba(157,204,255,${0.35 + p * 0.2})`,
          borderRadius: 18,
          padding: `${fontSize * 0.48}px ${fontSize * 1.1}px`,
          boxShadow: `${glow(0.8 + p * 0.7)}, 0 18px 44px rgba(2,6,16,0.55)`,
          fontFamily: font.heading,
          fontSize,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: C.text.brightAlt,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
      <div
        style={{
          fontFamily: font.body,
          fontSize: fontSize * 0.62,
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: C.accent.paleHighlight,
          textShadow: `0 0 18px rgba(0,114,255,${0.3 + p * 0.25})`,
        }}
      >
        {url}
      </div>
    </div>
  );
};
