// Colors, in React: the same page as the HTML version. The palette is Kbach's own (getTheme,
// useColors from @kbach/react); bg-rose-6 and the rest are real classes, and kbach.css makes each
// one's CSS the moment it's on the page.
import { useRef, useState } from 'react';
import { clsx, getTheme, useColors } from '@kbach/react';

const SHADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const ROW = 'grid grid-cols-[4.5rem_repeat(12,minmax(0,1fr))] gap-1.5';

/** Hue (0–360) and saturation (0–1) of a #rrggbb, to put the families in the order of the color wheel. */
function hueOf(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  const s = max === 0 ? 0 : d / max;
  if (!d) return { h: 0, s };
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s };
}

// the families, from Kbach's palette (getTheme: the theme, every color resolved): every name with
// all twelve shades; the grays first (slate is the most colorful of them, at 0.28; every bright
// family is over 0.6), then around the wheel
const palette = getTheme().colors;
const gray = (x) => x.s < 0.35;
const FAMILIES = [...new Set(Object.keys(palette).map((k) => /^([a-z]+)-\d+$/.exec(k)?.[1]))]
  .filter((f) => f && SHADES.every((s) => typeof palette[f + '-' + s] === 'string'))
  .map((f) => ({ f, ...hueOf(palette[f + '-6']) }))
  .sort((a, b) => Number(gray(b)) - Number(gray(a)) || a.h - b.h)
  .map((x) => x.f);

/** "Copied": pops in at the bottom, then goes. */
function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef();
  const copy = async (text) => {
    let said = text;
    try {
      await navigator.clipboard.writeText(text);
      said = 'Copied ' + text;
    } catch {
      // no clipboard here: just show it
    }
    setToast({ text: said, at: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 1600);
  };
  return [toast, copy];
}

export default function App() {
  const [picked, setPicked] = useState({ family: 'violet', shade: 6 });
  const [toast, copy] = useToast();
  // the colors as real values (useColors from @kbach/react): colors.violet[6] is "#8b5cf6"
  const colors = useColors();
  const name = picked.family + '-' + picked.shade;

  const pick = (family, shade) => {
    setPicked({ family, shade });
    copy('bg-' + family + '-' + shade);
  };

  return (
    <main className="mx-auto max-w-5xl py-6 sm:py-10">
      <header>
        <p className="text-sm font-semibold text-muted">The palette</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">26 families, 12 shades each</h1>
        <p className="mt-2 max-w-xl text-pretty text-muted">
          1 is the lightest and 12 the darkest; 6 is the color at its truest. Pick a shade to see it
          up close, and copy its class.
        </p>
      </header>

      {/* the picked color: big, with its classes to copy and how text reads on it */}
      <section className="mt-8 grid gap-4 rounded-3xl border border-line bg-card p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:p-5">
        <div
          className={clsx(
            'flex h-40 flex-col justify-between rounded-2xl p-5 transition-colors duration-300 sm:h-auto',
            'bg-' + name,
            picked.shade >= 6 ? 'text-white' : 'text-zinc-11',
          )}
        >
          <span className="text-2xl font-bold">{name}</span>
          <span className="font-mono text-sm opacity-80">
            {colors[picked.family][picked.shade]}
          </span>
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-muted uppercase">
              Copy a class
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {['bg', 'text', 'border', 'ring'].map((p) => (
                <button
                  key={p}
                  onClick={() => copy(p + '-' + name)}
                  className="rounded-lg bg-well px-2.5 py-1.5 font-mono text-xs transition hover:bg-ink hover:text-surface active:scale-95"
                >
                  {p}-{name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-muted uppercase">Text on it</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm font-semibold">
              <span
                className={clsx('rounded-xl bg-white px-4 py-3 ring-1 ring-line', 'text-' + name)}
              >
                On white
              </span>
              <span
                className={clsx('rounded-xl bg-black px-4 py-3 ring-1 ring-line', 'text-' + name)}
              >
                On black
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* the grid: a row a family, a column a shade; it scrolls sideways on a very small phone */}
      <div className="mt-8 overflow-x-auto pb-2">
        <div className="min-w-[34rem] space-y-1.5">
          <div className={clsx(ROW, 'text-center text-[11px] text-muted')}>
            <span />
            {SHADES.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          {FAMILIES.map((f) => (
            <div key={f} className={clsx(ROW, 'items-center')}>
              <span className="truncate text-xs font-medium text-muted capitalize">{f}</span>
              {SHADES.map((s) => {
                const on = f === picked.family && s === picked.shade;
                return (
                  <button
                    key={s}
                    onClick={() => pick(f, s)}
                    title={'bg-' + f + '-' + s}
                    aria-label={f + ' ' + s}
                    aria-pressed={on}
                    className={clsx(
                      'aspect-[4/3] rounded-md ring-ink ring-offset-2 ring-offset-surface transition duration-200 hover:z-10 hover:scale-125 hover:shadow-lg',
                      'bg-' + f + '-' + s,
                      on && 'ring-2',
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* centered by its row, so the pop's scale doesn't fight a translate */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 flex justify-center">
        {toast && (
          <p
            key={toast.at}
            role="status"
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-surface shadow-xl motion-safe:animate-pop"
          >
            {toast.text}
          </p>
        )}
      </div>
    </main>
  );
}
