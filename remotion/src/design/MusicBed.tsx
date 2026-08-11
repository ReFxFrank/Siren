import { Audio, interpolate, staticFile } from "remotion";
import { sec } from "../lib/timing";

/**
 * Shared music bed (§9 audio ducking): fade in, duck under the CTA beat,
 * fade out. Renders nothing when the job has no music — silent bed (§1).
 */
export const MusicBed: React.FC<{
  musicFile: string | null;
  durationSec: number;
  duckAtSec: number;
}> = ({ musicFile, durationSec, duckAtSec }) => {
  if (!musicFile) return null;
  const total = sec(durationSec);
  return (
    <Audio
      src={staticFile(`music/${musicFile}`)}
      volume={(f) =>
        interpolate(
          f,
          [0, sec(0.6), sec(Math.max(0.7, duckAtSec - 0.4)), sec(duckAtSec + 0.4), total - sec(0.8), total],
          [0, 0.85, 0.85, 0.6, 0.6, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      }
    />
  );
};
