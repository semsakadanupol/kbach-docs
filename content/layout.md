---
title: Layout
description: Display, position, overflow, z-index, aspect ratio, columns, object fit and the other utilities that decide where a box goes and how it sits.
---

Every table on these pages is made by the engine as you read it, with Kbach's default theme, so what you see is the CSS a new project gets. A class marked **Web only** does nothing on React Native; see [React Native](/react-native).

## Display

Sets how a box takes part in layout. `hidden` removes it; `sr-only` hides it from sight but not from screen readers (see [Accessibility](/accessibility)).

::classes block inline-block inline flex inline-flex grid inline-grid flow-root contents table inline-table table-row table-cell table-caption list-item hidden

```preview
<div class="space-y-3 text-sm text-gray-8 dark:text-gray-3">
  <p>
    This text has an <span class="inline-block rounded-md bg-sky-2 px-2 py-0.5 font-medium text-sky-10 dark:bg-sky-10 dark:text-sky-2">inline-block</span>
    box that takes padding but stays in the line, and an <span class="inline rounded-md bg-amber-2 px-2 py-0.5 font-medium text-amber-10 dark:bg-amber-10 dark:text-amber-2">inline</span> one that flows with it.
  </p>
  <div class="block rounded-md bg-violet-2 px-3 py-2 font-medium text-violet-10 dark:bg-violet-10 dark:text-violet-2">block takes the whole line</div>
  <div class="flex gap-2">
    <div class="rounded-md bg-emerald-6 px-3 py-2 font-medium text-white">flex</div>
    <div class="rounded-md bg-emerald-6 px-3 py-2 font-medium text-white">puts children</div>
    <div class="rounded-md bg-emerald-6 px-3 py-2 font-medium text-white">in a row</div>
  </div>
</div>
```

## Position

`absolute` takes a box out of the normal flow, so you can place it with `top`, `right`, `bottom` and `left`. Those are measured from the nearest parent that has `relative` (or another position). `fixed` measures from the window instead, and `sticky` keeps a box in view while the page scrolls past it.

::classes static relative absolute fixed sticky

```preview
<div class="relative h-40 rounded-xl border-2 border-dashed border-gray-4 bg-gray-1 p-4 text-sm text-gray-8 dark:border-gray-7 dark:bg-gray-9 dark:text-gray-3">
  <p class="font-medium">relative parent</p>
  <div class="absolute right-4 bottom-4 rounded-lg bg-sky-6 px-3 py-2 font-medium text-white shadow-lg">absolute, right-4 bottom-4</div>
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-violet-6 px-3 py-2 font-medium text-white shadow-lg">centered</div>
</div>
```

## Top, right, bottom and left

Where a positioned box sits: in steps of 4px, as fractions, or `full`. `inset-*` sets all four sides at once, `inset-x-*` and `inset-y-*` set two. `start-*` and `end-*` follow the writing direction. A minus sign in front makes the value negative.

::classes inset-0 inset-x-0 inset-y-0 inset-4 inset-1/2 inset-full top-0 top-4 top-1/2 right-0 bottom-0 left-0 left-full start-0 end-4 -top-2 inset-auto top-[3px]

```preview
<div class="flex flex-wrap gap-6">
  <div class="relative size-24 rounded-xl bg-gray-2 dark:bg-gray-9"><div class="absolute top-0 left-0 size-8 rounded-lg bg-sky-6"></div></div>
  <div class="relative size-24 rounded-xl bg-gray-2 dark:bg-gray-9"><div class="absolute inset-x-0 top-0 h-8 rounded-lg bg-sky-6"></div></div>
  <div class="relative size-24 rounded-xl bg-gray-2 dark:bg-gray-9"><div class="absolute inset-y-0 right-0 w-8 rounded-lg bg-sky-6"></div></div>
  <div class="relative size-24 rounded-xl bg-gray-2 dark:bg-gray-9"><div class="absolute inset-4 rounded-lg bg-sky-6"></div></div>
  <div class="relative size-24 rounded-xl bg-gray-2 dark:bg-gray-9"><div class="absolute -top-2 -right-2 size-8 rounded-full bg-rose-6 ring-4 ring-white dark:ring-gray-10"></div></div>
</div>
```

