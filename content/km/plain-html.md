---
title: HTML ធម្មតា
nav: HTML ធម្មតា
description: ប្រើ Kbach ក្នុងទំព័រ HTML ណាក៏បាន ដោយដាក់ tag script តែមួយពី CDN។ មិនបាច់ដំឡើង មិនបាច់ build ហើយក៏មិនបាច់ React ដែរ។
---

សម្រាប់ទំព័រ HTML ធម្មតា, Kbach គឺ package `@kbach/browser` ដែលទាញមកប្រើដោយ tag `<script>` តែមួយ។ នេះជាវិធីលឿនបំផុតក្នុងការសាក Kbach ហើយសមស្របសម្រាប់គេហទំព័រតូចៗ គំរូសាកល្បង ឬទំព័រដែលបង្កើតដោយ tool ផ្សេង។

## ដាក់ script {#add-the-script}

```html title="index.html" {5}
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>
  </head>
  <body class="bg-gray-1 p-8">
    <h1 class="text-3xl font-bold text-blue-6">Hello, Kbach</h1>
  </body>
</html>
```

ប្រើ attribute `class` ដូច HTML ធម្មតា។ Class និង variant ទាំងអស់ប្រើបានដូច React លើ web។

## Script ធ្វើអ្វីខ្លះ {#what-the-script-does}

1. ទាញយក engine៖ JavaScript ប្រហែល 8 KB និង WebAssembly ប្រហែល 195 KB (ក្រោយ gzip)។ ក្រោយការចូលមើលលើកដំបូង browser រក្សាទុកទាំងពីរក្នុង cache។
2. អាន attribute `class` របស់ element ទាំងអស់ ហើយបន្ថែម CSS ដែលត្រូវការចូលទំព័រ។
3. តាមដានទំព័រជានិច្ច។ Element ដែលអ្នកបន្ថែមពេលក្រោយ ឬ class ដែលប្តូរដោយ JavaScript បាន style ភ្លាមពេលវាលេចឡើង។

Script មិនដែលកែ attribute `class` របស់អ្នកទេ ហើយវារំលងឈ្មោះ class ណាដែលវាមិនស្គាល់ ដូច្នេះទំព័រអាចប្រើ CSS ផ្សេងជាមួយ Kbach បាន។

## គួរដឹង {#things-to-know}

