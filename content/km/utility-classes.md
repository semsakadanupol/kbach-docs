---
title: Utility classes
description: ឈ្មោះ class របស់ Kbach ផ្គុំឡើងដោយរបៀបណា ដើម្បីឱ្យអ្នកអានយល់ ទាយ class ដែលត្រូវការបាន និងប្រើតម្លៃដែលមិនមានក្នុងមាត្រដ្ឋានស្រាប់។
---

## មួយ class មួយតួនាទី {#the-idea}

Class នីមួយៗរបស់ Kbach មានតួនាទីតូចតែមួយ៖ `p-6` ដាក់ padding, `rounded-xl` ធ្វើឱ្យជ្រុងមូល, `shadow-lg` ដាក់ស្រមោល។ យើងហៅ class បែបនេះថា **utility class**។ ចង់រចនា element ណា គ្រាន់តែដាក់ class ដែលត្រូវការលើវា៖

```preview
<div class="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-black/5 max-w-md dark:bg-gray-10 dark:ring-white/10">
  <div class="grid size-12 shrink-0 place-items-center rounded-xl bg-linear-to-br from-amber-4 to-orange-6 text-xl font-bold text-white">K</div>
  <div class="min-w-0">
    <p class="font-semibold text-gray-12 dark:text-white">New message</p>
    <p class="truncate text-sm text-gray-7 dark:text-gray-4">Your build finished in 1.2 seconds, with no warnings.</p>
  </div>
  <span class="ml-auto rounded-full bg-emerald-2 px-2.5 py-1 text-xs font-medium text-emerald-9 dark:bg-emerald-10 dark:text-emerald-2">Done</span>
</div>
```

គ្មាន class ណាមួយខាងលើជា class ដែលយើងបង្កើតខ្លួនឯងទេ។ ប្តូរ class ណាមួយ គឺប្តូរតែចំណុចនោះប៉ុណ្ណោះ។ ការរចនាបែបនេះងាយកែ ព្រោះ class មិនប៉ះពាល់អ្វីក្រៅពី element ដែលវានៅលើ ហើយក៏គ្មាន stylesheet ដែលចេះតែរីកធំរហូតដែរ។

## ឈ្មោះ class ផ្គុំឡើងយ៉ាងដូចម្តេច {#how-a-class-name-is-built}

Class ភាគច្រើនមានពីរផ្នែក គឺ **utility** និង **តម្លៃ** ភ្ជាប់គ្នាដោយសញ្ញា `-`៖

| Class | Utility | តម្លៃ | អត្ថន័យ |
| :-- | :-- | :-- | :-- |
| `p-4` | `p` (padding) | `4` | Padding 16px គ្រប់ជ្រុង |
| `px-4` | `px` (padding ឆ្វេង និងស្តាំ) | `4` | 16px ខាងឆ្វេង និងខាងស្តាំ |
| `mt-2` | `mt` (margin ខាងលើ) | `2` | Margin 8px ពីខាងលើ |
| `text-lg` | `text` (ទំហំអក្សរ) | `lg` | អក្សរធំ |
| `bg-blue-6` | `bg` (ផ្ទៃខាងក្រោយ) | `blue-6` | ពណ៌ខៀវ កម្រិត 6 |
| `rounded-xl` | `rounded` (ជ្រុង) | `xl` | ជ្រុងមូលធំ |

Class ខ្លះមានតែមួយពាក្យ៖ `flex`, `hidden`, `italic`, `underline`, `truncate`។

អក្សរកាត់ដែលអ្នកនឹងជួបញឹកញាប់៖ `p` គឺ padding, `m` គឺ margin។ បន្ថែម `x` (ឆ្វេង និងស្តាំ), `y` (លើ និងក្រោម), `t` លើ, `r` ស្តាំ, `b` ក្រោម, `l` ឆ្វេង។ `w` គឺទទឹង, `h` គឺកម្ពស់, `bg` គឺផ្ទៃខាងក្រោយ។

## លេខកើនម្តង 4px {#the-spacing-scale}

ក្នុង class គម្លាត និងទំហំ លេខកើនមួយ គឺកើន 4px (0.25rem)៖

| Class | ទំហំ |
| :-- | :-- |
| `p-0.5` | 2px |
| `p-1` | 4px |
| `p-2` | 8px |
| `p-4` | 16px |
| `p-6` | 24px |
| `p-8` | 32px |
| `p-px` | 1px |

លេខដដែលនេះប្រើសម្រាប់ margin (`m-`), គម្លាតរវាង element (`gap-`), ទទឹង និងកម្ពស់ (`w-`, `h-`, `size-`), ទីតាំង (`top-`, `inset-`) និងការរំកិល (`translate-`)។ ដាក់សញ្ញា `-` ពីមុខ ដើម្បីបានតម្លៃអវិជ្ជមាន៖ `-mt-2` ទាញ element ឡើងលើ 8px។

ទទឹងក៏អាចប្រើប្រភាគ ឬពាក្យដែរ៖ `w-1/2` គឺពាក់កណ្តាល, `w-full` គឺ 100%។

ចំណែក border, ring និង outline វិញ លេខគឺជា pixel ផ្ទាល់៖ `border-2` គឺ border ក្រាស់ 2px។

## តម្លៃដែលមាត្រដ្ឋានគ្មាន {#arbitrary-values}

ពេលត្រូវការតម្លៃជាក់លាក់ សូមដាក់វាក្នុងតង្កៀបការ៉េ៖

