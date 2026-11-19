---
title: kbach.config.js
nav: kbach.config.js
description: One optional settings file at the root of your project. It adds your own colors, spacing, screen sizes and fonts, and every platform and the editor extension read it.
---

## Where it goes

Create `kbach.config.js` next to your `package.json`. You don't import it anywhere:

- The Vite and PostCSS plugins find it at the project root.
- The React Native Babel plugin applies it before your app's first render.
- The VS Code extension reads it, so completion and diagnostics know your colors.
- On a plain HTML page, put the same object in `window.kbachConfig` (see [Plain HTML](/plain-html#your-colors-and-settings)).

## The shape

```js title="kbach.config.js"
/** @type {import('@kbach/react').KbachConfig} */
export default {
  darkMode: 'media', // 'media' (default), 'class' or 'attribute'
  theme: {
    // REPLACES a whole section of the defaults
  },
  extend: {
    // ADDS to the defaults. This is what you usually want.
    colors: {},
    spacing: {},
    screens: {},
    fontFamily: {},
    container: {},
  },
};
```

The `@type` comment gives you autocompletion for the config in most editors. CommonJS works too: `module.exports = { ... }`. On the web you can also name the file `kbach.config.mjs` or `kbach.config.cjs`. React Native only reads `kbach.config.js`.

## theme or extend

Use `extend` to add to the built-in values. Your `brand` color joins the 26 color families, and an `extend.spacing` entry joins the spacing scale.

Use `theme` to replace a section completely. `theme.colors` drops the whole built-in palette and leaves only your colors. That's useful for a strict design system, but you lose `bg-blue-6` and the rest.

`theme` accepts `colors`, `spacing`, `screens` and `fontFamily`. `container` only goes under `extend`.

## A complete example

This is the config of the site you're reading. The colors come from the Kbach logo:

```js title="kbach.config.js"
export default {
  darkMode: 'class',
  extend: {
    fontFamily: {
      sans: '"Geist", ui-sans-serif, system-ui, sans-serif',
      display: '"Fraunces", ui-serif, Georgia, serif',
      mono: '"Geist Mono", ui-monospace, monospace',
    },
    colors: {
      gold: '#c7a25d',
      logo: '#2e393f',
      page: { light: '#faf7f0', dark: '#1a2125' },
      card: { light: '#ffffff', dark: '#243036' },
      line: { light: '#e4dccb', dark: '#33424a' },
      ink: { light: '#1f272b', dark: '#ece6d8' },
      muted: { light: '#5b676d', dark: '#9aa8ae' },
      accent: { light: '#87642f', dark: '#d6b46f' },
      'accent-ink': { light: '#ffffff', dark: '#1a1b1b' },
    },
  },
};
```

With it, `bg-page text-ink border-line` gives the right colors in both modes, `font-display` uses Fraunces, and `bg-gold/10` is a light gold wash.

This site is a web app. On React Native, write light and dark colors in the grouped form instead (`dark: { page: '#1a2125' }`); see [Theme colors](/theme-colors#colors-for-light-and-dark-mode).

> [!WARNING] Quote keys that contain a hyphen
> The file is JavaScript, not JSON. `accent-ink: '#fff'` is a syntax error. Write `'accent-ink': '#fff'`. On the web the build stops with that error; on React Native it shows up as a Metro bundling error.

## When changes apply

- **Vite and Next.js:** save the file and the CSS is rebuilt, no restart needed. If the file has a mistake mid-edit, the terminal says so and the last working config stays in use.
- **React Native:** restart Metro with its cache cleared: `npx expo start --clear` or `npx react-native start --reset-cache`.
- **At runtime:** to change the theme while the app runs, after a login for example, call `applyKbachConfig(config)`. See the [React API](/react-api#applykbachconfig).

## Next

- [Theme colors](/theme-colors): references, opacity and mode-aware colors.
- [Spacing, screens and fonts](/spacing-screens-fonts).
