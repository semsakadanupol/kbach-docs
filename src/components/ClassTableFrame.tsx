import { useRef, useState, type ReactNode } from 'react';
import { clsx } from '@kbach/react';
import { ChevronDownIcon } from './icons';
import { useT } from '../lib/i18n';

export interface ClassRow {
  cls: string;
  swatch?: string | null;
  /** The CSS; undefined while the engine loads (a placeholder bar keeps the row's height). */
  styles?: ReactNode;
  /** It does nothing on React Native (src/reference/native.ts). */
  webOnly?: boolean;
}

/** A table with more rows than this starts folded… */
const FOLD_OVER = 10;
/** …showing this many. */
const FOLDED_ROWS = 8;

/**
 * The reference table's markup. It's drawn at once, with every class name
 * (they're known from the Markdown alone) and a placeholder for each row's
 * CSS, so the page doesn't jump when the engine arrives: a link to a section
 * below a table still lands in the right place.
 *
 * No scroll box inside the page: a long table shows its first rows and a
 * "Show all" row, and unfolds into the page.
 *
 * The class column is as wide as its longest class, never wrapping; the
 * styles column takes the rest (w-full max-w-0 is what lets a table cell's
 * lines truncate instead of stretching the table).
 */
export function ClassTableFrame({ rows }: { rows: ClassRow[] }) {
  const t = useT();
  const foldable = rows.length > FOLD_OVER;
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const shown = foldable && !open ? rows.slice(0, FOLDED_ROWS) : rows;
  // every class here is web only: say it once, above the table, instead of on every row
  const allWeb = rows.length > 0 && rows.every((r) => r.webOnly);

  const toggle = () => {
    setOpen((o) => !o);
    // folding a long table back up from its bottom: bring its top back into view
    if (open) {
      requestAnimationFrame(() => {
        const el = box.current;
        if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' });
      });
    }
  };

  return (
    <div ref={box} className="my-6 scroll-mt-24 overflow-hidden rounded-xl border border-line bg-card">
      {allWeb && (
        <p className="flex items-center gap-2 border-b border-line bg-panel/60 px-4 py-2 text-[13px] text-muted">
          <span className="rounded-full border border-line bg-panel px-1.5 text-[10.5px] leading-4 font-medium text-faint">{t('Web only')}</span>
          {t('None of these classes do anything on React Native.')}
        </p>
      )}
      <table className="w-full border-collapse text-left font-mono text-[13px]">
        <thead className="bg-panel font-sans">
          <tr>
            <th scope="col" className="w-px border-b border-line py-2.5 pr-6 pl-4 font-semibold whitespace-nowrap text-ink">
              {t('Class')}
            </th>
            <th scope="col" className="border-b border-line px-4 py-2.5 font-semibold text-ink">
              {t('Styles')}
            </th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.cls} className="border-b border-line align-top last:border-b-0">
              <td className="py-2 pr-6 pl-4 leading-6 whitespace-nowrap text-accent">
                {r.swatch && (
                  <span
                    aria-hidden="true"
                    style={{ background: r.swatch }}
                    className="mr-2 inline-block size-3.5 -translate-y-px rounded-sm align-middle ring-1 ring-black/10 dark:ring-white/15"
                  />
                )}
                {r.cls}
                {r.webOnly && !allWeb && (
                  <span
                    title={t('Does nothing on React Native')}
                    className="ml-2 inline-block -translate-y-px rounded-full border border-line bg-panel px-1.5 align-middle font-sans text-[10.5px] leading-4 font-medium text-faint"
                  >
                    {t('Web only')}
                  </span>
                )}
              </td>
              <td className="w-full max-w-0 py-2 pr-2 pl-4 leading-6 text-muted">
                {r.styles ?? <span aria-label="Loading" className="my-1.5 block h-3 w-44 max-w-full animate-pulse rounded bg-line" />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {foldable && (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="flex w-full items-center justify-center gap-1.5 border-t border-line bg-panel/60 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-panel hover:text-ink"
        >
          {open ? t('Show fewer') : t('Show all {n} classes').replace('{n}', String(rows.length))}
          <ChevronDownIcon className={clsx('text-sm transition-transform duration-200', open && 'rotate-180')} />
        </button>
      )}
    </div>
  );
}
