import { useLayoutEffect, useRef, useState } from 'react';
import { clsx } from '@kbach/react';
import { CodeLines, CopyButton } from './CodeBlock';
import { styleTree, useEngine } from '../lib/engine';

/**
 * A live example: the HTML from a "preview" fence, rendered and styled in the
 * page, with its source one tab away. Both stay mounted. The code wraps, so
 * a long class list is readable without scrolling sideways, and the Code tab
 * is as tall as its code (it used to keep the preview's height, which left a
 * block of empty space under a short example). Copy works from either tab.
 */
export function Preview({ html, title }: { html: string; title?: string }) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const ready = useEngine();
  const canvas = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (ready && box.current) styleTree(box.current);
  }, [ready, html]);

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-line bg-card shadow-sm dark:shadow-none">
      <div className="flex h-11 items-center gap-1 border-b border-line bg-panel px-2">
        <div role="tablist" aria-label="Example" className="flex items-center gap-1">
          {(['preview', 'code'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={clsx(
                'h-7 rounded-md px-3 text-[13px] font-medium transition-colors',
                tab === t ? 'bg-card text-ink shadow-xs ring-1 ring-line' : 'text-muted hover:text-ink active:text-ink',
              )}
            >
              {t === 'preview' ? 'Preview' : 'Code'}
            </button>
          ))}
        </div>
        {title && <span className="ml-2 truncate text-xs text-faint">{title}</span>}
        <CopyButton text={html} tone="page" className="ml-auto" />
      </div>

      <div
        ref={canvas}
        data-preview-canvas=""
        className={clsx(
          'relative overflow-x-auto p-6 sm:p-10 [background-image:radial-gradient(circle,rgb(127_127_127/0.16)_1px,transparent_1px)] [background-size:16px_16px]',
          tab !== 'preview' && 'hidden',
        )}
      >
        {!ready && <div className="absolute inset-0 grid place-items-center text-sm text-faint">Loading the engine…</div>}
        <div ref={box} className={clsx('transition-opacity duration-300', ready ? 'opacity-100' : 'opacity-0')} dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      <div className={clsx('max-h-[32rem] overflow-y-auto bg-snippet', tab !== 'code' && 'hidden')}>
        <CodeLines code={html} lang="html" wrap />
      </div>
    </div>
  );
}
