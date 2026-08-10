import type { CSSProperties, ReactNode } from "react";
import { C } from "./theme";

/**
 * The core ReFx surface: dark glass, faint border, deep soft shadow.
 * `accented` swaps the border to the blue accent range for active states.
 */
export const GlassPanel: React.FC<{
  children?: ReactNode;
  accented?: boolean;
  radius?: number;
  padding?: number | string;
  style?: CSSProperties;
}> = ({ children, accented = false, radius = 28, padding = 36, style }) => (
  <div
    style={{
      background: C.surface.panelBg,
      border: `1px solid ${accented ? C.surface.borderAccent : C.surface.borderSoft}`,
      borderRadius: radius,
      boxShadow: C.shadow,
      padding,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Lighter inset card — feature cards, step cards. */
export const GlassCard: React.FC<{
  children?: ReactNode;
  accented?: boolean;
  radius?: number;
  padding?: number | string;
  style?: CSSProperties;
}> = ({ children, accented = false, radius = 22, padding = 28, style }) => (
  <div
    style={{
      background: C.surface.cardBg,
      border: `1px solid ${accented ? C.surface.borderAccentFaint : C.surface.borderFaint}`,
      borderRadius: radius,
      boxShadow: "0 14px 36px rgba(2,6,16,0.45)",
      padding,
      ...style,
    }}
  >
    {children}
  </div>
);
