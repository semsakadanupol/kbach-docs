---
title: Playground
toc: false
description: Write HTML with Kbach classes, add a script in JavaScript or TypeScript, and see it run, at any width, in light or dark.
---

::playground

## How it's laid out

- **The bar on top** is the whole project: Kbach's logo, back to the docs, the **example** you started from (a dot means you've edited it), which opens the **examples gallery**, **HTML** or **React**, the layout, **⋯** and **Share**. On a narrow screen, HTML / React moves into **⋯**.
- **The editor** holds your files, `index.html`, the script and `kbach.config.js`, then two that Kbach writes from them (read-only): `kbach.css`, the CSS for your classes, and `native-styles.js`, the style objects `@kbach/react-native` gives the same classes on a phone. Classes that do nothing there are marked **web only**. Its status bar has **Format**, the problem count, and **Fix all** when there are Tailwind CSS classes to rename.
- **The preview** is how you look at the page and run it: **Preview** or **Console**, **Inspect**, light or dark, the device, then the **Auto-run** switch and **Reload** (the page again, fresh, its script from the top).

On a phone you see one at a time: the bar at the bottom switches between **Code** and **Preview**, and in Code it adds a row of the keys a phone keyboard hides (`<`, `>`, `/`, `=` and the rest, and **Tab**, which expands Emmet).

Every visit starts from the **Landing page**. The code you edited last time is kept: **Restore my last code** (in the status bar, and in the **⋯** menu) brings it back.

## Things to try

- An **HTML** page is a real plain HTML page, as you'd write one without a build step. Its `kbach.config.js` sets `window.kbachConfig = { … }`, and `index.html` loads it, then Kbach's CDN script, at the end of `<head>`, and its own script before `</body>`:

  ```html
  <script src="kbach.config.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>
  …
  <script type="module" src="script.js"></script>
  ```

  The config comes first: the Kbach script reads it once, as it loads. Without its tag, `script.js` doesn't run, as on a real page; the **JS / TS** switch makes it `script.ts`. The preview runs that script for real, so the page does exactly what the same files do anywhere. Its script reaches Kbach through `window.Kbach`: `Kbach.ready`, `Kbach.setMode('dark')`, `Kbach.toggle()`. Importing a package takes a bundler, so `import … from '@kbach/react'` is for React mode. The editor says so when the Kbach script, the config or the page's script isn't loaded, when the config loads after the Kbach script, or when a page's script imports a package. See [Plain HTML](/plain-html).
