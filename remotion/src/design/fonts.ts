import interData from "../../../assets/fonts/Inter.ttf";
import spaceGroteskData from "../../../assets/fonts/SpaceGrotesk.ttf";
import { brand } from "./theme";

/**
 * Brand font activation, engineered for reliability in headless renders.
 *
 * Fonts are vendored under assets/fonts (OFL-licensed variable TTFs) and
 * inlined into the bundle as data URIs by the webpack override — zero
 * network at render time (§2.1).
 *
 * Deliberately NO delayRender() here. The brief's @remotion/google-fonts
 * (and @remotion/fonts, and any delayRender-gated loader) awaits font
 * promises that intermittently never settle on Remotion's metadata pages
 * in headless-shell containers — the stale handle then kills the render at
 * the timeout. Data-URI faces need no network and parse within the page's
 * first task turns, long before the first frame screenshot; glyph
 * correctness is verified visually in the exported review frames of every
 * phase. Deviation from the brief logged in the phase report.
 */
const FAMILIES: Array<[family: string, dataUri: string]> = [
  [brand.fonts.heading.family, spaceGroteskData],
  [brand.fonts.body.family, interData],
];

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = FAMILIES.map(
    ([family, dataUri]) =>
      `@font-face { font-family: '${family}'; src: url('${dataUri}') format('truetype'); font-weight: 100 900; font-style: normal; }`,
  ).join("\n");
  document.head.appendChild(style);

  // Kick Blink into resolving the faces now: real DOM usage + forced
  // reflow + an explicit (non-awaited) fonts.load() per family.
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;left:-9999px;top:-9999px;visibility:hidden;";
  for (const [family] of FAMILIES) {
    const span = document.createElement("span");
    span.style.fontFamily = `'${family}'`;
    span.textContent = "x";
    probe.appendChild(span);
  }
  (document.body ?? document.documentElement).appendChild(probe);
  void probe.offsetHeight;
  for (const [family] of FAMILIES) {
    document.fonts.load(`700 100px '${family}'`).catch(() => undefined);
  }
}
