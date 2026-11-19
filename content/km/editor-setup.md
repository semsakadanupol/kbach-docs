---
title: ការរៀបចំ Editor
nav: ការរៀបចំ Editor
description: Extension Kbach IntelliSense សម្រាប់ VS Code ណែនាំឈ្មោះ class ពេលអ្នកវាយ បង្ហាញថា class នីមួយៗធ្វើអ្វី និងប្រាប់ពេលអ្នកវាយខុស។ វាប្រើ engine ពិតប្រាកដដើម្បីពិនិត្យ class គ្រប់ពេល។
---

::extension

## អ្វីដែលអ្នកនឹងទទួលបាន {#what-you-get}

- **ការណែនាំ class ពេលវាយ** ក្នុង `className` ព្រមទាំងបង្ហាញ CSS របស់ class នីមួយៗនៅក្បែរ។ ពណ៌ដែលអ្នកបន្ថែមក្នុង `kbach.config.js` ក៏មានក្នុងបញ្ជីណែនាំដែរ។
- **Hover** លើ class ដើម្បីមើល CSS របស់វា។ បើជា class ពណ៌ វាបង្ហាញប្រអប់ពណ៌ឱ្យមើលផង។
- **ការព្រមានពេលវាយខុស** ពេល class មិនមានពិត។ បើមាន class ដែលជិតស្រដៀង អ្នកចុចម្តងដើម្បីកែបានភ្លាម (`bg-blu-6` ក្លាយជា `bg-blue-6`)។
- **ការព្រមានសម្រាប់ React Native**៖ ក្នុង project React Native, class ណាដែលត្រឹមត្រូវ ប៉ុន្តែគ្មានប្រសិទ្ធភាពលើទូរស័ព្ទ (ដូចជា `grid`, `group-hover:` ឬ `before:`) នឹងមានបន្ទាត់គូសពីក្រោម។
- **ឧបករណ៍រើសពណ៌** សម្រាប់ពណ៌ដែលអ្នកវាយក្នុងតង្កៀបការ៉េ ដូចជា `bg-[#c7a25d]`។

Extension ប្រើ engine ដូចគ្នានឹងពេល build ដូច្នេះអ្វីដែលវាបង្ហាញ គឺដូចលទ្ធផលពិតប្រាកដ។

## ដំឡើង {#install}

ក្នុង VS Code បើកផ្ទាំង Extensions (<kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>X</kbd> ឬ <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>X</kbd> លើ macOS) ស្វែងរក **Kbach IntelliSense** ហើយចុច **Install**។ ឬដំឡើងពី terminal៖

```sh
code --install-extension kbach.kbach-vscode
```

វាចាប់ផ្តើមដំណើរការដោយខ្លួនឯង ពេលអ្នកបើកឯកសារ `.js`, `.jsx`, `.ts` ឬ `.tsx`។ មិនចាំបាច់កំណត់អ្វីទេ។

## គួរដឹង {#good-to-know}

- បញ្ជីណែនាំមាន class ដែលគេប្រើញឹកញាប់ និងលេខគម្លាត និងពណ៌ទាំងអស់ ប៉ុន្តែមិនមែនគ្រប់ class ដែល engine ស្គាល់ទេ។ ដូច្នេះ class ដែលមិនឃើញក្នុងបញ្ជី អាចនៅតែត្រឹមត្រូវ។ ចំណែក hover និងការព្រមានពេលវាយខុស សួរ engine ពិតប្រាកដរាល់ដង ដូច្នេះមិនដែលខុសទេ។
- ពេល `kbach.config.js` ផ្លាស់ប្តូរ extension ដឹងភ្លាម ហើយពណ៌ថ្មីបង្ហាញឡើង ដោយមិនចាំបាច់បើក VS Code ឡើងវិញ។
- Extension ដំណើរការតែក្នុងឯកសារ JavaScript និង TypeScript មិនដំណើរការក្នុងឯកសារ `.html` ទេ។ CDN script សម្រាប់ទំព័រ HTML ធម្មតាក៏មិនប្រាប់ពេលវាយខុសដែរ ព្រោះទំព័រអាចមាន class ពី CSS ផ្សេង ដូច្នេះ script រំលងឈ្មោះណាដែលវាមិនស្គាល់។ បើចង់ពិនិត្យ class មុនប្រើក្នុង HTML សូមរកមើលក្នុងឯកសារយោង ឬសាកក្នុង [Playground](/playground)។
