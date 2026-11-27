// The form's script, in TypeScript (the playground compiles it as it runs). The browser checks
// the fields (required, type="email", minlength); the classes show it: user-invalid: turns a
// field red once it's been left wrong, and peer-user-invalid: shows its message.

const form = document.querySelector<HTMLFormElement>('#form')!;
const password = document.querySelector<HTMLInputElement>('#password')!;
const bars = [...document.querySelectorAll<HTMLElement>('#meter > span')];
const strengthLabel = document.querySelector<HTMLElement>('#strength-label')!;

type Strength = { score: 0 | 1 | 2 | 3 | 4; label: string; color: string };

const LEVELS: Strength[] = [
  { score: 0, label: '8 characters or more', color: 'bg-well' },
  { score: 1, label: 'Weak', color: 'bg-rose-5' },
  { score: 2, label: 'Fair', color: 'bg-amber-5' },
  { score: 3, label: 'Good', color: 'bg-lime-5' },
  { score: 4, label: 'Strong', color: 'bg-emerald-5' },
];
const COLORS = LEVELS.map((l) => l.color);

/** A point each for: 8+ characters, upper and lower case, a number, a symbol. */
function strength(value: string): Strength {
  if (!value) return LEVELS[0];
  const points = [
    value.length >= 8,
    /[a-z]/.test(value) && /[A-Z]/.test(value),
    /\d/.test(value),
    /[^\w\s]/.test(value),
  ];
  const score = Math.max(1, points.filter(Boolean).length) as Strength['score'];
  return LEVELS[score];
}

// --- the meter: the first `score` bars take the level's color
password.addEventListener('input', () => {
  const s = strength(password.value);
  bars.forEach((bar, i) => {
    bar.classList.remove(...COLORS);
    bar.classList.add(i < s.score ? s.color : 'bg-well');
  });
  strengthLabel.textContent = s.label;
});

// --- show / hide the password (the eye gets a slash while it shows)
const reveal = document.querySelector<HTMLButtonElement>('#reveal')!;
reveal.addEventListener('click', () => {
  const show = password.type === 'password';
  password.type = show ? 'text' : 'password';
  reveal.setAttribute('aria-pressed', String(show));
  reveal.setAttribute('aria-label', show ? 'Hide the password' : 'Show the password');
  document.querySelector('#eye-slash')!.classList.toggle('hidden', !show);
});

/** Plays an animate-(…) class again from the start. */
function replay(el: Element, cls: string): void {
  el.classList.remove(cls);
  void (el as HTMLElement).offsetWidth; // a reflow, so the browser sees the class come back
  el.classList.add(cls);
}

// --- submit: wrong → every field shows why and the form shakes; right → a moment, then done
const submit = document.querySelector<HTMLButtonElement>('#submit')!;
const done = document.querySelector<HTMLElement>('#done')!;

form.addEventListener('submit', (e: SubmitEvent) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    // reportValidity marks the fields as left wrong (user-invalid) and points at the first
    form.reportValidity();
    replay(form, 'motion-safe:animate-shake');
    return;
  }
  submit.disabled = true;
  document.querySelector('#spinner')!.classList.remove('hidden');
  document.querySelector('#submit-label')!.textContent = 'Creating your account…';
  setTimeout(() => {
    document.querySelector('#sent-to')!.textContent = String(new FormData(form).get('email'));
    document.querySelector('#form-box')!.classList.add('hidden');
    done.classList.remove('hidden');
  }, 900);
});

document.querySelector('#again')!.addEventListener('click', () => {
  form.reset();
  password.dispatchEvent(new Event('input'));
  submit.disabled = false;
  document.querySelector('#spinner')!.classList.add('hidden');
  document.querySelector('#submit-label')!.textContent = 'Create account';
  done.classList.add('hidden');
  document.querySelector('#form-box')!.classList.remove('hidden');
});
