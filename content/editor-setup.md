---
title: Editor setup
description: Kbach IntelliSense for VS Code suggests class names as you type, shows what each one does, and warns you about typos. It checks every class with the real engine.
---

::extension

## What you get {#what-you-get}

- **Suggestions as you type** inside `className`, with the CSS each class makes shown next to it. Color suggestions include your own colors from `kbach.config.js`.
- **Hover** over a class to see its CSS, with a color swatch for colors.
- **Typo warnings** for classes that don't exist, with a one-click fix when one is close (`bg-blu-6` becomes `bg-blue-6`).
- **React Native warnings**: in a React Native project, a class that is valid but does nothing on a phone (like `grid`, `group-hover:` or `before:`) is underlined.
- **A color picker** for colors you type in brackets, like `bg-[#c7a25d]`.

The extension runs the same engine as your build, so what it shows is what you get.

## Install {#install}

In VS Code, open the Extensions view (<kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>X</kbd>, or <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>X</kbd> on macOS), search for **Kbach IntelliSense** and choose **Install**. Or from a terminal:

```sh
code --install-extension kbach.kbach-vscode
```

It starts by itself when you open a `.js`, `.jsx`, `.ts` or `.tsx` file. There's nothing to set up.

## Good to know {#good-to-know}

- The suggestion list has the common classes and the spacing and color scales, but not every class the engine knows. A class that isn't suggested can still be valid. Hover and the typo warnings always ask the real engine, so they're never wrong about that.
- The extension notices when `kbach.config.js` changes, so new colors show up without restarting VS Code.
- It works in JavaScript and TypeScript files only, not in `.html` files. The CDN script for plain HTML pages doesn't warn about typos either (a page can have classes from other CSS, so it skips any name it doesn't know). To check a class there, look it up in the reference or try it in the [Playground](/playground).
