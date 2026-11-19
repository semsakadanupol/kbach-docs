---
title: ពណ៌ Theme
nav: ពណ៌ Theme
description: បន្ថែមពណ៌ផ្ទាល់ខ្លួនដោយ extend.colors។ យោងទៅពណ៌ក្នុងតារាងពណ៌ ធ្វើឱ្យថ្លា និងឱ្យពណ៌មួយមានតម្លៃភ្លឺ និងងងឹត។
---

## បន្ថែមពណ៌ {#add-a-color}

```js title="kbach.config.js"
export default {
  extend: {
    colors: {
      brand: '#ff6b35',
    },
  },
};
```

ឥឡូវ utility ពណ៌ទាំងអស់ស្គាល់ពណ៌នេះ៖ `bg-brand`, `text-brand`, `border-brand/40`, `from-brand`, `ring-brand`។

## យោងទៅពណ៌ផ្សេង {#point-at-another-color}

តម្លៃអាចជាឈ្មោះពណ៌ក្នុងតារាងពណ៌ ឬពណ៌ដែលកំណត់ពីមុនក្នុង object ដដែល ហើយបន្ថែមភាពថ្លាពី 0 ដល់ 100 ក៏បាន៖

```js
colors: {
  brand: '#ff6b35',          // a literal color
  accent: 'orange-5',        // a palette color
  accentSoft: 'orange-5/50', // ...at 50% opacity
  brandSoft: 'brand/30',     // brand, defined above, at 30%
  danger: 'red',             // not a color name, so it's used as CSS: red
}
```

Kbach អានការយោងតាមលំដាប់ ដូច្នេះត្រូវកំណត់ពណ៌មុន ទើបអាចយោងទៅវាបាន។ បើតម្លៃមិនមែនជាឈ្មោះពណ៌ដែល Kbach ស្គាល់ទេ វាត្រូវប្រើជាតម្លៃ CSS ធម្មតា ដោយមិនចេញ error ទេ។

## ពណ៌សម្រាប់ light mode និង dark mode {#colors-for-light-and-dark-mode}

ពណ៌ **mode-aware** មានតម្លៃមួយសម្រាប់ mode នីមួយៗ។ ដូច្នេះ `bg-surface` ប្តូរពណ៌ដោយខ្លួនឯង ដោយមិនបាច់ដាក់ `dark:` ទេ។ មានពីររបៀបក្នុងការសរសេរ។

សរសេរម្តងមួយពណ៌ ពេលមានតែពណ៌ពីរបីប៉ុណ្ណោះដែលប្តូរតាម mode។ របៀបនេះប្រើបានលើ web និងក្នុង HTML ធម្មតា តែមិនប្រើបានលើ React Native ទេ៖

```js
colors: {
  surface: { light: '#f9fafb', dark: '#111827' },
  tile: { light: 'gray-2', dark: 'gray-11' }, // palette references work too
}
```

សរសេរជាក្រុម ពេលពណ៌ភាគច្រើនប្តូរតាម mode។ របៀបនេះប្រើបានគ្រប់កន្លែង រួមទាំង React Native៖

```js
colors: {
  surface: 'gray-2',
  card: 'white',
  brand: '#ff6b35', // not under dark, so it's the same in both modes
  dark: {
    surface: 'gray-11',
    card: 'gray-9',
  },
}
```

`dark` នៅទីនេះជា key ពិសេស មិនមែនជាឈ្មោះពណ៌ទេ។ ឈ្មោះណាដែលនៅក្រោម `dark` ត្រូវតែមានឈ្មោះដូចគ្នានៅខាងក្រៅវាផង បើគ្មាន Kbach នឹងរំលងចោល។

```preview
<div class="flex flex-wrap gap-3">
  <div class="rounded-xl bg-surface px-4 py-3 text-sm font-medium text-gray-11 ring-1 ring-gray-3 dark:text-gray-2 dark:ring-gray-9">bg-surface, a built-in mode-aware color</div>
</div>
```

### ដំណើរការលើ web យ៉ាងដូចម្តេច {#how-they-work-on-the-web}

ពណ៌ mode-aware ជា hex ក្លាយជា CSS variable។ `bg-surface` ក្លាយជា `background-color: rgb(var(--kb-color-surface))` ហើយក្នុង CSS ដែលបង្កើត `--kb-color-surface` ត្រូវកំណត់ម្តងសម្រាប់ light mode និងម្តងទៀតក្រោម selector របស់ dark mode។ ការប្តូរនេះមិនចំណាយអ្វីសោះ៖ មិន re-render ហើយក៏មិនបន្ថែម class ដែរ។

ពណ៌ទាំងនេះធ្វើឱ្យថ្លាបានតាមរយៈ `color-mix()` ដូច្នេះ `bg-surface/80` និង `text-ink/60` ប្រើបានធម្មតា។

> [!NOTE]
> ក្នុង `@kbach/react` 1.0.0-beta.28 និងចាស់ជាងនេះ ពេលសរសេរពណ៌ mode-aware ក្នុង `className` ធម្មតា ការ build មិនបង្កើត style ឱ្យទេ។ បើ `bg-surface` គ្មានប្រសិទ្ធភាពក្នុង project របស់អ្នក សូម upgrade។

### លើ React Native {#on-react-native}

លើ native ពណ៌ mode-aware ត្រូវប្តូរទៅជាតម្លៃភ្លឺ ឬងងឹតតាម color scheme បច្ចុប្បន្ន រាល់ពេល element render។ សូមប្រើទម្រង់ `dark` ជាក្រុម ព្រោះ React Native មិនទាន់អានទម្រង់ `{ light, dark }` ម្តងមួយពណ៌នៅឡើយទេ។

## អានពណ៌ theme ក្នុងកូដ {#reading-theme-colors-in-code}

```tsx
import { useColors } from '@kbach/react';

const colors = useColors();
colors.get('brand');   // '#ff6b35'
colors.surface;        // 'rgb(var(--kb-color-surface))' on the web
```
