import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from '@kbach/react';
import type { SearchEntry } from '../lib/content';
import { useHref, useLocale, useT, type Locale } from '../lib/i18n';
import { FileIcon, HashIcon, SearchIcon } from './icons';
import { usePageInfo } from './site/SiteData';
import { useModKey } from '../lib/browser';

interface Hit {
  href: string;
  title: string;
  section: string;
  kind: 'page' | 'heading' | 'text';
  snippet?: string;
  score: number;
}

// What search looks through: one entry per page, per tab and per heading
// (lib/content.ts searchEntries), built with the site as /en/search.json and
// /km/search.json, and loaded the first time the search box opens.
const loaded = new Map<Locale, Promise<SearchEntry[]>>();
function loadEntries(locale: Locale): Promise<SearchEntry[]> {
  if (!loaded.has(locale)) {
    const request = fetch('/' + locale + '/search.json')
      .then((r) => r.json() as Promise<SearchEntry[]>)
      .catch(() => {
        loaded.delete(locale); // try again next time
        return [];
      });
    loaded.set(locale, request);
  }
  return loaded.get(locale)!;
}

function useEntries(): SearchEntry[] {
  const locale = useLocale();
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  useEffect(() => {
    let live = true;
    loadEntries(locale).then((e) => live && setEntries(e));
    return () => {
      live = false;
    };
  }, [locale]);
  return entries;
}

function search(entries: SearchEntry[], q: string): Hit[] {
  const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const hits: Hit[] = [];
  for (const e of entries) {
    let score = 0;
    let all = true;
    for (const w of words) {
      const at = e.haystack.indexOf(w);
      if (at === 0) score += 12;
      else if (at > 0) score += /\W/.test(e.haystack[at - 1]) ? 8 : 4;
      else all = false;
    }
    if (all) {
      hits.push({ href: e.href, title: e.title, section: e.section, kind: e.kind, score: score + (e.kind === 'page' ? 3 : 0) });
      continue;
    }
    // fall back to the page body
    if (e.kind === 'page') {
      const body = e.text.toLowerCase();
      if (words.every((w) => body.includes(w))) {
        const at = body.indexOf(words[0]);
        const start = Math.max(0, at - 40);
        const snippet = (start > 0 ? '…' : '') + e.text.slice(start, at + 80).replace(/\s+/g, ' ').trim() + '…';
        hits.push({ href: e.href, title: e.title, section: e.section, kind: 'text', snippet, score: 1 });
      }
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 12);
}

export function SearchButton({ onOpen }: { onOpen: () => void }) {
  const t = useT();
  const mod = useModKey();
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-9 w-full max-w-sm items-center gap-2.5 rounded-lg border border-line bg-panel pl-3 pr-1.5 text-sm text-faint transition-colors hover:border-gold/50 hover:text-muted focus-visible:outline-2 focus-visible:outline-gold"
    >
      <SearchIcon className="text-base" />
      <span className="min-w-0 flex-1 truncate text-left">{t('Search the docs…')}</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-line bg-card px-1.5 py-0.5 font-mono text-[11px] text-muted">
        {mod} K
      </kbd>
    </button>
  );
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  // mounted only while open, so every search starts empty
  return open ? <SearchBox onClose={onClose} /> : null;
}

function SearchBox({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const router = useRouter();
  const entries = useEntries();
  const hits = useMemo(() => search(entries, q), [entries, q]);

  useEffect(() => {
    requestAnimationFrame(() => input.current?.focus());
  }, []);
  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  const go = (hit: Hit | undefined) => {
    if (!hit) return;
    onClose();
    router.push(hit.href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label={t('Search')}>
      <div className="absolute inset-0 bg-scrim/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-card shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <SearchIcon className="text-lg text-faint" />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSel((s) => Math.min(s + 1, hits.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSel((s) => Math.max(s - 1, 0));
              } else if (e.key === 'Enter') go(hits[sel]);
              else if (e.key === 'Escape') onClose();
            }}
            placeholder={t('Search pages and sections')}
            aria-label={t('Search')}
            className="h-14 flex-1 bg-transparent text-base text-ink placeholder:text-faint outline-none"
          />
          <kbd className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[11px] text-faint">Esc</kbd>
        </div>
        {q && (
          <ul ref={list} className="max-h-[60vh] overflow-y-auto p-2" role="listbox">
            {hits.length === 0 && <li className="px-4 py-10 text-center text-sm text-muted">{t('No results for')} “{q}”</li>}
            {hits.map((h, i) => (
              <li key={h.href + h.kind} role="option" aria-selected={i === sel}>
                <a
                  href={h.href}
                  onClick={(e) => {
                    e.preventDefault();
                    go(h);
                  }}
                  onMouseMove={() => setSel(i)}
                  className={clsx('flex items-start gap-3 rounded-lg px-3 py-2.5', i === sel ? 'bg-gold/12 text-ink' : 'text-muted')}
                >
                  <span className={clsx('mt-0.5 text-base', i === sel ? 'text-accent' : 'text-faint')}>{h.kind === 'heading' ? <HashIcon /> : <FileIcon />}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">{h.title}</span>
                    <span className="block truncate text-xs text-faint">{h.snippet ?? h.section}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
        {!q && (
          <div className="p-4">
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-[0.08em] text-faint">{t('Popular')}</p>
            <div className="flex flex-wrap gap-2">
              {['installation', 'dark-mode', 'colors', 'configuration', 'playground'].map((slug) => (
                <PopularChip key={slug} slug={slug} onPick={go} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PopularChip({ slug, onPick }: { slug: string; onPick: (hit: Hit) => void }) {
  const t = useT();
  const href = useHref();
  // the playground isn't a docs page (not in the sidebar's list): its name is the interface's word
  const title = usePageInfo(slug)?.title ?? (slug === 'playground' ? t('Playground') : null);
  if (!title) return null;
  return (
    <button
      type="button"
      onClick={() => onPick({ href: href('/' + slug), title, section: '', kind: 'page', score: 0 })}
      className="rounded-full border border-line px-3 py-1 text-[13px] text-muted transition-colors hover:border-gold/60 hover:text-ink"
    >
      {title}
    </button>
  );
}
