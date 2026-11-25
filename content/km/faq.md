---
title: សំណួរញឹកញាប់
nav: សំណួរញឹកញាប់
description: ចម្លើយខ្លីៗចំពោះសំណួរដែលគេសួរញឹកញាប់ជាងគេអំពី Kbach។
---

## Kbach ជាការចម្លង Tailwind CSS ឬ? {#is-kbach-a-copy-of-tailwind-css}

ទេ។ Kbach មាន engine ផ្ទាល់ខ្លួនសរសេរដោយ Rust មានតារាងពណ៌ផ្ទាល់ខ្លួន ហើយប្រើបានក្នុង React Native ដែល Tailwind CSS មិនអាចធ្វើបាន។ ឈ្មោះ class យកតាម Tailwind CSS ដោយចេតនា ដើម្បីឱ្យអ្នកសរសេរកូដជាច្រើនស្គាល់ស្រាប់។ Kbach ជា project ឯករាជ្យ គ្មានទំនាក់ទំនងជាមួយ Tailwind Labs ទេ។ មើលនៅ [មកពី Tailwind CSS](/coming-from-tailwind)។

## ត្រូវចេះ Tailwind CSS ជាមុនឬទេ? {#do-i-need-to-know-tailwind-css}

មិនចាំបាច់ទេ។ ឯកសារនេះពន្យល់គ្រប់យ៉ាងពីដំបូង។ សូមចាប់ផ្តើមពី [ចាប់ផ្តើមរហ័ស](/quick-start)។

## អាចយកទៅប្រើបានហើយឬនៅ? {#is-it-ready-to-use}

បាទ/ចាស។ Kbach 1.0.0 ជា release ស្ថិរភាពដំបូង ហើយវាគោរពតាម semantic versioning៖ release 1.x បន្ថែម និងកែរបស់ថ្មីៗ ដោយមិនធ្វើឱ្យអ្វីដែលដំណើរការស្រាប់ខូចទេ ហើយការប្តូរដែលធ្វើឱ្យខូច ត្រូវរង់ចាំដល់ 2.0។ គេហទំព័រនេះបង្កើតដោយ Kbach ផ្ទាល់។

## ប្រើឥតគិតថ្លៃឬទេ? {#is-it-free}

