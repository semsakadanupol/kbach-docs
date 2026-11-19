import JSON5 from "json5";
import {
  resolveKbachConfig,
  type KbachConfig,
  type ThemeConfig,
} from "@kbach/react";

// The playground's kbach.config.js: the same file a project has, which the
// build plugin reads. It's read here as DATA, never run: a shared link carries
// someone else's file, and the docs page must not execute it. So it has to be
// a plain object after `module.exports =` (or `export default`); comments,
// unquoted keys, single quotes and trailing commas are fine (JSON5).

export const DEFAULT_CONFIG = `/** @type {import('@kbach/react').KbachConfig} */
module.exports = {
  // 'class' (the preview's moon button), 'attribute' or 'media'
  darkMode: 'class',
  theme: {
    // REPLACES a whole section of the defaults
  },
  extend: {
    colors: {
      // brand: '#c7a25d',
      // bg-brand, text-brand, border-brand/50, …
    },
    spacing: {},
    screens: {},
    fontFamily: {},
    container: {},
  },
};
`;

export type ConfigResult =
  | { config: KbachConfig; error?: undefined }
  | { config?: undefined; error: { message: string; line: number } };

const START = /(?:module\.exports\s*=|export\s+default)\s*/;
const DARK_MODES = ["class", "attribute", "media"];

/** kbach.config.js read as data: the object it exports, or what's wrong (with its line). */
export function parseConfig(text: string): ConfigResult {
  const m = START.exec(text);
  if (!m)
    return {
      error: {
        message:
          "kbach.config.js must export an object: module.exports = { … }",
        line: 1,
      },
    };
  // only comments may come before it: anything else would be code to run
  const before = text
    .slice(0, m.index)
    .replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
  const lineOf = (offset: number) => text.slice(0, offset).split("\n").length;
  if (before.trim())
    return {
      error: {
        message:
          "In the playground, kbach.config.js is a plain object: no code before module.exports",
        line: lineOf(m.index),
      },
    };
  const bodyAt = m.index + m[0].length;
  const body = text.slice(bodyAt).replace(/;\s*(?:\/\/[^\n]*\s*)*$/, "");
  let value: unknown;
  try {
    value = JSON5.parse(body);
  } catch (e) {
    const err = e as { message?: string; lineNumber?: number };
    const line = lineOf(bodyAt) + (err.lineNumber ? err.lineNumber - 1 : 0);
    const message = (err.message ?? "Not a plain object").replace(
      /^JSON5: /,
      "",
    );
    return {
      error: {
        message:
          "kbach.config.js: " +
          message +
          " (a plain object only: no functions, variables or imports)",
        line,
      },
    };
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    return {
      error: {
        message: "kbach.config.js must export an object",
        line: lineOf(bodyAt),
      },
    };
  const config = value as KbachConfig;
  if (
    config.darkMode !== undefined &&
    !DARK_MODES.includes(config.darkMode as string)
  ) {
    return {
      error: {
        message: "darkMode is 'class', 'attribute' or 'media'",
        line: lineOf(bodyAt + body.indexOf("darkMode")),
      },
    };
  }
  return { config };
}

/** The theme a config gives: the defaults with it applied, as the plugin does. */
export function themeFromConfig(config: KbachConfig): ThemeConfig {
  return resolveKbachConfig(config);
}
