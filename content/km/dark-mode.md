---
title: Dark mode
description: ធ្វើឱ្យ app មានរូបរាងងងឹតដោយប្រើ class dark:។ វាប្តូរតាមការកំណត់របស់ឧបករណ៍ដោយខ្លួនឯង ឬអ្នកអាចដាក់ប៊ូតុងប្តូរក៏បាន។
---

## ប្រើបានភ្លាម {#it-works-out-of-the-box}

ដាក់ `dark:` នៅពីមុខ class ដើម្បីប្រើវាតែក្នុង dark mode៖ `bg-white dark:bg-gray-11` មានពណ៌សជាធម្មតា ហើយប្តូរទៅប្រផេះចាស់ក្នុង dark mode។ ជាលំនាំដើម dark mode ប្តូរតាមការកំណត់ភ្លឺ ឬងងឹតរបស់ឧបករណ៍ ដូច្នេះមិនចាំបាច់រៀបចំអ្វីទេ។

```preview
<div class="max-w-sm rounded-2xl border border-gray-3 bg-white p-6 dark:border-gray-9 dark:bg-gray-11">
  <p class="text-sm font-medium text-amber-7 dark:text-amber-4">Try the theme switch at the top of this page</p>
  <p class="mt-2 text-gray-11 dark:text-gray-3">This card uses dark: classes, and this site uses the 'class' strategy, so it follows the switch.</p>
</div>
```

## ដាក់ប៊ូតុងប្តូរ {#add-a-toggle}

បើចង់ឱ្យអ្នកប្រើជ្រើសរើសខ្លួនឯង សូមជ្រើស strategy មួយក្នុង `kbach.config.js`៖

```js title="kbach.config.js"
export default {
  darkMode: 'class', // or 'attribute'
};
```

| Strategy | Dark mode បើកពេល | ប្រើពេល |
| :-- | :-- | :-- |
| `'media'` (លំនាំដើម) | ប្រព័ន្ធកំណត់ជាងងឹត | មិនត្រូវការប៊ូតុងប្តូរ |
| `'class'` | `<html>` មាន class `dark` | ចង់មានប៊ូតុងប្តូរ |
| `'attribute'` | `<html>` មាន `data-theme="dark"` | ចង់មានប៊ូតុងប្តូរ តែចូលចិត្តប្រើ attribute |

Plugin អាន strategy ពី config ហើយ runtime អានវាវិញពី CSS ដែលបានបង្កើត ដូច្នេះផ្នែកផ្សេងទៀតមិនចាំបាច់ដឹងរឿងនេះទេ។

បន្ទាប់មកហៅ `useTheme()` ពីកន្លែងណាក៏បាន ដោយមិនបាច់មាន provider៖

```tsx title="ThemeToggle.tsx"
import { useTheme } from '@kbach/react';

export function ThemeToggle() {
  const { mode, isDark, setMode, toggle } = useTheme();
  return (
    <div className="flex gap-2">
      <button onClick={toggle}>{isDark ? 'Light' : 'Dark'}</button>
      <select value={mode} onChange={(e) => setMode(e.target.value as 'light' | 'dark' | 'system')}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
```

| Field | ប្រភេទ | អត្ថន័យ |
| :-- | :-- | :-- |
| `mode` | `'light' \| 'dark' \| 'system'` | ជម្រើសរបស់អ្នកប្រើ។ `'system'` ប្តូរតាម OS ភ្លាមៗ |
| `isDark` | `boolean` | ពេលនេះ dark mode កំពុងបើកឬអត់ |
| `setMode(mode)` | function | កំណត់ជម្រើស |
| `toggle()` | function | ប្តូរទៅវិញទៅមករវាងភ្លឺ និងងងឹត |

ជម្រើសនេះត្រូវរក្សាទុកក្នុង `localStorage` ក្រោមឈ្មោះ `kbach-theme` ហើយត្រឡប់មកវិញនៅពេលអ្នកប្រើចូលលើកក្រោយ។

## កុំឱ្យភ្លឹបពេលបើកទំព័រ {#avoid-a-flash-on-load}

