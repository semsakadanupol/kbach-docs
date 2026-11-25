---
title: ការដំឡើង
nav: ការដំឡើង
description: ដំឡើង Kbach សម្រាប់ React លើ web, Next.js, React Native ឬទំព័រ HTML ធម្មតា។ សូមជ្រើសរើសប្រភេទ project របស់អ្នក រួចធ្វើតាមជំហានខាងក្រោម។
---

:::tabs
:::tab React (Vite) {#vite} icon=vite note="Vite plugin"

## ដំឡើង package {#vite-install}

```sh tab="npm"
npm install @kbach/react
```

```sh tab="pnpm"
pnpm add @kbach/react
```

```sh tab="yarn"
yarn add @kbach/react
```

```sh tab="bun"
bun add @kbach/react
```

> [!TIP] ឬឱ្យ CLI ធ្វើជំហានទី 1 ដល់ 3 ជំនួស
> `npx @kbach/cli init` ដំឡើង package ដាក់ plugin និង import CSS ឱ្យអ្នក។ វាមិនប៉ះ format ឬ comment របស់អ្នកទេ ហើយបើរត់ម្តងទៀតលើ project ដែលរៀបចំរួច វាក៏មិនកែអ្វីដែរ។

## ដាក់ plugin {#vite-plugin}

ដាក់ `kbach()` ក្នុងបញ្ជី plugins ក្បែរ plugin របស់ React៖

```ts title="vite.config.ts" {3,6}
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { kbach } from '@kbach/react/vite';

export default defineConfig({
  plugins: [kbach(), react()],
});
```

## Import CSS តែម្តង {#vite-css}

```tsx title="src/main.tsx" {4}
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './kbach.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

ពេល plugin រត់ជាលើកដំបូង វាបង្កើតឯកសារ `src/kbach.css` ដោយខ្លួនឯង។ កុំកែឯកសារនេះដោយដៃ ព្រោះ plugin សរសេរវាឡើងវិញរាល់ពេលដែលឈ្មោះ class ក្នុងកូដផ្លាស់ប្តូរ។

## ប្រើ class {#vite-use}

```tsx title="src/App.tsx"
export default function App() {
  return <h1 className="text-3xl font-bold text-blue-6 underline">Hello world</h1>;
}
```

បើក dev server ដោយ `npm run dev`។ សាកប្តូរ class មួយហើយ save មើល CSS នឹងប្តូរតាមភ្លាម។

> [!IMPORTANT] សរសេរឈ្មោះ class ឱ្យពេញ
> Plugin រក class ដោយអានឯកសាររបស់អ្នក ដូច្នេះវាឃើញតែ class ណាដែលសរសេរពេញឈ្មោះប៉ុណ្ណោះ។ បើផ្គុំឈ្មោះពេល app កំពុងរត់ ដូចជា `'bg-' + color + '-6'` នោះ class នោះនឹងគ្មាន CSS ទេ។ ទំព័រ [Dynamic classes](/dynamic-classes) បង្ហាញវិធីដោះស្រាយ ហើយទំព័រ [Web](/web) ពន្យល់ពីការងាររបស់ plugin។

:::tab Next.js {#nextjs} icon=nextjs note="PostCSS plugin"

Next.js និង bundler ផ្សេងទៀតដែលប្រើ PostCSS ត្រូវប្រើ PostCSS plugin។

## ដំឡើង package {#next-install}

```sh tab="npm"
npm install @kbach/react
```

```sh tab="pnpm"
pnpm add @kbach/react
```

```sh tab="yarn"
yarn add @kbach/react
```

```sh tab="bun"
bun add @kbach/react
```

> [!TIP] ឬឱ្យ CLI ធ្វើជំហានទី 1 ដល់ 3 ជំនួស
> `npx @kbach/cli init` ដំឡើង package ដាក់ PostCSS plugin និងបន្ថែមសញ្ញាសម្គាល់ក្នុង `globals.css` ឱ្យអ្នក។

## ដាក់ PostCSS plugin {#next-plugin}

```js title="postcss.config.js"
module.exports = {
  plugins: { '@kbach/react/postcss': {} },
};
```

## សម្គាល់កន្លែងដាក់ CSS {#next-markers}

បន្ថែម comment ពីរនេះក្នុងឯកសារ CSS សកលរបស់អ្នក។ Plugin សរសេរ CSS នៅចន្លោះ comment ទាំងពីរ ហើយមិនប៉ះផ្នែកផ្សេងទៀតនៃឯកសារទេ។

```css title="app/globals.css"
/* kbach:start */
/* kbach:end */
```

បន្ទាប់មក import `globals.css` តែម្តង តាមរបៀបធម្មតារបស់ Next.js គឺក្នុង `app/layout.tsx` ឬ `pages/_app.tsx`។

## ប្រើ class {#next-use}

```tsx title="app/page.tsx"
export default function Page() {
  return <h1 className="text-3xl font-bold text-blue-6 underline">Hello world</h1>;
}
```

> [!NOTE]
> PostCSS plugin រក `kbach.config.js` ក្នុង folder ដែលអ្នកបើក Node។ បើ `postcss.config.js` មិននៅឫសរបស់ project ទេ សូមប្រាប់ទីតាំងឫសដោយខ្លួនឯង៖ `{ '@kbach/react/postcss': { root: __dirname } }`។

:::tab React Native {#react-native} icon=react note="Babel plugin"

ឈ្មោះ class ដដែល ប៉ុន្តែ Kbach បំប្លែងវាទៅជា style របស់ React Native ពេល element នីមួយៗ render។ ប្រើបានលើ Android, iOS, Expo Go និង Expo Web។ មាន class ខ្លះសមតែនឹង browser ហើយគ្មានប្រសិទ្ធភាពលើទូរស័ព្ទ ទំព័រ [React Native](/react-native) ប្រាប់ថាមានអ្វីខ្លះ។

## ដំឡើង package {#rn-install}

```sh tab="npm"
npm install @kbach/react-native
```

```sh tab="pnpm"
pnpm add @kbach/react-native
```

```sh tab="yarn"
yarn add @kbach/react-native
```

```sh tab="bun"
bun add @kbach/react-native
```

> [!TIP] ឬឱ្យ CLI ធ្វើជំនួស
> `npx @kbach/cli init` ដំឡើង package និងដាក់ Babel plugin ឱ្យអ្នក។ សម្រាប់ project React Native CLI វាក៏សួរថាចង់ build app ឡើងវិញភ្លាមឬអត់ដែរ។

## ដាក់ Babel plugin {#rn-babel}

បន្ថែមមួយបន្ទាត់ក្នុង `plugins` ហើយទុកការកំណត់ផ្សេងទៀតដដែល៖

```js tab="Expo" title="babel.config.js" {5}
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['@kbach/react-native/babel-plugin'],
  };
};
```

```js tab="React Native CLI" title="babel.config.js" {3}
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['@kbach/react-native/babel-plugin'],
};
```

> [!WARNING] ត្រូវតែមាន Babel plugin គ្រប់ករណី
> បើគ្មាន plugin នេះទេ `className` គ្មានប្រសិទ្ធភាពអ្វីទាំងអស់ ហើយក៏គ្មាន error ឬការព្រមានប្រាប់ដែរ ទោះក្នុង Expo Go ក៏ដោយ។ នេះជាកំហុសដែលគេជួបញឹកញាប់ជាងគេពេលរៀបចំ។

Plugin បន្ថែមរបស់ពីរក្នុងឯកសារកូដនីមួយៗរបស់អ្នក៖ JSX pragma ដែលបញ្ជូន `className` ទៅឱ្យ Kbach និងបើមាន `kbach.config.js` វាបន្ថែមមួយបន្ទាត់ដែលយកការកំណត់នោះមកប្រើមុនពេល app render លើកដំបូង។ ក្នុងកូដ app អ្នកមិនចាំបាច់ import ឬហៅអ្វីទាំងអស់។

## បើកឡើងវិញ ហើយសម្អាត cache {#rn-restart}

ធ្វើបែបនេះរាល់ពេលដែលអ្នកកែ Babel config ឬ `kbach.config.js`៖

```sh tab="Expo"
npx expo start --clear
```

```sh tab="React Native CLI"
npx react-native start --reset-cache
```

## ប្រើ class {#rn-use}

```tsx title="App.tsx"
import { Text, View, Pressable } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-12">
      <Text className="text-2xl font-bold text-gray-12 dark:text-white">Hello from Kbach</Text>
      <Pressable className="mt-6 rounded-xl bg-blue-6 px-5 py-3 active:bg-blue-7">
        <Text className="font-semibold text-white">Press me</Text>
      </Pressable>
    </View>
  );
}
```

## Build តាមគោលដៅ {#rn-targets}

| គោលដៅ | អ្វីដែលត្រូវរៀបចំ | Engine ដែលប្រើ |
| :-- | :-- | :-- |
| Expo Go | Babel plugin | Engine ជំនាន់ JavaScript ដែលស្គាល់ utility តិចជាងបន្តិច |
| Expo Web / react-native-web | Babel plugin | WASM engine ដូច `@kbach/react` ដែលសរសេរ CSS ពិតៗ |
| Expo dev client / prebuild / EAS | Babel plugin រួចរត់ `npx expo prebuild && npx expo run:android` | Rust engine តាមរយៈ native module (Android) |
| React Native CLI | Babel plugin រួចបើក Metro ឡើងវិញជាមួយ `--reset-cache` ហើយ build app Android ឡើងវិញ | Rust engine តាមរយៈ native module (Android) |

បច្ចុប្បន្ន native module មានតែលើ Android ប៉ុណ្ណោះ។ លើ iOS មិនថា build បែបណា ក៏ប្រើ engine ជំនាន់ JavaScript ដូច Expo Go ដែរ។

ចំណុចដែល engine ជំនាន់ JavaScript ខ្វះ និង class ឬ variant ណាខ្លះប្រើបានលើទូរស័ព្ទ មានរៀបរាប់នៅទំព័រ [React Native](/react-native)។

:::tab HTML ធម្មតា {#html} icon=html5 note="tag script តែមួយ"

មិនបាច់ bundler មិនបាច់ npm install ហើយក៏មិនបាច់ React ដែរ៖ គ្រាន់តែ tag script មួយពី CDN។

## ដាក់ script {#html-script}

```html title="index.html" {5}
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>
  </head>
  <body class="bg-gray-1 p-8">
    <h1 class="text-3xl font-bold text-blue-6">Hello, Kbach</h1>
  </body>
