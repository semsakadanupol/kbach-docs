---
title: Spacing
description: Padding, margin និងគម្លាតរវាង element ខាងក្នុង តាមមាត្រដ្ឋាន 4px របស់ Kbach ព្រមទាំងតម្លៃអវិជ្ជមាន និងតម្លៃក្នុងតង្កៀប។
---

លេខគម្លាតកើនម្តង 4px៖ `p-1` ស្មើ 4px, `p-4` ស្មើ 16px, `p-0.5` ស្មើ 2px ហើយ `p-px` ស្មើ 1px។ លេខទាំងនេះប្រើដូចគ្នាសម្រាប់ margin, gap, ទទឹង, កម្ពស់ និង inset។

## Padding {#padding}

គម្លាតនៅខាងក្នុងប្រអប់ ពីគែមរហូតដល់មាតិកា។ `px-*` និង `py-*` កំណត់ពីរជ្រុង, `pt`, `pr`, `pb` និង `pl` កំណត់មួយជ្រុង, ចំណែក `ps` និង `pe` ប្តូរតាមទិសសរសេរ។

::classes p-0 p-px p-0.5 p-1 p-1.5 p-2 p-3 p-4 p-6 p-8 p-12 p-16 p-24 px-4 py-2 pt-4 pr-4 pb-4 pl-4 ps-4 pe-4 p-[5px]

```preview
<div class="flex flex-wrap items-start gap-4 font-mono text-xs">
  <div class="rounded-lg bg-sky-2 p-2 dark:bg-sky-10"><div class="rounded bg-sky-6 px-2 py-1 text-white">p-2</div></div>
  <div class="rounded-lg bg-sky-2 p-4 dark:bg-sky-10"><div class="rounded bg-sky-6 px-2 py-1 text-white">p-4</div></div>
  <div class="rounded-lg bg-sky-2 p-8 dark:bg-sky-10"><div class="rounded bg-sky-6 px-2 py-1 text-white">p-8</div></div>
  <div class="rounded-lg bg-violet-2 px-8 py-2 dark:bg-violet-10"><div class="rounded bg-violet-6 px-2 py-1 text-white">px-8 py-2</div></div>
  <div class="rounded-lg bg-pink-2 pt-8 pl-6 dark:bg-pink-10"><div class="rounded bg-pink-6 px-2 py-1 text-white">pt-8 pl-6</div></div>
</div>
```

## Margin {#margin}

គម្លាតនៅខាងក្រៅប្រអប់ ដែលរុញប្រអប់ជិតខាងឱ្យឃ្លាត។ `mx-auto` ដាក់ប្រអប់ដែលមានទទឹងនៅចំកណ្តាល។ ដាក់ `-` ពីមុខ ដើម្បីទាញប្រអប់ទៅទិសផ្ទុយ៖ `-mt-4`។

::classes m-0 m-px m-1 m-2 m-4 m-8 m-auto mx-auto my-4 mt-8 mr-2 mb-4 ml-2 ms-2 me-2 -mt-4 -mx-2 m-[3px]

```preview
<div class="space-y-3 rounded-xl bg-gray-1 p-3 dark:bg-gray-9">
  <div class="mx-auto w-48 rounded-lg bg-sky-6 py-2 text-center text-sm font-medium text-white">mx-auto</div>
  <div class="ml-12 w-48 rounded-lg bg-violet-6 py-2 text-center text-sm font-medium text-white">ml-12</div>
  <div class="relative z-10 -mt-1 ml-24 w-48 rounded-lg bg-pink-6 py-2 text-center text-sm font-medium text-white shadow-lg">-mt-1 overlaps</div>
</div>
```

## Space between {#space-between}

ដាក់គម្លាតរវាង element ខាងក្នុងនីមួយៗ តាមជួរដេក (`space-x-*`) ឬជួរឈរ (`space-y-*`) ដោយដាក់ margin ឱ្យ element គ្រប់មួយ លើកលែងតែទីមួយ។ ក្នុង flex ឬ grid ប្រើ `gap-*` វិញល្អជាង។

::classes space-x-0 space-x-2 space-x-4 space-x-8 space-y-0 space-y-2 space-y-4 space-y-8 -space-x-2 space-x-reverse space-y-reverse

```preview
<div class="grid gap-8 sm:grid-cols-2">
  <div class="space-y-2">
    <div class="rounded-lg bg-sky-6 px-4 py-2 text-sm font-medium text-white">space-y-2</div>
    <div class="rounded-lg bg-sky-6 px-4 py-2 text-sm font-medium text-white">second</div>
    <div class="rounded-lg bg-sky-6 px-4 py-2 text-sm font-medium text-white">third</div>
  </div>
  <div class="flex -space-x-3">
    <div class="grid size-12 place-items-center rounded-full bg-amber-5 font-semibold text-white ring-4 ring-white dark:ring-gray-10">A</div>
    <div class="grid size-12 place-items-center rounded-full bg-emerald-6 font-semibold text-white ring-4 ring-white dark:ring-gray-10">B</div>
    <div class="grid size-12 place-items-center rounded-full bg-violet-6 font-semibold text-white ring-4 ring-white dark:ring-gray-10">C</div>
    <div class="grid size-12 place-items-center rounded-full bg-gray-7 text-sm font-semibold text-white ring-4 ring-white dark:ring-gray-10">+9</div>
  </div>
</div>
```

## មាត្រដ្ឋានផ្ទាល់ខ្លួន {#your-own-scale}

មាត្រដ្ឋានគម្លាតមកពី theme ដូច្នេះ project អាចបន្ថែមលេខថ្មីបាន។ មើលនៅ [Spacing, screens និង fonts](/spacing-screens-fonts)។
