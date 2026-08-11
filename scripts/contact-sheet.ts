import { basename } from "node:path";
import { contactSheet, probe } from "./lib/ffmpeg";

/** CLI: contact sheet for any rendered MP4. Usage: tsx scripts/contact-sheet.ts <video> [out.png] */
const [video, out] = process.argv.slice(2);
if (!video) {
  console.error("usage: tsx scripts/contact-sheet.ts <video.mp4> [out.png]");
  process.exit(2);
}
const target = out ?? video.replace(/\.mp4$/, ".sheet.png");
const info = await probe(video);
await contactSheet(video, target, {
  durationSec: info.durationSec,
  tileWidth: info.width >= info.height ? 480 : 300,
});
console.log(`✓ ${basename(target)}`);
