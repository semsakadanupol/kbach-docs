<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- kbach:ai-rules:start -->
## Kbach (styling)

This project is styled with Kbach.

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
<!-- kbach:ai-rules:end -->

# kbach-docs — the Kbach documentation site

The official docs: a Next.js app (App Router) styled with `@kbach/react`,
with a small Markdown reader of its own. It builds to plain files (a
static export: one HTML file per page) that any static host serves.
English only: the Khmer translation was removed on 2026-11-27 (the user
judged it not good enough); see "Routes" for what stayed of it.

**Its own repository** (github.com/semsakadanupol/kbach-docs) since
2026-11-25, split out of the Kbach monorepo with its history (the user
wanted the docs separate). Locally it's checked out at `Kbach/apps/kbach-docs`,
which the Kbach repo ignores and leaves out of its npm workspaces, so this
folder has its own `node_modules` and `package-lock.json`. It installs
`@kbach/react` and `@kbach/core-engine` **from npm**: the docs describe
the published versions, and an unpublished change in the Kbach repo isn't
visible here until it's released. After each release, raise the versions
in `package.json`; `tests/e2e/api-reference.mjs` (every export named on
its API page) and `tests/e2e/ai-rules.mjs` (the AI rules) then say what
the docs still lack. The playground's kbach.css tab and its completions use
`@kbach/react/tools` (react 1.1.0+), the same code as the build plugin and
the VS Code extension, never a copy.

History: until 2026-11-19 the docs were a Vite app (`apps/docs`), with a
homemade router and prerender script the user found hard to change and
review. They moved to Next.js, into this app, which the user made with
`create-next-app` and `npx @kbach/cli init` (so the docs are set up the way
they tell readers to). Its `next.config.ts`, `postcss.config.mjs` (made ESM so ESLint accepts its file reads),
`tsconfig.json` and ESLint config are that setup, with only what the docs
need added.

```sh
npm run dev        # http://localhost:3000, live as you edit
npm run build      # out/
npm run start      # out/ at http://localhost:3000, as a static host serves it
npm run typecheck  # TypeScript
npm run lint       # ESLint
```

## To change… edit…

| To change | Edit |
| --- | --- |
| A page's text | `content/<slug>.md` |
| The sidebar's order and sections | `NAV` in `src/lib/docs.ts` |
| The home page | `src/components/Landing.tsx` |
| The header, phone menu, footer | `src/components/site/Header.tsx`, `MobileNav.tsx`, `Footer.tsx` |
| The footer's "Built with" row (what the site is made with) | `BUILT_WITH` in `Footer.tsx` (marks: `TOOLS` in `BrandIcon.tsx`, kept out of `BRANDS` so code tabs don't pick them up) |
| A docs page's layout (sidebar, title, "On this page") | `src/components/site/DocPageView.tsx` |
| The 404 page | `src/components/site/NotFound.tsx` |
| `<html>`, fonts, tab icon, the no-flash theme script | `src/components/site/RootDocument.tsx` |
| Page titles, descriptions, share tags | `src/lib/metadata.ts` |
| How a Markdown block looks | `src/markdown/render.tsx` (reading it: `src/markdown/parse.ts`) |
| A `::name` component in a page | `src/components/registry.tsx` |
| The playground | `src/components/Playground.tsx`, `src/playground/` |
| The site's colors and fonts | `kbach.config.js` |
| Page-wide CSS with no class (scrollbars, selection) | `src/app/globals.css`, below the markers |
| GitHub links ("Edit this page") | `src/lib/site.ts` |

## How it fits together

- **Routes** (`src/app/`): one folder per address, the Next.js way. Every
  page is at the root since 2026-11-27 (the user: "remove en"): `/` is the
  home page, `/<slug>` a docs page, `/playground`, `/search.json`.
  `layout.tsx` is the one root layout; `page.tsx` the home page;
  `[slug]/page.tsx` the docs pages (the static routes beside it, such as
  `playground/` and `sitemap.xml/`, win over a slug, so no content file
  may take one of their names).
  - History: 2026-11-19 to 2026-11-27 every page was under its language,
    `/en/…` and `/km/…` (`[lang]/`, with a `(start)/` page at `/` that
    picked one). Khmer went first, then the `/en`.
  - `global-not-found.tsx` — `404.html`, for any other address. Before
    anything shows, it drops a leading `/en` or `/km` from the address
    (`/en/installation`, `/km/installation`, `/en`) and opens that page,
    keeping `?tab` and `#section`. `vercel.json` also redirects
    `/:lang(en|km)` and `/:lang(en|km)/:path*` permanently (a 308), so
    search engines move to the new addresses; the 404 script covers any
    other host and local `serve.mjs`.
  - `llms.txt/`, `llms-full.txt/`, `robots.txt/`, `sitemap.xml/` — files
    made at build time (route handlers)

  The route files are a few lines each: they call the shared code in
  `src/app/_site/` (a `_` folder is not a route).
  `pages.tsx` there says what each kind of page is; `layout.tsx` wraps
  every page.
- **Server and browser.** `src/lib/content.ts` reads `content/` from disk
  at build time (server only). The browser never reads files: each page
  gets its own parsed Markdown as a prop, every page gets the docs' page
  names through `SiteDataProvider` (`components/site/SiteData.tsx`), and
  search loads `/search.json` when it first opens.
  Components marked `'use client'` run in the browser too; anything that
  reads `window` or `localStorage` does so in an effect, after the page
  starts, so the built HTML and the browser's first render agree.
