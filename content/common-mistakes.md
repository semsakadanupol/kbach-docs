---
title: Common mistakes
description: The mistakes almost everyone makes with Kbach at first, people and AI assistants alike, what each one looks like, and the fix.
---

Each mistake below fails quietly: the page loads, but something isn't styled. So when something looks wrong, check this list first, then [check your page](#check-your-page).

## Shades from 50 to 950 {#shades-from-50-to-950}

Kbach's colors run from `1` (lightest) to `12` (darkest). A class like `text-amber-700` doesn't exist, so it draws nothing, with no error in the browser.

```html
<!-- ✗ draws nothing -->
<p class="text-amber-700 dark:text-amber-400">Hello</p>

<!-- ✓ -->
<p class="text-amber-8 dark:text-amber-5">Hello</p>
```

To convert a number from the 50 to 950 scale:

| Was | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| **Kbach** | `1` | `2` | `3` | `4` | `5` | `6` | `7` | `8` | `9` | `10` | `11` |

Kbach also has a `12`, darker than any of them. This is only a starting point: compare the [swatches](/colors) when the exact color matters.

## Settings set after the CDN script {#settings-after-the-script}

On a plain HTML page, the Kbach script reads `window.kbachConfig` once, the moment it loads. Settings written after it are never read: your colors don't exist, and `darkMode: 'class'` isn't applied, so the theme button does nothing.

```html
<!-- ✗ the script has already started when the settings appear -->
<script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>
<script>
  window.kbachConfig = { darkMode: 'class' };
</script>

<!-- ✓ settings first, then the script -->
<script>
  window.kbachConfig = { darkMode: 'class' };
</script>
<script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>
```

## A theme button with no strategy {#a-theme-button-with-no-strategy}

On the web and in plain HTML, dark mode follows the device by default (`darkMode: 'media'`), and nothing can switch it by hand. `useTheme().toggle()` and `Kbach.toggle()` only work after you choose `'class'` or `'attribute'`:

```js title="kbach.config.js"
export default {
  darkMode: 'class',
};
```

On a plain HTML page, the same setting goes in `window.kbachConfig`, before the script.

## A class glued together from pieces {#a-class-glued-together}

With React on the web, the build reads your files and only finds classes written out in full. A name built while the app runs gets no CSS.

```tsx
// ✗ the build never sees "bg-red-6"
<div className={'bg-' + color + '-6'} />

// ✓ every class written out
const BG = { red: clsx('bg-red-6'), blue: clsx('bg-blue-6') };
<div className={BG[color]} />
```

See [Dynamic classes](/dynamic-classes). (React Native and plain HTML pages work out classes while they run, so this mistake only happens on the web.)

## Web-only classes in a React Native app {#web-only-classes-in-react-native}

A phone app has no CSS, so grid layouts, gradients, filters, transitions, `group-hover:` and `before:` do nothing there, without an error. The reference marks each of these classes **Web only**. See [React Native](/react-native#what-doesnt-work) for what to use instead.

## No Babel plugin in React Native {#no-babel-plugin}

Without `'@kbach/react-native/babel-plugin'` in `babel.config.js`, `className` does nothing at all, on every device, including Expo Go. Add it, then restart Metro with the cache cleared. See [Installation](/installation?tab=react-native#rn-babel).

## Settings in the wrong place {#settings-in-the-wrong-place}

Kbach doesn't read `tailwind.config.js`, an `@theme` block, `@tailwind` or `@import "tailwindcss"` in your CSS, and it has no `@apply`. Your colors, spacing and fonts go in [kbach.config.js](/configuration).

## Check your page {#check-your-page}

Three ways to find a class that does nothing:

- **Paste it into the [Playground](/playground).** The editor underlines every class it doesn't know and names the right one; **Fix all** in the status bar fixes the shades in one click. This is the quickest way to check a plain HTML page.
- **Read the terminal.** With React on the web, the dev server prints every unknown class with its file, line and the fix.
- **Use the [VS Code extension](/editor-setup).** It underlines unknown classes as you type, and in a React Native project, the web-only ones too.

The CDN script itself stays quiet about unknown classes, because a page may use other CSS too.

## Using an AI assistant? {#using-an-ai-assistant}

AI assistants make these exact mistakes, because they learned the 50 to 950 shades from Tailwind CSS. Give them Kbach's rules first: see [Using AI assistants](/ai-assistants).