## Z-index

When positioned boxes overlap, the one with the higher number is drawn on top. `-z-*` sends a box behind the others.

::classes z-0 z-10 z-20 z-30 z-40 z-50 z-auto -z-10 z-[100]

```preview
<div class="flex -space-x-4">
  <div class="relative z-40 grid size-16 place-items-center rounded-full bg-sky-6 font-semibold text-white ring-4 ring-white dark:ring-gray-10">40</div>
  <div class="relative z-30 grid size-16 place-items-center rounded-full bg-violet-6 font-semibold text-white ring-4 ring-white dark:ring-gray-10">30</div>
  <div class="relative z-20 grid size-16 place-items-center rounded-full bg-pink-6 font-semibold text-white ring-4 ring-white dark:ring-gray-10">20</div>
  <div class="relative z-10 grid size-16 place-items-center rounded-full bg-amber-6 font-semibold text-white ring-4 ring-white dark:ring-gray-10">10</div>
</div>
```

## Overflow

What happens to content that doesn't fit: clipped, scrollable, or left to spill out. `overflow-x-*` and `overflow-y-*` handle one direction.

::classes overflow-auto overflow-hidden overflow-clip overflow-visible overflow-scroll overflow-x-auto overflow-y-auto overflow-y-scroll

```preview
<div class="grid gap-4 sm:grid-cols-2">
  <div class="h-28 overflow-hidden rounded-xl bg-gray-1 p-3 text-sm text-gray-8 ring-1 ring-gray-3 dark:bg-gray-9 dark:text-gray-3 dark:ring-gray-8">
    <p class="mb-1 font-semibold text-gray-12 dark:text-white">overflow-hidden</p>
    Kbach turns utility classes into CSS on the web and into style objects on native, all from one Rust engine. This line is cut off where the box ends.
  </div>
  <div class="h-28 overflow-y-auto rounded-xl bg-gray-1 p-3 text-sm text-gray-8 ring-1 ring-gray-3 dark:bg-gray-9 dark:text-gray-3 dark:ring-gray-8">
    <p class="mb-1 font-semibold text-gray-12 dark:text-white">overflow-y-auto</p>
    Kbach turns utility classes into CSS on the web and into style objects on native, all from one Rust engine. This box scrolls instead, so nothing is lost.
  </div>
</div>
```

## Overscroll behavior

Whether scrolling past the end of a box carries on to the page behind it. `overscroll-contain` keeps a scrolling panel from dragging the page along.

::classes overscroll-auto overscroll-contain overscroll-none overscroll-y-contain overscroll-x-none

## Aspect ratio

Keeps a box's width and height in proportion. Use a fraction in brackets for any other ratio.

::classes aspect-square aspect-video aspect-auto aspect-[4/3]

```preview
<div class="grid grid-cols-3 gap-4 text-xs font-medium text-white">
  <div class="aspect-square grid place-items-center rounded-xl bg-sky-6">aspect-square</div>
  <div class="aspect-video grid place-items-center rounded-xl bg-violet-6">aspect-video</div>
  <div class="aspect-[4/3] grid place-items-center rounded-xl bg-pink-6">aspect-[4/3]</div>
</div>
```

## Object fit and position

How an image or video fills its box. `object-cover` crops to fill, `object-contain` fits it all in. `object-*` positions decide which part stays in view.

::classes object-contain object-cover object-fill object-none object-scale-down object-center object-top object-bottom object-left object-right-top object-[25%_75%]

