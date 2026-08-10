import { C, font } from "./theme";
import { GlassCard } from "./GlassPanel";

/** Feature bullet card: accent tick + title, tactical and compact. */
export const FeatureCard: React.FC<{
  title: string;
  accent?: string;
  fontSize?: number;
  width?: number | string;
}> = ({ title, accent = C.accent.primary, fontSize = 46, width = "100%" }) => (
  <GlassCard
    padding={`${fontSize * 0.62}px ${fontSize * 0.8}px`}
    style={{ width, display: "flex", alignItems: "center", gap: fontSize * 0.6 }}
  >
    <div
      style={{
        width: fontSize * 0.5,
        height: fontSize * 0.5,
        borderRadius: 6,
        flexShrink: 0,
        background: `linear-gradient(135deg, ${accent}, rgba(0,114,255,0.65))`,
        boxShadow: `0 0 14px rgba(0,114,255,0.4)`,
      }}
    />
    <div
      style={{
        fontFamily: font.body,
        fontSize,
        fontWeight: 600,
        color: C.text.bright,
        letterSpacing: "-0.01em",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {title}
    </div>
  </GlassCard>
);
