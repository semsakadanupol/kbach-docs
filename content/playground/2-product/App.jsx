// Product card, in React: the same page as the HTML version, with state where the script was.
// surface, card, well, line, ink, muted, brand and accent come from kbach.config.js and follow
// light and dark mode, so no class here needs a dark: twin for them.
import { useState } from 'react';
import { clsx } from '@kbach/react';

const COLORS = [
  { id: 'midnight', name: 'Midnight', gradient: 'from-zinc-6 to-zinc-10' },
  { id: 'sand', name: 'Sand', gradient: 'from-amber-4 to-orange-7' },
  { id: 'sky', name: 'Sky', gradient: 'from-sky-4 to-indigo-7' },
  { id: 'rose', name: 'Rose', gradient: 'from-pink-4 to-rose-7' },
];

const PERKS = [
  {
    title: 'Free shipping',
    text: 'In 2–4 days',
    icon: [
      'M1 3h15v13H1z',
      'M16 8h4l3 3v5h-7z',
      'M8 18.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM21 18.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z',
    ],
  },
  {
    title: '2-year warranty',
    text: 'Parts and repair',
    icon: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  },
  {
    title: '30-day returns',
    text: 'No questions',
    icon: ['M1 4v6h6', 'M3.51 15a9 9 0 1 0 2.13-9.36L1 10'],
  },
];

const STAR =
  '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2';

