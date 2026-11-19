---
title: React API
description: អ្វីៗទាំងអស់ដែល @kbach/react export ចែកជាក្រុមតាមការប្រើប្រាស់។
---

## មើលរួម {#at-a-glance}

| Export | ប្រភេទ | សម្រាប់ |
| :-- | :-- | :-- |
| `useTheme` | hook | អាន និងកំណត់ mode ភ្លឺ ងងឹត ឬតាមប្រព័ន្ធ |
| `ThemeProvider` | component | កំណត់ mode លំនាំដើម (មិនដាក់ក៏បាន) |
| `useColors` | hook | យកពណ៌ជាតម្លៃ JavaScript |
| `clsx` | function | ភ្ជាប់ឈ្មោះ class ចូលគ្នា |
| `kb` | function | បំប្លែង class ពេល app កំពុងរត់ |
| `initKbach`, `isKbachReady` | functions | ទាញយក engine សម្រាប់ពេល app រត់ |
| `applyKbachConfig`, `resolveKbachConfig` | functions | ប្រើ config ពេល app កំពុងរត់ |
| `setTheme`, `getTheme`, `defaultTheme` | functions, value | Object theme ដែលកំពុងប្រើ |
| `disableRuntimeCSS`, `isRuntimeCSSDisabled` | functions | បិទការបន្ថែម CSS ពេល app រត់ |
| `KbachReset` | component | Reset មូលដ្ឋាន សម្រាប់ការ render លើ server |
| `getGlobalDarkMode`, `getGlobalThemeMode`, `setGlobalThemeMode`, `toggleGlobalDarkMode`, `subscribeGlobalDarkMode` | functions | Dark mode ក្រៅ React |

Subpath export៖ `@kbach/react/vite`, `@kbach/react/postcss`, `@kbach/react/jsx-runtime` និង `@kbach/react/jsx-dev-runtime`។

## useTheme {#usetheme}

```ts
function useTheme(): {
  mode: 'light' | 'dark' | 'system';
  isDark: boolean;
  setMode(mode: 'light' | 'dark' | 'system'): void;
  toggle(): void;
};
```

ប្រើក្នុង component ណាក៏បាន មាន ឬគ្មាន provider ក៏ដោយ។ ជម្រើសត្រូវរក្សាទុកក្នុង `localStorage` (`kbach-theme`)។ មើលនៅ [Dark mode](/dark-mode)។

## ThemeProvider {#themeprovider}

```tsx
<ThemeProvider defaultMode="dark">{children}</ThemeProvider>
```

| Prop | ប្រភេទ | |
| :-- | :-- | :-- |
| `defaultMode` | `'light' \| 'dark' \| 'system'` | Mode សម្រាប់អ្នកដែលមិនទាន់ធ្លាប់ជ្រើសរើស។ មិនដាក់ក៏បាន |
| `children` | `ReactNode` | |

ដាក់បានតែមួយប៉ុណ្ណោះ ព្រោះ dark mode ជា store តែមួយសម្រាប់ទំព័រទាំងមូល។

## useColors {#usecolors}

```ts
const colors = useColors();
colors.blue[6];              // a palette shade
colors.blue['6/50'];         // with opacity
colors.white;                // a single color
colors.surface;              // a mode-aware color: 'rgb(var(--kb-color-surface))'
colors.alpha(color, 30);     // any color at 30% opacity
colors.get('brand');         // a theme color, typed as string
```

## clsx {#clsx}

```ts
function clsx(...inputs: ClassValue[]): string;
```

ភ្ជាប់ string, array និង object `{ className: condition }` ចូលគ្នា ហើយបោះចោលតម្លៃ falsy។ Build plugin អាន string ដែលនៅក្នុងការហៅ `clsx()`។

## kb {#kb}

```ts
function kb(classString: string): string;
```

បំប្លែង class ដោយ engine បន្ថែម CSS ចូល tag `<style data-kbach>` ហើយឱ្យឈ្មោះ class ដែលត្រូវប្រើមកវិញ។ ភាគច្រើនវាដូច string ដែលអ្នកបញ្ជូនទៅ លើកលែងតែពណ៌ភ្លឺ/ងងឹតដែលតម្លៃមិនមែនជា hex។ Class ដែលមានក្នុង `kbach.css` រួចហើយ `kb()` រំលងចោល។ ត្រូវហៅ `initKbach()` ជាមុនសិន។ មើលនៅ [Dynamic classes](/dynamic-classes)។

