import { AbsoluteFill } from "remotion";
import type { AspectLayout } from "../lib/aspect";
import { font } from "./theme";

/**
 * Debug overlay (§5.2): shades the platform-UI chrome zones and outlines the
 * content box. Never in production output — render.ts only enables it when
 * --debug-safe-area is passed on a test render.
 */
export const SafeAreaOverlay: React.FC<{ layout: AspectLayout }> = ({
  layout,
}) => {
  const { safe, width, height, content } = layout;
  const zone = { position: "absolute" as const, background: "rgba(255,64,64,0.14)" };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ ...zone, top: 0, left: 0, width, height: safe.top }} />
      <div style={{ ...zone, bottom: 0, left: 0, width, height: safe.bottom }} />
      <div style={{ ...zone, top: safe.top, left: 0, width: safe.left, height: height - safe.top - safe.bottom }} />
      <div style={{ ...zone, top: safe.top, right: 0, width: safe.right, height: height - safe.top - safe.bottom }} />
      <div
        style={{
          position: "absolute",
          left: content.x,
          top: content.y,
          width: content.width,
          height: content.height,
          border: "2px dashed rgba(125,183,255,0.7)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: content.x + 12,
          top: content.y + 8,
          fontFamily: font.body,
          fontSize: 26,
          color: "rgba(125,183,255,0.9)",
        }}
      >
        safe {content.width}×{content.height}
      </div>
    </AbsoluteFill>
  );
};