- **ទំព័រអាចគ្មាន style មួយភ្លែត។** ទំព័របាន style ពេល engine ទាញយករួច ដូច្នេះនៅពេលចូលលើកដំបូង ទំព័រអាចបង្ហាញដោយគ្មាន style មួយភ្លែតសិន។ បើគេហទំព័ររបស់អ្នកមិនចង់ឱ្យមានរឿងនេះ សូមប្រើ React ជាមួយ [build plugin](/web) ដែលបង្កើតឯកសារ CSS ទុកជាមុន។
- **គ្មាន transition ពេលកំពុង style ទំព័រ។** Transition ត្រូវបានបិទ រហូតដល់ style ដំបូងចូលរួច ដូច្នេះប៊ូតុងមិនរសាត់ពីរូបរាងដើមរបស់ browser រាល់ពេលបើកទំព័រទេ។ Animation (`animate-*`) ចាប់ផ្តើមភ្លាម។ `starting:` រត់តែលើ element ដែលបន្ថែមក្រោយពេលទំព័របើករួចប៉ុណ្ណោះ។
- **គ្មានការព្រមានពេលវាយខុស។** ឈ្មោះ class ដែល engine មិនស្គាល់ script រំលងដោយស្ងាត់ៗ ព្រោះវាអាចជា class របស់ CSS ផ្សេង។ មើលនៅ [ពិនិត្យទំព័ររបស់អ្នក](#check-your-page)។
- **ត្រូវបើកទំព័រតាម web server។** ទំព័រដែលបើកពី disk ផ្ទាល់ (`file://`) មិនអាចទាញឯកសារ `.wasm` បានទេ។ Server ក្នុងម៉ាស៊ីនណាក៏បាន ដូចជា `npx serve`។

## ពណ៌ និងការកំណត់ផ្ទាល់ខ្លួន {#your-colors-and-settings}

ដាក់ការកំណត់របស់អ្នកក្នុង `window.kbachConfig` នៅក្នុង script មួយ **មុន** script របស់ Kbach។ ការកំណត់ដូចគ្នានឹង [kbach.config.js](/configuration)៖

```html
<script>
  window.kbachConfig = {
    darkMode: 'class',
    extend: {
      colors: {
        brand: '#ff6b35',
        card: { light: '#ffffff', dark: '#11131b' },
      },
    },
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>
```

> [!WARNING] ការកំណត់ត្រូវនៅមុន script របស់ Kbach
> Script អាន `window.kbachConfig` តែម្តងគត់ ពេលវាចាប់ផ្តើម។ ការកំណត់ដែលសរសេរក្រោយ script មិនដែលត្រូវអានទេ៖ ពណ៌ផ្ទាល់ខ្លួនមិនមាន ហើយប៊ូតុងប្តូរ theme គ្មានប្រសិទ្ធភាព ដោយគ្មាន error ប្រាប់។

ឥឡូវ `bg-brand` និង `bg-card` ប្រើបាន ហើយ `card` ប្តូរពណ៌តាម dark mode។ Script អានការកំណត់នេះតែម្តងគត់ ពេលវាចាប់ផ្តើម។ បើចង់ប្តូរពេលក្រោយ សូមហៅ `Kbach.config({ ... })`។

## ប៊ូតុងប្តូរ dark mode {#a-dark-mode-switch}

បើក្នុងការកំណត់មាន `darkMode: 'class'` (ឬ `'attribute'`)៖

```html
<button class="rounded-lg border px-3 py-1.5" onclick="Kbach.toggle()">Toggle theme</button>
```

`Kbach.setMode('dark')`, `'light'` ឬ `'system'` កំណត់ mode ហើយ browser ចាំជម្រើសនេះសម្រាប់ពេលចូលលើកក្រោយ។ បើគ្មានការកំណត់មួយក្នុងចំណោមពីរនេះទេ dark mode ប្តូរតាមឧបករណ៍ ហើយ `Kbach.toggle()` គ្មានប្រសិទ្ធភាព។ មើលនៅ [CDN script API](/browser-api)។

## កំណត់ version ឱ្យនឹង {#pin-a-version}

URL ខ្លីតែងតែផ្តល់ release ថ្មីបំផុត។ បើមិនចង់ឱ្យគេហទំព័រប្តូរដោយខ្លួនឯង សូមដាក់លេខ version ក្នុង URL៖

```html
<script src="https://cdn.jsdelivr.net/npm/@kbach/browser@1.0.0"></script>
```

ឯកសារដដែលក៏មាននៅលើ unpkg ដែរ៖ `https://unpkg.com/@kbach/browser`។

## ដាក់ឯកសារលើ server ផ្ទាល់ {#host-the-files-yourself}

ចម្លង `kbach.js` និង `kbach_core_engine_bg.wasm` ពី folder `dist/` របស់ package ហើយទុកក្នុង folder តែមួយ។ បើទុក `.wasm` នៅកន្លែងផ្សេង សូមប្រាប់ទីតាំងរបស់វា៖

```html
<script src="/js/kbach.js" data-wasm="/wasm/kbach_core_engine_bg.wasm"></script>
```

## ពិនិត្យទំព័ររបស់អ្នក {#check-your-page}

Script រំលងឈ្មោះ class ដែលវាមិនស្គាល់ដោយស្ងាត់ៗ ដូច្នេះកំហុសបង្ហាញខ្លួនតែជាអ្វីមួយដែលបាត់ពីទំព័រប៉ុណ្ណោះ។ ដើម្បីរកវា សូមបិទភ្ជាប់ HTML របស់អ្នកក្នុង [Playground](/playground)៖ វាគូសបន្ទាត់ក្រោមរាល់ class ដែល Kbach មិនស្គាល់ ហើយប្រាប់ឈ្មោះត្រឹមត្រូវ។ **Fix all** កែកំហុសដែលជួបញឹកញាប់ជាងគេ គឺកម្រិតពណ៌ពី 50 ដល់ 950 ដោយចុចតែម្តង។ កំហុសផ្សេងទៀតមាននៅ [កំហុសដែលជួបញឹកញាប់](/common-mistakes)។