- **Links.** Links inside the site are `<SiteLink href="/installation">`
  (`components/SiteLink.tsx`, a Next.js `Link`); a page's address is
  `hrefFor(slug)` in `src/lib/docs.ts` (`/` + slug). The interface's words are plain English in the components: the
  translation layer (`useT()`, `src/lib/km.ts`, `locale.ts`, `i18n.tsx`)
  went with Khmer. To bring a language back, git history has it all (the
  last commit with it is the one before Khmer's removal).
- **The site frame.** `components/site/Shell.tsx` is around every page: the
  header, phone menu and search, Ctrl+K, the page-change bar, the browser
  bar's color, and jumping to a `#section` after a page opens. The
  playground gets none of it (full screen). The header (`site/Header.tsx`)
  ends with the theme and GitHub at the far right, on the
  home page and the docs alike; it has no Get started button, and neither
  has the home page's phone menu (both removed 2026-11-27: the hero has
  one).
- **CSS.** `src/app/globals.css` has the two Kbach markers: Kbach's
  PostCSS plugin (`postcss.config.mjs`) fills them on every build from the
  classes in `src/` and `kbach.config.js`; nothing generated is committed.
  Below the markers, a few hand-written page-wide rules (scrollbars,
  selection). `src/styles/motion.css` and `editor.css` are
  plain CSS (the plugin leaves files without markers alone). The plugin
  scans `className=`, `clsx()`-style calls and template literals, not
  plain strings: a class kept in a `const x = "..."` gets no CSS (write it
  as a template literal).
- **Phones (2026-11-26).** Kbach's `hover:` only applies on a device that
  can hover, so every `hover:` color, background, border, underline, shadow
  or opacity has an `active:` twin with the same value (`group-hover:` →
  `group-active:`), the look a finger gets while it presses; a card that
  lifts on hover gets `active:scale-[0.98]` instead. Write the twin with
  every new `hover:` style. The browser's own tap flash is off
  (`globals.css`), and `Shell.tsx` listens for `touchstart` because iOS
  Safari applies `:active` only then. Tap targets are 44px on a touch
  screen (`pointer-coarse:size-11` on the header's buttons; "Copy code"
  keeps its 28px look with an invisible `pointer-coarse:before:-inset-2.5`
  ring). The phone menu closes with a swipe to the left
  (`useSwipeToClose` in `MobileNav.tsx`). A docs page's header rises in
  line by line (`motion-safe:animate-[kbd-fade-up_…]`, the line under it
  `kbd-grow`), while the body only fades so `#section` links land right.
  `tests/e2e/mobile.mjs` checks all of it (headless Chromium never sets
  `:active` from an emulated touch, so the press is checked with a pointer).
- **Scroll reveal (2026-11-26, reworked the same day).** Every block of a docs
  page (`[data-prose] > *`) and the home page's `[data-reveal]` blocks
  (`<Reveal>` in `Motion.tsx`, or the attribute) rise in when they're on
  screen, and only then: the first screen as the page opens (top to bottom,
  after a docs page's header), the rest the moment any part of one shows
  (the user wanted even a sliver at the bottom of the screen to play).
  `components/scrollReveal.ts`, started by `Shell.tsx` for each page, plays
  `element.animate` (40px up and faded in, 0.8s) the same way in every
  browser. So the first screen doesn't show, hide, then animate,
  `RootDocument.tsx` marks the page before the first paint
  (`data-kb-reveal`) and `motion.css` holds blocks hidden until revealed
  (`data-revealed`); without JavaScript or with reduced motion there's no
  mark, and if the reveal never starts the mark goes after 3s. A
  MutationObserver catches blocks mounted later. The cleanup only stops
  watching (React's dev mode starts each effect twice; showing the waiting
  blocks there once showed the whole page at once). On the dev server the
  console says whether it runs. Earlier the same day it was a CSS
  scroll-driven animation (`animation-timeline: view()`) with a script for
  Firefox; the user couldn't see it work and asked for a full rework. Only
  reveal a block with more page after it (the footer at least). A page
  opened at a `#heading` fades its first screen in without moving it: the
  browser scrolls to the heading while the blocks are still 40px down, and
  rising left the heading 40px too high (`docs-site.mjs`' deep-link checks
  caught it).
  `tests/e2e/scroll-reveal.mjs` records every `animate` call and checks, at
  6 screen sizes in Chromium and 4 in Firefox, that the first screen rose
  on load, nothing below the screen ever played, and nothing is left faded.
- **`?raw` imports** give a file's text (`next.config.ts`'s Turbopack
  rule, `scripts/raw-loader.cjs`): the playground's example and the script
  it puts in its canvas.
- **`scripts/fix-windows-export.mjs`** runs after `next build`. Next.js
  16.3 and 16.4 write the static export's link-prefetch files as folders
  on Windows (`__next.!x/$d$slug/__PAGE__.txt` instead of
  `__next.!x.$d$slug.__PAGE__.txt`: `path.relative` gives backslashes, and
  only `/` is turned into `.`), so every prefetch was a 404. The script
  gives them their flat names; on macOS and Linux it does nothing. Check
  after a Next.js upgrade whether it's still needed (`collectSegmentPaths`
  in `next/dist/export/index.js`).

## Pages

- **Sections** (2026-11-17): Getting started (introduction, installation,
  quick-start, editor-setup), Core concepts (how-it-works, utility-classes,
  variants, colors, dark-mode, dynamic-classes), Platforms (web,
  react-native, plain-html), Utilities (15 pages), Customization, API
  reference, Help (common-mistakes, ai-assistants, coming-from-tailwind,
  troubleshooting, faq). `content/playground.md` is the playground page,
  outside the sidebar.
- **Moved pages:** `/cdn` → `/plain-html`, `/tailwind-differences` →
  `/coming-from-tailwind` (`REDIRECTS` in `src/lib/docs.ts`). A static
  export has no server redirects, so the old address is a real page that
  shows the new one, marked `noindex`, and the browser then replaces the
  address.