បាទ/ចាស។ Kbach ជា open source ក្រោមអាជ្ញាប័ណ្ណ MIT។ កូដមាននៅលើ [GitHub](https://github.com/semsakadanupol/kbach)។

## ប្រើលើ iOS បានទេ? {#does-it-work-on-ios}

បាន។ លើ iOS, Kbach ប្រើ engine ជំនាន់ JavaScript ដូចដែល Expo Go ប្រើ ដែលស្គាល់ class ប្រចាំថ្ងៃទាំងអស់។ Native module ដែលលឿនជាង បច្ចុប្បន្នមានតែលើ Android ប៉ុណ្ណោះ។ មើលនៅ [ឧបករណ៍នីមួយៗប្រើ engine មួយណា](/react-native#which-engine-runs)។

## ដំណើរការលើ browser ណាខ្លះ? {#which-browsers-does-it-work-in}

Browser បច្ចុប្បន្នទាំងអស់៖ Chrome, Edge, Firefox និង Safari ទាំងលើកុំព្យូទ័រ និងទូរសព្ទ។ Kbach សរសេរ CSS ដោយខ្លួនឯង គ្មាន tool ផ្សេងមកកែតាមក្រោយទេ ដូច្នេះវាសរសេរអ្វីដែល browser ចាស់ៗត្រូវការផងដែរ៖

- ច្បាប់ចម្លង `-webkit-` សម្រាប់ property ដែល Safari នៅតែអានតាមទម្រង់នោះ៖ `backdrop-filter` (class `backdrop-*`), `background-clip: text` (`bg-clip-text`), class `mask-*`, `select-none`, `hyphens-*`, `box-decoration-*` និង `appearance-none`។
- តម្លៃចាស់ជំនួស ដាក់នៅមុនតម្លៃថ្មី៖ `overflow: hidden` មុន `overflow: clip` (`overflow-clip`), `vh` មុន `dvh`, `svh` និង `lvh` (`h-dvh`, `min-h-svh`) ហើយពណ៌ធម្មតាមុនពណ៌ថ្លាដែលសរសេរដោយ `color-mix()` (`bg-current/50`)។

មុខងារថ្មីៗមួយចំនួនគ្មានតម្លៃជំនួសទេ។ នៅក្នុង browser ដែលមិនទាន់ស្គាល់ មុខងារទាំងនេះគ្មានប្រសិទ្ធភាព ហើយទំព័រគ្រាន់តែមើលទៅធម្មតាជាងបន្តិច៖ `text-balance` និង `text-pretty`, `field-sizing-*`, `starting:`, `scrollbar-*` ព្រមទាំង variant `has-*` និង `@container`។

ជាមួយ Next.js, minifier CSS របស់វារក្សាតម្លៃជំនួសទុក លុះត្រាតែបញ្ជី browser របស់អ្នក (`browserslist` ក្នុង `package.json`) មាន browser ណាមួយដែលត្រូវការ។

## បន្ថែមទំហំ app ប៉ុន្មាន? {#how-much-does-it-add-to-my-app}

- **Web៖** មានតែ CSS របស់ class ដែលអ្នកប្រើ ក្នុងឯកសារតែមួយ។ គ្មាន JavaScript រត់ដើម្បីដាក់ style ទេ។ `kb()` និងរបៀប runtime ទាញយក engine (ប្រហែល 195 KB ក្រោយ gzip) តែពេលអ្នកប្រើវាប៉ុណ្ណោះ។
- **HTML ធម្មតា៖** JavaScript ប្រហែល 8 KB និង WebAssembly ប្រហែល 195 KB ក្រោយ gzip ហើយ browser រក្សាទុកក្នុង cache ក្រោយការចូលលើកដំបូង។
- **React Native៖** engine មកជាមួយ package ស្រាប់ ហើយ class របស់ element នីមួយៗត្រូវគណនាតែម្តង រួចចងចាំទុក។

## ប្រើ CSS ផ្ទាល់ខ្លួនជាមួយបានទេ? {#can-i-use-my-own-css-too}

បាន។ Kbach សរសេរ CSS តែសម្រាប់ class របស់វាប៉ុណ្ណោះ។ លើ web, class ពីឯកសារ CSS ផ្ទាល់ខ្លួនរបស់អ្នក មិនត្រូវរាប់ថាមិនស្គាល់ទេ ហើយក្នុងទំព័រ HTML ធម្មតា script រំលងឈ្មោះ class ដែលវាមិនស្គាល់។

## ប្រើជាមួយ Next.js បានទេ? {#does-it-work-with-nextjs}

បាន តាមរយៈ PostCSS plugin។ CSS ជាឯកសារធម្មតាដែលបង្កើតពេល build ដូច្នេះការ render លើ server ដំណើរការដូចធម្មតា។ មើលនៅ [ការដំឡើង](/installation?tab=nextjs)។

## ប្រើជាមួយ Vue, Svelte ឬ framework ផ្សេងបានទេ? {#does-it-work-with-vue-svelte-or-another-framework}

Build plugin បង្កើតសម្រាប់ React ព្រោះវារក `className`។ ចំណែកទំព័រផ្សេងទៀត [CDN script](/plain-html) ប្រើបាន ព្រោះវាអាន attribute `class` ក្នុង browser មិនថាអ្វីបង្កើតវាទេ។

## រាយការណ៍កំហុស ឬសួរសំណួរនៅឯណា? {#where-do-i-report-a-bug}

បើក issue នៅលើ [GitHub](https://github.com/semsakadanupol/kbach/issues)។ ខាងក្រោមទំព័រនីមួយៗក្នុងឯកសារនេះ ក៏មានតំណ **រាយការណ៍បញ្ហា** ដែលបំពេញព័ត៌មានទំព័រឱ្យអ្នកស្រាប់។
