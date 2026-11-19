"use client";

import { useState, type ReactNode } from "react";
import { clsx, defaultTheme } from "@kbach/react";
import { KBACH_VERSION, NAV } from "../lib/docs";
import { useT } from "../lib/i18n";
import { SiteLink } from "./SiteLink";
import { usePageInfo } from "./site/SiteData";
import { CodeLines, CopyButton } from "./CodeBlock";
import { BrandIcon, type Brand } from "./BrandIcon";
import { Reveal } from "./Motion";
import { WorksWith } from "./WorksWith";
import { ArrowRightIcon, ChevronRightIcon } from "./icons";

// The home page (/en, /km). It shows what Kbach does instead of describing
// it: one class and the three things the engine makes from it, a class read
// word by word, the whole palette, a mistake being caught, the three ways in,
// and the docs' contents. Each section has its own form (2026-11-19: the user
// found the page before it "uses the same thing over and over", a card grid
// in every section).
//
// Everything shown is real: the outputs and the warning are the engine's and
// the build plugin's own, and tests/e2e/home.mjs checks them against the
// engine (HERO_CLASS, OUTPUTS, WORDS, the warning).
//
// Code to show is kept in plain strings, never template literals: the build
// plugin reads template literals and className=, and these are text, not
// classes for this page.

export const HERO_CLASS = "p-6 rounded-2xl bg-blue-6 md:p-10";

/** What the engine makes of HERO_CLASS in each place Kbach runs. */
export const OUTPUTS: { id: string; label: string; where: string; lang: string; code: string; note: string }[] = [
  {
    id: "web",
    label: "Web",
    where: "A CSS file",
    lang: "css",
    code: [
      ".p-6 { padding: 24px }",
      ".rounded-2xl { border-radius: 1rem }",
      ".bg-blue-6 {",
      "  background-color: rgba(59,130,246,…)",
      "}",
      "@media (min-width: 768px) {",
      "  .md\\:p-10 { padding: 40px }",
      "}",
    ].join("\n"),
    note: "Written when you build, by the Vite or PostCSS plugin.",
  },
  {
    id: "native",
    label: "React Native",
    where: "A style object",
    lang: "js",
    code: ["{", "  padding: 24,", "  borderRadius: 16,", "  backgroundColor: '#3b82f6',", "}"].join("\n"),
    note: "Made as the element renders. On a screen 768 wide or more, padding is 40.",
  },
  {
    id: "html",
    label: "Plain HTML",
    where: "A script tag",
    lang: "html",
    code: [
      '<script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>',
      "",
      '<div class="' + HERO_CLASS + '">',
      "  …",
      "</div>",
    ].join("\n"),
    note: "The script writes the same CSS into the page as it loads. No build step.",
  },
];

/** A class read word by word: what before the colon means, and what the word sets. */
export const WORDS: { variant?: string; utility: string; means: string }[] = [
  { utility: "p-6", means: "24px of padding on every side" },
  { utility: "rounded-2xl", means: "Corners rounded by 16px" },
  { utility: "bg-blue-6", means: "A blue background, shade 6 of 12" },
  { variant: "md:", utility: "p-10", means: "40px of padding, from 768px wide" },
  { variant: "dark:", utility: "bg-gray-10", means: "A dark gray background in dark mode" },
  { variant: "hover:", utility: "opacity-90", means: "90% opacity under the pointer" },
];

/** The palette strip's columns: the grays, then the colors around the wheel. */
const FAMILIES = [
  "gray", "slate", "zinc", "neutral", "stone", "taupe", "mauve", "mist", "olive",
  "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan",
  "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose",
];
const SHADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const PLATFORMS: { brand: Brand; name: string; text: string; command: string; prompt: string; href: string; link: string }[] = [
  {
    brand: "react",
    name: "React (web)",
    text: "Vite, Next.js or any PostCSS setup. A plugin writes a real CSS file when you build.",
    prompt: "$",
    command: "npm install @kbach/react",
    href: "/web",
    link: "Set up React",
  },
  {
    brand: "react",
    name: "React Native",
    text: "Android, iOS and Expo. A Babel plugin gives each element its style object as it renders.",
    prompt: "$",
    command: "npm install @kbach/react-native",
    href: "/react-native",
    link: "Set up React Native",
  },
  {
    brand: "html5",
    name: "Plain HTML",
    text: "One script tag from a CDN. No install, no build step, no React.",
    prompt: "<>",
    command: '<script src="https://cdn.jsdelivr.net/npm/@kbach/browser"></script>',
    href: "/plain-html",
    link: "Use the script",
  },
];

