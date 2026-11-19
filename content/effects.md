---
title: Effects
description: Box shadows, rings, inset shadows, text shadows, opacity, blend modes and masks.
---

Shadows, inset shadows, rings and ring offsets all draw in one `box-shadow`, so `shadow-lg ring-2 ring-offset-4` adds up instead of one replacing the other.

## Box shadow

::classes shadow-2xs shadow-xs shadow-sm shadow-md shadow-lg shadow-xl shadow-2xl shadow-inner shadow-none

```preview
<div class="flex flex-wrap gap-6">
  <div class="grid size-24 place-items-center rounded-xl bg-white font-mono text-xs text-gray-8 shadow-sm dark:bg-gray-8 dark:text-gray-3">shadow-sm</div>
  <div class="grid size-24 place-items-center rounded-xl bg-white font-mono text-xs text-gray-8 shadow-md dark:bg-gray-8 dark:text-gray-3">shadow-md</div>
  <div class="grid size-24 place-items-center rounded-xl bg-white font-mono text-xs text-gray-8 shadow-lg dark:bg-gray-8 dark:text-gray-3">shadow-lg</div>
  <div class="grid size-24 place-items-center rounded-xl bg-white font-mono text-xs text-gray-8 shadow-2xl dark:bg-gray-8 dark:text-gray-3">shadow-2xl</div>
</div>
```

## Shadow color

A colored shadow; the slash sets its opacity.

::classes shadow-black/20 shadow-sky-6 shadow-sky-6/40 shadow-pink-6/50

```preview
<div class="flex flex-wrap gap-6">
  <button class="rounded-xl bg-sky-6 px-5 py-3 font-semibold text-white shadow-lg shadow-sky-6/40">shadow-sky-6/40</button>
  <button class="rounded-xl bg-pink-6 px-5 py-3 font-semibold text-white shadow-lg shadow-pink-6/50">shadow-pink-6/50</button>
</div>
```

## Inset shadow

A shadow inside the box, as if pressed in.

::classes inset-shadow-2xs inset-shadow-xs inset-shadow-sm inset-shadow-none inset-shadow-sky-6

```preview
<div class="flex flex-wrap gap-6">
  <div class="grid size-24 place-items-center rounded-xl bg-gray-1 font-mono text-xs text-gray-8 inset-shadow-sm dark:bg-gray-9 dark:text-gray-3">inset-shadow-sm</div>
  <input placeholder="An input" class="h-10 rounded-lg bg-gray-1 px-3 text-sm text-gray-12 inset-shadow-xs ring-1 ring-gray-3 dark:bg-gray-9 dark:text-white dark:ring-gray-8" />
</div>
```

## Ring

A solid outline drawn with box-shadow: it follows the rounded corners and doesn't change the box's size. A bare `ring` is 1px in the text color.

::classes ring-0 ring ring-1 ring-2 ring-4 ring-8 ring-inset ring-sky-6 ring-sky-6/50 inset-ring inset-ring-2 inset-ring-sky-6

```preview
<div class="flex flex-wrap items-center gap-6">
  <div class="size-16 rounded-xl bg-white ring-1 ring-gray-3 dark:bg-gray-9 dark:ring-gray-7"></div>
  <div class="size-16 rounded-xl bg-white ring-2 ring-sky-6 dark:bg-gray-9"></div>
  <div class="size-16 rounded-full bg-white ring-4 ring-violet-6/50 dark:bg-gray-9"></div>
  <div class="size-16 rounded-xl bg-sky-2 inset-ring-2 inset-ring-sky-6 dark:bg-sky-10"></div>
</div>
```

## Ring offset

A gap between the box and its ring, filled with the offset color (match it to the background behind).

::classes ring-offset-0 ring-offset-1 ring-offset-2 ring-offset-4 ring-offset-8 ring-offset-white ring-offset-gray-10

```preview
<div class="flex flex-wrap items-center gap-8">
  <div class="size-14 rounded-full bg-amber-5 ring-2 ring-amber-5 ring-offset-2 ring-offset-white dark:ring-offset-gray-10"></div>
  <div class="size-14 rounded-full bg-sky-6 ring-2 ring-sky-6 ring-offset-4 ring-offset-white dark:ring-offset-gray-10"></div>
</div>
```

## Text shadow

::classes text-shadow-2xs text-shadow-xs text-shadow-sm text-shadow-md text-shadow-lg text-shadow-none text-shadow-sky-6

```preview
<div class="space-y-2 text-3xl font-bold text-gray-12 dark:text-white">
  <p class="text-shadow-sm">text-shadow-sm</p>
  <p class="text-shadow-lg">text-shadow-lg</p>
  <p class="text-white text-shadow-lg text-shadow-sky-6">text-shadow-sky-6</p>
</div>
```

## Opacity

How see-through the whole box is, content included. For a see-through background only, use a color with a slash: `bg-black/50`.

::classes opacity-0 opacity-5 opacity-25 opacity-50 opacity-75 opacity-100

```preview
<div class="flex gap-4">
  <div class="size-16 rounded-xl bg-sky-6 opacity-100"></div>
  <div class="size-16 rounded-xl bg-sky-6 opacity-75"></div>
  <div class="size-16 rounded-xl bg-sky-6 opacity-50"></div>
  <div class="size-16 rounded-xl bg-sky-6 opacity-25"></div>
</div>
```

## Mix and background blend mode

`mix-blend-*` blends a box with what's behind it; `bg-blend-*` blends a box's own background layers.

::classes mix-blend-normal mix-blend-multiply mix-blend-screen mix-blend-overlay mix-blend-darken mix-blend-lighten mix-blend-difference mix-blend-plus-lighter bg-blend-normal bg-blend-multiply bg-blend-screen bg-blend-overlay

```preview
<div class="isolate flex">
  <div class="size-24 rounded-full bg-sky-5 mix-blend-multiply"></div>
  <div class="-ml-8 size-24 rounded-full bg-pink-5 mix-blend-multiply"></div>
  <div class="-ml-8 size-24 rounded-full bg-amber-4 mix-blend-multiply"></div>
</div>
```

## Mask

Fades part of a box out. `mask-b-from-50%` keeps the top half and fades out the bottom; `mask-radial-*` fades from the middle outwards. Several mask classes combine.

::classes mask-t-from-50% mask-b-from-50% mask-b-to-80% mask-l-from-0% mask-x-from-70% mask-y-from-70% mask-radial-from-40% mask-radial-to-80% mask-conic-from-60%

```preview
<div class="grid grid-cols-3 gap-4">
  <div class="h-28 rounded-xl bg-linear-to-br from-sky-4 to-violet-6 mask-b-from-40%"></div>
  <div class="h-28 rounded-xl bg-linear-to-br from-sky-4 to-violet-6 mask-x-from-60%"></div>
  <div class="h-28 rounded-xl bg-linear-to-br from-sky-4 to-violet-6 mask-radial-from-30%"></div>
</div>
```