Theme ចាប់ផ្តើមប្រើពេល JavaScript រត់ ដែលយឺតជាងពេលទំព័របង្ហាញលើកដំបូងបន្តិច។ ហេតុនេះ អ្នកដែលជ្រើស dark mode អាចឃើញទំព័រភ្លឺភ្លឹបមួយភ្លែតសិន។ សូមដាក់កូដនេះក្នុង `<head>` របស់ `index.html` ដើម្បីយកជម្រើសដែលបានរក្សាទុកមកប្រើមុនទំព័របង្ហាញ (ឧទាហរណ៍នេះសម្រាប់ strategy `'class'`)៖

```html title="index.html"
<script>
  (function () {
    try {
      var saved = localStorage.getItem('kbach-theme');
      var dark = saved === 'dark' || ((!saved || saved === 'system') && matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.add(dark ? 'dark' : 'light');
    } catch (e) {}
  })();
</script>
```

បើប្រើ `'attribute'` សូមសរសេរ `document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')` ជំនួសវិញ។

## Mode លំនាំដើម {#a-default-mode}

`<ThemeProvider>` មិនដាក់ក៏បាន។ តួនាទីតែមួយរបស់វា គឺកំណត់ mode ដំបូងសម្រាប់អ្នកដែលមិនទាន់ជ្រើសរើស៖

```tsx
import { ThemeProvider } from '@kbach/react';

<ThemeProvider defaultMode="dark">
  <App />
</ThemeProvider>;
```

បើអ្នកប្រើធ្លាប់ជ្រើសរើសហើយ ជម្រើសនោះតែងតែយកជាធំជាង `defaultMode`។

## ក្រៅ React {#outside-react}

```ts
import { getGlobalDarkMode, getGlobalThemeMode, setGlobalThemeMode, toggleGlobalDarkMode, subscribeGlobalDarkMode } from '@kbach/react';

setGlobalThemeMode('dark');
const off = subscribeGlobalDarkMode(() => console.log(getGlobalDarkMode()));
```

## ពណ៌ដែលប្តូរខ្លួនឯង {#colors-that-switch-by-themselves}

ការសរសេរ `bg-white dark:bg-gray-12` លើគ្រប់ element គួរឱ្យធុញ។ **ពណ៌ mode-aware** ផ្ទុកតម្លៃទាំងពីរក្នុងខ្លួន ដូច្នេះ class តែមួយគ្រប់គ្រាន់៖

```js title="kbach.config.js"
export default {
  darkMode: 'class',
  extend: {
    colors: {
      page: { light: '#ffffff', dark: '#0b0f14' },
      ink: { light: '#111827', dark: '#e5e7eb' },
    },
  },
};
```

ឥឡូវ `bg-page text-ink` ត្រូវពណ៌ទាំងក្នុង mode ភ្លឺ និងងងឹត។ គេហទំព័រនេះក៏រចនាតាមរបៀបនេះដែរ។ មើលនៅ [ពណ៌ Theme](/theme-colors)។

## React Native {#react-native}

លើ native `dark:` ប្តូរតាម color scheme របស់ឧបករណ៍ដោយមិនបាច់រៀបចំ ហើយ `useTheme()` ក៏ប្រើដូចគ្នា។ បើចង់ឱ្យ app ចាំជម្រើសរបស់អ្នកប្រើ ទោះបិទបើក app ម្តងទៀតក៏ដោយ សូមឱ្យ async storage ណាមួយទៅ `ThemeProvider`៖

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@kbach/react-native';

<ThemeProvider persist={AsyncStorage}>
  <App />
</ThemeProvider>;
```

## ក្នុងទំព័រ HTML ធម្មតា {#in-a-plain-html-page}

នៅទីនេះ `dark:` ក៏ប្តូរតាមការកំណត់របស់ឧបករណ៍ដែរ។ បើចង់មានប៊ូតុងប្តូរ សូមកំណត់ strategy ក្នុង `window.kbachConfig` រួចហៅ `Kbach.toggle()` ឬ `Kbach.setMode('dark')`៖

```html
<script>
  window.kbachConfig = { darkMode: 'class' };
</script>
<script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>

<button onclick="Kbach.toggle()">Toggle theme</button>
```

ជម្រើសត្រូវរក្សាទុក និងយកមកវិញតាមរបៀបដដែល ក្រោមឈ្មោះ `kbach-theme`។ មើលនៅ [CDN script API](/browser-api)។
