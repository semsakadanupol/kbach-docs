'use client';

import type { ReactNode } from 'react';
import { clsx } from '@kbach/react';
import type { Block, Inline } from './parse';
import { CodeBlock, CodeTabs } from '../components/CodeBlock';
import { Preview } from '../components/Preview';
import { AlertIcon, BulbIcon, HashIcon, InfoIcon, StarIcon } from '../components/icons';
import { onHashLinkClick } from '../lib/location';
import { SiteLink } from '../components/SiteLink';
import { COMPONENTS } from '../components/registry';
import { TabGroup } from '../components/TabGroup';

export function renderInline(nodes: Inline[]): ReactNode[] {
  return nodes.map((n, i) => {
    switch (n.t) {
      case 'text':
        return n.v;
      case 'code':
        // a short one (a class name like text-gray-12) stays on one line: broken at its hyphen it
        // reads as two classes; a long one may still wrap anywhere, so a phone never scrolls sideways
        return (
          <code key={i} className={clsx('rounded-md border border-line bg-raised/60 px-1.5 py-0.5 font-mono text-[0.85em] text-ink', n.v.length <= 24 && !/\s/.test(n.v) ? 'whitespace-nowrap' : '[overflow-wrap:anywhere]')}>
            {n.v}
          </code>
        );
      case 'strong':
        return (
          <strong key={i} className="font-semibold text-ink">
            {renderInline(n.c)}
          </strong>
        );
      case 'em':
        return <em key={i}>{renderInline(n.c)}</em>;
      case 'kbd':
        return (
          <kbd key={i} className="rounded border border-line border-b-2 bg-card px-1.5 py-px font-mono text-[0.8em] text-muted">
            {n.v}
          </kbd>
        );
      case 'link': {
        // a template literal, not a plain string: Kbach's plugin scans those, so the classes get their CSS
        const className = `font-medium text-accent underline decoration-accent/40 decoration-1 underline-offset-[3px] transition-colors hover:decoration-accent active:decoration-accent`;
        // another site: a new tab; a #section of this page: scroll there; a page of this site: SiteLink
        if (/^https?:/.test(n.href))
          return (
            <a key={i} href={n.href} target="_blank" rel="noreferrer" className={className}>
              {renderInline(n.c)}
            </a>
          );
        if (n.href.startsWith('#'))
          return (
            <a key={i} href={n.href} onClick={onHashLinkClick} className={className}>
              {renderInline(n.c)}
            </a>
          );
        return (
          <SiteLink key={i} href={n.href} className={className}>
            {renderInline(n.c)}
          </SiteLink>
        );
      }
    }
  });
}

const CALLOUT = {
  note: { icon: InfoIcon, label: 'Note', box: clsx('border-sky-6/30 bg-sky-6/6'), tint: clsx('text-sky-7 dark:text-sky-4') },
  tip: { icon: BulbIcon, label: 'Tip', box: clsx('border-gold/40 bg-gold/8'), tint: clsx('text-accent') },
  important: { icon: StarIcon, label: 'Important', box: clsx('border-violet-6/30 bg-violet-6/6'), tint: clsx('text-violet-7 dark:text-violet-4') },
  warning: { icon: AlertIcon, label: 'Warning', box: clsx('border-amber-6/40 bg-amber-6/8'), tint: clsx('text-amber-8 dark:text-amber-4') },
};

