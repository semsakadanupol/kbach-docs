'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { clsx } from '@kbach/react';
import { colorForClass, themeColorNames } from '../playground/engine';
import { CONTROLS, STATES, changeFor, currentClass, splitColor, type Control, type DesignState } from '../playground/design';
import { CloseIcon } from './icons';

// The Inspector's Design tab: the picked element's look as controls (colors, spacing, shape,
// text, layout). Every change writes a Kbach class into the code (playground/design.ts says
// which class each control owns), in the chosen state: always, hover, dark or md and up.

const isColor = (cls: string) => colorForClass(cls) !== null;
const SKIP_COLORS = new Set(['transparent', 'current', 'inherit', 'currentColor']);

export function DesignPanel({
  classes,
  editable,
  readOnlyReason,
  onChange,
}: {
  classes: string[];
  editable: boolean;
  /** why the code can't be changed for this element (shown instead of the controls' effect) */
  readOnlyReason: string;
  onChange: (remove: string[], add: string[]) => void;
}) {
  const [state, setState] = useState<DesignState>(STATES[0]);
  const set = (control: Control, value: string | null) => {
    if (!editable) return;
    const { remove, add } = changeFor(classes, control, state, value, isColor);
    if (remove.length || add.length) onChange(remove, add);
  };

  return (
    <div className="text-sm">
      {!editable && <p className="border-b border-line bg-violet-6/8 px-3 py-2 text-xs text-violet-8 dark:text-violet-3">{readOnlyReason}</p>}

      {/* the state the controls write for */}
      <div role="group" aria-label="When it applies" className="sticky top-0 z-10 flex gap-1 border-b border-line bg-card px-3 py-2">
        {STATES.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={state.id === s.id}
            onClick={() => setState(s)}
            title={s.prefix ? 'Write ' + s.prefix + '… classes' : 'Write plain classes, always applied'}
            className={clsx(
              'flex-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors',
              state.id === s.id ? 'bg-ink text-page' : 'bg-raised text-muted hover:text-ink active:text-ink',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <fieldset disabled={!editable} className={clsx('min-w-0', !editable && 'opacity-60')}>
        {CONTROLS.map((g) => (
          <section key={g.group} className="border-b border-line px-3 py-3">
            <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-faint uppercase">{g.group}</h3>
            <div className="space-y-2.5">
              {g.controls.map((c) => (
                <ControlRow key={c.id} control={c} current={currentClass(classes, c, state, isColor)} prefix={state.prefix} onSet={(v) => set(c, v)} />
              ))}
            </div>
          </section>
        ))}
      </fieldset>
    </div>
  );
}

function ControlRow({ control, current, prefix, onSet }: { control: Control; current: string | null; prefix: string; onSet: (value: string | null) => void }) {
  const head = (
    <div className="flex min-w-0 items-center gap-2">
      <span className="w-24 shrink-0 text-xs text-muted">{control.label}</span>
      <code className={clsx('min-w-0 flex-1 truncate font-mono text-[11.5px]', current ? 'text-accent' : 'text-faint')}>{current ? prefix + current : '—'}</code>
      {current && (
        <button type="button" onClick={() => onSet(null)} aria-label={'Remove ' + prefix + current} title="Remove this class" className="grid size-5 shrink-0 place-items-center rounded text-faint hover:bg-raised hover:text-ink active:bg-raised active:text-ink">
          <CloseIcon className="text-[11px]" />
        </button>
      )}
    </div>
  );
  if (control.kind === 'color') return <ColorControl control={control} current={current} head={head} onSet={onSet} />;
  if (control.kind === 'segments')
    return (
      <div>
        {head}
        <div className="mt-1.5 flex gap-1">
          {control.options!.map((o) => (
            <button
              key={o.cls}
              type="button"
              aria-pressed={current === o.cls}
              onClick={() => onSet(current === o.cls ? null : o.cls)}
              className={clsx('flex-1 rounded-md border px-1.5 py-1 text-xs transition-colors', current === o.cls ? 'border-gold/60 bg-gold/15 text-accent' : 'border-line text-muted hover:text-ink active:text-ink')}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    );
  // select: the scale, with what's there now even if it isn't one of the steps
  const options = control.options!;
  const known = !current || options.some((o) => o.cls === current);
  return (
    <label className="flex min-w-0 items-center gap-2">
      <span className="w-24 shrink-0 text-xs text-muted">{control.label}</span>
      <select
        value={current ?? ''}
        onChange={(e) => onSet(e.target.value || null)}
        aria-label={control.label}
        className="h-7 min-w-0 flex-1 rounded-md border border-line bg-card px-1.5 font-mono text-[11.5px] text-ink outline-none focus:border-gold pointer-coarse:h-9"
      >
        <option value="">— none</option>
        {!known && <option value={current!}>{prefix + current}</option>}
        {options.map((o) => (
          <option key={o.cls} value={o.cls}>
            {prefix + o.cls} {o.label !== o.cls.split('-').pop() ? '(' + o.label + ')' : ''}
          </option>
        ))}
      </select>
    </label>
  );
}

/** A color: its family (a row of dots), then one of its 12 shades; the config's own colors too. */
function ColorControl({ control, current, head, onSet }: { control: Control; current: string | null; head: ReactNode; onSet: (value: string | null) => void }) {
  const names = themeColorNames();
  const { families, singles } = useMemo(() => {
    const fam = new Map<string, number[]>();
    const one: string[] = [];
    for (const n of names) {
      if (SKIP_COLORS.has(n)) continue;
      const { family, shade } = splitColor(n);
      if (shade === null) one.push(n);
      else fam.set(family, [...(fam.get(family) ?? []), shade].sort((a, b) => a - b));
    }
    return { families: [...fam.entries()].filter(([, s]) => s.length >= 10), singles: one };
  }, [names]);
  const currentName = current ? current.slice(control.utility.length + 1).replace(/\/\d+$/, '') : null;
  const currentFamily = currentName ? splitColor(currentName).family : null;
  const [family, setFamily] = useState<string>(() => (currentFamily && families.some(([f]) => f === currentFamily) ? currentFamily : (families[0]?.[0] ?? 'slate')));
  const shades = families.find(([f]) => f === family)?.[1] ?? [];
  const swatch = (name: string) => colorForClass('bg-' + name);

  return (
    <div>
      {head}
      {/* families: one dot each, at shade 6 */}
      <div className="mt-1.5 flex gap-1 overflow-x-auto pb-1 [scrollbar-width:thin]" role="group" aria-label={control.label + ' color family'}>
        {families.map(([f]) => (
          <button
            key={f}
            type="button"
            onClick={() => setFamily(f)}
            aria-pressed={f === family}
            title={f}
            style={{ background: swatch(f + '-6') ?? undefined }}
            className={clsx('size-5 shrink-0 rounded-full ring-offset-1 ring-offset-card transition pointer-coarse:size-7', f === family ? 'ring-2 ring-ink' : 'ring-1 ring-black/10 dark:ring-white/15')}
          />
        ))}
      </div>
      {/* the family's shades, 1 (lightest) to 12 (darkest) */}
      <div className="mt-1 grid grid-cols-12 gap-0.5" role="group" aria-label={family + ' shades'}>
        {shades.map((s) => {
          const name = family + '-' + s;
          const on = currentName === name;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onSet(control.utility + '-' + name)}
              aria-pressed={on}
              aria-label={control.utility + '-' + name}
              title={control.utility + '-' + name}
              style={{ background: swatch(name) ?? undefined }}
              className={clsx('h-6 rounded-sm transition hover:scale-110 pointer-coarse:h-8', on ? 'ring-2 ring-ink ring-offset-1 ring-offset-card' : 'ring-1 ring-black/5 dark:ring-white/10')}
            />
          );
        })}
      </div>
      {singles.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1" role="group" aria-label={control.label + ': single colors'}>
          {singles.map((n) => {
            const on = currentName === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onSet(control.utility + '-' + n)}
                aria-pressed={on}
                title={control.utility + '-' + n}
                className={clsx('flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[11px] transition-colors', on ? 'border-gold/60 bg-gold/15 text-accent' : 'border-line text-muted hover:text-ink active:text-ink')}
              >
                <span className="size-3 rounded-sm ring-1 ring-black/10 dark:ring-white/15" style={{ background: swatch(n) ?? undefined }} />
                {n}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
