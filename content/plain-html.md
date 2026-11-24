---
title: Plain HTML
description: Use Kbach in any HTML page with one script tag from a CDN. No install, no build step and no React.
---

On a plain HTML page, Kbach is the package `@kbach/browser`, loaded with one `<script>` tag. It's the quickest way to try Kbach, and it suits small sites, prototypes and pages built by other tools.

## Add the script {#add-the-script}

```html title="index.html" {5}
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>
  </head>
  <body class="bg-gray-1 p-8">
    <h1 class="text-3xl font-bold text-blue-6">Hello, Kbach</h1>
  </body>
</html>
```

Use the `class` attribute, as in any HTML. Every class and variant works, the same as with React on the web.

## What the script does {#what-the-script-does}

1. It loads the engine: about 8 KB of JavaScript and 195 KB of WebAssembly, gzipped. The browser caches both after the first visit.
2. It reads the `class` attribute of every element and adds the CSS those classes need to the page.
3. It keeps watching. Elements you add later, and classes you change from JavaScript, are styled when they appear.

It never changes your `class` attributes, and it skips class names it doesn't know, so the page can use other CSS alongside Kbach.

## Things to know {#things-to-know}

- **A short moment without styles.** The page is styled once the engine has loaded, so on the first visit it can show briefly without styles. For a site where that matters, use React with the [build plugin](/web), which makes the CSS file ahead of time.
- **No transitions while the page is styled.** Transitions are off until the first styles are in, so buttons don't fade in from the browser's own look on every load. Animations (`animate-*`) start right away. `starting:` plays only for elements added after the page has loaded.
- **No typo warnings.** A class name the engine doesn't know is skipped quietly, because it may belong to other CSS. See [Check your page](#check-your-page).
- **Open the page through a web server.** A page opened straight from disk (`file://`) can't load the `.wasm` file. Any local server works, such as `npx serve`.

## Your colors and settings {#your-colors-and-settings}

Put your settings in `window.kbachConfig`, in a script **before** the Kbach script. It takes the same settings as [kbach.config.js](/configuration):

```html
<script>
  window.kbachConfig = {
    darkMode: 'class',
    extend: {
      colors: {
        brand: '#ff6b35',
        card: { light: '#ffffff', dark: '#11131b' },
      },
    },
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>
```

> [!WARNING] The settings must come before the Kbach script
> The script reads `window.kbachConfig` once, the moment it loads. Settings written after it are never read: your colors don't exist and the theme button does nothing, with no error.

Now `bg-brand` and `bg-card` work, and `card` switches with dark mode. The settings are read once, when the script starts. To change them later, call `Kbach.config({ ... })`.

## A dark mode switch {#a-dark-mode-switch}

With `darkMode: 'class'` (or `'attribute'`) in your settings:

```html
<button class="rounded-lg border px-3 py-1.5" onclick="Kbach.toggle()">Toggle theme</button>
```

`Kbach.setMode('dark')`, `'light'` or `'system'` sets a mode, and the choice is remembered on the next visit. Without one of those two settings, dark mode follows the device and `Kbach.toggle()` does nothing. See [CDN script API](/browser-api).

## Pin a version {#pin-a-version}

The short URL always gives the newest release. For a site you don't want to change by itself, put the version in the URL:

```html
<script src="https://cdn.jsdelivr.net/npm/@kbach/browser@1.0.0-beta.10"></script>
```

The same files are on unpkg: `https://unpkg.com/@kbach/browser`.

## Host the files yourself {#host-the-files-yourself}

Copy `kbach.js` and `kbach_core_engine_bg.wasm` from the package's `dist/` folder and keep them in the same folder. If the `.wasm` file lives somewhere else, say where:

```html
<script src="/js/kbach.js" data-wasm="/wasm/kbach_core_engine_bg.wasm"></script>
```

## Check your page {#check-your-page}

The script skips class names it doesn't know without a word, so a mistake shows up only as something missing on the page. To find them, paste your HTML into the [Playground](/playground): it underlines every class Kbach doesn't know and names the right one, and **Fix all** fixes the most common mistake, shades from 50 to 950, in one click. [Common mistakes](/common-mistakes) lists the others.
