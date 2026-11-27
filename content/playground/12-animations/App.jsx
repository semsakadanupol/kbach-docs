// Animations, in React: the same page as the HTML version. animate-spin, -ping, -pulse and
// -bounce come with Kbach; wiggle, shimmer, orbit, heartbeat, slide and rise are
// kbach.config.js's keyframes. Each is a class.
import { useState } from 'react';
import { clsx } from '@kbach/react';

// each card: its name, its class, and what it moves
const CARDS = [
  {
    name: 'Spin',
    cls: 'animate-spin',
    show: (
      <svg
        viewBox="0 0 24 24"
        className="size-9 motion-safe:animate-spin fill-none stroke-brand stroke-[3]"
        strokeLinecap="round"
      >
        <path d="M12 3a9 9 0 1 0 9 9" />
      </svg>
    ),
  },
  {
    name: 'Ping',
    cls: 'animate-ping',
    show: (
      <span className="relative flex size-4">
        <span className="absolute inline-flex size-full rounded-full bg-brand opacity-75 motion-safe:animate-ping" />
        <span className="relative inline-flex size-4 rounded-full bg-brand" />
      </span>
    ),
  },
  {
    name: 'Pulse',
    cls: 'animate-pulse',
    box: 'flex items-center gap-3 px-4 motion-safe:animate-pulse',
    show: (
      <>
        <span className="size-10 shrink-0 rounded-full bg-line" />
        <span className="flex-1 space-y-2">
          <span className="block h-2.5 w-4/5 rounded-full bg-line" />
          <span className="block h-2.5 w-3/5 rounded-full bg-line" />
        </span>
      </>
    ),
  },
  {
    name: 'Bounce',
    cls: 'animate-bounce',
    show: (
      <span className="grid size-10 place-items-center rounded-full bg-card shadow-md motion-safe:animate-bounce">
        <svg
          viewBox="0 0 24 24"
          className="size-5 fill-none stroke-brand stroke-2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </span>
    ),
  },
  {
    name: 'Wiggle',
    cls: 'animate-wiggle',
    show: (
      <svg
        viewBox="0 0 24 24"
        className="size-9 origin-top motion-safe:animate-wiggle fill-none stroke-brand stroke-2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    name: 'Shimmer',
    cls: 'animate-shimmer',
    box: 'grid place-items-center px-5',
    // a light that sweeps across: a gradient moved from -100% to 100%
    show: (
      <span className="relative block h-10 w-full overflow-hidden rounded-lg bg-line/70">
        <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/60 to-transparent motion-safe:animate-shimmer dark:via-white/15" />
      </span>
    ),
  },
  {
    name: 'Orbit',
    cls: 'animate-orbit',
    // a ring that turns, carrying a dot
    show: (
      <span className="relative size-14 rounded-full border-2 border-dashed border-brand/40 motion-safe:animate-orbit">
        <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-brand shadow-md shadow-brand/50" />
      </span>
    ),
  },
  {
    name: 'Heartbeat',
    cls: 'animate-heartbeat',
    show: (
      <svg viewBox="0 0 24 24" className="size-10 fill-rose-5 motion-safe:animate-heartbeat">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

// the delay of each card's entrance: the same animation, a later start each
const DELAYS = [
  '',
  '[animation-delay:60ms]',
  '[animation-delay:120ms]',
  '[animation-delay:180ms]',
  '[animation-delay:240ms]',
  '[animation-delay:300ms]',
  '[animation-delay:360ms]',
  '[animation-delay:420ms]',
  '[animation-delay:480ms]',
];

export default function App() {
  // a new key replays the entrance: React puts the cards in again
  const [run, setRun] = useState(0);
  return (
    <main className="mx-auto max-w-5xl py-6 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent">Motion</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Animations are classes</h1>
          <p className="mt-2 max-w-lg text-pretty text-muted">
            Four come built in; the rest are keyframes in kbach.config.js. All of them stay still
            for readers who ask for less motion (motion-safe:).
          </p>
        </div>
        <button
          onClick={() => setRun(run + 1)}
          className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-line bg-card px-4 py-2 text-sm font-semibold transition hover:bg-well active:scale-95 sm:self-auto"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4 fill-none stroke-current stroke-2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 4v6h6" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Replay the entrance
        </button>
      </header>

      {/* the cards rise in one after another */}
      <div key={run} className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {CARDS.map((c, i) => (
          <figure
            key={c.name}
            className={clsx(
              'm-0 rounded-2xl border border-line bg-card p-3 motion-safe:animate-rise',
              DELAYS[i],
            )}
          >
            <div className={clsx('h-28 rounded-xl bg-well/60', c.box ?? 'grid place-items-center')}>
              {c.show}
            </div>
            <figcaption className="mt-3 px-1">
              <b className="block text-sm font-semibold">{c.name}</b>
              <code className="text-xs text-muted">{c.cls}</code>
            </figcaption>
          </figure>
        ))}
        <figure
          className={clsx(
            'col-span-2 m-0 rounded-2xl border border-line bg-card p-3 motion-safe:animate-rise sm:col-span-3 lg:col-span-4',
            DELAYS[8],
          )}
        >
          <div className="grid h-20 place-items-center rounded-xl bg-well/60 px-6">
            {/* a loading bar with no end: a short bar slides along, over and over */}
            <span className="relative block h-1.5 w-full max-w-md overflow-hidden rounded-full bg-line/70">
              <span className="absolute inset-y-0 left-0 w-2/5 rounded-full bg-brand motion-safe:animate-slide" />
            </span>
          </div>
          <figcaption className="mt-3 px-1">
            <b className="text-sm font-semibold">Loading, no end</b>{' '}
            <code className="ml-1 text-xs text-muted">animate-slide</code>
          </figcaption>
        </figure>
      </div>

      {/* transitions: the change is the class (hover:), how it moves is transition + duration + ease */}
      <h2 className="mt-12 text-xl font-bold tracking-tight">Hover them</h2>
      <p className="mt-1 text-sm text-muted">
        A transition eases between two classes: the one without hover: and the one with it.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="grid h-28 cursor-pointer place-items-center rounded-2xl bg-brand text-sm font-semibold text-white transition duration-300 ease-out hover:scale-105 hover:shadow-xl hover:shadow-brand/30 active:scale-95">
          scale-105
        </div>
        <div className="grid h-28 cursor-pointer place-items-center rounded-2xl border border-line bg-card text-sm font-semibold transition duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:shadow-ink/10">
          -translate-y-2
        </div>
        <div className="group grid h-28 cursor-pointer place-items-center rounded-2xl border border-line bg-card text-sm font-semibold">
          <span className="flex items-center gap-2">
            rotate-90
            <svg
              viewBox="0 0 24 24"
              className="size-5 fill-none stroke-current stroke-2 transition duration-500 ease-out group-hover:rotate-90"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </div>
        <div className="grid h-28 cursor-pointer place-items-center rounded-2xl bg-well text-sm font-semibold transition-colors duration-500 hover:bg-ink hover:text-surface">
          bg-ink
        </div>
      </div>
    </main>
  );
}
