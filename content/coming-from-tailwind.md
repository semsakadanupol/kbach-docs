---
title: Coming from Tailwind CSS
nav: Coming from Tailwind CSS
description: Kbach's class names follow Tailwind CSS v4.3. Here is what carries over, and every place where Kbach is different.
---

If you know Tailwind CSS, you already know most of Kbach: the utility names, the variants (`hover:`, `md:`, `dark:`), values in brackets, `!` for important, and the slash for opacity all work the same way. Kbach covers the utilities of Tailwind CSS v4.3, with the same values. This page lists what's different. Kbach is an independent project; see the note at the bottom.

## Color shades {#color-shades}

The biggest difference. Kbach has its own palette: 26 color families with shades from `1` (lightest) to `12` (darkest), instead of `50` to `950`.

| Tailwind CSS | Kbach |
| :-- | :-- |
| `bg-blue-500` | `bg-blue-6` |
| `text-gray-900` | `text-gray-11` |
| `border-slate-200` | `border-slate-3` |

Shade `6` sits roughly where `500` does, but the scale isn't a one-to-one renaming, so compare the [swatches](/colors) when you move a design over. You don't have to look every class up: when you use a `50` to `950` shade, the terminal warning, the [VS Code extension](/editor-setup) and the [Playground](/playground) all name the Kbach shade to use.

## Setup {#setup}

- There's no `@import "tailwindcss"`. The build plugin writes `kbach.css` for you, and you import that file once (see [Installation](/installation)).
- Settings go in a JavaScript file, [kbach.config.js](/configuration), with `theme` and `extend` sections. There's no `@theme` block in CSS.
- Custom animations go in `extend.keyframes` and `extend.animation` in that file, instead of `@keyframes` and `--animate-*` inside `@theme`. See [Custom animations](/transitions-animation#custom-animations).
- There's no `@apply`. To reuse a set of classes, put them in a component, or in a variable wrapped in `clsx()`.

## Naming {#naming}

- **Borders between children:** the color is `divide-color-*`. `divide-<color>` works as a shorter form. `divide-x` and `divide-y` are the widths, and `divide-x` uses the left and right sides.
- **Gradient stop positions** accept `from-10%` and the shorter `from-10`.
- **`rotate-none` and `scale-none`** reset the combined `transform` rather than the separate CSS `rotate` and `scale` properties. It looks the same.
- **A bare `text-shadow`** isn't a Tailwind class. Kbach keeps it as an extra.

## Behavior {#behavior}

- **`h-screen` and `w-screen`** are `100dvh` and `100dvw`, the part of the screen you can see, so a full-height page doesn't slide under a phone's address bar. Tailwind CSS uses `100vh` and `100vw`.
- **`disabled:`** styles are `!important`, so a disabled element's look can't lose to a rule that loads later.
- **`font-sans`** is `ui-sans-serif, system-ui, sans-serif` and the emoji fonts. Set your own in [kbach.config.js](/spacing-screens-fonts#fonts).
- **`theme()`** isn't available inside a bracket value. `--spacing(4)` and `--alpha(var(--brand) / 50%)` are.

## React Native {#react-native}

The same class names also work in React Native, which Tailwind CSS doesn't cover. A phone app has no CSS, so some things can't exist there: grid, `group-*`, `peer-*`, `has-[...]`, container queries, pseudo-elements, gradients, filters and transitions. Values in brackets must be in `px` or `rem`. See [React Native](/react-native).

## Values follow Tailwind CSS v4.3 {#values-follow-tailwind-css-v43}

If you're coming from Tailwind CSS v3, these values changed in v4, and Kbach follows v4:

- `rounded-sm` is 0.25rem (v3's 0.125rem is now `rounded-xs`).
- `shadow-sm` is a two-layer shadow (v3's `shadow-sm` is `shadow-xs`).
- `blur-sm` and `backdrop-blur-sm` are 8px.
- A bare `ring` is 1px in the current text color. For v3's look, write `ring-3 ring-blue-6/50`.
- `outline` is 1px, and `outline-2` draws a solid outline by itself.
- Text sizes set a line height, which any `leading-*` class overrides, in either order.
- A bare `transition` animates colors, opacity, shadows and transforms, not width and height. Use `transition-all` for everything.

---

Tailwind CSS is a trademark of Tailwind Labs Inc. Kbach is an independent project and is not affiliated with, sponsored by, or endorsed by Tailwind Labs. Kbach's default theme values derived from Tailwind CSS are used under the MIT License; see `THIRD_PARTY_NOTICES.md` in each package.
