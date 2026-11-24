---
title: Transitions & Animation
description: Property ណាខ្លះប្តូរដោយរលូន ប្តូររយៈពេលប៉ុន្មាន easing និង delay បែបណា ព្រមទាំង animation spin, ping, pulse និង bounce ដែលមានស្រាប់។
---

## Transition property {#transition-property}

Property ណាខ្លះប្តូរដោយរលូន ពេលតម្លៃរបស់វាប្តូរ។ Class `transition-*` មានរយៈពេល 150ms និង easing រលូនស្រាប់ ហើយ `duration-*` និង `ease-*` អាចកែវាបាន មិនថាដាក់មុន ឬក្រោយទេ។

::classes transition transition-all transition-colors transition-opacity transition-shadow transition-transform transition-none transition-[height]

```preview
<div class="flex flex-wrap gap-4">
  <button class="rounded-lg bg-sky-6 px-4 py-2 font-semibold text-white transition-colors hover:bg-violet-6">transition-colors</button>
  <button class="rounded-lg bg-sky-6 px-4 py-2 font-semibold text-white transition hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-6/40">transition</button>
  <button class="rounded-lg bg-sky-6 px-4 py-2 font-semibold text-white transition-none hover:bg-violet-6">transition-none</button>
</div>
```

## Transition behavior {#transition-behavior}

`transition-discrete` អនុញ្ញាតឱ្យ property ដែលគ្មានតម្លៃចន្លោះ ដូចជា `display` ចូលរួមក្នុង transition បាន៖ element នៅតែមើលឃើញ រហូតដល់ចលនារសាត់បាត់ចប់។

::classes transition-normal transition-discrete

## Transition duration {#transition-duration}

::classes duration-0 duration-75 duration-100 duration-150 duration-200 duration-300 duration-500 duration-700 duration-1000 duration-[2s] duration-initial

```preview
<div class="flex flex-wrap gap-4 font-mono text-xs">
  <div class="rounded-lg bg-gray-1 px-4 py-3 text-gray-12 transition duration-150 hover:bg-sky-6 hover:text-white dark:bg-gray-9 dark:text-white">duration-150</div>
  <div class="rounded-lg bg-gray-1 px-4 py-3 text-gray-12 transition duration-500 hover:bg-sky-6 hover:text-white dark:bg-gray-9 dark:text-white">duration-500</div>
  <div class="rounded-lg bg-gray-1 px-4 py-3 text-gray-12 transition duration-1000 hover:bg-sky-6 hover:text-white dark:bg-gray-9 dark:text-white">duration-1000</div>
</div>
```

## Transition timing function {#transition-timing-function}

ខ្សែកោង easing។ ក្នុងតង្កៀបការ៉េ ដាក់ `cubic-bezier()` ណាក៏បាន។

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

## Transition delay {#transition-delay}

::classes delay-0 delay-75 delay-150 delay-300 delay-700 delay-1000

## Animation {#animation}

Animation ស្រាប់ចំនួនបួន៖ `animate-spin` សម្រាប់រូបកំពុងទាញយក, `animate-ping` សម្រាប់ចំណុចជូនដំណឹងដែលពង្រីករលកចេញ, `animate-pulse` សម្រាប់អេក្រង់ skeleton និង `animate-bounce` សម្រាប់ចង្អុលទៅអ្វីមួយ។

::classes animate-spin animate-ping animate-pulse animate-bounce animate-none

```preview
<div class="flex flex-wrap items-center gap-10">
  <svg viewBox="0 0 24 24" fill="none" class="size-8 animate-spin text-sky-6"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/><path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
  <span class="relative flex size-4"><span class="absolute inline-flex size-full animate-ping rounded-full bg-sky-5 opacity-75"></span><span class="relative inline-flex size-4 rounded-full bg-sky-6"></span></span>
  <div class="w-48 animate-pulse space-y-2"><div class="h-3 rounded bg-gray-3 dark:bg-gray-8"></div><div class="h-3 w-2/3 rounded bg-gray-3 dark:bg-gray-8"></div></div>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-8 animate-bounce text-violet-6"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
</div>
```

## Animation ផ្ទាល់ខ្លួន {#custom-animations}

ដាក់ឈ្មោះ animation ផ្ទាល់ខ្លួនក្នុង `kbach.config.js` នៅក្រោម `extend`៖ `keyframes` ផ្ទុកជំហាននីមួយៗ ហើយ `animation` ផ្ទុកតម្លៃសម្រាប់ `animation` របស់ CSS។ ឈ្មោះនីមួយៗក្នុង `animation` ក្លាយជា class `animate-<name>` ហើយ class នោះនាំ `@keyframes` របស់វាមកជាមួយ ដូច្នេះមិនចាំបាច់សរសេរ CSS ទេ។

