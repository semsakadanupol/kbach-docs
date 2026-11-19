---
title: Plugin options
description: ជម្រើសសម្រាប់ Vite plugin និង PostCSS plugin ក្នុង @kbach/react។
---

## របៀបដាក់ជម្រើស {#passing-options}

Plugin ទាំងពីរទទួល object ជម្រើសដូចគ្នា៖

```ts title="vite.config.ts"
import { kbach } from '@kbach/react/vite';

kbach({
  include: ['src', 'app', 'lib/ui'],
  safelist: ['bg-red-6', 'bg-green-6'],
});
```

```js title="postcss.config.js"
module.exports = {
  plugins: {
    '@kbach/react/postcss': { include: ['src', 'app'], safelist: ['bg-red-6'] },
  },
};
```

## ជម្រើស {#options}

| ជម្រើស | ប្រភេទ | លំនាំដើម | តួនាទី |
| :-- | :-- | :-- | :-- |
| `include` | `string[]` | `['src', 'app', 'pages', 'components']` | Folder ដែលត្រូវរកឈ្មោះ class គិតពីឫស project |
| `safelist` | `string[]` | `[]` | Class ដែលត្រូវបង្កើត CSS ជានិច្ច ទោះគ្មានឯកសារណាប្រើក៏ដោយ |
| `config` | `KbachConfig` | `kbach.config.js` | Object config ដែលប្រើជំនួសឯកសារ |
| `theme` | `ThemeConfig` | | Theme ដែលបំប្លែងរួចស្រេច។ បើមាន វាប្រើជំនួស `config` |
| `cssFile` | `string` | រកឃើញដោយខ្លួនឯង | កន្លែងសរសេរ CSS គិតពីឫស project |
| `root` | `string` | `process.cwd()` | សម្រាប់តែ PostCSS៖ ឫស project ដែលមាន `kbach.config.js` |

## include {#include}

Plugin អានឯកសារ `.js`, `.jsx`, `.ts` និង `.tsx` ក្នុង folder ទាំងនេះ ហើយរំលង `node_modules`, `dist`, `build`, `out`, `.next`, `.output`, `coverage` និង folder build ឬ cache ផ្សេងទៀត។ Class ដែលមានតែក្នុងឯកសារនៅក្រៅ folder ទាំងនេះ នឹងគ្មាន CSS ទេ។ បើ folder UI ដែលប្រើរួមនៅកន្លែងផ្សេង សូមបន្ថែមវា។

## safelist {#safelist}

សម្រាប់ class ដែល plugin មើលមិនឃើញ ព្រោះវាផ្គុំពេល app កំពុងរត់ តែអ្នកដឹងតម្លៃទាំងអស់ជាមុន។ មើលនៅ [Dynamic classes](/dynamic-classes)។

## config និង theme {#config-and-theme}

បើមិនដាក់ទាំងពីរ plugin ទាញយក `kbach.config.js` (ឬ `.mjs`, `.cjs`) ពីឫស project។ ដាក់ `config` ដើម្បីប្រើ object ជំនួសវិញ ឧទាហរណ៍ object ដែលអ្នកក៏ឱ្យទៅ `applyKbachConfig()` ពេល app រត់ផងដែរ ដូច្នេះទាំងពីរកន្លែងប្រើ config ដូចគ្នាជានិច្ច។

## cssFile {#cssfile}

Vite plugin រកឯកសារដែលមានសញ្ញាសម្គាល់ `/* kbach:start */` និង `/* kbach:end */` រួចហើយ ក្នុង folder កូដ និងនៅឫស project។ បើរកមិនឃើញ វាបង្កើត `kbach.css` ក្នុង folder `include` ដំបូងដែលមាន ភាគច្រើនគឺ `src/kbach.css`។ កំណត់ `cssFile` តែពេលការទាយនេះខុស ឧទាហរណ៍ពេលឯកសារនៅក្រៅ folder `include` ទាំងអស់។

អ្វីដែលនៅក្រៅសញ្ញាសម្គាល់ទាំងពីរ ជារបស់អ្នក ហើយ plugin មិនដែលប៉ះទេ ដូច្នេះអ្នកអាចសរសេរ CSS ដោយដៃខ្លះៗក្នុងឯកសារដដែលបាន។

## ការព្រមានរបស់ plugin {#what-it-warns-about}

Class ណាដែលមិនត្រូវនឹងអ្វីសោះ plugin ព្រមានក្នុង terminal ដោយប្រាប់ទីតាំង ហើយបើមានដំណោះស្រាយច្បាស់ វាប្រាប់ផងថាអ្នកប្រហែលជាចង់សរសេរអ្វី៖

```text
→ [Kbach] Unknown class bg-blue-500 — did you mean bg-blue-6? Kbach color shades run 1–12, not 50–950.
  at src/App.tsx:12:24
→ [Kbach] Unknown class flexx — did you mean flex?
  at src/App.tsx:12:36
```

កម្រិតពណ៌ដែលសរសេរតាមមាត្រដ្ឋាន 50 ដល់ 950 (`bg-blue-500`) ត្រូវណែនាំទៅកម្រិតពណ៌របស់ Kbach ហើយការវាយខុសមួយតួអក្សរ ត្រូវណែនាំទៅ class ដែលត្រឹមត្រូវ។ Class ដែលមានក្នុងឯកសារ CSS ផ្ទាល់ខ្លួនរបស់អ្នក មិនត្រូវព្រមានទេ ដូច្នេះការប្រើ Kbach ជាមួយ stylesheet ផ្សេង មិនរំខានអ្នកដោយការព្រមានឥតប្រយោជន៍ទេ។ [VS Code extension](/editor-setup) បង្ហាញការណែនាំដដែលនេះពេលអ្នកវាយ ហើយចុចតែម្តងក៏កែបាន។
