---
title: ពណ៌
nav: ពណ៌
description: ពណ៌ 26 ក្រុម ក្រុមនីមួយៗមាន 12 កម្រិត ពណ៌ទោលមួយចំនួន និងវិធីធ្វើឱ្យពណ៌ណាក៏ដោយទៅជាថ្លា។
---

## តារាងពណ៌ {#the-palette}

Class ពណ៌មានបីផ្នែក៖ utility, ឈ្មោះពណ៌ និងកម្រិត។ `bg-blue-6` គឺផ្ទៃខាងក្រោយពណ៌ខៀវ, `text-gray-12` គឺអក្សរពណ៌ខ្មៅស្រអាប់, `border-rose-3` គឺ border ពណ៌ផ្កាឈូកស្រាល។

ពណ៌នីមួយៗមាន 12 កម្រិត ចាប់ពី `1` (ស្រាលបំផុត) ដល់ `12` (ដិតបំផុត)។ ចុចលើប្រអប់ពណ៌ដើម្បីចម្លងឈ្មោះ ដូចជា `blue-6`៖

::palette

ក្រុមពណ៌មាន amber, blue, cyan, emerald, fuchsia, gray, green, indigo, lime, mauve, mist, neutral, olive, orange, pink, purple, red, rose, sky, slate, stone, taupe, teal, violet, yellow និង zinc។ ក្រុមពណ៌ប្រផេះ (gray, mauve, mist, neutral, olive, slate, stone, taupe, zinc) ខុសគ្នាត្រឹមតែលាយក្តៅ ឬត្រជាក់ប៉ុណ្ណោះ។

## ជ្រើសកម្រិតពណ៌ {#choosing-a-shade}

វិធីងាយៗក្នុងការជ្រើសកម្រិត៖

| កម្រិត | ប្រើសម្រាប់ |
| :-- | :-- |
| `1` ដល់ `3` | ផ្ទៃខាងក្រោយទំព័រ និងកាត ពណ៌ស្រាលៗ |
| `3` ដល់ `5` | Border និងបន្ទាត់ខណ្ឌ |
| `5` ដល់ `7` | ប៊ូតុង តំណភ្ជាប់ និងពណ៌សង្កត់ផ្សេងៗ |
| `7` និង `8` | ពណ៌សង្កត់ដដែល ពេល hover ឬពេលចុច |
| `9` ដល់ `12` | អក្សរ និងផ្ទៃខាងក្រោយក្នុង dark mode |

អក្សរលើផ្ទៃភ្លឺ គួរប្រើកម្រិត `7` ឬដិតជាងនេះ ទើបងាយអាន។ អក្សរលើផ្ទៃងងឹត គួរប្រើកម្រិត `4` ឬស្រាលជាងនេះ។

បើអ្នកធ្លាប់ប្រើកម្រិតពណ៌ពី 50 ដល់ 950 នេះជាតារាងប្តូរ៖

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| `1` | `2` | `3` | `4` | `5` | `6` | `7` | `8` | `9` | `10` | `11` |

`12` ដិតជាងគេទាំងអស់។ `text-amber-700` មិនមានក្នុង Kbach ទេ ហើយគ្មានពណ៌អ្វីសោះ សូមសរសេរ `text-amber-8` វិញ។

## ពណ៌ប្រើបាននៅណាខ្លះ {#where-colors-go}

Utility ណាដែលកំណត់ពណ៌ ប្រើឈ្មោះពណ៌ដូចគ្នាទាំងអស់៖ `bg-` (ផ្ទៃខាងក្រោយ), `text-`, `border-`, `ring-`, `outline-`, `shadow-`, `divide-`, `decoration-` (បន្ទាត់ពីក្រោមអក្សរ), `fill-` និង `stroke-` (SVG), `accent-` (checkbox និង slider), `caret-` (សញ្ញាវាយអក្សរ) និង `from-`, `via-`, `to-` (gradient)។

## ពណ៌ទោល {#single-colors}

