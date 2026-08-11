# SIREN capture kit — Phase 6 footage session

One OBS session per game on your test servers. Drop finished clips into
`assets/footage/<game>/` (any `.mp4` name works; delete the `ph-*` placeholders
when real clips land, or leave them — production refuses placeholder-tagged
files automatically). Then re-run the matrix.

## OBS settings (all games)

| Setting | Value |
|---|---|
| Base/output resolution | 1920×1080 |
| FPS | 60 |
| Encoder | NVENC H.264 (RTX 5080) |
| Rate control | CQP 18 (or CBR 40 Mbps if CQP unavailable) |
| Keyframe interval | 2s |
| Profile | high · Preset: Quality |
| Audio | mute all tracks — SIREN uses music beds only |

Recording tips that make the edit look intentional:
- **Motion in every clip** — slow pans, drives, walks. Static frames read as screenshots.
- Hide ALL UI/HUD unless the clip is explicitly a UI moment (`cinematic mode`, `hud off` binds below).
- 10–20s per clip, one idea per clip. 8–12 clips per game.
- Golden hour / night lighting where the game allows — matches the dark ReFx look.
- No copyrighted music audible anywhere (streams, radios, jukeboxes off).

## How clips map to template slots

- **T1 SPOTLIGHT** montage (3 fast cuts) + feature bed (2 slower cuts): establishing shots + action beats.
- **T2 TUTORIAL60**: step 2 is a **screen-capture slot** — record the refx.gg control panel: order → server boots → console goes green. Crop/window capture at 1080p, cursor visible, no personal data on screen.
- **T3 PRICEFLEX / T4 HYPE**: the most kinetic action beats you have; 3 clips each is plenty.

## Per-game shot lists

### Garry's Mod (8–12 clips)
1. Establishing: gm_construct / flatgrass slow pan.
2. Action: physgun lifting + welding a contraption.
3. Action: contraption chaos (thruster cart, explosive barrels).
4. Action: prop hunt round moment (taunt + reveal).
5. Action: TTT standoff moment.
6. Life: DarkRP street with player shops.
7. UI moment: spawn menu browsing props (brief).
8. Screen capture: refx.gg panel — order GMod server → addon list → live.

### Rust (8–12 clips)
1. Establishing: monument flyover at dawn (spectate/demo cam).
2. Establishing: base exterior slow orbit.
3. Action: raid moment — rockets/satchels on a wall.
4. Action: gunfight at a monument.
5. Action: farming node run / chainsaw trees.
6. Life: base interior tour, loot room reveal.
7. Life: boat/heli traversal along coast.
8. Screen capture: refx.gg panel — order Rust server → wipe schedule config.

### Minecraft (8–12 clips)
1. Establishing: world flyover (elytra or spectator) over a build.
2. Establishing: village/base at sunset, shaders if smooth.
3. Action: mining descent into a cave with friends.
4. Action: mob fight (raid / wither / dungeon).
5. Life: building timelapse-style clip (fast placing).
6. Life: farm redstone contraption running.
7. Life: group of players walking a path together.
8. Screen capture: refx.gg panel — order server → pick version/modpack → live.

## After capture

1. `npm run validate`
2. `npx tsx scripts/render-matrix.ts --mode test` — review sheets with real footage.
3. Approve copy (`docs/reports/REVIEW-COPY.md`), resolve `pricingFrom` + features TODOs.
4. `npx tsx scripts/render-matrix.ts --mode production`
