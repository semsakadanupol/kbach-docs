import { useLayoutEffect, useRef, useState, type ComponentType, type SVGProps } from 'react';
import { clsx } from '@kbach/react';
import type { Block, Tab } from '../markdown/parse';
import { RenderBlocks, renderInline } from '../markdown/render';
import { onHashLinkClick } from '../lib/location';
import { selectTab, useActiveTab } from '../lib/tabs';
import { BoltIcon, CodeIcon, GlobeIcon, LayersIcon, PhoneIcon, ServerIcon } from './icons';
import { BrandIcon, isBrand } from './BrandIcon';

const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  bolt: BoltIcon,
  server: ServerIcon,
  phone: PhoneIcon,
  globe: GlobeIcon,
  layers: LayersIcon,
  code: CodeIcon,
};

type Heading = Extract<Block, { t: 'heading' }>;

/**
 * Whether the tab bar is too narrow for every tab's name. Measured, not a
 * breakpoint: the names' width depends on the font, its size and the zoom.
 * The tabs share the bar (flex-1) but never shrink below their content, so
 * the names don't fit once the bar overflows; the width they needed then is
 * kept, and the names come back once the bar is that wide again.
 */
function useCompactTabs(list: React.RefObject<HTMLDivElement | null>): boolean {
  const [compact, setCompact] = useState(false);
  const full = useRef(0);
  const now = useRef(false);
  useLayoutEffect(() => {
    const el = list.current;
    if (!el) return;
    const check = () => {
      let next = now.current;
      if (!now.current && el.scrollWidth > el.clientWidth + 1) {
        full.current = el.scrollWidth;
        next = true;
      } else if (now.current && el.clientWidth >= full.current) next = false;
      if (next !== now.current) {
        now.current = next;
        setCompact(next);
      }
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    // the web font arriving changes the names' width
    document.fonts?.ready.then(() => {
      if (!now.current) check();
    });
    return () => ro.disconnect();
  }, [list]);
  return compact;
}

/** Splits a tab's blocks into the text before its first h2, and one step per h2. */
function toSteps(blocks: Block[]) {
  const intro: Block[] = [];
  const steps: { heading: Heading; blocks: Block[] }[] = [];
  for (const b of blocks) {
    if (b.t === 'heading' && b.level === 2) steps.push({ heading: b, blocks: [] });
    else if (steps.length) steps[steps.length - 1].blocks.push(b);
    else intro.push(b);
  }
  return { intro, steps };
}

/**
 * A page-level setup picker (":::tabs" in Markdown): a tab bar that stays
 * under the header while you read, and the chosen setup's h2 sections shown
 * as numbered steps. The choice is in the URL (?tab=), so the table of
 * contents and search follow it.
 */
export function TabGroup({ tabs }: { tabs: Tab[] }) {
  const active = useActiveTab(tabs.map((t) => t.id));
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const compact = useCompactTabs(list);
  const { intro, steps } = toSteps(current.blocks);

  const choose = (id: string) => {
    selectTab(id);
    // switched while reading further down: go back to the start of the new steps
    const top = root.current?.getBoundingClientRect().top ?? 0;
    if (top < 64) window.scrollTo({ top: window.scrollY + top - 72 });
  };

  return (
    <div ref={root} className="mt-8 mb-4">
      <div className="sticky top-16 z-20 -mx-4 bg-page/90 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <div ref={list} role="tablist" aria-label="Choose your setup" className="flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]">
          {tabs.map((t) => {
            // icon=vite, nextjs, react, html5…: the setup's own logo; else one of the site's icons
            const brand = isBrand(t.icon) ? t.icon : null;
            const Icon = (t.icon && ICONS[t.icon]) || CodeIcon;
            const on = t.id === current.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={'tab-' + t.id}
                aria-selected={on}
                aria-controls={'panel-' + t.id}
                // (when only its logo shows, this is where its name is)
                title={t.note ? t.label + ': ' + t.note : t.label}
                tabIndex={on ? 0 : -1}
                onClick={() => choose(t.id)}
                onKeyDown={(e) => {
                  // arrow keys move between tabs, like a native tab list
                  const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
                  if (!step) return;
                  e.preventDefault();
                  const next = tabs[(tabs.indexOf(t) + step + tabs.length) % tabs.length];
                  choose(next.id);
                  document.getElementById('tab-' + next.id)?.focus();
                }}
                className={clsx(
                  // an equal share of the bar each (never less than its content)
                  'group relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-3 py-3.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold',
                  'after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:transition-colors',
                  on ? 'text-ink after:bg-gold' : 'text-muted hover:text-ink after:bg-transparent hover:after:bg-line active:text-ink',
                )}
              >
                {brand ? (
                  // in color on the chosen tab, gray on the others (until hovered)
                  <BrandIcon brand={brand} className={clsx('text-base transition', !on && 'opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 group-active:opacity-100')} />
                ) : (
                  <Icon className={clsx('text-base', on ? 'text-accent' : 'text-faint')} />
                )}
                {/* too narrow for every name: the others show just their logo (the name stays for screen readers) */}
                <span className={clsx(compact && !on && 'sr-only')}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" id={'panel-' + current.id} aria-labelledby={'tab-' + current.id} className="pt-8">
        {intro.length > 0 && (
          <div className="mb-8 [&>p:first-child]:mt-0">
            <RenderBlocks blocks={intro} />
          </div>
        )}
        <ol className="[&_h3]:scroll-mt-[8.5rem]">
          {steps.map(({ heading, blocks }, n) => (
            <li key={heading.id} className="relative pb-12 pl-12 last:pb-2 sm:pl-14">
              {/* the line joining one step's number to the next */}
              {n < steps.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-4 top-10 w-px bg-line" />}
              <a
                href={'#' + heading.id}
                onClick={onHashLinkClick}
                aria-label={'Step ' + (n + 1)}
                className="absolute left-0 top-0 grid size-8 place-items-center rounded-full bg-[#f5ead2] dark:bg-logo font-mono text-sm font-semibold text-bronze dark:text-gold ring-4 ring-page transition hover:ring-gold/30 active:ring-gold/30"
              >
                {n + 1}
              </a>
              <h2 id={heading.id} className="scroll-mt-[8.5rem] pt-0.5 text-lg font-semibold tracking-tight text-ink">
                {renderInline(heading.c)}
              </h2>
              <div className="[&>*:first-child]:mt-3 [&>*:last-child]:mb-0">
                <RenderBlocks blocks={blocks} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
