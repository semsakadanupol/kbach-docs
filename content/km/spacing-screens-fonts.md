---
title: Spacing, screens និង fonts
nav: Spacing, screens, fonts
description: បន្ថែមលេខក្នុងមាត្រដ្ឋានគម្លាត បន្ថែមទំហំអេក្រង់ ដាក់ឈ្មោះក្រុម font និងរៀបចំ class container។
---

## Spacing {#spacing}

បន្ថែមលេខថ្មីក្នុងមាត្រដ្ឋានគម្លាត។ តម្លៃគិតជា pixel៖

```js title="kbach.config.js"
export default {
  extend: {
    spacing: {
      13: 52,
      128: 512,
    },
  },
};
```

ឥឡូវ `p-13`, `mt-128`, `w-128`, `gap-13` និង utility គម្លាតផ្សេងទៀតទាំងអស់ ស្គាល់លេខទាំងនេះ។

## Screens {#screens}

ទំហំអេក្រង់ក៏គិតជា pixel ដែរ។ បន្ថែមទំហំថ្មី ឬប្តូរទំហំដែលមានស្រាប់៖

```js
extend: {
  screens: {
    tablet: 900,
    '3xl': 1920,
    md: 800,
  },
}
```

ឥឡូវ `tablet:` ប្រើចាប់ពី 900px, `3xl:flex-row` ចាប់ពី 1920px ហើយ `md:` ចាប់ពី 800px ជំនួស 768px។ ឈ្មោះណាដែលចាប់ផ្តើមដោយលេខ ដូចជា `3xl` ត្រូវដាក់ក្នុងសញ្ញាសម្រង់។

ទំហំអេក្រង់នីមួយៗ ទាំងដែលមានស្រាប់ និងដែលអ្នកបន្ថែម មានទម្រង់ `max-` ដែលប្រើ **ក្រោម** ទំហំនោះផង៖

```html
<nav class="hidden md:flex">...</nav>       <!-- 768px and up -->
<button class="max-md:block hidden">...</button>  <!-- under 768px -->
<aside class="md:max-xl:w-64">...</aside>    <!-- from 768px up to 1280px -->
```

| ឈ្មោះ | លំនាំដើម |
| :-- | :-- |
| `sm` | 640 |
| `md` | 768 |
| `lg` | 1024 |
| `xl` | 1280 |
| `2xl` | 1536 |

React Native ប្រើទំហំដូចគ្នា ដោយប្រៀបធៀបនឹងទទឹងរបស់ window។

## Fonts {#fonts}

ដាក់ឈ្មោះឱ្យក្រុម font រួចប្រើវាជា `font-<name>`៖

```js
extend: {
  fontFamily: {
    display: '"Cal Sans", "Inter", sans-serif',
    sans: '"Inter", ui-sans-serif, system-ui, sans-serif', // replaces the default sans
  },
}
```

ឈ្មោះដែលមានស្រាប់គឺ `sans`, `serif` និង `mono`។ Kbach មិនទាញយកឯកសារ font ឱ្យទេ សូមបន្ថែមវាដោយខ្លួនឯង ពី Google Fonts ឬដោយ `@font-face`។

លើ React Native, Kbach ប្រើតែឈ្មោះដំបូងក្នុងក្រុម ដូច្នេះ config ដដែលប្រើបានទាំងលើ Expo Web និងលើទូរស័ព្ទ។

## Container {#container}

`container` កំណត់ `max-width` តាមទំហំអេក្រង់បច្ចុប្បន្ន។ បើចង់ដាក់វានៅកណ្តាល និងមានគម្លាតសងខាង សូមកំណត់ក្នុង config៖

```js
extend: {
  container: {
    center: true,
    padding: '2rem',
  },
}
```

```html
<main class="container">...</main>
```
