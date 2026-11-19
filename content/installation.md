---
title: Installation
description: Set Kbach up for React on the web, Next.js, React Native or a plain HTML page. Pick your setup, and the steps below follow.
---

:::tabs
:::tab React (Vite) {#vite} icon=vite note="Vite plugin"

## Install the package {#vite-install}

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

> [!TIP] Or let the CLI do steps 1 to 3
> `npx @kbach/cli init` installs the package, adds the plugin and imports the CSS. It keeps your formatting and comments, and running it again on a project that's set up changes nothing.

## Add the plugin {#vite-plugin}

Put `kbach()` in the plugin list, next to the React plugin:

```ts title="vite.config.ts" {3,6}
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { kbach } from '@kbach/react/vite';

export default defineConfig({
  plugins: [kbach(), react()],
});
```

## Import the CSS once {#vite-css}

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

The plugin creates `src/kbach.css` the first time it runs. Don't edit it by hand: it's rewritten whenever your class names change.

## Use classes {#vite-use}

```tsx title="src/App.tsx"
export default function App() {
  return <h1 className="text-3xl font-bold text-blue-6 underline">Hello world</h1>;
}
```

Start the dev server with `npm run dev`. Change a class and save: the CSS updates straight away.

> [!IMPORTANT] Write every class out in full
> The plugin finds classes by reading your files, so it only sees a class that's written out whole. A class glued together while the app runs, like `'bg-' + color + '-6'`, gets no CSS. [Dynamic classes](/dynamic-classes) shows what to do instead, and [Web](/web) explains what the plugin does.

:::tab Next.js {#nextjs} icon=nextjs note="PostCSS plugin"

Next.js, and any other bundler that runs PostCSS, uses the PostCSS plugin.

## Install the package {#next-install}

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

> [!TIP] Or let the CLI do steps 1 to 3
> `npx @kbach/cli init` installs the package, adds the PostCSS plugin and puts the markers in `globals.css`.

## Add the PostCSS plugin {#next-plugin}

```js title="postcss.config.js"
module.exports = {
  plugins: { '@kbach/react/postcss': {} },
};
```

## Mark where the CSS goes {#next-markers}

Add these two comments to your global stylesheet. The plugin writes the generated CSS between them and leaves the rest of the file alone.

```css title="app/globals.css"
/* kbach:start */
/* kbach:end */
```

Then import `globals.css` once, as Next.js projects normally do, in `app/layout.tsx` or `pages/_app.tsx`.

## Use classes {#next-use}

```tsx title="app/page.tsx"
export default function Page() {
  return <h1 className="text-3xl font-bold text-blue-6 underline">Hello world</h1>;
}
```

> [!NOTE]
> The PostCSS plugin looks for `kbach.config.js` in the folder Node was started from. If `postcss.config.js` isn't at the root of your project, pass the root yourself: `{ '@kbach/react/postcss': { root: __dirname } }`.

:::tab React Native {#react-native} icon=react note="Babel plugin"

The same class names, turned into React Native styles when each element renders. Works on Android, iOS, Expo Go and Expo Web. Some classes only make sense in a browser and do nothing on a phone: [React Native](/react-native) says which.

## Install the package {#rn-install}

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

> [!TIP] Or let the CLI do it
> `npx @kbach/cli init` installs the package and adds the Babel plugin. On a React Native CLI project, it also offers to run the native rebuild.

## Add the Babel plugin {#rn-babel}

Add one entry to `plugins` and keep the rest of your config as it is:

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

> [!WARNING] The Babel plugin is required everywhere
> Without it, `className` does nothing at all, with no error and no warning. That includes Expo Go. It's the most common setup mistake.

The plugin adds two things to each of your source files: a JSX pragma that sends `className` through Kbach, and, if `kbach.config.js` exists, a line that applies it before the first render. Your app code doesn't import or call anything.

## Restart with the cache cleared {#rn-restart}

Do this after changing the Babel config or `kbach.config.js`:

```sh tab="Expo"
npx expo start --clear
```

```sh tab="React Native CLI"
npx react-native start --reset-cache
```

## Use classes {#rn-use}

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

## Build for your target {#rn-targets}

| Target | Setup | Engine |
| :-- | :-- | :-- |
| Expo Go | Babel plugin | A JavaScript port of the engine, with a smaller set of utilities |
| Expo Web / react-native-web | Babel plugin | The same WASM engine as `@kbach/react`, writing real CSS |
| Expo dev client / prebuild / EAS | Babel plugin, then `npx expo prebuild && npx expo run:android` | The Rust engine, through a native module (Android) |
| React Native CLI | Babel plugin, restart Metro with `--reset-cache`, rebuild the Android app | The Rust engine, through a native module (Android) |

The native module is Android only for now. On iOS, every kind of build uses the JavaScript port, the same as Expo Go.

What the JavaScript version leaves out, and which classes and variants work on a phone at all, is on [React Native](/react-native).

:::tab Plain HTML {#html} icon=html5 note="One script tag"

No bundler, no npm install and no React: one script tag from a CDN.

## Add the script {#html-script}

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

That's all. The script loads the engine (about 8 KB of JavaScript and 195 KB of WebAssembly, gzipped), styles every class on the page, and keeps watching: elements you add later, and classes you change from JavaScript, are styled too.

The same file is on unpkg: `https://unpkg.com/@kbach/browser`.

> [!TIP] Pin a version in production
> The short URL always serves the newest release. To stay on one version, put it in the URL, for example `https://cdn.jsdelivr.net/npm/@kbach/browser@1.0.0-beta.7`. After a release, the CDN can keep serving the old file under the short URL for a while.

## Configure it {#html-config}

Set `window.kbachConfig` in a script **before** the Kbach script tag. It has the same shape as [kbach.config.js](/configuration):

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

> [!WARNING] Settings after the Kbach script are never read
> The script reads `window.kbachConfig` once, as it loads. Put it after the script and your colors don't exist and `Kbach.toggle()` does nothing, with no error. See [Common mistakes](/common-mistakes).

Mode-aware colors like `card` switch with the theme, and opacity works on them too: `bg-card/80`.

## Add a theme toggle {#html-toggle}

```html
<button class="rounded-lg border px-3 py-1.5" onclick="Kbach.toggle()">Toggle theme</button>
```

`Kbach.toggle()` and `Kbach.setMode()` need `darkMode: 'class'` or `'attribute'`. The rest of the `Kbach` object is in the [CDN script API](/browser-api).

## Host the files yourself {#html-self-host}

Copy `kbach.js` and `kbach_core_engine_bg.wasm` from the package's `dist/` folder and keep them side by side. If the `.wasm` lives somewhere else, say where:

```html
<script src="/js/kbach.js" data-wasm="/wasm/kbach_core_engine_bg.wasm"></script>
```

Open the page through a web server, not straight from disk: a `file://` page can't load a local `.wasm` file.

:::

## Requirements

| Setup | Needs |
| :-- | :-- |
| React (Vite) | React 18 or later, Vite 4 or later |
| Next.js | React 18 or later, and the PostCSS 8 that Next.js comes with |
| React Native and Expo | React 18 or later, React Native 0.70 or later |
| Plain HTML | Any current browser: the script runs on WebAssembly |
| CLI | Node.js 18 or later |

`@kbach/react` and `@kbach/react-native` ship ES module and CommonJS builds with TypeScript types. The engine comes with every package (`@kbach/react` installs `@kbach/core-engine`, the others have it built in), so there's nothing else to install.

## Check your setup

```sh
npx @kbach/cli doctor
```

`doctor` changes nothing. It checks that the package is installed, the plugin is wired up and `kbach.config.js` loads, and exits with code 1 if something is wrong, so you can run it in CI. It works for Vite, Next.js and React Native projects.

## Next steps

- [Utility classes](/utility-classes): how class names are built.
- [Dark mode](/dark-mode): follow the system setting, or add a toggle.
- [Editor setup](/editor-setup): completion and hover in VS Code.
