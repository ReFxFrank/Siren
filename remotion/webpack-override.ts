import type { WebpackOverrideFn } from "@remotion/bundler";

/**
 * Shared webpack override for the CLI (remotion.config.ts) and the
 * programmatic bundler (scripts). Fonts import as inline data URIs so the
 * bundle is fully self-contained — no static-server fetch at render time.
 */
export const webpackOverride: WebpackOverrideFn = (config) => ({
  ...config,
  module: {
    ...config.module,
    rules: [
      ...(config.module?.rules ?? []),
      { test: /\.ttf$/, type: "asset/inline" },
    ],
  },
});
