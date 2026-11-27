// Landing page, in React: the same page as index.html in the HTML version. The colors
// (surface, ink, muted, line, card, well, brand, accent, code) come from kbach.config.js and
// follow light and dark mode, so no class here needs a dark: twin.
import { useEffect, useRef, useState } from 'react';
import { clsx } from '@kbach/react';

const PACKAGES = [
  { label: 'React', cmd: 'npm install @kbach/react' },
  { label: 'React Native', cmd: 'npm install @kbach/react-native' },
  { label: 'CLI setup', cmd: 'npx @kbach/cli init' },
];

const LOGOS = [
  { name: 'React', src: '/logos/react.svg' },
  { name: 'Next.js', src: '/logos/nextjs.svg', invert: true },
  { name: 'Vite', src: '/logos/vite.svg' },
  { name: 'PostCSS', src: '/logos/postcss.svg' },
  { name: 'React Native', src: '/logos/react.svg' },
  { name: 'Expo', src: '/logos/expo.svg', invert: true },
  { name: 'Plain HTML', src: '/logos/html5.svg' },
];

const COLORS = {
  amber: 'bg-amber-6 hover:bg-amber-7',
  sky: 'bg-sky-6 hover:bg-sky-7',
  violet: 'bg-violet-6 hover:bg-violet-7',
  emerald: 'bg-emerald-6 hover:bg-emerald-7',
  rose: 'bg-rose-6 hover:bg-rose-7',
};
const SHADOWS = {
  amber: 'shadow-lg shadow-amber-6/30',
  sky: 'shadow-lg shadow-sky-6/30',
  violet: 'shadow-lg shadow-violet-6/30',
  emerald: 'shadow-lg shadow-emerald-6/30',
  rose: 'shadow-lg shadow-rose-6/30',
};
const SWATCHES = {
  amber: 'bg-amber-6',
  sky: 'bg-sky-6',
  violet: 'bg-violet-6',
  emerald: 'bg-emerald-6',
  rose: 'bg-rose-6',
};
const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

const STATS = [
  { value: 26, label: 'color families' },
  { value: 12, label: 'shades in each' },
  { value: 3, label: 'platforms: web, iOS, Android' },
  { value: 1, label: 'Rust engine under them' },
];

const FEATURES = [
  {
    title: 'Build time on the web',
    text: 'A Vite or PostCSS plugin writes a real kbach.css.',
    rgb: '245, 158, 11',
    card: 'hover:border-brand/40',
    badge: 'bg-brand/10 text-accent',
    icon: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  },
  {
    title: 'Native styles',
    text: 'The same names become style objects on Android and iOS.',
    rgb: '14, 165, 233',
    card: 'hover:border-sky-6/40',
    badge: 'bg-sky-6/10 text-sky-7 dark:text-sky-4',
    icon: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="2.5" />
        <path d="M11 18h2" />
      </>
    ),
  },
  {
    title: 'Dark mode built in',
    text: 'Colors in kbach.config.js follow the mode. Try the moon button above the preview.',
    rgb: '139, 92, 246',
    card: 'hover:border-violet-6/40',
    badge: 'bg-violet-6/10 text-violet-7 dark:text-violet-4',
    icon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  },
];

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Copies text; says so on the button for a moment ("Copied", or "Ctrl+C" with no clipboard). */
function useCopy() {
  const [label, setLabel] = useState('Copy');
  const timer = useRef();
  const copy = async (text) => {
    let ok = true;
    try {
      await navigator.clipboard.writeText(text);
      setLabel('Copied');
    } catch {
      ok = false;
      setLabel('Ctrl+C');
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLabel('Copy'), 1500);
    return ok;
  };
  return [label, copy];
}

