---
title: Transforms
description: Translate, rotate, scale និង skew ក្នុង 2D និង 3D, transform origin, perspective និង backface visibility។
---

`translate-*`, `rotate-*`, `scale-*` និង `skew-*` ចូលក្នុង `transform` តែមួយ ដូច្នេះប្រើរួមគ្នាបាន មិនថាលំដាប់ណា៖ `rotate-6 scale-110` មានប្រសិទ្ធភាពទាំងពីរ។

## Translate {#translate}

រំកិលប្រអប់ ដោយមិនប៉ះពាល់ layout ជុំវិញ៖ ជាលេខគម្លាត ជាប្រភាគនៃទំហំប្រអប់ខ្លួនឯង ឬ `full`។

::classes translate-x-0 translate-x-4 translate-x-1/2 translate-x-full -translate-x-1/2 translate-y-2 -translate-y-full translate-z-8 translate-full translate-none translate-[10px]

```preview
<div class="flex flex-wrap gap-8">
  <div class="size-20 rounded-xl bg-gray-2 dark:bg-gray-9"><div class="size-20 translate-x-4 translate-y-4 rounded-xl bg-sky-6/80"></div></div>
  <div class="size-20 rounded-xl bg-gray-2 dark:bg-gray-9"><div class="size-20 -translate-y-1/4 rounded-xl bg-violet-6/80"></div></div>
</div>
```

## Rotate {#rotate}

គិតជាដឺក្រេ លេខវិជ្ជមានបង្វិលតាមទ្រនិចនាឡិកា។ `rotate-x-*` និង `rotate-y-*` បង្វិលក្នុង 3D (ប្រើជាមួយ perspective)។

::classes rotate-0 rotate-1 rotate-3 rotate-6 rotate-12 rotate-45 rotate-90 rotate-180 -rotate-12 rotate-x-50 rotate-y-25 rotate-z-45 rotate-[17deg]

```preview
<div class="flex flex-wrap gap-10 p-2">
  <div class="grid size-20 rotate-6 place-items-center rounded-xl bg-sky-6 font-mono text-xs text-white">rotate-6</div>
  <div class="grid size-20 rotate-45 place-items-center rounded-xl bg-violet-6 font-mono text-xs text-white">rotate-45</div>
  <div class="grid size-20 -rotate-12 place-items-center rounded-xl bg-pink-6 font-mono text-xs text-white">-rotate-12</div>
</div>
```

## Scale {#scale}

គិតជាភាគរយ៖ `scale-110` ស្មើ 110%។ `scale-x-*` និង `scale-y-*` ពង្រីកតែមួយទិស ហើយដាក់ `-` ពីមុខ ដើម្បីត្រឡប់មុខ។

::classes scale-0 scale-50 scale-75 scale-90 scale-95 scale-100 scale-105 scale-110 scale-125 scale-150 scale-x-50 scale-y-125 -scale-x-100

```preview
<div class="flex flex-wrap items-center gap-10 p-2">
  <div class="grid size-20 scale-75 place-items-center rounded-xl bg-sky-6 font-mono text-xs text-white">scale-75</div>
  <div class="grid size-20 place-items-center rounded-xl bg-violet-6 font-mono text-xs text-white">scale-100</div>
  <div class="grid size-20 scale-125 place-items-center rounded-xl bg-pink-6 font-mono text-xs text-white">scale-125</div>
  <button class="rounded-lg bg-amber-6 px-4 py-2 font-semibold text-white transition hover:scale-105 active:scale-95">Press me</button>
</div>
```

## Skew {#skew}

::classes skew-0 skew-3 skew-6 skew-12 skew-x-12 skew-y-3 -skew-x-6

```preview
<div class="flex flex-wrap gap-10 p-2">
  <div class="grid size-20 skew-x-12 place-items-center rounded-xl bg-sky-6 font-mono text-xs text-white">skew-x-12</div>
  <div class="grid size-20 -skew-y-6 place-items-center rounded-xl bg-violet-6 font-mono text-xs text-white">-skew-y-6</div>
</div>
```

## Transform origin {#transform-origin}

ចំណុចដែល transform បង្វិល និងពង្រីកជុំវិញ។

::classes origin-center origin-top origin-top-right origin-right origin-bottom-right origin-bottom origin-bottom-left origin-left origin-top-left origin-[33%_75%]

```preview
<div class="flex flex-wrap gap-12 p-4">
  <div class="size-20 rounded-xl bg-gray-2 dark:bg-gray-9"><div class="size-20 origin-center rotate-45 rounded-xl bg-sky-6/80"></div></div>
  <div class="size-20 rounded-xl bg-gray-2 dark:bg-gray-9"><div class="size-20 origin-top-left rotate-12 rounded-xl bg-violet-6/80"></div></div>
  <div class="size-20 rounded-xl bg-gray-2 dark:bg-gray-9"><div class="size-20 origin-bottom scale-75 rounded-xl bg-pink-6/80"></div></div>
</div>
```

## Perspective និង 3D {#perspective-and-3d}

`perspective-*` លើ parent ផ្តល់ជម្រៅដល់ការបង្វិល 3D របស់ element ខាងក្នុង (ចម្ងាយកាន់តែតូច មើលទៅកាន់តែខ្លាំង)។ `transform-3d` ទុក element ខាងក្នុងឱ្យនៅក្នុងលំហ 3D តែមួយ ហើយ `backface-hidden` លាក់ខ្នងប្រអប់ ពេលវាបែរចេញ។

::classes perspective-dramatic perspective-near perspective-normal perspective-midrange perspective-distant perspective-none perspective-origin-center perspective-origin-top-left transform-flat transform-3d backface-visible backface-hidden

```preview
<div class="flex flex-wrap gap-12 p-4">
  <div class="perspective-near"><div class="grid size-24 rotate-x-45 place-items-center rounded-xl bg-sky-6 font-mono text-xs text-white">rotate-x-45</div></div>
  <div class="perspective-near"><div class="grid size-24 rotate-y-45 place-items-center rounded-xl bg-violet-6 font-mono text-xs text-white">rotate-y-45</div></div>
  <div class="perspective-distant"><div class="grid size-24 rotate-y-45 place-items-center rounded-xl bg-pink-6 font-mono text-xs text-white">distant</div></div>
</div>
```

## Hardware acceleration និងដក transform ចេញ {#hardware-acceleration-and-removing-transforms}

`transform-gpu` ដាក់ប្រអប់នៅលើស្រទាប់ដាច់ដោយឡែក ដែលអាចធ្វើឱ្យ animation ខ្លះរលូនជាងមុន។ `transform-none` ដក transform ទាំងអស់ចេញ។

::classes transform-gpu transform-cpu transform-none
