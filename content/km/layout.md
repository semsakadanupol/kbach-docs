---
title: Layout
description: Display, position, overflow, z-index, aspect ratio, columns, object fit និង utility ផ្សេងទៀតដែលកំណត់ថាប្រអប់នៅទីណា និងតម្រៀបយ៉ាងដូចម្តេច។
---

តារាងនីមួយៗក្នុងទំព័រទាំងនេះ engine បង្កើតភ្លាមៗពេលអ្នកកំពុងអាន ដោយប្រើ theme លំនាំដើមរបស់ Kbach ដូច្នេះអ្វីដែលអ្នកឃើញ គឺ CSS ដែល project ថ្មីទទួលបាន។ Class ដែលមានសញ្ញា **Web only** គ្មានប្រសិទ្ធភាពលើ React Native ទេ មើលនៅ [React Native](/react-native)។

## Display {#display}

កំណត់ថាប្រអប់ចូលរួមក្នុង layout តាមរបៀបណា។ `hidden` ដកប្រអប់ចេញទាំងស្រុង ចំណែក `sr-only` លាក់វាពីភ្នែក តែកម្មវិធីអានអេក្រង់នៅតែអានបាន (មើលនៅ [Accessibility](/accessibility))។

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

## Position {#position}

`absolute` ដកប្រអប់ចេញពីលំហូរធម្មតា ដើម្បីឱ្យអ្នកដាក់វានៅកន្លែងណាក៏បានដោយ `top`, `right`, `bottom` និង `left`។ តម្លៃទាំងនេះវាស់ពី parent ដែលនៅជិតបំផុតហើយមាន `relative` (ឬ position ផ្សេង)។ `fixed` វាស់ពី window វិញ ចំណែក `sticky` ធ្វើឱ្យប្រអប់ជាប់នៅលើអេក្រង់ ពេល scroll កាត់វា។

::classes static relative absolute fixed sticky

```preview
<div class="relative h-40 rounded-xl border-2 border-dashed border-gray-4 bg-gray-1 p-4 text-sm text-gray-8 dark:border-gray-7 dark:bg-gray-9 dark:text-gray-3">
  <p class="font-medium">relative parent</p>
  <div class="absolute right-4 bottom-4 rounded-lg bg-sky-6 px-3 py-2 font-medium text-white shadow-lg">absolute, right-4 bottom-4</div>
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-violet-6 px-3 py-2 font-medium text-white shadow-lg">centered</div>
</div>
```

## Top, right, bottom និង left {#top-right-bottom-and-left}

កំណត់ទីតាំងរបស់ប្រអប់ដែលមាន position៖ ជាលេខ (កើនម្តង 4px) ជាប្រភាគ ឬ `full`។ `inset-*` កំណត់ទាំងបួនជ្រុងក្នុងពេលតែមួយ, `inset-x-*` និង `inset-y-*` កំណត់ពីរជ្រុង។ `start-*` និង `end-*` ប្តូរតាមទិសសរសេរ។ ដាក់ `-` ពីមុខ ដើម្បីបានតម្លៃអវិជ្ជមាន។

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

## Z-index {#z-index}

ពេលប្រអប់ដែលមាន position ត្រួតគ្នា ប្រអប់ដែលមានលេខធំជាងនៅពីលើ។ `-z-*` ដាក់ប្រអប់ឱ្យនៅពីក្រោយប្រអប់ផ្សេង។

::classes z-0 z-10 z-20 z-30 z-40 z-50 z-auto -z-10 z-[100]

```preview
<div class="flex -space-x-4">
  <div class="relative z-40 grid size-16 place-items-center rounded-full bg-sky-6 font-semibold text-white ring-4 ring-white dark:ring-gray-10">40</div>
  <div class="relative z-30 grid size-16 place-items-center rounded-full bg-violet-6 font-semibold text-white ring-4 ring-white dark:ring-gray-10">30</div>
  <div class="relative z-20 grid size-16 place-items-center rounded-full bg-pink-6 font-semibold text-white ring-4 ring-white dark:ring-gray-10">20</div>
  <div class="relative z-10 grid size-16 place-items-center rounded-full bg-amber-6 font-semibold text-white ring-4 ring-white dark:ring-gray-10">10</div>
</div>
```

## Overflow {#overflow}

កំណត់ថាត្រូវធ្វើយ៉ាងណា ពេលមាតិកាធំជាងប្រអប់៖ កាត់ចោល ឱ្យ scroll បាន ឬទុកឱ្យហៀរចេញក្រៅ។ `overflow-x-*` និង `overflow-y-*` កំណត់តែមួយទិស។

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

## Overscroll behavior {#overscroll-behavior}

ពេល scroll ដល់ចុងប្រអប់ហើយ តើការ scroll បន្តទៅទំព័រនៅពីក្រោយឬអត់។ `overscroll-contain` ការពារកុំឱ្យផ្ទាំងដែលកំពុង scroll អូសទំព័រទាំងមូលតាម។

::classes overscroll-auto overscroll-contain overscroll-none overscroll-y-contain overscroll-x-none

