---
title: Spacing, screens and fonts
nav: Spacing, screens, fonts
description: Extend the spacing scale, add breakpoints, name your font stacks and set up the container class.
---

## Spacing

Add steps to the spacing scale. Values are in pixels:

```js title="kbach.config.js"
export default {
  extend: {
    spacing: {
      13: 52,
      128: 512,
    },
  },
};
```

Now `p-13`, `mt-128`, `w-128`, `gap-13` and every other spacing utility accept them.

## Screens

Breakpoints are in pixels too. Add your own, or change a built-in one:

```js
extend: {
  screens: {
    tablet: 900,
    '3xl': 1920,
    md: 800,
  },
}
```

Now `tablet:` applies from 900px, `3xl:flex-row` from 1920px, and `md:` from 800px instead of 768px. A name that starts with a digit, like `3xl`, must be quoted.

Every breakpoint, built in or yours, also has a `max-` form that applies **below** it:

```html
<nav class="hidden md:flex">...</nav>       <!-- 768px and up -->
<button class="max-md:block hidden">...</button>  <!-- under 768px -->
<aside class="md:max-xl:w-64">...</aside>    <!-- from 768px up to 1280px -->
```

| Name | Default |
| :-- | :-- |
| `sm` | 640 |
| `md` | 768 |
| `lg` | 1024 |
| `xl` | 1280 |
| `2xl` | 1536 |

React Native uses the same breakpoints against the window width.

## Fonts

Name a font stack, then use it as `font-<name>`:

```js
extend: {
  fontFamily: {
    display: '"Cal Sans", "Inter", sans-serif',
    sans: '"Inter", ui-sans-serif, system-ui, sans-serif', // replaces the default sans
  },
}
```

The built-in names are `sans`, `serif` and `mono`. Kbach doesn't load the font files: add them yourself, from Google Fonts or `@font-face`.

On React Native, only the first name in the stack is used, so the same config works on Expo Web and on a device.

## Container

`container` sets `max-width` to the current breakpoint. Center it and add side padding in the config:

```js
extend: {
  container: {
    center: true,
    padding: '2rem',
  },
}
```

```html
<main class="container">...</main>
```
