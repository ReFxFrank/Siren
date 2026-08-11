# Phase 3 report — Copy banks

**Date:** 2026-08-11 · **Builds on:** Phases 0–2 (green)

## Checklist

| Criterion | Result | Evidence |
|---|---|---|
| Banks drafted per §6.2 for flagship four — all four templates | ✅ PASS | 16 banks in `config/copy/<template>.<game>.json` (spotlight/tutorial60/priceflex/hype × fivem/gmod/rust/minecraft), 583 entries total |
| Bank minimums (≥15 hooks, ≥8 bodies, ≥5 CTAs) | ✅ PASS | every bank ships 16–20 hooks, 9–12 bodies, 6–8 CTAs — headroom above minimums |
| Lint-clean (§7.3) | ✅ PASS | `tsx scripts/validate-configs.ts` → 0 errors (the only warnings are the four known `pricingFrom` TODOs). Linter verified live: a canary entry with banned phrases / 12-word hook / ALL-CAPS run / invented `99.9%` stat produced 6 errors |
| Every entry `approved: false` | ✅ PASS | 0/583 approved — production renders refuse all of it until Frank approves |
| `REVIEW-COPY.md` generated, phone-readable | ✅ PASS | `out/review/REVIEW-COPY.md` + committed copy at `docs/reports/REVIEW-COPY.md` |

## How the banks were made (per §7.2 — in-session, zero API cost at render time)

Drafted in-session via a two-stage agent workflow: one copywriter pass per bank grounded in `config/games/<id>.json` + BRIEF §7/§8, then an adversarial anti-slop critic pass per bank (word counts, numeric claims, near-duplicate kills, cringe removal). The repo linter is the authoritative backstop and passes clean. Copy claims are restricted to the three confirmed features (Instant setup / NVMe hardware / DDoS protection); priceflex banks deliberately contain **no numbers** since `pricingFrom` is unresolved.

## HUMAN-GATE (remote-friendly) — waiting on Frank

Approve from your phone by chat instruction, e.g.:
- "approve all spotlight.fivem hooks except h07, h12"
- "approve everything in tutorial60.rust"

The agent runs `tsx scripts/approve-copy.ts <template>.<game> --all-except h07,h12` (etc.), which re-lints and regenerates REVIEW-COPY.md. Flip round-trip tested in-session.
