---
title: Web
description: Kbach ដំណើរការយ៉ាងដូចម្តេចក្នុង app React ដែលប្រើ Vite ឬ Next.js៖ ពេល build, plugin រក class របស់អ្នក ហើយសរសេរ CSS ចូលឯកសារតែមួយ ដូច្នេះក្នុង browser គ្មានកូដត្រូវរត់ដើម្បីដាក់ style ទៀតទេ។
---

លើ web, Kbach គឺ package `@kbach/react` ដែលមក​ជាមួយ plugin សម្រាប់ build tool របស់អ្នក៖ Vite plugin ឬ PostCSS plugin សម្រាប់ Next.js និង tool ផ្សេងទៀតដែលប្រើ PostCSS។ របៀបរៀបចំ មាននៅទំព័រ [ការដំឡើង](/installation)។

## Plugin ធ្វើអ្វីខ្លះ {#what-the-plugin-does}

1. អានឯកសារកូដរបស់អ្នក ហើយប្រមូលឈ្មោះ class ទាំងអស់។
2. សុំ CSS របស់ class នីមួយៗពី engine។
3. សរសេរ CSS ទាំងអស់ចូលឯកសារតែមួយ `kbach.css`។ ក្នុងនោះមានតែ class ដែលអ្នកប្រើពិតៗ ហើយតម្រៀបតាមលំដាប់ថេរ ដូច្នេះ class ដដែល តែងតែបានឯកសារដដែល។

ពេល app រត់ `className` គ្រាន់តែជា string ធម្មតា ហើយ CSS មានរួចជាស្រេច។ ក្នុង browser គ្មានកូដណាត្រូវរត់ដើម្បីដាក់ style ទៀតទេ។ ការ render លើ server (ដូចក្នុង Next.js) ក៏ដំណើរការធម្មតា ព្រោះ CSS ជាឯកសារធម្មតាមួយ។

ពេល dev server កំពុងរត់ រាល់ពេលអ្នក save ឯកសារ CSS ប្តូរតាមភ្លាម។ កែ `kbach.config.js` ក៏ដូចគ្នា CSS ប្តូរតាមដោយមិនបាច់បិទបើក server ឡើងវិញ។

## Plugin រក class នៅឯណា {#where-it-looks}

Plugin អានឯកសារ `.js`, `.jsx`, `.ts` និង `.tsx` ក្នុង folder `src`, `app`, `pages` និង `components` ហើយរំលង `node_modules` និង folder លទ្ធផល build។ បើចង់ឱ្យវាអាន folder ផ្សេងទៀត សូមប្រើ [ជម្រើស `include`](/plugin-options#include)។

ក្នុងឯកសារទាំងនោះ វាយកឈ្មោះ class ពី៖

- `className="..."` និង `className={...}`
- ការហៅ `clsx()`, `cn()`, `cx()`, `classnames()` និង `kb()`
- Template literal (អក្សរក្នុងសញ្ញា backtick)

Plugin អានកូដជាអក្សរ មិនដែលរត់កូដទេ ដូច្នេះ class ត្រូវតែសរសេរពេញឈ្មោះ។ ឧទាហរណ៍ `'bg-' + color + '-6'` plugin មិនដែលរកឃើញទេ។ វិធីដោះស្រាយមាននៅទំព័រ [Dynamic classes](/dynamic-classes)។

## ការព្រមានពេលមាន class មិនស្គាល់ {#unknown-class-warnings}

បើ class ណាមិនត្រូវនឹងអ្វីសោះ terminal ដែលរត់ dev server នឹងប្រាប់ទីតាំងរបស់វា ហើយបើមានដំណោះស្រាយច្បាស់ វាប្រាប់ផងថាអ្នកប្រហែលជាចង់សរសេរអ្វី៖

```text
→ [Kbach] Unknown class bg-blue-500 — did you mean bg-blue-6? Kbach color shades run 1–12, not 50–950.
  at src/App.tsx:12:24
→ [Kbach] Unknown class flexx — did you mean flex?
  at src/App.tsx:12:36
```

Class ដែលមានក្នុងឯកសារ CSS ផ្ទាល់ខ្លួនរបស់អ្នក មិនត្រូវរាប់ថាមិនស្គាល់ទេ ដូច្នេះអ្នកអាចប្រើ Kbach ជាមួយ stylesheet ធម្មតាបាន។

## ក្នុង kbach.css មានអ្វីខ្លះ {#whats-in-kbach-css}

- **Reset** តូចមួយ ដែលដក margin និង border លំនាំដើមរបស់ browser ចេញ សម្រាប់តែ element HTML ណាដែល project របស់អ្នកប្រើ។ ហេតុនេះហើយបានជា `<h1>` ដែលគ្មាន class មើលទៅដូចអក្សរធម្មតា។
- CSS សម្រាប់ class ទាំងអស់ដែលអ្នកប្រើ។
- CSS variable សម្រាប់ពណ៌ mode-aware និងការប្តូរ dark mode។

កុំកែឯកសារនេះដោយដៃ ព្រោះ plugin សរសេរវាឡើងវិញរាល់ពេល class ប្តូរ។ បើប្រើ PostCSS, plugin សរសេរតែនៅចន្លោះ comment `/* kbach:start */` និង `/* kbach:end */` ប៉ុណ្ណោះ ផ្នែកផ្សេងទៀតនៃឯកសារនៅជារបស់អ្នក។

## លើ web ប្រើបានទាំងអស់ {#everything-works-on-the-web}

លើ web, class និង [variant](/variants) ទាំងអស់ប្រើបាន៖ grid, gradient, filter, transition, `group-hover:`, `before:`, container query និងផ្សេងៗទៀត។ សញ្ញា **Web only** ក្នុងឯកសារយោង និយាយអំពី React Native មិនមែនអំពី browser ទេ។

## ទំព័រពាក់ព័ន្ធ {#related}

- [Dynamic classes](/dynamic-classes)៖ class ដែលដឹងតែពេល app កំពុងរត់។
- [Plugin options](/plugin-options)៖ `include`, `safelist` និងជម្រើសផ្សេងៗ។
- [React API](/react-api)៖ `useTheme`, `useColors`, `clsx` និង export ផ្សេងទៀត។
