---
title: Plugin options
description: Options for the Vite plugin and the PostCSS plugin in @kbach/react.
---

## Passing options

Both plugins take the same options object:

```ts title="vite.config.ts"
import { kbach } from '@kbach/react/vite';

kbach({
  include: ['src', 'app', 'lib/ui'],
  safelist: ['bg-red-6', 'bg-green-6'],
});
```

```js title="postcss.config.js"
module.exports = {
  plugins: {
    '@kbach/react/postcss': { include: ['src', 'app'], safelist: ['bg-red-6'] },
  },
};
```

## Options

| Option | Type | Default | What it does |
| :-- | :-- | :-- | :-- |
| `include` | `string[]` | `['src', 'app', 'pages', 'components']` | Folders to scan for class names, relative to the project root |
| `safelist` | `string[]` | `[]` | Classes to always include, even if no file mentions them |
| `config` | `KbachConfig` | `kbach.config.js` | A config object to use instead of the file |
| `theme` | `ThemeConfig` | | A fully resolved theme. Wins over `config` |
| `cssFile` | `string` | found automatically | Where to write the CSS, relative to the root |
| `root` | `string` | `process.cwd()` | PostCSS only: the project root, where `kbach.config.js` lives |

## include

The plugin reads `.js`, `.jsx`, `.ts` and `.tsx` files in these folders. It skips `node_modules`, `dist`, `build`, `out`, `.next`, `.output`, `coverage` and other build and cache folders. A class that only appears in a file outside them gets no CSS. If a shared UI folder sits elsewhere, add it.

## safelist

For class names the scanner can't see because they're built at runtime, when you know the full set ahead of time. See [Dynamic classes](/dynamic-classes).

## config and theme

Leave both out and the plugin loads `kbach.config.js` (or `.mjs`, `.cjs`) from the project root. Pass `config` to use an object instead, for instance one you also pass to `applyKbachConfig()` at runtime, so both always agree.

## cssFile

The Vite plugin looks for a file that already contains the `/* kbach:start */` and `/* kbach:end */` markers in your source folders and the project root. If there isn't one, it creates `kbach.css` in the first `include` folder that exists, usually `src/kbach.css`. Set `cssFile` only when that guess is wrong, for example when the file lives outside every `include` folder.

Anything outside the two markers is yours and is never touched, so you can keep a few hand-written rules in the same file.

## What it warns about

A class that matches nothing prints a warning in the terminal, with where it is and, when there's an obvious fix, what you probably meant:

```text
→ [Kbach] Unknown class bg-blue-500 — did you mean bg-blue-6? Kbach color shades run 1–12, not 50–950.
  at src/App.tsx:12:24
→ [Kbach] Unknown class flexx — did you mean flex?
  at src/App.tsx:12:36
```

A shade written on a 50 to 950 scale (`bg-blue-500`) is matched to the Kbach shade, and a one-letter typo to the class it was meant to be. Classes that your own CSS files define are left alone, so mixing Kbach with a stylesheet doesn't produce noise. The [VS Code extension](/editor-setup) shows the same suggestions as you type, with a one-click fix.
