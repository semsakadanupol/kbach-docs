import { useSyncExternalStore } from 'react';
import { clsx } from '@kbach/react';

// What shows while the playground's code (CodeMirror and all) loads: the
// playground's own outline, laid out as it will be (the reader's layout and
// split, kept in localStorage by Playground.tsx), so nothing moves when it
// arrives. Kept in step with Playground.tsx: the header, the editor with its
// tabs and gold status bar, the preview with its toolbar.

const LAYOUT_KEY = 'kbach-playground-panes';
const SPLIT_KEY = 'kbach-playground-split';
/** as Playground.tsx: narrower than this, the panes stack */
const SIDE_BY_SIDE_MIN = 760;

// the code lines' lengths, in % (a style, not w-2/5 classes: kbach.css only has the classes
// written in a className, and these would sit in a plain array)
const LINES = [40, 60, 50, 80, 66, 75, 33, 60, 50, 40];

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

type Layout = { code: 'left' | 'right' | 'top' | 'bottom'; split: number };

/** Where the code sits and how much room it takes, as the playground will lay it out. */
function layout(): Layout {
  const saved = read(LAYOUT_KEY);
  let code: 'left' | 'right' | 'top' | 'bottom' = saved === 'right' || saved === 'top' || saved === 'bottom' ? saved : 'left';
  // the playground's content width: the window less its padding (p-2, md:p-3)
  const width = window.innerWidth - (window.innerWidth >= 768 ? 24 : 16);
  if (width < SIDE_BY_SIDE_MIN) code = code === 'left' ? 'top' : code === 'right' ? 'bottom' : code;
  const split = Math.min(75, Math.max(25, Number(read(SPLIT_KEY)) || 45));
  return { code, split };
}

// as text, so the store hands React the same value until it really changes
const savedLayout = () => JSON.stringify(layout());
const DEFAULT = JSON.stringify({ code: 'left', split: 45 } satisfies Layout);
const noSubscription = () => () => {};

export function PlaygroundLoading() {
  // the built page has no window or storage: it shows the default layout, the browser the reader's
  const { code, split } = JSON.parse(useSyncExternalStore(noSubscription, savedLayout, () => DEFAULT)) as Layout;
  const horizontal = code === 'left' || code === 'right';
  return (
    <div role="status" aria-label="Loading the playground" className="fixed inset-0 z-50 flex flex-col bg-page p-2 md:p-3">
      {/* the header: back, the name, then Run, Auto-run, layout, ⋯, Share */}
      <div className="@container mb-2 flex h-8 shrink-0 items-center gap-1">
        <span className="size-8 shrink-0 rounded-lg" />
        <span className="flex-1 px-1 text-[13px] font-semibold">Playground</span>
        <span className="h-5 w-14 animate-pulse rounded-full bg-raised" />
        <span className="h-5 w-20 animate-pulse rounded-full bg-raised" />
        <span className="hidden size-6 animate-pulse rounded-full bg-raised @min-[30rem]:block" />
        <span className="size-6 animate-pulse rounded-full bg-raised" />
        <span className="h-8 w-20 animate-pulse rounded-lg bg-accent/30" />
      </div>

      <div
        className={clsx(
          'flex min-h-0 flex-1',
          horizontal ? (code === 'right' ? 'flex-row-reverse' : 'flex-row') : code === 'bottom' ? 'flex-col-reverse' : 'flex-col',
        )}
      >
        {/* the editor: its tabs, lines and gold status bar */}
        <div
          style={horizontal ? { width: split + '%' } : { height: split + '%' }}
          className="flex min-h-0 shrink-0 flex-col overflow-hidden rounded-md border border-(--ed-border) bg-(--ed-bg)"
        >
          <div className="flex h-[35px] shrink-0 items-center bg-(--ed-tabs) px-3">
            <span className="flex animate-pulse items-center gap-5">
              <span className="h-2 w-16 rounded-full bg-(--ed-skeleton)" />
              <span className="h-2 w-10 rounded-full bg-(--ed-skeleton)" />
              <span className="h-2 w-14 rounded-full bg-(--ed-skeleton)" />
              <span className="h-2 w-10 rounded-full bg-(--ed-skeleton)" />
            </span>
          </div>
          <div className="min-h-0 flex-1 animate-pulse space-y-3 overflow-hidden px-4 py-3">
            {LINES.map((width, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="h-2 w-4 shrink-0 rounded bg-(--ed-skeleton)" />
                <span style={{ width: width + '%' }} className="h-2 rounded-full bg-(--ed-skeleton)" />
              </div>
            ))}
          </div>
          <div className="h-6 shrink-0 bg-gold" />
        </div>

        {/* the drag bar's room (as PlaygroundParts' Splitter: w-3 beside, h-4 between) */}
        <span className={horizontal ? 'w-3 shrink-0' : 'h-4 shrink-0'} />

        {/* the preview: its toolbar, and the page area */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-card">
          <div className="flex shrink-0 items-center gap-2 border-b border-line bg-panel px-2 py-1.5">
            <span className="h-7 w-20 animate-pulse rounded-md bg-card" />
            <span className="h-4 w-14 animate-pulse rounded-full bg-raised" />
            <span className="ml-2 flex animate-pulse gap-2">
              <span className="size-5 rounded-full bg-raised" />
              <span className="size-5 rounded-full bg-raised" />
              <span className="size-5 rounded-full bg-raised" />
            </span>
          </div>
          <div className="min-h-0 flex-1 bg-panel [background-image:radial-gradient(circle,rgb(127_127_127/0.16)_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>
      </div>
    </div>
  );
}