</html>
```

ប៉ុណ្ណឹងគ្រប់គ្រាន់ហើយ។ Script ទាញយក engine (JavaScript ប្រហែល 8 KB និង WebAssembly ប្រហែល 195 KB ក្រោយ gzip) ដាក់ style ឱ្យ class ទាំងអស់លើទំព័រ ហើយបន្តតាមដានជានិច្ច៖ element ដែលបន្ថែមពេលក្រោយ ឬ class ដែលប្តូរដោយ JavaScript ក៏បាន style ដែរ។

ឯកសារដដែលនេះក៏មាននៅលើ unpkg ដែរ៖ `https://unpkg.com/@kbach/browser`។

> [!TIP] ពេលដាក់ឱ្យប្រើពិត សូមកំណត់ version ឱ្យច្បាស់
> URL ខ្លីតែងតែផ្តល់ release ថ្មីបំផុត។ បើចង់នៅតែមួយ version សូមដាក់លេខ version ក្នុង URL ឧទាហរណ៍ `https://cdn.jsdelivr.net/npm/@kbach/browser@1.0.0`។ ក្រោយមាន release ថ្មី CDN អាចនៅតែផ្តល់ឯកសារចាស់តាម URL ខ្លីមួយរយៈទៀត។

## កំណត់ការប្រើប្រាស់ {#html-config}

