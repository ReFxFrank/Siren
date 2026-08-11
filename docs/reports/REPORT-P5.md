# Phase 5 report — Batch matrix, QA harness, capture kit

**Date:** 2026-08-11 · **Builds on:** Phases 0–4

## Checklist

| Criterion | Result | Evidence |
|---|---|---|
| One-command full flagship matrix | ✅ PASS | `npx tsx scripts/render-matrix.ts --mode test` → 16 jobs × 2 aspects = **32 videos, all green** in a single run (~2.7h in the CPU-only container). Sequential by design, resumable via `--skip-existing` |
| Consolidated QA report | ✅ PASS | `out/review/QA-MATRIX.md` — per-video render time + §9.9 check status in one phone-readable table. `--verify-only` re-runs the checks against existing outputs without rendering |
| `docs/CAPTURE-KIT.md` exists, phone-readable | ✅ PASS | OBS settings (1080p60, NVENC CQP 18), per-game 8–12 clip shot lists, template-slot mapping, screen-capture slot instructions, post-capture runbook |
| Volume discipline (§7.5) | ✅ PASS | matrix caps production at 3/day/platform; production gate counts today's sidecars and refuses overflow |

## Remaining before production (Phase 6 — Frank at the PC)

1. Approve copy (`docs/reports/REVIEW-COPY.md`; 0/583 approved).
2. Real footage per `docs/CAPTURE-KIT.md` + music/LICENSES.md drop-in.
3. Confirm features top-4 per game (`config/games/*.json` — last TODO(frank) in configs; pricing now resolved from the ReFxHosting repo: gmod $10 / rust $20 / minecraft $10).
4. Remotion license check, then `npx tsx scripts/render-matrix.ts --mode production`.
