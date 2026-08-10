import type { CSSProperties } from "react";
import { C, font } from "./theme";

/** Uppercase, small, high-tracking, muted blue — game name / section tags. */
export const EyebrowLabel: React.FC<{
  text: string;
  size?: number;
  accent?: string;
  withTick?: boolean;
  style?: CSSProperties;
}> = ({ text, size = 30, accent, withTick = true, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: size * 0.55,
      fontFamily: font.body,
      fontSize: size,
      fontWeight: 600,
      letterSpacing: "0.34em",
      textTransform: "uppercase",
      color: C.text.label,
      ...style,
    }}
  >
    {withTick ? (
      <span
        style={{
          width: size * 1.15,
          height: 3,
          borderRadius: 2,
          background: accent ?? C.accent.primary,
          opacity: 0.85,
        }}
      />
    ) : null}
    <span>{text}</span>
  </div>
);
