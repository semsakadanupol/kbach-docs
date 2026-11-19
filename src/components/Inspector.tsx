import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { clsx } from '@kbach/react';
import { cssForClass, isKnownClass, suggestFor } from '../playground/engine';
import type { Trail } from '../playground/sourceMap';
import { ChevronDownIcon, CloseIcon, CodeIcon } from './icons';

type Sides = { t: number; r: number; b: number; l: number };

/** What the canvas says about the selected element (canvas-runtime.js, info()). */
export interface InspectInfo {
  trail: Trail | null;
  tag: string;
  id: string;
  classes: string[];
  /** classes switched off here, for now */
  off: string[];
  width: number;
  height: number;
  box: { margin: Sides; border: Sides; padding: Sides };
  styles: Record<string, string>;
  ancestors: { name: string; trail: Trail }[];
  children: number;
  text: string;
}

// values that say nothing about an element: left out of the computed list
const DULL = new Set(['none', 'normal', 'auto', '0px', 'static', 'visible', 'rgba(0, 0, 0, 0)', 'start', 'row', 'stretch', '0px none rgb(0, 0, 0)']);
const COLOR = /(?:rgba?|oklch|hsla?)\([^)]*\)|#[0-9a-f]{3,8}\b/i;

function n(v: number) {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

/** The box model as nested boxes: margin, border, padding, content. */
function BoxModel({ info }: { info: InspectInfo }) {
  const { margin: m, border: b, padding: p } = info.box;
  const contentW = info.width - b.l - b.r - p.l - p.r;
  const contentH = info.height - b.t - b.b - p.t - p.b;
  const ring = (label: string, s: Sides, cls: string, inner: ReactNode) => (
    <div className={clsx('relative rounded-sm border border-dashed px-6 py-4 text-center', cls)}>
      <span className="absolute top-0.5 left-1.5 text-[10px] text-ink/60">{label}</span>
      <span className="absolute top-0.5 left-1/2 -translate-x-1/2">{n(s.t)}</span>
      <span className="absolute top-1/2 right-1.5 -translate-y-1/2">{n(s.r)}</span>
      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2">{n(s.b)}</span>
      <span className="absolute top-1/2 left-1.5 -translate-y-1/2">{n(s.l)}</span>
      {inner}
    </div>
  );
  return (
    <div className="font-mono text-[11px] text-ink">
      {ring(
        'margin',
        m,
        'border-amber-6/50 bg-amber-6/12',
        ring(
          'border',
          b,
          'border-yellow-6/60 bg-yellow-4/20',
          ring(
            'padding',
            p,
            'border-emerald-6/50 bg-emerald-6/15',
            <div className="mx-auto rounded-sm border border-sky-6/50 bg-sky-6/20 px-2 py-1.5 whitespace-nowrap">
              {n(contentW)} × {n(contentH)}
            </div>,
          ),
        ),
      )}
    </div>
  );
}

function ClassRow({
  cls,
  on,
  editable,
  onToggle,
  onRemove,
  onFix,
}: {
  cls: string;
  on: boolean;
  editable: boolean;
  onToggle: (on: boolean) => void;
  onRemove: () => void;
  onFix: (fix: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const known = isKnownClass(cls);
  const fix = known ? null : suggestFor(cls);
  const css = known ? cssForClass(cls) : '';
  return (
    <li className="group/row">
      <div className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-raised/60">
        <input
          type="checkbox"
          checked={on}
          onChange={(e) => onToggle(e.target.checked)}
          aria-label={(on ? 'Turn off ' : 'Turn on ') + cls + ' (just here, for now)'}
          title="Turn it off and on, here only: the code stays as it is"
          className="size-3.5 shrink-0 cursor-pointer accent-gold"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          disabled={!css}
          aria-expanded={css ? open : undefined}
          className={clsx(
            'min-w-0 flex-1 truncate text-left font-mono text-[12.5px] disabled:cursor-default',
            !on && 'line-through opacity-50',
            known ? 'text-accent' : 'text-red-7 dark:text-red-4',
          )}
          title={css ? 'Show its CSS' : 'No Kbach class by this name'}
        >
          {cls}
        </button>
        {!known &&
          (fix && editable ? (
            <button
              type="button"
              onClick={() => onFix(fix)}
              className="shrink-0 rounded border border-amber-6/40 bg-amber-6/10 px-1.5 font-mono text-[11px] text-amber-8 hover:bg-amber-6/20 dark:text-amber-4"
              title={'Replace with ' + fix + ' in the code'}
            >
              → {fix}
            </button>
          ) : (
            <span className="shrink-0 rounded bg-red-6/10 px-1.5 text-[11px] text-red-7 dark:text-red-4">unknown</span>
          ))}
        {css && <ChevronDownIcon className={clsx('shrink-0 text-xs text-faint transition-transform', open && 'rotate-180')} />}
        {editable && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={'Remove ' + cls + ' from the code'}
            title="Remove it from the code"
            className="grid size-5 shrink-0 place-items-center rounded text-faint opacity-0 transition hover:bg-raised hover:text-ink group-hover/row:opacity-100 focus-visible:opacity-100"
          >
            <CloseIcon className="text-[11px]" />
          </button>
        )}
      </div>
      {open && css && <pre className="mx-1.5 mb-1 overflow-x-auto rounded-md bg-code px-3 py-2 font-mono text-[11.5px] leading-5 text-[#9fd3c7]">{css}</pre>}
    </li>
  );
}

/**
 * The inspector's panel for the element picked in the canvas: where it is
 * (breadcrumb), its classes with their CSS, its box model and the computed
 * styles that matter. Classes can be switched off live (only in the canvas),
 * or added and removed in the code when the element has a place there.
 */
export function Inspector({
  info,
  inSource,
  onClose,
  onSelect,
  onHover,
  onToggleClass,
  onAddClass,
  onRemoveClass,
  onReplaceClass,
  onGoToCode,
}: {
  info: InspectInfo;
  /** whether the element has a tag in index.html (the script didn't make it) */
  inSource: boolean;
  onClose: () => void;
  onSelect: (trail: Trail) => void;
  onHover: (trail: Trail | null) => void;
  onToggleClass: (cls: string, on: boolean) => void;
  onAddClass: (cls: string) => void;
  onRemoveClass: (cls: string) => void;
  onReplaceClass: (from: string, to: string) => void;
  onGoToCode: () => void;
}) {
  const [adding, setAdding] = useState('');
  const classes = [...info.classes, ...info.off.filter((c) => !info.classes.includes(c))];
  const parent = info.ancestors.length > 1 ? info.ancestors[info.ancestors.length - 1] : null;
  const styles = Object.entries(info.styles).filter(([k, v]) => k === 'display' || k === 'position' || !DULL.has(v));
  const newClass = adding.trim();
  const newKnown = newClass ? newClass.split(/\s+/).every((c) => isKnownClass(c)) : true;

  const add = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !newClass) return;
    for (const c of newClass.split(/\s+/)) onAddClass(c);
    setAdding('');
  };

  return (
    <aside aria-label="Inspector" className="flex min-h-0 flex-col bg-card text-sm">
      <div className="flex shrink-0 items-center gap-2 border-b border-line bg-panel px-3 py-2">
        <span className="min-w-0 flex-1 truncate font-mono text-[12.5px]">
          <span className="text-[#c26d43] dark:text-[#e5a07e]">&lt;{info.tag}</span>
          {info.id && <span className="text-sky-7 dark:text-sky-4"> #{info.id}</span>}
          <span className="text-[#c26d43] dark:text-[#e5a07e]">&gt;</span>
          <span className="ml-2 text-faint">
            {n(info.width)} × {n(info.height)}
          </span>
        </span>
        <button
          type="button"
          onClick={onGoToCode}
          disabled={!inSource}
          title={inSource ? 'Show it in index.html' : 'The script made this element: it isn’t in index.html'}
          className="flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted transition-colors enabled:hover:bg-raised enabled:hover:text-ink disabled:opacity-40"
        >
          <CodeIcon className="text-sm" /> Code
        </button>
        <button type="button" onClick={onClose} aria-label="Close the inspector" className="grid size-7 shrink-0 place-items-center rounded-md text-faint hover:bg-raised hover:text-ink">
          <CloseIcon className="text-sm" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {/* where it is */}
        <nav aria-label="Element path" className="flex flex-wrap items-center gap-x-1 gap-y-0.5 border-b border-line px-3 py-2 font-mono text-[11.5px] text-faint">
          {info.ancestors.map((a, i) => (
            <span key={i} className="flex min-w-0 items-center gap-1">
              <button
                type="button"
                disabled={a.trail.length === 0}
                onClick={() => onSelect(a.trail)}
                onPointerEnter={() => a.trail.length && onHover(a.trail)}
                onPointerLeave={() => onHover(null)}
                className="max-w-40 truncate rounded px-0.5 enabled:hover:bg-raised enabled:hover:text-ink"
              >
                {a.name}
              </button>
              <span aria-hidden="true">›</span>
            </span>
          ))}
          <span className="font-semibold text-ink">{info.tag}</span>
          {parent && parent.trail.length > 0 && (
            <button type="button" onClick={() => onSelect(parent.trail)} className="ml-auto rounded px-1.5 font-sans text-[11px] text-muted hover:bg-raised hover:text-ink" title="Select the parent element">
              ↑ Parent
            </button>
          )}
        </nav>

        {!inSource && (
          <p className="border-b border-line bg-violet-6/8 px-3 py-2 text-xs text-violet-8 dark:text-violet-3">
            The script made this element, so it isn’t in index.html. Its classes can still be switched off here.
          </p>
        )}

        {/* classes */}
        <section className="border-b border-line px-1.5 py-2">
          <h3 className="mb-1 px-1.5 text-[11px] font-semibold tracking-wider text-faint uppercase">Classes</h3>
          {classes.length === 0 ? (
            <p className="px-1.5 py-1 text-xs text-faint">No classes.</p>
          ) : (
            <ul>
              {classes.map((cls) => (
                <ClassRow
                  key={cls}
                  cls={cls}
                  on={!info.off.includes(cls)}
                  editable={inSource}
                  onToggle={(on) => onToggleClass(cls, on)}
                  onRemove={() => onRemoveClass(cls)}
                  onFix={(fix) => onReplaceClass(cls, fix)}
                />
              ))}
            </ul>
          )}
          {inSource && (
            <div className="mt-1 px-1.5">
              <input
                value={adding}
                onChange={(e) => setAdding(e.target.value)}
                onKeyDown={add}
                placeholder="Add a class, then Enter"
                aria-label="Add a class to this element in the code"
                spellCheck={false}
                autoCapitalize="off"
                className={clsx(
                  'h-8 w-full rounded-md border bg-transparent px-2 font-mono text-[12.5px] text-ink outline-none placeholder:font-sans placeholder:text-faint focus:ring-2',
                  newKnown ? 'border-line focus:border-gold focus:ring-gold/20' : 'border-amber-6/60 focus:ring-amber-6/20',
                )}
              />
              {!newKnown && <p className="mt-1 text-[11px] text-amber-8 dark:text-amber-4">Not a Kbach class{suggestFor(newClass.split(/\s+/).find((c) => !isKnownClass(c)) ?? '') ? ': did you mean ' + suggestFor(newClass.split(/\s+/).find((c) => !isKnownClass(c))!) + '?' : ''}</p>}
            </div>
          )}
        </section>

        {/* box model */}
        <section className="border-b border-line px-3 py-3">
          <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-faint uppercase">Box model</h3>
          <BoxModel info={info} />
        </section>

        {/* computed */}
        <section className="px-3 py-3">
          <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-faint uppercase">Computed</h3>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 font-mono text-[11.5px]">
            {styles.map(([k, v]) => {
              const color = COLOR.exec(v)?.[0];
              return (
                <div key={k} className="contents">
                  <dt className="text-faint">{k}</dt>
                  <dd className="min-w-0 truncate text-ink" title={v}>
                    {color && <span aria-hidden="true" style={{ background: color }} className="mr-1.5 inline-block size-2.5 -translate-y-px rounded-sm align-middle ring-1 ring-black/15 dark:ring-white/20" />}
                    {v}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      </div>
    </aside>
  );
}
