import { useState } from 'react';
import { clsx, useColors } from '@kbach/react';

const FAMILIES = [
  'gray', 'slate', 'zinc', 'neutral', 'stone', 'mauve', 'olive', 'mist', 'taupe',
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald',
  'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
];
const SHADES = Array.from({ length: 12 }, (_, i) => i + 1);

/** The built-in palette, read at runtime through useColors(). Click a swatch to copy its class. */
export function Palette() {
  const colors = useColors();
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (cls: string) => {
    navigator.clipboard?.writeText(cls);
    setCopied(cls);
    setTimeout(() => setCopied((c) => (c === cls ? null : c)), 1400);
  };

  return (
    <div className="my-8">
      <p className="mb-3 text-sm text-faint">Click a swatch to copy its class name. Hover for the hex value.</p>
      {/* pt-9 -mt-9: room above the top row for the "Copied" label (the scroller would clip it) */}
      <div className="-mt-9 overflow-x-auto pt-9 pb-2">
        <div className="grid min-w-[640px] grid-cols-[5.5rem_repeat(12,minmax(0,1fr))] gap-x-1.5 gap-y-2 items-center">
          <span />
          {SHADES.map((s) => (
            <span key={s} className="text-center font-mono text-[11px] text-faint">
              {s}
            </span>
          ))}
          {FAMILIES.map((f) => (
            <div key={f} className="contents">
              <span className="font-mono text-xs text-muted">{f}</span>
              {SHADES.map((s) => {
                const hex = (colors[f] as Record<number, string>)[s];
                const cls = 'bg-' + f + '-' + s;
                return (
                  <button
                    key={s}
                    type="button"
                    title={cls + '  ' + hex}
                    aria-label={'Copy ' + cls}
                    onClick={() => copy(cls)}
                    style={{ backgroundColor: hex }}
                    className="relative h-9 rounded-md ring-1 ring-inset ring-black/10 dark:ring-white/10 transition-transform hover:scale-110 hover:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:scale-[0.98]"
                  >
                    {copied === cls && (
                      <>
                        {/* on the swatch: a check, and what was copied just above it */}
                        <span className="absolute inset-0 grid place-items-center text-sm font-bold text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.6)]">
                          ✓
                        </span>
                        <span
                          aria-hidden="true"
                          className={clsx(
                            'pointer-events-none absolute bottom-full z-20 mb-1.5 animate-[kbd-fade_150ms_ease-out] rounded-md bg-ink px-2 py-1 font-mono text-[11px] whitespace-nowrap text-page shadow-lg',
                            // kept inside the table at its edges
                            s <= 2 ? 'left-0' : s >= 11 ? 'right-0' : 'left-1/2 -translate-x-1/2',
                          )}
                        >
                          {'Copied {cls}'.replace('{cls}', cls)}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* for screen readers: what was copied */}
      <p className="sr-only" aria-live="polite">
        {copied ? 'Copied {cls}'.replace('{cls}', copied) : ''}
      </p>
    </div>
  );
}