- **Utility tables:** `::classes …` lines in a page, generated live by the
  engine (`src/components/ClassTable.tsx`). Classes in ` ```preview `
  blocks are safelisted into the CSS by `postcss.config.mjs`.
- **"Web only" marks** in those tables: each class also goes through
  `resolve_style_json` (the engine's React Native output, the same Rust
  code the Android build runs), and `src/reference/native.ts` decides
  whether any property it returns is one React Native really uses, with a
  value it accepts. The engine sometimes returns properties React Native
  ignores (`float`, `columns`, `order`, `display: grid`, `"16px"` strings,
  `fontFamily: ui-sans-serif`), so "the engine returned something" isn't
  enough. A table where every class is web only gets one note above it.
  Classes with a variant (`md:`, `hover:`) get no mark. The iOS / Expo Go
  JavaScript engine differs from Android on a few classes (`object-*`,
  `w-3xs`/`2xs`/`xs` and the same sizes on min-w/max-w/basis); those are
  listed by hand on the React Native page, `#ios-and-expo-go`.
- **"Last updated"** under each page is its file's last commit date
  (`src/lib/content.ts`, one `git log` at build time); a file not
  committed yet shows its modified time.
- **Back to top (home page only, 2026-11-27):** `components/site/BackToTop.tsx`,
  in `HomePage.tsx`. A round button fixed bottom right, shown once the
  reader is a screen down (hidden, it's `aria-hidden` and out of the tab
  order), with a gold ring that fills with the scroll (set on the SVG
  circle in a rAF, not through state). It scrolls up smoothly (at once with
  reduced motion) and focuses the header's first link. Docs pages don't
  get it: their "On this page" column has a Back to top link.
  `tests/e2e/back-to-top.mjs` checks it.
- **Home page:** `src/components/Landing.tsx`, reworked 2026-11-19 after
  the user found the page before it "uses the same thing over and over"
  (a card grid in every section). It shows the engine instead of
  describing it, and each section has its own form: the hero (headline,
  Get started, the playground as a text link, `npx @kbach/cli init`), then
  one class with lines down to its three outputs (web CSS, the React
  Native style object, the HTML script); a class read word by word; all 26
  color families × 12 shades as one strip; a terminal with the build
  plugin's unknown-class warning beside where mistakes get caught; three
  platform columns split by rules; the docs as a numbered table of
  contents (each part shows 5 pages; a part that would hide 2 or more has
  "Show N more"); one large closing link. Keep it that way: a new section
  gets a form of its own, not another card grid.
  "Like a ruler" (the user, 2026-11-19): every section after the hero goes
  through `Section` in Landing.tsx (a line above, 96px above and below, the
  same heading block, 48px to the content), the header, sections and footer
  share their edges, and things side by side line up through CSS subgrid
  (`lg:row-span-4 lg:grid lg:grid-rows-subgrid`: the output panels are one
  height, the install commands on one line). The docs layout has the
  header's side padding (`lg:px-8`), and the 404 page uses the docs'
  three columns, so its text sits where a docs page's does. `home.mjs`
  measures all of this at 1440px.
  "Works with" is a map beside the headline (`src/components/WorksWith.tsx`,
  2026-11-19): the engine in the middle, its three packages, the seven
  setups, each a link. Pointing at or tabbing to one lights its path back
  to the engine (a moving gold dash, `kbd-flow` in motion.css) and says
  under the map how Kbach plugs in there. Node positions are hand-placed
  % of the box (square; 4:5 on a phone, for room between the labels
  stacked on each side) so it balances: web on the left, React Native and
  the plain page on the right. A label's width depends on the font and
  the reader's text size, so the map also measures: after it
  draws and on any resize, a label that would cross the box's edge, or a
  package label that would touch the engine, is nudged back, and the
  lines run to the labels' measured middles (`Fit` in WorksWith.tsx).
  `home.mjs` checks fit, overlap and line ends at 320px and
  with 20px text, plus the lit lines and the links. Trap: Kbach's base
  reset keeps the browser's `<figure>` margins (40px each side), which
  pushed both hero diagrams off center; give a `<figure>` `m-0` (or `mx-0`). No live class demo in the hero
  (trying classes is the playground's job).
  Everything it shows is real, and `tests/e2e/home.mjs` checks it: the
  outputs against `generate_css` / `resolve_style_json`, the words against
  the engine, the warning against `unknownClassWarnings.ts` and
  `suggest_class`, the contents against `NAV`. Change the hero class
  (`HERO_CLASS`) and its outputs together. The samples are plain strings
  on purpose, so the plugin doesn't scan them as the page's own classes.
- **Playground editor tabs:** the reader's `index.html`, script and
  `kbach.config.js` (React: `module.exports`; HTML: `window.kbachConfig =`,
  see "HTML mode is a plain page"), then two read-only outputs: `kbach.css` (what the
  build plugin writes) and `native-styles.js`
  (`src/playground/nativeStyles.ts`): one style object per distinct class
  list, from `resolve_style_json` with the playground's theme, at the
  picked device's width (390 when the preview fills the panel) and the
  preview's light/dark. Properties are sorted with
  `src/reference/native.ts`: one React Native doesn't have is listed as
  "ignored", and a class with nothing at any width, mode or press is
  "web only". `hover:`, `focus:`, `disabled:`, `data-*:` and `aria-*:` are
  stripped before that check, because `@kbach/react-native`'s JSX runtime
  applies them from props, not the engine. The web theme's default
  `surface` color is removed too, since `@kbach/react-native`'s defaults
  don't have it.
- **Inspector Design tab (2026-11-26).** The Inspector opens on Design
  (`components/DesignPanel.tsx`; it remembers Design or Details): controls
  for colors (a family, then shades 1–12, plus the config's single
  colors), spacing, shape, text and layout, in a state (Always, Hover,
  Dark, md+ = the variant written in front). `src/playground/design.ts`
  says which class each control owns (a color control only owns classes
  the engine says set a color, so `bg-cover`/`bg-linear-to-r` are safe) and
  what a change takes out and puts in; `tests/design.mjs` (`npm test`, Node
  runs the .ts directly) checks it. Every class edit, Design or the Details
  list, goes through one `editPickedClasses` in Playground.tsx: index.html's
  attribute (`setClassesInSource`), or in React mode the one
  `className="…"` in App.jsx with exactly the element's classes
  (`classLiteralFor` in react.ts; none or several, as with `cn()`, is
  read-only with the reason). `tests/e2e/playground-design.mjs`.
- **React mode (2026-11-26).** The top bar's HTML / React switch (the
  project's `mode`, saved, and in share links as `&mode=react`; on an
  example it opens that example's other version): the reader
  writes `App.jsx` (or `.tsx`, the JSX / TSX switch), compiled by Sucrase
  (`compileScript(…, { jsx: true })`, the automatic runtime), and the canvas
  runs real React 19.2 from esm.sh through an import map
  (`src/playground/react.ts`: `IMPORT_MAP`, `withMount` mounts the default
  export into `#root` on the last line so error lines don't move). Classes
  come from the same places as in HTML mode (quoted strings up front, the
  canvas reports the rest); the editor's `jsx`/`tsx` modes check and
  complete `className="…"`, `className={'…'}` and `clsx()`/`cn()`
  strings; the React Native tab reads the JSX's class lists
  (`jsxClassMarkup`). The Inspector maps a React element to source only
  through its class list (`classLiteralFor`, see the Design tab above).
- **Playground header and phones (2026-11-26).** The playground opens in
  the same tab, like any page (2026-11-27, the user: "change the redirect
  playground back to navigate"; from 2026-11-26 every `SiteLink` to it
  opened a new tab). The header's back button goes back
  (`router.back()`) when the reader came from a page of this site
  (`previousSitePage()` in `lib/location.ts`), else to the docs' home: the
  playground adds no history entries of its own (re-runs are a new iframe,
  Share and loaded examples `replaceState`), so that's a real step back. The
  header is a toolbar: ← + Kbach's logo (+ "Playground" from a 60rem
  header) back to the docs, the examples gallery button with the example's
  name, the HTML / React switch, Layout, ⋯, Share. The header's container
  width decides what folds into ⋯: HTML / React below 40rem (`MoreMenu`'s
  `kind`), the stacked layouts below 30rem. Running the page is the
  preview's: its toolbar ends with Run (only while Auto-run is off, with a
  dot when changes wait), the Auto-run switch and Reload (2026-11-27).
  Reload (`reloadPreview`) remounts the iframe with the same document: the
  page as it last ran, fresh, without taking in changes Auto-run is holding
  (the canvas's "ready" handler only pushes edits made while it loaded when
  Auto-run is on). Under 36rem (one row needs ~35rem with Run showing; at
  25rem, the old breakpoint, a tablet-width pane wrapped Auto-run onto a row
  of its own) the run controls stay on the toolbar's first
  row and the canvas controls drop to a row below (`order-*`). Below `PHONE_MAX` (640px of content, in
  `src/playground/panes.ts` with `SIDE_BY_SIDE_MIN`, shared with the
  loading outline `PlaygroundLoading.tsx` so nothing jumps) the playground
  shows one pane at a time, the preview first, switched by `PhoneBar`
  (`PlaygroundParts.tsx`) at the bottom: Code / Preview with the problem
  and console-error counts, and in Code a row of the keys a phone keyboard
  hides (Tab expands Emmet; buttons `preventDefault` on pointerdown so the
  editor keeps focus). No splitter or layouts there; Wrap defaults on.
  `tests/e2e/playground-phone-bar.mjs`, `playground-layout.mjs`,
  `playground-loading.mjs` and `playground-project.mjs` (the same-tab link
  and the logo button) check it.
