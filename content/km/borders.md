---
title: Borders
description: ជ្រុងមូល, កម្រាស់, ពណ៌ និងរចនាប័ទ្ម border, outline និងបន្ទាត់ខណ្ឌរវាង element ខាងក្នុង។
---

Reset ដាក់ border រឹងពណ៌ដូចអក្សរ តែកម្រាស់ 0 ឱ្យ element ទាំងអស់ ដូច្នេះគ្រាន់តែ `border` ឬ `border-2` ក៏ឃើញបន្ទាត់ហើយ។

## Border radius {#border-radius}

`rounded-*` ធ្វើឱ្យជ្រុងទាំងអស់មូល។ `rounded-t-*`, `-r-`, `-b-` និង `-l-` ធ្វើឱ្យមូលតែម្ខាង, `rounded-tl-*` ជាដើម ធ្វើឱ្យមូលតែមួយជ្រុង ហើយ `rounded-s-*` / `rounded-e-*` ប្តូរតាមទិសសរសេរ។

::classes rounded-none rounded-xs rounded-sm rounded rounded-md rounded-lg rounded-xl rounded-2xl rounded-3xl rounded-4xl rounded-full rounded-t-lg rounded-r-lg rounded-b-lg rounded-l-lg rounded-tl-lg rounded-br-lg rounded-s-lg rounded-e-lg rounded-[12px]

```preview
<div class="flex flex-wrap gap-4 font-mono text-xs text-white">
  <div class="grid size-20 place-items-center rounded-sm bg-sky-6">sm</div>
  <div class="grid size-20 place-items-center rounded-lg bg-sky-6">lg</div>
  <div class="grid size-20 place-items-center rounded-2xl bg-sky-6">2xl</div>
  <div class="grid size-20 place-items-center rounded-full bg-sky-6">full</div>
  <div class="grid size-20 place-items-center rounded-t-2xl bg-violet-6">t-2xl</div>
  <div class="grid size-20 place-items-center rounded-tl-3xl rounded-br-3xl bg-pink-6">tl br</div>
</div>
```

## Border width {#border-width}

`border` តែឯងក្រាស់ 1px ហើយលេខគឺជា pixel។ `border-x`, `border-t` ជាដើម កំណត់តែជ្រុងខ្លះ។

::classes border-0 border border-2 border-4 border-8 border-x border-y border-t border-r border-b border-l border-s border-e border-t-4 border-[3px]

```preview
<div class="flex flex-wrap gap-4 font-mono text-xs text-gray-12 dark:text-white">
  <div class="grid size-20 place-items-center rounded-lg border border-sky-6">border</div>
  <div class="grid size-20 place-items-center rounded-lg border-2 border-sky-6">border-2</div>
  <div class="grid size-20 place-items-center rounded-lg border-4 border-sky-6">border-4</div>
  <div class="grid size-20 place-items-center rounded-lg border-b-4 border-sky-6 bg-gray-1 dark:bg-gray-9">border-b-4</div>
</div>
```

## Border color {#border-color}

ពណ៌ទាំងអស់ក្នុងតារាងពណ៌ ហើយធ្វើឱ្យថ្លាក៏បាន។ `border-x-*`, `border-t-*` ជាដើម ដាក់ពណ៌តែម្ខាង។

::classes border-gray-3 border-sky-6 border-sky-6/50 border-transparent border-current border-black border-white border-x-sky-6 border-t-pink-6

## Border style {#border-style}

::classes border-solid border-dashed border-dotted border-double border-hidden border-none

```preview
<div class="flex flex-wrap gap-4 font-mono text-xs text-gray-12 dark:text-white">
  <div class="grid h-16 w-28 place-items-center rounded-lg border-2 border-solid border-sky-6">solid</div>
  <div class="grid h-16 w-28 place-items-center rounded-lg border-2 border-dashed border-sky-6">dashed</div>
  <div class="grid h-16 w-28 place-items-center rounded-lg border-2 border-dotted border-sky-6">dotted</div>
  <div class="grid h-16 w-28 place-items-center rounded-lg border-4 border-double border-sky-6">double</div>
</div>
```

## Divide {#divide}

បន្ទាត់ខណ្ឌរវាង element ខាងក្នុង ដោយគ្មានបន្ទាត់មុន element ទីមួយ ឬក្រោយ element ចុងក្រោយ។ `divide-x` សម្រាប់ជួរដេក, `divide-y` សម្រាប់ជួរឈរ។

::classes divide-x divide-y divide-x-2 divide-y-4 divide-x-reverse divide-y-reverse divide-gray-3 divide-sky-6 divide-dashed divide-dotted

```preview
<ul class="max-w-sm divide-y divide-gray-3 rounded-xl border border-gray-3 dark:divide-gray-8 dark:border-gray-8">
  <li class="flex items-center justify-between px-4 py-3 text-sm"><span class="font-medium text-gray-12 dark:text-white">@kbach/react</span><span class="text-gray-7 dark:text-gray-4">web</span></li>
  <li class="flex items-center justify-between px-4 py-3 text-sm"><span class="font-medium text-gray-12 dark:text-white">@kbach/react-native</span><span class="text-gray-7 dark:text-gray-4">native</span></li>
  <li class="flex items-center justify-between px-4 py-3 text-sm"><span class="font-medium text-gray-12 dark:text-white">@kbach/browser</span><span class="text-gray-7 dark:text-gray-4">HTML</span></li>
</ul>
```

## Outline width, color និង style {#outline-width-color-and-style}

Outline នៅខាងក្រៅ border ហើយមិនយកកន្លែងទេ។ `outline-hidden` លាក់ outline តែនៅតែបង្ហាញក្នុង high contrast mode របស់ Windows។

::classes outline outline-0 outline-1 outline-2 outline-4 outline-sky-6 outline-solid outline-dashed outline-dotted outline-double outline-none outline-hidden

## Outline offset {#outline-offset}

គម្លាតរវាង outline និងគែមប្រអប់។

::classes outline-offset-0 outline-offset-1 outline-offset-2 outline-offset-4 -outline-offset-2

```preview
<div class="flex flex-wrap gap-6">
  <button class="rounded-lg bg-sky-6 px-4 py-2 text-sm font-semibold text-white outline-2 outline-offset-2 outline-sky-6">outline-offset-2</button>
  <button class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-12 outline-2 outline-dashed outline-offset-4 outline-violet-6 dark:bg-gray-9 dark:text-white">dashed, offset-4</button>
  <button class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-12 shadow-sm ring-1 ring-gray-3 hover:bg-gray-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-5 dark:bg-gray-9 dark:text-white dark:ring-gray-8">Tab to me</button>
</div>
```
