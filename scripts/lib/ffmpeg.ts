import { openSync, readSync, closeSync } from "node:fs";
import { run } from "./run";

export interface ProbeInfo {
  width: number;
  height: number;
  fps: number;
  durationSec: number;
  videoCodec: string;
  hasAudio: boolean;
  formatTags: Record<string, string>;
}

export async function probe(file: string): Promise<ProbeInfo> {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-print_format", "json",
    "-show_streams",
    "-show_format",
    file,
  ]);
  const data = JSON.parse(stdout) as {
    streams: Array<{
      codec_type: string;
      codec_name: string;
      width?: number;
      height?: number;
      avg_frame_rate?: string;
    }>;
    format: { duration?: string; tags?: Record<string, string> };
  };
  const video = data.streams.find((s) => s.codec_type === "video");
  const audio = data.streams.find((s) => s.codec_type === "audio");
  if (!video) throw new Error(`No video stream in ${file}`);
  const [num, den] = (video.avg_frame_rate ?? "0/1").split("/").map(Number);
  return {
    width: video.width ?? 0,
    height: video.height ?? 0,
    fps: den ? (num ?? 0) / den : 0,
    durationSec: Number(data.format.duration ?? 0),
    videoCodec: video.codec_name,
    hasAudio: Boolean(audio),
    formatTags: data.format.tags ?? {},
  };
}

export const PLACEHOLDER_TAG = "SIREN_PLACEHOLDER";

export async function isPlaceholderClip(file: string): Promise<boolean> {
  const info = await probe(file);
  const comment = info.formatTags.comment ?? info.formatTags.COMMENT ?? "";
  return comment.includes(PLACEHOLDER_TAG);
}

/** moov atom before mdat ⇒ web-optimized (faststart). */
export function hasFaststart(file: string): boolean {
  const fd = openSync(file, "r");
  try {
    const buf = Buffer.alloc(1024 * 1024);
    const read = readSync(fd, buf, 0, buf.length, 0);
    const head = buf.subarray(0, read);
    const moov = head.indexOf("moov");
    const mdat = head.indexOf("mdat");
    if (moov === -1) return false;
    return mdat === -1 || moov < mdat;
  } finally {
    closeSync(fd);
  }
}

/**
 * Post stage (§9.6): faststart remux always; loudness-normalize to −14 LUFS
 * (re-encode audio) only when the job carries music.
 */
export async function postProcess(
  input: string,
  output: string,
  { normalizeAudio }: { normalizeAudio: boolean },
): Promise<void> {
  const args = ["-y", "-v", "error", "-i", input];
  if (normalizeAudio) {
    args.push(
      "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
      "-c:v", "copy",
      "-c:a", "aac",
      "-b:a", "192k",
    );
  } else {
    args.push("-c", "copy");
  }
  args.push("-movflags", "+faststart", output);
  await run("ffmpeg", args);
}

/** Integrated loudness (LUFS) via ebur128 — verify stage. */
export async function measureLoudness(file: string): Promise<number | null> {
  const { stderr } = await run(
    "ffmpeg",
    ["-nostats", "-i", file, "-filter_complex", "ebur128", "-f", "null", "-"],
    { allowFailure: true },
  );
  const match = stderr.match(/I:\s*(-?[\d.]+)\s*LUFS/g);
  if (!match || match.length === 0) return null;
  const last = match[match.length - 1] as string;
  const value = last.match(/(-?[\d.]+)/);
  return value ? Number(value[1]) : null;
}

export async function extractFrame(
  video: string,
  atSec: number,
  outPng: string,
): Promise<void> {
  await run("ffmpeg", [
    "-y", "-v", "error",
    "-ss", String(atSec),
    "-i", video,
    "-frames:v", "1",
    outPng,
  ]);
}

/** 4×3 contact sheet of evenly spaced frames (§9.8). */
export async function contactSheet(
  video: string,
  outPng: string,
  { durationSec, tileWidth = 300 }: { durationSec: number; tileWidth?: number },
): Promise<void> {
  await run("ffmpeg", [
    "-y", "-v", "error",
    "-i", video,
    "-vf", `fps=12/${durationSec},scale=${tileWidth}:-2,tile=4x3`,
    "-frames:v", "1",
    outPng,
  ]);
}