## Aspect ratio {#aspect-ratio}

រក្សាសមាមាត្ររវាងទទឹង និងកម្ពស់។ សម្រាប់សមាមាត្រផ្សេង សូមសរសេរជាប្រភាគក្នុងតង្កៀបការ៉េ។

::classes aspect-square aspect-video aspect-auto aspect-[4/3]

```preview
<div class="grid grid-cols-3 gap-4 text-xs font-medium text-white">
  <div class="aspect-square grid place-items-center rounded-xl bg-sky-6">aspect-square</div>
  <div class="aspect-video grid place-items-center rounded-xl bg-violet-6">aspect-video</div>
  <div class="aspect-[4/3] grid place-items-center rounded-xl bg-pink-6">aspect-[4/3]</div>
</div>
```

## Object fit និង position {#object-fit-and-position}

កំណត់ថារូបភាព ឬវីដេអូពេញប្រអប់យ៉ាងដូចម្តេច។ `object-cover` កាត់គែមដើម្បីឱ្យពេញប្រអប់ ចំណែក `object-contain` បង្ហាញរូបទាំងមូល។ Class ទីតាំង `object-*` កំណត់ថាផ្នែកណានៅតែមើលឃើញ។

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

## Columns {#columns}

ចែកមាតិកាជាជួរឈរដូចកាសែត៖ តាមចំនួន (`columns-3`) ឬតាមទទឹងជួរឈរ (`columns-xs`) ដែលដាក់ជួរឈរបានច្រើនតាមកន្លែងទំនេរ។

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

## Break before, after និង inside {#break-before-after-and-inside}

កំណត់កន្លែងដែលជួរឈរ ឬទំព័រអាចបំបែកបាន សម្រាប់ layout ច្រើនជួរឈរ និងពេលបោះពុម្ព។

::classes break-before-auto break-before-page break-before-column break-after-avoid break-after-page break-inside-auto break-inside-avoid break-inside-avoid-page

## Box sizing {#box-sizing}

`box-border` រាប់ padding និង border ចូលក្នុងទទឹងដែលអ្នកកំណត់ (reset ធ្វើបែបនេះឱ្យ element ទាំងអស់រួចហើយ)។ `box-content` បូកវាបន្ថែមលើទទឹងវិញ។

::classes box-border box-content

## Box decoration break {#box-decoration-break}

ពេលប្រអប់ inline ធ្លាក់ចុះបន្ទាត់ `box-decoration-clone` ឱ្យបំណែកនីមួយៗមាន padding, border និងផ្ទៃខាងក្រោយរៀងៗខ្លួន។

::classes box-decoration-clone box-decoration-slice

```preview
<p class="max-w-56 text-lg font-semibold leading-9">
  <span class="box-decoration-clone rounded-lg bg-linear-to-r from-sky-5 to-violet-6 px-2 py-1 text-white">One class set, three platforms</span>
</p>
```

## Float និង clear {#float-and-clear}

`float-*` រុញប្រអប់ទៅម្ខាង ហើយឱ្យអក្សររុំជុំវិញវា។ `clear-*` ចាប់ផ្តើមនៅក្រោមប្រអប់ float ទាំងអស់។

::classes float-left float-right float-start float-end float-none clear-left clear-right clear-both clear-start clear-end clear-none

```preview
<div class="flow-root text-sm leading-6 text-gray-8 dark:text-gray-3">
  <div class="float-left mr-4 mb-2 grid size-20 place-items-center rounded-xl bg-amber-5 text-2xl font-bold text-white">K</div>
  <p>The box on the left floats, so this text wraps around it. Kbach writes CSS for exactly the classes your files use, in a stable order, so the same classes always give the same stylesheet. Nothing runs in the browser to style the page.</p>
</div>
```

## Isolation {#isolation}

`isolate` ការពារកុំឱ្យលំដាប់ `z-*` និង blend mode របស់ប្រអប់ខាងក្នុង ទៅលាយជាមួយផ្នែកផ្សេងទៀតនៃទំព័រ។

::classes isolate isolation-auto

## Visibility {#visibility}

`invisible` លាក់ប្រអប់ តែនៅទុកកន្លែងរបស់វា។ ចំណែក `hidden` (ក្នុងផ្នែក Display) ដកវាចេញទាំងស្រុង។

::classes visible invisible collapse

```preview
<div class="flex gap-3 text-sm font-medium text-white">
  <div class="rounded-lg bg-sky-6 px-4 py-2">one</div>
  <div class="invisible rounded-lg bg-sky-6 px-4 py-2">two</div>
  <div class="rounded-lg bg-sky-6 px-4 py-2">three</div>
</div>
```

## Container {#container}

`container` ឱ្យប្រអប់មានទទឹងពេញ តែមិនឱ្យធំជាងទំហំអេក្រង់បច្ចុប្បន្ន (640px, 768px ជាដើម)។ បន្ថែម `mx-auto` ដើម្បីដាក់វានៅកណ្តាល និង `px-*` ដើម្បីទុកគម្លាតសងខាង។

::classes container