```preview
<div class="grid grid-cols-3 gap-4 text-center font-mono text-xs text-gray-7 dark:text-gray-4">
  <figure>
    <img alt="" class="h-36 w-full rounded-xl bg-gray-2 object-cover dark:bg-gray-9" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'><rect width='400' height='200' fill='%237dd3fc'/><circle cx='200' cy='110' r='70' fill='%230369a1'/><circle cx='340' cy='50' r='30' fill='%23f59e0b'/></svg>" />
    <figcaption class="mt-2">object-cover</figcaption>
  </figure>
  <figure>
    <img alt="" class="h-36 w-full rounded-xl bg-gray-2 object-contain dark:bg-gray-9" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'><rect width='400' height='200' fill='%237dd3fc'/><circle cx='200' cy='110' r='70' fill='%230369a1'/><circle cx='340' cy='50' r='30' fill='%23f59e0b'/></svg>" />
    <figcaption class="mt-2">object-contain</figcaption>
  </figure>
  <figure>
    <img alt="" class="h-36 w-full rounded-xl bg-gray-2 object-fill dark:bg-gray-9" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'><rect width='400' height='200' fill='%237dd3fc'/><circle cx='200' cy='110' r='70' fill='%230369a1'/><circle cx='340' cy='50' r='30' fill='%23f59e0b'/></svg>" />
    <figcaption class="mt-2">object-fill</figcaption>
  </figure>
</div>
```

## Columns

Flows content into newspaper-style columns: a count (`columns-3`) or a column width (`columns-xs`), with as many columns as fit.

::classes columns-1 columns-2 columns-3 columns-4 columns-auto columns-3xs columns-xs columns-sm columns-[10rem]

```preview
<div class="columns-2 gap-6 text-sm leading-6 text-gray-8 sm:columns-3 dark:text-gray-3">
  <p class="mb-3">Kbach reads class names from your source at build time and writes the CSS they need to one file.</p>
  <p class="mb-3">On React Native, the same names become style objects when each element renders.</p>
  <p class="mb-3">In a plain HTML page, one script tag does the same thing in the browser.</p>
  <p class="mb-3">Colors have 12 shades, 1 the lightest and 12 the darkest.</p>
  <p class="mb-3">Variants like hover:, md: and dark: go in front of any class.</p>
  <p>Arbitrary values in brackets cover anything the scale doesn't.</p>
</div>
```

## Break before, after and inside

Where a column or page break may fall, for multi-column layouts and printing.

::classes break-before-auto break-before-page break-before-column break-after-avoid break-after-page break-inside-auto break-inside-avoid break-inside-avoid-page

## Box sizing

`box-border` counts padding and border inside the width you set (the reset already does this for every element); `box-content` adds them on top.

::classes box-border box-content

## Box decoration break

When an inline box breaks across lines, `box-decoration-clone` gives every piece its own padding, border and background.

::classes box-decoration-clone box-decoration-slice

```preview
<p class="max-w-56 text-lg font-semibold leading-9">
  <span class="box-decoration-clone rounded-lg bg-linear-to-r from-sky-5 to-violet-6 px-2 py-1 text-white">One class set, three platforms</span>
</p>
```

## Float and clear

`float-*` moves a box to one side with text wrapping around it; `clear-*` starts below any floats.

::classes float-left float-right float-start float-end float-none clear-left clear-right clear-both clear-start clear-end clear-none

```preview
<div class="flow-root text-sm leading-6 text-gray-8 dark:text-gray-3">
  <div class="float-left mr-4 mb-2 grid size-20 place-items-center rounded-xl bg-amber-5 text-2xl font-bold text-white">K</div>
  <p>The box on the left floats, so this text wraps around it. Kbach writes CSS for exactly the classes your files use, in a stable order, so the same classes always give the same stylesheet. Nothing runs in the browser to style the page.</p>
</div>
```

## Isolation

`isolate` keeps the `z-*` order and blend modes of the boxes inside it from mixing with the rest of the page.

::classes isolate isolation-auto

## Visibility

`invisible` hides a box but keeps its space; `hidden` (under Display) removes it.

::classes visible invisible collapse

```preview
<div class="flex gap-3 text-sm font-medium text-white">
  <div class="rounded-lg bg-sky-6 px-4 py-2">one</div>
  <div class="invisible rounded-lg bg-sky-6 px-4 py-2">two</div>
  <div class="rounded-lg bg-sky-6 px-4 py-2">three</div>
</div>
```

## Container

`container` makes a box full width, but no wider than the current screen size (640px, 768px and so on). Add `mx-auto` to center it and `px-*` for room at the sides.

::classes container