function Heading({ level, id, children }: { level: 2 | 3 | 4; id: string; children: ReactNode }) {
  const Tag = ('h' + level) as 'h2' | 'h3' | 'h4';
  return (
    <Tag
      id={id}
      className={clsx(
        // Where a #link lands: just under the 64px header. An h2's box starts
        // at its divider, 32px (pt-8) above the text, so it needs less margin.
        'group relative text-ink',
        level === 2 ? 'scroll-mt-[4.5rem] first:scroll-mt-24' : 'scroll-mt-24',
        level === 2 && 'mt-14 mb-4 pt-8 border-t border-line text-2xl font-semibold tracking-tight first:mt-0 first:pt-0 first:border-t-0',
        level === 3 && 'mt-10 mb-3 text-lg font-semibold tracking-tight',
        level === 4 && 'mt-8 mb-2 text-base font-semibold',
      )}
    >
      <a
        href={'#' + id}
        onClick={onHashLinkClick}
        aria-label="Link to this section"
        className="absolute -left-6 top-[0.15em] hidden md:flex items-center text-faint opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-accent group-active:opacity-100 active:text-accent"
      >
        <HashIcon className="text-base" />
      </a>
      {children}
    </Tag>
  );
}

export function RenderBlocks({ blocks }: { blocks: Block[] }) {
  return <>{blocks.map((b, i) => <RenderBlock key={i} block={b} />)}</>;
}

function RenderBlock({ block: b }: { block: Block }) {
  switch (b.t) {
    case 'heading':
      return (
        <Heading level={b.level} id={b.id}>
          {renderInline(b.c)}
        </Heading>
      );
    case 'p':
      return <p className="my-4 leading-7 text-ink/85">{renderInline(b.c)}</p>;
    case 'code':
      return <CodeBlock block={b} />;
    case 'tabs':
      return <CodeTabs items={b.items} />;
    case 'preview':
      return <Preview html={b.html} title={b.title} />;
    case 'hr':
      return <hr className="my-10 border-line" />;
    case 'list':
      return b.ordered ? (
        <ol className="my-4 space-y-2 pl-6 list-decimal marker:text-faint marker:font-medium">
          {b.items.map((it, i) => (
            <li key={i} className="pl-1.5 leading-7 text-ink/85">
              {renderInline(it)}
            </li>
          ))}
        </ol>
      ) : (
        <ul className="my-4 space-y-2 pl-1">
          {b.items.map((it, i) => (
            <li key={i} className="relative pl-6 leading-7 text-ink/85 before:absolute before:left-1.5 before:top-[0.7em] before:size-1.5 before:rotate-45 before:bg-gold/70">
              {renderInline(it)}
            </li>
          ))}
        </ul>
      );
    case 'table':
      return (
        <div className="my-6 overflow-x-auto rounded-xl border border-line">
          {/* code in a cell stays on one line; a table too wide for the page scrolls sideways instead */}
          <table className="w-full border-collapse text-sm [&_code]:whitespace-nowrap [&_code]:[overflow-wrap:normal]">
            <thead className="bg-panel">
              <tr>
                {b.head.map((h, i) => (
                  <th key={i} style={{ textAlign: b.align[i] }} className="border-b border-line px-4 py-2.5 text-left font-semibold text-ink whitespace-nowrap">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, r) => (
                <tr key={r} className="border-b border-line last:border-b-0 even:bg-panel/40">
                  {row.map((cell, c) => (
                    <td key={c} style={{ textAlign: b.align[c] }} className="px-4 py-2.5 align-top leading-6 text-ink/85">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'callout': {
      const k = CALLOUT[b.kind];
      const Icon = k.icon;
      return (
        <div className={clsx('my-6 flex gap-3 rounded-xl border px-4 py-3.5', k.box)}>
          <Icon className={clsx('mt-1 shrink-0 text-lg', k.tint)} />
          <div className="min-w-0 [&>p]:my-1.5 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>ul]:my-2">
            <p className={clsx('text-sm font-semibold', k.tint)}>{b.title ?? k.label}</p>
            <RenderBlocks blocks={b.c} />
          </div>
        </div>
      );
    }
    case 'tabgroup':
      return <TabGroup tabs={b.tabs} />;
    case 'component': {
      const C = COMPONENTS[b.name];
      return C ? <C args={b.args} /> : <p className="text-red-6">Unknown component: {b.name}</p>;
    }
  }
}
