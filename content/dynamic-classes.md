---
title: Dynamic classes
description: Classes that change while the app runs, like a color picked by the user. How to write them so they always get their CSS.
---

## The build only sees whole class names

On the web, the plugin finds classes by reading your source code as text. It never runs your code. So a class must appear **whole** somewhere in a file it scans:

```tsx
// ✗ The plugin sees "bg-" and "-6", not a class
<div className={'bg-' + color + '-6'} />

// ✓ Every class is written out in full
const BG = { blue: 'bg-blue-6', red: 'bg-red-6', green: 'bg-green-6' };
<div className={BG[color]} />
```

Hold on, though: the plugin collects strings from `className="..."`, `className={...}`, template literals and calls to `clsx()`, `cn()`, `classnames()`, `cx()` and `kb()`. A plain object like `BG` above is only found if its strings are in one of those places. The simplest fix is to wrap them:

```tsx
import { clsx } from '@kbach/react';

const BG = {
  blue: clsx('bg-blue-6'),
  red: clsx('bg-red-6'),
  green: clsx('bg-green-6'),
};
```

The plugin scans the `src`, `app`, `pages` and `components` folders by default. Use the [`include` option](/plugin-options) to add others.

## clsx

`clsx()` joins class names and drops anything falsy. It's the same as the popular package, built in:

```tsx
import { clsx } from '@kbach/react';

<button className={clsx('rounded-lg px-4 py-2', primary ? 'bg-blue-6 text-white' : 'bg-gray-2', disabled && 'opacity-50')} />;
```

It takes strings, arrays and objects: `clsx({ 'font-bold': active })`.

## safelist

When you know every value in advance, list them in the plugin options. The CSS stays fully static:

```ts title="vite.config.ts"
kbach({ safelist: ['bg-blue-6', 'bg-red-6', 'bg-green-6'] });
```

## kb(): resolve at runtime

When the class really comes from runtime data, from a CMS, user input or a database, resolve it in the browser with `kb()`. It runs the engine, adds the CSS to the page and returns the class name to use:

```tsx title="main.tsx"
import { initKbach } from '@kbach/react';

await initKbach(); // loads the engine once, before the first kb() call
```

```tsx
import { kb } from '@kbach/react';

function Badge({ color }: { color: string }) {
  return <span className={kb('rounded-full px-2 py-0.5 bg-' + color + '-2 text-' + color + '-9')}>New</span>;
}
```

Use the string `kb()` returns. It's almost always the one you passed in; it differs only for a light/dark color whose values aren't hex, which comes back as one class per mode. Classes that `kbach.css` already defines are left to it, so the two stylesheets never fight over which rule wins.

`kb()` loads about 195 KB of WebAssembly, gzipped, so use it only where you need it. The live examples and the [Playground](/playground) on this site use it.

## Every className at runtime

There's one more option: send every `className` through `kb()` automatically. Set the JSX import source, and call `initKbach()` before the first render:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "jsxImportSource": "@kbach/react"
  }
}
```

Most apps don't need this. The static build plus a few `kb()` calls is smaller and faster.

## On React Native

Everything is resolved when it renders, so dynamic class names just work on native. There's no scan and no `initKbach()`.

## In a plain HTML page {#in-a-plain-html-page}

The CDN script watches the page, so a class you add from JavaScript is styled when it appears, whole or built from pieces: `el.classList.add('bg-' + color + '-6')` just works.