/** Where mistakes are caught (the terminal is shown beside the list). */
const CATCHERS = [
  "The terminal, while npm run dev runs (Vite, Next.js, PostCSS).",
  "VS Code: completion, hover and a wavy line under the class.",
  "The playground, with Fix all for the most common mistake.",
  "AI assistants: npx @kbach/cli ai gives them Kbach's rules.",
];

export const INIT_COMMAND = "npx @kbach/cli init";

// ---------------------------------------------------------------------------

/**
 * Every section after the hero, on one rhythm, like marks on a ruler: a line
 * above, 96px above and below, the same heading and intro, then 48px to the
 * content. Optional: something at the heading's right (a link).
 */
function Section({ title, intro, aside, children }: { title?: ReactNode; intro?: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-t border-line py-24">
      {title && (
        <div className="mb-12 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl">{title}</h2>
            {intro && <p className="mt-4 text-base leading-7 text-pretty text-muted">{intro}</p>}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

function Hero() {
  const t = useT();
  const rise = `animate-[kbd-fade-up_800ms_cubic-bezier(0.22,1,0.36,1)_both]`;
  return (
    <section className="pt-14 pb-24 sm:pt-20">
      {/* the text, and beside it (below it on a narrow screen) what Kbach works with, as a map */}
      <div className="grid items-center gap-x-12 gap-y-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className={clsx("inline-flex items-center gap-2 font-mono text-xs text-muted", rise)}>
            <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
            {t("Open source")} · v{KBACH_VERSION}
          </p>
          <h1 className={clsx("mt-5 font-display text-[2.6rem] leading-[1.03] font-semibold tracking-tight text-balance text-ink sm:text-6xl xl:text-7xl [animation-delay:80ms]", rise)}>
            {t("Write a class once.")}{" "}
            <span className="bg-linear-to-r from-bronze via-gold to-ember bg-clip-text text-transparent dark:from-gold dark:via-ember dark:to-[#f3e2b8]">
              {t("Style web, iOS, Android and HTML.")}
            </span>
          </h1>
          <p className={clsx("mt-6 max-w-2xl text-lg leading-8 text-pretty text-muted [animation-delay:160ms]", rise)}>
            {t("Kbach styles React, React Native and plain HTML pages with short class names. One Rust engine reads them, so a class means the same thing everywhere.")}
          </p>
          <div className={clsx("mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 [animation-delay:240ms]", rise)}>
            <SiteLink
              href="/introduction"
              className="group inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-ink shadow-lg shadow-gold/25 transition hover:opacity-90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {t("Get started")} <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </SiteLink>
            <SiteLink href="/playground" className="text-sm font-semibold text-ink underline decoration-gold/50 decoration-2 underline-offset-[6px] transition-colors hover:decoration-gold">
              {t("Open the playground")}
            </SiteLink>
          </div>
          <div className={clsx("mt-8 [animation-delay:320ms]", rise)}>
            <div className="inline-flex max-w-full items-center gap-3 border-b border-line pb-2 font-mono text-sm">
              <span className="text-accent select-none" aria-hidden="true">
                $
              </span>
              <code data-init="" className="truncate text-ink">{INIT_COMMAND}</code>
              <CopyButton text={INIT_COMMAND} tone="page" className="shrink-0" />
            </div>
            <p className="mt-2 text-[13px] text-faint">{t("Sets up Vite, Next.js, Expo or React Native: installs the package, adds the plugin, imports the CSS.")}</p>
          </div>
        </div>
        <div className={clsx("min-w-0 [animation-delay:200ms]", rise)}>
          <WorksWith />
        </div>
      </div>
      <div className={clsx("[animation-delay:420ms]", rise)}>
        <EngineDiagram />
      </div>
    </section>
  );
}

/** One class, and lines down to what the engine makes of it in each place Kbach runs. */
function EngineDiagram() {
  const t = useT();
  return (
    <figure className="mx-0 mt-20 mb-0" aria-label={t("One class, three outputs")}>
      <div className="flex justify-center">
        <code data-hero-class="" className="max-w-full rounded-full border border-gold/50 bg-card px-5 py-3 text-center font-mono text-[13px] text-ink shadow-md shadow-gold/10 sm:text-base">
          <span className="text-faint">class=&quot;</span>
          <span className="text-accent">{HERO_CLASS}</span>
          <span className="text-faint">&quot;</span>
        </code>
      </div>
      {/* wide screens: a line down from the class, across, and down to each output. The arrows sit in
          the same grid as the outputs (three columns, the same gap), so each lands on its column's
          middle, and the line across runs from the first middle to the last. */}
      <div className="hidden lg:block" aria-hidden="true">
        <div className="mx-auto h-10 w-px bg-gold/50" />
        <div data-arrows="" className="relative grid grid-cols-3 gap-x-8">
          <div className="absolute top-0 h-px bg-gold/50" style={{ left: "calc((100% - 4rem) / 6)", right: "calc((100% - 4rem) / 6)" }} />
          {OUTPUTS.map((o) => (
            <div key={o.id} className="flex flex-col items-center">
              <div className="h-7 w-px bg-gold/50" />
              <ArrowHead />
            </div>
          ))}
        </div>
      </div>
      {/* four rows shared by the three columns (subgrid): label, title, panel, note line up, and the
          panels are one height */}
      <div className="mt-2 grid gap-6 lg:mt-3 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
        {OUTPUTS.map((o) => (
          <div key={o.id} data-output={o.id} className="min-w-0 lg:row-span-4 lg:grid lg:grid-rows-subgrid">
            {/* a phone, the outputs one under another: an arrow down into each, as the lines do on a wide screen */}
            <div data-phone-arrow="" className="mb-3 flex flex-col items-center lg:hidden" aria-hidden="true">
              <div className="h-8 w-px bg-gold/50" />
              <ArrowHead />
            </div>
            <p className="text-center text-xs font-semibold tracking-[0.12em] text-accent uppercase">{t(o.label)}</p>
            <p className="mt-1 text-center font-display text-lg font-semibold text-ink">{t(o.where)}</p>
            <div className="mt-4 overflow-hidden rounded-xl border border-line bg-snippet [&_pre]:py-3 [&_pre]:text-[12px] [&_pre]:leading-5">
              {/* the HTML sample's script line is long: it wraps (the CSS and the style object fit) */}
              <CodeLines code={o.code} lang={o.lang} wrap={o.id === "html"} />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{t(o.note)}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}

/** The point of a line, facing down. */
function ArrowHead() {
  return (
    <svg viewBox="0 0 10 6" className="-mt-px h-1.5 w-2.5 text-gold/70" fill="currentColor" aria-hidden="true">
      <path d="M0 0h10L5 6z" />
    </svg>
  );
}

/** A class read word by word. */
function Anatomy() {
  const t = useT();
  return (
    <Section title={t("Read a class like a sentence")} intro={t("Each word sets one thing. The part before a colon says when it applies; the number says how much.")}>
      <ol className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
        {WORDS.map((w, n) => (
          <li key={w.utility} data-word="">
            <Reveal delay={n * 70}>
              {/* one class never breaks across lines: smaller on a narrow phone instead, so the longest fits its column */}
              <code className="font-mono text-[13px] whitespace-nowrap text-ink min-[360px]:text-[15px] sm:text-lg lg:text-xl">
                {w.variant && <span className="text-accent">{w.variant}</span>}
                {w.utility}
              </code>
              <span className="mt-3 block h-0.5 w-full rounded-full bg-linear-to-r from-gold to-gold/10" aria-hidden="true" />
              <span className="mt-3 block text-sm leading-6 text-muted">{t(w.means)}</span>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/** Every color family and shade, as one strip. */
function PaletteStrip() {
  const t = useT();
  const colors = defaultTheme.colors as Record<string, string>;
  return (
    <Section
      title={t("26 colors, 12 shades each")}
      intro={t("Shade 1 is the lightest and 12 the darkest: bg-blue-1 to bg-blue-12. The same names work on every platform.")}
      aside={
        <SiteLink href="/colors" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
          {t("See every color")} <ArrowRightIcon />
        </SiteLink>
      }
    >
      <div className="grid grid-flow-col auto-cols-fr gap-0.5 sm:gap-1" aria-hidden="true">
        {FAMILIES.map((family) => (
          <div key={family} title={family} className="grid gap-0.5 sm:gap-1">
            {SHADES.map((shade) => (
              <span key={shade} data-swatch="" className="block h-3 rounded-[3px] sm:h-4 lg:h-5" style={{ backgroundColor: colors[family + "-" + shade] }} />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between font-mono text-[11px] text-faint" aria-hidden="true">
        <span>gray</span>
        <span>rose</span>
      </div>
    </Section>
  );
}

/** Where a mistake gets its name, beside the terminal saying it. */
function Mistakes() {
  const t = useT();
  return (
    <section className="grid items-center gap-12 border-t border-line py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl">{t("A wrong class gets a name, not a blank space")}</h2>
        <p className="mt-4 text-base leading-7 text-pretty text-muted">
          {t("An unknown class would leave an element unstyled, without a word. Kbach says which class, and the one you meant, wherever you work:")}
        </p>
        <ul className="mt-6 space-y-3">
          {CATCHERS.map((c) => (
            <li key={c} className="flex gap-3 text-sm leading-6 text-ink/85">
              <span className="mt-2.5 size-1.5 shrink-0 rotate-45 bg-gold" aria-hidden="true" />
              {t(c)}
            </li>
          ))}
        </ul>
        <SiteLink href="/common-mistakes" className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
          {t("Common mistakes")} <ArrowRightIcon />
        </SiteLink>
      </div>
      <Terminal />
    </section>
  );
}

/** The build plugin's real warning (vite-plugin/unknownClassWarnings.ts), as a terminal shows it. */
function Terminal() {
  const t = useT();
  return (
    <div className="overflow-hidden rounded-2xl bg-code font-mono text-[12.5px] leading-6 text-code-ink shadow-2xl shadow-black/20 ring-1 ring-white/5">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5 font-sans text-xs text-[#8e9ea5]">
        <span className="size-2.5 rounded-full bg-white/15" aria-hidden="true" />
        {t("Terminal")}
      </div>
      <div data-terminal="" className="space-y-1 overflow-x-auto px-5 py-5">
        <p>
          <span className="text-[#e2c27f]">$</span> npm run dev
        </p>
        <p className="text-[#8e9ea5]">…</p>
        <p className="whitespace-pre-wrap">
          <span className="font-semibold text-[#a6dba1]">→ [Kbach]</span> <span className="text-[#8e9ea5]">Unknown class</span>{" "}
          <span className="text-[#e5a07e]">bg-blue-600</span> <span className="text-[#8e9ea5]">— did you mean</span> <span className="text-[#e5a07e]">bg-blue-7</span>
          <span className="text-[#8e9ea5]">? Kbach color shades run 1–12, not 50–950.</span>
        </p>
        <p className="pl-[2ch]">
          <span className="font-semibold">at</span> <span className="text-[#8fc7d9]">src/Card.tsx</span>
          <span className="text-[#a6dba1]">:4:28</span>
        </p>
      </div>
    </div>
  );
}

/** The three ways in, side by side, split by lines. */
function Platforms() {
  const t = useT();
  return (
    <Section title={t("Three ways in")}>
      {/* four rows shared by the three columns (subgrid): the names, texts, commands and links line up */}
      <div className="grid divide-y divide-line lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {PLATFORMS.map((p) => (
          <div key={p.name} data-platform="" className="min-w-0 py-8 first:pt-0 last:pb-0 lg:row-span-4 lg:grid lg:grid-rows-subgrid lg:px-8 lg:py-0 lg:first:pl-0 lg:last:pr-0">
            <p className="flex items-center gap-2.5 text-lg font-semibold text-ink">
              <BrandIcon brand={p.brand} className="text-xl" />
              {t(p.name)}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">{t(p.text)}</p>
            <div className="mt-5 flex min-w-0 items-center gap-2 font-mono text-[12.5px]">
              <span className="text-accent select-none" aria-hidden="true">
                {p.prompt}
              </span>
              <code className="min-w-0 flex-1 truncate text-ink">{p.command}</code>
              <CopyButton text={p.command} tone="page" className="shrink-0" />
            </div>
            <SiteLink href={p.href} className="mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-accent">
              {t(p.link)} <ArrowRightIcon />
            </SiteLink>
          </div>
        ))}
      </div>
    </Section>
  );
}

/** The docs as a book's table of contents: every part, numbered, with its pages. */
function Contents() {
  const t = useT();
  return (
    <Section title={t("Everything in the docs")} intro={t("Seven parts, from the first install to the API.")}>
      <ol className="grid items-start gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {NAV.map((section, n) => (
          <Part key={section.title} number={n + 1} title={section.title} pages={section.pages} />
        ))}
      </ol>
    </Section>
  );
}

/** How many pages a part lists before "Show more": the contents stay compact. */
const SHOWN = 5;

/**
 * One part of the contents: its title, then its first pages, and the rest
 * behind "Show N more". The rest are in the page all along, only hidden, so
 * every page is still a link in the built HTML.
 */
function Part({ number, title, pages }: { number: number; title: string; pages: string[] }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  // a part folds only when that hides two pages or more: a button for one line saves nothing
  const more = pages.length - SHOWN >= 2 ? pages.length - SHOWN : 0;
  const id = "part-" + number;
  return (
    <li data-part="">
      <div className="flex items-baseline gap-3 border-b border-line pb-3">
        <span className="font-mono text-sm text-accent">{String(number).padStart(2, "0")}</span>
        <SiteLink href={"/" + pages[0]} className="font-display text-xl font-semibold text-ink transition-colors hover:text-accent">
          {t(title)}
        </SiteLink>
      </div>
      <ul id={id} className="mt-3 grid gap-1 pl-9">
        {pages.map((slug, i) => (
          <li key={slug} hidden={more > 0 && !open && i >= SHOWN}>
            <SiteLink href={"/" + slug} className="text-sm text-muted transition-colors hover:text-accent">
              <PageName slug={slug} />
            </SiteLink>
          </li>
        ))}
      </ul>
      {more > 0 && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="mt-2 ml-9 inline-flex items-center gap-1 rounded text-[13px] font-medium text-accent transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {open ? t("Show fewer") : t("Show {n} more").replace("{n}", String(more))}
          <ChevronRightIcon className={clsx("text-xs transition-transform", open ? "-rotate-90" : "rotate-90")} />
        </button>
      )}
    </li>
  );
}

function Closing() {
  const t = useT();
  return (
    <Section>
      <SiteLink href="/introduction" className="group inline-block font-display text-4xl font-semibold tracking-tight text-balance text-ink sm:text-6xl">
        {t("Start with the introduction")}{" "}
        <ArrowRightIcon className="inline text-accent transition-transform group-hover:translate-x-2" />
      </SiteLink>
      <p className="mt-6 text-base text-muted">
        {t("Or try it first:")}{" "}
        <SiteLink href="/playground" className="font-semibold text-ink underline decoration-gold/50 decoration-2 underline-offset-4 hover:decoration-gold">
          {t("the playground runs the real engine in your browser")}
        </SiteLink>
        .
      </p>
    </Section>
  );
}

/** A docs page's short name (the sidebar's), in the page's language. */
function PageName({ slug }: { slug: string }) {
  return <>{usePageInfo(slug)?.nav ?? slug}</>;
}

/**
 * Light from the top of the home page, and a faint grid that fades out.
 * Full window width, behind everything: inside the page's 90rem column it
 * ended in a visible edge on a wide screen.
 */
export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(60rem_28rem_at_50%_0%,rgb(199_162_93/0.20),transparent_70%)]" />
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,var(--grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-line)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(50rem_26rem_at_50%_0%,black,transparent)] [--grid-line:rgb(127_127_127/0.12)]" />
    </div>
  );
}

export function Landing() {
  return (
    <div className="pb-8">
      <Hero />
      <Anatomy />
      <PaletteStrip />
      <Mistakes />
      <Platforms />
      <Contents />
      <Closing />
    </div>
  );
}
