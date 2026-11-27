// Sign-up form, in React and TypeScript: the same page as the HTML version. The browser checks
// the fields (required, type="email", minLength); the classes show it: user-invalid: turns a
// field red once it's been left wrong, and peer-user-invalid: shows its message.
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { clsx } from '@kbach/react';

type Strength = { score: 0 | 1 | 2 | 3 | 4; label: string; color: string };

const LEVELS: Strength[] = [
  { score: 0, label: '8 characters or more', color: 'bg-well' },
  { score: 1, label: 'Weak', color: 'bg-rose-5' },
  { score: 2, label: 'Fair', color: 'bg-amber-5' },
  { score: 3, label: 'Good', color: 'bg-lime-5' },
  { score: 4, label: 'Strong', color: 'bg-emerald-5' },
];

/** A point each for: 8+ characters, upper and lower case, a number, a symbol. */
function strength(value: string): Strength {
  if (!value) return LEVELS[0];
  const points = [
    value.length >= 8,
    /[a-z]/.test(value) && /[A-Z]/.test(value),
    /\d/.test(value),
    /[^\w\s]/.test(value),
  ];
  return LEVELS[Math.max(1, points.filter(Boolean).length)];
}

const FIELD =
  'block h-11 w-full rounded-xl border border-line bg-card text-sm outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/15 user-invalid:border-rose-6 user-invalid:focus:ring-rose-6/15';

function Icon({ d, className }: { d: string[]; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={clsx('fill-none stroke-current stroke-2', className)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d.map((p) => (
        <path key={p} d={p} />
      ))}
    </svg>
  );
}

function Field({
  label,
  aside,
  children,
}: {
  label: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-sm font-medium">
        {label} {aside}
      </span>
      {children}
    </label>
  );
}

function Picture() {
  return (
    <aside className="relative isolate hidden flex-col justify-between overflow-hidden bg-linear-to-br from-emerald-6 to-teal-9 p-12 text-white lg:flex">
      <div className="absolute -top-24 -right-24 -z-10 size-96 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-32 -left-16 -z-10 size-80 rounded-full bg-teal-4/30 blur-3xl" />
      <a href="#" className="flex items-center gap-2.5 text-lg font-bold">
        <span className="grid size-9 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
          <Icon d={['M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z']} className="size-5" />
        </span>
        Riverleaf
      </a>
      <figure className="m-0 max-w-md">
        <blockquote className="m-0 text-2xl leading-snug font-medium text-balance">
          “We moved the whole team over in an afternoon. A month later nobody remembers the old
          tool.”
        </blockquote>
        <figcaption className="mt-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-white/20 font-semibold ring-2 ring-white/30">
            DN
          </span>
          <span>
            <b className="block">Dara Nguon</b>
            <span className="text-sm text-white/75">Head of design, Mekong Labs</span>
          </span>
        </figcaption>
      </figure>
    </aside>
  );
}

