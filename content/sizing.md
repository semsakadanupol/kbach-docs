---
title: Sizing
description: Width, height, size, min and max sizes, with the spacing scale, fractions, container sizes and viewport units.
---

Sizes take the same 4px spacing scale as padding (`w-4` is 16px), fractions (`w-1/2`), named container sizes (`w-md` is 28rem), and keywords like `full`, `screen`, `min`, `max` and `fit`.

## Width

::classes w-0 w-px w-4 w-16 w-64 w-1/2 w-1/3 w-2/3 w-full w-screen w-auto w-min w-max w-fit w-dvw w-svw w-lvw w-3xs w-xs w-sm w-md w-lg w-xl w-2xl w-7xl w-[32rem]

```preview
<div class="space-y-2 font-mono text-xs text-white">
  <div class="w-1/4 rounded-lg bg-sky-6 px-3 py-2">w-1/4</div>
  <div class="w-1/2 rounded-lg bg-sky-6 px-3 py-2">w-1/2</div>
  <div class="w-3/4 rounded-lg bg-sky-6 px-3 py-2">w-3/4</div>
  <div class="w-full rounded-lg bg-sky-6 px-3 py-2">w-full</div>
  <div class="w-fit rounded-lg bg-violet-6 px-3 py-2">w-fit: as wide as its content</div>
</div>
```

## Min and max width

Limits on a box's width. `max-w-prose` keeps lines readable; `min-w-0` lets a flex child shrink below its content (needed for `truncate` inside flex).

::classes min-w-0 min-w-full min-w-min min-w-max min-w-xs min-w-[20rem] max-w-none max-w-xs max-w-sm max-w-md max-w-lg max-w-xl max-w-2xl max-w-3xl max-w-7xl max-w-full max-w-prose max-w-[50ch]

```preview
<div class="space-y-3">
  <p class="max-w-xs rounded-lg bg-gray-1 p-3 text-sm text-gray-8 dark:bg-gray-9 dark:text-gray-3"><b class="font-mono text-gray-12 dark:text-white">max-w-xs</b>: this paragraph stops growing at 20rem, however wide the page is.</p>
  <div class="flex max-w-sm gap-3 rounded-lg bg-gray-1 p-3 dark:bg-gray-9">
    <div class="size-10 shrink-0 rounded-full bg-amber-5"></div>
    <div class="min-w-0">
      <p class="font-mono text-sm font-semibold text-gray-12 dark:text-white">min-w-0</p>
      <p class="truncate text-sm text-gray-8 dark:text-gray-3">lets this long line truncate instead of pushing the box wider than its parent</p>
    </div>
  </div>
</div>
```

## Height

::classes h-0 h-px h-4 h-16 h-64 h-1/2 h-full h-screen h-dvh h-svh h-lvh h-auto h-min h-max h-fit h-[50vh]

```preview
<div class="flex h-40 items-end gap-3">
  <div class="h-1/4 w-14 rounded-lg bg-sky-6"></div>
  <div class="h-1/2 w-14 rounded-lg bg-sky-6"></div>
  <div class="h-3/4 w-14 rounded-lg bg-sky-6"></div>
  <div class="h-full w-14 rounded-lg bg-violet-6"></div>
  <div class="h-12 w-14 rounded-lg bg-pink-6"></div>
</div>
```

## Min and max height

::classes min-h-0 min-h-full min-h-screen min-h-dvh min-h-[calc(100vh-4rem)] max-h-0 max-h-48 max-h-96 max-h-full max-h-screen max-h-dvh

## Size

`size-*` sets width and height together: the quick way to make squares and circles.

::classes size-0 size-4 size-6 size-8 size-10 size-12 size-16 size-full size-1/2 size-auto size-[72px]

```preview
<div class="flex items-center gap-4">
  <div class="size-6 rounded-full bg-sky-6"></div>
  <div class="size-10 rounded-full bg-sky-6"></div>
  <div class="size-14 rounded-full bg-sky-6"></div>
  <div class="size-20 rounded-2xl bg-violet-6"></div>
</div>
```

## Inline and block size

Width and height that follow the writing direction: `inline-*` is the size along a line of text (the width, in English and Khmer), and `block-*` is the size across it.

::classes inline-4 inline-full block-4 block-full
