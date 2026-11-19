---
title: CDN script API
nav: CDN script API
description: The window.kbachConfig object and the window.Kbach API of @kbach/browser.
---

## window.kbachConfig

Read once, when the script starts. Set it in a `<script>` placed **before** the Kbach script:

```html
<script>
  window.kbachConfig = { darkMode: 'class', extend: { colors: { brand: '#ff6b35' } } };
</script>
<script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>
```

The shape is exactly that of [kbach.config.js](/configuration). To change it later, call `Kbach.config()`.

## window.Kbach

### Kbach.ready

```js
await Kbach.ready;
```

A promise that resolves once the engine has loaded and the page has been styled for the first time.

### Kbach.config(cfg)

```js
Kbach.config({ extend: { colors: { brand: '#2563eb' } } });
```

Applies a new config and styles the whole page again.

### Kbach.refresh()

Styles the whole page again. Changes to the page are picked up on their own, so you rarely need this.

### Kbach.setMode(mode) and Kbach.toggle()

```js
Kbach.setMode('dark'); // 'light', 'dark' or 'system'
Kbach.toggle();
```

The choice is saved in `localStorage` and restored on the next visit. Needs `darkMode: 'class'` or `'attribute'`.

## Script attributes

| Attribute | |
| :-- | :-- |
| `data-wasm` | Where to load `kbach_core_engine_bg.wasm` from, when it isn't next to the script |

## What gets styled

Every token in every `class` attribute on the page, once the engine has loaded. After that, a `MutationObserver` styles elements you add and classes you change. Each class is resolved once. Tokens that aren't Kbach classes produce no CSS and are ignored, so the script works alongside your own stylesheet.

The script never changes your `class` attributes.
