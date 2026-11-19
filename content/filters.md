---
title: Filters
description: Blur, brightness, contrast, drop shadow, grayscale, hue rotate, invert, saturate and sepia, on the box itself or on what's behind it.
---

All the filter classes go into one `filter`, so `blur-sm grayscale` blurs and greys together. The `backdrop-*` versions filter whatever is behind a see-through box instead of the box itself.

## Blur

::classes blur-none blur-xs blur-sm blur-md blur-lg blur-xl blur-2xl blur-3xl blur-[2px]

```preview
<div class="flex flex-wrap gap-6 font-mono text-xs text-gray-7 dark:text-gray-4">
  <figure class="text-center"><div class="size-20 rounded-full bg-linear-to-br from-amber-4 to-rose-6"></div><figcaption class="mt-2">none</figcaption></figure>
  <figure class="text-center"><div class="size-20 rounded-full bg-linear-to-br from-amber-4 to-rose-6 blur-xs"></div><figcaption class="mt-2">blur-xs</figcaption></figure>
  <figure class="text-center"><div class="size-20 rounded-full bg-linear-to-br from-amber-4 to-rose-6 blur-sm"></div><figcaption class="mt-2">blur-sm</figcaption></figure>
  <figure class="text-center"><div class="size-20 rounded-full bg-linear-to-br from-amber-4 to-rose-6 blur-md"></div><figcaption class="mt-2">blur-md</figcaption></figure>
</div>
```

## Brightness and contrast

::classes brightness-0 brightness-50 brightness-75 brightness-100 brightness-125 brightness-150 brightness-200 contrast-0 contrast-50 contrast-100 contrast-125 contrast-150 contrast-200

## Grayscale, sepia and invert

A bare class goes all the way (100%); a number sets how far.

::classes grayscale grayscale-0 grayscale-50 sepia sepia-0 sepia-50 invert invert-0 invert-20

## Saturate and hue rotate

::classes saturate-0 saturate-50 saturate-100 saturate-150 saturate-200 hue-rotate-0 hue-rotate-15 hue-rotate-90 hue-rotate-180 -hue-rotate-60

```preview
<div class="flex flex-wrap gap-6 font-mono text-xs text-gray-7 dark:text-gray-4">
  <figure class="text-center"><div class="size-20 rounded-2xl bg-linear-to-br from-sky-4 via-violet-5 to-pink-6"></div><figcaption class="mt-2">original</figcaption></figure>
  <figure class="text-center"><div class="size-20 rounded-2xl bg-linear-to-br from-sky-4 via-violet-5 to-pink-6 grayscale"></div><figcaption class="mt-2">grayscale</figcaption></figure>
  <figure class="text-center"><div class="size-20 rounded-2xl bg-linear-to-br from-sky-4 via-violet-5 to-pink-6 sepia"></div><figcaption class="mt-2">sepia</figcaption></figure>
  <figure class="text-center"><div class="size-20 rounded-2xl bg-linear-to-br from-sky-4 via-violet-5 to-pink-6 hue-rotate-90"></div><figcaption class="mt-2">hue-rotate-90</figcaption></figure>
  <figure class="text-center"><div class="size-20 rounded-2xl bg-linear-to-br from-sky-4 via-violet-5 to-pink-6 saturate-200 brightness-110"></div><figcaption class="mt-2">saturate brightness</figcaption></figure>
</div>
```

## Drop shadow

A shadow that follows the shape of the content (a transparent PNG, an SVG, text) instead of the box.

::classes drop-shadow-xs drop-shadow-sm drop-shadow-md drop-shadow-lg drop-shadow-xl drop-shadow-2xl drop-shadow-none drop-shadow-sky-6

```preview
<div class="flex items-center gap-10">
  <svg viewBox="0 0 24 24" class="size-20 fill-amber-5 drop-shadow-lg"><path d="M12 2 15 9l7 .5-5.5 4.5L18 21l-6-3.8L6 21l1.5-7L2 9.5 9 9z"/></svg>
  <svg viewBox="0 0 24 24" class="size-20 fill-sky-5 drop-shadow-xl drop-shadow-sky-6"><path d="M12 2 15 9l7 .5-5.5 4.5L18 21l-6-3.8L6 21l1.5-7L2 9.5 9 9z"/></svg>
</div>
```

## Backdrop filters

Each filter has a `backdrop-` version. On a see-through box, `backdrop-blur-*` blurs what's behind it: frosted glass.

::classes backdrop-blur-sm backdrop-blur-md backdrop-blur-xl backdrop-brightness-50 backdrop-contrast-125 backdrop-grayscale backdrop-hue-rotate-90 backdrop-invert backdrop-opacity-50 backdrop-saturate-200 backdrop-sepia

```preview
<div class="relative h-48 overflow-hidden rounded-2xl bg-linear-to-br from-sky-5 via-violet-6 to-pink-6">
  <div class="absolute -top-6 -left-6 size-32 rounded-full bg-amber-4"></div>
  <div class="absolute right-10 bottom-4 size-24 rounded-full bg-emerald-4"></div>
  <div class="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-xl border border-white/30 bg-white/20 p-4 text-white backdrop-blur-md">
    <p class="font-semibold">backdrop-blur-md</p>
    <p class="text-sm text-white/80">The shapes behind this card are blurred.</p>
  </div>
</div>
```

## Removing filters

::classes filter-none backdrop-filter-none
