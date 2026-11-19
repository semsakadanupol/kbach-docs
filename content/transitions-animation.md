---
title: Transitions & Animation
description: Which properties transition, how long, with what easing and delay, and the built-in spin, ping, pulse and bounce animations.
---

## Transition property

Which properties animate when they change. A `transition-*` class comes with a 150ms duration and a smooth easing; `duration-*` and `ease-*` change them, before or after it.

::classes transition transition-all transition-colors transition-opacity transition-shadow transition-transform transition-none transition-[height]

```preview
<div class="flex flex-wrap gap-4">
  <button class="rounded-lg bg-sky-6 px-4 py-2 font-semibold text-white transition-colors hover:bg-violet-6">transition-colors</button>
  <button class="rounded-lg bg-sky-6 px-4 py-2 font-semibold text-white transition hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-6/40">transition</button>
  <button class="rounded-lg bg-sky-6 px-4 py-2 font-semibold text-white transition-none hover:bg-violet-6">transition-none</button>
</div>
```

## Transition behavior

`transition-discrete` lets properties that can't be in between, like `display`, still take part: the element stays visible until the fade ends.

::classes transition-normal transition-discrete

## Transition duration

::classes duration-0 duration-75 duration-100 duration-150 duration-200 duration-300 duration-500 duration-700 duration-1000 duration-[2s] duration-initial

```preview
<div class="flex flex-wrap gap-4 font-mono text-xs">
  <div class="rounded-lg bg-gray-1 px-4 py-3 text-gray-12 transition duration-150 hover:bg-sky-6 hover:text-white dark:bg-gray-9 dark:text-white">duration-150</div>
  <div class="rounded-lg bg-gray-1 px-4 py-3 text-gray-12 transition duration-500 hover:bg-sky-6 hover:text-white dark:bg-gray-9 dark:text-white">duration-500</div>
  <div class="rounded-lg bg-gray-1 px-4 py-3 text-gray-12 transition duration-1000 hover:bg-sky-6 hover:text-white dark:bg-gray-9 dark:text-white">duration-1000</div>
</div>
```

## Transition timing function

The easing curve. Brackets take any `cubic-bezier()`.

::classes ease-linear ease-in ease-out ease-in-out ease-initial ease-[cubic-bezier(0.22,1,0.36,1)]

```preview
<div class="group space-y-2 rounded-xl bg-gray-1 p-4 font-mono text-xs text-white dark:bg-gray-9">
  <p class="text-gray-7 dark:text-gray-4">Hover this box</p>
  <div class="w-24 rounded-md bg-sky-6 px-2 py-1 transition-all duration-700 ease-linear group-hover:w-full">ease-linear</div>
  <div class="w-24 rounded-md bg-violet-6 px-2 py-1 transition-all duration-700 ease-in group-hover:w-full">ease-in</div>
  <div class="w-24 rounded-md bg-pink-6 px-2 py-1 transition-all duration-700 ease-out group-hover:w-full">ease-out</div>
  <div class="w-24 rounded-md bg-amber-6 px-2 py-1 transition-all duration-700 ease-in-out group-hover:w-full">ease-in-out</div>
</div>
```

## Transition delay

::classes delay-0 delay-75 delay-150 delay-300 delay-700 delay-1000

## Animation

Four built-in animations: `animate-spin` for loaders, `animate-ping` for a radar-style notification dot, `animate-pulse` for skeleton screens, `animate-bounce` to point at something.

::classes animate-spin animate-ping animate-pulse animate-bounce animate-none

```preview
<div class="flex flex-wrap items-center gap-10">
  <svg viewBox="0 0 24 24" fill="none" class="size-8 animate-spin text-sky-6"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/><path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
  <span class="relative flex size-4"><span class="absolute inline-flex size-full animate-ping rounded-full bg-sky-5 opacity-75"></span><span class="relative inline-flex size-4 rounded-full bg-sky-6"></span></span>
  <div class="w-48 animate-pulse space-y-2"><div class="h-3 rounded bg-gray-3 dark:bg-gray-8"></div><div class="h-3 w-2/3 rounded bg-gray-3 dark:bg-gray-8"></div></div>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-8 animate-bounce text-violet-6"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
</div>
```

## Custom animations

For an animation of your own, define its `@keyframes` in your CSS and name it in brackets: `animate-[<value>]` sets `animation: <value>`, with underscores for spaces. `animate-(<custom-property>)` sets `animation: var(<custom-property>)`, for an animation kept in a CSS variable.

::classes animate-[wiggle_1s_ease-in-out_infinite] animate-(--my-animation)

```css
@keyframes wiggle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

:root {
  --my-animation: wiggle 1s ease-in-out infinite;
}
```

```html
<button class="animate-[wiggle_1s_ease-in-out_infinite]">Wiggle</button>
<button class="animate-(--my-animation)">Wiggle</button>
```

Both work with variants, like `hover:animate-[wiggle_1s_ease-in-out_infinite]`. Keyframes are CSS, so these are for the web: React Native doesn't run CSS keyframe animations.

## Reduced motion

Put `motion-safe:` in front of an animation to run it only for people who haven't asked their system for less motion, or `motion-reduce:` to change something when they have.

```preview
<svg viewBox="0 0 24 24" fill="none" class="size-8 text-sky-6 motion-safe:animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/><path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
```
