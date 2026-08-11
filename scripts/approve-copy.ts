import { readFileSync, writeFileSync } from "node:fs";
import { stableStringify } from "../remotion/src/lib/manifest";
import type { CopyBank } from "../remotion/src/lib/types";
import { bankPath, loadGame, validateBank } from "./lib/configs";
import { run } from "./lib/run";

/**
 * §7.2 step 3: flip approval flags from a chat instruction.
 *
 *   tsx scripts/approve-copy.ts spotlight.rust --approve h01,h02,b03
 *   tsx scripts/approve-copy.ts spotlight.rust --all
 *   tsx scripts/approve-copy.ts spotlight.rust --all-except h07,h12
 *   tsx scripts/approve-copy.ts spotlight.rust --revoke c02
 *
 * Re-lints the bank after flipping and regenerates REVIEW-COPY.md.
 */
const [target] = process.argv.slice(2);
const [template, game] = (target ?? "").split(".");
if (!template || !game) {
  console.error("usage: tsx scripts/approve-copy.ts <template>.<game> [--approve ids] [--revoke ids] [--all] [--all-except ids]");
  process.exit(2);
}

const listArg = (name: string): string[] | null => {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return null;
  return (process.argv[i + 1] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
};

const path = bankPath(template as CopyBank["template"], game);
const bank = JSON.parse(readFileSync(path, "utf8")) as CopyBank;
const entries = [...bank.hooks, ...bank.bodies, ...bank.ctas];

const approve = listArg("approve") ?? [];
const revoke = listArg("revoke") ?? [];
const allExcept = listArg("all-except");
const all = process.argv.includes("--all");

const known = new Set(entries.map((e) => e.id));
for (const id of [...approve, ...revoke, ...(allExcept ?? [])]) {
  if (!known.has(id)) {
    console.error(`unknown entry id '${id}' in ${target}`);
    process.exit(1);
  }
}

let flipped = 0;
for (const entry of entries) {
  let next = entry.approved;
  if (all) next = true;
  if (allExcept) next = !allExcept.includes(entry.id);
  if (approve.includes(entry.id)) next = true;
  if (revoke.includes(entry.id)) next = false;
  if (next !== entry.approved) {
    entry.approved = next;
    flipped += 1;
  }
}

const issues = validateBank(bank, loadGame(game)).filter((i) => i.level === "error");
if (issues.length > 0) {
  for (const issue of issues) console.error(`ERROR ${issue.where}: ${issue.msg}`);
  console.error("bank fails lint — not writing");
  process.exit(1);
}

writeFileSync(path, stableStringify(bank));
const approvedCount = entries.filter((e) => e.approved).length;
console.log(`${target}: flipped ${flipped}, now ${approvedCount}/${entries.length} approved`);
await run("npx", ["tsx", "scripts/review-copy.ts"]);
console.log("REVIEW-COPY.md regenerated");
