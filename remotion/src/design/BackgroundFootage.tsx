import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import type { FootageClip } from "../lib/types";
import { C } from "./theme";

/**
 * Full-bleed footage layer with cover fit and a legibility scrim — raw text
 * never sits on busy footage (§5.2). Falls back to the dark base when a
 * scene has no clip (e.g. Studio preview before placeholders exist).
 */
export const BackgroundFootage: React.FC<{
  clip: FootageClip | null;
  gameId: string;
  /** 0..1 — how hard the scrim darkens the footage. */
  dim?: number;
  startFromSec?: number;
}> = ({ clip, gameId, dim = 0.35, startFromSec = 0 }) => (
  <AbsoluteFill style={{ background: C.base.deepest }}>
    {clip ? (
      <OffthreadVideo
        src={staticFile(`footage/${gameId}/${clip.file}`)}
        startFrom={Math.round(startFromSec * 30)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ) : null}
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, rgba(7,11,18,${0.25 + dim * 0.4}) 0%, rgba(7,11,18,${0.1 + dim * 0.3}) 40%, rgba(7,11,18,${0.45 + dim * 0.5}) 100%)`,
      }}
    />
  </AbsoluteFill>
);
