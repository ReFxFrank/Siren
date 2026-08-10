import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { C } from "./theme";

/**
 * The dark base every scene sits on: deep navy gradient with a faint wide
 * accent bloom top-left. Restrained — no visible banding, no busy shapes.
 */
export const Backdrop: React.FC<{ children?: ReactNode; accent?: string }> = ({
  children,
  accent,
}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(168deg, ${C.base.deep} 0%, ${C.base.deepest} 58%, ${C.base.deepest} 100%)`,
    }}
  >
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 90% 60% at 18% -8%, rgba(0,114,255,0.14), transparent 60%)`,
      }}
    />
    {accent ? (
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 45% at 85% 110%, ${accent}14, transparent 65%)`,
        }}
      />
    ) : null}
    {children}
  </AbsoluteFill>
);
