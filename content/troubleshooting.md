---
title: Troubleshooting
description: The problems people really run into, what causes each one, and how to fix it.
---

## A class does nothing

Work through these in order:

1. **Is the shade between 1 and 12?** `bg-blue-500` matches nothing. Shades run from 1 to 12: `bg-blue-6`. The terminal warning names the right class for you.
2. **Is it a web-only class on React Native?** Some classes do nothing on a phone, such as `grid` and `blur-sm`. They're marked **Web only** in the reference; see [React Native](/react-native#what-doesnt-work).
3. **Is it spelled right?** Look for an "Unknown class" warning in the terminal running your dev server, or install the [VS Code extension](/editor-setup), which underlines it.
4. **Can the plugin see it?** The class must be written out whole in a file inside `src`, `app`, `pages` or `components`. `'bg-' + color` can't be found. See [Dynamic classes](/dynamic-classes).
5. **Is the file outside the scanned folders?** Add the folder with the [`include` option](/plugin-options).
6. **Is `kbach.css` imported?** It needs one `import './kbach.css'` in your entry file. `npx @kbach/cli doctor` checks this.

## The build fails after editing kbach.config.js

Most often a key with a hyphen that isn't quoted. `surface-dim: '#121318'` is a syntax error; write `'surface-dim': '#121318'`. The error message points at the line.

## A mode-aware color has no style

If `bg-surface`, or a `{ light, dark }` color from your config, draws nothing on the web, you're on `@kbach/react` 1.0.0-beta.28 or earlier. Upgrade.

## dark: classes don't follow my toggle

The default strategy, `'media'`, only follows the system setting. Set `darkMode: 'class'` or `'attribute'` in `kbach.config.js`. See [Dark mode](/dark-mode).

## The page flashes light before turning dark

Your saved theme is applied when JavaScript runs. Add the small inline script from [Avoid a flash on load](/dark-mode#avoid-a-flash-on-load) to `index.html`.

## kb() returns nothing, or throws

The engine isn't loaded yet. `await initKbach()` once before the first `kb()` call. If you know every possible class ahead of time, a [`safelist`](/plugin-options#safelist) avoids the runtime engine entirely.

## Borders are four times too thick

`border-2` drawing 8px is a bug in releases built on `@kbach/core-engine` 1.0.0-beta.2 to beta.15. Upgrade `@kbach/react`, `@kbach/react-native` or `@kbach/browser`.

## transition-colors doesn't animate

Same releases as above: there was no default duration. Upgrade, or add a `duration-*` class.

## Things look different after upgrading

`@kbach/core-engine` 1.0.0-beta.16 moved every value to Tailwind CSS v4.3: `rounded-sm` is larger, `shadow-sm` stronger, bare `ring` thinner and in the text color, and text sizes have tighter default line heights. [Coming from Tailwind CSS](/coming-from-tailwind#values-follow-tailwind-css-v43) lists them, with the class that gives the old look.

## React Native: className does nothing

The Babel plugin is missing, or Metro is serving a cached build. Add `'@kbach/react-native/babel-plugin'` to `babel.config.js`, then restart with `npx expo start --clear` or `npx react-native start --reset-cache`. This applies to Expo Go too.

## React Native: disabled: doesn't apply to a child

Variants that come from props only read the element's own props. Pass the prop to the element that has the class: `<Text disabled className="disabled:text-gray-5">`.

## React Native: the dark toggle does nothing in a monorepo

Metro may have loaded two copies of `react` or `react-native`. `npx @kbach/cli doctor` checks for this. Point both at your app's own `node_modules` with `resolver.resolveRequest` in `metro.config.js`.

## CDN: nothing is styled

Check the network tab for the `.wasm` request. On `1.0.0-beta.0` the short URL had a broken lookup; use a later version. When self-hosting, keep the `.wasm` next to `kbach.js` or set `data-wasm`. See [Plain HTML](/plain-html#host-the-files-yourself).

## CDN: the page shows without styles for a moment

Expected on the first visit: the page is styled once the engine has loaded. For a site where that matters, use React with the [build plugin](/web), which makes the CSS ahead of time. See [Plain HTML](/plain-html#things-to-know).
