---
title: Flexbox & Grid
description: Direction, wrapping, grow and shrink, grid columns and rows, gap, and every justify, align and place utility for laying children out.
---

Start a flex layout with `flex` and a grid with `grid` (see [Display](/layout#display)). Everything on this page then arranges the children.

## Flex direction

Which way the children run. `-reverse` flips the order.

::classes flex-row flex-row-reverse flex-col flex-col-reverse

```preview
<div class="grid gap-4 sm:grid-cols-2">
  <div class="flex flex-row gap-2 rounded-xl bg-gray-1 p-3 dark:bg-gray-9">
    <div class="grid size-12 place-items-center rounded-lg bg-sky-6 font-semibold text-white">1</div>
    <div class="grid size-12 place-items-center rounded-lg bg-sky-6 font-semibold text-white">2</div>
    <div class="grid size-12 place-items-center rounded-lg bg-sky-6 font-semibold text-white">3</div>
  </div>
  <div class="flex flex-row-reverse gap-2 rounded-xl bg-gray-1 p-3 dark:bg-gray-9">
    <div class="grid size-12 place-items-center rounded-lg bg-violet-6 font-semibold text-white">1</div>
    <div class="grid size-12 place-items-center rounded-lg bg-violet-6 font-semibold text-white">2</div>
    <div class="grid size-12 place-items-center rounded-lg bg-violet-6 font-semibold text-white">3</div>
  </div>
</div>
```

## Flex wrap

Whether children wrap onto new lines when they run out of room.

::classes flex-wrap flex-nowrap flex-wrap-reverse

```preview
<div class="flex max-w-sm flex-wrap gap-2">
  <span class="rounded-full bg-sky-2 px-3 py-1 text-sm font-medium text-sky-10 dark:bg-sky-10 dark:text-sky-2">React</span>
  <span class="rounded-full bg-sky-2 px-3 py-1 text-sm font-medium text-sky-10 dark:bg-sky-10 dark:text-sky-2">React Native</span>
  <span class="rounded-full bg-sky-2 px-3 py-1 text-sm font-medium text-sky-10 dark:bg-sky-10 dark:text-sky-2">Expo</span>
  <span class="rounded-full bg-sky-2 px-3 py-1 text-sm font-medium text-sky-10 dark:bg-sky-10 dark:text-sky-2">Next.js</span>
  <span class="rounded-full bg-sky-2 px-3 py-1 text-sm font-medium text-sky-10 dark:bg-sky-10 dark:text-sky-2">Vite</span>
  <span class="rounded-full bg-sky-2 px-3 py-1 text-sm font-medium text-sky-10 dark:bg-sky-10 dark:text-sky-2">Plain HTML</span>
</div>
```

## Flex, grow and shrink

`flex-1` lets a child grow and shrink to share the space; `flex-none` keeps its own size. `grow` and `shrink` set one side each.

::classes flex-1 flex-auto flex-initial flex-none grow grow-0 shrink shrink-0

```preview
<div class="space-y-2 text-sm font-medium text-white">
  <div class="flex gap-2">
    <div class="flex-none rounded-lg bg-gray-7 px-4 py-2">flex-none</div>
    <div class="flex-1 rounded-lg bg-sky-6 px-4 py-2">flex-1</div>
    <div class="flex-1 rounded-lg bg-sky-6 px-4 py-2">flex-1</div>
  </div>
  <div class="flex gap-2">
    <div class="flex-none rounded-lg bg-gray-7 px-4 py-2">flex-none</div>
    <div class="grow rounded-lg bg-violet-6 px-4 py-2">grow</div>
    <div class="flex-none rounded-lg bg-gray-7 px-4 py-2">flex-none</div>
  </div>
</div>
```

## Flex basis

A child's starting size before growing or shrinking: the spacing scale, a fraction, `full`, or a container size like `basis-xs`.

::classes basis-0 basis-4 basis-64 basis-1/2 basis-1/3 basis-full basis-auto basis-3xs basis-xs basis-[12rem]

## Order

Moves a child earlier or later without changing the HTML.

::classes order-1 order-2 order-first order-last order-none -order-1

```preview
<div class="flex gap-2 text-sm font-semibold text-white">
  <div class="grid size-12 place-items-center rounded-lg bg-sky-6">1</div>
  <div class="order-last grid size-12 place-items-center rounded-lg bg-rose-6">2</div>
  <div class="grid size-12 place-items-center rounded-lg bg-sky-6">3</div>
  <div class="order-first grid size-12 place-items-center rounded-lg bg-amber-6">4</div>
</div>
```

## Grid template columns

How many columns a grid has. `grid-cols-3` makes three equal ones. In brackets you can give any column sizes, such as `grid-cols-[200px_1fr]`.

::classes grid-cols-1 grid-cols-2 grid-cols-3 grid-cols-4 grid-cols-6 grid-cols-12 grid-cols-none grid-cols-subgrid grid-cols-[200px_1fr]

```preview
<div class="grid grid-cols-3 gap-3 text-sm font-semibold text-white">
  <div class="rounded-lg bg-sky-6 py-4 text-center">1</div>
  <div class="rounded-lg bg-sky-6 py-4 text-center">2</div>
  <div class="rounded-lg bg-sky-6 py-4 text-center">3</div>
  <div class="rounded-lg bg-sky-6 py-4 text-center">4</div>
  <div class="rounded-lg bg-sky-6 py-4 text-center">5</div>
  <div class="rounded-lg bg-sky-6 py-4 text-center">6</div>
</div>
```

## Grid column span, start and end

How many columns a child covers, or exactly which lines it starts and ends on.

::classes col-span-1 col-span-2 col-span-3 col-span-full col-start-1 col-start-2 col-end-3 col-end-4 col-auto

```preview
<div class="grid grid-cols-4 gap-3 text-sm font-semibold text-white">
  <div class="col-span-2 rounded-lg bg-violet-6 py-4 text-center">col-span-2</div>
  <div class="rounded-lg bg-sky-6 py-4 text-center">1</div>
  <div class="rounded-lg bg-sky-6 py-4 text-center">1</div>
  <div class="col-start-2 col-end-5 rounded-lg bg-pink-6 py-4 text-center">col-start-2 col-end-5</div>
  <div class="col-span-full rounded-lg bg-amber-6 py-4 text-center">col-span-full</div>
</div>
```

## Grid template rows

How many rows a grid has, for grids that fill columns first or need fixed rows.

::classes grid-rows-1 grid-rows-2 grid-rows-3 grid-rows-6 grid-rows-none grid-rows-subgrid grid-rows-[auto_1fr_auto]

## Grid row span, start and end

The row version of column span.

::classes row-span-1 row-span-2 row-span-full row-start-1 row-start-2 row-end-3 row-auto

```preview
<div class="grid grid-flow-col grid-rows-3 gap-3 text-sm font-semibold text-white">
  <div class="row-span-3 grid place-items-center rounded-lg bg-violet-6 p-4">row-span-3</div>
  <div class="col-span-2 rounded-lg bg-sky-6 p-4 text-center">col-span-2</div>
  <div class="col-span-2 row-span-2 grid place-items-center rounded-lg bg-pink-6 p-4">col-span-2 row-span-2</div>
</div>
```

## Grid auto flow

How grid items without a place fill in: row by row, column by column, and whether to backfill gaps (`dense`).

::classes grid-flow-row grid-flow-col grid-flow-dense grid-flow-row-dense grid-flow-col-dense

## Grid auto columns and rows

The size of columns and rows the grid makes on its own.

::classes auto-cols-auto auto-cols-min auto-cols-max auto-cols-fr auto-rows-auto auto-rows-min auto-rows-max auto-rows-fr

## Gap

Space between rows and columns, in flex and grid alike. `gap-x-*` and `gap-y-*` set one direction.

::classes gap-0 gap-1 gap-2 gap-4 gap-8 gap-x-4 gap-y-2 gap-[10px]

```preview
<div class="grid grid-cols-3 gap-x-8 gap-y-3 text-sm font-semibold text-white">
  <div class="rounded-lg bg-sky-6 py-3 text-center">1</div>
  <div class="rounded-lg bg-sky-6 py-3 text-center">2</div>
  <div class="rounded-lg bg-sky-6 py-3 text-center">3</div>
  <div class="rounded-lg bg-sky-6 py-3 text-center">4</div>
  <div class="rounded-lg bg-sky-6 py-3 text-center">5</div>
  <div class="rounded-lg bg-sky-6 py-3 text-center">6</div>
</div>
```

## Justify content

Where children sit along the direction they run in (left to right in a row, top to bottom in a column), and how the spare space is shared.

::classes justify-start justify-end justify-center justify-between justify-around justify-evenly justify-stretch justify-normal

```preview
<div class="space-y-3 text-sm font-semibold text-white">
  <div class="flex justify-start gap-2 rounded-xl bg-gray-1 p-2 dark:bg-gray-9"><div class="rounded-lg bg-sky-6 px-4 py-2">01</div><div class="rounded-lg bg-sky-6 px-4 py-2">02</div><div class="rounded-lg bg-sky-6 px-4 py-2">03</div></div>
  <div class="flex justify-center gap-2 rounded-xl bg-gray-1 p-2 dark:bg-gray-9"><div class="rounded-lg bg-violet-6 px-4 py-2">01</div><div class="rounded-lg bg-violet-6 px-4 py-2">02</div><div class="rounded-lg bg-violet-6 px-4 py-2">03</div></div>
  <div class="flex justify-between rounded-xl bg-gray-1 p-2 dark:bg-gray-9"><div class="rounded-lg bg-pink-6 px-4 py-2">01</div><div class="rounded-lg bg-pink-6 px-4 py-2">02</div><div class="rounded-lg bg-pink-6 px-4 py-2">03</div></div>
  <div class="flex justify-evenly rounded-xl bg-gray-1 p-2 dark:bg-gray-9"><div class="rounded-lg bg-amber-6 px-4 py-2">01</div><div class="rounded-lg bg-amber-6 px-4 py-2">02</div><div class="rounded-lg bg-amber-6 px-4 py-2">03</div></div>
</div>
```

## Justify items and self

Where grid items sit inside their own cell, along the row. `justify-self-*` sets it for one item.

::classes justify-items-start justify-items-end justify-items-center justify-items-stretch justify-items-normal justify-self-auto justify-self-start justify-self-center justify-self-end justify-self-stretch

## Align content

When children wrap onto several lines: where those lines sit, if there's room to spare.

::classes content-normal content-start content-center content-end content-between content-around content-evenly content-stretch

## Align items and self

Where children sit across the direction they run in: in a row, that's from top to bottom. `self-*` sets it for one child.

::classes items-start items-end items-center items-baseline items-stretch self-auto self-start self-center self-end self-stretch self-baseline

```preview
<div class="flex h-32 items-center gap-2 rounded-xl bg-gray-1 p-2 text-sm font-semibold text-white dark:bg-gray-9">
  <div class="rounded-lg bg-sky-6 px-4 py-2">center</div>
  <div class="self-start rounded-lg bg-violet-6 px-4 py-2">self-start</div>
  <div class="self-end rounded-lg bg-pink-6 px-4 py-2">self-end</div>
  <div class="self-stretch rounded-lg bg-amber-6 px-4 py-2">self-stretch</div>
</div>
```

## Place content, items and self

`place-*` sets the align and justify version at once: `place-items-center` centers every grid item in its cell, both ways.

::classes place-content-center place-content-start place-content-between place-content-stretch place-items-start place-items-center place-items-stretch place-self-auto place-self-center place-self-end

```preview
<div class="grid h-36 place-items-center rounded-xl bg-gray-1 dark:bg-gray-9">
  <div class="rounded-lg bg-sky-6 px-4 py-2 text-sm font-semibold text-white">place-items-center</div>
</div>
```
