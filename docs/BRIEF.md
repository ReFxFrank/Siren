# SIREN — Build Brief v1.0

**Project:** Local promotional video render pipeline for refx.gg
**Owner:** Frank
**Executor:** Claude Code (agent-ready brief)
**Date:** 2026-08-10

---

## 0. What SIREN is

SIREN is a fully local, zero-runtime-cost batch video renderer that produces platform-ready promotional shorts for refx.gg's game hosting. It is the video edition of the programmatic SEO play: template × game = render matrix. Output is finished video files plus a metadata sidecar per video (title, captions, hashtags, CTA link) for **manual upload** by Frank. SIREN never touches a platform API.

The bar: every output must look like a human editor at a good agency made it. If it reads as AI slop, SIREN has failed regardless of how well the pipeline runs.

---

## 1. Operating mode — remote-first autonomy

Frank may kick this project off from a **remote Claude Code session (mobile)** and may not be physically at the machine for days. Therefore:

- **Phases 0–5 must be completable with zero human presence at the PC.** No interactive prompts, no "please plug in X", no steps that require a monitor.
- Every phase produces **reviewable artifacts** in `out/review/` (exported PNG frames, contact sheets, short MP4s, markdown summaries) so Frank can approve or redirect from his phone.
- Anything that genuinely requires Frank's hands (footage capture, license purchase, uploads) is **deferred and batched into Phase 6** and marked `HUMAN-GATE`. Do not let a HUMAN-GATE item block an earlier phase — design around it.
- Key autonomy mechanisms:
  - **Placeholder footage generator** (§7.4) so the entire pipeline is verifiable end-to-end before any real gameplay footage exists.
  - Captions default to **template-timed** (no VO, no speech-alignment dependencies).
  - Renders must **succeed with an empty music folder** (silent bed) — music tracks are a HUMAN-GATE drop-in.
  - Fonts installed programmatically via `@remotion/google-fonts` — no manual font installs.
- End every phase with a checklist report: each acceptance criterion marked pass/fail, plus paths to review artifacts.

---

## 2. Hard constraints (non-negotiable)

1. **Zero runtime API cost.** No metered services, no cloud calls, no LLM API calls at render time. Copy comes from committed copy banks. The only network activity permitted is package installation during setup.
2. **File-based configuration only.** JSON configs in the repo. No GUI settings, no database, no admin panel.
3. **Repo location:** `C:\dev\siren` — **not** under OneDrive or any synced folder. `TODO(frank): confirm path.` If the session starts inside a OneDrive path, stop and relocate first.
4. **Manual upload only.** Building any posting, scheduling, OAuth, or platform-API integration is out of scope. If you find yourself scaffolding one, stop — that is scope creep and grounds to halt the phase.
5. **Anti-slop guardrails (§7) are requirements**, not suggestions. Production renders that violate them must refuse to run.
6. Target environment: Windows 11, Node LTS, RTX 5080 (16GB) + 64GB RAM available. GPU is only needed for optional flags (TTS/alignment).

---

## 3. Toolchain

| Piece | Choice | Notes |
|---|---|---|
| Render engine | **Remotion** (latest v4) | React-defined compositions. `TODO(frank): Remotion company license — free tier covers companies ≤3 people. Confirm eligibility or purchase before publishing videos commercially. Build proceeds regardless.` |
| Encoding/post | **ffmpeg** | Loudness normalize, faststart, probe validation. Install via winget/choco non-interactively; verify on PATH. |
| Fonts | `@remotion/google-fonts` | Space Grotesk (headings) + Inter (body/captions). `TODO(frank): approve or swap fonts.` |
| VO (optional, default OFF) | Kokoro TTS local (`kokoro-onnx`) | Behind `--vo` flag. Do not install unless the flag is exercised. |
| Caption alignment (optional) | WhisperX | Only ever needed when VO is on. Never a default dependency. |
| Language | TypeScript throughout | Strict mode. |

If any optional dependency fails to install, log it, keep the flag disabled, and continue — optional deps must never block the pipeline.

