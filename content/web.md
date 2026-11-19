---
title: Web
description: How Kbach works in a React app with Vite or Next.js: the build plugin finds your classes and writes one CSS file, so nothing runs in the browser to style the page.
---

On the web, Kbach is the package `@kbach/react`, with a plugin for your build tool: a Vite plugin, or a PostCSS plugin for Next.js and anything else that runs PostCSS. To set it up, follow [Installation](/installation).

## What the plugin does {#what-the-plugin-does}

1. It reads your source files and collects the class names in them.
2. It asks the engine for each class's CSS.
3. It writes all of it to one file, `kbach.css`: only the classes you use, in a fixed order, so the same classes always give the same file.

At runtime, `className` is a plain string and the CSS is already loaded. Nothing runs in the browser to style the page, and server rendering (as in Next.js) just works, because the CSS is an ordinary file.

While the dev server runs, saving a file updates the CSS straight away. Changing `kbach.config.js` updates it too, with no restart.

## Where it looks for classes {#where-it-looks}

The plugin reads `.js`, `.jsx`, `.ts` and `.tsx` files in the folders `src`, `app`, `pages` and `components`, and skips `node_modules` and build folders. To read other folders, use the [`include` option](/plugin-options#include).

In those files, it picks up class names from:

- `className="..."` and `className={...}`
- calls to `clsx()`, `cn()`, `cx()`, `classnames()` and `kb()`
- template literals (text in backticks)

It reads your code as text and never runs it, so a class must be written out in full. `'bg-' + color + '-6'` is never found. [Dynamic classes](/dynamic-classes) shows the ways around it.

## Warnings for unknown classes {#unknown-class-warnings}

When a class matches nothing, the terminal running your dev server says so, with where it is and, when there's an obvious fix, what you probably meant:

```text
→ [Kbach] Unknown class bg-blue-500 — did you mean bg-blue-6? Kbach color shades run 1–12, not 50–950.
  at src/App.tsx:12:24
→ [Kbach] Unknown class flexx — did you mean flex?
  at src/App.tsx:12:36
```

Classes defined in your own CSS files aren't reported, so Kbach and a regular stylesheet can live side by side.

## What's in kbach.css {#whats-in-kbach-css}

- A small **reset** that removes the browser's default margins and borders, for the HTML elements your project uses. This is why a plain `<h1>` looks like body text until you give it classes.
- The rules for every class you use.
- CSS variables for your mode-aware colors, and the dark-mode switch.

Don't edit the file by hand: it's rewritten whenever your classes change. With PostCSS, the plugin only writes between the `/* kbach:start */` and `/* kbach:end */` comments, so the rest of that file stays yours.

## Everything works on the web {#everything-works-on-the-web}

Every class and every [variant](/variants) works on the web: grid, gradients, filters, transitions, `group-hover:`, `before:`, container queries and the rest. The **Web only** mark in the reference is about React Native, not the browser.

## Related {#related}

- [Dynamic classes](/dynamic-classes): classes you only know while the app runs.
- [Plugin options](/plugin-options): `include`, `safelist` and the rest.
- [React API](/react-api): `useTheme`, `useColors`, `clsx` and the other exports.
