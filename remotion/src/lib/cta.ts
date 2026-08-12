/**
 * Single source of truth for CTA link shapes. Game pages on refx.gg live at
 * /games/<slug> (verified against the ReFxHosting app router) — ctaSlug in
 * games/<id>.json must be the site's product slug (e.g. "garrys-mod").
 */
export const CTA_BASE = "https://refx.gg/games";

/** Burned-in on-screen URL — must be a real, visitable address. */
export function ctaDisplayUrl(slug: string): string {
  return `refx.gg/games/${slug}`;
}

/** Sidecar link with UTM attribution (§6.1). */
export function ctaTrackedUrl(slug: string, platform: string, template: string): string {
  return `${CTA_BASE}/${slug}?utm_source=${platform}&utm_medium=video&utm_campaign=siren-${template}`;
}
