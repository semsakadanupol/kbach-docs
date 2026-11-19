import type { MouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import { clsx } from '@kbach/react';
import { LANGUAGES, localHref, stripLocale, useLocale, useT, type Locale } from '../lib/i18n';

/** The same page in another language (its ?tab= and #section kept). */
function hrefIn(path: string, locale: Locale, rest = ''): string {
  const here = stripLocale(path) + rest;
  return localHref(here, locale);
}

/**
 * EN | ខ្មែរ: the same page in the other language. Each language has its own
 * root layout, so switching loads the other one: a plain link, followed with
 * the page's current ?tab= and #section added at the moment of the click.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useT();
  const path = usePathname();
  const go = (e: MouseEvent<HTMLAnchorElement>, to: Locale) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    window.location.assign(hrefIn(path, to, window.location.search + window.location.hash));
  };
  return (
    <nav aria-label={t('Language')} className={clsx('flex items-center gap-0.5 rounded-full border border-line bg-panel p-0.5', className)}>
      {LANGUAGES.map((l) => {
        const on = l.locale === locale;
        return (
          <a
            key={l.locale}
            href={hrefIn(path, l.locale)}
            onClick={(e) => go(e, l.locale)}
            hrefLang={l.locale}
            lang={l.locale}
            title={l.name}
            aria-current={on ? 'true' : undefined}
            className={clsx(
              'rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
              on ? 'bg-card text-ink shadow-xs ring-1 ring-line' : 'text-muted hover:text-ink',
            )}
          >
            {l.label}
          </a>
        );
      })}
    </nav>
  );
}