- **Playground examples (2026-11-26, rebuilt as pairs the same day).**
  Thirteen examples, one folder each in `content/playground/<n>-<name>/`,
  and every one is the same page twice: `index.html` (+ `script.js` or
  `script.ts`) and `App.jsx` (or `App.tsx`), sharing one `kbach.config.js`
  (the HTML version gets it as a plain page's, `window.kbachConfig = …`,
  and its index.html the tags that load it and the CDN script, when
  examples.ts loads it: see "HTML mode is a plain page").
  `index.html`'s `<title>` names the example ("Navbar: links fold into a menu
  below md" → name and hint); the React version's index.html is made from
  the HTML one's `<html>`, `<title>` and `<body>` tags (`reactIndexFor` in
  `react.ts`). `src/playground/examples.ts` lists them (`Example.html` /
  `Example.react`, `exampleOf`, `isExampleAsIs`); the header's HTML / React
  switch turns the open example into its other version (a page that isn't
  an example is converted, see "HTML ↔ React" below), the gallery (`components/ExamplesGallery.tsx`) has an
  "Open as" HTML / React switch, and `#example=<id>&mode=react` links the
  React one. Blank page is the gallery's first card (every tag, in the kind
  "Open as" picks) and the first item in ⋯ ("New blank page"); both and the
  editor's Clear all go through `blankPage(kind)` in Playground.tsx, which
  also puts `kbach.config.js` back to the default (`defaultConfigFor(mode)`
  in share.ts: `DEFAULT_CONFIG`, or its `window.kbachConfig` form for HTML;
  a fresh page, not the last example's colors; Undo brings it back). The
  gallery's grid sits in a scrolling wrapper so `sm:auto-rows-fr` gives every
  row the tallest card's height (on the scrolling element itself, fr rows
  shared out the dialog's height and one row of results stretched). Each config defines the same mode-following names (surface,
  card, well, line, ink, muted, brand, accent) with its own brand color and
  keyframes, so the pages have no `dark:` twins for them; keep that. They're
  Kbach classes only, and every animation is a class from the config
  (`motion-safe:animate-…`), never a `<style>` block. Things learned
  building them: Kbach writes `translate-*`/`scale-*`/`rotate-*` as
  `transform`, so a keyframe that moves `transform` overrides a centering
  `-translate-x-1/2` while it plays (center with a flex row instead), and
  `both` fill holds the last frame over `hover:` transforms (use
  `backwards`); Kbach's reset doesn't zero `figure`/`blockquote` margins
  (add `m-0`); a CSS animation replays whenever its element comes back from
  `display: none`, so React tabs can keep every panel mounted. Format with
  the folder's `.prettierrc.json` (the playground's Format button uses the
  same options). The gallery's pictures are `public/playground/<id>.jpg` and
  `<id>-dark.jpg` (the HTML version), made by
  `node scripts/example-thumbnails.mjs` after `npm run build`: re-run it
  when an example changes. `tests/e2e/playground-examples-menu.mjs` opens
  every example in both versions (no problems, no console errors, the same
  heading and background) and checks the switches;
  `tests/e2e/playground-examples-work.mjs` uses each one's controls in both
  versions, at a desktop width and (navbar, dashboard, chat) a phone's.
