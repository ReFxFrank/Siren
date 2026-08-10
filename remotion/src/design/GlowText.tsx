import type { CSSProperties, ReactNode } from "react";
import { C, font, textGlow } from "./theme";

/**
 * Bright display text with the soft blue glow. Glow reinforces emphasis —
 * default intensity is restrained; only CTA beats push it higher.
 */
export const GlowText: React.FC<{
  children: ReactNode;
  size: number;
  weight?: number;
  intensity?: number;
  color?: string;
  align?: "left" | "center";
  style?: CSSProperties;
}> = ({
  children,
  size,
  weight = 600,
  intensity = 0.6,
  color = C.text.bright,
  align = "left",
  style,
}) => (
  <div
    style={{
      fontFamily: font.heading,
      fontSize: size,
      fontWeight: weight,
      color,
      textShadow: textGlow(intensity),
      letterSpacing: "-0.015em",
      lineHeight: 1.08,
      textAlign: align,
      textWrap: "balance",
      ...style,
    }}
  >
    {children}
  </div>
);
