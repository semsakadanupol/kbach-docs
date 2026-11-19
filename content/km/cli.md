---
title: CLI
description: npx @kbach/cli init រៀបចំ Kbach ក្នុង project ដែលមានស្រាប់, doctor ពិនិត្យ project ដែលរៀបចំរួច ហើយ ai បង្រៀនច្បាប់របស់ Kbach ដល់ AI របស់អ្នក។
---

## init {#init}

```sh
npx @kbach/cli init
```

`init` អាន `package.json` ដើម្បីដឹងថា project ប្រើ framework អ្វី រួចធ្វើដូចតទៅ៖

| Framework | ដំឡើង | កែឯកសារ |
| :-- | :-- | :-- |
| Vite | `@kbach/react` | បន្ថែម `kbach()` ក្នុង `vite.config.ts` និង `import './kbach.css'` ក្នុងឯកសារ entry |
| Next.js | `@kbach/react` | បន្ថែម plugin ក្នុង `postcss.config.js` និងសញ្ញាសម្គាល់ក្នុង `globals.css` |
| Expo | `@kbach/react-native` | បន្ថែម Babel plugin ក្នុង `babel.config.js` ឬបង្កើតឯកសារនេះបើមិនទាន់មាន |
| React Native CLI | `@kbach/react-native` | ដូចខាងលើ ហើយសួរថាចង់ build app Android ឡើងវិញឬអត់ |

នៅចុងក្រោយ វាសួរថាអ្នកចង់ប្រើ strategy dark mode មួយណា និងចង់បន្ថែមច្បាប់របស់ Kbach សម្រាប់ AI ឬអត់ (មើលនៅ [ai](#ai))។ វាសរសេរ `kbach.config.js` តែពេលអ្នកជ្រើសផ្សេងពីលំនាំដើម ហើយឯកសារនេះមិនទាន់មានប៉ុណ្ណោះ។

ពេលកែឯកសារ វារក្សា format និង comment របស់អ្នកដដែល។ បើឯកសារ config មានទម្រង់ដែល CLI មិនស្គាល់ វាមិនកែអ្វីទេ តែបង្ហាញកូដឱ្យអ្នកបន្ថែមដោយដៃ។ រត់ `init` ម្តងទៀតលើ project ដែលរៀបចំរួច ក៏វាមិនកែអ្វីដែរ។

## doctor {#doctor}

```sh
npx @kbach/cli doctor
```

`doctor` គ្រាន់តែអាន មិនកែអ្វីទេ។ វាពិនិត្យថា៖

- package ត្រឹមត្រូវត្រូវបានដំឡើង
- plugin មានក្នុង `vite.config.ts`, `postcss.config.js` ឬ `babel.config.js`
- `kbach.css` មាន ហើយត្រូវបាន import (Vite) ឬសញ្ញាសម្គាល់មានក្នុង `globals.css` (Next.js)
- `kbach.config.js` អានបានដោយគ្មានកំហុស
- មាន `react` និង `react-native` តែមួយច្បាប់ (React Native)
- native module មានក្នុង build Android ចុងក្រោយ (React Native CLI)

ពេលអ្វីៗត្រឹមត្រូវ វាបញ្ចប់ដោយ code `0` ហើយពេលមានបញ្ហា ដោយ code `1` ដូច្នេះអាចដាក់ជាជំហានមួយក្នុង CI បាន។

## ai {#ai}

```sh
npx @kbach/cli ai
```

AI រៀនពី Tailwind CSS មិនមែនពី Kbach ទេ ដូច្នេះវាសរសេរ class ដែល Kbach មិនមាន។ `ai` សរសេរ [ច្បាប់របស់ Kbach](/ai-assistants#give-it-the-rules) ចូលក្នុងឯកសារដែលឧបករណ៍ AI អានសម្រាប់ការណែនាំរបស់ project៖

| ឯកសារ | ពេលណា |
| :-- | :-- |
| `AGENTS.md` | គ្រប់ពេល បើមិនទាន់មាន វាបង្កើតថ្មី។ Codex, Copilot, Cursor, Gemini CLI និងផ្សេងទៀតអានឯកសារនេះ |
| `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` | តែពេល project មានឯកសារនោះស្រាប់ |

ច្បាប់ត្រូវដាក់ក្នុងផ្នែកមួយដែលមានសញ្ញាសម្គាល់ ហើយផ្នែកផ្សេងទៀតនៃឯកសារនៅដដែល។ ក្រោយ upgrade Kbach សូមរត់វាម្តងទៀត ដើម្បីបានច្បាប់ថ្មីបំផុត បើច្បាប់ថ្មីរួចហើយ វាមិនកែអ្វីទេ។ Claude Code អាន `CLAUDE.md` មិនមែន `AGENTS.md` ទេ៖ បើអ្នកប្រើវា ហើយគ្មាន `CLAUDE.md` សូមបង្កើតមួយ ដែលមានបន្ទាត់ `@AGENTS.md`។

## ជម្រើស {#options}

```text
kbach <init|doctor|ai> [--dry-run] [-y|--yes] [--pm <npm|pnpm|yarn|bun>] [--cwd <path>]
```

| ជម្រើស | |
| :-- | :-- |
| `--dry-run` | ប្រាប់ថានឹងកែអ្វីខ្លះ ដោយមិនសរសេរអ្វីទាំងអស់ |
| `-y`, `--yes` | ឆ្លើយតាមលំនាំដើមគ្រប់សំណួរ |
| `--pm` | Package manager ដែលត្រូវប្រើ។ ជាលំនាំដើម វាមើលពី lockfile |
| `--cwd` | រត់ក្នុង folder ផ្សេង ដូចជា app មួយក្នុង monorepo៖ `--cwd apps/web` |

ពេលគ្មាន terminal ឧទាហរណ៍ក្នុង CI, `init` ឆ្លើយតាមលំនាំដើមដោយខ្លួនឯង ហើយប្រាប់អ្នកថាវាបានធ្វើបែបនោះ។ បើវាមិនអាចដឹងថា project ប្រើ framework អ្វី វានឹងឈប់ ជាជាងទាយ។

## ដំឡើងប្រើគ្រប់ project {#install-it-globally}

```sh
npm install -g @kbach/cli
kbach doctor
```