- **The editor as VS Code (2026-11-27).** TypeScript's own language service
  runs in a worker (`src/playground/ts/ts.worker.ts`, `@typescript/vfs`),
  over the reader's files (each code editor's `tsPath`: `/App.jsx`,
  `/script.ts`, `/kbach.config.js`; `PATHS` in `ts/options.ts`, a Vite +
  React tsconfig, strict) and the lib and type files in `public/ts/files.json`
  (`scripts/ts-files.mjs`, run before `next build`/`next dev`, not committed:
  every TypeScript lib file, `@types/react`, `@types/react-dom`, `csstype`,
  `@kbach/react`'s .d.ts, from the installed packages; kept plain JS for
  Node 20). `ts/codemirror.ts` gives completion (with auto-imports: picking
  `useTheme` adds it to the import line; `allowIncompleteCompletions: false`,
  or a worker never got the auto-imports), hover with types and docs,
  problems in .ts/.tsx (JS isn't type-checked, as in VS Code), signature
  help on `(`/`,`, F12 / Ctrl+click go to definition, F2 rename (in the
  file). Class strings stay Kbach's (`inClassText`). Completion asks
  again when an answer comes back for text that's changed (`requeryPlugin`:
  CodeMirror asks once and waits, and the first auto-import lookup is
  slow). `kbach.config.js` completes from `KbachConfig` through its
  `@type` comment. The command palette (`components/CommandPalette.tsx`:
  Ctrl+Shift+P / F1, Ctrl+P for files, `>` switches) lists every playground
  action; Alt+Z wraps, Ctrl+G goes to a line (CodeMirror's Mod-g was find
  next), Alt+click adds a cursor. An arbitrary hex color's swatch
  (`bg-[#ff6600]`) opens the native color picker (one shared input on the
  page, so redrawn swatches don't close it) and writes the color back.
  `tests/e2e/playground-typescript.mjs`, `playground-vscode.mjs`.
- **HTML mode is a plain page, Kbach from its CDN (2026-11-27).** The user:
  "the html version is not correct it can't use kbach config directly and
  need cdn", then "move the config out but import it as script". A plain
  HTML page has no build step and no package imports, so in HTML mode:
  `kbach.config.js` is a plain page's script, `window.kbachConfig = { … };`
  (its `@type` JSDoc line kept, so the editor types it), and `index.html`
  loads it, then the CDN script, at the end of `<head>`:
  `<script src="kbach.config.js">` + `<script src="https://cdn.jsdelivr.net/npm/@kbach/browser">`,
  and its own script with `<script type="module" src="script.js">` (or
  `script.ts`, loaded as it is, the way Vite serves one) before `</body>`
  (the user: "missing the script that make active the JS/TS").
  React mode's `kbach.config.js` is the build plugin's, `module.exports =`;
  the same object, so the switch converts (`configAsScript` /
  `scriptAsConfig` in `src/playground/cdn.ts`; `defaultConfigFor(mode)` in
  share.ts; unit test `tests/cdn.mjs`). The user chose to have the preview
  run the CDN script for real (not the playground's engine imitating it):
  the canvas loads it from jsDelivr, so the HTML preview needs the network,
  as React mode's esm.sh does. What that takes:
  - The preview is an srcdoc with no folder to load `kbach.config.js` from,
    so the canvas gets the file's text in place of its tag
    (`withConfigInline`, where the tag was: a config loaded after the
    script is read too late there too). "Open in a new tab" (one file) gets
    the same; a Download keeps the files apart (see "Share and Download").
    Any change to the file reloads the canvas (`configChanged`: the page
    runs it). `parseConfig` reads both kinds (its START regex takes
    `window.kbachConfig =`) for the playground's own features (kbach.css,
    checks, completions, the native tab).
  - The canvas gets no Kbach CSS in HTML mode (`canvasSheet` in
    Playground.tsx): only `canvasBase()`, the preview's page basics. The CDN
    script styles the page, including classes a script adds later.
    `canvasBase`'s colors are in `:where()` so any class on the body wins:
    `html.dark body` (0,1,2) beat the CDN's `.bg-surface` (0,1,0), its one
    class for a mode-aware color (a CSS variable), and a dark surface showed
    the playground's gray.
  - **`@kbach/browser` crashes in a sandboxed frame:** Kbach's dark-mode
    store (`packages/react/src/darkModeStore.ts`, `storage()`) reads
    `window.localStorage` outside its try, and with no `allow-same-origin`
    that read THROWS, so the script stopped before styling anything. The
    canvas's first `<head>` script, `src/playground/canvas-storage.js`
    (before the page's own scripts; it was inside the runtime, which runs
    after them), puts an in-memory storage in place and seeds
    `kbach-theme` with the preview's mode. "Open in a new tab" (a sandboxed
    frame too) gets it (`exportDocument({ sandboxed })`); a download
    doesn't. The engine bug itself is reported to the user, not fixed here
    (it needs a package release).
  - Dark mode: the runtime's `dark` message also calls
    `window.Kbach.setMode()` and saves `kbach-theme`, only when the moon
    button really changed (`previewDark`): the page also gets the button's
    state when it's ready, which undid a `Kbach.setMode('dark')` the page's
    own script had made. The CDN's rules for `darkMode: 'media'` arrive
    later (`insertRule`, which no mutation shows, and the color variables as
    a `<style>`'s text), so the runtime wraps
    `CSSStyleSheet.prototype.insertRule` and watches `<head>` to re-run
    `applyScheme`. A re-run's scroll spot is set again on load and on
    `Kbach.ready` (the CDN styles the page after it opens), and the scroll
    the browser clamped to a shorter page isn't reported meanwhile.
  - The page's script runs where its tag is: the canvas and "Open in a new tab" put
    `SCRIPT_MARK` in place of the tag (`withScriptMark`) and the compiled
    module there (`canvasDocument` measures the error-line offset at that
    spot); with no tag it doesn't run (`script: null`), as on a real page.
    The JS / TS switch renames the tag (`renameScriptTag`); the examples
    with a script, blank pages and React → HTML get it (`withScriptTag`),
    HTML → React drops it. "Has a script" (reload instead of morph) is now
    the script file with code and its tag, or an inline `<script>` with
    code: the CDN and config tags alone used to make every HTML edit a
    full reload.
  - The editor flags, on their lines: no CDN script, no `kbach.config.js`
    (or own `window.kbachConfig` script), the config loaded after the CDN
    script, or a script with code that no tag loads (`cdnProblems`,
    `scriptProblems`, the HTML tab; long messages wrap with wrap on:
    `.cm-lineWrapping .cm-kb-errmsg`), and an import from `@kbach/…` in an
    HTML page's script (`packageImports`, the Script tab). The TypeScript
    service gets `window.Kbach` / `window.kbachConfig` types
    (`src/playground/ts/browserTypes.ts`, `@kbach/browser` ships none) only
    while an HTML page is open.
  - Older HTML code (share links, saved code) had the build plugin's config
    and no CDN script: upgraded on load (`upgradeHtmlPage`, after
    `ensureDocument`, since an old link may be only a body's markup).
  - Tests that type a page in use `cdnPage(body)` (tests/e2e/example-link.js):
    a snippet alone has no Kbach, as a real page without the script.
  - The HTML examples use `window.Kbach`, not `@kbach/react`: todo, chat
    and Colors define a one-line `cn()` (the editor treats `cn(…)`'s strings
    as classes, like `clsx(…)`); Theme saves and reads the mode through
    `Kbach.setMode` and `kbach-theme`, and its value cells show
    `window.kbachConfig`'s own values with a swatch that is a Kbach class
    (`bg-rose-6`, `bg-[#ffffff]`); Colors lists the 26 families and reads
    each hex from the styled swatch after `Kbach.ready`.
- **Share and Download (2026-11-27).** The user: "when click share make
  new link and redirect and the download make download as zip that keep
  css/script/html in difference place".
  - Share (`share` in Playground.tsx) copies the link, then goes to it:
    `history.pushState` + `location.reload()`, so the page opens from the
    link (as anyone who gets it sees it) and Back returns to the page
    before. A `sessionStorage` flag (`SHARED_KEY`) makes the reopened page
    say "Link copied" (`sharedNotice`, the notice's initial state). Unchanged
    code (the address is already its link) is copied again, no reload.
    Tests click it with `Promise.all([p.waitForEvent('load'), …])`.
  - Download (`download`, `src/playground/projectZip.ts`, `fflate`'s
    `zipSync`) is `<name>.zip` with one folder (the example's name, else
    `kbach-playground`). An HTML page: `index.html` (plus links to
    `kbach.css` and `style.css`), `kbach.config.js`, `kbach.css` (the
    kbach.css tab's text, `css.file`: the generated CSS, so the page is
    styled from the first paint; the CDN script still styles what a script
    adds and runs dark mode; the zip first had only style.css, and the user
    said "it not get the generated css correctly"),
    `script.js` (TypeScript: `script.ts` and the `script.js` it compiles to,
    which index.html is pointed at), `style.css` (canvasBase: the preview's
    page basics) and a README (serve it: module scripts don't load from
    `file://`). A React page: a Vite project as Installation sets one up
    (`package.json` with `@kbach/react` `^KBACH_VERSION`, React ^19.2,
    Vite ^8.4, `@vitejs/plugin-react` ^6.3; `vite.config`, `index.html`
    loading `/src/main`, `src/App`, `src/kbach.css` from the kbach.css tab,
    `kbach.config.js`, `.gitignore`, README). Site addresses
    (`src="/kbach-logo-64.png"`) are made full (`withFullUrls`). "Open in
    a new tab" stays one file (`exportFile`). `playground-examples.mjs` and
    `playground-usability.mjs` unzip it and check each file.
- **`import … from '@kbach/react'` in the playground (2026-11-27), React
  mode only (an HTML page has none, see above).** When App.jsx imports it
  (`usesKbach`), the canvas's
  import map (`importMap(kbach)` in react.ts) points `@kbach/react` at a
  data: URL module (`kbachModuleUrl` in `src/playground/kbachModule.ts`):
  the installed package's own `dist/index.js` (imported `?raw`, so its
  version is the docs' `@kbach/react`), wrapped as ESM with React from the
  import map and `@kbach/core-engine` stubbed (`__esModule: true`, or the
  bundle's interop takes the object as `default`); `disableRuntimeCSS()` (the
  playground makes the CSS, as the build plugin does), the playground's
  kbach.config.js through `applyKbachConfig`, `initKbach()` called. So
  `clsx`, `kb`, `useTheme`, `useColors`, `ThemeProvider` and the dark-mode
  helpers are the real ones. A data: URL because the sandboxed canvas has no
  origin (a module from this site would need CORS); the downloaded file gets
  it too. `canvas-storage.js` gives a page an in-memory `localStorage` /
  `sessionStorage` when the sandbox blocks the real ones (the dark-mode
  store uses it). The wrapper seeds the store with the preview's mode (the
  moon button) before it loads, and the runtime's `dark` message fires a
  `kbach-preview-dark` event the wrapper turns into `setGlobalThemeMode`:
  left alone, the store applied the system's mode as it loaded and the moon
  button stopped working on any page that imports it. The examples use it
  where it replaces code of their own: `clsx` in every React example;
  Theme's mode switch is `useTheme()` and its values `getTheme().colors`;
  Colors' families and hex values come from the palette (`getTheme()`,
  `useColors()`), sorted grays first, then by hue.
  `tests/e2e/playground-kbach-import.mjs`.
- **HTML ↔ React on your own page (2026-11-27).** On a page that isn't an
  example, the HTML / React switch converts (`src/playground/convert.ts`):
  HTML → React writes App.jsx from index.html's body (parsed inert with
  DOMParser; `class` → `className`, `for` → `htmlFor`, `style` → an object,
  kebab-case SVG attributes → camelCase, `value`/`checked` on form fields →
  `defaultValue`/`defaultChecked`). The script (the file and inline ones)
  is parsed with Prettier's Babel or TypeScript parser and sorted
  (`planScript`): `addEventListener` on an element found by id
  (`getElementById`, `querySelector('#id')`, or a top-level name holding
  one) becomes that element's prop (`onClick`, `onInput`, …), and so does an
  inline `onclick="…"` (`this` → `event.currentTarget`); functions and plain
  values (literals, lists, objects, functions) move to the top of the file;
  other top-level names become a `let` up there, assigned in the
  `useEffect` in the script's order along with everything else; imports go
  first. A script it can't parse goes in the `useEffect` whole. React →
  HTML asks the canvas for what React drew (`snapshot` message,
  `renderedMarkup` in Playground.tsx; the runtime answers with `#root`'s
  HTML) and makes it index.html's body, with `REACT_NOTE` in script.js
  saying the logic stayed in App.jsx (a comment-only script counts as no
  script, `hasCode`, so the HTML still morphs); nothing drawn → a new page. Both
  run through Prettier (`format.ts`). A new blank page (gallery card, ⋯) is
  `STARTER_DOCUMENT` in `document.ts` ("Write something here" selected to
  type over); its React version is made by the same converter, so there's
  one source. Clear all still leaves an empty page.
  `playground-examples-menu.mjs` round-trips a page with a label, an input,
  a style attribute and a script through both.
