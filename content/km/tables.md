---
title: Tables
description: Border collapse និង spacing, table layout និងទីតាំង caption។
---

## Border collapse {#border-collapse}

`border-collapse` បញ្ចូល border របស់ក្រឡាជាប់គ្នាឱ្យទៅជាបន្ទាត់តែមួយ។ `border-separate` ទុក border របស់ក្រឡានីមួយៗដាច់ដោយឡែក ដោយមាន `border-spacing-*` ជាគម្លាតនៅចន្លោះ។

::classes border-collapse border-separate

```preview
<table class="w-full max-w-md border-collapse overflow-hidden rounded-xl text-left text-sm">
  <thead class="bg-gray-2 text-gray-12 dark:bg-gray-9 dark:text-white">
    <tr><th class="border border-gray-3 px-4 py-2 font-semibold dark:border-gray-8">Package</th><th class="border border-gray-3 px-4 py-2 font-semibold dark:border-gray-8">For</th></tr>
  </thead>
  <tbody class="text-gray-8 dark:text-gray-3">
    <tr><td class="border border-gray-3 px-4 py-2 font-mono dark:border-gray-8">@kbach/react</td><td class="border border-gray-3 px-4 py-2 dark:border-gray-8">React on the web</td></tr>
    <tr><td class="border border-gray-3 px-4 py-2 font-mono dark:border-gray-8">@kbach/react-native</td><td class="border border-gray-3 px-4 py-2 dark:border-gray-8">Android, iOS, Expo</td></tr>
    <tr><td class="border border-gray-3 px-4 py-2 font-mono dark:border-gray-8">@kbach/browser</td><td class="border border-gray-3 px-4 py-2 dark:border-gray-8">Plain HTML</td></tr>
  </tbody>
</table>
```

## Border spacing {#border-spacing}

គម្លាតរវាងក្រឡារបស់តារាង `border-separate` តាមមាត្រដ្ឋានគម្លាត។ `border-spacing-x-*` និង `-y-*` កំណត់តែមួយទិស។

::classes border-spacing-0 border-spacing-1 border-spacing-2 border-spacing-4 border-spacing-x-4 border-spacing-y-1

```preview
<table class="border-separate border-spacing-2 text-left text-sm">
  <tbody class="text-gray-12 dark:text-white">
    <tr><td class="rounded-lg bg-sky-2 px-4 py-2 dark:bg-sky-10">sm</td><td class="rounded-lg bg-sky-2 px-4 py-2 dark:bg-sky-10">640px</td></tr>
    <tr><td class="rounded-lg bg-sky-2 px-4 py-2 dark:bg-sky-10">md</td><td class="rounded-lg bg-sky-2 px-4 py-2 dark:bg-sky-10">768px</td></tr>
    <tr><td class="rounded-lg bg-sky-2 px-4 py-2 dark:bg-sky-10">lg</td><td class="rounded-lg bg-sky-2 px-4 py-2 dark:bg-sky-10">1024px</td></tr>
  </tbody>
</table>
```

## Table layout {#table-layout}

`table-auto` កំណត់ទំហំជួរឈរតាមមាតិកា។ `table-fixed` កំណត់ទំហំពីជួរដេកទីមួយ (ឬពីទទឹងដែលអ្នកកំណត់) ហើយមិនខ្វល់ពីជួរដេកផ្សេងទៀត។ វាលឿនជាង ហើយជួរឈរមិនរើទៅមក ពេលមាតិកាប្តូរ។

::classes table-auto table-fixed

```preview
<table class="w-full table-fixed text-left text-sm">
  <thead class="text-gray-12 dark:text-white">
    <tr class="border-b border-gray-3 dark:border-gray-8"><th class="w-1/2 py-2 font-semibold">Class</th><th class="py-2 font-semibold">Shade</th><th class="py-2 font-semibold">Use</th></tr>
  </thead>
  <tbody class="text-gray-8 dark:text-gray-3">
    <tr class="border-b border-gray-3 dark:border-gray-8"><td class="truncate py-2 pr-4 font-mono">bg-sky-1</td><td class="py-2">1</td><td class="py-2">Page tint</td></tr>
    <tr><td class="truncate py-2 pr-4 font-mono">bg-sky-6</td><td class="py-2">6</td><td class="py-2">Solid</td></tr>
  </tbody>
</table>
```

## Caption side {#caption-side}

::classes caption-top caption-bottom

```preview
<table class="w-full max-w-sm text-left text-sm">
  <caption class="caption-bottom pt-3 text-xs text-gray-7 dark:text-gray-4">Default breakpoints, all min-width.</caption>
  <tbody class="text-gray-12 dark:text-white">
    <tr class="border-b border-gray-3 dark:border-gray-8"><td class="py-2 font-mono">md</td><td class="py-2 text-right">768px</td></tr>
    <tr><td class="py-2 font-mono">lg</td><td class="py-2 text-right">1024px</td></tr>
  </tbody>
</table>
```
