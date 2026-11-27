// Navbar, in React: the same page as the HTML version. Make the preview narrower: below md
// the links fold into the menu button.
import { useEffect, useRef, useState } from 'react';
import { clsx } from '@kbach/react';

const LINKS = ['Home', 'Products', 'Pricing', 'Docs'];

const PRODUCTS = [
  {
    name: 'Analytics',
    text: 'See where every visit comes from',
    color: 'bg-sky-6/10 text-sky-7 dark:text-sky-4',
    icon: ['M12 20V10M18 20V4M6 20v-4'],
  },
  {
    name: 'Automations',
    text: 'Let the busywork run on its own',
    color: 'bg-amber-6/10 text-amber-7 dark:text-amber-4',
    icon: ['M13 2 3 14h9l-1 8 10-12h-9z'],
  },
  {
    name: 'Integrations',
    text: 'Connect the tools you already use',
    color: 'bg-violet-6/10 text-violet-7 dark:text-violet-4',
    icon: ['M16 18l6-6-6-6M8 6l-6 6 6 6'],
  },
];

const CARDS = [
  {
    tag: 'Analytics',
    title: 'Every number, live',
    text: 'Dashboards that update as things happen, with the details one click away when you need to dig into a spike.',
  },
  {
    tag: 'Automations',
    title: 'Busywork, handled',
    text: 'Rules that move tickets, send reminders and tidy up after a launch, so the team can stay on the work that matters.',
  },
  {
    tag: 'Integrations',
    title: 'Plays well with others',
    text: 'Over a hundred tools connect in a minute: your calendar, your chat, your code host and the spreadsheets nobody wants to give up.',
  },
];

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

function ProductsMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => !root.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <li ref={root} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="group flex items-center gap-1 rounded-lg px-3 py-2 text-muted transition-colors hover:bg-well hover:text-ink aria-expanded:bg-well aria-expanded:text-ink"
      >
        Products
        <Icon
          paths={['m6 9 6 6 6-6']}
          className="size-4 transition-transform duration-200 group-aria-expanded:rotate-180"
        />
      </button>
      {/* the products menu: each row an icon, a name and one line */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl border border-line bg-card p-2 shadow-xl shadow-ink/10 motion-safe:animate-drop">
          {PRODUCTS.map((p) => (
            <a
              key={p.name}
              href="#"
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-well"
            >
              <span
                className={clsx('grid size-10 shrink-0 place-items-center rounded-lg', p.color)}
              >
                <Icon paths={p.icon} className="size-5" />
              </span>
              <span className="min-w-0">
                <b className="block font-semibold text-ink">{p.name}</b>
                <span className="block truncate text-muted">{p.text}</span>
              </span>
            </a>
          ))}
        </div>
      )}
    </li>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    // wide enough for the links again: the phone menu has nothing to show
    const wide = matchMedia('(min-width: 768px)');
    const onWide = (e) => e.matches && setOpen(false);
    document.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => {
      document.removeEventListener('keydown', onKey);
      wide.removeEventListener('change', onWide);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-card/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <a href="#" className="mr-4 flex shrink-0 items-center gap-2.5 font-bold">
          <span className="grid size-8 place-items-center rounded-lg bg-brand text-white shadow-md shadow-brand/30">
            <Icon
              paths={['M12 2 2 7l10 5 10-5-10-5z', 'm2 17 10 5 10-5M2 12l10 5 10-5']}
              className="size-4"
            />
          </span>
          Skyline
        </a>

        {/* the links, from md */}
        <ul className="hidden items-center gap-1 text-sm font-medium md:flex">
          <li>
            <a href="#" aria-current="page" className="rounded-lg bg-well px-3 py-2 text-ink">
              Home
            </a>
          </li>
          <ProductsMenu />
          {['Pricing', 'Docs'].map((l) => (
            <li key={l}>
              <a
                href="#"
                className="rounded-lg px-3 py-2 text-muted transition-colors hover:bg-well hover:text-ink"
              >
                {l}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1">
          {/* search: a field-like button from sm, just the icon below */}
          <button
            aria-label="Search"
            className="flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm text-muted transition-colors hover:bg-well hover:text-ink sm:w-48 sm:border sm:border-line sm:bg-surface lg:w-56"
          >
            <Icon
              paths={['M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0z', 'm21 21-4.3-4.3']}
              className="size-4 shrink-0"
            />
            <span className="hidden flex-1 text-left sm:block">Search…</span>
            <kbd className="hidden rounded border border-line px-1.5 font-sans text-[11px] lg:block">
              Ctrl K
            </kbd>
          </button>
          {/* the bell, with a dot that pings */}
          <button
            aria-label="Notifications"
            className="relative grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-well hover:text-ink"
          >
            <Icon
              paths={['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0']}
              className="size-5"
            />
            <span className="absolute top-2 right-2 flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-rose-5 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-rose-6 ring-2 ring-card" />
            </span>
          </button>
          <a
            href="#"
            aria-label="Your account"
            className="ml-1 hidden size-9 place-items-center rounded-full bg-linear-to-br from-sky-5 to-indigo-6 text-xs font-bold text-white ring-2 ring-card md:grid"
          >
            SK
          </a>
          {/* the menu button, below md: its icon turns into ✕ */}
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Menu"
            className="grid size-9 place-items-center rounded-lg text-ink transition-colors hover:bg-well md:hidden"
          >
            <Icon
              paths={[open ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16']}
              className="size-5"
            />
          </button>
        </div>
      </nav>

      {/* the phone menu: grid rows from 0fr to 1fr, so it slides open to its own height */}
      <div
        className={clsx(
          'grid transition-[grid-template-rows] duration-300 ease-out md:hidden',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-1 border-t border-line px-4 py-3 text-sm font-medium">
            {LINKS.map((l, i) => (
              <a
                key={l}
                href="#"
                aria-current={i === 0 ? 'page' : undefined}
                className={clsx(
                  'block rounded-lg px-3 py-2.5',
                  i === 0 ? 'bg-well' : 'text-muted hover:bg-well hover:text-ink',
                )}
              >
                {l}
              </a>
            ))}
            <div className="flex items-center gap-3 border-t border-line px-3 pt-4 pb-1">
              <span className="grid size-9 place-items-center rounded-full bg-linear-to-br from-sky-5 to-indigo-6 text-xs font-bold text-white">
                SK
              </span>
              <span className="min-w-0 flex-1">
                <b className="block truncate">Sokha Kim</b>
                <span className="block truncate text-xs text-muted">sokha@skyline.app</span>
              </span>
              <a href="#" className="rounded-lg border border-line px-3 py-1.5 text-xs">
                Sign out
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="-m-6 min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <p className="inline-flex motion-safe:animate-rise items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-muted">
            <span className="size-1.5 rounded-full bg-emerald-5" /> All systems normal
          </p>
          <h1 className="mt-5 motion-safe:animate-rise text-4xl font-bold tracking-tight text-balance [animation-delay:80ms] sm:text-5xl">
            Your team's work, <span className="text-accent">in one place</span>
          </h1>
          <p className="mt-4 max-w-xl motion-safe:animate-rise text-lg text-pretty text-muted [animation-delay:160ms]">
            Make the preview narrower: below md the links fold into the menu button, and the menu
            slides open to its own height.
          </p>
          <div className="mt-8 flex motion-safe:animate-rise flex-wrap gap-3 [animation-delay:240ms]">
            <a
              href="#"
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand/90 active:scale-95"
            >
              Get started
            </a>
            <a
              href="#"
              className="flex items-center gap-2 rounded-xl border border-line bg-card px-5 py-2.5 text-sm font-semibold transition hover:bg-well active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="size-4 fill-current">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch the demo
            </a>
          </div>
        </div>

        {/* cards: one column, two from sm, three from lg; two lines of text each at most */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c) => (
            <a
              key={c.tag}
              href="#"
              className="group rounded-2xl border border-line bg-card p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5"
            >
              <span className="text-xs font-semibold text-accent">{c.tag}</span>
              <h2 className="mt-2 font-semibold">{c.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{c.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
                Learn more <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