/** A line icon: one or more paths, drawn in the text color. */
function Icon({ paths, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={clsx('fill-none stroke-current stroke-2', className)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export default function App() {
  const [favorite, setFavorite] = useState(false);
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [count, setCount] = useState(1);
  // idle → adding → added → idle
  const [bag, setBag] = useState('idle');

  const addToBag = () => {
    setBag('adding');
    setTimeout(() => {
      setBag('added');
      setTimeout(() => setBag('idle'), 1600);
    }, 600);
  };

  return (
    <main className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-4xl place-items-center">
      <article className="grid w-full overflow-hidden rounded-3xl border border-line bg-card shadow-xl shadow-ink/5 md:grid-cols-2">
        {/* the picture: one gradient per color, cross-fading into each other */}
        <div className="relative isolate grid aspect-square place-items-center overflow-hidden md:aspect-auto">
          {COLORS.map((c) => (
            <div
              key={c.id}
              className={clsx(
                'absolute inset-0 -z-10 bg-linear-to-br transition-opacity duration-500',
                c.gradient,
                c !== color && 'opacity-0',
              )}
            />
          ))}
          <div className="absolute -bottom-16 left-1/2 -z-10 h-32 w-3/4 -translate-x-1/2 rounded-full bg-black/20 blur-2xl" />

          <svg
            viewBox="0 0 24 24"
            className="size-40 fill-none stroke-white stroke-[1.25] drop-shadow-xl motion-safe:animate-float sm:size-48"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
          </svg>

          <span className="absolute top-4 left-4 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-zinc-11 shadow-sm backdrop-blur">
            New
          </span>
          <button
            onClick={() => setFavorite(!favorite)}
            aria-pressed={favorite}
            aria-label="Save to favorites"
            className={clsx(
              'absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110 hover:text-rose-6 active:scale-95',
              favorite ? 'text-rose-6' : 'text-zinc-7',
            )}
          >
            {/* a key per state: the heart pops when it changes */}
            <svg
              key={String(favorite)}
              viewBox="0 0 24 24"
              className={clsx(
                'size-5 stroke-current stroke-2',
                favorite ? 'fill-current motion-safe:animate-pop' : 'fill-none',
              )}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold tracking-wider text-accent uppercase">
              Aurora Audio
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              Studio Wireless Headphones
            </h1>
            {/* the rating: five stars, the number and the count on one line */}
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <div className="flex text-amber-5" aria-label="4.8 out of 5 stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <svg
                    key={n}
                    viewBox="0 0 24 24"
                    className={clsx('size-4 fill-current', n === 5 && 'opacity-40')}
                  >
                    <polygon points={STAR} />
                  </svg>
                ))}
              </div>
              <span className="font-semibold">4.8</span>
              <a href="#" className="text-muted underline-offset-4 hover:text-ink hover:underline">
                1,284 reviews
              </a>
            </div>
          </div>

          {/* the price: the old one struck through, and how much is off */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold tabular-nums">${249 * count}</span>
            <span className="text-muted tabular-nums line-through">${299 * count}</span>
            <span className="rounded-full bg-emerald-6/10 px-2 py-0.5 text-xs font-semibold text-emerald-7 dark:text-emerald-4">
              Save 17%
            </span>
          </div>

          {/* three lines, then "Read more" shows the rest */}
          <div>
            <p className={clsx('text-sm leading-6 text-muted', !open && 'line-clamp-3')}>
              Forty hours on a charge, noise cancelling that adapts to the room, and ear cushions in
              soft memory foam that stay comfortable through a whole day of calls. The fold-flat
              design slips into the case, and a quick ten-minute charge gives you five more hours.
              Pair two devices at once and switch between your laptop and phone without a thought.
            </p>
            <button
              onClick={() => setOpen(!open)}
              className="mt-1 text-sm font-semibold text-accent hover:underline"
            >
              {open ? 'Show less' : 'Read more'}
            </button>
          </div>

          <fieldset>
            <legend className="text-sm font-medium">
              Color: <span className="text-muted">{color.name}</span>
            </legend>
            <div className="mt-3 flex gap-3">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c)}
                  aria-label={c.name}
                  aria-pressed={c === color}
                  className={clsx(
                    'size-8 rounded-full bg-linear-to-br ring-2 ring-offset-2 ring-offset-card transition hover:scale-110',
                    c.gradient,
                    c === color ? 'ring-ink' : 'ring-transparent',
                  )}
                />
              ))}
            </div>
          </fieldset>

          {/* how many, and the bag: one row, the button takes the room that's left */}
          <div className="flex gap-3">
            <div className="flex items-center rounded-xl border border-line">
              <button
                onClick={() => setCount(count - 1)}
                disabled={count === 1}
                aria-label="One less"
                className="grid size-11 place-items-center rounded-l-xl text-muted transition hover:bg-well hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <Icon paths={['M5 12h14']} className="size-4" />
              </button>
              <span
                key={count}
                className="w-8 text-center font-semibold tabular-nums motion-safe:animate-pop"
              >
                {count}
              </span>
              <button
                onClick={() => setCount(Math.min(9, count + 1))}
                aria-label="One more"
                className="grid size-11 place-items-center rounded-r-xl text-muted transition hover:bg-well hover:text-ink"
              >
                <Icon paths={['M12 5v14M5 12h14']} className="size-4" />
              </button>
            </div>
            <button
              onClick={addToBag}
              disabled={bag !== 'idle'}
              className={clsx(
                'flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-lg transition active:scale-[0.98]',
                bag === 'added'
                  ? 'bg-emerald-6 shadow-emerald-6/25'
                  : 'bg-brand shadow-brand/25 hover:bg-brand/90',
              )}
            >
              <Icon
                paths={[
                  'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z',
                  'M3 6h18M16 10a4 4 0 0 1-8 0',
                ]}
                className="size-4 shrink-0"
              />
              <span
                key={bag}
                className={clsx('truncate', bag === 'added' && 'motion-safe:animate-rise')}
              >
                {bag === 'adding'
                  ? 'Adding…'
                  : bag === 'added'
                    ? count === 1
                      ? 'Added to bag'
                      : count + ' added to bag'
                    : 'Add to bag'}
              </span>
            </button>
          </div>

          {/* what comes with it: an icon and two lines each, side by side from sm */}
          <ul className="grid gap-3 border-t border-line pt-6 text-sm sm:grid-cols-3">
            {PERKS.map((p) => (
              <li
                key={p.title}
                className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-well text-accent">
                  <Icon paths={p.icon} className="size-4" />
                </span>
                <span className="min-w-0">
                  <b className="block font-semibold">{p.title}</b>
                  <span className="text-muted">{p.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </main>
  );
}
