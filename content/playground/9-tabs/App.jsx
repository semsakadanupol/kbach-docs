// Tabs and accordion, in React: the same page as the HTML version.
import { useLayoutEffect, useRef, useState } from 'react';
import { clsx } from '@kbach/react';

const TABS = [
  { id: 'account', label: 'Account' },
  { id: 'notifications', label: 'Notifications', badge: 3 },
  { id: 'billing', label: 'Billing' },
];

const SWITCHES = [
  { title: 'Mentions', text: 'When someone writes your name', on: true },
  { title: 'Weekly digest', text: 'One email on Monday, with what you missed', on: false },
  { title: 'Product news', text: 'New features, a few times a year', on: true },
];

const FAQ = [
  {
    q: 'Can I change my plan later?',
    a: 'Any time, from Billing. Moving up takes effect at once; moving down starts with the next bill.',
  },
  {
    q: 'What happens to my work if I leave?',
    a: 'It stays yours. Download everything as files before you go, or keep the account on the free plan and come back whenever you like.',
  },
  {
    q: 'Do you have a discount for schools and charities?',
    a: "Yes: half price on every plan. Write to us from your school's or charity's address and we'll set it up.",
  },
];

const FIELD =
  'mt-1.5 block h-10 w-full rounded-lg border border-line bg-surface px-3 font-normal outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15';

function Account() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-sky-5 to-indigo-6 text-lg font-bold text-white">
          SK
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold">Sokha Kim</p>
          <p className="truncate text-sm text-muted">Member since March 2024</p>
        </div>
        <button className="ml-auto shrink-0 rounded-lg border border-line px-3 py-1.5 text-sm font-medium transition hover:bg-well">
          Change photo
        </button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Name
          <input defaultValue="Sokha Kim" className={FIELD} />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input defaultValue="sokha@example.com" className={FIELD} />
        </label>
      </div>
    </div>
  );
}

function Notifications() {
  return (
    <div className="divide-y divide-line px-6 py-2">
      {/* switches drawn with classes: the knob slides when the box is checked (peer-checked:) */}
      {SWITCHES.map((s) => (
        <label
          key={s.title}
          className="flex cursor-pointer items-center justify-between gap-4 py-4"
        >
          <span className="min-w-0">
            <b className="block text-sm font-semibold">{s.title}</b>
            <span className="block text-sm text-muted">{s.text}</span>
          </span>
          <input type="checkbox" defaultChecked={s.on} className="peer sr-only" />
          <span className="relative h-6 w-11 shrink-0 rounded-full bg-well ring-1 ring-line transition peer-checked:bg-brand peer-checked:ring-brand peer-focus-visible:ring-4 peer-focus-visible:ring-brand/30 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
        </label>
      ))}
    </div>
  );
}

function Billing() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-linear-to-br from-brand to-indigo-7 p-5 text-white">
        <div>
          <p className="text-sm text-white/80">Current plan</p>
          <p className="mt-1 text-2xl font-bold">
            Pro <span className="text-base font-medium text-white/80">· $19 a month</span>
          </p>
        </div>
        <button className="shrink-0 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-semibold ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25">
          Change
        </button>
      </div>
      <div className="flex items-center gap-4 rounded-2xl border border-line p-4">
        <span className="grid h-10 w-14 shrink-0 place-items-center rounded-lg bg-well text-muted">
          <svg
            viewBox="0 0 24 24"
            className="size-5 fill-none stroke-current stroke-2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <path d="M1 10h22" />
          </svg>
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <b className="block font-semibold">Card ending in 4242</b>
          <span className="text-muted">Expires 08 / 2028</span>
        </div>
        <button className="shrink-0 text-sm font-semibold text-accent hover:underline">Edit</button>
      </div>
    </div>
  );
}

const PANELS = { account: Account, notifications: Notifications, billing: Billing };

/** The tabs: the line slides under the picked one; ← and → move between them. */
function Tabs() {
  const [current, setCurrent] = useState('account');
  const [line, setLine] = useState({ x: 0, width: 0 });
  const list = useRef(null);
  const buttons = useRef({});

  // the line: as wide as the tab, where the tab is (again when the list scrolls or the page resizes)
  useLayoutEffect(() => {
    const place = () => {
      const tab = buttons.current[current];
      setLine({ x: tab.offsetLeft - list.current.scrollLeft, width: tab.offsetWidth });
    };
    place();
    document.fonts.ready.then(place);
    const el = list.current;
    el.addEventListener('scroll', place);
    addEventListener('resize', place);
    return () => {
      el.removeEventListener('scroll', place);
      removeEventListener('resize', place);
    };
  }, [current]);

  const onKey = (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const i = TABS.findIndex((t) => t.id === current);
    const next = TABS[(i + step + TABS.length) % TABS.length].id;
    setCurrent(next);
    buttons.current[next].focus();
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-line bg-card shadow-xl shadow-ink/5">
      <div className="px-6 pt-6">
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Your account, what we tell you about, and how you pay.
        </p>
      </div>
      <div className="relative mt-5 border-b border-line">
        <div
          ref={list}
          role="tablist"
          aria-label="Settings"
          onKeyDown={onKey}
          className="flex gap-6 overflow-x-auto px-6 [scrollbar-width:none]"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              ref={(el) => (buttons.current[t.id] = el)}
              role="tab"
              aria-selected={t.id === current}
              tabIndex={t.id === current ? 0 : -1}
              onClick={() => setCurrent(t.id)}
              className="flex items-center gap-2 py-3 text-sm font-semibold whitespace-nowrap text-muted transition-colors hover:text-ink aria-selected:text-ink"
            >
              {t.label}
              {t.badge && (
                <span className="rounded-full bg-brand px-1.5 text-[11px] text-white tabular-nums">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <span
          className="absolute bottom-0 left-0 h-0.5 rounded-full bg-brand transition-all duration-300 ease-out"
          style={{ width: line.width, transform: `translateX(${line.x}px)` }}
        />
      </div>
      {/* every panel stays (so its switches and fields keep what you did); the hidden ones are
          display: none, and an animation plays again each time its element shows */}
      {TABS.map((t) => {
        const Panel = PANELS[t.id];
        return (
          <div
            key={t.id}
            role="tabpanel"
            hidden={t.id !== current}
            className="motion-safe:animate-swap"
          >
            <Panel />
          </div>
        );
      })}
    </section>
  );
}

/** The accordion: an answer opens to its own height (grid rows 0fr → 1fr), the + turns to ×. */
function Questions() {
  const [open, setOpen] = useState(0);
  return (
    <section>
      <h2 className="text-xl font-bold tracking-tight">Questions</h2>
      <div className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {FAQ.map((item, i) => (
          <div key={item.q}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold transition-colors hover:bg-well/50"
            >
              {item.q}
              <svg
                viewBox="0 0 24 24"
                className="size-5 shrink-0 fill-none stroke-muted stroke-2 transition-transform duration-300 group-aria-expanded:rotate-45"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <div
              className={clsx(
                'grid transition-[grid-template-rows] duration-300 ease-out',
                open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm leading-6 text-muted">{item.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  return (
    <main className="mx-auto max-w-2xl space-y-10 py-6 sm:py-10">
      <Tabs />
      <Questions />
    </main>
  );
}