| ឈ្មោះ class | តម្លៃ |
| :-- | :-- |
| `white` | `#ffffff` |
| `black` | `#000000` |
| `transparent` | ថ្លាទាំងស្រុង |
| `gold` | `#d4af37` |
| `silver` | `#c0c0c0` |
| `bronze` | `#cd7f32` |
| `copper` | `#b87333` |
| `coal` | `#1c1c1c` |
| `current` | ពណ៌អក្សររបស់ element (តែលើ web) |
| `inherit` | យកតម្លៃពី parent (តែលើ web) |
| `surface` | `#f9fafb` ក្នុង light mode, `#111827` ក្នុង dark mode (តែលើ web) |

`surface` ជាពណ៌ **mode-aware**៖ class តែមួយ តែមានតម្លៃពីរ គឺមួយសម្រាប់ light mode និងមួយសម្រាប់ dark mode។ ដូច្នេះ `bg-surface` ប្តូរពណ៌ដោយខ្លួនឯង ដោយមិនបាច់ដាក់ `dark:` ទេ។ អ្នកអាចបង្កើតពណ៌ mode-aware ផ្ទាល់ខ្លួនបាន ហើយប្រើបានគ្រប់ platform៖ មើលនៅ [ពណ៌ Theme](/theme-colors)។

## ពណ៌ថ្លា {#opacity}

ដាក់សញ្ញា `/` និងលេខពី 0 ដល់ 100 ដើម្បីធ្វើឱ្យពណ៌ថ្លា។ `0` មើលមិនឃើញសោះ ចំណែក `100` ដិតពេញ៖

```preview
<div class="flex gap-3">
  <div class="size-16 rounded-xl bg-violet-6"></div>
  <div class="size-16 rounded-xl bg-violet-6/75"></div>
  <div class="size-16 rounded-xl bg-violet-6/50"></div>
  <div class="size-16 rounded-xl bg-violet-6/25"></div>
  <div class="size-16 rounded-xl bg-violet-6/10"></div>
</div>
```

```html
<div class="bg-black/50 text-white/90 border-gray-12/10"></div>
```

វាប្រើបានជាមួយពណ៌ទាំងអស់ រួមទាំងពណ៌ផ្ទាល់ខ្លួន និងពណ៌ mode-aware (`bg-surface/80`)។ លេខអាចមានក្បៀស (`bg-white/2.5`) ហើយក្នុងតង្កៀបការ៉េ អាចជាប្រភាគ ឬភាគរយ (`bg-black/[0.37]`, `bg-black/[37%]`)។ លើ web អាចប្រើ CSS variable ដែលផ្ទុកភាគរយបានទៀត៖ `bg-black/(--overlay)`។

## ពណ៌ផ្សេងទៀត {#any-other-color}

បើពណ៌ដែលចង់បានមិនមានក្នុងតារាងពណ៌ សូមដាក់វាក្នុងតង្កៀបការ៉េ៖ `bg-[#c7a25d]`, `text-[rgb(20_30_40)]`។ ធ្វើឱ្យថ្លាក៏បានដូចគ្នា៖ `bg-[#c7a25d]/40`។ កន្លែងណាដែលតម្លៃពណ៌មានដកឃ្លា សូមប្រើ `_` ជំនួស។

បើប្រើពណ៌ណាមួយញឹកញាប់ គួរដាក់ឈ្មោះឱ្យវាក្នុង `kbach.config.js` ដើម្បីសរសេរខ្លីៗ ដូចជា `bg-brand`៖ មើលនៅ [ពណ៌ Theme](/theme-colors)។

## ពណ៌ក្នុង JavaScript {#colors-in-javascript}

ពេលខ្លះអ្នកត្រូវការពណ៌ជាតម្លៃ មិនមែនជា class ទេ ដូចជាសម្រាប់គំនូសតាង canvas ឬ component ដែលទទួល prop ពណ៌។ `useColors()` ឱ្យអ្នកយកពណ៌ពីតារាងពណ៌បាន៖

```tsx
import { useColors } from '@kbach/react'; // or '@kbach/react-native'

function Chart() {
  const colors = useColors();
  colors.blue[6];               // '#3b82f6'
  colors.blue['6/50'];          // blue-6, half see-through
  colors.alpha('#3b82f6', 30);  // any color, 30% solid
  colors.get('brand');          // a color from your kbach.config.js
  return null;
}
```

លើ web ពណ៌ mode-aware ចេញមកជា `rgb(var(--kb-color-<name>))` ដែលជាតម្លៃ CSS ប្តូរតាម light mode និង dark mode ដោយខ្លួនឯង។