- **Which strings are classes (the editor's checks).** In a script or
  App.jsx: `class`/`className` values, `classList` calls' class arguments
  only (`toggle`'s first; `add`/`remove` while they're plain strings), and
  `cn()`/`clsx()` strings except values: a compared (`x === 'a'`) or joined
  (`'bg-' + name`) string isn't a class list (`src/playground/classStrings.ts`,
  `tests/class-strings.mjs`). `group`, `peer` and `dark` are markers, never
  "unknown" (`MARKER` in `engine.ts`).
- **The reset's tags.** kbach.css's reset keeps only the rules of tags in
  use: index.html's, plus the tags the script writes (`tagsInCode` in
  `canvas.ts`: JSX elements and markup in strings). Without the script's, a
  React page (index.html is just `<div id="root">`) had blue underlined
  links and grey buttons; `playground-examples-menu.mjs` now checks every
  example's two versions for the same height and no unstyled links or
  buttons.

## Build and deploy

`npm run build` writes `out/`: `index.html` (the home page, `/`),
`<slug>.html` for every docs page and `playground.html` (each with its own
title, description and share tags), `404.html` (`noindex`), `robots.txt`,
`sitemap.xml`, `search.json`, `llms.txt` and `llms-full.txt`. A static host
serves `/installation` from `installation.html` (most do; `npm run start`
does the same). The `<slug>/` folders beside them only hold Next.js's
prefetch files, and `playground/` also the gallery's thumbnails
(`public/playground/`): with no `index.html` in them, a request for
`/playground` still gets `playground.html`.

