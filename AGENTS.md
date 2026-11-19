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
   (export default { darkMode, theme, extend }).
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

Full documentation: https://github.com/semsakadanupol/kbach
<!-- kbach:ai-rules:end -->

# apps/kbach-docs — the Kbach documentation site

The official docs: a Next.js app (App Router) styled with `@kbach/react`,
with a small Markdown reader of its own. It builds to plain files (a
static export: one HTML file per page, in English and Khmer) that any
static host serves. It's the only app under `apps/` that is tracked in
git; the others are local sandboxes.

History: until 2026-11-19 the docs were a Vite app in `apps/kbach-docs`, with a
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
| A page's text | `content/<slug>.md`, and the Khmer `content/km/<slug>.md` |
| The sidebar's order and sections | `NAV` in `src/lib/docs.ts` |
| A word of the interface in Khmer | `src/lib/km.ts` (rules in [KHMER.md](KHMER.md)) |
| The home page | `src/components/Landing.tsx` |
| The header, phone menu, footer | `src/components/site/Header.tsx`, `MobileNav.tsx`, `Footer.tsx` |
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
  page is under its language, English too (the user's choice, 2026-11-19):
  - `[lang]/` — `/en` and `/km`, `/<lang>/<slug>`, `/<lang>/playground`,
    `/<lang>/search.json`. `[lang]/layout.tsx` is the root layout, so the
    built file's `<html lang>` is the page's language.
  - `(start)/` — `/` alone, with its own small root layout: it sends the
    reader to `/en` or `/km` (the language they used last, which
    `Shell.tsx` saves as `kbach-docs-language`, else Khmer when the browser
    asks for it, else English; a meta refresh to `/en` without JavaScript).
  - `global-not-found.tsx` — `404.html`, for any other address. It picks
    English or Khmer from the address in the browser, and sends an address
    without a language (`/installation`, an old link from before 2026-11-19)
    to the same page under `/en` before anything shows.
  - `llms.txt/`, `llms-full.txt/`, `robots.txt/`, `sitemap.xml/` — files
    made at build time (route handlers)

  The route files are a few lines each: they pass their language to the
  shared code in `src/app/_site/` (a `_` folder is not a route).
  `pages.tsx` there says what each kind of page is; `layout.tsx` wraps
  every page.
- **Server and browser.** `src/lib/content.ts` reads `content/` from disk
  at build time (server only). The browser never reads files: each page
  gets its own parsed Markdown as a prop, every page gets the docs' page
  names through `SiteDataProvider` (`components/site/SiteData.tsx`), and
  search loads `/en/search.json` (or `/km/search.json`) when it first opens.
  Components marked `'use client'` run in the browser too; anything that
  reads `window` or `localStorage` does so in an effect, after the page
  starts, so the built HTML and the browser's first render agree.
- **Language.** `src/lib/locale.ts` has the plain functions (`localHref`,
  `translate`, …); `src/lib/i18n.tsx` has the hooks components use:
  `useLocale()`, `useT()` (an interface word in the page's language),
  `useHref()`. Links inside the site are `<SiteLink href="/installation">`
  (`components/SiteLink.tsx`): written without a language, as in the
  Markdown pages, it goes to `/en/installation` on an English page and
  `/km/installation` on a Khmer one. The language switch loads the other
  language's page (with its `?tab=` and `#section`).
- **The site frame.** `components/site/Shell.tsx` is around every page: the
  header, phone menu and search, Ctrl+K, the page-change bar, the browser
  bar's color, and jumping to a `#section` after a page opens. The
  playground gets none of it (full screen).
- **CSS.** `src/app/globals.css` has the two Kbach markers: Kbach's
  PostCSS plugin (`postcss.config.mjs`) fills them on every build from the
  classes in `src/` and `kbach.config.js`; nothing generated is committed.
  Below the markers, a few hand-written page-wide rules (scrollbars,
  selection). `src/styles/motion.css`, `editor.css` and `khmer.css` are
  plain CSS (the plugin leaves files without markers alone). The plugin
  scans `className=`, `clsx()`-style calls and template literals, not
  plain strings: a class kept in a `const x = "..."` gets no CSS (write it
  as a template literal).
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
- **Moved pages:** `/en/cdn` → `/en/plain-html`, `/en/tailwind-differences` →
  `/en/coming-from-tailwind` (the same in Khmer) (`REDIRECTS` in `src/lib/docs.ts`). A static
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
  the plain page on the right. A label's width depends on its language,
  the font and the reader's text size, so the map also measures: after it
  draws and on any resize, a label that would cross the box's edge, or a
  package label that would touch the engine, is nudged back, and the
  lines run to the labels' measured middles (`Fit` in WorksWith.tsx).
  `home.mjs` checks fit, overlap and line ends at 320px, in Khmer and
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
  `kbach.config.js`, then two read-only outputs: `kbach.css` (what the
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
  don't have it. The playground offers one example on purpose
  (`src/playground/examples.ts`); there's no examples menu.

## Build and deploy

`npm run build` writes `out/`: `en/<slug>.html` and `km/<slug>.html` for
every page (its own title, description, `lang` and share tags),
`index.html` (`/`, which picks a language), `404.html` (`noindex`),
`robots.txt`, `en/search.json`, `km/search.json`, `llms.txt` and
`llms-full.txt`. A static host serves `/en/installation` from
`en/installation.html` (most do; `npm run start` does the same).

Set the site's address when building for production:

```sh
KBACH_DOCS_URL=https://docs.example.com npm run build
```

With it, every page also gets `canonical`, `og:url`, the share picture
(`og:image`, which needs a full address) and `hreflang` alternates (en,
km, x-default), and `sitemap.xml` lists every page in both languages.
Without it those are left out (the sitemap is empty).

`llms.txt` and `llms-full.txt` are for AI assistants (llmstxt.org). The
rules in `llms.txt` are the first ` ```text ` block of
`content/ai-assistants.md`, which is itself a copy of `AI_RULES` in
`packages/cli/src/aiRules.ts`, the one source (the CLI's `ai` command writes
the same rules into a project's AGENTS.md). Change the rules there, then run
`node scripts/sync-ai-rules.mjs` from the repository root;
`tests/e2e/ai-rules.mjs` fails until the copies match. Added 2026-11-17 after the user gave Gemini a Kbach task
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
  (`npm run test:e2e -- khmer` runs only the suites whose name contains
  `khmer`; `node tests/e2e/run.mjs` runs them on the existing build). Run
  from a shell at `C:\` on Windows if npm misbehaves with a lowercase `c:`
  working directory.
- No-browser suites, quick to run on their own with `node`:
  - `tests/e2e/khmer-content.mjs`: every Khmer page against its English
    one (section ids, code blocks and previews character for character,
    links, tabs). Fails when an English page changed and its Khmer page
    didn't.
  - `tests/e2e/api-reference.mjs`: every export and subpath export of
    `@kbach/react` and `@kbach/react-native` is named on its API page, in
    both languages. Fails when a package gains an export without docs.

## How the pages are written

The user's standard (2026-11-17): "100% legit about Kbach, easy to
understand, in both languages."

- **Every claim is checked** against the code, the package AGENTS.md
  files, or the engine itself (run the class through `generate_css` /
  `resolve_style_json` from `packages/core-engine/dist-node`). Sizes,
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
- **Both languages in the same change**, following
  [KHMER.md](KHMER.md).

## When the packages change

A new export, option, variant or changed default belongs on the matching
page in both languages, in the same change. The API suite catches missing
exports; nothing catches a changed behavior, so check the page by hand.
