---
title: របៀបដែល Kbach ដំណើរការ
nav: របៀបដែល Kbach ដំណើរការ
description: តើ class របស់អ្នកក្លាយជា style ដោយរបៀបណា លើ web, ក្នុង React Native និងក្នុងទំព័រ HTML ធម្មតា ហើយហេតុអ្វីបានជា class ខ្លះប្រើបានតែកន្លែងមួយ។
---

## Engine តែមួយ {#one-engine}

បេះដូងរបស់ Kbach គឺ engine មួយដែលសរសេរដោយភាសា Rust។ អ្នកឱ្យឈ្មោះ class ទៅវា ហើយវាប្រាប់ថា class នោះមានន័យដូចម្តេច៖ `p-4` គឺ "padding 16px", `bg-blue-6` គឺ "ផ្ទៃខាងក្រោយពណ៌ខៀវនេះ"។ Package ទាំងអស់ប្រើ engine តែមួយនេះ ដូច្នេះ class នីមួយៗមានន័យដូចគ្នាគ្រប់ទីកន្លែង។

អ្វីដែលខុសគ្នា គឺ engine រត់ **ពេលណា** និងបង្កើត **អ្វី**៖

| កន្លែង | Engine រត់ពេលណា | លទ្ធផល |
| :-- | :-- | :-- |
| Web (React) | ពេល build និងពេល dev server កំពុងរត់ | ឯកសារ CSS |
| React Native | ពេល element នីមួយៗ render | Style object របស់ React Native |
| HTML ធម្មតា | ក្នុង browser ពេលទំព័របើក | CSS ដែលបន្ថែមចូលទំព័រ |

## លើ web៖ ពេល build {#on-the-web}

1. Plugin របស់ Vite ឬ PostCSS អានឯកសារកូដក្នុង `src`, `app`, `pages` និង `components` ហើយរកឈ្មោះ class។
2. Engine បង្កើត CSS សម្រាប់ class នីមួយៗ។
3. Plugin សរសេរ CSS ទាំងអស់ចូលឯកសារតែមួយឈ្មោះ `kbach.css` ដែលអ្នក import តែម្តង។
4. ពេល app រត់ `className` គ្រាន់តែជា string ធម្មតា។ CSS មានរួចជាស្រេច ដូច្នេះគ្មានអ្វីត្រូវទាញយក ឬរង់ចាំទៀតទេ។

Plugin រក class ដោយ **អាន** កូដ មិនមែនដោយរត់កូដទេ។ ហេតុនេះ class ត្រូវតែសរសេរពេញឈ្មោះនៅកន្លែងណាមួយក្នុងកូដ។ ឧទាហរណ៍ `'bg-' + color + '-6'` រកមិនឃើញទេ ព្រោះក្នុងឯកសារគ្មានពាក្យ `bg-blue-6` ពេញៗទេ។ វិធីដោះស្រាយមាននៅទំព័រ [Dynamic classes](/dynamic-classes)។

ពេល dev server កំពុងរត់ រាល់ពេលអ្នក save ឯកសារ plugin សរសេរ `kbach.css` ឡើងវិញភ្លាម។ បើឈ្មោះ class ណាមិនត្រូវនឹងអ្វីសោះ terminal នឹងប្រាប់ ដោយបញ្ជាក់ឯកសារ បន្ទាត់ និង class ដែលអ្នកប្រហែលជាចង់សរសេរ។ ព័ត៌មានលម្អិតមាននៅទំព័រ [Web](/web)។

## ក្នុង React Native៖ ពេល element render {#in-react-native}

React Native គ្មាន CSS ទេ។ Element នីមួយៗប្រើ style object ជំនួសវិញ ដូចជា `{ padding: 16, backgroundColor: '#3b82f6' }`។

1. Babel plugin ធ្វើឱ្យ `className` ប្រើបានលើ element របស់ React Native ដូចជា `View`, `Text`, `Pressable` ជាដើម។
2. ពេល element render, engine បំប្លែង class របស់វាទៅជា style object។
3. លទ្ធផលត្រូវចងចាំទុក ដូច្នេះ class ដដែលមិនត្រូវគណនាពីរដងទេ។

ដោយសារ engine រត់ពេល app កំពុងដំណើរការ class ដែលផ្គុំពីបំណែកៗ (`'bg-' + color + '-6'`) ប្រើបានធម្មតាលើ React Native។