---

## 4. Repo layout

```
C:\dev\siren\
├── remotion/
│   └── src/
│       ├── design/          # ReFx Glassy motion primitives (GlassPanel, GlowText,
│       │                    #   CaptionPlate, EyebrowLabel, CTAButton, AccentBeam…)
│       ├── templates/       # T1Spotlight/ T2Tutorial60/ T3PriceFlex/ T4Hype/
│       ├── lib/             # timing, seeded-pick, caption engine, audio ducking,
│       │                    #   aspect-layout helpers
│       └── Root.tsx
├── config/
│   ├── brand.json           # design tokens (§5)
│   ├── games/               # gmod.json, rust.json, minecraft.json, …
│   ├── copy/                # <template>.<game>.json copy banks (§7)
│   └── render-matrix.json   # what to render (§6.4)
├── assets/
│   ├── footage/<game>/      # b-roll clips (.gitignore'd; placeholders until P6)
│   ├── music/               # royalty-free beds + LICENSES.md (empty at start = silent render)
│   └── logos/               # refx.gg marks
├── scripts/
│   ├── validate-configs.ts
│   ├── gen-placeholders.ts  # procedural placeholder b-roll (§7.4)
│   ├── render.ts            # single job
│   ├── render-matrix.ts     # batch
│   ├── sidecar.ts
│   └── contact-sheet.ts
├── out/
│   ├── review/              # phase artifacts for Frank's phone review
│   └── <date>/<game>/       # finished renders + sidecars
└── docs/
    ├── BRIEF.md             # this file
    ├── CAPTURE-KIT.md       # generated in P5 for the P6 footage session
    └── findings/            # kill-criteria writeups if triggered
```

`.gitignore`: `assets/footage/`, `assets/music/*.mp3|wav`, `out/`, `node_modules/`.

---

## 5. Design system — ReFx Glassy, motion port

SIREN videos are the ReFx operating system in motion: premium, dark, tactical, restrained. High-end control panel, never cartoonish, never generic glassmorphism, never neon sci-fi.

### 5.1 Tokens (`config/brand.json`)

| Role | Value |
|---|---|
| Dark bases | `#070b12`, `#0a111d`, `#0f1828`, `#101a2b` |
| Primary accent | `#0072ff` |
| Secondary accent | `#58A7D3` |
| Light accent text | `#7db7ff` |
| Pale highlight | `#9dccff` |
| Bright text | `#eef6ff` / `#f3f8ff` |
| Secondary text | `rgba(216,234,255,0.72)` |
| Muted metadata | `rgba(188,216,255,0.56)` |
| Label text | `rgba(140,196,255,0.70)` |
| Panel bg | `linear-gradient(180deg, rgba(10,18,32,0.96), rgba(7,13,24,0.96))` |
| Card bg | `linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))` |
| Borders | `rgba(255,255,255,0.05–0.08)`, `rgba(0,114,255,0.14–0.22)` |
| Per-game accent | from `games/<id>.json`, used sparingly over the blue base |

Glow: soft, wide, low-opacity, blue. Reinforces active/CTA states — never decoration on everything. Shadows deep and soft, black with slight blue influence.

### 5.2 Video-specific rules

- **Safe areas @ 1080×1920 (9:16):** keep all critical text/CTA out of the bottom ~250px, right ~120px, top ~150px (platform UI chrome). Build a `SafeArea` debug overlay toggle.
- **Legibility:** body/caption text ≥ 54px at 1080-wide vertical; verify by exporting frames and checking at phone scale. Bright text on glass caption plates, never raw text over busy footage.
- **Captions:** word-by-word highlight — base `#eef6ff`, active word `#7db7ff` with a soft `#0072ff` glow, sitting on a subtle glass plate. Always burned in; most viewers are muted.
- **Motion grammar:** fast and subtle. Micro-moves 150–300ms, panel slides 400–600ms, ease-out expo. Glow pulse reserved for the CTA beat. Nothing bouncy, nothing spinning, no particle spam.
- **Eyebrow labels:** uppercase, small, high tracking, muted blue — used for game name / section tags.
- **Never produce:** cartoonish styling, green as primary, oversaturated neon, overuse of blur, cluttered gradients, oversized toy typography, empty hero spacing.

