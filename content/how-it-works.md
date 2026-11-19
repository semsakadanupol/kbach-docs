---
title: How Kbach works
description: What happens to your class names, on the web, in React Native and in a plain HTML page, and why some classes only work in one of them.
---

## One engine {#one-engine}

At the center of Kbach is one engine, written in Rust. You give it a class name, and it tells you what that class means: for `p-4` it says "16px of padding", for `bg-blue-6` "this blue background". Every package uses this same engine, so a class means the same thing everywhere.

What's different is **when** the engine runs, and **what it makes**:

| Where | When the engine runs | What it makes |
| :-- | :-- | :-- |
| Web (React) | When you build, and while the dev server runs | A CSS file |
| React Native | When each element renders | A React Native style object |
| Plain HTML | In the browser, when the page loads | CSS, added to the page |

## On the web: when you build {#on-the-web}

1. A Vite or PostCSS plugin reads your source files (in `src`, `app`, `pages` and `components`) and finds the class names in them.
2. Each class goes through the engine, which returns its CSS.
3. All the CSS is written to one file, `kbach.css`, which you import once.
4. When the app runs, `className` is just a string. The CSS already exists, so there's nothing to load and nothing to wait for.

The plugin finds classes by **reading** your code, not by running it. So a class must be written out whole somewhere: `'bg-' + color + '-6'` can't be found, because the full name `bg-blue-6` never appears in your files. [Dynamic classes](/dynamic-classes) shows what to do instead.

While the dev server is running, saving a file rewrites `kbach.css` straight away. A class name that matches nothing prints a warning in the terminal, with the file, the line, and the class you probably meant. [Web](/web) has the details.

## In React Native: when an element renders {#in-react-native}

React Native has no CSS. Each element gets a style object instead, like `{ padding: 16, backgroundColor: '#3b82f6' }`.

1. A Babel plugin makes `className` work on React Native elements (`View`, `Text`, `Pressable` and the rest).
2. When an element renders, its classes go through the engine, which returns a style object.
3. The result is remembered, so the same classes aren't worked out twice.

Because the engine runs while the app runs, a class built from pieces (`'bg-' + color + '-6'`) works fine on React Native.

Which version of the engine runs depends on where the app runs:

| Where | Engine |
| :-- | :-- |
| Android (development build or release) | The Rust engine, through a native module |
| iOS (any build) and Expo Go | A JavaScript version of the engine. It covers the same everyday classes, with a few gaps |
| Expo Web | The same WebAssembly engine as the web, writing real CSS |

[React Native](/react-native) lists what the JavaScript version leaves out, and which classes do nothing on a phone at all.

## In a plain HTML page: in the browser {#in-plain-html}

1. The `<script>` tag loads the engine, as WebAssembly.
2. It reads the `class` attribute of every element on the page and adds the CSS those classes need.
3. It keeps watching the page: elements added later, and classes changed from JavaScript, are styled too.

Classes that Kbach doesn't know are skipped, so the page can use other CSS alongside it. [Plain HTML](/plain-html) has the details.

## Why some classes only work on the web {#why-some-classes-only-work-on-the-web}

A web page and a phone app draw things differently. A browser understands everything CSS can do. React Native understands a smaller set of styles: boxes, flexible rows and columns, borders, shadows, text, transforms and opacity.

So classes that need CSS features React Native doesn't have do nothing there, for example:

- grid layouts (`grid-cols-3`), floats and multi-column text
- gradients, filters (`blur-sm`) and blend modes
- transitions and animations
- `group-hover:`, `peer-*`, `before:` and `after:`, because a phone app has no CSS selectors

These classes are still valid, and they work on the web and on Expo Web. On a phone they're skipped without an error. Every reference table marks them **Web only**, and the [VS Code extension](/editor-setup) underlines them in a React Native project.

## What's the same everywhere {#whats-the-same-everywhere}

- The class names, and what they mean.
- The colors: 26 color families with 12 shades each. See [Colors](/colors).
- The settings file, `kbach.config.js`, for your own colors, spacing and fonts. See [kbach.config.js](/configuration).
- Dark mode: `dark:` classes work the same way everywhere. To switch it yourself, React and React Native have the `useTheme()` hook, and a plain HTML page has `Kbach.toggle()`. See [Dark mode](/dark-mode).
