// Dashboard, in React: the same page as the HTML version. The sidebar is in the page from lg;
// below it, the menu button slides it in as a drawer.
import { useEffect, useState } from 'react';
import { clsx } from '@kbach/react';

const NAV = [
  {
    name: 'Overview',
    current: true,
    icon: ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
  },
  {
    name: 'Orders',
    badge: 24,
    icon: [
      'M10 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM21 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0z',
      'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6',
    ],
  },
  {
    name: 'Customers',
    icon: [
      'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
      'M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
      'M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    ],
  },
  {
    name: 'Settings',
    icon: ['M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6'],
  },
];
const PROJECTS = [
  { name: 'Spring catalogue launch', dot: 'bg-emerald-5' },
  { name: 'Checkout redesign and the new payment providers', dot: 'bg-amber-5' },
  { name: 'Wholesale portal', dot: 'bg-sky-5' },
];

const UP = 'm5 12 7-7 7 7M12 19V5';
const DOWN = 'M12 5v14M19 12l-7 7-7-7';
const STATS = [
  {
    label: 'Revenue',
    value: '$48,295',
    change: '12.5%',
    up: true,
    icon: ['M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'],
  },
  {
    label: 'Orders',
    value: '1,204',
    change: '4.3%',
    up: true,
    icon: ['M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0'],
  },
  {
    label: 'Visitors',
    value: '32,910',
    change: '2.1%',
    up: false,
    icon: ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z'],
  },
  {
    label: 'Conversion',
    value: '3.66%',
    change: '0.4%',
    up: true,
    icon: ['m23 6-9.5 9.5-5-5L1 18', 'M17 6h6v6'],
  },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const REVENUE = {
  2025: [18, 22, 19, 27, 31, 29, 34, 30, 36, 33, 39, 44],
  2026: [26, 31, 28, 37, 42, 40, 47, 45, 51, 49, 55, 62],
};
const MAX = 64;

const CHANNELS = [
  { name: 'Search', share: 42, bar: 'w-[42%] bg-brand' },
  { name: 'Direct', share: 27, bar: 'w-[27%] bg-violet-5 [animation-delay:100ms]' },
  { name: 'Social', share: 19, bar: 'w-[19%] bg-amber-5 [animation-delay:200ms]' },
  { name: 'Email', share: 12, bar: 'w-[12%] bg-emerald-5 [animation-delay:300ms]' },
];

const STATUS = {
  Paid: 'bg-emerald-6/10 text-emerald-7 dark:text-emerald-4',
  Pending: 'bg-amber-6/10 text-amber-7 dark:text-amber-4',
  Refunded: 'bg-rose-6/10 text-rose-7 dark:text-rose-4',
};
const ORDERS = [
  {
    name: 'Sophea Ros',
    email: 'sophea.ros@example.com',
    status: 'Paid',
    date: 'Nov 24',
    amount: '$316.00',
    avatar: 'bg-sky-6/15 text-sky-7 dark:text-sky-4',
  },
  {
    name: 'Bopha Meas-Lindqvist',
    email: 'bopha.meas.lindqvist@example.com',
    status: 'Pending',
    date: 'Nov 23',
    amount: '$1,280.50',
    avatar: 'bg-violet-6/15 text-violet-7 dark:text-violet-4',
  },
  {
    name: 'Kosal Tep',
    email: 'kosal@example.com',
    status: 'Refunded',
    date: 'Nov 22',
    amount: '$89.99',
    avatar: 'bg-amber-6/15 text-amber-7 dark:text-amber-4',
  },
  {
    name: 'Leakena Sok',
    email: 'leakena.sok@example.com',
    status: 'Paid',
    date: 'Nov 21',
    amount: '$540.00',
    avatar: 'bg-emerald-6/15 text-emerald-7 dark:text-emerald-4',
  },
];

const initials = (name) =>
  name
    .split(/[\s-]+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

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

function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm motion-safe:animate-fade lg:hidden"
        />
      )}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-line bg-card motion-safe:animate-slide lg:sticky lg:top-0 lg:z-auto lg:flex lg:h-screen lg:w-64 lg:animate-none',
          open ? 'flex' : 'hidden',
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2.5 px-5 font-bold">
          <span className="grid size-8 place-items-center rounded-lg bg-brand text-white shadow-md shadow-brand/30">
            <Icon paths={['M12 20V10M18 20V4M6 20v-4']} className="size-4" />
          </span>
          Northwind
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 text-sm font-medium">
          {NAV.map((item) => (
            <a
              key={item.name}
              href="#"
              aria-current={item.current ? 'page' : undefined}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2',
                item.current
                  ? 'bg-brand/10 text-accent'
                  : 'text-muted transition-colors hover:bg-well hover:text-ink',
              )}
            >
              <Icon paths={item.icon} className="size-4 shrink-0" />
              {item.name}
              {item.badge && (
                <span className="ml-auto rounded-full bg-well px-2 py-0.5 text-xs tabular-nums">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
          <p className="px-3 pt-6 pb-2 text-xs font-semibold tracking-wider text-muted uppercase">
            Projects
          </p>
          {PROJECTS.map((p) => (
            <a
              key={p.name}
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted transition-colors hover:bg-well hover:text-ink"
            >
              <span className={clsx('size-2 shrink-0 rounded-full', p.dot)} />
              <span className="truncate">{p.name}</span>
            </a>
          ))}
        </nav>
        {/* the account, at the bottom: long names and emails truncate */}
        <div className="flex items-center gap-3 border-t border-line p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-blue-5 to-violet-6 text-xs font-bold text-white">
            VC
          </span>
          <span className="min-w-0 flex-1 text-sm">
            <b className="block truncate">Vannak Chea</b>
            <span className="block truncate text-xs text-muted">vannak.chea@northwind.example</span>
          </span>
        </div>
      </aside>
    </>
  );
}

function Stat({ stat }) {
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between text-sm text-muted">
        {stat.label} <Icon paths={stat.icon} className="size-4" />
      </div>
      <p className="mt-3 truncate text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
        {stat.value}
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
        <span
          className={clsx(
            'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold',
            stat.up
              ? 'bg-emerald-6/10 text-emerald-7 dark:text-emerald-4'
              : 'bg-rose-6/10 text-rose-7 dark:text-rose-4',
          )}
        >
          <Icon paths={[stat.up ? UP : DOWN]} className="size-3 stroke-[3]" />
          {stat.change}
        </span>
        <span className="hidden sm:inline">from last month</span>
      </p>
    </div>
  );
}

/** A bar a month, as tall as its share of the best month; its value shows above it on hover. */
function Chart() {
  const [year, setYear] = useState(2026);
  return (
    <section className="rounded-2xl border border-line bg-card p-5 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Revenue</h2>
          <p className="text-sm text-muted">Each month, in thousands of dollars</p>
        </div>
        <div
          role="group"
          aria-label="Year"
          className="flex rounded-lg bg-well p-1 text-xs font-semibold"
        >
          {[2025, 2026].map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              aria-pressed={y === year}
              className={clsx(
                'rounded-md px-3 py-1.5 transition',
                y === year ? 'bg-card shadow-sm' : 'text-muted',
              )}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 flex h-56 items-end gap-1.5 sm:gap-3">
        {MONTHS.map((m, i) => (
          <div key={m} className="group flex h-full min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end">
              <div
                className="relative w-full origin-bottom rounded-t-md bg-brand/70 transition-[height,background-color] duration-500 ease-out group-hover:bg-brand motion-safe:animate-grow"
                style={{
                  height: (REVENUE[year][i] / MAX) * 100 + '%',
                  animationDelay: i * 40 + 'ms',
                }}
              >
                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-surface opacity-0 transition group-hover:opacity-100">
                  ${REVENUE[year][i]}k
                </span>
              </div>
            </div>
            {/* every other month's name on a phone, where they'd crowd */}
            <span className={clsx('text-[11px] text-muted', i % 2 && 'max-sm:invisible')}>{m}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [drawer, setDrawer] = useState(false);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setDrawer(false);
    const wide = matchMedia('(min-width: 1024px)');
    const onWide = () => setDrawer(false);
    document.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => {
      document.removeEventListener('keydown', onKey);
      wide.removeEventListener('change', onWide);
    };
  }, []);

  return (
    <div className="-m-6 flex min-h-screen">
      <Sidebar open={drawer} onClose={() => setDrawer(false)} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-card/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button
            onClick={() => setDrawer(true)}
            aria-label="Open the menu"
            className="-ml-1.5 grid size-9 place-items-center rounded-lg text-muted hover:bg-well hover:text-ink lg:hidden"
          >
            <Icon paths={['M4 7h16M4 12h16M4 17h16']} className="size-5" />
          </button>
          <h1 className="text-lg font-semibold">Overview</h1>
          <div className="ml-auto flex items-center gap-2">
            <button className="hidden h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm text-muted sm:flex">
              <Icon
                paths={[
                  'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
                  'M16 2v4M8 2v4M3 10h18',
                ]}
                className="size-4"
              />
              Jan 1 – Dec 31
            </button>
            <button className="h-9 rounded-lg bg-brand px-3.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:bg-brand/90 active:scale-95">
              Export
            </button>
          </div>
        </header>

        <main className="space-y-6 p-4 sm:p-6 lg:p-8">
          {/* the numbers: 2 across, 4 from xl */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {STATS.map((s) => (
              <Stat key={s.label} stat={s} />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Chart />
            {/* where visits come from: a bar each, as wide as its share */}
            <section className="rounded-2xl border border-line bg-card p-5">
              <h2 className="font-semibold">Top channels</h2>
              <p className="text-sm text-muted">Share of visits this month</p>
              <ul className="mt-6 space-y-5 text-sm">
                {CHANNELS.map((c) => (
                  <li key={c.name}>
                    <div className="flex justify-between">
                      <span>{c.name}</span>
                      <span className="font-semibold tabular-nums">{c.share}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-well">
                      <div
                        className={clsx(
                          'h-full origin-left rounded-full motion-safe:animate-grow-x',
                          c.bar,
                        )}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* recent orders: the table scrolls sideways if it must; Date and Email hide on a phone */}
          <section className="overflow-hidden rounded-2xl border border-line bg-card">
            <div className="flex items-center justify-between p-5">
              <h2 className="font-semibold">Recent orders</h2>
              <a href="#" className="text-sm font-semibold text-accent hover:underline">
                View all
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-line bg-well/50 text-xs text-muted uppercase">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="hidden px-5 py-3 font-semibold sm:table-cell">Date</th>
                    <th className="px-5 py-3 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {ORDERS.map((o) => (
                    <tr key={o.email} className="transition-colors hover:bg-well/50">
                      <td className="w-full max-w-0 px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className={clsx(
                              'grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold',
                              o.avatar,
                            )}
                          >
                            {initials(o.name)}
                          </span>
                          <span className="min-w-0">
                            <b className="block truncate font-medium">{o.name}</b>
                            <span className="hidden truncate text-xs text-muted sm:block">
                              {o.email}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={clsx(
                            'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold',
                            STATUS[o.status],
                          )}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          {o.status}
                        </span>
                      </td>
                      <td className="hidden px-5 py-3.5 whitespace-nowrap text-muted sm:table-cell">
                        {o.date}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold tabular-nums">
                        {o.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