---

## 6. Configuration schemas

### 6.1 `config/games/<id>.json`

```json
{
  "id": "rust",
  "displayName": "Rust",
  "accent": "#e0623d",
  "tagline": "Survive the wipe.",
  "ctaSlug": "rust",
  "pricingFrom": "$20",
  "features": ["Instant setup", "NVMe hardware", "DDoS protection", "TODO(frank): confirm top 4 selling points"],
  "footageDir": "assets/footage/rust",
  "enabled": true
}
```

CTA URL is derived, never hardcoded per video: `https://refx.gg/<ctaSlug>?utm_source=<platform>&utm_medium=video&utm_campaign=siren-<template>`.

Flagship set for all early phases: **gmod, rust, minecraft** (see Decisions addendum — FiveM dropped 2026-08-11; fourth slot open). The other 26+ games are config additions later — nothing in the code may special-case a game.

### 6.2 Copy banks — `config/copy/<template>.<game>.json`

```json
{
  "template": "spotlight",
  "game": "rust",
  "hooks":  [{ "id": "h01", "text": "Your server shouldn't die before the wipe does", "approved": false }],
  "bodies": [{ "id": "b01", "lines": ["…"], "approved": false }],
  "ctas":   [{ "id": "c01", "text": "Launch yours at refx.gg", "approved": false }]
}
```

Rules: ≥15 hooks, ≥8 bodies, ≥5 CTAs per bank. Every entry carries `approved` (see §7.2).

### 6.3 `config/brand.json` — tokens from §5.1 plus font names, caption style, safe-area insets.

### 6.4 `config/render-matrix.json`

```json
{
  "jobs": [
    { "template": "spotlight", "game": "rust", "aspects": ["9x16", "16x9"],
      "seed": 43, "vo": false, "music": "auto", "platforms": ["tiktok", "shorts", "reels"] }
  ]
}
```

`seed` drives every random pick (copy selection, footage clip order). Same seed ⇒ identical video. Seed is recorded in the sidecar so any output is exactly reproducible.

---

## 7. Copy system & anti-slop guardrails

### 7.1 Structure
Template skeletons (beat timing, slot layout, scene structure) are **authored in code by hand** during the build. Copy banks only fill designated slots. No free-form generated scripts, ever.

### 7.2 Bank lifecycle
1. Claude Code drafts banks **in-session** (zero API cost) during Phase 3, written with `approved: false`.
2. A generated `out/review/REVIEW-COPY.md` lists every entry grouped by bank — readable on a phone.
3. Frank approves by instructing Claude Code (remote is fine: "approve all fivem hooks except h07, h12"). The agent flips flags accordingly.
4. **Production renders refuse unapproved copy.** Test/placeholder renders may use unapproved copy but are watermarked (§7.4).

### 7.3 Copy lint (run in `validate-configs.ts`, blocks commit of banks that fail)
- Banned phrases: "game-changer", "game changing", "unleash", "revolutionize", "next-level", "take it to the next level", "elevate", "seamless", "🔥🔥", "insane deal"
- Hook ≤ 8 words. Exactly **one** CTA per video. ≤ 4 hashtags per platform caption. ≤ 2 emoji per caption. No ALL-CAPS runs > 2 words.
- Claims lint: no invented stats, no "#1", no "fastest in the world" — only claims present in `games/<id>.json` features.

