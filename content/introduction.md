---
title: Introduction
description: Kbach lets you style an element by giving it short class names, like p-4 or bg-blue-6. The same names work on the web, in React Native apps and in plain HTML pages.
---

## What Kbach does {#what-kbach-does}

With Kbach you don't write a stylesheet. You give each element a few short class names, and each name does one small thing:

```tsx title="Card.tsx"
<div className="rounded-xl bg-white p-6 shadow-lg">
  <h2 className="text-lg font-semibold">Hello, Kbach</h2>
  <p className="mt-2 text-sm text-gray-7">Every class here sets one thing.</p>
</div>
```

Read it left to right: `rounded-xl` rounds the corners, `bg-white` makes the background white, `p-6` adds 24px of space inside, `shadow-lg` adds a large shadow. `text-lg` makes the text bigger, `font-semibold` makes it bolder, `mt-2` adds 8px of space above, `text-gray-7` makes it gray. This is the result:

```preview
<div class="max-w-sm rounded-xl bg-white p-6 shadow-lg dark:bg-gray-10">
  <h2 class="text-lg font-semibold text-gray-12 dark:text-white">Hello, Kbach</h2>
  <p class="mt-2 text-sm text-gray-7 dark:text-gray-4">Every class here sets one thing.</p>
</div>
```

Because every class is small and named after what it does, you can see how an element looks just by reading its classes, and you change its look by changing them. There are no style names to invent, and no separate file to keep in sync. [Utility classes](/utility-classes) explains the idea in full.

## Where it runs {#where-it-runs}

Kbach has one engine, written in Rust, that knows what every class means. It runs in three places:

::cards

- **Web (React):** a plugin for Vite or Next.js finds the classes in your code when you build, and writes the CSS they need into one file. Nothing runs in the browser to style the page.
- **React Native:** each element's classes are turned into a React Native style object when it renders, on Android, iOS and Expo.
- **Plain HTML:** one `<script>` tag from a CDN styles the page in the browser. No build step and no React.

All three use the same class names, the same colors and the same settings file, `kbach.config.js`. A phone isn't a web page, though, so some classes (grid layouts, filters, gradients, transitions) only work on the web. [React Native](/react-native) says exactly what works there, and the reference tables mark every class that does nothing on a phone as **Web only**.

## The packages {#the-packages}

| Package | What it's for |
| :-- | :-- |
| `@kbach/react` | React on the web, with Vite, Next.js or any PostCSS setup |
| `@kbach/react-native` | React Native and Expo: Android, iOS, Expo Go and Expo Web |
| `@kbach/browser` | A plain HTML page, from a CDN |
| `@kbach/cli` | Setting a project up (`init`) and checking it (`doctor`) |
| Kbach IntelliSense | The VS Code extension: completion, hover and typo checks |

You install one of the first three, depending on where your code runs. The engine itself is the package `@kbach/core-engine`; the others bring it with them, so you never install it yourself.

## Already know Tailwind CSS? {#already-know-tailwind-css}

Kbach's class names follow Tailwind CSS, so most of what you know carries over. The biggest difference is the colors: shades run from `1` (lightest) to `12` (darkest), so it's `bg-blue-6`, not `bg-blue-500`. [Coming from Tailwind CSS](/coming-from-tailwind) lists every difference.

## Where to go next {#where-to-go-next}

1. [Install Kbach](/installation) for React, React Native or a plain HTML page.
2. Follow the [Quick start](/quick-start) to build your first component, one class at a time.
3. Read [How Kbach works](/how-it-works) and [Utility classes](/utility-classes) to understand what you're writing.
