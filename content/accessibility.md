---
title: Accessibility
description: Screen-reader-only text, forced color adjust, and the variants that respond to how people set up their devices.
---

## Screen readers

`sr-only` hides an element from sight but keeps it for screen readers: a label for an icon-only button, for example. `not-sr-only` shows it again, often at a breakpoint (`sm:not-sr-only`).

::classes sr-only not-sr-only

```preview
<button class="grid size-10 place-items-center rounded-lg bg-gray-1 text-gray-12 transition-colors hover:bg-gray-2 dark:bg-gray-9 dark:text-white dark:hover:bg-gray-8">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-5"><path d="M6 6l12 12M18 6 6 18"/></svg>
  <span class="sr-only">Close the dialog</span>
</button>
```

## Forced color adjust

In Windows high-contrast mode, the system replaces your colors. `forced-color-adjust-none` keeps them on an element whose colors carry meaning, like a color swatch.

::classes forced-color-adjust-auto forced-color-adjust-none

```preview
<div class="flex gap-2">
  <span class="size-8 rounded-full bg-sky-6 forced-color-adjust-none" title="Sky"></span>
  <span class="size-8 rounded-full bg-violet-6 forced-color-adjust-none" title="Violet"></span>
  <span class="size-8 rounded-full bg-pink-6 forced-color-adjust-none" title="Pink"></span>
</div>
```

## Focus you can see

Keyboard users need to see where they are. `focus-visible:` shows a style when focus came from the keyboard, not from a click, so mouse users don't get a ring they didn't ask for.

```preview
<div class="flex flex-wrap gap-3">
  <button class="rounded-lg bg-sky-6 px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-6">Tab to me</button>
  <a href="#" class="rounded-md text-sm font-medium text-sky-7 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-6 dark:text-sky-4">And to me</a>
</div>
```

## Variants for people's settings

These go in front of any class, so a design can follow what someone has set on their device:

| Variant | Applies when |
| :-- | :-- |
| `motion-reduce:` / `motion-safe:` | They asked for less motion / they didn't |
| `contrast-more:` / `contrast-less:` | They asked for more / less contrast |
| `dark:` | Dark mode is on (see [Dark mode](/dark-mode)) |
| `print:` | The page is printed |
| `aria-*:` | An `aria-` attribute is set, e.g. `aria-expanded:rotate-180` |

```preview
<div class="flex flex-wrap items-center gap-6">
  <span class="relative flex size-4"><span class="absolute inline-flex size-full rounded-full bg-emerald-5 opacity-75 motion-safe:animate-ping"></span><span class="relative size-4 rounded-full bg-emerald-6"></span></span>
  <p class="text-sm text-gray-7 contrast-more:text-gray-12 dark:text-gray-4 dark:contrast-more:text-white">This text gets darker with more contrast.</p>
</div>
```
