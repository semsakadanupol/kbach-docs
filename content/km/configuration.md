---
title: kbach.config.js
nav: kbach.config.js
description: ឯកសារការកំណត់មួយនៅឫស project ដែលមិនដាក់ក៏បាន។ វាបន្ថែមពណ៌ គម្លាត ទំហំអេក្រង់ font និង animation ផ្ទាល់ខ្លួន ហើយគ្រប់ platform និង editor extension សុទ្ធតែអានវា។
---

## ដាក់នៅឯណា {#where-it-goes}

បង្កើត `kbach.config.js` នៅក្បែរ `package.json`។ មិនចាំបាច់ import វានៅកន្លែងណាទេ៖

- Plugin របស់ Vite និង PostCSS រកឃើញវាដោយខ្លួនឯងនៅឫស project។
- Babel plugin របស់ React Native យកវាមកប្រើមុន app render លើកដំបូង។
- VS Code extension អានវា ដូច្នេះការណែនាំ class និងការព្រមាន ស្គាល់ពណ៌របស់អ្នក។
- ក្នុងទំព័រ HTML ធម្មតា សូមដាក់ object ដដែលនេះក្នុង `window.kbachConfig` (មើលនៅ [HTML ធម្មតា](/plain-html#your-colors-and-settings))។

## ទម្រង់ {#the-shape}

```js title="kbach.config.js"
/** @type {import('@kbach/react').KbachConfig} */
export default {
  darkMode: 'media', // 'media' (default), 'class' or 'attribute'
  theme: {
    // REPLACES a whole section of the defaults
  },
  extend: {
    // ADDS to the defaults. This is what you usually want.
    colors: {},
    spacing: {},
    screens: {},
    fontFamily: {},
    container: {},
    keyframes: {}, // web only: see Transitions & Animation
    animation: {},
  },
};
```

Comment `@type` ធ្វើឱ្យ editor ភាគច្រើនណែនាំ field ក្នុង config ពេលអ្នកវាយ។ សរសេរបែប CommonJS ក៏បាន៖ `module.exports = { ... }`។ លើ web អ្នកអាចដាក់ឈ្មោះឯកសារជា `kbach.config.mjs` ឬ `kbach.config.cjs` បានដែរ ប៉ុន្តែ React Native អានតែ `kbach.config.js` ប៉ុណ្ណោះ។

## theme ឬ extend {#theme-or-extend}

ប្រើ `extend` ដើម្បីបន្ថែមលើតម្លៃដែលមានស្រាប់។ ពណ៌ `brand` របស់អ្នកចូលរួមជាមួយក្រុមពណ៌ទាំង 26 ហើយលេខក្នុង `extend.spacing` ចូលរួមជាមួយមាត្រដ្ឋានគម្លាត។

ប្រើ `theme` ដើម្បីជំនួសផ្នែកណាមួយទាំងស្រុង។ ឧទាហរណ៍ `theme.colors` លុបតារាងពណ៌ស្រាប់ចោលទាំងអស់ ហើយទុកតែពណ៌របស់អ្នក។ វាល្អសម្រាប់ design system ដែលតឹងរ៉ឹង តែអ្នកនឹងលែងមាន `bg-blue-6` និងពណ៌ផ្សេងៗទៀត។

`theme` ទទួល `colors`, `spacing`, `screens` និង `fontFamily`។ ចំណែក `container`, `keyframes` និង `animation` ដាក់បានតែក្នុង `extend` ប៉ុណ្ណោះ។ សម្រាប់ `keyframes` និង `animation` សូមមើល [Animation ផ្ទាល់ខ្លួន](/transitions-animation#custom-animations)។

## ឧទាហរណ៍ពេញលេញ {#a-complete-example}

នេះជា config របស់គេហទំព័រដែលអ្នកកំពុងអាន។ ពណ៌ទាំងនេះយកចេញពី logo របស់ Kbach៖

```js title="kbach.config.js"
export default {
  darkMode: 'class',
  extend: {
    fontFamily: {
      sans: '"Geist", ui-sans-serif, system-ui, sans-serif',
      display: '"Fraunces", ui-serif, Georgia, serif',
      mono: '"Geist Mono", ui-monospace, monospace',
    },
    colors: {
      gold: '#c7a25d',
      logo: '#2e393f',
      page: { light: '#faf7f0', dark: '#1a2125' },
      card: { light: '#ffffff', dark: '#243036' },
      line: { light: '#e4dccb', dark: '#33424a' },
      ink: { light: '#1f272b', dark: '#ece6d8' },
      muted: { light: '#5b676d', dark: '#9aa8ae' },
      accent: { light: '#87642f', dark: '#d6b46f' },
      'accent-ink': { light: '#ffffff', dark: '#1a1b1b' },
    },
  },
};
```

ដោយមាន config នេះ `bg-page text-ink border-line` ត្រូវពណ៌ទាំងក្នុង mode ភ្លឺ និងងងឹត, `font-display` ប្រើ font Fraunces ហើយ `bg-gold/10` ជាផ្ទៃពណ៌មាសស្រាលៗ។

គេហទំព័រនេះជា app web។ សម្រាប់ React Native សូមសរសេរពណ៌ភ្លឺ និងងងឹតជាក្រុមវិញ (`dark: { page: '#1a2125' }`) មើលនៅ [ពណ៌ Theme](/theme-colors#colors-for-light-and-dark-mode)។

> [!WARNING] Key ដែលមានសញ្ញា `-` ត្រូវដាក់ក្នុងសញ្ញាសម្រង់
> ឯកសារនេះជា JavaScript មិនមែន JSON ទេ។ `accent-ink: '#fff'` ជាកំហុស syntax ត្រូវសរសេរ `'accent-ink': '#fff'`។ លើ web ការ build នឹងឈប់ដោយសារកំហុសនេះ ចំណែកលើ React Native វាបង្ហាញជាកំហុស bundling របស់ Metro។

## ការកែប្រែមានប្រសិទ្ធភាពពេលណា {#when-changes-apply}

- **Vite និង Next.js៖** save ឯកសារ CSS នឹង build ឡើងវិញភ្លាម មិនបាច់បិទបើក server ទេ។ បើឯកសារមានកំហុសពេលកំពុងកែ terminal នឹងប្រាប់ ហើយ Kbach បន្តប្រើ config ចុងក្រោយដែលត្រឹមត្រូវ។
- **React Native៖** បិទបើក Metro ឡើងវិញ ហើយសម្អាត cache៖ `npx expo start --clear` ឬ `npx react-native start --reset-cache`។
- **ពេល app កំពុងរត់៖** បើចង់ប្តូរ theme ពេល app កំពុងដំណើរការ ឧទាហរណ៍ក្រោយអ្នកប្រើ login សូមហៅ `applyKbachConfig(config)`។ មើលនៅ [React API](/react-api#applykbachconfig)។

## បន្ទាប់ {#next}

- [ពណ៌ Theme](/theme-colors)៖ យោងទៅពណ៌ផ្សេង ភាពថ្លា និងពណ៌ mode-aware។
- [Spacing, screens និង fonts](/spacing-screens-fonts)។
