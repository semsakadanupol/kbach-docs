---
title: Colors
description: 26 color families with 12 shades each, a few single colors, and a way to make any color see-through.
---

## The palette {#the-palette}

A color class is a utility, a color name and a shade: `bg-blue-6` is a blue background, `text-gray-12` is almost-black text, `border-rose-3` is a light pink border.

Every color family has 12 shades, from `1` (the lightest) to `12` (the darkest). Click a swatch to copy its name, like `blue-6`:

::palette

The families are amber, blue, cyan, emerald, fuchsia, gray, green, indigo, lime, mauve, mist, neutral, olive, orange, pink, purple, red, rose, sky, slate, stone, taupe, teal, violet, yellow and zinc. The grays (gray, mauve, mist, neutral, olive, slate, stone, taupe, zinc) differ only in how warm or cool they are.

## Choosing a shade {#choosing-a-shade}

A simple way to use the scale:

| Shades | Good for |
| :-- | :-- |
| `1` to `3` | Page and card backgrounds, subtle tints |
| `3` to `5` | Borders and dividers |
| `5` to `7` | Buttons, links and other accents |
| `7` and `8` | The same accents on hover or when pressed |
| `9` to `12` | Text, and backgrounds in dark mode |

For readable text on a light background, use shade `7` or darker. On a dark background, use shade `4` or lighter.

If you're used to shades from 50 to 950, this is how they map:

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| `1` | `2` | `3` | `4` | `5` | `6` | `7` | `8` | `9` | `10` | `11` |

`12` is darker than any of them. `text-amber-700` doesn't exist in Kbach and draws nothing; write `text-amber-8`.

## Where colors go {#where-colors-go}

Every utility that sets a color takes the same names: `bg-` (background), `text-`, `border-`, `ring-`, `outline-`, `shadow-`, `divide-`, `decoration-` (underlines), `fill-` and `stroke-` (SVG), `accent-` (checkboxes and sliders), `caret-` (the text cursor), and `from-`, `via-` and `to-` (gradients).

## Single colors {#single-colors}

| Class name | Value |
| :-- | :-- |
| `white` | `#ffffff` |
| `black` | `#000000` |
| `transparent` | Fully see-through |
| `gold` | `#d4af37` |
| `silver` | `#c0c0c0` |
| `bronze` | `#cd7f32` |
| `copper` | `#b87333` |
| `coal` | `#1c1c1c` |
| `current` | The element's text color (web only) |
| `inherit` | The parent's value (web only) |
| `surface` | `#f9fafb` in light mode, `#111827` in dark mode (web only) |

`surface` is **mode-aware**: one class with a light and a dark value, so `bg-surface` switches by itself, with no `dark:` class. You can make your own mode-aware colors, on every platform: see [Theme colors](/theme-colors).

## See-through colors {#opacity}

Add a slash and a number from 0 to 100 to make a color see-through. `0` is invisible and `100` is solid:

```preview
<div class="flex gap-3">
  <div class="size-16 rounded-xl bg-violet-6"></div>
  <div class="size-16 rounded-xl bg-violet-6/75"></div>
  <div class="size-16 rounded-xl bg-violet-6/50"></div>
  <div class="size-16 rounded-xl bg-violet-6/25"></div>
  <div class="size-16 rounded-xl bg-violet-6/10"></div>
</div>
```

```html
<div class="bg-black/50 text-white/90 border-gray-12/10"></div>
```

It works on every color, including your own and mode-aware ones (`bg-surface/80`). The number can have a decimal point (`bg-white/2.5`), and in brackets it can be a fraction or a percentage (`bg-black/[0.37]`, `bg-black/[37%]`). On the web it can also be a CSS variable that holds a percentage: `bg-black/(--overlay)`.

## Any other color {#any-other-color}

For a color that isn't in the palette, put it in square brackets: `bg-[#c7a25d]`, `text-[rgb(20_30_40)]`. A see-through version works the same way: `bg-[#c7a25d]/40`. Use an underscore where the color has a space.

If you use a color often, give it a name in `kbach.config.js` instead, so you can write `bg-brand`: see [Theme colors](/theme-colors).

## Colors in JavaScript {#colors-in-javascript}

Sometimes you need a color as a value, not a class: for a chart, a canvas, or a component that takes a color prop. `useColors()` gives you the palette:

```tsx
import { useColors } from '@kbach/react'; // or '@kbach/react-native'

function Chart() {
  const colors = useColors();
  colors.blue[6];               // '#3b82f6'
  colors.blue['6/50'];          // blue-6, half see-through
  colors.alpha('#3b82f6', 30);  // any color, 30% solid
  colors.get('brand');          // a color from your kbach.config.js
  return null;
}
```

On the web, a mode-aware color comes back as `rgb(var(--kb-color-<name>))`, a CSS value that follows light and dark mode by itself.
