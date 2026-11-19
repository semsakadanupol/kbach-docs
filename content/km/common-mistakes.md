---
title: កំហុសដែលជួបញឹកញាប់
nav: កំហុសដែលជួបញឹកញាប់
description: កំហុសដែលស្ទើរតែគ្រប់គ្នាធ្វើពេលចាប់ផ្តើមប្រើ Kbach ទាំងមនុស្ស ទាំង AI៖ មើលទៅយ៉ាងណា និងកែយ៉ាងដូចម្តេច។
---

កំហុសខាងក្រោមនីមួយៗ មិនបង្ហាញ error ទេ៖ ទំព័របើកបានធម្មតា តែមានអ្វីមួយគ្មាន style។ ដូច្នេះពេលឃើញអ្វីខុសប្លែក សូមពិនិត្យបញ្ជីនេះមុន រួច [ពិនិត្យទំព័ររបស់អ្នក](#check-your-page)។

## កម្រិតពណ៌ពី 50 ដល់ 950 {#shades-from-50-to-950}

ពណ៌របស់ Kbach មានពី `1` (ស្រាលបំផុត) ដល់ `12` (ដិតបំផុត)។ Class ដូចជា `text-amber-700` មិនមានទេ ដូច្នេះវាគ្មានពណ៌អ្វីសោះ ហើយ browser ក៏មិនប្រាប់ error ដែរ។

```html
<!-- ✗ draws nothing -->
<p class="text-amber-700 dark:text-amber-400">Hello</p>

<!-- ✓ -->
<p class="text-amber-8 dark:text-amber-5">Hello</p>
```

ប្តូរលេខពីមាត្រដ្ឋាន 50 ដល់ 950 តាមតារាងនេះ៖

| ពីមុន | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| **Kbach** | `1` | `2` | `3` | `4` | `5` | `6` | `7` | `8` | `9` | `10` | `11` |

Kbach មាន `12` ទៀត ដែលដិតជាងគេ។ តារាងនេះគ្រាន់តែជាចំណុចចាប់ផ្តើម៖ បើពណ៌ត្រូវតែត្រឹមត្រូវបេះបិទ សូមប្រៀបធៀបជាមួយ [ប្រអប់ពណ៌](/colors)។

## ដាក់ការកំណត់ក្រោយ CDN script {#settings-after-the-script}

ក្នុងទំព័រ HTML ធម្មតា script របស់ Kbach អាន `window.kbachConfig` តែម្តងគត់ ពេលវាចាប់ផ្តើម។ ការកំណត់ដែលសរសេរក្រោយ script មិនដែលត្រូវអានទេ៖ ពណ៌ផ្ទាល់ខ្លួនមិនមាន ហើយ `darkMode: 'class'` ក៏មិនត្រូវយកមកប្រើដែរ ដូច្នេះប៊ូតុងប្តូរ theme គ្មានប្រសិទ្ធភាព។

```html
<!-- ✗ the script has already started when the settings appear -->
<script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>
<script>
  window.kbachConfig = { darkMode: 'class' };
</script>

<!-- ✓ settings first, then the script -->
<script>
  window.kbachConfig = { darkMode: 'class' };
</script>
<script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>
```

## ប៊ូតុងប្តូរ theme ដែលមិនទាន់កំណត់ strategy {#a-theme-button-with-no-strategy}

លើ web និងក្នុង HTML ធម្មតា ជាលំនាំដើម dark mode ប្តូរតាមឧបករណ៍ (`darkMode: 'media'`) ហើយមិនអាចប្តូរដោយដៃបានទេ។ `useTheme().toggle()` និង `Kbach.toggle()` ដំណើរការលុះត្រាតែអ្នកជ្រើស `'class'` ឬ `'attribute'`៖

```js title="kbach.config.js"
export default {
  darkMode: 'class',
};
```

ក្នុងទំព័រ HTML ធម្មតា ការកំណត់ដដែលនេះដាក់ក្នុង `window.kbachConfig` មុន script។

## Class ដែលផ្គុំពីបំណែក {#a-class-glued-together}

ជាមួយ React លើ web ពេល build, plugin អានឯកសាររបស់អ្នក ហើយរកឃើញតែ class ដែលសរសេរពេញឈ្មោះ។ ឈ្មោះដែលផ្គុំពេល app កំពុងរត់ គ្មាន CSS ទេ។

```tsx
// ✗ the build never sees "bg-red-6"
<div className={'bg-' + color + '-6'} />

// ✓ every class written out
const BG = { red: clsx('bg-red-6'), blue: clsx('bg-blue-6') };
<div className={BG[color]} />
```

មើលនៅ [Dynamic classes](/dynamic-classes)។ (React Native និងទំព័រ HTML ធម្មតា បំប្លែង class ពេលកំពុងរត់ ដូច្នេះកំហុសនេះកើតតែលើ web ប៉ុណ្ណោះ។)

## Class សម្រាប់តែ web ក្នុង app React Native {#web-only-classes-in-react-native}

App ទូរស័ព្ទគ្មាន CSS ដូច្នេះ layout បែប grid, gradient, filter, transition, `group-hover:` និង `before:` គ្មានប្រសិទ្ធភាពនៅទីនោះ ហើយក៏គ្មាន error ដែរ។ ក្នុងឯកសារយោង class ទាំងនេះមានសញ្ញា **Web only**។ របស់ដែលត្រូវប្រើជំនួស មាននៅ [React Native](/react-native#what-doesnt-work)។

## ភ្លេចដាក់ Babel plugin ក្នុង React Native {#no-babel-plugin}

បើគ្មាន `'@kbach/react-native/babel-plugin'` ក្នុង `babel.config.js` ទេ `className` គ្មានប្រសិទ្ធភាពអ្វីទាំងអស់ លើគ្រប់ឧបករណ៍ សូម្បីតែ Expo Go។ សូមបន្ថែមវា រួចបើក Metro ឡើងវិញដោយសម្អាត cache។ មើលនៅ [ការដំឡើង](/installation?tab=react-native#rn-babel)។

## ដាក់ការកំណត់ខុសកន្លែង {#settings-in-the-wrong-place}

Kbach មិនអាន `tailwind.config.js`, ប្លុក `@theme`, `@tailwind` ឬ `@import "tailwindcss"` ក្នុង CSS ទេ ហើយក៏គ្មាន `@apply` ដែរ។ ពណ៌ គម្លាត និង font របស់អ្នក ត្រូវដាក់ក្នុង [kbach.config.js](/configuration)។

## ពិនិត្យទំព័ររបស់អ្នក {#check-your-page}

មានបីវិធីរក class ដែលគ្មានប្រសិទ្ធភាព៖

- **បិទភ្ជាប់ក្នុង [Playground](/playground)។** Editor គូសបន្ទាត់ក្រោមរាល់ class ដែលវាមិនស្គាល់ ហើយប្រាប់ឈ្មោះត្រឹមត្រូវ។ ចុច **Fix all** នៅរបារស្ថានភាព ដើម្បីកែកម្រិតពណ៌ទាំងអស់ក្នុងពេលតែមួយ។ នេះជាវិធីលឿនបំផុតសម្រាប់ពិនិត្យទំព័រ HTML ធម្មតា។
- **មើល terminal។** ជាមួយ React លើ web, dev server ប្រាប់រាល់ class ដែលមិនស្គាល់ ព្រមទាំងឯកសារ បន្ទាត់ និងវិធីកែ។
- **ប្រើ [VS Code extension](/editor-setup)។** វាគូសបន្ទាត់ក្រោម class ដែលមិនស្គាល់ពេលអ្នកវាយ ហើយក្នុង project React Native វាគូសទាំង class សម្រាប់តែ web ផងដែរ។

CDN script ខ្លួនឯងមិនប្រាប់អំពី class ដែលមិនស្គាល់ទេ ព្រោះទំព័រអាចប្រើ CSS ផ្សេងដែរ។

## ប្រើជាមួយ AI ឬ? {#using-an-ai-assistant}

AI ធ្វើកំហុសទាំងនេះដដែលៗ ព្រោះវារៀនកម្រិតពណ៌ 50 ដល់ 950 ពី Tailwind CSS។ សូមឱ្យច្បាប់របស់ Kbach ទៅវាជាមុន៖ មើលនៅ [ប្រើជាមួយ AI](/ai-assistants)។