```js title="kbach.config.js"
export default {
  extend: {
    keyframes: {
      wiggle: {
        '0%, 100%': { transform: 'rotate(-3deg)' },
        '50%': { transform: 'rotate(3deg)' },
      },
    },
    animation: {
      wiggle: 'wiggle 1s ease-in-out infinite',
      'spin-slow': 'spin 3s linear infinite',
    },
  },
};
```

```html
<button class="animate-wiggle">Wiggle</button>
<div class="animate-spin-slow"></div>
```

```preview
<div class="flex flex-wrap items-center gap-10">
  <button class="rounded-lg bg-sky-6 px-4 py-2 font-semibold text-white motion-safe:animate-wiggle">animate-wiggle</button>
  <svg viewBox="0 0 24 24" fill="none" class="size-8 text-sky-6 motion-safe:animate-spin-slow"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/><path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
</div>
```

សរសេរ property ក្នុងជំហាននីមួយៗជា camelCase (`animationTimingFunction`) ឬជា kebab-case ក្នុងសញ្ញាសម្រង់ (`'animation-timing-function'`)។ Animation មួយអាចប្រើ keyframe របស់ animation ស្រាប់បាន ដូច `spin-slow` ខាងលើ។ ឈ្មោះក្នុង `animation` ជំនួស animation ស្រាប់ដែលមានឈ្មោះដូចគ្នា។ លើទំព័រ HTML ធម្មតា ដាក់ `keyframes` និង `animation` ដដែលនេះក្នុង `window.kbachConfig`។

ដើម្បីរត់ keyframe ច្រើនក្នុងពេលតែមួយ សូមបំបែកវាដោយសញ្ញាក្បៀស ដូចក្នុង CSS។ អាចលាយរបស់អ្នក ជាមួយរបស់ដែលមានស្រាប់បាន៖

```js title="kbach.config.js"
animation: {
  'wiggle-pulse': 'wiggle 1s ease-in-out infinite, pulse 2s infinite',
},
```

ពេល keyframe ពីរប្តូរ property ដូចគ្នា ដូចជា `transform` ក្នុង `wiggle` និង `bounce` keyframe ដែលនៅចុងក្រោយក្នុងបញ្ជីឈ្នះ។

### ដោយមិនប្រើ config {#without-the-config}

`animate-[<value>]` កំណត់ `animation: <value>` ដោយប្រើ `_` ជំនួសដកឃ្លា។ វាក៏នាំ keyframe ដែលវាដាក់ឈ្មោះមកជាមួយដែរ ទោះជារបស់អ្នកពី config ឬរបស់ animation ស្រាប់ ដូចក្នុង `animate-[spin_3s_linear_infinite]`។ ចំពោះ keyframe ក្នុងឯកសារ CSS ផ្ទាល់ខ្លួន class គ្រាន់តែដាក់ឈ្មោះវា ហើយឯកសាររបស់អ្នកជាអ្នកកំណត់វា។ ចំណែក `animate-(<custom-property>)` កំណត់ `animation: var(<custom-property>)` សម្រាប់ animation ដែលទុកក្នុង CSS variable។

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

ទាំងអស់នេះប្រើជាមួយ variant បាន ដូចជា `hover:animate-wiggle` ឬ `hover:animate-[wiggle_1s_ease-in-out_infinite]`។ Keyframe ជា CSS ដូច្នេះប្រើបានតែលើ web ប៉ុណ្ណោះ៖ React Native មិនរត់ animation keyframe របស់ CSS ទេ។

## ចលនាតិច {#reduced-motion}

ដាក់ `motion-safe:` ពីមុខ animation ដើម្បីឱ្យវារត់តែចំពោះអ្នកដែលមិនបានកំណត់ឱ្យកាត់បន្ថយចលនាលើឧបករណ៍ ឬដាក់ `motion-reduce:` ដើម្បីប្តូរអ្វីមួយ ពេលអ្នកប្រើបានកំណត់បែបនោះ។

```preview
<svg viewBox="0 0 24 24" fill="none" class="size-8 text-sky-6 motion-safe:animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/><path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
```

ដើម្បីបញ្ឈប់ animation ដែលមាន `motion-safe:` សូមដាក់ `motion-safe:` លើ class ដែលបញ្ឈប់វាដែរ៖ `motion-safe:hover:animate-spin motion-safe:active:animate-none`។ `active:animate-none` ធម្មតាចាញ់វា។ សូមមើល [ពេល class ពីរកំណត់របស់ដូចគ្នា](/variants#which-class-wins)។
