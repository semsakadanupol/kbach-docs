import { useEffect, useMemo, useState } from 'react';
import { clsx } from '@kbach/react';
import type { DocPage } from '../lib/docs';
import { onHashLinkClick } from '../lib/location';
import { useActiveTab } from '../lib/tabs';

/**
 * "On this page", with the section being read marked in gold. On a page
 * with tabs, it lists the page's own headings plus the shown tab's.
 */
export function Toc({ page }: { page: DocPage }) {
  const [active, setActive] = useState<string | null>(null);
  const tab = useActiveTab(page.tabs.map((t) => t.id));
  const headings = useMemo(() => page.headings.filter((h) => !h.tab || h.tab === tab), [page, tab]);

  useEffect(() => {
    if (!headings.length) return;
    const onScroll = () => {
      // The section being read is the last heading at or above this line:
      // a little below where a TOC link scrolls a heading to (72-96px, the
      // scroll-mt on headings), so clicking a link always marks that link.
      // On a page with a setup tab bar, the bar sticks under the header and
      // steps land lower (scroll-mt 8.5rem = 136px), so the line moves too.
      const line = page.tabs.length ? 160 : 120;
      let current = headings[0].id;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= line) current = h.id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = headings[headings.length - 1].id;
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [headings, page]);

  if (!headings.length) return null;
  return (
    <nav aria-label="On this page" className="text-[13px]">
      <p className="mb-3 font-semibold text-ink">On this page</p>
      <ul className="space-y-0.5 border-l border-line">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={'#' + h.id}
              onClick={onHashLinkClick}
              aria-current={active === h.id ? 'location' : undefined}
              className={clsx(
                '-ml-px block border-l py-1 leading-5 transition-colors',
                h.level === 3 ? 'pl-6' : 'pl-3',
                active === h.id ? 'border-gold text-accent font-medium' : 'border-transparent text-muted hover:text-ink active:text-ink',
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="mt-6 text-faint transition-colors hover:text-accent active:text-accent"
      >
        Back to top ↑
      </button>
    </nav>
  );
}
