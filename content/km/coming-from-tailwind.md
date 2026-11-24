---
title: មកពី Tailwind CSS
nav: មកពី Tailwind CSS
description: ឈ្មោះ class របស់ Kbach យកតាម Tailwind CSS v4.3។ ទំព័រនេះប្រាប់ថាអ្វីខ្លះដូចគ្នា និងគ្រប់ចំណុចដែល Kbach ខុសគ្នា។
---

បើអ្នកស្គាល់ Tailwind CSS អ្នកស្គាល់ Kbach ភាគច្រើនរួចហើយ៖ ឈ្មោះ utility, variant (`hover:`, `md:`, `dark:`), តម្លៃក្នុងតង្កៀបការ៉េ, `!` សម្រាប់ important និងសញ្ញា `/` សម្រាប់ភាពថ្លា ប្រើដូចគ្នាទាំងអស់។ Kbach មាន utility ទាំងអស់របស់ Tailwind CSS v4.3 ជាមួយតម្លៃដូចគ្នា។ ទំព័រនេះរាយតែចំណុចខុសគ្នា។ Kbach ជា project ឯករាជ្យ សូមមើលកំណត់សម្គាល់នៅខាងក្រោម។

## កម្រិតពណ៌ {#color-shades}

នេះជាចំណុចខុសគ្នាធំជាងគេ។ Kbach មានតារាងពណ៌ផ្ទាល់ខ្លួន៖ 26 ក្រុម កម្រិតពី `1` (ស្រាលបំផុត) ដល់ `12` (ដិតបំផុត) មិនមែនពី `50` ដល់ `950` ទេ។

| Tailwind CSS | Kbach |
| :-- | :-- |
| `bg-blue-500` | `bg-blue-6` |
| `text-gray-900` | `text-gray-11` |
| `border-slate-200` | `border-slate-3` |

កម្រិត `6` ប្រហាក់ប្រហែល `500` ប៉ុន្តែមិនមែនគ្រាន់តែប្តូរលេខម្តងមួយទេ ដូច្នេះពេលផ្ទេរ design មកប្រើ សូមប្រៀបធៀប [ប្រអប់ពណ៌](/colors) ផ្ទាល់។ អ្នកមិនចាំបាច់រកម្តងមួយ class ទេ៖ ពេលអ្នកប្រើកម្រិត `50` ដល់ `950` ការព្រមានក្នុង terminal, [VS Code extension](/editor-setup) និង [Playground](/playground) សុទ្ធតែប្រាប់កម្រិតពណ៌របស់ Kbach ដែលត្រូវប្រើ។

## ការរៀបចំ {#setup}

