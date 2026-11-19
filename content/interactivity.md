---
title: Interactivity
description: Cursor, pointer events, user select, resize, scroll behavior, scroll snap, touch action, form control colors and color scheme.
---

## Cursor

::classes cursor-auto cursor-default cursor-pointer cursor-wait cursor-progress cursor-text cursor-move cursor-help cursor-not-allowed cursor-none cursor-grab cursor-grabbing cursor-zoom-in

```preview
<div class="flex flex-wrap gap-3 font-mono text-xs text-gray-12 dark:text-white">
  <div class="cursor-pointer rounded-lg bg-gray-1 px-4 py-3 dark:bg-gray-9">cursor-pointer</div>
  <div class="cursor-not-allowed rounded-lg bg-gray-1 px-4 py-3 opacity-50 dark:bg-gray-9">cursor-not-allowed</div>
  <div class="cursor-grab rounded-lg bg-gray-1 px-4 py-3 active:cursor-grabbing dark:bg-gray-9">cursor-grab</div>
  <div class="cursor-help rounded-lg bg-gray-1 px-4 py-3 dark:bg-gray-9">cursor-help</div>
  <div class="cursor-wait rounded-lg bg-gray-1 px-4 py-3 dark:bg-gray-9">cursor-wait</div>
</div>
```

## Pointer events

`pointer-events-none` lets clicks pass straight through a box, to whatever is under it: useful for an icon laid over an input.

::classes pointer-events-auto pointer-events-none

```preview
<label class="relative block max-w-xs">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-6"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
  <input placeholder="Search classes" class="h-10 w-full rounded-lg border border-gray-3 bg-white pr-3 pl-9 text-sm text-gray-12 outline-none focus:border-sky-6 focus:ring-2 focus:ring-sky-6/20 dark:border-gray-8 dark:bg-gray-9 dark:text-white" />
</label>
```

## User select

Whether text can be selected: `select-all` selects all of it in one click, `select-none` none of it.

::classes select-none select-text select-all select-auto

```preview
<div class="flex flex-wrap gap-3 text-sm">
  <code class="rounded-lg bg-gray-1 px-3 py-2 font-mono text-gray-12 select-all dark:bg-gray-9 dark:text-white">npm install @kbach/react</code>
  <button class="rounded-lg bg-sky-6 px-3 py-2 font-semibold text-white select-none">Not selectable</button>
</div>
```

## Resize

Whether people can drag to resize a box (`resize` both ways). Needs an `overflow` other than visible.

::classes resize resize-none resize-x resize-y

```preview
<textarea class="h-24 w-full max-w-sm resize-y rounded-lg border border-gray-3 bg-white p-3 text-sm text-gray-12 dark:border-gray-8 dark:bg-gray-9 dark:text-white">Drag the corner to make me taller.</textarea>
```

## Field sizing

`field-sizing-content` lets a text field grow with what's typed into it.

::classes field-sizing-fixed field-sizing-content

```preview
<textarea rows="2" class="min-h-10 w-full max-w-sm rounded-lg border border-gray-3 bg-white p-3 text-sm text-gray-12 field-sizing-content dark:border-gray-8 dark:bg-gray-9 dark:text-white">Type more lines here: the box grows to fit.</textarea>
```

## Accent color and caret color

`accent-*` colors native checkboxes, radios, range sliders and progress bars. `caret-*` colors the text cursor.

::classes accent-sky-6 accent-pink-6 accent-auto caret-sky-6 caret-pink-6

```preview
<div class="flex flex-wrap items-center gap-6 text-sm text-gray-12 dark:text-white">
  <label class="flex items-center gap-2"><input type="checkbox" checked class="size-4 accent-pink-6" /> accent-pink-6</label>
  <label class="flex items-center gap-2"><input type="radio" checked class="size-4 accent-sky-6" /> accent-sky-6</label>
  <input type="range" class="accent-violet-6" />
  <input value="caret-pink-6" class="h-9 rounded-lg border border-gray-3 px-3 caret-pink-6 dark:border-gray-8 dark:bg-gray-9" />
</div>
```

## Appearance

`appearance-none` removes a form control's built-in look so you can style it yourself.

::classes appearance-none appearance-auto

```preview
<div class="relative max-w-xs">
  <select class="h-10 w-full appearance-none rounded-lg border border-gray-3 bg-white pr-9 pl-3 text-sm text-gray-12 dark:border-gray-8 dark:bg-gray-9 dark:text-white">
    <option>React (Vite)</option>
    <option>React Native</option>
    <option>Plain HTML</option>
  </select>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-6"><path d="m6 9 6 6 6-6"/></svg>
</div>
```

## Color scheme

Tells the browser which mode a part of the page is in, so scrollbars and form controls match it.

::classes scheme-normal scheme-light scheme-dark scheme-light-dark scheme-only-dark

## Scroll behavior

`scroll-smooth` on the page makes jumps to `#links` glide instead of snapping.

::classes scroll-auto scroll-smooth

## Scroll margin and padding

`scroll-mt-*` leaves room above an element when a link scrolls to it, for example under a sticky header. `scroll-p*-*` does the same for a scrolling box's snap points.

::classes scroll-m-4 scroll-mt-16 scroll-mx-2 scroll-p-4 scroll-pt-16 scroll-px-6

## Scroll snap

`snap-x` or `snap-y` on the scrolling box, `snap-start` or `snap-center` on its children: scrolling settles on a child instead of stopping anywhere.

::classes snap-x snap-y snap-both snap-none snap-mandatory snap-proximity snap-start snap-end snap-center snap-align-none snap-normal snap-always

```preview
<div class="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
  <div class="grid h-32 w-4/5 shrink-0 snap-center place-items-center rounded-xl bg-sky-6 font-semibold text-white">1</div>
  <div class="grid h-32 w-4/5 shrink-0 snap-center place-items-center rounded-xl bg-violet-6 font-semibold text-white">2</div>
  <div class="grid h-32 w-4/5 shrink-0 snap-center place-items-center rounded-xl bg-pink-6 font-semibold text-white">3</div>
  <div class="grid h-32 w-4/5 shrink-0 snap-center place-items-center rounded-xl bg-amber-6 font-semibold text-white">4</div>
</div>
```

## Touch action

Which touch gestures the browser handles itself. `touch-none` hands every gesture to your script (for a drawing canvas); `touch-manipulation` drops double-tap zoom so taps react at once.

::classes touch-auto touch-none touch-pan-x touch-pan-y touch-pan-left touch-pan-up touch-pinch-zoom touch-manipulation

## Will change

A hint that a property is about to animate, so the browser can prepare. Use it on the element that animates, only while it does.

::classes will-change-auto will-change-scroll will-change-contents will-change-transform
