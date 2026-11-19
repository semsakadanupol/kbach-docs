---
title: ដោះស្រាយបញ្ហា
nav: ដោះស្រាយបញ្ហា
description: បញ្ហាដែលអ្នកប្រើជួបញឹកញាប់ មូលហេតុ និងវិធីដោះស្រាយ។
---

## Class គ្មានប្រសិទ្ធភាព {#a-class-does-nothing}

សូមពិនិត្យតាមលំដាប់នេះ៖

1. **កម្រិតពណ៌នៅចន្លោះ 1 ដល់ 12 ឬទេ?** `bg-blue-500` មិនត្រូវនឹងអ្វីសោះ។ កម្រិតពណ៌មានពី 1 ដល់ 12៖ `bg-blue-6`។ ការព្រមានក្នុង terminal ប្រាប់ class ត្រឹមត្រូវឱ្យអ្នកស្រាប់។
2. **ជា class សម្រាប់តែ web ហើយកំពុងប្រើលើ React Native ឬ?** Class ខ្លះគ្មានប្រសិទ្ធភាពលើទូរស័ព្ទ ដូចជា `grid` និង `blur-sm`។ ក្នុងឯកសារយោង class ទាំងនេះមានសញ្ញា **Web only** មើលនៅ [React Native](/react-native#what-doesnt-work)។
3. **សរសេរត្រឹមត្រូវឬទេ?** មើលការព្រមាន "Unknown class" ក្នុង terminal ដែលរត់ dev server ឬដំឡើង [VS Code extension](/editor-setup) ដែលគូសបន្ទាត់ក្រោម class ខុស។
4. **Plugin មើលឃើញ class នោះឬទេ?** Class ត្រូវសរសេរពេញឈ្មោះក្នុងឯកសារមួយនៅក្នុង `src`, `app`, `pages` ឬ `components`។ `'bg-' + color` រកមិនឃើញទេ។ មើលនៅ [Dynamic classes](/dynamic-classes)។
5. **ឯកសារនៅក្រៅ folder ដែល plugin អានឬ?** បន្ថែម folder នោះដោយ [ជម្រើស `include`](/plugin-options)។
6. **បាន import `kbach.css` ហើយឬនៅ?** ត្រូវមាន `import './kbach.css'` មួយក្នុងឯកសារ entry។ `npx @kbach/cli doctor` ពិនិត្យរឿងនេះឱ្យបាន។

## Build បរាជ័យក្រោយកែ kbach.config.js {#the-build-fails-after-editing-kbachconfigjs}

ភាគច្រើនមកពី key ដែលមានសញ្ញា `-` តែមិនបានដាក់ក្នុងសញ្ញាសម្រង់។ `surface-dim: '#121318'` ជាកំហុស syntax ត្រូវសរសេរ `'surface-dim': '#121318'`។ សារកំហុសប្រាប់បន្ទាត់ដែលខុស។

## ពណ៌ mode-aware គ្មាន style {#a-mode-aware-color-has-no-style}

បើ `bg-surface` ឬពណ៌ `{ light, dark }` ក្នុង config របស់អ្នកមិនបង្ហាញអ្វីសោះលើ web មានន័យថាអ្នកកំពុងប្រើ `@kbach/react` 1.0.0-beta.28 ឬចាស់ជាងនេះ។ សូម upgrade។

## Class dark: មិនប្តូរតាមប៊ូតុងប្តូរ {#dark-classes-dont-follow-my-toggle}

Strategy លំនាំដើម `'media'` ប្តូរតែតាមការកំណត់របស់ប្រព័ន្ធប៉ុណ្ណោះ។ សូមកំណត់ `darkMode: 'class'` ឬ `'attribute'` ក្នុង `kbach.config.js`។ មើលនៅ [Dark mode](/dark-mode)។

## ទំព័រភ្លឺភ្លឹបមួយភ្លែត មុនប្តូរទៅងងឹត {#the-page-flashes-light-before-turning-dark}

Theme ដែលរក្សាទុក ចាប់ផ្តើមប្រើពេល JavaScript រត់។ សូមបន្ថែម script តូចពី [កុំឱ្យភ្លឹបពេលបើកទំព័រ](/dark-mode#avoid-a-flash-on-load) ចូលក្នុង `index.html`។

## kb() មិនឱ្យអ្វីមកវិញ ឬចេញ error {#kb-returns-nothing-or-throws}

Engine មិនទាន់ទាញយករួច។ សូមហៅ `await initKbach()` ម្តង មុនហៅ `kb()` លើកដំបូង។ បើអ្នកដឹង class ដែលអាចប្រើទាំងអស់ជាមុន ប្រើ [`safelist`](/plugin-options#safelist) វិញ ដើម្បីកុំឱ្យត្រូវការ engine ពេល app រត់។

## Border ក្រាស់ជាងធម្មតាបួនដង {#borders-are-four-times-too-thick}

`border-2` ក្រាស់ 8px ជាកំហុសក្នុង release ដែលប្រើ `@kbach/core-engine` 1.0.0-beta.2 ដល់ beta.15។ សូម upgrade `@kbach/react`, `@kbach/react-native` ឬ `@kbach/browser`។

## transition-colors គ្មានចលនា {#transition-colors-doesnt-animate}

មកពី release ដដែលខាងលើ ដែលគ្មានរយៈពេលលំនាំដើម។ សូម upgrade ឬបន្ថែម class `duration-*`។

## រូបរាងប្តូរក្រោយ upgrade {#things-look-different-after-upgrading}

`@kbach/core-engine` 1.0.0-beta.16 ប្តូរតម្លៃទាំងអស់ឱ្យដូច Tailwind CSS v4.3៖ `rounded-sm` ធំជាងមុន, `shadow-sm` ខ្លាំងជាងមុន, `ring` តែឯងស្តើងជាងមុនហើយមានពណ៌ដូចអក្សរ និងទំហំអក្សរមានកម្ពស់បន្ទាត់តឹងជាងមុន។ ទំព័រ [មកពី Tailwind CSS](/coming-from-tailwind#values-follow-tailwind-css-v43) រាយចំណុចទាំងនេះ ព្រមទាំង class ដែលធ្វើឱ្យរូបរាងដូចមុនវិញ។

## React Native៖ className គ្មានប្រសិទ្ធភាព {#react-native-classname-does-nothing}

ខ្វះ Babel plugin ឬ Metro កំពុងប្រើ build ចាស់ក្នុង cache។ បន្ថែម `'@kbach/react-native/babel-plugin'` ក្នុង `babel.config.js` រួចបើក Metro ឡើងវិញដោយ `npx expo start --clear` ឬ `npx react-native start --reset-cache`។ Expo Go ក៏ដូចគ្នា។

## React Native៖ disabled: មិនប្រើលើ element ខាងក្នុង {#react-native-disabled-doesnt-apply-to-a-child}

Variant ដែលពឹងលើ prop មើលតែ prop របស់ element ខ្លួនឯងប៉ុណ្ណោះ។ សូមដាក់ prop លើ element ដែលមាន class៖ `<Text disabled className="disabled:text-gray-5">`។

## React Native៖ ប៊ូតុងប្តូរ dark មិនដំណើរការក្នុង monorepo {#react-native-the-dark-toggle-does-nothing-in-a-monorepo}

Metro ប្រហែលជាទាញយក `react` ឬ `react-native` ពីរច្បាប់។ `npx @kbach/cli doctor` ពិនិត្យរឿងនេះបាន។ សូមឱ្យទាំងពីរយកពី `node_modules` របស់ app ខ្លួនឯង ដោយ `resolver.resolveRequest` ក្នុង `metro.config.js`។

## CDN៖ ទំព័រគ្មាន style សោះ {#cdn-nothing-is-styled}

មើល request `.wasm` ក្នុងផ្ទាំង Network។ Version `1.0.0-beta.0` រក `.wasm` ខុសពេលប្រើ URL ខ្លី សូមប្រើ version ក្រោយនោះ។ បើដាក់ឯកសារលើ server ផ្ទាល់ ត្រូវទុក `.wasm` ក្បែរ `kbach.js` ឬកំណត់ `data-wasm`។ មើលនៅ [HTML ធម្មតា](/plain-html#host-the-files-yourself)។

## CDN៖ ទំព័រគ្មាន style មួយភ្លែត {#cdn-the-page-shows-without-styles-for-a-moment}

នេះជារឿងធម្មតានៅពេលចូលលើកដំបូង៖ ទំព័របាន style ពេល engine ទាញយករួច។ បើគេហទំព័ររបស់អ្នកមិនចង់ឱ្យមានរឿងនេះ សូមប្រើ React ជាមួយ [build plugin](/web) ដែលបង្កើត CSS ទុកជាមុន។ មើលនៅ [HTML ធម្មតា](/plain-html#things-to-know)។
