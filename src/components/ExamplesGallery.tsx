'use client';

import { useEffect, useRef, useState } from 'react';
import { clsx } from '@kbach/react';
import { EXAMPLES, type ExampleTag } from '../playground/examples';
import type { PlaygroundMode } from '../playground/share';
import { CloseIcon, PlusIcon } from './icons';

// The playground's examples, as a gallery: a picture of each (light or dark, with the site),
// its name, what it shows, and tags to narrow the list. The pictures are files in
// public/playground/ made by scripts/example-thumbnails.mjs from the real playground, so the
// gallery opens at once (no ten live pages to run) and shows script-built pages as they look.
// Every example is an HTML page and the same page in React: the switch at the top picks which
// one a card opens (the kind open now, to begin with). One picture serves both.

const TAGS: { id: ExampleTag; label: string }[] = [
  { id: 'responsive', label: 'Responsive' },
  { id: 'dark', label: 'Dark mode' },
  { id: 'animation', label: 'Animation' },
  { id: 'states', label: 'States' },
  { id: 'forms', label: 'Forms' },
  { id: 'config', label: 'Config' },
  { id: 'typescript', label: 'TypeScript' },
];

export function ExamplesGallery({
  current,
  mode,
  edited,
  onPick,
  onBlank,
  onClose,
}: {
  /** the example the code came from, if any */
  current: string | null;
  /** the kind of page open now: what a card opens, until the switch says otherwise */
  mode: PlaygroundMode;
  /** the code differs from that example (picking another one can be undone) */
  edited: boolean;
  onPick: (id: string, kind: PlaygroundMode) => void;
  /** an empty page, of the kind the switch picked */
  onBlank: (kind: PlaygroundMode) => void;
  onClose: () => void;
}) {
  const [tag, setTag] = useState<ExampleTag | null>(null);
  const [kind, setKind] = useState<PlaygroundMode>(mode);
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const shown = tag ? EXAMPLES.filter((e) => e.tags.includes(tag)) : EXAMPLES;
  const chip = (on: boolean) =>
    clsx(
      'rounded-full px-3 py-1 text-[13px] font-medium whitespace-nowrap transition-colors',
      on ? 'bg-ink text-page' : 'bg-raised text-muted hover:text-ink active:text-ink',
    );

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Examples">
      <div className="absolute inset-0 bg-scrim/60 backdrop-blur-sm motion-safe:animate-[kbd-fade_200ms_ease-out]" onClick={onClose} />
      <div className="relative flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-line bg-page shadow-2xl motion-safe:animate-[kbd-fade-up_320ms_cubic-bezier(0.22,1,0.36,1)] sm:rounded-3xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 pt-5 pb-4 sm:px-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Examples</h2>
            <p className="mt-0.5 text-sm text-muted">Pages made only with Kbach classes, each as HTML and as React. Pick one, then change anything.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {/* which version a card opens */}
            <div role="group" aria-label="Open as" className="flex rounded-lg bg-raised p-0.5 text-[12px] font-semibold">
              {(['html', 'react'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={kind === k}
                  onClick={() => setKind(k)}
                  className={clsx('rounded-md px-2.5 py-1 transition-colors', kind === k ? 'bg-card text-ink shadow-xs' : 'text-muted hover:text-ink active:text-ink')}
                >
                  {k === 'react' ? 'React' : 'HTML'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-9 place-items-center rounded-lg text-lg text-muted transition-colors hover:bg-raised hover:text-ink active:bg-raised active:text-ink pointer-coarse:size-11"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="flex shrink-0 gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] sm:px-6" role="group" aria-label="Show examples about">
          <button type="button" aria-pressed={tag === null} onClick={() => setTag(null)} className={chip(tag === null)}>
            All {EXAMPLES.length}
          </button>
          {TAGS.map((t) => (
            <button key={t.id} type="button" aria-pressed={tag === t.id} onClick={() => setTag(tag === t.id ? null : t.id)} className={chip(tag === t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* the wrapper scrolls; the grid is only as tall as its cards, so auto-rows-fr makes every
            row as tall as the tallest card (on the scrolling element itself, fr rows shared out
            the dialog's height: a tag with one row of results stretched its cards to fill it) */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ul className="grid grid-cols-1 gap-4 px-5 pt-1 pb-6 min-[30rem]:grid-cols-2 sm:auto-rows-fr sm:px-6 lg:grid-cols-3">
            {/* start from nothing: always the first card, whatever the tag, in the kind "Open as" picks */}
            <li>
              <button
                ref={first}
                type="button"
                onClick={() => onBlank(kind)}
                className="group flex h-full w-full items-center gap-4 rounded-2xl border-2 border-dashed border-line p-4 text-left transition duration-200 hover:border-gold/60 hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:scale-[0.98] active:border-gold/60 active:bg-card sm:flex-col sm:justify-center sm:p-6 sm:text-center"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-raised text-2xl text-muted transition-colors group-hover:bg-gold/15 group-hover:text-gold group-active:bg-gold/15 group-active:text-gold">
                  <PlusIcon />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-ink">Blank page</span>
                  <span className="block text-[13px] leading-5 text-muted">{kind === 'react' ? 'A fresh App.jsx to write in' : 'A fresh index.html to write in'}</span>
                </span>
              </button>
            </li>
            {shown.map((ex) => {
              const open = ex.id === current && kind === mode;
              return (
                <li key={ex.id}>
                  <button
                    type="button"
                    onClick={() => onPick(ex.id, kind)}
                    aria-current={open ? 'true' : undefined}
                    className={clsx(
                      'group flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-card text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:scale-[0.98]',
                      open ? 'border-gold/70 ring-2 ring-gold/25' : 'border-line hover:border-gold/60 active:border-gold/60',
                    )}
                  >
                    <span className="relative block aspect-[16/10] overflow-hidden border-b border-line bg-raised">
                      {/* the picture in the site's mode */}
                      <img src={'/playground/' + ex.id + '.jpg'} alt="" loading="lazy" decoding="async" className="size-full object-cover object-top transition duration-300 group-hover:scale-[1.03] dark:hidden" />
                      <img src={'/playground/' + ex.id + '-dark.jpg'} alt="" loading="lazy" decoding="async" className="hidden size-full object-cover object-top transition duration-300 group-hover:scale-[1.03] dark:block" />
                      {open && (
                        <span className="absolute top-2 left-2 rounded-full bg-gold px-2 py-0.5 text-[11px] font-semibold text-accent-ink shadow">
                          {edited ? 'Open, edited' : 'Open now'}
                        </span>
                      )}
                    </span>
                    <span className="flex flex-1 flex-col gap-1 p-3.5">
                      <span className="font-semibold text-ink">{ex.name}</span>
                      <span className="line-clamp-2 min-h-10 text-[13px] leading-5 text-muted">{ex.hint}</span>
                      <span className="mt-auto flex flex-wrap gap-1 pt-2">
                        {ex.tags.map((t) => (
                          <span key={t} className="rounded-md bg-raised px-1.5 py-0.5 text-[11px] font-medium text-faint">
                            {TAGS.find((x) => x.id === t)?.label}
                          </span>
                        ))}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
