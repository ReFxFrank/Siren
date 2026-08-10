import { existsSync } from "node:fs";
import { Config } from "@remotion/cli/config";
import { webpackOverride } from "./remotion/webpack-override";

// Public dir holds fonts, logos, music and (gitignored) footage.
Config.setPublicDir("./assets");
Config.overrideWebpackConfig(webpackOverride);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Browser resolution order: explicit env override → container-provided headless
// shell → Remotion's own browser resolution (Frank's Windows machine).
const containerShell =
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const browser = process.env.SIREN_BROWSER ?? (existsSync(containerShell) ? containerShell : null);
if (browser) {
  Config.setBrowserExecutable(browser);
  // Software GL for headless containers without a GPU.
  Config.setChromiumOpenGlRenderer("swangle");
}
