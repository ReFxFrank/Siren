import { useCurrentFrame } from "remotion";
import { progress, sec } from "../lib/timing";

/**
 * Thin horizontal accent line that sweeps in once — a tactical divider,
 * not decoration. Width animates 0→`width` starting at `startSec`.
 */
export const AccentBeam: React.FC<{
  width: number;
  startSec?: number;
  durMs?: number;
  height?: number;
  accent?: string;
}> = ({ width, startSec = 0, durMs = 500, height = 3, accent = "#0072ff" }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, sec(startSec), sec(durMs / 1000));
  return (
    <div
      style={{
        width: width * p,
        height,
        borderRadius: height,
        background: `linear-gradient(90deg, ${accent}, rgba(0,114,255,0))`,
        boxShadow: `0 0 18px rgba(0,114,255,${0.35 * p})`,
        opacity: 0.9,
      }}
    />
  );
};
