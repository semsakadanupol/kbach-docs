---
title: Playground
toc: false
description: Write HTML with Kbach classes, add a script in JavaScript or TypeScript, and see it run, at any width, in light or dark.
---

::playground

## How it's laid out

- **The bar on top** is the whole project: the **example** you started from (a dot means you've edited it), **Run** with its **Auto** switch, the layout, full screen, **⋯** and **Share**.
- **The editor** holds your files, `index.html`, the script and `kbach.config.js`, then two that Kbach writes from them (read-only): `kbach.css`, the CSS for your classes, and `native-styles.js`, the style objects `@kbach/react-native` gives the same classes on a phone. Classes that do nothing there are marked **web only**. Its status bar has **Format**, the problem count, and **Fix all** when there are Tailwind CSS classes to rename.
- **The preview** is how you look at the page: **Preview** or **Console**, **Inspect**, light or dark, and the device.

Every visit starts from the **Landing page**. The code you edited last time is kept: **Restore my last code** (in the status bar, and in the **⋯** menu) brings it back.

## Things to try

- Pick **Navbar** from the examples, then switch to **Phone**: below the `md` breakpoint the links fold into a menu, and its button opens it. Rotate the phone sideways: at 844px wide it passes `md`, and the links come back.
- Open **Color explorer** and click a color. Its script builds class names like `bg-rose-9` at runtime, and the playground makes their CSS the moment they appear, so no class has to be written out in full anywhere.
- Switch to the **script** tab. It's JavaScript or TypeScript (the **JS / TS** switch): types are stripped before it runs. Inside `classList.add('…')` or `className = '…'`, the editor completes Kbach classes and underlines unknown ones, as it does in the HTML.
- `console.log()` shows up in the **Console** tab. Errors also show on their line in the script, in red. An infinite loop is stopped after 2 seconds instead of freezing the page.
- Click **Inspect** (the arrow in a box) and point at the preview: each element shows its margin, padding and size. Click one to see its classes with their CSS, its box model and computed styles. Switch a class off to see what it does, add one, or jump to its tag with **Code**. While inspecting, the cursor in the HTML lights up the element it's in.
- Type `ul>li*3` and press **Tab**: Emmet writes the HTML. **Shift+Alt+F** formats the file and sorts every class list (layout, then box, then text, then effects). The keyboard button in the status bar lists every shortcut.
- The **Console** has a prompt: type JavaScript and press Enter to run it in the page. An error's `script.js:12` link jumps to the line.
- The layout buttons on top put the preview **under** the code or **beside** it, so you see both while you type; drag the bar between them to resize. Or go **full screen**. Re-runs keep the preview scrolled where you were.
- Turn the canvas dark with the moon button: every `dark:` class switches.
- Paste Tailwind CSS code with shades such as `bg-blue-500`. The editor underlines each one and names its Kbach class, `bg-blue-6`; **Fix all** in the status bar renames them in one click.
- Switch **Auto** off for a heavy script: changes then wait for **Run** (or Ctrl+Enter), and Run shows a dot while they wait.
- The **⋯** menu opens your page in a tab of its own, downloads it as one HTML file (its CSS and script included, ready to use anywhere), and resets an edited example.
- **Share** copies a link with your HTML and your script in it. Anyone who opens it gets the same page.

The script runs in a sandbox: it can change the canvas, but it can't reach this page, its storage or its cookies.