កំណត់ `window.kbachConfig` ក្នុង script មួយ **មុន** tag script របស់ Kbach។ ទម្រង់របស់វាដូចគ្នានឹង [kbach.config.js](/configuration)៖

```html
<script>
  window.kbachConfig = {
    darkMode: 'class',
    extend: {
      colors: {
        brand: '#ff6b35',
        card: { light: '#ffffff', dark: '#11131b' },
      },
    },
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>
```

> [!WARNING] ការកំណត់ក្រោយ script របស់ Kbach មិនត្រូវអានទេ
> Script អាន `window.kbachConfig` តែម្តង ពេលវាចាប់ផ្តើម។ បើដាក់វាក្រោយ script ពណ៌ផ្ទាល់ខ្លួនមិនមាន ហើយ `Kbach.toggle()` គ្មានប្រសិទ្ធភាព ដោយគ្មាន error ប្រាប់។ មើលនៅ [កំហុសដែលជួបញឹកញាប់](/common-mistakes)។

ពណ៌ដែលប្តូរតាម mode ដូចជា `card` ប្តូរតាម theme ដោយខ្លួនឯង ហើយក៏អាចធ្វើឱ្យថ្លាបានដែរ៖ `bg-card/80`។

## ដាក់ប៊ូតុងប្តូរ theme {#html-toggle}

