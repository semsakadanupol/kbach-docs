---
title: Borders
description: Border radius, width, color and style, outlines, and dividers between children.
---

The reset gives every element a solid border in the text color with a width of 0, so `border` or `border-2` alone draws a visible line.

## Border radius

`rounded-*` rounds all corners; `rounded-t-*`, `-r-`, `-b-` and `-l-` round one side, `rounded-tl-*` and the like one corner, and `rounded-s-*` / `rounded-e-*` follow the writing direction.

::classes rounded-none rounded-xs rounded-sm rounded rounded-md rounded-lg rounded-xl rounded-2xl rounded-3xl rounded-4xl rounded-full rounded-t-lg rounded-r-lg rounded-b-lg rounded-l-lg rounded-tl-lg rounded-br-lg rounded-s-lg rounded-e-lg rounded-[12px]

```preview
<div class="flex flex-wrap gap-4 font-mono text-xs text-white">
  <div class="grid size-20 place-items-center rounded-sm bg-sky-6">sm</div>
  <div class="grid size-20 place-items-center rounded-lg bg-sky-6">lg</div>
  <div class="grid size-20 place-items-center rounded-2xl bg-sky-6">2xl</div>
  <div class="grid size-20 place-items-center rounded-full bg-sky-6">full</div>
  <div class="grid size-20 place-items-center rounded-t-2xl bg-violet-6">t-2xl</div>
  <div class="grid size-20 place-items-center rounded-tl-3xl rounded-br-3xl bg-pink-6">tl br</div>
</div>
```

## Border width

A bare `border` is 1px; numbers are pixels. `border-x`, `border-t` and the rest set some sides only.

::classes border-0 border border-2 border-4 border-8 border-x border-y border-t border-r border-b border-l border-s border-e border-t-4 border-[3px]

```preview
<div class="flex flex-wrap gap-4 font-mono text-xs text-gray-12 dark:text-white">
  <div class="grid size-20 place-items-center rounded-lg border border-sky-6">border</div>
  <div class="grid size-20 place-items-center rounded-lg border-2 border-sky-6">border-2</div>
  <div class="grid size-20 place-items-center rounded-lg border-4 border-sky-6">border-4</div>
  <div class="grid size-20 place-items-center rounded-lg border-b-4 border-sky-6 bg-gray-1 dark:bg-gray-9">border-b-4</div>
</div>
```

## Border color

Every palette color, with opacity. `border-x-*`, `border-t-*` and the rest color one side.

::classes border-gray-3 border-sky-6 border-sky-6/50 border-transparent border-current border-black border-white border-x-sky-6 border-t-pink-6

## Border style

::classes border-solid border-dashed border-dotted border-double border-hidden border-none

```preview
<div class="flex flex-wrap gap-4 font-mono text-xs text-gray-12 dark:text-white">
  <div class="grid h-16 w-28 place-items-center rounded-lg border-2 border-solid border-sky-6">solid</div>
  <div class="grid h-16 w-28 place-items-center rounded-lg border-2 border-dashed border-sky-6">dashed</div>
  <div class="grid h-16 w-28 place-items-center rounded-lg border-2 border-dotted border-sky-6">dotted</div>
  <div class="grid h-16 w-28 place-items-center rounded-lg border-4 border-double border-sky-6">double</div>
</div>
```

## Divide

Lines between children, without one before the first or after the last. `divide-x` for a row, `divide-y` for a column.

::classes divide-x divide-y divide-x-2 divide-y-4 divide-x-reverse divide-y-reverse divide-gray-3 divide-sky-6 divide-dashed divide-dotted

```preview
<ul class="max-w-sm divide-y divide-gray-3 rounded-xl border border-gray-3 dark:divide-gray-8 dark:border-gray-8">
  <li class="flex items-center justify-between px-4 py-3 text-sm"><span class="font-medium text-gray-12 dark:text-white">@kbach/react</span><span class="text-gray-7 dark:text-gray-4">web</span></li>
  <li class="flex items-center justify-between px-4 py-3 text-sm"><span class="font-medium text-gray-12 dark:text-white">@kbach/react-native</span><span class="text-gray-7 dark:text-gray-4">native</span></li>
  <li class="flex items-center justify-between px-4 py-3 text-sm"><span class="font-medium text-gray-12 dark:text-white">@kbach/browser</span><span class="text-gray-7 dark:text-gray-4">HTML</span></li>
</ul>
```

## Outline width, color and style

An outline sits outside the border and takes no space. `outline-hidden` removes it in a way that still shows in Windows high-contrast mode.

::classes outline outline-0 outline-1 outline-2 outline-4 outline-sky-6 outline-solid outline-dashed outline-dotted outline-double outline-none outline-hidden

## Outline offset

The gap between the outline and the edge.

::classes outline-offset-0 outline-offset-1 outline-offset-2 outline-offset-4 -outline-offset-2

```preview
<div class="flex flex-wrap gap-6">
  <button class="rounded-lg bg-sky-6 px-4 py-2 text-sm font-semibold text-white outline-2 outline-offset-2 outline-sky-6">outline-offset-2</button>
  <button class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-12 outline-2 outline-dashed outline-offset-4 outline-violet-6 dark:bg-gray-9 dark:text-white">dashed, offset-4</button>
  <button class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-12 shadow-sm ring-1 ring-gray-3 hover:bg-gray-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-5 dark:bg-gray-9 dark:text-white dark:ring-gray-8">Tab to me</button>
</div>
```
