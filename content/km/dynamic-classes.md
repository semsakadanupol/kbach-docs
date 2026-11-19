---
title: Dynamic classes
description: Class ដែលប្តូរពេល app កំពុងរត់ ដូចជាពណ៌ដែលអ្នកប្រើជ្រើសរើស។ របៀបសរសេរវា ដើម្បីឱ្យវាមាន CSS ជានិច្ច។
---

## ពេល build, plugin ឃើញតែឈ្មោះ class ពេញៗ {#the-build-only-sees-whole-class-names}

លើ web, plugin រក class ដោយអានកូដរបស់អ្នកជាអក្សរ ដោយមិនរត់កូដនោះទេ។ ដូច្នេះ class ត្រូវតែមានឈ្មោះ **ពេញ** នៅកន្លែងណាមួយក្នុងឯកសារដែលវាអាន៖

```tsx
// ✗ The plugin sees "bg-" and "-6", not a class
<div className={'bg-' + color + '-6'} />

// ✓ Every class is written out in full
const BG = { blue: 'bg-blue-6', red: 'bg-red-6', green: 'bg-green-6' };
<div className={BG[color]} />
```

ប៉ុន្តែសូមប្រយ័ត្ន៖ plugin ប្រមូលអក្សរតែពី `className="..."`, `className={...}`, template literal និងការហៅ `clsx()`, `cn()`, `classnames()`, `cx()` និង `kb()` ប៉ុណ្ណោះ។ Object ធម្មតាដូច `BG` ខាងលើ plugin រកឃើញ លុះត្រាតែអក្សររបស់វានៅក្នុងកន្លែងណាមួយទាំងនោះ។ វិធីងាយបំផុតគឺរុំវាដោយ `clsx()`៖

```tsx
import { clsx } from '@kbach/react';

const BG = {
  blue: clsx('bg-blue-6'),
  red: clsx('bg-red-6'),
  green: clsx('bg-green-6'),
};
```

ជាលំនាំដើម plugin អាន folder `src`, `app`, `pages` និង `components`។ បើចង់បន្ថែម folder ផ្សេង សូមប្រើ [ជម្រើស `include`](/plugin-options)។

## clsx {#clsx}

`clsx()` ភ្ជាប់ឈ្មោះ class ចូលគ្នា ហើយបោះចោលតម្លៃណាដែល falsy។ វាដូច package `clsx` ដែលគេប្រើច្រើន តែមានស្រាប់ក្នុង Kbach៖

```tsx
import { clsx } from '@kbach/react';

<button className={clsx('rounded-lg px-4 py-2', primary ? 'bg-blue-6 text-white' : 'bg-gray-2', disabled && 'opacity-50')} />;
```

វាទទួលបានទាំង string, array និង object៖ `clsx({ 'font-bold': active })`។

## safelist {#safelist}

បើអ្នកដឹងតម្លៃទាំងអស់ជាមុន សូមរាយវាក្នុងជម្រើសរបស់ plugin។ CSS នៅតែត្រូវបង្កើតពេល build ដដែល៖

```ts title="vite.config.ts"
kbach({ safelist: ['bg-blue-6', 'bg-red-6', 'bg-green-6'] });
```

## kb()៖ បង្កើត style ពេល app កំពុងរត់ {#kb-resolve-at-runtime}

បើ class ពិតជាមកពីទិន្នន័យពេល app កំពុងរត់ ដូចជាពី CMS ពីអ្វីដែលអ្នកប្រើវាយ ឬពី database សូមប្រើ `kb()` ដើម្បីបំប្លែងវាក្នុង browser។ `kb()` រត់ engine បន្ថែម CSS ចូលទំព័រ ហើយឱ្យឈ្មោះ class ដែលត្រូវប្រើមកវិញ៖

```tsx title="main.tsx"
import { initKbach } from '@kbach/react';

await initKbach(); // loads the engine once, before the first kb() call
```

```tsx
import { kb } from '@kbach/react';

function Badge({ color }: { color: string }) {
  return <span className={kb('rounded-full px-2 py-0.5 bg-' + color + '-2 text-' + color + '-9')}>New</span>;
}
```

សូមប្រើ string ដែល `kb()` ឱ្យមកវិញជានិច្ច។ ភាគច្រើន វាដូចគ្នានឹង string ដែលអ្នកបញ្ជូនទៅ។ វាខុសគ្នាតែករណីពណ៌ភ្លឺ/ងងឹតដែលតម្លៃមិនមែនជា hex ប៉ុណ្ណោះ ដែលចេញមកជា class មួយសម្រាប់ mode នីមួយៗ។ Class ណាដែលមានក្នុង `kbach.css` រួចហើយ `kb()` ទុកឱ្យ `kbach.css` ដូច្នេះ stylesheet ទាំងពីរមិនជាន់គ្នាទេ។

`kb()` ទាញយក WebAssembly ប្រហែល 195 KB (ក្រោយ gzip) ដូច្នេះគួរប្រើវាតែកន្លែងដែលត្រូវការពិតៗ។ ឧទាហរណ៍ផ្ទាល់ និង [Playground](/playground) លើគេហទំព័រនេះប្រើ `kb()`។

## គ្រប់ className ពេល runtime {#every-classname-at-runtime}

នៅមានជម្រើសមួយទៀត គឺឱ្យ `className` ទាំងអស់ឆ្លងកាត់ `kb()` ដោយស្វ័យប្រវត្តិ។ សូមកំណត់ JSX import source ហើយហៅ `initKbach()` មុនការ render លើកដំបូង៖

```json title="tsconfig.json"
{
  "compilerOptions": {
    "jsxImportSource": "@kbach/react"
  }
}
```

App ភាគច្រើនមិនត្រូវការរបៀបនេះទេ។ ការ build CSS ទុកជាមុន ហើយប្រើ `kb()` តែពីរបីកន្លែង តូចជាង និងលឿនជាង។

## លើ React Native {#on-react-native}

លើ native, class ត្រូវបំប្លែងពេល element render ដូច្នេះ class ដែលប្តូរពេល app រត់ប្រើបានធម្មតា។ មិនបាច់ស្កេន ហើយក៏មិនបាច់ `initKbach()` ដែរ។

## ក្នុងទំព័រ HTML ធម្មតា {#in-a-plain-html-page}

CDN script តាមដានទំព័រជានិច្ច ដូច្នេះ class ដែលអ្នកបន្ថែមដោយ JavaScript បាន style ភ្លាមពេលវាលេចឡើង ទោះសរសេរពេញ ឬផ្គុំពីបំណែកក៏ដោយ៖ `el.classList.add('bg-' + color + '-6')` ប្រើបានធម្មតា។
