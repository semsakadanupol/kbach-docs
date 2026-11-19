---
title: Theme colors
description: Add your own colors with extend.colors. Point at palette colors, add opacity, and give one color a light and a dark value.
---

## Add a color

```js title="kbach.config.js"
export default {
  extend: {
    colors: {
      brand: '#ff6b35',
    },
  },
};
```

Every color utility now accepts it: `bg-brand`, `text-brand`, `border-brand/40`, `from-brand`, `ring-brand`.

## Point at another color

A value can name a palette color, or a color defined earlier in the same object, with an optional opacity from 0 to 100:

```js
colors: {
  brand: '#ff6b35',          // a literal color
  accent: 'orange-5',        // a palette color
  accentSoft: 'orange-5/50', // ...at 50% opacity
  brandSoft: 'brand/30',     // brand, defined above, at 30%
  danger: 'red',             // not a color name, so it's used as CSS: red
}
```

References resolve in order, so define a color before you point at it. A value that isn't a known color name is used as a plain CSS value, never an error.

## Colors for light and dark mode

A **mode-aware** color has one value per mode. `bg-surface` then switches by itself, with no `dark:` prefix. There are two ways to write one.

Per color, when only a few are mode-aware. This form works on the web and in plain HTML, not on React Native:

```js
colors: {
  surface: { light: '#f9fafb', dark: '#111827' },
  tile: { light: 'gray-2', dark: 'gray-11' }, // palette references work too
}
```

As a group, when most of them are. This form works everywhere, React Native included:

```js
colors: {
  surface: 'gray-2',
  card: 'white',
  brand: '#ff6b35', // not under dark, so it's the same in both modes
  dark: {
    surface: 'gray-11',
    card: 'gray-9',
  },
}
```

`dark` here is a reserved key, not a color name. A name under `dark` needs a matching entry outside it; one without is skipped.

```preview
<div class="flex flex-wrap gap-3">
  <div class="rounded-xl bg-surface px-4 py-3 text-sm font-medium text-gray-11 ring-1 ring-gray-3 dark:text-gray-2 dark:ring-gray-9">bg-surface, a built-in mode-aware color</div>
</div>
```

### How they work on the web

A mode-aware hex color compiles to a CSS variable. `bg-surface` becomes `background-color: rgb(var(--kb-color-surface))`, and the generated CSS defines `--kb-color-surface` once for light mode and once under your dark-mode selector. The switch costs nothing: no re-render and no extra classes.

Opacity works on them through `color-mix()`, so `bg-surface/80` and `text-ink/60` are fine.

> [!NOTE]
> In `@kbach/react` 1.0.0-beta.28 and earlier, the static build gave a mode-aware color class no style when it was written as a plain `className`. If `bg-surface` does nothing in your project, upgrade.

### On React Native

On native, a mode-aware color resolves to its light or dark value for the current color scheme each time the element renders. Use the grouped `dark` form there: React Native's config merge doesn't read the per-color `{ light, dark }` form yet.

## Reading theme colors in code

```tsx
import { useColors } from '@kbach/react';

const colors = useColors();
colors.get('brand');   // '#ff6b35'
colors.surface;        // 'rgb(var(--kb-color-surface))' on the web
```
