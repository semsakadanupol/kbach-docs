---
title: React Native API
description: អ្វីៗទាំងអស់ដែល @kbach/react-native export៖ theme provider, resolveStyle, dynamic tokens និង component សម្រាប់ Expo Web។
---

## ប្រើដូចលើ web {#shared-with-the-web}

របៀបរៀបចំមាននៅ [ការដំឡើង](/installation?tab=react-native)។ Export ខាងក្រោមប្រើដូចក្នុង [@kbach/react](/react-api) ដែរ៖

`useTheme`, `useColors`, `clsx`, `applyKbachConfig`, `resolveKbachConfig`, `setTheme`, `getTheme`, `defaultTheme`, `getGlobalDarkMode`, `getGlobalThemeMode`, `setGlobalThemeMode`, `toggleGlobalDarkMode` និង `subscribeGlobalDarkMode`។

## Variant និងតម្លៃលើ native {#variants-on-native}

Variant តម្លៃក្នុងតង្កៀបការ៉េ និង font ដំណើរការយ៉ាងណាលើទូរស័ព្ទ ហើយ class ណាខ្លះគ្មានប្រសិទ្ធភាព មានរៀបរាប់នៅទំព័រ [React Native](/react-native)៖ មើល [Variants](/react-native#variants), [តម្លៃក្នុងតង្កៀបការ៉េ](/react-native#values-in-brackets) និង [អ្វីដែលប្រើមិនបាន](/react-native#what-doesnt-work)។

## ThemeProvider {#themeprovider}

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@kbach/react-native';

<ThemeProvider defaultMode="system" persist={AsyncStorage}>
  <App />
</ThemeProvider>;
```

| Prop | ប្រភេទ | |
| :-- | :-- | :-- |
| `defaultMode` | `'light' \| 'dark' \| 'system'` | Mode ដំបូង ពេលអ្នកប្រើមិនទាន់ធ្លាប់ជ្រើសរើស |
| `persist` | `{ getItem, setItem }` | Async storage ណាក៏បាន។ Mode ដែលរក្សាទុក ត្រូវអានម្តងពេល mount ហើយយកជាធំជាង `defaultMode`។ ការប្តូរពេលក្រោយត្រូវសរសេរចូលវិញ |

Package នេះមិនពឹងលើ library storage ណាមួយទេ អ្នកជាអ្នកឱ្យវាចូល។ ដាក់ provider បានតែមួយប៉ុណ្ណោះ។

## resolveStyle {#resolvestyle}

```ts
import { resolveStyle } from '@kbach/react-native';

function resolveStyle(classString: string, pressed?: boolean): StyleObject;
```

បំប្លែង class ទៅជា style object ដោយខ្លួនឯង សម្រាប់ component ដែលទទួល prop `style` តែគ្មាន `className`។ វាប្រើ color scheme និងទទឹង window បច្ចុប្បន្ន។

## Dynamic tokens {#dynamic-tokens}

ជាសមមូលរបស់ CSS custom property លើ native។ កំណត់តម្លៃ រួចយោងទៅវាដោយ `var()` ក្នុង class៖

```tsx
import { setDynamicToken, useDynamicToken } from '@kbach/react-native';

setDynamicToken('sidebar-width', '240px');

<View className="w-[var(--sidebar-width)]" />;

const width = useDynamicToken('sidebar-width'); // '240px', and re-renders when it changes
```

លើ web, function នេះសរសេរ CSS custom property ពិតៗ។ លើ native តម្លៃត្រូវដាក់ចូលក្នុង class មុនបំប្លែង ហើយ element ណាដែលប្រើវា នឹង re-render ពេលតម្លៃប្តូរ។

Export ផ្សេងទៀត៖ `getDynamicToken`, `deleteDynamicToken` និង `subscribeDynamicTokens`។

> [!WARNING] កំណត់ token ក្នុងពេល render កុំកំណត់នៅខាងលើ module
> ហៅ `setDynamicToken` ពី render របស់ root component ដោយមានលក្ខខណ្ឌការពារឱ្យវារត់តែម្តង។ បើហៅនៅកម្រិត module វាអាចរត់ចំកណ្តាលពេល component ផ្សេងកំពុង render។

```tsx
function Root({ children }) {
  if (getDynamicToken('accent') === undefined) setDynamicToken('accent', '#8b5cf6');
  return <ThemeProvider>{children}</ThemeProvider>;
}
```

## Component សម្រាប់ Expo Web {#semantic-components-for-expo-web}

លើ Expo Web, `View` ឬ `Text` ធម្មតាក្លាយជា `div` ឬ `span`។ Component ខាងក្រោមកំណត់ role ដើម្បីឱ្យ react-native-web បង្កើត element HTML ត្រឹមត្រូវ។ `className` ប្រើបានលើទាំងអស់៖

```tsx
import { Button, Paragraph, H1, H2, H3, H4, H5, H6 } from '@kbach/react-native';

<H1 className="text-2xl font-bold">Page title</H1>
<Paragraph className="text-sm text-gray-7">Body text.</Paragraph>
<Button className="rounded bg-blue-6 px-4 py-2" onPress={save}>Save</Button>
```

## Subpath export {#subpath-exports}

`@kbach/react-native/babel-plugin`, `@kbach/react-native/jsx-runtime` និង `@kbach/react-native/jsx-dev-runtime`។

## Types {#types}

`KbachConfig`, `ThemeConfig`, `ColorEntry`, `ContainerConfig`, `StyleObject`, `ThemeState`, `ThemeProviderProps`, `ThemeStorageAdapter`, `ThemeMode`, `ColorsAPI`, `ColorScale`, `ClassValue`, `ClassDictionary`, `ClassArray`, `ButtonProps`, `ParagraphProps` និង `HeadingProps`។
