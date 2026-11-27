// Pricing, in React: the same page as the HTML version. The middle plan is ink on surface
// turned around (bg-ink text-surface): dark on a light page, light on a dark one.
import { useState } from 'react';
import { clsx } from '@kbach/react';

const PLANS = [
  {
    name: 'Starter',
    text: 'For trying things out and side projects.',
    price: { monthly: 0, yearly: 0 },
    note: 'Free forever',
    cta: 'Start for free',
    features: [
      ['3 projects', true],
      ['1 GB of storage', true],
      ['Community support', true],
      ['Custom domains', false],
      ['Team roles', false],
    ],
  },
  {
    name: 'Pro',
    text: 'For people who ship every week and want it to be quick.',
    price: { monthly: 19, yearly: 15 },
    note: 'Billed $180 a year',
    cta: 'Get Pro',
    featured: true,
    features: [
      ['Unlimited projects', true],
      ['100 GB of storage', true],
      ['Email support in a day', true],
      ['Custom domains', true],
      ['Team roles', false],
    ],
  },
  {
    name: 'Team',
    text: 'For teams that need roles, reviews and one bill.',
    price: { monthly: 49, yearly: 39 },
    note: 'Billed $468 a year',
    cta: 'Talk to us',
    features: [
      ['Everything in Pro', true],
      ['1 TB of storage', true],
      ['Support in an hour', true],
      ['Single sign-on', true],
      ['Team roles', true],
    ],
  },
];

const SMALL_PRINT = [
  {
    text: 'Secure payments',
    icon: [
      'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z',
      'M7 11V7a5 5 0 0 1 10 0v4',
    ],
  },
  { text: 'Cancel any time', icon: ['M1 4v6h6', 'M3.51 15a9 9 0 1 0 2.13-9.36L1 10'] },
  {
    text: '14-day trial of Pro',
    icon: ['M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z', 'M12 6v6l4 2'],
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

function Plan({ plan, billing }) {
  const featured = plan.featured;
  const soft = featured ? 'text-surface/70' : 'text-muted';
  return (
    <div
      className={clsx(
        'relative flex h-full flex-col rounded-3xl p-6 lg:p-8',
        featured
          ? 'bg-ink text-surface shadow-2xl shadow-brand/20 ring-2 ring-brand md:-my-4 md:py-10 lg:py-12'
          : 'border border-line bg-card',
      )}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-semibold whitespace-nowrap text-white shadow-lg shadow-brand/30">
          Most popular
        </span>
      )}
      <h2 className="font-semibold">{plan.name}</h2>
      <p className={clsx('mt-1 line-clamp-2 min-h-10 text-sm', soft)}>{plan.text}</p>
      <p className="mt-6 flex items-baseline gap-1">
        {/* a key per price: the new one drops in */}
        <span
          key={billing}
          className="text-4xl font-bold tracking-tight tabular-nums motion-safe:animate-swap"
        >
          ${plan.price[billing]}
        </span>
        <span className={clsx('text-sm', soft)}>/ month</span>
      </p>
      <p className={clsx('mt-1 h-5 text-xs', soft)}>
        {plan.price.monthly === 0 ? plan.note : billing === 'yearly' ? plan.note : ''}
      </p>
      <a
        href="#"
        className={clsx(
          'mt-6 rounded-xl py-2.5 text-center text-sm font-semibold transition active:scale-[0.98]',
          featured
            ? 'bg-brand text-white shadow-lg shadow-brand/30 hover:bg-brand/90'
            : 'border border-line hover:bg-well',
        )}
      >
        {plan.cta}
      </a>
      <ul className="mt-8 space-y-3 text-sm">
        {plan.features.map(([text, included]) => (
          <li
            key={text}
            className={clsx(
              'flex gap-3',
              !included && (featured ? 'text-surface/60' : 'text-muted'),
            )}
          >
            {included ? (
              <Icon
                paths={['M20 6 9 17l-5-5']}
                className={clsx(
                  'mt-0.5 size-4 shrink-0 stroke-[2.5]',
                  featured ? 'stroke-brand' : 'stroke-emerald-6',
                )}
              />
            ) : (
              <Icon
                paths={['M18 6 6 18M6 6l12 12']}
                className={clsx('mt-0.5 size-4 shrink-0', !featured && 'opacity-60')}
              />
            )}
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  const [billing, setBilling] = useState('monthly');
  return (
    <main className="mx-auto max-w-5xl py-10 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold text-accent">Pricing</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-5xl">
          Plans that grow with your team
        </h1>
        <p className="mt-4 text-pretty text-muted sm:text-lg">
          Start free, upgrade when you need more. Every plan has the whole editor.
        </p>

        {/* monthly or yearly: the white pill slides under the one picked */}
        <div className="mt-8 inline-flex items-center gap-3">
          <div
            role="group"
            aria-label="Billing"
            className="relative grid grid-cols-2 rounded-full bg-well p-1 text-sm font-semibold"
          >
            <span
              className={clsx(
                'absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-card shadow-sm ring-1 ring-line transition-transform duration-300 ease-out',
                billing === 'yearly' && 'translate-x-full',
              )}
            />
            {['monthly', 'yearly'].map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                aria-pressed={billing === b}
                className={clsx(
                  'relative rounded-full px-5 py-2 capitalize transition-colors',
                  billing !== b && 'text-muted',
                )}
              >
                {b}
              </button>
            ))}
          </div>
          <span className="rounded-full bg-emerald-6/10 px-2.5 py-1 text-xs font-semibold text-emerald-7 dark:text-emerald-4">
            2 months free
          </span>
        </div>
      </div>

      {/* one column on a phone, three from md; the middle one stands out */}
      <div className="mt-12 grid items-start gap-6 md:grid-cols-3 md:gap-4 lg:gap-6">
        {PLANS.map((plan) => (
          <Plan key={plan.name} plan={plan} billing={billing} />
        ))}
      </div>

      {/* the small print, with an icon each; wraps to two lines on a phone */}
      <ul className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted">
        {SMALL_PRINT.map((s) => (
          <li key={s.text} className="flex items-center gap-2">
            <Icon paths={s.icon} className="size-4" />
            {s.text}
          </li>
        ))}
      </ul>
    </main>
  );
}
