// Theme, in React: the same page as the HTML version. Every color is a name from
// kbach.config.js: change one there and the page follows, in both modes. The mode is Kbach's
// own store (useTheme), the values are Kbach's theme (getTheme), both from @kbach/react.
import { useState } from 'react';
import { clsx, getTheme, useTheme } from '@kbach/react';

const COLORS = [
  {
    name: 'brand',
    swatch: 'bg-brand',
    use: 'bg-brand · text-brand · ring-brand/30',
  },
  {
    name: 'accent',
    swatch: 'bg-accent',
    use: 'text-accent: the brand, readable as text',
  },
  {
    name: 'surface',
    swatch: 'bg-surface',
    use: 'bg-surface: the page',
  },
  {
    name: 'card',
    swatch: 'bg-card',
    use: 'bg-card: what sits on the page',
  },
  {
    name: 'well',
    swatch: 'bg-well',
    use: 'bg-well: fields, tracks, quiet fills',
  },
  { name: 'ink', swatch: 'bg-ink', use: 'text-ink: words' },
  {
    name: 'muted',
    swatch: 'bg-muted',
    use: 'text-muted: the quieter words',
  },
  {
    name: 'success',
    swatch: 'bg-success',
    use: 'text-success · bg-success/10',
  },
];

const MODES = [
  {
    id: 'light',
    label: 'Light',
    place: '',
    icon: (
      <path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    ),
  },
  {
    id: 'dark',
    label: 'Dark',
    place: 'translate-x-full',
    icon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  },
  {
    id: 'system',
    label: 'Auto',
    place: 'translate-x-[200%]',
    icon: (
      <path d="M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 21h8M12 17v4" />
    ),
  },
];

// The theme Kbach made from kbach.config.js: each name resolved to its real values
const { colors } = getTheme();

/** A color's two values, as Kbach resolved them (a color for both modes is one value). */
function Values({ name }) {
  const value = colors[name];
  const pair = typeof value === 'string' ? { light: value, dark: value } : value;
  return (
    <span className="hidden shrink-0 space-y-0.5 text-right text-xs text-muted sm:block">
      {Object.entries(pair).map(([mode, hex]) => (
        <span key={mode} className="flex items-center justify-end gap-1.5">
          {mode} <code>{hex}</code>
          <i className="size-2.5 rounded-full ring-1 ring-ink/10" style={{ background: hex }} />
        </span>
      ))}
    </span>
  );
}

function Player() {
  const [playing, setPlaying] = useState(true);
  return (
    // the same names, used: a player made only of them
    <section className="self-start rounded-3xl border border-line bg-card p-6 shadow-xl shadow-ink/5 transition-colors duration-300 lg:col-span-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wider text-muted uppercase">Now playing</p>
        <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
          <svg
            viewBox="0 0 24 24"
            className="size-3 fill-none stroke-current stroke-[3]"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Saved
        </span>
      </div>
      {/* the record: it turns while it plays, and stops where it is (animation-play-state) */}
      <div className="mx-auto mt-6 grid size-44 place-items-center rounded-full bg-linear-to-br from-brand to-ink shadow-2xl shadow-brand/30">
        <div
          className={clsx(
            'grid size-full place-items-center rounded-full bg-[repeating-radial-gradient(circle,transparent_0_6px,rgb(255_255_255/0.06)_6px_7px)] motion-safe:animate-record',
            !playing && '[animation-play-state:paused]',
          )}
        >
          <span className="size-12 rounded-full bg-card ring-4 ring-brand/40" />
        </div>
      </div>
      <div className="mt-6 text-center">
        <h2 className="truncate text-lg font-bold">Monsoon Evenings</h2>
        <p className="truncate text-sm text-muted">The Riverside Quartet</p>
      </div>
      {/* how far in: the bar in the brand color, on a well */}
      <div className="mt-5">
        <div className="h-1.5 overflow-hidden rounded-full bg-well">
          <div className="h-full w-2/5 rounded-full bg-brand" />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-muted tabular-nums">
          <span>1:24</span>
          <span>3:38</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-5">
        <button
          aria-label="Back"
          className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-well hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="size-5 fill-current">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
          </svg>
        </button>
        <button
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? 'Pause' : 'Play'}
          className="grid size-14 place-items-center rounded-full bg-brand text-white shadow-lg shadow-brand/30 transition hover:scale-105 active:scale-95"
        >
          {/* a key per state: the new icon swaps in */}
          <svg
            key={String(playing)}
            viewBox="0 0 24 24"
            className="size-6 fill-current motion-safe:animate-swap"
          >
            <path d={playing ? 'M6 5h4v14H6zM14 5h4v14h-4z' : 'M8 5v14l11-7z'} />
          </svg>
        </button>
        <button
          aria-label="Next"
          className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-well hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="size-5 fill-current">
            <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
          </svg>
        </button>
      </div>
    </section>
  );
}

export default function App() {
  // Kbach's own dark mode store: setMode puts the dark class on <html> (darkMode: 'class' in
  // kbach.config.js), and 'system' follows the system
  const { mode, setMode } = useTheme();
  return (
    <main className="mx-auto max-w-5xl py-6 sm:py-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent">kbach.config.js</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Your colors, both modes</h1>
          <p className="mt-2 max-w-md text-pretty text-muted">
            Each name below is a color with a light and a dark value. Switch the mode and watch them
            change.
          </p>
        </div>
        {/* light, dark or the system's: the pill slides under the one picked */}
        <div
          role="group"
          aria-label="Mode"
          className="relative grid shrink-0 grid-cols-3 rounded-full bg-well p-1 text-sm font-medium"
        >
          <span
            className={clsx(
              'absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-card shadow-sm ring-1 ring-line transition-transform duration-300 ease-out',
              MODES.find((m) => m.id === mode).place,
            )}
          />
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              aria-pressed={m.id === mode}
              className={clsx(
                'relative flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 transition-colors',
                m.id !== mode && 'text-muted',
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className="size-4 fill-none stroke-current stroke-2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {m.icon}
              </svg>
              {m.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        {/* the colors: a swatch, its name, the class, and its two values */}
        <section className="rounded-3xl border border-line bg-card p-2 lg:col-span-3">
          <ul className="divide-y divide-line">
            {COLORS.map((c) => (
              <li key={c.name} className="flex items-center gap-4 p-3">
                <span
                  className={clsx(
                    'size-10 shrink-0 rounded-xl ring-1 ring-ink/10 transition-colors duration-300',
                    c.swatch,
                  )}
                />
                <span className="min-w-0 flex-1">
                  <b className="block text-sm font-semibold">{c.name}</b>
                  <code className="text-xs text-muted">{c.use}</code>
                </span>
                <Values name={c.name} />
              </li>
            ))}
          </ul>
        </section>
        <Player />
      </div>
    </main>
  );
}
