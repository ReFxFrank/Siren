import { createWriteStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { get } from "node:https";
import { join, resolve } from "node:path";
import { REPO_ROOT } from "./lib/env";
import { probeAudioDuration } from "./lib/ffmpeg";

/**
 * Downloads the curated royalty-free music bed set (setup-time network, §2.1)
 * and writes LICENSES.md + attribution.json. All tracks are Kevin MacLeod
 * (incompetech.com), licensed CC BY 4.0 — free for commercial use with
 * attribution. The sidecar builder appends the attribution line to every
 * platform caption automatically, which satisfies the license.
 *
 *   npx tsx scripts/get-music.ts [--force]
 */
interface Track {
  file: string;
  title: string;
  mood: string;
}

const ARTIST = "Kevin MacLeod";
const SOURCE = "incompetech.com";
const LICENSE = "CC BY 4.0";
const LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";

const TRACKS: Track[] = [
  { file: "voxel-revolution.mp3", title: "Voxel Revolution", mood: "driving tech pulse — spotlight/priceflex" },
  { file: "neon-laser-horizon.mp3", title: "Neon Laser Horizon", mood: "dark synthwave — spotlight/hype" },
  { file: "edm-detection-mode.mp3", title: "EDM Detection Mode", mood: "pulsing electronic — priceflex/hype" },
  { file: "cyborg-ninja.mp3", title: "Cyborg Ninja", mood: "aggressive electro — hype" },
  { file: "exhilarate.mp3", title: "Exhilarate", mood: "energetic build — spotlight" },
  { file: "screen-saver.mp3", title: "Screen Saver", mood: "cool electro groove — tutorial" },
  { file: "overworld.mp3", title: "Overworld", mood: "bright game energy — minecraft-friendly" },
  { file: "raving-energy.mp3", title: "Raving Energy", mood: "upbeat EDM — hype/priceflex" },
];

const trackUrl = (t: Track) =>
  `https://incompetech.com/music/royalty-free/mp3-royaltyfree/${encodeURIComponent(t.title)}.mp3`;

function download(url: string, dest: string): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const request = (u: string, redirects: number) =>
      get(u, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects < 3) {
          res.resume();
          request(res.headers.location, redirects + 1);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${u}`));
          return;
        }
        const out = createWriteStream(dest);
        res.pipe(out);
        out.on("finish", () => out.close(() => resolvePromise()));
        out.on("error", reject);
      }).on("error", reject);
    request(url, 0);
  });
}

const force = process.argv.includes("--force");
const dir = resolve(REPO_ROOT, "assets/music");
mkdirSync(dir, { recursive: true });

let failed = 0;
for (const track of TRACKS) {
  const dest = join(dir, track.file);
  if (existsSync(dest) && !force) {
    console.log(`· ${track.file} present — skip`);
    continue;
  }
  try {
    await download(trackUrl(track), dest);
    const duration = await probeAudioDuration(dest);
    console.log(`✓ ${track.file} (${(duration / 60).toFixed(1)} min)`);
  } catch (err) {
    failed += 1;
    console.error(`✗ ${track.file}: ${(err as Error).message}`);
  }
}

const attribution = Object.fromEntries(
  TRACKS.map((t) => [
    t.file,
    {
      title: t.title,
      artist: ARTIST,
      source: SOURCE,
      license: LICENSE,
      licenseUrl: LICENSE_URL,
      credit: `Music: "${t.title}" — ${ARTIST} (${SOURCE}), ${LICENSE}`,
    },
  ]),
);
writeFileSync(join(dir, "attribution.json"), `${JSON.stringify(attribution, null, 2)}\n`);

const licenses = [
  "# Music beds — licenses",
  "",
  `All tracks by **${ARTIST}** (${SOURCE}), licensed under [Creative Commons: By Attribution 4.0](${LICENSE_URL}).`,
  "Commercial use permitted **with attribution** — SIREN appends the credit line to every video caption",
  "via the sidecar automatically. Keep the credit when uploading.",
  "",
  ...TRACKS.map((t) => `- **${t.title}** (\`${t.file}\`) — ${t.mood}`),
  "",
  `Downloaded by \`scripts/get-music.ts\` at setup time (§2.1 permits setup-time network).`,
  "",
].join("\n");
writeFileSync(join(dir, "LICENSES.md"), licenses);

console.log(`\nattribution.json + LICENSES.md written · ${TRACKS.length - failed}/${TRACKS.length} tracks ready`);
process.exit(failed > 0 ? 1 : 0);
