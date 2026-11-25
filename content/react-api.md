---
title: React API
description: Everything @kbach/react exports, grouped by what you use it for.
---

## At a glance

| Export | Kind | For |
| :-- | :-- | :-- |
| `useTheme` | hook | Reading and setting light, dark or system mode |
| `ThemeProvider` | component | An optional default mode |
| `useColors` | hook | Colors as JavaScript values |
| `clsx` | function | Joining class names |
| `kb` | function | Resolving a class string at runtime |
| `initKbach`, `isKbachReady` | functions | Loading the runtime engine |
| `applyKbachConfig`, `resolveKbachConfig` | functions | Applying a config at runtime |
| `setTheme`, `getTheme`, `defaultTheme` | functions, value | The active theme object |
| `disableRuntimeCSS`, `isRuntimeCSSDisabled` | functions | Turning off runtime CSS injection |
| `KbachReset` | component | The base reset, for server rendering |
| `getGlobalDarkMode`, `getGlobalThemeMode`, `setGlobalThemeMode`, `toggleGlobalDarkMode`, `subscribeGlobalDarkMode` | functions | Dark mode outside React |

Subpath exports: `@kbach/react/vite`, `@kbach/react/postcss`, `@kbach/react/jsx-runtime`, `@kbach/react/jsx-dev-runtime` and, for tools, [`@kbach/react/tools`](#tools).

## useTheme

```ts
function useTheme(): {
  mode: 'light' | 'dark' | 'system';
  isDark: boolean;
  setMode(mode: 'light' | 'dark' | 'system'): void;
  toggle(): void;
};
```

Works in any component, with or without a provider. The choice is saved in `localStorage` (`kbach-theme`). See [Dark mode](/dark-mode).

## ThemeProvider

```tsx
<ThemeProvider defaultMode="dark">{children}</ThemeProvider>
```

| Prop | Type | |
| :-- | :-- | :-- |
| `defaultMode` | `'light' \| 'dark' \| 'system'` | The mode for someone with no saved choice. Optional |
| `children` | `ReactNode` | |

Mount at most one. Dark mode is one store for the whole page.

## useColors

```ts
const colors = useColors();
colors.blue[6];              // a palette shade
colors.blue['6/50'];         // with opacity
colors.white;                // a single color
colors.surface;              // a mode-aware color: 'rgb(var(--kb-color-surface))'
colors.alpha(color, 30);     // any color at 30% opacity
colors.get('brand');         // a theme color, typed as string
```

## clsx

```ts
function clsx(...inputs: ClassValue[]): string;
```

Joins strings, arrays and `{ className: condition }` objects, dropping anything falsy. The build plugin reads the strings inside `clsx()` calls.

## kb

```ts
function kb(classString: string): string;
```

Resolves a class string with the engine, injects its CSS into a `<style data-kbach>` tag, and returns the class string to use. That is the input, except for a light/dark color whose values aren't hex. Classes the static `kbach.css` already defines are skipped. Call `initKbach()` first. See [Dynamic classes](/dynamic-classes).

## initKbach

```ts
function initKbach(): Promise<void>;
function isKbachReady(): boolean;
```

Loads the WebAssembly engine. Only needed for `kb()` and the `jsx-runtime` path; the static build never calls it. Calling it again returns the same promise.

## applyKbachConfig

```ts
function applyKbachConfig(config: KbachConfig): ThemeConfig;
function resolveKbachConfig(config: KbachConfig): ThemeConfig;
```

`resolveKbachConfig` merges a config into the defaults and returns the theme. It has no side effects. `applyKbachConfig` does the same, makes the result the active theme for `kb()` and `useColors()`, and updates the dark-mode state on `<html>`.

You don't need either for a normal build: the plugin reads `kbach.config.js` itself. Use `applyKbachConfig` to change the theme after startup, or to give `kb()` the same theme as the build:

```ts
import { applyKbachConfig } from '@kbach/react';
import config from '../kbach.config.js';

applyKbachConfig(config);
```

## setTheme and getTheme

```ts
function setTheme(theme: ThemeConfig): void;
function getTheme(): ThemeConfig;
const defaultTheme: ThemeConfig;
```

Lower-level than `applyKbachConfig`: they set or read the resolved theme object directly.

## disableRuntimeCSS

```ts
function disableRuntimeCSS(): void;
function isRuntimeCSSDisabled(): boolean;
```

Stops `kb()` from injecting rules. Use it with the `jsx-runtime` path when a static `kbach.css` already holds every rule, so nothing is added twice.

## KbachReset

```tsx
<head>
  <KbachReset />
</head>
```

Renders the base reset as a `<style>` tag. Only for setups without the build plugin that render on the server: without it, the first paint shows browser defaults until `kb()` runs. With the static `kbach.css` you don't need it.

## Dark mode outside React

```ts
getGlobalDarkMode(): boolean;
getGlobalThemeMode(): 'light' | 'dark' | 'system';
setGlobalThemeMode(mode): void;
toggleGlobalDarkMode(): void;
subscribeGlobalDarkMode(listener: () => void): () => void; // returns unsubscribe
```

## For tools: @kbach/react/tools {#tools}

For editors, playgrounds and other tools built on Kbach (since 1.1.0). It is the code the build plugin and the VS Code extension run, so a tool shows the same CSS and suggests the same classes. An app doesn't need it.

```ts
import { formatKbachCSS, withColorVariables, BASE_UTILITIES, COLOR_PREFIXES } from '@kbach/react/tools';

formatKbachCSS(rules, theme): string;      // rules: Map<class, RuleEntry[]> from the engine
withColorVariables(theme): ThemeConfig;    // colors as CSS variables, as the build gives the engine
KBACH_START, KBACH_END                     // the markers around the generated block in a stylesheet
MODIFIERS, BASE_UTILITIES: string[]        // class names for completion
COLOR_PREFIXES: string[]                   // the utilities whose value is a color
```

This site's playground uses it for its kbach.css tab and its completions.

## Types

`KbachConfig`, `KeyframesSteps`, `ThemeConfig`, `ColorEntry`, `ContainerConfig`, `DarkModeStrategy`, `ThemeState`, `ThemeProviderProps`, `ThemeMode`, `ColorsAPI`, `ColorScale`, `ClassValue`, `ClassDictionary` and `ClassArray`.
