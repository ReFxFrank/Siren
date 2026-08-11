# Phase 2 report — T1 SPOTLIGHT end-to-end (placeholder mode)

**Date:** 2026-08-10/11 · **Builds on:** Phases 0–1 (green)

## Checklist

| Criterion | Result | Evidence |
|---|---|---|
| 8 watermarked MP4s (flagship four × both aspects) | ✅ PASS | `out/2026-08-10/{fivem,gmod,rust}/`, `out/2026-08-11/minecraft/` — `spotlight.<game>.<aspect>.s<seed>.test.mp4`; every frame carries the TEST RENDER burn; placeholder clips additionally carry their own burned watermark |
| Valid sidecars | ✅ PASS | `.sidecar.json` beside each MP4: per-platform title/caption/≤4 hashtags/UTM CTA URL, seed, copy IDs, clip list, sha256, duration — pure copy-paste upload flow |
| Contact sheets | ✅ PASS | `out/review/sheets/spotlight.*.png` (8 sheets, 4×3 key frames each) |
| Deterministic assembly | ✅ PASS | same seed twice ⇒ byte-identical manifest; different seed ⇒ different picks (checked in-session; manifests written beside outputs) |
| Caption legibility via exported frames | ✅ PASS | ≥54px Inter on glass plates at 1080-wide vertical; word-by-word `#7db7ff` highlight visible in sheets; nothing renders inside platform-chrome safe zones |
| All ffprobe checks green | ✅ PASS | per video: resolution / 30fps / 27.05s (bounds 20–30) / h264 / audio track present / faststart — 8×6 checks, zero failures |
| Production gates refuse | ✅ PASS | `--mode production` exits non-zero: unapproved copy (§7.2); gates also cover placeholder-tagged clips (§7.4), TODO pricing, temp-copy banks, volume cap (§7.5) |

Render wall-time: ~330–350s per 27s video (CPU-only container, SwiftShader, concurrency 2, 512MB off-thread video cache). Frank's RTX machine will be several× faster.

## Kill criterion — quality bar (§10 P2)

**Judgement: not triggered.** Honest read of the sheets: the beat structure (hard text hook → footage montage with eyebrow + captions → three staggered feature cards → pricing panel → CTA with tagline and glow pulse) reads as deliberate motion design; typography, spacing and caption treatment are consistent with the ReFx system. The placeholder b-roll is obviously abstract (by design) — the composition leaves the full frame to footage during montage/feature beats, which is exactly where real capture will carry the video. With real gameplay in those slots this plausibly clears "a human editor at a good agency made this."

Known aesthetic notes (not blockers): the game tagline appears in both the pricing and CTA beats (brand echo — revisit if it feels repetitive with real footage); montage beats depend heavily on footage quality, which is the point of the Phase 6 capture kit.

## Notes & deviations

- The minecraft pair landed under `out/2026-08-11/` — the container's date rolled over mid-batch. Output paths are date-stamped by design (§4).
- Placeholder recipes were brightened once after the first fivem sheet read too dark; all 24 clips regenerated (`--force`) before the batch.
- Phase 2 renders use the in-code seed-stable temp copy (`remotion/src/lib/temp-copy.ts`, ids `tmp-*`, never approvable). Real banks land in Phase 3.
- Sample pricing `€4.99` with a "sample price — pending config" microlabel renders only in watermarked test mode while `pricingFrom` is TODO(frank); production refuses TODO pricing.
- Container restarts killed two background render batches; renders now run foreground with a 512MB off-thread video cache. No output was corrupted (the pipeline writes MP4s atomically via a tmp file + rename-free post step).