### 7.4 Visual integrity
- **No AI-generated or fake gameplay footage. Ever.** Footage is real capture (Phase 6) or obviously-abstract placeholders.
- `gen-placeholders.ts` procedurally renders abstract b-roll (drifting gradients, particle fields, grid sweeps in the game's accent color) — clearly not gameplay, and every placeholder render burns a corner watermark: `PLACEHOLDER — NOT FOR PUBLISH`.
- The production render command **hard-fails** if any input clip carries the placeholder watermark flag or any copy is unapproved. Autonomy never produces something publishable-looking that hasn't passed the gates.

### 7.5 Volume discipline
The matrix is capped at 3 production renders/day/platform by default. SIREN is a quality pipeline, not a firehose — mass-posting identical slop is both ineffective and against platform policy.

---

## 8. Template families

All templates render **9:16 and 16:9 from the same composition** via layout props — no duplicated scenes. Each template ships with a beat sheet; timings below are the spec, tuned during build.

### T1 — SPOTLIGHT (20–30s) · build first
Game showcase. Beats: **0–1.5s hook** (text-first, hardest cut) → 1.5–8s footage montage with eyebrow label → 8–18s three feature cards sliding in over footage → 18–24s pricing beat → 24–30s CTA with glow pulse + URL.

### T2 — TUTORIAL60 (45–60s)
"Host a ___ server in 60 seconds." Numbered glass step cards over footage/screen capture. Educational tone, soft CTA on the final beat only. This is the family most likely to earn organic reach.

### T3 — PRICEFLEX (12–18s)
Pricing/feature flex. Big number treatment, feature ticker, CTA. Fastest cut of the four.

### T4 — HYPE (8–15s)
Wipe day / update countdown. Timer motif, high energy within the motion grammar — restrained, not strobing.

---

## 9. Pipeline stages (`render.ts`)

1. **validate** — schemas, token integrity, safe-area config, copy lint.
2. **assemble** — seeded picks from approved bank entries + footage clip ordering; write assembly manifest.
3. **tts** *(only if `--vo`)* — Kokoro local render of the assembled script.
4. **captions** — template-timed by default; WhisperX word-alignment only when VO exists.
5. **render** — Remotion headless → H.264 high profile, CRF ≈ 18, both aspects.
6. **post** — ffmpeg: loudness normalize to −14 LUFS when audio present, `+faststart`, container sanity.
7. **sidecar** — JSON next to each MP4: per-platform title/caption/hashtags, CTA URL with UTM, seed, template/game/bank-entry IDs, duration, checksum. Manual upload becomes pure copy-paste.
8. **review artifacts** — contact sheet PNG (grid of key frames) per video into `out/review/`.
9. **verify** — ffprobe checks: resolution, fps, duration within template bounds, audio loudness, faststart flag. Any failure marks the job red in the phase report.

---

## 10. Phases

Each phase ends with a pass/fail checklist against its acceptance criteria and links to review artifacts. Do not start the next phase with open failures unless Frank says so.

### Phase 0 — Scaffold & toolchain
Repo at `C:\dev\siren`, TypeScript strict, Remotion project boots, ffmpeg on PATH, sample composition renders headless to MP4 in both aspects.
**Accept:** sample MP4s exist and play; render wall-time logged; git initialized with sensible `.gitignore`; no OneDrive path anywhere.
**Kill:** if a 30s 1080p render exceeds ~10 min wall-time after basic optimization (concurrency, GL renderer selection), stop. Write `docs/findings/render-perf.md` with measurements and a Motion Canvas fallback evaluation. Await Frank. Do not switch frameworks unilaterally.

### Phase 1 — Design system
Implement §5 primitives + `brand.json`. Build a `TokenShowcase` composition demonstrating every primitive, both aspects.
**Accept:** exported frames in `out/review/p1/` match the token table; safe-area overlay works; no banned visual patterns present.

### Phase 2 — T1 SPOTLIGHT end-to-end (placeholder mode)
Placeholder generator + full pipeline for T1 across the flagship four, both aspects, using seed-stable temporary copy.
**Accept:** 8 watermarked MP4s + valid sidecars + contact sheets; deterministic (same seed twice ⇒ byte-identical assembly manifest); caption legibility verified via exported frames; all ffprobe checks green.
**Kill (quality bar):** review the contact sheets honestly against "would a stranger believe a human editor made this?" If placeholder-mode output can't plausibly clear that bar with real footage swapped in, halt and write `docs/findings/quality-bar.md` instead of building three more templates on a weak foundation.

### Phase 3 — Copy banks (flagship four × T1, then all templates as they land)
Draft banks per §6.2, lint-clean, `approved: false`, generate `REVIEW-COPY.md`.
**Accept:** bank minimums met; lint passes; review file is phone-readable.
**HUMAN-GATE (remote-friendly):** Frank approves entries via chat instruction; agent flips flags and re-validates.

### Phase 4 — T2, T3, T4
Same standard as Phase 2, per template. T2 includes a screen-capture slot spec (real capture arrives in Phase 6).
**Accept:** placeholder-mode matrix across all four templates renders green.

### Phase 5 — Batch matrix + QA harness + capture kit
`render-matrix.ts` one-command batch; consolidated QA report; generate `docs/CAPTURE-KIT.md` — per-game OBS shot list (settings: 1080p60, bitrate, scene list per template slot: establishing shots, action beats, UI moments, ~8–12 clips of 10–20s each per game).
**Accept:** full flagship matrix renders green in one command; QA report + capture kit exist and are phone-readable.

### Phase 6 — HUMAN-GATE (Frank at the PC, batched)
1. Resolve `TODO(frank)` list (§12), including the Remotion license call.
2. Run the CAPTURE-KIT session on test servers; drop clips into `assets/footage/<game>/`; drop 5–10 royalty-free tracks + `LICENSES.md` into `assets/music/`.
3. Production re-render of the flagship matrix (watermarks off, gates enforced).
4. Spot-check on the actual phone screen; first manual uploads.
**Accept:** first real videos uploaded; UTM links resolve; sidecar copy-paste flow felt frictionless.

---

## 11. Non-goals

No platform APIs, uploading, scheduling, or analytics dashboards. No account automation. No AI-generated footage. No GUI config editor. No per-platform code paths beyond sidecar caption formatting. No more than four template families in v1.

---

## 12. TODO(frank) — decision list

1. Repo path `C:\dev\siren` confirmed?
2. Remotion license (≤3-person company free tier vs. paid).
3. ~~Flagship four confirmed?~~ **Decided 2026-08-11: gmod / rust / minecraft.** FiveM dropped — offering FiveM hosting risks breaching the CFX/Rockstar ToS. Optional fourth flagship TBD (candidates from the ReFxHosting catalog: Palworld, ARK, Satisfactory).
4. Per-game `pricingFrom` + top-4 feature claims (only these may appear in videos).
5. Fonts: Space Grotesk + Inter, or swap?
6. VO default stays OFF (captions + music only)?
7. Music shortlist source (YouTube Audio Library / Pixabay) — drop-in during Phase 6.
8. Footage capture window — when can you run the CAPTURE-KIT session?

---

## 13. Remote kickoff runbook

From a remote Claude Code session (mobile is fine), per phase:

> "Read `docs/BRIEF.md`. Execute Phase N. Stop at the acceptance checklist, report pass/fail per criterion with paths to review artifacts in `out/review/`. Do not start Phase N+1."

Review artifacts from `out/review/` are the approval surface — contact sheets and markdown reports readable on a phone. Copy approval (Phase 3) and matrix tweaks are chat instructions; only Phase 6 needs Frank in the chair.

---

*End of brief. Anything ambiguous: prefer the restrained option, log the question in the phase report, and keep moving.*

---

## Addendum — decisions log

- **2026-08-11 · FiveM removed from SIREN entirely** (Frank): refx.gg will not offer FiveM hosting — doing so risks breaching the CFX/Rockstar ToS. No SIREN output may reference FiveM. Flagship set is gmod / rust / minecraft; a fourth flagship may be chosen later.
- **2026-08-11 · Pricing resolved** from the public ReFxHosting repo seed/reprice pipeline ($5/GB/mo × Low-tier RAM): gmod $10 · rust $20 · minecraft $10.
