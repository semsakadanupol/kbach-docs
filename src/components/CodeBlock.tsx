'use client';

import { useState } from 'react';
import { clsx } from '@kbach/react';
import { highlight, type TokenType } from '../markdown/highlight';
import type { CodeBlock as CodeBlockData } from '../markdown/parse';
import { CheckIcon, CopyIcon, FileIcon, TerminalIcon } from './icons';
import { BrandIcon, brandForTab } from './BrandIcon';

// Token colors: deep ones for the light paper code background, and the
// light ones (as before) for the dark slate one.
export const TOKEN: Record<TokenType, string> = {
  plain: '',
  comment: clsx('text-[#8a959b] italic dark:text-[#7f9198]'),
  string: clsx('text-[#4a7a24] dark:text-[#b9d08f]'),
  keyword: clsx('text-[#94641a] dark:text-[#e2c27f]'),
  number: clsx('text-[#b14f2c] dark:text-[#e6a58f]'),
  fn: clsx('text-[#1d6b88] dark:text-[#8fc7d9]'),
  tag: clsx('text-[#a24f27] dark:text-[#e5a07e]'),
  attr: clsx('text-[#764aa8] dark:text-[#c9b0ea]'),
  prop: clsx('text-[#23766a] dark:text-[#9fd3c7]'),
  punct: clsx('text-[#6b777d] dark:text-[#8e9ea5]'),
  cmd: clsx('text-[#94641a] font-medium dark:text-[#e2c27f]'),
  flag: clsx('text-[#1d6b88] dark:text-[#8fc7d9]'),
  add: clsx('text-[#2f7a31] dark:text-[#a6dba1]'),
  del: clsx('text-[#b23a3a] dark:text-[#ee9f9f]'),
};

const LANG_LABEL: Record<string, string> = {
  sh: 'Terminal',
  bash: 'Terminal',
  shell: 'Terminal',
  tsx: 'TSX',
  ts: 'TypeScript',
  js: 'JavaScript',
  jsx: 'JSX',
  css: 'CSS',
  html: 'HTML',
  json: 'JSON',
  diff: 'Diff',
  text: 'Text',
};

export function CopyButton({ text, className, tone = 'code' }: { text: string; className?: string; tone?: 'code' | 'page' | 'editor' }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={done ? 'Copied' : 'Copy code'}
      title={done ? 'Copied' : 'Copy'}
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        });
      }}
      className={clsx(
        // on a touch screen an invisible ring (before:) widens what a finger can hit to 48px, without growing the button
        'relative inline-flex items-center justify-center size-7 rounded-md transition-colors pointer-coarse:before:absolute pointer-coarse:before:-inset-2.5 focus-visible:outline-2 focus-visible:outline-gold',
        // editor: the playground's editor bar, light or dark with the site
        tone === 'code'
          ? 'text-[#9aa8ae] hover:text-[#ece6d8] hover:bg-white/10 active:text-[#ece6d8] active:bg-white/10'
          : tone === 'editor'
            ? 'text-(--ed-icon) hover:text-(--ed-icon-hover) hover:bg-(--ed-hover) active:text-(--ed-icon-hover) active:bg-(--ed-hover)'
            : 'text-muted hover:text-ink hover:bg-raised active:text-ink active:bg-raised',
        className,
      )}
    >
      {done ? <CheckIcon className="text-[15px] text-gold" /> : <CopyIcon className="text-[15px]" />}
    </button>
  );
}

/**
 * Wrap mode's text: every run of non-space characters is kept whole (the
 * browser would otherwise break a line after any "-", splitting a class like
 * dark:divide-gray-|9), so a line only wraps at a space. A run longer than
 * 60 characters (a URL) may still break. The playground editor does the same.
 */
function Runs({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((part, i) =>
        part === '' || /^\s/.test(part) || part.length > 60 ? (
          part
        ) : (
          <span key={i} className="whitespace-nowrap">
            {part}
          </span>
        ),
      )}
    </>
  );
}

/**
 * Highlighted code, one row per line. With wrap, long lines wrap at spaces
 * instead of scrolling sideways, and a wrapped line continues 2 characters
 * in from its own indentation, as in the playground's editor (and VS Code).
 */
