import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import init, { generate_css, resolve_style_json } from '@kbach/core-engine';
import { clsx, defaultTheme } from '@kbach/react';
import { expandClasses } from '../reference/expand';
import { listItems, prettyRules, swatchColor, type EngineRule, type PrettyBlock } from '../reference/prettyCss';
import { ClassTableFrame, type ClassRow } from './ClassTableFrame';
import { worksOnNative } from '../reference/native';
import { ChevronDownIcon } from './icons';

// A reference table for "::classes p-{0,1,2} …": each class with the CSS the
// engine makes for it. Nothing is typed in by hand, so the table is always
// what Kbach really does. It uses Kbach's default theme, not this site's own
// (the site has its own fonts and colors), so what it shows is what a fresh
// project gets.

let ready: Promise<unknown> | null = null;
const themeJson = JSON.stringify(defaultTheme);

function rulesFor(cls: string): EngineRule[] {
  return (JSON.parse(generate_css(cls, themeJson)) as { rules: EngineRule[] }).rules;
}

interface Line {
  text: string;
  depth: number;
  /** a wrapper's own line ("@media (…) {", "}"), drawn quieter */
  frame?: boolean;
}

/** More lines than this and a row starts folded. */
const FOLD_AFTER = 5;

/**
 * The lines of a row. Folded, each declaration is one line. Unfolded, a long
 * comma list (a font stack, transition properties, shadow layers) puts each
 * item on its own line, the way a formatter would.
 */
function toLines(blocks: PrettyBlock[], unfolded: boolean): Line[] {
  const out: Line[] = [];
  const decl = (text: string, depth: number) => {
    const m = /^([^:]+):\s*(.*);$/.exec(text);
    const items = m ? listItems(m[2]) : [];
    if (!unfolded || !m || items.length < 3 || text.length < 56) {
      out.push({ text, depth });
      return;
    }
    out.push({ text: m[1] + ':', depth });
    items.forEach((item, i) => out.push({ text: item + (i < items.length - 1 ? ',' : ';'), depth: depth + 1 }));
  };
  for (const b of blocks) {
    if (!b.label) {
      for (const l of b.lines) decl(l, 0);
      continue;
    }
    out.push({ text: b.label + ' {', depth: 0, frame: true });
    for (const l of b.lines) decl(l, 1);
    out.push({ text: '}', depth: 0, frame: true });
  }
  return out;
}

function StyleCell({ blocks }: { blocks: PrettyBlock[] }) {
  const [unfolded, setUnfolded] = useState(false);
  const [cut, setCut] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => toLines(blocks, unfolded), [blocks, unfolded]);
  const tall = toLines(blocks, false).length > FOLD_AFTER + 1;
  const shown = unfolded || !tall ? lines : lines.slice(0, FOLD_AFTER);

  // whether a folded line is cut off by the column's width (it changes with the window)
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || unfolded) return;
    const measure = () => setCut([...el.children].some((c) => c.scrollWidth > c.clientWidth + 1));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [unfolded, blocks]);

  if (blocks.length === 0) return <span className="font-sans text-red-7 dark:text-red-4">No CSS</span>;
  const foldable = tall || cut || unfolded;
  const hidden = tall && !unfolded ? toLines(blocks, false).length - FOLD_AFTER : 0;

  return (
    <div className="flex items-start gap-1">
      <div ref={box} className="min-w-0 flex-1">
        {shown.map((l, i) => (
          <span
            key={i}
            style={l.depth ? { paddingLeft: l.depth * 2 + 'ch' } : undefined}
            className={clsx('block', unfolded ? 'whitespace-pre-wrap [overflow-wrap:anywhere]' : 'truncate', l.frame && 'text-faint')}
          >
            {l.text}
          </span>
        ))}
        {hidden > 0 && (
          <button type="button" onClick={() => setUnfolded(true)} className="font-sans text-xs text-faint hover:text-accent">
            {hidden} more {hidden === 1 ? 'line' : 'lines'}
          </button>
        )}
      </div>
      {foldable && (
        <button
          type="button"
          onClick={() => setUnfolded((u) => !u)}
          aria-expanded={unfolded}
          aria-label={unfolded ? 'Show less' : 'Show all of it'}
          title={unfolded ? 'Show less' : 'Show all of it'}
          className="grid size-6 shrink-0 place-items-center rounded-md text-faint transition-colors hover:bg-raised hover:text-ink"
        >
          <ChevronDownIcon className={clsx('text-[13px] transition-transform duration-200', unfolded && 'rotate-180')} />
        </button>
      )}
    </div>
  );
}

export default function ClassTable({ args }: { args: string }) {
  const classes = useMemo(() => expandClasses(args), [args]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let live = true;
    (ready ??= init()).then(() => live && setLoaded(true));
    return () => {
      live = false;
    };
  }, []);

  const rows: ClassRow[] = useMemo(
    () =>
      classes.map((cls) => {
        if (!loaded) return { cls };
        const blocks = prettyRules(rulesFor(cls));
        // a class with a variant (hover:, md:) depends on a state the table doesn't have: no mark
        const webOnly = !cls.includes(':') && !worksOnNative(resolve_style_json(cls, themeJson, 'light', false, 1600));
        return { cls, swatch: swatchColor(blocks), styles: <StyleCell blocks={blocks} />, webOnly };
      }),
    [classes, loaded],
  );

  return <ClassTableFrame rows={rows} />;
}