Set the site's address when building for production:

```sh
KBACH_DOCS_URL=https://docs.example.com npm run build
```

With it, every page also gets `canonical`, `og:url` and the share picture
(`og:image`, which needs a full address), and `sitemap.xml` lists every
page: `/` first, the docs in sidebar order, `/playground` last, each but
the home page with `<lastmod>` (the date of its "Last updated" line, from
git), moved pages' old addresses left out (reworked 2026-11-27,
`src/app/sitemap.xml/route.ts`). `robots.txt` names the sitemap.
Without it those are left out (the sitemap is empty). `page-meta.mjs`
checks both kinds of build: run it on a production build too after
changing any of this.

**Live site: https://kbach.vercel.app** (since 2026-11-25), the Vercel
project `kbach` in the `cyclone-studio` team, connected to this
repository: every push to `main` builds and publishes it, other branches
get a preview. The build follows `vercel.json` (`npm ci`, `npm run build`,
the files in `out/`, no framework preset) and its rewrite, which serves
`/installation` from `installation.html` without redirecting any
`.html` address (Google's verification file must load as it is; that's why
it's not `cleanUrls`). The project's environment sets
`KBACH_DOCS_URL=https://kbach.vercel.app` and `VERCEL_DEEP_CLONE=true` (the
whole git history, for each page's "Last updated" date; a shallow clone
would date old pages today). Previews sit behind the team's Vercel login;
production is public.

To publish without a push, build here and upload `out/`:

```sh
KBACH_DOCS_URL=https://kbach.vercel.app npm run build
node scripts/deploy-vercel.mjs --prod     # leave out --prod for a preview
```

The script refuses an `out/` built without `KBACH_DOCS_URL`, and copies
`out/` to a temp folder outside the repo first (run inside the repo, the CLI
uploads and builds the whole repo). The
package `homepage` fields and the AI rules' last line point to this site.

**Search engines.** With `KBACH_DOCS_URL` set, pages also carry schema.org
JSON-LD (`src/lib/structuredData.tsx`, added 2026-11-25): `/` describes
the site (`WebSite` named "Kbach", with "Kbach Docs" and
"Kbach CSS" as other names, the `Organization` and its logo, and
`SoftwareSourceCode`); each docs page has a `BreadcrumbList` (Kbach Docs ›
section › page; a section links to its first page) and a
`TechArticle` with its date. Moved pages and the playground have none.
`tests/e2e/page-meta.mjs` checks both kinds of build. Search Console and
Bing Webmaster Tools verification is a file in `public/` (Google's
`google<id>.html`, Bing's `BingSiteAuth.xml`), served at the site's root;
then submit `https://kbach.vercel.app/sitemap.xml` in each.

`llms.txt` and `llms-full.txt` are for AI assistants (llmstxt.org). The
rules in `llms.txt` are the first ` ```text ` block of
`content/ai-assistants.md`. Their one source is `AI_RULES` in the Kbach
repo's `packages/cli/src/aiRules.ts` (the CLI's `ai` command writes the
same rules into a project's AGENTS.md), and every package ships them in its
`llms.txt`. `tests/e2e/ai-rules.mjs` fails when the page's copy
differs from the installed `@kbach/react`'s `llms.txt`: after a release that
changes them, raise the version and copy them in. Added 2026-11-17 after the user gave Gemini a Kbach task
and it wrote Tailwind shades (`text-amber-700`) and put `window.kbachConfig`
after the CDN script; `content/common-mistakes.md` covers those mistakes.

The share picture is `public/og.png` (1200×630), made by
`node scripts/og-image.mjs` from the logo and the headline. Re-run it
after changing either.

## Tests

- `npm test`: syntax highlighting.
- `npm run lint`: TypeScript.
- `npm run test:e2e`: builds the site, serves `out/` on port 5176
  (`scripts/serve.mjs`) and runs every suite in `tests/e2e/`
  (`npm run test:e2e -- footer` runs only the suites whose name contains
  `footer`; `node tests/e2e/run.mjs` runs them on the existing build). Run
  from a shell at `C:\` on Windows if npm misbehaves with a lowercase `c:`
  working directory.
- No-browser suites, quick to run on their own with `node`:
  - `tests/e2e/api-reference.mjs`: every export and subpath export of
    `@kbach/react` and `@kbach/react-native` is named on its API page.
    Fails when a package gains an export without docs.
  - `tests/e2e/ai-rules.mjs`: the AI rules on "Using AI assistants" match
    the installed `@kbach/react`'s `llms.txt`.
- `tests/e2e/page-meta.mjs` also checks the site is English only: no
  language switch or Khmer text, no `km/` in the build, an old `/km/…`
  address landing on the English page, and the `vercel.json` redirect.

## How the pages are written

The user's standard (2026-11-17): "100% legit about Kbach, easy to
understand." (It said "in both languages" until Khmer was removed on
2026-11-27.)

- **Every claim is checked** against the code, the package AGENTS.md
  files, or the engine itself (run the class through `generate_css` /
  `resolve_style_json` from `@kbach/core-engine/node`, installed here). Sizes,
  versions and file names in the text are measured, not remembered.
- **Kbach on its own terms.** Explain every idea from zero, for someone
  who never used Tailwind CSS. Tailwind is named only on
  `coming-from-tailwind`, in one section of the introduction, in the FAQ,
  and in the trademark notice.
- **Say plainly what a platform can't do.** A page about a feature says
  when it doesn't work on React Native or in plain HTML.
- **Plain words:** short sentences, an example before the explanation,
  and a technical term explained the first time it appears. Avoid
  jargon such as "main axis" or "stacking context" when a plain phrase
  works.
- **A class name never breaks across lines** (2026-11-27): on a phone,
  `bg-` / `blue-6` reads as two classes. Inline code of 24 characters or
  fewer with no space is `whitespace-nowrap` (`renderInline` in
  `src/markdown/render.tsx`; longer code still wraps anywhere, so nothing
  scrolls sideways); a page's description keeps its hyphenated words whole
  (`wholeWords` in `DocPageView.tsx`); the home page's sentences put the
  class names and commands they mention in code (`withCode` and
  `CODE_IN_TEXT` in `Landing.tsx`: add a new one there), and its class pill
  wraps between classes only. `tests/e2e/whole-class-names.mjs` checks it,
  with the home docs list's 32px phone rows and the playground toolbar's
  36rem breakpoint.

## When the packages change

A new export, option, variant or changed default belongs on the matching
page, in the same change. The API suite catches missing
exports; nothing catches a changed behavior, so check the page by hand.