## initKbach {#initkbach}

```ts
function initKbach(): Promise<void>;
function isKbachReady(): boolean;
```

ទាញយក engine ជា WebAssembly។ ត្រូវការតែសម្រាប់ `kb()` និងរបៀប `jsx-runtime` ប៉ុណ្ណោះ។ ការ build CSS ទុកជាមុន មិនដែលហៅវាទេ។ ហៅច្រើនដង ក៏បាន promise ដដែល។

## applyKbachConfig {#applykbachconfig}

```ts
function applyKbachConfig(config: KbachConfig): ThemeConfig;
function resolveKbachConfig(config: KbachConfig): ThemeConfig;
```

`resolveKbachConfig` បញ្ចូល config ទៅក្នុងតម្លៃលំនាំដើម ហើយឱ្យ theme មកវិញ ដោយមិនប៉ះពាល់អ្វីផ្សេងទៀតទេ។ `applyKbachConfig` ធ្វើដូចគ្នា ហើយយក theme នោះទៅប្រើសម្រាប់ `kb()` និង `useColors()` ព្រមទាំងកែស្ថានភាព dark mode លើ `<html>`។

ការ build ធម្មតាមិនត្រូវការ function ទាំងពីរនេះទេ ព្រោះ plugin អាន `kbach.config.js` ដោយខ្លួនឯង។ ប្រើ `applyKbachConfig` នៅពេលចង់ប្តូរ theme ក្រោយ app ចាប់ផ្តើម ឬដើម្បីឱ្យ `kb()` ប្រើ theme ដូចពេល build៖

```ts
import { applyKbachConfig } from '@kbach/react';
import config from '../kbach.config.js';

applyKbachConfig(config);
```

## setTheme និង getTheme {#settheme-and-gettheme}

```ts
function setTheme(theme: ThemeConfig): void;
function getTheme(): ThemeConfig;
const defaultTheme: ThemeConfig;
```

ជាកម្រិតទាបជាង `applyKbachConfig`៖ ពួកវាកំណត់ ឬអាន object theme ដែលបំប្លែងរួចដោយផ្ទាល់។

## disableRuntimeCSS {#disableruntimecss}

```ts
function disableRuntimeCSS(): void;
function isRuntimeCSSDisabled(): boolean;
```

ឈប់ឱ្យ `kb()` បន្ថែម CSS។ ប្រើជាមួយរបៀប `jsx-runtime` ពេល `kbach.css` ដែល build ទុកជាមុនមាន CSS គ្រប់គ្រាន់រួចហើយ ដើម្បីកុំឱ្យមាន CSS ស្ទួន។

## KbachReset {#kbachreset}

```tsx
<head>
  <KbachReset />
</head>
```

បង្ហាញ reset មូលដ្ឋានជា tag `<style>`។ ត្រូវការតែពេលមិនប្រើ build plugin ហើយ render លើ server ប៉ុណ្ណោះ៖ បើគ្មានវាទេ ទំព័រនឹងបង្ហាញរូបរាងលំនាំដើមរបស់ browser សិន រហូតដល់ `kb()` រត់។ បើប្រើ `kbach.css` ដែល build ទុកជាមុន មិនចាំបាច់ប្រើវាទេ។

## Dark mode ក្រៅ React {#dark-mode-outside-react}

```ts
getGlobalDarkMode(): boolean;
getGlobalThemeMode(): 'light' | 'dark' | 'system';
setGlobalThemeMode(mode): void;
toggleGlobalDarkMode(): void;
subscribeGlobalDarkMode(listener: () => void): () => void; // returns unsubscribe
```

## Types {#types}

`KbachConfig`, `ThemeConfig`, `ColorEntry`, `ContainerConfig`, `DarkModeStrategy`, `ThemeState`, `ThemeProviderProps`, `ThemeMode`, `ColorsAPI`, `ColorScale`, `ClassValue`, `ClassDictionary` និង `ClassArray`។
