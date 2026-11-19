---
title: Dark mode
description: Give your app a dark look with dark: classes. It follows the device's setting by itself, or you can add a switch.
---

## It works out of the box {#it-works-out-of-the-box}

Put `dark:` in front of a class to use it only in dark mode: `bg-white dark:bg-gray-11` is white normally and dark gray in dark mode. By default, dark mode follows the device's own light or dark setting, so there's nothing to set up.

```preview
<div class="max-w-sm rounded-2xl border border-gray-3 bg-white p-6 dark:border-gray-9 dark:bg-gray-11">
  <p class="text-sm font-medium text-amber-7 dark:text-amber-4">Try the theme switch at the top of this page</p>
  <p class="mt-2 text-gray-11 dark:text-gray-3">This card uses dark: classes, and this site uses the 'class' strategy, so it follows the switch.</p>
</div>
```

## Add a toggle {#add-a-toggle}

To let people choose, pick a strategy in `kbach.config.js`:

```js title="kbach.config.js"
export default {
  darkMode: 'class', // or 'attribute'
};
```

| Strategy | Dark mode is on when | Use it when |
| :-- | :-- | :-- |
| `'media'` (default) | The system is set to dark | You don't need a toggle |
| `'class'` | `<html>` has the `dark` class | You want a toggle |
| `'attribute'` | `<html>` has `data-theme="dark"` | You want a toggle, and prefer an attribute |

The plugin reads the strategy from the config, and the runtime reads it back from the generated CSS, so nothing else needs to know about it.

Then use `useTheme()` anywhere. No provider is needed:

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

| Field | Type | What it is |
| :-- | :-- | :-- |
| `mode` | `'light' \| 'dark' \| 'system'` | The person's choice. `'system'` follows the OS, live |
| `isDark` | `boolean` | Whether dark mode is on right now |
| `setMode(mode)` | function | Sets the choice |
| `toggle()` | function | Switches between light and dark |

The choice is saved in `localStorage` under `kbach-theme` and restored on the next visit.

## Avoid a flash on load {#avoid-a-flash-on-load}

The theme is applied when your JavaScript runs, which is a moment after the page first paints. If someone chose dark mode, they can see a flash of the light page first. Add this to the `<head>` of `index.html` to apply the saved choice before the first paint (shown for the `'class'` strategy):

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

For `'attribute'`, set `document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')` instead.

## A default mode {#a-default-mode}

`<ThemeProvider>` is optional. Its one job is to set the starting mode for people who haven't chosen yet:

```tsx
import { ThemeProvider } from '@kbach/react';

<ThemeProvider defaultMode="dark">
  <App />
</ThemeProvider>;
```

A saved choice always wins over `defaultMode`.

## Outside React {#outside-react}

```ts
import { getGlobalDarkMode, getGlobalThemeMode, setGlobalThemeMode, toggleGlobalDarkMode, subscribeGlobalDarkMode } from '@kbach/react';

setGlobalThemeMode('dark');
const off = subscribeGlobalDarkMode(() => console.log(getGlobalDarkMode()));
```

## Colors that switch by themselves {#colors-that-switch-by-themselves}

Writing `bg-white dark:bg-gray-12` on every element gets repetitive. A **mode-aware color** holds both values, so one class does it:

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

Now `bg-page text-ink` is right in both modes. This site is built that way. See [Theme colors](/theme-colors).

## React Native {#react-native}

On native, `dark:` follows the current color scheme with no setup, and `useTheme()` works the same way. To keep the choice across launches, pass any async storage to `ThemeProvider`:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@kbach/react-native';

<ThemeProvider persist={AsyncStorage}>
  <App />
</ThemeProvider>;
```

## In a plain HTML page {#in-a-plain-html-page}

`dark:` follows the device's setting here too. For a switch, set the strategy in `window.kbachConfig` and call `Kbach.toggle()` or `Kbach.setMode('dark')`:

```html
<script>
  window.kbachConfig = { darkMode: 'class' };
</script>
<script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>

<button onclick="Kbach.toggle()">Toggle theme</button>
```

The choice is saved and restored the same way, under `kbach-theme`. See [CDN script API](/browser-api).
