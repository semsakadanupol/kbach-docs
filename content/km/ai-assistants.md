---
title: ប្រើជាមួយ AI
nav: ប្រើជាមួយ AI
description: AI រៀនពី Tailwind CSS មិនមែនពី Kbach ទេ ដូច្នេះវាតែងតែធ្វើខុសដដែលៗពីរបីចំណុច។ សូមឱ្យច្បាប់ខាងក្រោមទៅវាជាមុន នោះវានឹងសរសេរ Kbach បានត្រឹមត្រូវ។
---

Gemini, ChatGPT, Claude និង Copilot ធ្លាប់ឃើញ Tailwind CSS ច្រើន តែស្គាល់ Kbach តិចណាស់។ ពេលអ្នកសុំឱ្យវាសរសេរទំព័រ Kbach វាតែងតែប្រើកម្រិតពណ៌តាមរបៀប Tailwind (`text-amber-700`) ដាក់ការកំណត់ខុសកន្លែង ហើយប្រើ class ដែលទូរស័ព្ទបង្ហាញមិនបាន។ មើលកូដទៅហាក់ដូចជាត្រឹមត្រូវ ហើយក៏គ្មានអ្វីប្រាប់ថាខុសដែរ។

វិធីដោះស្រាយ គឺឱ្យច្បាប់របស់ Kbach ទៅ AI មុនពេលអ្នកសុំអ្វីទាំងអស់។

## ក្នុង project៖ ពាក្យបញ្ជាតែមួយ {#in-a-project}

```sh
npx @kbach/cli ai
```

ពាក្យបញ្ជានេះសរសេរច្បាប់ចូលក្នុង `AGENTS.md` របស់ project ដែលជាឯកសារណែនាំដែល Codex, Copilot, Cursor, Gemini CLI និង AI សរសេរកូដផ្សេងទៀតអានដោយខ្លួនឯង ហើយក៏សរសេរចូល `CLAUDE.md`, `GEMINI.md` ឬ `.github/copilot-instructions.md` ដែរ បើ project មានឯកសារទាំងនោះ។ `npx @kbach/cli init` ក៏សួរថាចង់ធ្វើដូចគ្នាឬអត់ ពេលវារៀបចំ project។ មើលនៅ [CLI](/cli#ai)។

## ឱ្យច្បាប់ទៅ AI {#give-it-the-rules}

ក្នុងការជជែក (Gemini, ChatGPT, Claude លើ web) សូមចម្លងប្លុកខាងក្រោមដាក់ក្នុងការសន្ទនា មុនពេលសួរ។ ច្បាប់ទាំងនេះសរសេរជាភាសាអង់គ្លេស ព្រោះ AI អានវាបានច្បាស់ជាង៖

```text
Kbach rules. Follow them in every class you write.

1. Color shades go from 1 (lightest) to 12 (darkest). Never use 50 to 950.
   Convert: 50→1 100→2 200→3 300→4 400→5 500→6 600→7 700→8 800→9 900→10 950→11.
   Write bg-blue-6, text-gray-11, border-slate-3. Never bg-blue-500.
2. Color families: amber blue cyan emerald fuchsia gray green indigo lime
   mauve mist neutral olive orange pink purple red rose sky slate stone taupe
   teal violet yellow zinc. Single colors: white black transparent current
   gold silver bronze copper coal.
3. Every other class follows Tailwind CSS v4.3 names and values: spacing in
   steps of 4px (p-4 is 16px), variants such as hover:, md: and dark:,
   values in square brackets, a slash for opacity (bg-black/50).
   Gradients: bg-linear-to-r from-* via-* to-*.
4. There is no tailwind.config.js, no @tailwind, no @import "tailwindcss",
   no @theme and no @apply. Settings go in kbach.config.js
   (export default { darkMode, theme, extend }). Custom animations go in
   extend.keyframes and extend.animation and are used as animate-<name>.
5. Plain HTML page: put <script>window.kbachConfig = { ... }</script> BEFORE
   <script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>.
   A theme button calls Kbach.toggle() and needs darkMode: 'class' or
   'attribute' in that config.
6. React with Vite: import { kbach } from '@kbach/react/vite' and add kbach()
   to plugins; import './kbach.css' once in the entry file. Write every class
   in full: never build one from pieces like 'bg-' + color.
7. React Native: '@kbach/react-native/babel-plugin' must be in
   babel.config.js. On a phone there is no grid, no gradients, no filters, no
   transitions or animations, no group-*, peer-*, before: or after:. Use
   flex-row for rows (a View is a column). Values in brackets: px or rem only.
8. Dark mode switches use useTheme() from '@kbach/react' or
   '@kbach/react-native': { mode, isDark, setMode, toggle }.

Full documentation: https://kbach.vercel.app
```

ច្បាប់ដដែលនេះក៏មានជាឯកសារ `/llms.txt` ដែលជាឯកសារដែលឧបករណ៍ AI តែងរកមើលលើគេហទំព័រឯកសារ ហើយឯកសារទាំងមូលក៏មានជាឯកសារអក្សរតែមួយនៅ `/llms-full.txt` ដែរ។ ពេលគេហទំព័រឯកសារនេះដាក់ឱ្យប្រើលើអ៊ីនធឺណិត អ្នកអាចឱ្យអាសយដ្ឋានមួយក្នុងចំណោមពីរនេះទៅ AI ជំនួសការបិទភ្ជាប់បាន។

## ពិនិត្យអ្វីដែល AI សរសេរ {#check-what-it-wrote}

AI នៅតែអាចខុសខ្លះ ជាពិសេសលើទំព័រវែងៗ។ មុនយកលទ្ធផលទៅប្រើ៖

- បិទភ្ជាប់វាក្នុង [Playground](/playground)៖ class ដែលមិនស្គាល់ត្រូវគូសបន្ទាត់ក្រោម ព្រមទាំងប្រាប់ឈ្មោះត្រឹមត្រូវ ហើយ **Fix all** កែកម្រិតពណ៌ទាំងអស់ដោយចុចតែម្តង។
- រកមើលកំហុសដែលមានក្នុង [កំហុសដែលជួបញឹកញាប់](/common-mistakes) ព្រោះ AI ធ្វើខុសដូចគ្នានឹងមនុស្សដែរ។
- ក្នុង project React, terminal និង [VS Code extension](/editor-setup) ប្រាប់រាល់ class ដែលមិនស្គាល់។