- គ្មាន `@import "tailwindcss"` ទេ។ Build plugin សរសេរ `kbach.css` ឱ្យ ហើយអ្នក import ឯកសារនោះតែម្តង (មើលនៅ [ការដំឡើង](/installation))។
- ការកំណត់ដាក់ក្នុងឯកសារ JavaScript គឺ [kbach.config.js](/configuration) ដែលមានផ្នែក `theme` និង `extend`។ គ្មានប្លុក `@theme` ក្នុង CSS ទេ។
- Animation ផ្ទាល់ខ្លួនដាក់ក្នុង `extend.keyframes` និង `extend.animation` នៃឯកសារនោះ ជំនួសឱ្យ `@keyframes` និង `--animate-*` ក្នុង `@theme`។ សូមមើល [Animation ផ្ទាល់ខ្លួន](/transitions-animation#custom-animations)។
- គ្មាន `@apply` ទេ។ បើចង់ប្រើ class មួយក្រុមម្តងទៀត សូមដាក់វាក្នុង component ឬក្នុង variable ដែលរុំដោយ `clsx()`។

## ឈ្មោះ {#naming}

- **បន្ទាត់ខណ្ឌរវាង element ខាងក្នុង៖** ពណ៌គឺ `divide-color-*` ហើយ `divide-<color>` ក៏ប្រើបានជាទម្រង់ខ្លី។ `divide-x` និង `divide-y` កំណត់កម្រាស់ ហើយ `divide-x` ប្រើជ្រុងឆ្វេង និងស្តាំ។
- **ទីតាំងពណ៌ក្នុង gradient** ទទួលទាំង `from-10%` និងទម្រង់ខ្លី `from-10`។
- **`rotate-none` និង `scale-none`** កំណត់ `transform` ទាំងមូលឡើងវិញ ជំនួសឱ្យ property `rotate` និង `scale` ដាច់ៗរបស់ CSS។ លទ្ធផលមើលទៅដូចគ្នា។
- **`text-shadow` តែឯង** មិនមែនជា class របស់ Tailwind ទេ។ Kbach រក្សាវាទុកជាការបន្ថែម។

## ឥរិយាបថ {#behavior}

- **`h-screen` និង `w-screen`** គឺ `100dvh` និង `100dvw` ពោលគឺផ្នែកអេក្រង់ដែលមើលឃើញពិតៗ ដូច្នេះទំព័រកម្ពស់ពេញ មិនលិចចូលក្រោមរបារអាសយដ្ឋានលើទូរស័ព្ទទេ។ Tailwind CSS ប្រើ `100vh` និង `100vw`។
- **Style `disabled:`** ជា `!important` ដូច្នេះរូបរាងរបស់ element ដែលបិទ មិនត្រូវ rule ដែលទាញយកក្រោយមកជាន់ពីលើទេ។
- **`font-sans`** គឺ `ui-sans-serif, system-ui, sans-serif` និង font emoji។ កំណត់ font ផ្ទាល់ខ្លួនក្នុង [kbach.config.js](/spacing-screens-fonts#fonts)។
- **`theme()`** ប្រើក្នុងតម្លៃក្នុងតង្កៀបមិនបានទេ។ ប្រើ `--spacing(4)` និង `--alpha(var(--brand) / 50%)` វិញ។

## React Native {#react-native}

ឈ្មោះ class ដដែលនេះក៏ប្រើបានក្នុង React Native ដែរ ដែល Tailwind CSS មិនគាំទ្រ។ App ទូរស័ព្ទគ្មាន CSS ដូច្នេះរបស់ខ្លះមិនអាចមាននៅទីនោះបានទេ៖ grid, `group-*`, `peer-*`, `has-[...]`, container query, pseudo-element, gradient, filter និង transition។ តម្លៃក្នុងតង្កៀបត្រូវតែជា `px` ឬ `rem`។ មើលនៅ [React Native](/react-native)។

## តម្លៃយកតាម Tailwind CSS v4.3 {#values-follow-tailwind-css-v43}

បើអ្នកមកពី Tailwind CSS v3 តម្លៃខាងក្រោមបានប្តូរក្នុង v4 ហើយ Kbach យកតាម v4៖

- `rounded-sm` គឺ 0.25rem (0.125rem របស់ v3 ឥឡូវជា `rounded-xs`)។
- `shadow-sm` ជាស្រមោលពីរស្រទាប់ (`shadow-sm` របស់ v3 ឥឡូវជា `shadow-xs`)។
- `blur-sm` និង `backdrop-blur-sm` គឺ 8px។
- `ring` តែឯងក្រាស់ 1px ពណ៌ដូចអក្សរ។ បើចង់បានរូបរាងដូច v3 សូមសរសេរ `ring-3 ring-blue-6/50`។
- `outline` ក្រាស់ 1px ហើយ `outline-2` គូរ outline រឹងដោយខ្លួនឯង។
- ទំហំអក្សរមានកម្ពស់បន្ទាត់មកជាមួយ ហើយ class `leading-*` ណាក៏ជំនួសវាបាន មិនថាលំដាប់ណាទេ។
- `transition` តែឯង ធ្វើចលនាលើពណ៌ opacity ស្រមោល និង transform តែមិនលើទទឹង និងកម្ពស់ទេ។ បើចង់គ្រប់យ៉ាង សូមប្រើ `transition-all`។

---

Tailwind CSS ជាពាណិជ្ជសញ្ញារបស់ Tailwind Labs Inc.។ Kbach ជា project ឯករាជ្យ មិនមានទំនាក់ទំនង មិនទទួលការឧបត្ថម្ភ និងមិនទទួលការគាំទ្រពី Tailwind Labs ឡើយ។ តម្លៃ theme លំនាំដើមរបស់ Kbach ដែលយកពី Tailwind CSS ប្រើក្រោមអាជ្ញាប័ណ្ណ MIT សូមមើល `THIRD_PARTY_NOTICES.md` ក្នុង package នីមួយៗ។
