---
title: Backgrounds
description: Background color, linear, radial and conic gradients with color stops, and background size, position, repeat, clip, origin and attachment.
---

## Background color

Every palette color, in 12 shades, with a slash for opacity. See [Colors](/colors) for the whole palette.

::classes bg-black bg-white bg-gray-{1,2,3,6,9,12} bg-sky-{1..12} bg-sky-6/50 bg-inherit bg-current bg-transparent bg-[#c7a25d]

```preview
<div class="flex flex-wrap gap-3">
  <div class="size-16 rounded-xl bg-sky-2"></div>
  <div class="size-16 rounded-xl bg-sky-4"></div>
  <div class="size-16 rounded-xl bg-sky-6"></div>
  <div class="size-16 rounded-xl bg-sky-8"></div>
  <div class="size-16 rounded-xl bg-sky-10"></div>
  <div class="size-16 rounded-xl bg-sky-6/50"></div>
  <div class="size-16 rounded-xl bg-sky-6/20"></div>
</div>
```

## Gradients

`bg-linear-to-*` draws a linear gradient in a direction (`bg-linear-45` takes an angle), `bg-radial` and `bg-conic` the other two shapes. The colors come from the stop classes below.

::classes bg-linear-to-t bg-linear-to-tr bg-linear-to-r bg-linear-to-br bg-linear-to-b bg-linear-to-bl bg-linear-to-l bg-linear-to-tl bg-linear-45 bg-linear-[25deg] bg-radial bg-radial-[at_25%_25%] bg-conic bg-conic-180 bg-none

```preview
<div class="grid grid-cols-3 gap-4">
  <div class="h-24 rounded-xl bg-linear-to-r from-sky-4 to-violet-6"></div>
  <div class="h-24 rounded-xl bg-radial from-amber-3 to-rose-6"></div>
  <div class="h-24 rounded-xl bg-conic from-emerald-4 via-sky-5 to-emerald-4"></div>
</div>
```

## Gradient color stops

`from-*` sets the start color, `to-*` the end, and `via-*` one in the middle. A percentage moves where a stop sits.

::classes from-sky-4 via-violet-5 to-pink-6 from-transparent to-white/0 from-10% via-30% to-90%

```preview
<div class="space-y-3">
  <div class="h-12 rounded-xl bg-linear-to-r from-sky-4 to-pink-6"></div>
  <div class="h-12 rounded-xl bg-linear-to-r from-sky-4 via-violet-5 to-pink-6"></div>
  <div class="h-12 rounded-xl bg-linear-to-r from-sky-4 from-10% via-violet-5 via-30% to-pink-6 to-90%"></div>
</div>
```

## Background clip

How far the background reaches. `bg-clip-text` paints it only behind the letters: with `text-transparent`, that's gradient text.

::classes bg-clip-border bg-clip-padding bg-clip-content bg-clip-text

```preview
<p class="bg-linear-to-r from-amber-5 via-orange-6 to-rose-6 bg-clip-text text-5xl font-black tracking-tight text-transparent">Kbach</p>
```

## Background size

::classes bg-auto bg-cover bg-contain bg-size-[200px_100px]

## Background position

::classes bg-top bg-bottom bg-center bg-left bg-right bg-top-left bg-top-right bg-bottom-left bg-bottom-right bg-position-[center_top_1rem]

## Background repeat

::classes bg-repeat bg-no-repeat bg-repeat-x bg-repeat-y bg-repeat-space bg-repeat-round

```preview
<div class="grid grid-cols-2 gap-4">
  <div class="h-28 rounded-xl bg-gray-1 bg-[url(/kbach-logo-128.png)] bg-size-[40px_40px] bg-repeat dark:bg-gray-9"></div>
  <div class="h-28 rounded-xl bg-gray-1 bg-[url(/kbach-logo-128.png)] bg-size-[56px_56px] bg-center bg-no-repeat dark:bg-gray-9"></div>
</div>
```

## Background origin and attachment

Origin sets where the background starts (the border, the padding or the content box); attachment whether it scrolls with the box (`bg-scroll`), its content (`bg-local`) or stays put (`bg-fixed`).

::classes bg-origin-border bg-origin-padding bg-origin-content bg-fixed bg-local bg-scroll

## Background image

Any image, by URL in brackets. A type hint makes a `var()` a background image rather than a color: `bg-[image:var(--hero)]`.

::classes bg-[url(/img/hero.png)] bg-none