export default function App() {
  const form = useRef<HTMLFormElement>(null);
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [state, setState] = useState<'editing' | 'sending' | 'done'>('editing');
  const [email, setEmail] = useState('');
  // a wrong submit shakes the form (until the animation ends)
  const [shaking, setShaking] = useState(false);
  const s = strength(password);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    if (!f.checkValidity()) {
      // reportValidity marks the fields as left wrong (user-invalid) and points at the first
      f.reportValidity();
      setShaking(true);
      return;
    }
    setEmail(String(new FormData(f).get('email')));
    setState('sending');
    setTimeout(() => setState('done'), 900);
  };

  return (
    // two halves from lg (the picture side hides below it), the form centered in its half
    <main className="-m-6 grid min-h-screen lg:grid-cols-2">
      <Picture />
      <div className="grid place-items-center px-6 py-12">
        <div className="w-full max-w-sm">
          {state !== 'done' ? (
            <div className="motion-safe:animate-rise">
              <form
                ref={form}
                noValidate
                onSubmit={onSubmit}
                onAnimationEnd={() => setShaking(false)}
                className={clsx(shaking && 'motion-safe:animate-shake')}
              >
                <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
                <p className="mt-1.5 text-sm text-muted">Free for 14 days. No card needed.</p>

                <div className="mt-8 space-y-5">
                  <Field label="Name">
                    <input
                      name="name"
                      autoComplete="name"
                      placeholder="Sokha Kim"
                      required
                      className={clsx('mt-1.5 px-3.5', FIELD)}
                    />
                  </Field>

                  {/* the message shows only once the field has been left wrong (user-invalid, through peer) */}
                  <Field label="Email">
                    <span className="relative mt-1.5 block">
                      <Icon
                        d={[
                          'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
                          'm22 6-10 7L2 6',
                        ]}
                        className="pointer-events-none absolute top-3.5 left-3.5 size-4 stroke-muted"
                      />
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        required
                        className={clsx('peer pr-3.5 pl-10', FIELD)}
                      />
                      <span className="mt-1.5 hidden text-xs text-rose-7 peer-user-invalid:block dark:text-rose-4">
                        Enter an email address, like you@example.com
                      </span>
                    </span>
                  </Field>

                  <Field
                    label="Password"
                    aside={<span className="text-xs font-normal text-muted">{s.label}</span>}
                  >
                    <span className="relative mt-1.5 block">
                      <input
                        name="password"
                        type={show ? 'text' : 'password'}
                        autoComplete="new-password"
                        minLength={8}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={clsx('pr-11 pl-3.5', FIELD)}
                      />
                      <button
                        type="button"
                        onClick={() => setShow(!show)}
                        aria-label={show ? 'Hide the password' : 'Show the password'}
                        aria-pressed={show}
                        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted transition-colors hover:text-ink"
                      >
                        {/* the eye gets a slash while the password shows */}
                        <Icon
                          d={[
                            'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z',
                            'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
                            ...(show ? ['M3 3l18 18'] : []),
                          ]}
                          className="size-4"
                        />
                      </button>
                    </span>
                    {/* four bars: as many fill as the password is strong, in that strength's color */}
                    <span className="mt-2.5 grid grid-cols-4 gap-1.5" aria-hidden="true">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className={clsx(
                            'h-1 rounded-full transition-colors duration-300',
                            i < s.score ? s.color : 'bg-well',
                          )}
                        />
                      ))}
                    </span>
                  </Field>

                  {/* a checkbox drawn with classes: the box fills and the tick shows when it's checked */}
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
                    <input name="terms" type="checkbox" required className="peer sr-only" />
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-line bg-card text-transparent transition peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20">
                      <Icon d={['M20 6 9 17l-5-5']} className="size-3.5 stroke-[3]" />
                    </span>
                    <span>
                      I agree to the{' '}
                      <a href="#" className="font-medium text-ink underline underline-offset-2">
                        terms
                      </a>{' '}
                      and the{' '}
                      <a href="#" className="font-medium text-ink underline underline-offset-2">
                        privacy policy
                      </a>
                    </span>
                  </label>
                </div>

                <button
                  disabled={state === 'sending'}
                  className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand/90 active:scale-[0.98] disabled:opacity-70"
                >
                  {state === 'sending' && (
                    <Icon d={['M12 3a9 9 0 1 0 9 9']} className="size-4 animate-spin stroke-[3]" />
                  )}
                  {state === 'sending' ? 'Creating your account…' : 'Create account'}
                </button>
                <p className="mt-6 text-center text-sm text-muted">
                  Already have an account?{' '}
                  <a href="#" className="font-semibold text-accent hover:underline">
                    Sign in
                  </a>
                </p>
              </form>
            </div>
          ) : (
            // after a good submit: a tick that pops, and what happens next
            <div className="text-center">
              <span className="mx-auto grid size-16 motion-safe:animate-pop place-items-center rounded-full bg-brand/15 text-accent">
                <Icon d={['M20 6 9 17l-5-5']} className="size-8 stroke-[2.5]" />
              </span>
              <h2 className="mt-6 text-2xl font-bold tracking-tight">Check your inbox</h2>
              <p className="mt-2 text-sm text-muted">
                We sent a link to <b className="font-semibold text-ink">{email}</b>. Open it to
                finish signing up.
              </p>
              <button
                onClick={() => {
                  setPassword('');
                  setState('editing');
                }}
                className="mt-8 text-sm font-semibold text-accent hover:underline"
              >
                Start over
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