```html
<button class="rounded-lg border px-3 py-1.5" onclick="Kbach.toggle()">Toggle theme</button>
```

`Kbach.toggle()` និង `Kbach.setMode()` ដំណើរការលុះត្រាតែកំណត់ `darkMode: 'class'` ឬ `'attribute'`។ មុខងារផ្សេងទៀតរបស់ `Kbach` មាននៅទំព័រ [CDN script API](/browser-api)។

## ដាក់ឯកសារលើ server ផ្ទាល់ {#html-self-host}

ចម្លង `kbach.js` និង `kbach_core_engine_bg.wasm` ពី folder `dist/` របស់ package ហើយទុកឯកសារទាំងពីរនៅជាមួយគ្នា។ បើទុក `.wasm` នៅកន្លែងផ្សេង សូមប្រាប់ទីតាំងរបស់វា៖

```html
<script src="/js/kbach.js" data-wasm="/wasm/kbach_core_engine_bg.wasm"></script>
```

ត្រូវបើកទំព័រតាម web server កុំបើកពី disk ផ្ទាល់ ព្រោះទំព័រ `file://` មិនអាចទាញឯកសារ `.wasm` ក្នុងម៉ាស៊ីនបានទេ។

:::

## តម្រូវការ {#requirements}

| ប្រភេទ | ត្រូវការ |
| :-- | :-- |
| React (Vite) | React 18 ឡើងទៅ និង Vite 4 ឡើងទៅ |
| Next.js | React 18 ឡើងទៅ និង PostCSS 8 ដែលមកជាមួយ Next.js ស្រាប់ |
| React Native និង Expo | React 18 ឡើងទៅ និង React Native 0.70 ឡើងទៅ |
| HTML ធម្មតា | Browser ជំនាន់ថ្មីណាក៏បាន ព្រោះ script រត់លើ WebAssembly |
| CLI | Node.js 18 ឡើងទៅ |

`@kbach/react` និង `@kbach/react-native` មានទាំង build ES module និង CommonJS ព្រមទាំង TypeScript types។ Engine មកជាមួយ package ស្រាប់ (`@kbach/react` ដំឡើង `@kbach/core-engine` ឱ្យ ហើយ package ផ្សេងទៀតមាន engine នៅក្នុងខ្លួន) ដូច្នេះមិនចាំបាច់ដំឡើងអ្វីបន្ថែមទៀតទេ។

## ពិនិត្យការរៀបចំ {#check-your-setup}

```sh
npx @kbach/cli doctor
```

`doctor` មិនកែប្រែអ្វីទេ។ វាគ្រាន់តែពិនិត្យថា package ត្រូវបានដំឡើង plugin ត្រូវបានភ្ជាប់ ហើយ `kbach.config.js` អានបាន។ បើមានបញ្ហា វាបញ្ចប់ដោយ code 1 ដូច្នេះអាចដាក់ឱ្យរត់ក្នុង CI បាន។ ប្រើបានជាមួយ project Vite, Next.js និង React Native។

## ជំហានបន្ទាប់ {#next-steps}

- [Utility classes](/utility-classes)៖ ឈ្មោះ class ត្រូវបានបង្កើតឡើងយ៉ាងដូចម្តេច។
- [Dark mode](/dark-mode)៖ ប្តូរតាមការកំណត់របស់ប្រព័ន្ធ ឬដាក់ប៊ូតុងប្តូរ។
- [ការរៀបចំ Editor](/editor-setup)៖ ការណែនាំ class និង hover ក្នុង VS Code។
