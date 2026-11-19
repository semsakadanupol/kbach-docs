---
title: Accessibility
description: អក្សរសម្រាប់តែកម្មវិធីអានអេក្រង់ forced color adjust និង variant ដែលប្តូរតាមការកំណត់លើឧបករណ៍របស់អ្នកប្រើ។
---

## កម្មវិធីអានអេក្រង់ {#screen-readers}

`sr-only` លាក់ element ពីភ្នែក តែកម្មវិធីអានអេក្រង់នៅតែអានបាន៖ ឧទាហរណ៍ ស្លាកសម្រាប់ប៊ូតុងដែលមានតែ icon។ `not-sr-only` បង្ហាញវាវិញ ជាញឹកញាប់នៅទំហំអេក្រង់ណាមួយ (`sm:not-sr-only`)។

::classes sr-only not-sr-only

```preview
<button class="grid size-10 place-items-center rounded-lg bg-gray-1 text-gray-12 transition-colors hover:bg-gray-2 dark:bg-gray-9 dark:text-white dark:hover:bg-gray-8">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-5"><path d="M6 6l12 12M18 6 6 18"/></svg>
  <span class="sr-only">Close the dialog</span>
</button>
```

## Forced color adjust {#forced-color-adjust}

ក្នុង high contrast mode របស់ Windows ប្រព័ន្ធប្តូរពណ៌របស់អ្នកចោល។ `forced-color-adjust-none` រក្សាពណ៌ដើមលើ element ដែលពណ៌មានអត្ថន័យ ដូចជាប្រអប់គំរូពណ៌។

::classes forced-color-adjust-auto forced-color-adjust-none

```preview
<div class="flex gap-2">
  <span class="size-8 rounded-full bg-sky-6 forced-color-adjust-none" title="Sky"></span>
  <span class="size-8 rounded-full bg-violet-6 forced-color-adjust-none" title="Violet"></span>
  <span class="size-8 rounded-full bg-pink-6 forced-color-adjust-none" title="Pink"></span>
</div>
```

## Focus ដែលមើលឃើញ {#focus-you-can-see}

អ្នកប្រើក្តារចុចត្រូវដឹងថាខ្លួនកំពុងនៅត្រង់ណា។ `focus-visible:` បង្ហាញ style តែពេល focus មកពីក្តារចុច មិនមែនពីការចុច mouse ដូច្នេះអ្នកប្រើ mouse មិនឃើញខ្សែព័ទ្ធដែលគេមិនត្រូវការទេ។

```preview
<div class="flex flex-wrap gap-3">
  <button class="rounded-lg bg-sky-6 px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-6">Tab to me</button>
  <a href="#" class="rounded-md text-sm font-medium text-sky-7 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-6 dark:text-sky-4">And to me</a>
</div>
```

## Variant តាមការកំណត់របស់អ្នកប្រើ {#variants-for-peoples-settings}

Variant ទាំងនេះដាក់ពីមុខ class ណាក៏បាន ដើម្បីឱ្យការរចនាប្តូរតាមអ្វីដែលអ្នកប្រើកំណត់លើឧបករណ៍៖

| Variant | ប្រើពេល |
| :-- | :-- |
| `motion-reduce:` / `motion-safe:` | អ្នកប្រើកំណត់ឱ្យកាត់បន្ថយចលនា / មិនបានកំណត់ |
| `contrast-more:` / `contrast-less:` | អ្នកប្រើកំណត់ឱ្យពន្លឺផ្ទុយខ្លាំង / ខ្សោយ |
| `dark:` | Dark mode កំពុងបើក (មើលនៅ [Dark mode](/dark-mode)) |
| `print:` | កំពុងបោះពុម្ពទំព័រ |
| `aria-*:` | Element មាន attribute `aria-` ឧទាហរណ៍ `aria-expanded:rotate-180` |

```preview
<div class="flex flex-wrap items-center gap-6">
  <span class="relative flex size-4"><span class="absolute inline-flex size-full rounded-full bg-emerald-5 opacity-75 motion-safe:animate-ping"></span><span class="relative size-4 rounded-full bg-emerald-6"></span></span>
  <p class="text-sm text-gray-7 contrast-more:text-gray-12 dark:text-gray-4 dark:contrast-more:text-white">This text gets darker with more contrast.</p>
</div>
```
