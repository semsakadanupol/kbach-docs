---
title: សេចក្តីផ្តើម
nav: សេចក្តីផ្តើម
description: Kbach ជួយអ្នករចនារូបរាង element ដោយគ្រាន់តែដាក់ឈ្មោះ class ខ្លីៗ ដូចជា p-4 ឬ bg-blue-6។ ឈ្មោះ class ដដែលប្រើបានទាំងលើ web, ក្នុង app React Native និងក្នុងទំព័រ HTML ធម្មតា។
---

## Kbach ធ្វើអ្វីខ្លះ {#what-kbach-does}

ពេលប្រើ Kbach អ្នកមិនចាំបាច់សរសេរ stylesheet ដាច់ដោយឡែកទេ។ គ្រាន់តែដាក់ class ខ្លីៗពីរបីលើ element ហើយ class នីមួយៗកំណត់រូបរាងតែមួយចំណុចប៉ុណ្ណោះ៖

```tsx title="Card.tsx"
<div className="rounded-xl bg-white p-6 shadow-lg">
  <h2 className="text-lg font-semibold">Hello, Kbach</h2>
  <p className="mt-2 text-sm text-gray-7">Every class here sets one thing.</p>
</div>
```

អានពីឆ្វេងទៅស្តាំ៖ `rounded-xl` ធ្វើឱ្យជ្រុងមូល, `bg-white` ឱ្យផ្ទៃខាងក្រោយពណ៌ស, `p-6` ទុកគម្លាត 24px នៅខាងក្នុង ហើយ `shadow-lg` ដាក់ស្រមោលធំ។ ចំណែកអក្សរវិញ `text-lg` ពង្រីកទំហំអក្សរ, `font-semibold` ធ្វើឱ្យអក្សរដិតបន្តិច, `mt-2` ទុកគម្លាត 8px ពីខាងលើ ហើយ `text-gray-7` ឱ្យអក្សរពណ៌ប្រផេះ។ លទ្ធផលមើលទៅដូចនេះ៖

```preview
<div class="max-w-sm rounded-xl bg-white p-6 shadow-lg dark:bg-gray-10">
  <h2 class="text-lg font-semibold text-gray-12 dark:text-white">Hello, Kbach</h2>
  <p class="mt-2 text-sm text-gray-7 dark:text-gray-4">Every class here sets one thing.</p>
</div>
```

ដោយសារ class នីមួយៗតូច ហើយឈ្មោះប្រាប់ស្រាប់ថាវាធ្វើអ្វី អ្នកគ្រាន់តែមើល class ក៏ដឹងថា element នោះមានរូបរាងយ៉ាងណាដែរ។ ចង់ប្តូររូបរាង គ្រាន់តែប្តូរ class។ មិនចាំបាច់គិតឈ្មោះ style ថ្មី ហើយក៏គ្មានឯកសារ CSS មួយទៀតដែលត្រូវថែទាំឱ្យត្រូវគ្នាជាមួយកូដដែរ។ ការពន្យល់ពេញលេញមាននៅទំព័រ [Utility classes](/utility-classes)។

## ប្រើបាននៅកន្លែងណាខ្លះ {#where-it-runs}

នៅពីក្រោយ Kbach មាន engine តែមួយ សរសេរដោយភាសា Rust ដែលស្គាល់អត្ថន័យនៃ class ទាំងអស់។ Engine នេះដំណើរការបានបីកន្លែង៖

::cards

- **Web (React)៖** ពេលអ្នក build, plugin សម្រាប់ Vite ឬ Next.js រក class ក្នុងកូដរបស់អ្នក ហើយសរសេរ CSS ដែលត្រូវការចូលក្នុងឯកសារតែមួយ។ ពេលទំព័របើកក្នុង browser គ្មានកូដណាត្រូវរត់ដើម្បីដាក់ style ទៀតទេ។
- **React Native៖** ពេល element render, Kbach បំប្លែង class ទៅជា style object របស់ React Native ទាំងលើ Android, iOS និង Expo។
- **HTML ធម្មតា៖** ដាក់ tag `<script>` តែមួយពី CDN នោះ browser នឹងដាក់ style ឱ្យទំព័រដោយខ្លួនឯង។ មិនបាច់ build និងមិនបាច់ប្រើ React។

ទាំងបីកន្លែងប្រើឈ្មោះ class ដូចគ្នា ពណ៌ដូចគ្នា និងឯកសារការកំណត់តែមួយ គឺ `kbach.config.js`។ ប៉ុន្តែទូរស័ព្ទមិនមែនជាទំព័រ web ទេ ដូច្នេះមាន class ខ្លះ ដូចជា layout បែប grid, filter, gradient និង transition ប្រើបានតែលើ web ប៉ុណ្ណោះ។ ទំព័រ [React Native](/react-native) ប្រាប់ច្បាស់ថាអ្វីខ្លះប្រើបានលើទូរស័ព្ទ ហើយក្នុងតារាងឯកសារយោង class ណាដែលគ្មានប្រសិទ្ធភាពលើទូរស័ព្ទ មានសញ្ញា **Web only**។

## Package ទាំងឡាយ {#the-packages}

| Package | ប្រើសម្រាប់ |
| :-- | :-- |
| `@kbach/react` | React លើ web ជាមួយ Vite, Next.js ឬ PostCSS |
| `@kbach/react-native` | React Native និង Expo៖ Android, iOS, Expo Go និង Expo Web |
| `@kbach/browser` | ទំព័រ HTML ធម្មតា ដោយទាញពី CDN |
| `@kbach/cli` | រៀបចំ project (`init`) និងពិនិត្យ project (`doctor`) |
| Kbach IntelliSense | Extension សម្រាប់ VS Code៖ ណែនាំ class, បង្ហាញ CSS ពេល hover និងរកការវាយខុស |

អ្នកដំឡើងតែមួយក្នុងចំណោម package បីដំបូង អាស្រ័យលើកន្លែងដែលកូដរបស់អ្នករត់។ ចំណែក engine គឺ package `@kbach/core-engine` ដែលមកជាមួយ package ផ្សេងៗស្រាប់ ដូច្នេះអ្នកមិនចាំបាច់ដំឡើងវាដោយខ្លួនឯងទេ។

## ធ្លាប់ប្រើ Tailwind CSS ហើយឬ? {#already-know-tailwind-css}

ឈ្មោះ class របស់ Kbach យកតាម Tailwind CSS ដូច្នេះបើអ្នកធ្លាប់ប្រើ Tailwind អ្នកស្គាល់ភាគច្រើនរួចហើយ។ ចំណុចខុសគ្នាធំជាងគេគឺពណ៌៖ កម្រិតពណ៌មានពី `1` (ស្រាលបំផុត) ដល់ `12` (ដិតបំផុត) ដូច្នេះត្រូវសរសេរ `bg-blue-6` មិនមែន `bg-blue-500` ទេ។ ចំណុចខុសគ្នាទាំងអស់មាននៅទំព័រ [មកពី Tailwind CSS](/coming-from-tailwind)។

## គួរអានអ្វីបន្ទាប់ {#where-to-go-next}

1. [ដំឡើង Kbach](/installation) សម្រាប់ React, React Native ឬទំព័រ HTML ធម្មតា។
2. ធ្វើតាមមេរៀន [ចាប់ផ្តើមរហ័ស](/quick-start) ដើម្បីបង្កើត component ដំបូង ម្តងមួយ class។
3. អាន [របៀបដែល Kbach ដំណើរការ](/how-it-works) និង [Utility classes](/utility-classes) ដើម្បីយល់ពីអ្វីដែលអ្នកកំពុងសរសេរ។
