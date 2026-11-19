---
title: Interactivity
description: Cursor, pointer events, ការជ្រើសអក្សរ, resize, scroll, scroll snap, touch action, ពណ៌របស់ form control និង color scheme។
---

## Cursor {#cursor}

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

## Pointer events {#pointer-events}

`pointer-events-none` ឱ្យការចុចឆ្លងកាត់ប្រអប់ ទៅដល់អ្វីដែលនៅពីក្រោម៖ មានប្រយោជន៍សម្រាប់ icon ដែលដាក់ពីលើ input។

::classes pointer-events-auto pointer-events-none

```preview
<label class="relative block max-w-xs">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-6"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
  <input placeholder="Search classes" class="h-10 w-full rounded-lg border border-gray-3 bg-white pr-3 pl-9 text-sm text-gray-12 outline-none focus:border-sky-6 focus:ring-2 focus:ring-sky-6/20 dark:border-gray-8 dark:bg-gray-9 dark:text-white" />
</label>
```

## User select {#user-select}

កំណត់ថាអ្នកប្រើអាចជ្រើសអក្សរបានឬអត់៖ `select-all` ជ្រើសអក្សរទាំងអស់ដោយចុចតែម្តង ចំណែក `select-none` មិនឱ្យជ្រើសសោះ។

::classes select-none select-text select-all select-auto

```preview
<div class="flex flex-wrap gap-3 text-sm">
  <code class="rounded-lg bg-gray-1 px-3 py-2 font-mono text-gray-12 select-all dark:bg-gray-9 dark:text-white">npm install @kbach/react</code>
  <button class="rounded-lg bg-sky-6 px-3 py-2 font-semibold text-white select-none">Not selectable</button>
</div>
```

## Resize {#resize}

កំណត់ថាអ្នកប្រើអាចអូសដើម្បីប្តូរទំហំប្រអប់បានឬអត់ (`resize` អូសបានទាំងពីរទិស)។ ប្រអប់ត្រូវមាន `overflow` ផ្សេងពី visible ទើបប្រើបាន។

::classes resize resize-none resize-x resize-y

```preview
<textarea class="h-24 w-full max-w-sm resize-y rounded-lg border border-gray-3 bg-white p-3 text-sm text-gray-12 dark:border-gray-8 dark:bg-gray-9 dark:text-white">Drag the corner to make me taller.</textarea>
```

## Field sizing {#field-sizing}

`field-sizing-content` ឱ្យប្រអប់វាយអក្សរពង្រីកតាមអក្សរដែលវាយចូល។

::classes field-sizing-fixed field-sizing-content

```preview
<textarea rows="2" class="min-h-10 w-full max-w-sm rounded-lg border border-gray-3 bg-white p-3 text-sm text-gray-12 field-sizing-content dark:border-gray-8 dark:bg-gray-9 dark:text-white">Type more lines here: the box grows to fit.</textarea>
```

## Accent color និង caret color {#accent-color-and-caret-color}

`accent-*` ដាក់ពណ៌ឱ្យ checkbox, radio, range slider និង progress bar របស់ browser។ `caret-*` ដាក់ពណ៌ឱ្យសញ្ញាវាយអក្សរ។

::classes accent-sky-6 accent-pink-6 accent-auto caret-sky-6 caret-pink-6

```preview
<div class="flex flex-wrap items-center gap-6 text-sm text-gray-12 dark:text-white">
  <label class="flex items-center gap-2"><input type="checkbox" checked class="size-4 accent-pink-6" /> accent-pink-6</label>
  <label class="flex items-center gap-2"><input type="radio" checked class="size-4 accent-sky-6" /> accent-sky-6</label>
  <input type="range" class="accent-violet-6" />
  <input value="caret-pink-6" class="h-9 rounded-lg border border-gray-3 px-3 caret-pink-6 dark:border-gray-8 dark:bg-gray-9" />
</div>
```

## Appearance {#appearance}

`appearance-none` ដករូបរាងស្រាប់របស់ form control ចេញ ដើម្បីឱ្យអ្នករចនាវាដោយខ្លួនឯង។

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

## Color scheme {#color-scheme}

ប្រាប់ browser ថាផ្នែកណាមួយនៃទំព័រកំពុងនៅ mode ណា ដើម្បីឱ្យ scrollbar និង form control មានពណ៌ស៊ីគ្នា។

::classes scheme-normal scheme-light scheme-dark scheme-light-dark scheme-only-dark

## Scroll behavior {#scroll-behavior}

`scroll-smooth` លើទំព័រ ធ្វើឱ្យការលោតទៅ `#link` រំកិលទៅដោយរលូន ជំនួសឱ្យការលោតភ្លាមៗ។

::classes scroll-auto scroll-smooth

## Scroll margin និង padding {#scroll-margin-and-padding}

`scroll-mt-*` ទុកកន្លែងពីលើ element ពេលតំណភ្ជាប់ scroll ទៅដល់វា ឧទាហរណ៍ពេលមាន header ជាប់នៅខាងលើ។ `scroll-p*-*` ធ្វើដូចគ្នា សម្រាប់ចំណុច snap របស់ប្រអប់ដែល scroll។

::classes scroll-m-4 scroll-mt-16 scroll-mx-2 scroll-p-4 scroll-pt-16 scroll-px-6

## Scroll snap {#scroll-snap}

ដាក់ `snap-x` ឬ `snap-y` លើប្រអប់ដែល scroll ហើយដាក់ `snap-start` ឬ `snap-center` លើ element ខាងក្នុង៖ ពេល scroll ឈប់ វានឹងឈប់ត្រង់ element មួយ ជំនួសឱ្យឈប់ត្រង់ណាក៏បាន។

::classes snap-x snap-y snap-both snap-none snap-mandatory snap-proximity snap-start snap-end snap-center snap-align-none snap-normal snap-always

```preview
<div class="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
  <div class="grid h-32 w-4/5 shrink-0 snap-center place-items-center rounded-xl bg-sky-6 font-semibold text-white">1</div>
  <div class="grid h-32 w-4/5 shrink-0 snap-center place-items-center rounded-xl bg-violet-6 font-semibold text-white">2</div>
  <div class="grid h-32 w-4/5 shrink-0 snap-center place-items-center rounded-xl bg-pink-6 font-semibold text-white">3</div>
  <div class="grid h-32 w-4/5 shrink-0 snap-center place-items-center rounded-xl bg-amber-6 font-semibold text-white">4</div>
</div>
```

## Touch action {#touch-action}

កំណត់ថាកាយវិការប៉ះណាខ្លះ browser គ្រប់គ្រងខ្លួនឯង។ `touch-none` ឱ្យ script របស់អ្នកគ្រប់គ្រងកាយវិការទាំងអស់ (សម្រាប់ផ្ទាំងគូររូប) ចំណែក `touch-manipulation` បិទការ zoom ដោយប៉ះពីរដង ដើម្បីឱ្យការប៉ះឆ្លើយតបភ្លាម។

::classes touch-auto touch-none touch-pan-x touch-pan-y touch-pan-left touch-pan-up touch-pinch-zoom touch-manipulation

## Will change {#will-change}

ប្រាប់ browser ជាមុនថា property ណាមួយហៀបនឹងមានចលនា ដើម្បីឱ្យវាត្រៀមខ្លួន។ ប្រើតែលើ element ដែលមានចលនា ហើយតែក្នុងពេលវាកំពុងមានចលនាប៉ុណ្ណោះ។

::classes will-change-auto will-change-scroll will-change-contents will-change-transform