```html
<div class="w-[22rem] mt-[3px] bg-[#c7a25d] text-[22px]"></div>
```

ឈ្មោះ class មិនអាចមានដកឃ្លាទេ ដូច្នេះកន្លែងណាដែល CSS ត្រូវការដកឃ្លា សូមប្រើសញ្ញា `_` ជំនួស៖ `grid-cols-[1fr_2fr]` ក្លាយជា `grid-template-columns: 1fr 2fr`។

លើ web តម្លៃក្នុងតង្កៀបអាចជា CSS អ្វីក៏បាន ទាំង `calc()`, `min()`, `max()`, `clamp()` និង `var()` ដូចជា `w-[calc(100%-2rem)]`។ សម្រាប់ CSS variable មានរបៀបសរសេរខ្លីជាងក្នុងវង់ក្រចក៖ `p-(--gap)` ស្មើនឹង `p-[var(--gap)]`។

លើ React Native តម្លៃក្នុងតង្កៀបត្រូវតែជា `px` ឬ `rem`។ មើលនៅ [React Native](/react-native#values-in-brackets)។

### ពេលតម្លៃមួយអាចមានន័យពីរ {#type-hints}

Utility ខ្លះកំណត់របស់ផ្សេងគ្នា អាស្រ័យលើតម្លៃ។ Kbach មើលតម្លៃ ដើម្បីដឹងថាត្រូវកំណត់អ្វី៖ `text-[22px]` ជាទំហំអក្សរ ចំណែក `text-[#c7a25d]` ជាពណ៌អក្សរ។ ករណីវាមិនអាចដឹងបាន ដូចជាពេលប្រើ CSS variable សូមប្រាប់ប្រភេទតម្លៃ (**type hint**) នៅពីមុខ៖

```html
<p class="text-[length:var(--title-size)] text-[color:var(--title-color)]"></p>
<div class="bg-[image:var(--hero)]"></div>
```

ប្រភេទដែលអាចប្រាប់បានគឺ `color`, `length`, `image`, `url`, `position`, `size`, `number` និង `percentage`។ ក្នុងវង់ក្រចកក៏ប្រើបានដែរ៖ `text-(length:--title-size)`។

## CSS property ដែលគ្មាន class {#arbitrary-properties}

លើ web បើ CSS property ណាគ្មាន utility សូមសរសេរ declaration ទាំងមូលក្នុងតង្កៀបការ៉េ៖

```html
<div class="[mask-type:luminance] [overflow-wrap:anywhere]"></div>
```

## ឱ្យ class មួយមានអាទិភាព {#important}

ដាក់ `!` នៅពីមុខ ឬពីក្រោយ class ដើម្បីឱ្យវាក្លាយជា `!important` ហើយមានអាទិភាពជាង style ផ្សេងទៀត៖

```html
<p class="!p-4">Always 16px of padding.</p>
<p class="p-4!">The same.</p>
```

## ពណ៌ថ្លា {#opacity}

ដាក់សញ្ញា `/` និងលេខនៅក្រោយពណ៌ ដើម្បីកំណត់កម្រិតដិត ពី `0` (មើលមិនឃើញ) ដល់ `100` (ដិតពេញ)៖ `bg-black/50`, `text-blue-6/80`, `border-white/10`។ មើលបន្ថែមនៅ [ពណ៌](/colors#opacity)។

## Class ដែលប្រើរួមគ្នាបាន {#combining-utilities-that-share-a-property}

Class ខ្លះមើលទៅដូចជានឹងជាន់គ្នា តែតាមពិតវាប្រើរួមគ្នាបាន ហើយមិនចាំបាច់ខ្វល់ពីលំដាប់ទេ៖

- `shadow-*` និង `ring-*` (ខ្សែព័ទ្ធជុំវិញ) បង្ហាញជាមួយគ្នា។
- `translate-*`, `rotate-*`, `scale-*` និង `skew-*` ប្រើរួមគ្នា៖ `rotate-6 scale-110` មានប្រសិទ្ធភាពទាំងពីរ។
- `blur-*`, `brightness-*` និង filter ផ្សេងៗ ប្រើរួមគ្នា។
- `duration-*` និង `ease-*` កែ `transition-*` បាន មិនថាដាក់មុន ឬក្រោយវាទេ។

```preview
<div class="flex flex-wrap items-center gap-6">
  <div class="size-20 rounded-2xl bg-white shadow-lg ring-2 ring-sky-5 ring-offset-4 dark:bg-gray-10 dark:ring-offset-gray-12"></div>
  <div class="size-20 rounded-2xl bg-sky-5 rotate-6 scale-110 skew-x-3"></div>
  <div class="size-20 rounded-2xl bg-linear-to-br from-sky-4 to-indigo-7 blur-[1px] brightness-110 saturate-150"></div>
</div>
```

## រក class ដែលអ្នកត្រូវការ {#finding-the-class-you-need}

ទំព័រ [Utilities](/layout) មាន class ទាំងអស់ចែកតាមប្រធានបទ ព្រមទាំង CSS ដែលវាបង្កើត និងឧទាហរណ៍ផ្ទាល់។ ការស្វែងរក (<kbd>Ctrl</kbd> <kbd>K</kbd>) រកទំព័របានតាមពាក្យណាមួយ ហើយ [VS Code extension](/editor-setup) ណែនាំ class ឱ្យពេលអ្នកវាយ។
