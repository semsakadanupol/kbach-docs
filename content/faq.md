---
title: FAQ
nav: FAQ
description: Short answers to the questions people ask most about Kbach.
---

## Is Kbach a copy of Tailwind CSS? {#is-kbach-a-copy-of-tailwind-css}

No. Kbach has its own engine, written in Rust, its own color palette, and it also works in React Native, which Tailwind CSS doesn't. Its class names follow Tailwind CSS on purpose, so the names are already familiar to many developers. Kbach is an independent project, not connected with Tailwind Labs. See [Coming from Tailwind CSS](/coming-from-tailwind).

## Do I need to know Tailwind CSS? {#do-i-need-to-know-tailwind-css}

No. These docs explain everything from the start. Begin with the [Quick start](/quick-start).

## Is it ready to use? {#is-it-ready-to-use}

Yes. Kbach 1.0.0 is the first stable release, and it follows semantic versioning: a 1.x release adds and fixes things without breaking what already works, and a breaking change waits for 2.0. This site is built with Kbach.

## Is it free? {#is-it-free}

Yes. Kbach is open source, under the MIT License. The code is on [GitHub](https://github.com/semsakadanupol/kbach).

## Does it work on iOS? {#does-it-work-on-ios}

Yes. On iOS, Kbach uses a JavaScript version of its engine, the same one Expo Go uses. It covers the everyday classes. The faster native module is Android only for now. See [Which engine runs](/react-native#which-engine-runs).

## Which browsers does it work in? {#which-browsers-does-it-work-in}

Every current browser: Chrome, Edge, Firefox and Safari, on computers and phones. Kbach writes its CSS itself, with no other tool after it, so it also writes what older browsers need:

- a `-webkit-` copy of the properties Safari still reads only that way: `backdrop-filter` (the `backdrop-*` classes), `background-clip: text` (`bg-clip-text`), the `mask-*` classes, `select-none`, `hyphens-*`, `box-decoration-*` and `appearance-none`;
- an older stand-in just before a newer value: `overflow: hidden` before `overflow: clip` (`overflow-clip`), `vh` before `dvh`, `svh` and `lvh` (`h-dvh`, `min-h-svh`), and the plain color before a see-through one written with `color-mix()` (`bg-current/50`).

A few newer features have no stand-in. In a browser that doesn't have them yet, they do nothing, and the page simply looks a little plainer: `text-balance` and `text-pretty`, `field-sizing-*`, `starting:`, `scrollbar-*`, and the `has-*` and `@container` variants.

With Next.js, its CSS minifier keeps a stand-in only when your list of browsers (`browserslist` in `package.json`) has one that needs it.

## How much does it add to my app? {#how-much-does-it-add-to-my-app}

- **Web:** only the CSS for the classes you use, in one file. No JavaScript runs to style the page. `kb()` and the runtime path load the engine (about 195 KB gzipped) only if you use them.
- **Plain HTML:** about 8 KB of JavaScript and 195 KB of WebAssembly, gzipped, cached after the first visit.
- **React Native:** the engine comes inside the package, and each element's classes are worked out once and remembered.

## Can I use my own CSS too? {#can-i-use-my-own-css-too}

Yes. Kbach only writes rules for its own classes. On the web, classes from your own CSS files aren't reported as unknown, and on a plain HTML page the script skips class names it doesn't know.

## Does it work with Next.js? {#does-it-work-with-nextjs}

Yes, through the PostCSS plugin. The CSS is an ordinary file made when you build, so server rendering works as usual. See [Installation](/installation?tab=nextjs).

## Does it work with Vue, Svelte or another framework? {#does-it-work-with-vue-svelte-or-another-framework}

The build plugin is made for React: it looks for `className`. On any other page, the [CDN script](/plain-html) works, because it reads the `class` attributes in the browser, whatever made them.

## Where do I report a bug or ask a question? {#where-do-i-report-a-bug}

Open an issue on [GitHub](https://github.com/semsakadanupol/kbach/issues). Every page of these docs also has a **Report an issue** link at the bottom, which fills in the page for you.
