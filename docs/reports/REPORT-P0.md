# Phase 0 report — Scaffold & toolchain

**Date:** 2026-08-10 · **Session:** remote (Linux container on the `claude/siren-render-pipeline-8hif0d` branch)

## Checklist

| Criterion | Result | Evidence |
|---|---|---|
| Sample MP4s exist and play, both aspects | ✅ PASS | `out/review/p0/sample-9x16.mp4` (1080×1920) and `out/review/p0/sample-16x9.mp4` (1920×1080), H.264 30fps, verified with ffprobe; exported frames alongside |
| Render wall-time logged | ✅ PASS | 6s composition → **59s** (9:16) / **58.6s** (16:9). Extrapolated 30s 1080p ≈ **5 min**, under the ~10 min kill threshold. CPU-only container (4 cores, SwiftShader GL) — Frank's RTX 5080 machine will be far faster |
| TypeScript strict, Remotion boots | ✅ PASS | `tsc --noEmit` clean; Remotion **4.0.507**; `npm run typecheck` |
| ffmpeg on PATH | ✅ PASS | ffmpeg/ffprobe 6.1.1 (installed via apt in this container; winget/choco on Windows per brief) |
| git initialized, sensible .gitignore | ✅ PASS | ignores `node_modules/`, `out/`, `assets/footage/`, `assets/music/*` audio |
| No OneDrive path anywhere | ✅ PASS | Container path `/home/user/Siren`. `TODO(frank)`: confirm `C:\dev\siren` for the local checkout — brief §2.3 |

## Kill criterion

Not triggered. 30s 1080p extrapolates to ~5 min wall-time in the weakest realistic environment (CPU-only container). No Motion Canvas evaluation needed.

## Deviations from the brief (logged per §13)

1. **Fonts: vendored data-URIs instead of `@remotion/google-fonts`.** The Google-fonts package fetches from `fonts.gstatic.com` at render time — network at render time, and `FontFace.load()`-based loaders (including `@remotion/fonts`) intermittently never resolve on Remotion's metadata pages under the container's headless shell, killing renders via stale `delayRender` timeouts (reproduced repeatedly; browser itself loads the same fonts fine — verified with standalone probe pages). Fonts are now OFL-licensed variable TTFs vendored in `assets/fonts/` (committed) and inlined into the bundle by a webpack override; glyph correctness is verified visually in review frames. This is *more* local than the brief's choice and portable to Frank's machine.
2. **Report location.** `out/` is gitignored per §4, but this build runs remotely — phase reports are committed under `docs/reports/` so they're phone-readable on GitHub; heavyweight artifacts stay in `out/review/` and key ones are surfaced in chat.
3. **Browser.** Container uses the Playwright Chrome Headless Shell via `SIREN_BROWSER`/auto-detection in `remotion.config.ts`; on Frank's machine Remotion resolves its own Chrome as usual.

## Open questions for Frank

- None blocking. TODO(frank) list §12 untouched, batched for Phase 6.