- Switch the top bar from **HTML** to **React**: the same page opens as React. You write `App.jsx`, a React component with `className`, and the preview runs real React (with `useState` and the rest), styled by Kbach as you type. **JSX / TSX** on its tab picks TypeScript. Classes built from state, like `todo.done ? 'line-through' : ''`, get their CSS the moment React puts them on the page. `import { clsx, kb, useTheme, useColors } from '@kbach/react'` works as in a project (the examples use `clsx`), with your `kbach.config.js` applied: `useColors()` gives your colors and `useTheme()` switches dark mode.
- Write your own page and switch it too: **React** turns your HTML into an `App.jsx` (`class` becomes `className`, `style="…"` an object, a click listener on an element with an id becomes its `onClick`, and the rest of your script runs once React has drawn the page), and **HTML** turns a React page back into the markup React drew (its logic stays in `App.jsx`, and `script.js` says so). The Kbach classes stay exactly as they are, both ways, and so do the settings: `kbach.config.js` turns from a plain page's `window.kbachConfig = { … }` into the build plugin's `module.exports = { … }`, and back. A **Blank page** opens with **Write something here** selected (and `kbach.config.js` back to the default, as **Clear all** leaves it): start typing.
- Open the **examples gallery** (the example's name, top left): thirteen pages made only with Kbach classes, from a product card and a pricing table to a dashboard, a chat and the whole color palette. Every one comes as **HTML** and as **React**, the same page both ways: pick which at the top of the gallery, or flip an open one with the switch in the top bar. Narrow them by what they show (responsive, dark mode, animation, states, forms, config, TypeScript), or start from a **Blank page**.
- Pick **Navbar** from the examples, then switch to **Phone**: below the `md` breakpoint the links fold into a menu, and its button opens it. Rotate the phone sideways: at 844px wide it passes `md`, and the links come back.
- Open **Color explorer** and click a color. Its script builds class names like `bg-rose-9` at runtime, and Kbach's CDN script styles them the moment they appear, so no class has to be written out in full anywhere. The hex value it shows is read back from the styled page, after `Kbach.ready`.
- Switch to the **script** tab. It's JavaScript or TypeScript (the **JS / TS** switch): types are stripped before it runs. Inside `classList.add('…')` or `className = '…'`, the editor completes Kbach classes and underlines unknown ones, as it does in the HTML.
- `console.log()` shows up in the **Console** tab. Errors also show on their line in the script, in red. An infinite loop is stopped after 2 seconds instead of freezing the page.
- Click **Inspect** (the arrow in a box) and point at the preview: each element shows its margin, padding and size. Click one: its **Design** tab changes its look with controls (text, background and border colors, padding, gap, corners, shadow, size, weight, alignment, layout), each writing the Kbach class into your code, for **Always**, **Hover**, **Dark** or **md+** (`hover:bg-rose-7` and so on). It works in React too, for a `className` written once in `App.jsx`. **Details** shows its classes with their CSS, its box model and computed styles: switch a class off to see what it does, add one, or jump to its tag with **Code**. While inspecting, the cursor in the HTML lights up the element it's in.
- Type `ul>li*3` and press **Tab**: Emmet writes the HTML. **Shift+Alt+F** formats the file and sorts every class list (layout, then box, then text, then effects). The keyboard button in the status bar lists every shortcut.
- It works like VS Code. TypeScript runs in the editor: suggestions as you type (picking `useTheme` adds `import { useTheme } from '@kbach/react'`), types and docs on hover, the parameters of a call as you type it, type errors underlined in `.ts` and `.tsx` files, **F12** (or Ctrl+click) to go to a definition, **F2** to rename. `kbach.config.js` completes its keys too. **Ctrl+Shift+P** lists every command, **Ctrl+P** the files, **Alt+Z** wraps long lines, and the swatch next to an arbitrary color like `bg-[#ff6600]` opens a color picker.
- The **Console** has a prompt: type JavaScript and press Enter to run it in the page. An error's `script.js:12` link jumps to the line.
- The layout buttons on top put the preview **under** the code or **beside** it, so you see both while you type; drag the bar between them to resize. Or go **full screen**. Re-runs keep the preview scrolled where you were.
- Turn the canvas dark with the moon button: every `dark:` class switches.
- Paste Tailwind CSS code with shades such as `bg-blue-500`. The editor underlines each one and names its Kbach class, `bg-blue-6`; **Fix all** in the status bar renames them in one click.
- Switch **Auto-run** off for a heavy script: a **Run** button shows beside it, changes wait for it (or Ctrl+Enter), and it has a dot while they wait. **Reload** runs the page as it last ran; the waiting changes still wait.
- The **⋯** menu starts a **New blank page** (the gallery has one too, as its first card), opens your page in a tab of its own, downloads it as a `.zip` with each file on its own, and resets an edited example. An HTML page's zip has `index.html`, `kbach.config.js`, the script, `kbach.css` (the CSS Kbach generated, as its tab shows it) and `style.css` (open it through a local server, `npx serve .`); a React page's is a Vite project, set up as [Installation](/installation) does: `npm install`, then `npm run dev`.
- **Share** makes a link with your files in it, copies it, and goes to it: the page opens from the link, as anyone who gets it sees it, and **Back** returns to where you were. Shared again with no change, it's the same link.

The script runs in a sandbox: it can change the canvas, but it can't reach this page, its storage or its cookies.
