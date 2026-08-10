import { AbsoluteFill } from "remotion";
import { font } from "./theme";

/**
 * Burned corner watermark for anything that must never be published (§7.4):
 * test renders and placeholder-mode output. Production renders omit this
 * component entirely — and hard-fail their gates long before render.
 */
export const Watermark: React.FC<{ label?: string }> = ({
  label = "TEST RENDER — NOT FOR PUBLISH",
}) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        top: 24,
        left: 24,
        fontFamily: font.body,
        fontSize: 26,
        fontWeight: 700,
        letterSpacing: "0.14em",
        color: "rgba(255,214,140,0.85)",
        background: "rgba(7,11,18,0.55)",
        border: "1px solid rgba(255,214,140,0.35)",
        borderRadius: 10,
        padding: "8px 14px",
      }}
    >
      {label}
    </div>
  </AbsoluteFill>
);