/** Rises in the first time it comes into view (still, for readers who ask for less motion). */
function Reveal({ as: Tag = 'section', className, children, ...props }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(reducedMotion);
  useEffect(() => {
    if (shown) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [shown]);
  return (
    <Tag
      ref={ref}
      className={clsx(
        className,
        'transition duration-700 ease-out',
        !shown && 'translate-y-6 opacity-0',
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/** A number that counts up the first time it's seen. */
function CountUp({ to }) {
  const ref = useRef(null);
  const [n, setN] = useState(() => (reducedMotion() ? to : 0));
  useEffect(() => {
    if (reducedMotion()) return;
    let frame;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / 1200);
          setN(Math.round(to * (1 - (1 - t) ** 3)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(ref.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to]);
  return (
    <p ref={ref} className="text-4xl font-bold tabular-nums">
      {n}
    </p>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 8);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const wide = matchMedia('(min-width: 640px)');
    const onWide = (e) => e.matches && setOpen(false);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    onScroll();
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('keydown', onKey);
      wide.removeEventListener('change', onWide);
    };
  }, []);

  return (
    // the bar: frosted once the page scrolls
    <header
      className={clsx(
        'sticky top-3 z-30 mx-auto flex max-w-5xl flex-wrap items-center justify-between rounded-2xl px-3 py-2 transition',
        scrolled && 'bg-card/70 shadow-lg shadow-ink/5 ring-1 ring-ink/10 backdrop-blur-xl',
      )}
    >
      <div className="flex items-center gap-1">
        <button
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
          className="-ml-1 grid size-9 place-items-center rounded-full hover:bg-ink/5 sm:hidden"
        >
          <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2">
            <path d={open ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'} />
          </svg>
        </button>
        {/* the Kbach logo: gold on cream in light mode, gold on slate in dark */}
        <a href="#" className="flex items-center gap-2 font-semibold">
          <img src="/kbach-logo-light-64.png" alt="" className="size-7 rounded-lg dark:hidden" />
          <img src="/kbach-logo-64.png" alt="" className="hidden size-7 rounded-lg dark:block" />
          Kbach
        </a>
      </div>

      <nav className="hidden gap-7 text-sm text-muted sm:flex *:transition-colors *:hover:text-ink">
        <a href="#try">Try it</a>
        <a href="#features">Features</a>
        <a href="#">Docs</a>
      </nav>

      <a
        href="#try"
        className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-surface hover:bg-ink/80"
      >
        Get started →
      </a>

      {/* the phone menu: opens under the bar */}
      {open && (
        <nav
          onClick={(e) => e.target.closest('a') && setOpen(false)}
          className="mt-3 w-full motion-safe:animate-drop rounded-2xl bg-card/70 p-1.5 text-sm font-medium backdrop-blur-xl sm:hidden *:block *:rounded-xl *:px-3 *:py-2.5 *:hover:bg-well"
        >
          <a href="#try">Try it</a>
          <a href="#features">Features</a>
          <a href="#">Docs</a>
        </nav>
      )}
    </header>
  );
}

function Install() {
  const [picked, setPicked] = useState(PACKAGES[0]);
  const [label, copy] = useCopy();
  const [done, setDone] = useState(false);
  const onCopy = async () => {
    if (!(await copy(picked.cmd))) return;
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };
  return (
    // pick a package, copy its command
    <div className="mt-10 w-full max-w-lg motion-safe:animate-enter overflow-hidden rounded-xl border border-line bg-card text-left shadow-xl shadow-ink/5 [animation-delay:270ms]">
      <div className="gap-4 border-b border-line bg-well/40 px-3 py-2 text-center">
        <div
          role="group"
          aria-label="Package"
          className="flex *:flex-1 *:border *:border-line gap-1 text-sm font-medium *:rounded-md *:py-1 *:transition-colors"
        >
          {PACKAGES.map((p) => (
            <button
              key={p.cmd}
              onClick={() => setPicked(p)}
              aria-pressed={p === picked}
              className={
                p === picked ? 'bg-brand/10 text-accent' : 'text-muted hover:bg-well hover:text-ink'
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 p-2 pl-4 font-mono text-sm">
        <span className="text-brand select-none">$</span>
        {/* a key per command: React puts a new element in, so the pop plays again */}
        <code key={picked.cmd} className="min-w-0 flex-1 truncate motion-safe:animate-pop">
          {picked.cmd}
        </code>
        <button
          onClick={onCopy}
          className={clsx(
            'w-20 shrink-0 rounded-lg py-1.5 text-center font-sans text-xs font-semibold transition',
            done ? 'bg-emerald-6 text-white' : 'bg-ink text-surface hover:bg-ink/80',
          )}
        >
          {label}
        </button>
      </div>
    </div>
  );
}

function Hero() {
  return (
    // the hero: each part rises in, a little after the one before
    <main className="mx-auto flex max-w-3xl flex-col items-center pt-16 text-center sm:pt-24">
      <a
        href="#try"
        className="inline-flex motion-safe:animate-enter items-center gap-2 rounded-full border border-brand/30 bg-brand/10 py-1 pr-3 pl-1 text-xs font-medium text-accent hover:border-brand/60"
      >
        <span className="rounded-full bg-brand px-2 py-0.5 font-semibold text-white">New</span>
        Tailwind CSS-compatible class names →
      </a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance motion-safe:animate-enter [animation-delay:90ms] pb-2 bg-linear-to-b from-ink to-muted bg-clip-text text-transparent sm:text-6xl">
        One set of classes for React, React Native and plain HTML
      </h1>
      <p className="mt-5 max-w-xl motion-safe:animate-enter text-lg text-pretty text-muted [animation-delay:180ms]">
        Kbach turns utility classes into CSS on the web and into style objects on native, all from
        one Rust engine.
      </p>
      <Install />
    </main>
  );
}

function WorksWith() {
  // the list twice, so the strip loops without a seam (the copy is hidden from screen readers)
  return (
    <section
      aria-label="Works with"
      className="group mx-auto mt-16 max-w-4xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
    >
      <ul className="flex w-max motion-safe:animate-marquee gap-12 pr-12 text-sm font-semibold text-muted group-hover:[animation-play-state:paused] *:flex *:items-center *:gap-2">
        {[...LOGOS, ...LOGOS].map((logo, i) => (
          <li key={i} aria-hidden={i >= LOGOS.length || undefined}>
            <img src={logo.src} alt="" className={logo.invert ? 'size-5 dark:invert' : 'size-5'} />
            {logo.name}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Segmented({ label, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="text-xs font-semibold text-muted uppercase">{label}</legend>
      <div className="mt-3 inline-flex rounded-lg bg-well p-1 text-sm *:rounded-md *:px-3 *:py-1 *:transition">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={
              value === o.value ? 'bg-card text-ink shadow-sm ring-1 ring-line' : 'text-muted'
            }
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function TryIt() {
  const [color, setColor] = useState('amber');
  const [radius, setRadius] = useState('rounded-xl');
  const [size, setSize] = useState('md');
  const [shadow, setShadow] = useState(true);
  const [label, copy] = useCopy();
  const classes = [
    COLORS[color],
    radius,
    SIZES[size],
    shadow && SHADOWS[color],
    'font-semibold text-white transition active:scale-95',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    // try it: each choice swaps one class on the button
    <Reveal id="try" className="mx-auto mt-24 max-w-5xl scroll-mt-24">
      <div className="text-center">
        <p className="text-sm font-semibold text-accent">Try it</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">Build a button from classes</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Each choice swaps one class. The page makes its CSS the moment it's used.
        </p>
      </div>

      <div className="mt-10 grid overflow-hidden rounded-2xl border border-line bg-card/70 md:grid-cols-2">
        <div className="space-y-6 border-b border-line p-6 md:border-r md:border-b-0">
          <fieldset>
            <legend className="text-xs font-semibold text-muted uppercase">Color</legend>
            <div className="mt-3 flex gap-2 *:size-8 *:rounded-full *:ring-offset-2 *:ring-offset-card *:transition *:hover:scale-110">
              {Object.keys(COLORS).map((c) => (
                <button
                  key={c}
                  title={c}
                  onClick={() => setColor(c)}
                  aria-pressed={color === c}
                  className={clsx(SWATCHES[c], color === c && 'ring-2 ring-ink')}
                />
              ))}
            </div>
          </fieldset>
          <Segmented
            label="Corners"
            value={radius}
            onChange={setRadius}
            options={[
              { value: 'rounded-md', label: 'md' },
              { value: 'rounded-xl', label: 'xl' },
              { value: 'rounded-full', label: 'full' },
            ]}
          />
          <Segmented
            label="Size"
            value={size}
            onChange={setSize}
            options={['sm', 'md', 'lg'].map((s) => ({ value: s, label: s }))}
          />
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={shadow}
              onChange={(e) => setShadow(e.target.checked)}
              className="size-4 accent-brand"
            />
            A shadow in the button's color
          </label>
        </div>

        <div className="flex flex-col">
          <div className="grid min-h-48 flex-1 place-items-center p-8">
            {/* a key per look: the pop plays on every change */}
            <button key={classes} className={clsx(classes, 'motion-safe:animate-pop')}>
              Install Kbach
            </button>
          </div>
          <div className="flex items-start gap-3 border-t border-line bg-code p-4 font-mono text-[13px] leading-6 text-muted">
            {/* the tag, colored as in an editor */}
            <code className="min-w-0 flex-1">
              <span className="text-code-tag">&lt;button</span>{' '}
              <span className="text-code-attr">className</span>=
              <span className="text-code-value">"{classes}"</span>
              <span className="text-code-tag">&gt;</span>
            </code>
            <button
              onClick={() => copy('<button className="' + classes + '">Install Kbach</button>')}
              className="rounded-md bg-ink/10 px-2 py-0.5 font-sans text-xs font-semibold text-ink hover:bg-ink/20"
            >
              {label}
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/** A soft light in the card's color follows the pointer. */
function Feature({ feature }) {
  const [light, setLight] = useState('');
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const at = e.clientX - r.left + 'px ' + (e.clientY - r.top) + 'px';
    setLight(`radial-gradient(260px circle at ${at}, rgba(${feature.rgb}, 0.16), transparent 65%)`);
  };
  return (
    <div
      onPointerMove={onMove}
      className={clsx(
        'group relative overflow-hidden rounded-2xl border border-line bg-card/60 p-5 transition',
        feature.card,
      )}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
        style={{ background: light }}
      />
      <div className="relative">
        <div className={clsx('grid size-10 place-items-center rounded-xl', feature.badge)}>
          <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2">
            {feature.icon}
          </svg>
        </div>
        <h3 className="mt-4 font-semibold">{feature.title}</h3>
        <p className="mt-1 text-sm text-muted">{feature.text}</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="relative isolate -m-6 min-h-screen overflow-x-clip px-6 pt-3 pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-1/2 -z-10 h-[30rem] w-[52rem] -translate-x-1/2 rounded-full bg-linear-to-r from-amber-4/40 via-orange-4/30 to-rose-4/30 blur-3xl dark:opacity-40"
      />
      <Header />
      <Hero />
      <WorksWith />
      <TryIt />

      {/* numbers that count up the first time they're seen */}
      <Reveal className="mx-auto mt-24 grid max-w-5xl grid-cols-2 gap-6 text-center lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label}>
            <CountUp to={s.value} />
            <p className="text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </Reveal>

      {/* features: a soft light follows the pointer across each card */}
      <Reveal
        id="features"
        className="mx-auto mt-24 grid max-w-5xl scroll-mt-24 gap-4 sm:grid-cols-3"
      >
        {FEATURES.map((f) => (
          <Feature key={f.title} feature={f} />
        ))}
      </Reveal>

      <footer className="mx-auto mt-24 flex max-w-5xl flex-col items-center justify-between gap-4 border-t border-line pt-8 text-sm text-muted sm:flex-row">
        <p>
          Change a class in App.jsx, or a color in kbach.config.js: the page updates as you type.
        </p>
        <a href="#top" className="shrink-0 hover:text-ink">
          Back to top ↑
        </a>
      </footer>
    </div>
  );
}
