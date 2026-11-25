---
title: Using AI assistants
nav: Using AI assistants
description: AI assistants learned Tailwind CSS, not Kbach, so they make the same few mistakes. Give them these rules first, and they write Kbach correctly.
---

Gemini, ChatGPT, Claude and Copilot have seen a lot of Tailwind CSS and very little Kbach. Asked for a Kbach page, they write Tailwind's color shades (`text-amber-700`), put settings in the wrong place, and use classes a phone can't show. Everything looks right in the code, and nothing tells you it's wrong.

The fix is to give the assistant Kbach's rules before you ask for anything.

## In a project: one command {#in-a-project}

```sh
npx @kbach/cli ai
```

This writes the rules into your project's `AGENTS.md`, the instructions file Codex, Copilot, Cursor, Gemini CLI and other coding assistants read on their own, and into `CLAUDE.md`, `GEMINI.md` or `.github/copilot-instructions.md` if you have them. `npx @kbach/cli init` offers to do the same when it sets a project up. See [CLI](/cli#ai).

## Give it the rules {#give-it-the-rules}

In a chat (Gemini, ChatGPT, Claude on the web), copy this block into the conversation before your request:

```text
Kbach rules. Follow them in every class you write.

1. Color shades go from 1 (lightest) to 12 (darkest). Never use 50 to 950.
   Convert: 50→1 100→2 200→3 300→4 400→5 500→6 600→7 700→8 800→9 900→10 950→11.
   Write bg-blue-6, text-gray-11, border-slate-3. Never bg-blue-500.
2. Color families: amber blue cyan emerald fuchsia gray green indigo lime
   mauve mist neutral olive orange pink purple red rose sky slate stone taupe
   teal violet yellow zinc. Single colors: white black transparent current
   gold silver bronze copper coal.
3. Every other class follows Tailwind CSS v4.3 names and values: spacing in
   steps of 4px (p-4 is 16px), variants such as hover:, md: and dark:,
   values in square brackets, a slash for opacity (bg-black/50).
   Gradients: bg-linear-to-r from-* via-* to-*.
4. There is no tailwind.config.js, no @tailwind, no @import "tailwindcss",
   no @theme and no @apply. Settings go in kbach.config.js
   (export default { darkMode, theme, extend }). Custom animations go in
   extend.keyframes and extend.animation and are used as animate-<name>.
5. Plain HTML page: put <script>window.kbachConfig = { ... }</script> BEFORE
   <script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>.
   A theme button calls Kbach.toggle() and needs darkMode: 'class' or
   'attribute' in that config.
6. React with Vite: import { kbach } from '@kbach/react/vite' and add kbach()
   to plugins; import './kbach.css' once in the entry file. Write every class
   in full: never build one from pieces like 'bg-' + color.
7. React Native: '@kbach/react-native/babel-plugin' must be in
   babel.config.js. On a phone there is no grid, no gradients, no filters, no
   transitions or animations, no group-*, peer-*, before: or after:. Use
   flex-row for rows (a View is a column). Values in brackets: px or rem only.
8. Dark mode switches use useTheme() from '@kbach/react' or
   '@kbach/react-native': { mode, isDark, setMode, toggle }.

Full documentation: https://kbach.vercel.app
```

The same rules are published with these docs as `/llms.txt`, the file AI tools look for on documentation sites, and the whole documentation as one text file at `/llms-full.txt`. When the docs site is online, you can give an assistant either address instead of pasting.

## Check what it wrote {#check-what-it-wrote}

Assistants still slip, especially on long pages. Before you use the result:

- Paste it into the [Playground](/playground): unknown classes are underlined, with the right name, and **Fix all** fixes the shades in one click.
- Look for the mistakes in [Common mistakes](/common-mistakes); they're the same ones assistants make.
- In React projects, the terminal and the [VS Code extension](/editor-setup) name every unknown class.
