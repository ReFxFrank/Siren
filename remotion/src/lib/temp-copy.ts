import type { CopyBank, GameConfig, TemplateId } from "./types";

/**
 * Seed-stable temporary copy for placeholder-mode renders (Phase 2) while
 * real banks land in Phase 3. Lives in code, not config/copy/, so it can
 * never be mistaken for an approvable bank: every entry is unapproved and
 * `tmp-` prefixed, which keeps production renders refusing it (§7.2).
 */
export function tempBank(template: TemplateId, game: GameConfig): CopyBank {
  const name = game.displayName;
  return {
    template,
    game: game.id,
    hooks: [
      { id: "tmp-h01", text: `Your ${name} server, running today`, approved: false },
      { id: "tmp-h02", text: `Stop settling for laggy ${name} hosting`, approved: false },
      { id: "tmp-h03", text: "Your world deserves better hosting", approved: false },
      { id: "tmp-h04", text: "The server your friends keep asking for", approved: false },
    ],
    bodies: [
      {
        id: "tmp-b01",
        lines: [
          "Spin up your server without the setup maze",
          "NVMe hardware keeps every session smooth",
          "DDoS protection is on from day one",
          "Pick a plan and go live",
        ],
        approved: false,
      },
      {
        id: "tmp-b02",
        lines: [
          "Pick a plan, pick a map, go live",
          "Instant setup — no config rabbit holes",
          "Your community connects, you play",
        ],
        approved: false,
      },
      {
        id: "tmp-b03",
        lines: [
          "Hosting that stays out of your way",
          "Fast storage and a clean control panel",
          "Backed by DDoS protection",
        ],
        approved: false,
      },
    ],
    ctas: [
      { id: "tmp-c01", text: "Launch yours at refx.gg", approved: false },
      { id: "tmp-c02", text: "Start your server today", approved: false },
      { id: "tmp-c03", text: "Claim your server", approved: false },
    ],
  };
}
