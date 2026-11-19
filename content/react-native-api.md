---
title: React Native API
description: Everything @kbach/react-native exports: the theme provider, resolveStyle, dynamic tokens, and components for Expo Web.
---

## Shared with the web

Setup is on [Installation](/installation?tab=react-native). These exports work the same as in [@kbach/react](/react-api):

`useTheme`, `useColors`, `clsx`, `applyKbachConfig`, `resolveKbachConfig`, `setTheme`, `getTheme`, `defaultTheme`, `getGlobalDarkMode`, `getGlobalThemeMode`, `setGlobalThemeMode`, `toggleGlobalDarkMode` and `subscribeGlobalDarkMode`.

## Variants and values on native {#variants-on-native}

How variants, bracket values and fonts work on a phone, and which classes do nothing there, is on the [React Native](/react-native) page: see [Variants](/react-native#variants), [Values in brackets](/react-native#values-in-brackets) and [What doesn't work](/react-native#what-doesnt-work).

## ThemeProvider

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@kbach/react-native';

<ThemeProvider defaultMode="system" persist={AsyncStorage}>
  <App />
</ThemeProvider>;
```

| Prop | Type | |
| :-- | :-- | :-- |
| `defaultMode` | `'light' \| 'dark' \| 'system'` | The starting mode with no saved choice |
| `persist` | `{ getItem, setItem }` | Any async storage. The saved mode is read once on mount and wins over `defaultMode`; later changes are written back |

The package doesn't depend on a storage library: you pass one in. Mount at most one provider.

## resolveStyle

```ts
import { resolveStyle } from '@kbach/react-native';

function resolveStyle(classString: string, pressed?: boolean): StyleObject;
```

Turns a class string into a style object yourself, for a component that takes a `style` prop but no `className`. It uses the current color scheme and window width.

## Dynamic tokens

The native counterpart of CSS custom properties. Set a value, and refer to it with `var()` in a class:

```tsx
import { setDynamicToken, useDynamicToken } from '@kbach/react-native';

setDynamicToken('sidebar-width', '240px');

<View className="w-[var(--sidebar-width)]" />;

const width = useDynamicToken('sidebar-width'); // '240px', and re-renders when it changes
```

On the web this writes a real CSS custom property. On native the value is put into the class string before it's resolved, and elements using it re-render when it changes.

Also exported: `getDynamicToken`, `deleteDynamicToken` and `subscribeDynamicTokens`.

> [!WARNING] Set tokens during render, not at the top of a module
> Call `setDynamicToken` from your root component's render, guarded so it runs once. Called at module level, it can fire in the middle of rendering an unrelated component.

```tsx
function Root({ children }) {
  if (getDynamicToken('accent') === undefined) setDynamicToken('accent', '#8b5cf6');
  return <ThemeProvider>{children}</ThemeProvider>;
}
```

## Semantic components for Expo Web

On Expo Web, a plain `View` or `Text` renders as a `div` or `span`. These components set the role that makes react-native-web render the right HTML element. `className` works on all of them:

```tsx
import { Button, Paragraph, H1, H2, H3, H4, H5, H6 } from '@kbach/react-native';

<H1 className="text-2xl font-bold">Page title</H1>
<Paragraph className="text-sm text-gray-7">Body text.</Paragraph>
<Button className="rounded bg-blue-6 px-4 py-2" onPress={save}>Save</Button>
```

## Subpath exports

`@kbach/react-native/babel-plugin`, `@kbach/react-native/jsx-runtime` and `@kbach/react-native/jsx-dev-runtime`.

## Types

`KbachConfig`, `ThemeConfig`, `ColorEntry`, `ContainerConfig`, `StyleObject`, `ThemeState`, `ThemeProviderProps`, `ThemeStorageAdapter`, `ThemeMode`, `ColorsAPI`, `ColorScale`, `ClassValue`, `ClassDictionary`, `ClassArray`, `ButtonProps`, `ParagraphProps` and `HeadingProps`.
