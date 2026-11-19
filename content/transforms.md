---
title: Transforms
description: Translate, rotate, scale and skew in 2D and 3D, transform origin, perspective and backface visibility.
---

`translate-*`, `rotate-*`, `scale-*` and `skew-*` all go into one `transform`, so they add up in any order: `rotate-6 scale-110` both apply.

## Translate

Moves a box without changing the layout around it: the spacing scale, fractions of the box's own size, or `full`.

::classes translate-x-0 translate-x-4 translate-x-1/2 translate-x-full -translate-x-1/2 translate-y-2 -translate-y-full translate-z-8 translate-full translate-none translate-[10px]

```preview
<div class="flex flex-wrap gap-8">
  <div class="size-20 rounded-xl bg-gray-2 dark:bg-gray-9"><div class="size-20 translate-x-4 translate-y-4 rounded-xl bg-sky-6/80"></div></div>
  <div class="size-20 rounded-xl bg-gray-2 dark:bg-gray-9"><div class="size-20 -translate-y-1/4 rounded-xl bg-violet-6/80"></div></div>
</div>
```

## Rotate

Degrees, positive for clockwise. `rotate-x-*` and `rotate-y-*` turn in 3D (pair them with a perspective).

::classes rotate-0 rotate-1 rotate-3 rotate-6 rotate-12 rotate-45 rotate-90 rotate-180 -rotate-12 rotate-x-50 rotate-y-25 rotate-z-45 rotate-[17deg]

```preview
<div class="flex flex-wrap gap-10 p-2">
  <div class="grid size-20 rotate-6 place-items-center rounded-xl bg-sky-6 font-mono text-xs text-white">rotate-6</div>
  <div class="grid size-20 rotate-45 place-items-center rounded-xl bg-violet-6 font-mono text-xs text-white">rotate-45</div>
  <div class="grid size-20 -rotate-12 place-items-center rounded-xl bg-pink-6 font-mono text-xs text-white">-rotate-12</div>
</div>
```

## Scale

A percentage: `scale-110` is 110%. `scale-x-*` and `scale-y-*` stretch one way; a minus sign flips.

::classes scale-0 scale-50 scale-75 scale-90 scale-95 scale-100 scale-105 scale-110 scale-125 scale-150 scale-x-50 scale-y-125 -scale-x-100

```preview
<div class="flex flex-wrap items-center gap-10 p-2">
  <div class="grid size-20 scale-75 place-items-center rounded-xl bg-sky-6 font-mono text-xs text-white">scale-75</div>
  <div class="grid size-20 place-items-center rounded-xl bg-violet-6 font-mono text-xs text-white">scale-100</div>
  <div class="grid size-20 scale-125 place-items-center rounded-xl bg-pink-6 font-mono text-xs text-white">scale-125</div>
  <button class="rounded-lg bg-amber-6 px-4 py-2 font-semibold text-white transition hover:scale-105 active:scale-95">Press me</button>
</div>
```

## Skew

::classes skew-0 skew-3 skew-6 skew-12 skew-x-12 skew-y-3 -skew-x-6

```preview
<div class="flex flex-wrap gap-10 p-2">
  <div class="grid size-20 skew-x-12 place-items-center rounded-xl bg-sky-6 font-mono text-xs text-white">skew-x-12</div>
  <div class="grid size-20 -skew-y-6 place-items-center rounded-xl bg-violet-6 font-mono text-xs text-white">-skew-y-6</div>
</div>
```

## Transform origin

The point a transform turns and scales around.

::classes origin-center origin-top origin-top-right origin-right origin-bottom-right origin-bottom origin-bottom-left origin-left origin-top-left origin-[33%_75%]

```preview
<div class="flex flex-wrap gap-12 p-4">
  <div class="size-20 rounded-xl bg-gray-2 dark:bg-gray-9"><div class="size-20 origin-center rotate-45 rounded-xl bg-sky-6/80"></div></div>
  <div class="size-20 rounded-xl bg-gray-2 dark:bg-gray-9"><div class="size-20 origin-top-left rotate-12 rounded-xl bg-violet-6/80"></div></div>
  <div class="size-20 rounded-xl bg-gray-2 dark:bg-gray-9"><div class="size-20 origin-bottom scale-75 rounded-xl bg-pink-6/80"></div></div>
</div>
```

## Perspective and 3D

`perspective-*` on a parent gives its children's 3D rotations depth (a smaller distance looks more dramatic). `transform-3d` keeps nested children in the same 3D space, and `backface-hidden` hides a box's back when it's turned away.

::classes perspective-dramatic perspective-near perspective-normal perspective-midrange perspective-distant perspective-none perspective-origin-center perspective-origin-top-left transform-flat transform-3d backface-visible backface-hidden

```preview
<div class="flex flex-wrap gap-12 p-4">
  <div class="perspective-near"><div class="grid size-24 rotate-x-45 place-items-center rounded-xl bg-sky-6 font-mono text-xs text-white">rotate-x-45</div></div>
  <div class="perspective-near"><div class="grid size-24 rotate-y-45 place-items-center rounded-xl bg-violet-6 font-mono text-xs text-white">rotate-y-45</div></div>
  <div class="perspective-distant"><div class="grid size-24 rotate-y-45 place-items-center rounded-xl bg-pink-6 font-mono text-xs text-white">distant</div></div>
</div>
```

## Hardware acceleration and removing transforms

`transform-gpu` puts a box on its own layer, which can smooth some animations; `transform-none` removes every transform.

::classes transform-gpu transform-cpu transform-none