export function CodeLines({ code, lang, highlightLines, wrap = false }: { code: string; lang: string; highlightLines?: Set<number>; wrap?: boolean }) {
  const lines = highlight(code, lang);
  const marked = highlightLines ?? new Set<number>();
  const source = code.split('\n');
  return (
    <pre className={clsx('m-0 py-4 font-mono text-[13px] leading-6 text-snippet-ink', wrap ? 'whitespace-pre-wrap' : 'overflow-x-auto')}>
      <code className={clsx('grid', !wrap && 'min-w-max')}>
        {lines.map((tokens, n) => {
          // the hanging indent: the line's own indent plus 2, in characters
          const hang = (source[n]?.match(/^ */)?.[0].length ?? 0) + 2;
          return (
          <span
            key={n}
            style={wrap ? { paddingLeft: 'calc(1.25rem + ' + hang + 'ch)', textIndent: '-' + hang + 'ch' } : undefined}
            className={clsx(
              'px-5 border-l-2',
              wrap && '[overflow-wrap:anywhere]',
              marked.has(n + 1) ? 'bg-gold/10 border-gold' : 'border-transparent',
              lang === 'diff' && tokens[0]?.type === 'add' && 'bg-green-6/10',
              lang === 'diff' && tokens[0]?.type === 'del' && 'bg-red-6/10',
            )}
          >
            {/* an empty line still needs one line of height: a space, not a newline (which would make two) */}
            {tokens.length === 0
              ? ' '
              : tokens.map((t, k) => {
                  const text = wrap ? <Runs text={t.text} /> : t.text;
                  return t.type === 'plain' ? <span key={k}>{text}</span> : <span key={k} className={TOKEN[t.type]}>{text}</span>;
                })}
          </span>
          );
        })}
      </code>
    </pre>
  );
}

export function CodeBlock({ block }: { block: CodeBlockData }) {
  const isShell = ['sh', 'bash', 'shell'].includes(block.lang);
  const label = block.title ?? LANG_LABEL[block.lang] ?? block.lang.toUpperCase();
  return (
    <div className="group/code my-6 overflow-hidden rounded-xl border border-line bg-snippet shadow-sm dark:shadow-none">
      <div className="flex h-10 items-center gap-2 border-b border-line bg-snippet-bar pr-2 pl-4 dark:border-white/5">
        {isShell ? <TerminalIcon className="text-sm text-snippet-muted" /> : <FileIcon className="text-sm text-snippet-muted" />}
        <span className="truncate font-mono text-xs text-snippet-muted">{label}</span>
        <CopyButton text={block.code} tone="page" className="ml-auto" />
      </div>
      <CodeLines code={block.code} lang={block.lang} highlightLines={block.highlight} />
    </div>
  );
}

export function CodeTabs({ items }: { items: CodeBlockData[] }) {
  const [active, setActive] = useState(0);
  const block = items[active];
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-line bg-snippet shadow-sm dark:shadow-none">
      <div className="flex h-11 items-center border-b border-line bg-snippet-bar px-2 dark:border-white/5" role="tablist">
        {items.map((it, n) => (
          <button
            key={it.tab}
            type="button"
            role="tab"
            aria-selected={n === active}
            onClick={() => setActive(n)}
            className={clsx(
              'relative flex h-full items-center gap-1.5 px-3 text-[13px] font-medium transition-colors',
              n === active ? 'text-snippet-ink after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-gold' : 'text-snippet-muted hover:text-snippet-ink active:text-snippet-ink',
            )}
          >
            {/* npm, pnpm, yarn, bun, Expo, React Native CLI: their logos */}
            {brandForTab(it.tab) && <BrandIcon brand={brandForTab(it.tab)!} className="text-[14px]" />}
            {it.tab}
          </button>
        ))}
        {block.title && <span className="mr-1 ml-auto hidden truncate font-mono text-xs text-snippet-muted sm:block">{block.title}</span>}
        <CopyButton text={block.code} tone="page" className={block.title ? '' : 'ml-auto'} />
      </div>
      <CodeLines code={block.code} lang={block.lang} highlightLines={block.highlight} />
    </div>
  );
}
