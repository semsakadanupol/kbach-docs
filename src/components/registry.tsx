'use client';

import { lazy, Suspense, type ComponentType } from 'react';
import { ClientOnly } from './ClientOnly';
import { SiteLink } from './SiteLink';
import { Palette } from './Palette';
import { ClassTableFrame } from './ClassTableFrame';
import { expandClasses } from '../reference/expand';
import { Logo } from './Logo';
import { PlaygroundLoading } from './PlaygroundLoading';
// The playground brings a whole code editor (CodeMirror), so it loads only
// on the page that uses it.
const LazyPlayground = lazy(() => import('./Playground').then((m) => ({ default: m.Playground })));

// Reference tables run the engine with Kbach's default theme: also loaded on demand.
const LazyClassTable = lazy(() => import('./ClassTable'));

function Classes({ args }: { args: string }) {
  // the same table, class names in place, while its code loads: nothing shifts
  const frame = <ClassTableFrame rows={expandClasses(args).map((cls) => ({ cls }))} />;
  return (
    <ClientOnly fallback={frame}>
      <Suspense fallback={frame}>
        <LazyClassTable args={args} />
      </Suspense>
    </ClientOnly>
  );
}

/** The playground, with its outline while CodeMirror and the engine load (it runs in the browser only). */
export function Playground() {
  return (
    <ClientOnly fallback={<PlaygroundLoading />}>
      <Suspense fallback={<PlaygroundLoading />}>
        <LazyPlayground />
      </Suspense>
    </ClientOnly>
  );
}
import { ArrowRightIcon, CodeIcon, ExternalIcon, GlobeIcon, LayersIcon, PaletteIcon, PhoneIcon, TerminalIcon } from './icons';

const CARDS = [
  { href: '/web', icon: LayersIcon, title: 'React (web)', text: 'A Vite or PostCSS plugin writes a real CSS file when you build.' },
  { href: '/react-native', icon: PhoneIcon, title: 'React Native', text: 'The same class names become React Native styles, on Android, iOS and Expo.' },
  { href: '/plain-html', icon: GlobeIcon, title: 'Plain HTML', text: 'One script tag from a CDN. No build step and no React.' },
  { href: '/colors', icon: PaletteIcon, title: 'Colors', text: '26 color families with 12 shades each, plus your own theme colors.' },
  { href: '/playground', icon: CodeIcon, title: 'Playground', text: 'HTML with Kbach classes and a JS or TS script, running live at any device size.' },
  { href: '/cli', icon: TerminalIcon, title: 'CLI', text: 'npx @kbach/cli init sets a project up. doctor checks it.' },
];

function Cards() {
  return (
    <div className="my-8 grid gap-3 sm:grid-cols-2">
      {CARDS.map(({ href, icon: Icon, title, text }) => (
        <SiteLink
          key={href}
          href={href}
          className="group relative flex gap-4 rounded-xl border border-line bg-card p-4 transition hover:border-gold/60 hover:shadow-md hover:shadow-gold/5 focus-visible:outline-2 focus-visible:outline-gold active:border-gold/60 active:shadow-md active:shadow-gold/5"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#f5ead2] dark:bg-logo text-xl text-bronze dark:text-gold ring-1 ring-gold/25">
            <Icon />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 font-semibold text-ink">
              {title}
              <ArrowRightIcon className="text-sm text-accent opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0 group-active:opacity-100 group-active:translate-x-0" />
            </span>
            <span className="mt-1 block text-sm leading-6 text-muted">{text}</span>
          </span>
        </SiteLink>
      ))}
    </div>
  );
}

const EXTENSION_ID = 'kbach.kbach-vscode';

/** The VS Code extension's listing card: logo, name, and install links. */
function Extension() {
  return (
    <div className="my-8 flex flex-col gap-5 rounded-2xl border border-line bg-card p-5 shadow-sm sm:flex-row sm:items-center">
      <Logo source={128} shown={64} className="size-16 shrink-0 rounded-2xl shadow-md ring-1 ring-gold/30" />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold text-ink">Kbach IntelliSense</span>
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-px text-[11px] font-medium text-accent">Preview</span>
        </p>
        <p className="mt-0.5 font-mono text-xs text-faint">{EXTENSION_ID}</p>
        <p className="mt-1.5 text-sm text-muted">Completion, hover and diagnostics for Kbach classes in VS Code.</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <a
          href={'vscode:extension/' + EXTENSION_ID}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:opacity-90"
        >
          <CodeIcon /> Install in VS Code
        </a>
        <a
          href={'https://marketplace.visualstudio.com/items?itemName=' + EXTENSION_ID}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-gold/60 hover:bg-raised active:border-gold/60 active:bg-raised"
        >
          Marketplace <ExternalIcon className="text-xs" />
        </a>
      </div>
    </div>
  );
}

export const COMPONENTS: Record<string, ComponentType<{ args: string }>> = {
  cards: Cards,
  palette: Palette,
  playground: Playground,
  extension: Extension,
  classes: Classes,
};