Engine ដែលរត់ ខុសគ្នាទៅតាមឧបករណ៍៖

| ឧបករណ៍ | Engine |
| :-- | :-- |
| Android (build សម្រាប់ development ឬ release) | Rust engine តាមរយៈ native module |
| iOS (build ប្រភេទណាក៏ដោយ) និង Expo Go | Engine ជំនាន់ JavaScript ដែលស្គាល់ class ប្រចាំថ្ងៃដូចគ្នា តែខ្វះខ្លះៗ |
| Expo Web | WebAssembly engine ដូច web ដែលសរសេរ CSS ពិតៗ |

ចំណុចដែលជំនាន់ JavaScript ខ្វះ និង class ណាខ្លះគ្មានប្រសិទ្ធភាពលើទូរស័ព្ទ មានរៀបរាប់នៅទំព័រ [React Native](/react-native)។

## ក្នុងទំព័រ HTML ធម្មតា៖ ក្នុង browser {#in-plain-html}

1. Tag `<script>` ទាញយក engine ជា WebAssembly។
2. Script អាន attribute `class` របស់ element ទាំងអស់លើទំព័រ ហើយបន្ថែម CSS ដែលត្រូវការចូលទំព័រ។
3. វាតាមដានទំព័រជានិច្ច៖ element ដែលបន្ថែមពេលក្រោយ ឬ class ដែល JavaScript ប្តូរ ក៏បាន style ដែរ។

Class ណាដែល Kbach មិនស្គាល់ script នឹងរំលង ដូច្នេះអ្នកអាចប្រើ CSS ផ្សេងលើទំព័រជាមួយបាន។ ព័ត៌មានលម្អិតមាននៅទំព័រ [HTML ធម្មតា](/plain-html)។

## ហេតុអ្វី class ខ្លះប្រើបានតែលើ web {#why-some-classes-only-work-on-the-web}

ទំព័រ web និង app ទូរស័ព្ទ គូររូបរាងតាមរបៀបខុសគ្នា។ Browser យល់គ្រប់អ្វីដែល CSS ធ្វើបាន ចំណែក React Native យល់តែ style មួយចំនួនតូច គឺប្រអប់ ការតម្រៀបជាជួរដេក និងជួរឈរ border ស្រមោល អក្សរ transform និង opacity។

ហេតុនេះ class ណាដែលពឹងលើមុខងារ CSS ដែល React Native គ្មាន នឹងគ្មានប្រសិទ្ធភាពនៅទីនោះ ឧទាហរណ៍៖

- Layout បែប grid (`grid-cols-3`) float និងអក្សរច្រើនជួរឈរ
- Gradient, filter (`blur-sm`) និង blend mode
- Transition និង animation
- `group-hover:`, `peer-*`, `before:` និង `after:` ព្រោះ app ទូរស័ព្ទគ្មាន CSS selector

Class ទាំងនេះនៅតែត្រឹមត្រូវ ហើយប្រើបានលើ web និង Expo Web។ គ្រាន់តែលើទូរស័ព្ទ Kbach រំលងវាចោល ដោយមិនមាន error ទេ។ ក្នុងតារាងឯកសារយោង class ទាំងនេះមានសញ្ញា **Web only** ហើយ [VS Code extension](/editor-setup) ក៏គូសបន្ទាត់ពីក្រោមវាក្នុង project React Native ដែរ។

## អ្វីដែលដូចគ្នាគ្រប់ទីកន្លែង {#whats-the-same-everywhere}

- ឈ្មោះ class និងអត្ថន័យរបស់វា។
- ពណ៌៖ 26 ក្រុម ក្រុមនីមួយៗមាន 12 កម្រិត។ មើលនៅ [ពណ៌](/colors)។
- ឯកសារការកំណត់ `kbach.config.js` សម្រាប់ពណ៌ គម្លាត និង font ផ្ទាល់ខ្លួន។ មើលនៅ [kbach.config.js](/configuration)។
- Dark mode៖ class `dark:` ដំណើរការដូចគ្នាគ្រប់ទីកន្លែង។ បើចង់ប្តូរដោយខ្លួនឯង React និង React Native មាន hook `useTheme()` ចំណែកទំព័រ HTML ធម្មតាមាន `Kbach.toggle()`។ មើលនៅ [Dark mode](/dark-mode)។
