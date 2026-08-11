import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { BodyEntry, CopyEntry } from "../remotion/src/lib/types";
import { loadBank, loadGames, TEMPLATES } from "./lib/configs";
import { REPO_ROOT } from "./lib/env";

/**
 * Generates the §7.2 approval surface: every bank entry grouped by bank,
 * phone-readable. ☐ = pending, ☑ = approved. Regenerate after any approval
 * flip. Written to out/review/ (brief location) and docs/reports/
 * (committed, so it renders on GitHub for remote review).
 */
const lines: string[] = [
  "# SIREN copy banks — review & approval",
  "",
  `_Generated ${new Date().toISOString().slice(0, 16).replace("T", " ")}Z · flip approvals via:_`,
  "`tsx scripts/approve-copy.ts <template>.<game> --approve h01,b02` _(or `--all`, `--all-except id,…`, `--revoke id,…`)_",
  "",
  "Production renders only use ☑ entries. Test renders may use any entry but stay watermarked.",
  "",
];

let total = 0;
let approved = 0;

for (const template of TEMPLATES) {
  for (const game of loadGames()) {
    const bank = loadBank(template, game.id);
    if (!bank) continue;
    lines.push(`## ${template} · ${game.displayName}`, "");
    const section = (title: string, entries: Array<CopyEntry | BodyEntry>) => {
      lines.push(`**${title}**`, "");
      for (const entry of entries) {
        total += 1;
        if (entry.approved) approved += 1;
        const mark = entry.approved ? "☑" : "☐";
        const text = "text" in entry ? entry.text : entry.lines.join(" ⏵ ");
        lines.push(`- ${mark} \`${entry.id}\` ${text}`);
      }
      lines.push("");
    };
    section("Hooks", bank.hooks);
    section("Bodies (lines shown ⏵-joined — they render as sequential captions)", bank.bodies);
    section("CTAs", bank.ctas);
  }
}

lines.splice(6, 0, `**Status: ${approved}/${total} entries approved.**`, "");

const content = lines.join("\n");
for (const dir of ["out/review", "docs/reports"]) {
  mkdirSync(join(REPO_ROOT, dir), { recursive: true });
  writeFileSync(join(REPO_ROOT, dir, "REVIEW-COPY.md"), content);
}
console.log(`REVIEW-COPY.md written (${approved}/${total} approved) → out/review/ + docs/reports/`);
