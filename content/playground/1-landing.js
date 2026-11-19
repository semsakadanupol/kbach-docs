// The classes here use the theme in kbach.config.js (ink, muted, card, well, brand,
// accent), so none of them needs a dark: twin.

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/** Takes `from` off an element and puts `to` on (classes that would fight each other). */
function swap(el, from, to) {
  el.classList.remove(...from);
  el.classList.add(...to);
}

/** Plays an animate-(…) class again from the start. */
function replay(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth; // a reflow, so the browser sees the class come back
  el.classList.add(cls);
}

/** Copies `text`, then says so on the button for a moment. Returns whether it worked. */
async function copyText(button, text, fallback) {
  let copied = true;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = 'Copied';
  } catch {
    // no clipboard here: select the text, so Ctrl+C copies it
    getSelection().selectAllChildren(fallback);
    button.textContent = 'Ctrl+C';
    copied = false;
  }
  clearTimeout(button.timer);
  button.timer = setTimeout(() => (button.textContent = 'Copy'), 1500);
  return copied;
}

// --- the bar: frosted glass once the page has scrolled

const header = $('#site-header');
const glass = [
  'bg-card/70',
  'shadow-lg',
  'shadow-ink/5',
  'ring-1',
  'ring-ink/10',
  'backdrop-blur-xl',
];
const frost = () => glass.forEach((c) => header.classList.toggle(c, scrollY > 8));
addEventListener('scroll', frost, { passive: true });
frost();

// --- the phone menu: the button opens it (its icon turns into ✕); a link, Esc or a click outside closes it

const menu = $('#mobile-menu');
const menuButton = $('#menu-button');

function setMenu(open) {
  menu.classList.toggle('hidden', !open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('[data-icon="open"]').classList.toggle('hidden', open);
  menuButton.querySelector('[data-icon="close"]').classList.toggle('hidden', !open);
}

menuButton.addEventListener('click', () => setMenu(menu.classList.contains('hidden')));
menu.addEventListener('click', (e) => e.target.closest('a') && setMenu(false));
document.addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));
document.addEventListener('click', (e) => !e.target.closest('header') && setMenu(false));
matchMedia('(min-width: 640px)').addEventListener('change', (e) => e.matches && setMenu(false));

// --- install: pick a package, copy its command

const command = $('#command');
const copy = $('#copy');
const packages = $$('[data-cmd]');
const picked = ['bg-brand/10', 'text-accent'];
const notPicked = ['text-muted', 'hover:bg-well', 'hover:text-ink'];

function pick(button) {
  for (const b of packages) {
    const on = b === button;
    swap(b, on ? notPicked : picked, on ? picked : notPicked);
    b.setAttribute('aria-pressed', String(on));
  }
  command.textContent = button.dataset.cmd;
  replay(command, 'animate-(--pop)');
}

packages.forEach((b) => b.addEventListener('click', () => pick(b)));
pick(packages[0]);

// the button turns green for a moment
const copyIdle = ['bg-ink', 'hover:bg-ink/80', 'text-surface'];
const copyDone = ['bg-emerald-6', 'hover:bg-emerald-6', 'text-white'];
copy.addEventListener('click', async () => {
  if (!(await copyText(copy, command.textContent, command))) return;
  swap(copy, copyIdle, copyDone);
  setTimeout(() => swap(copy, copyDone, copyIdle), 1500);
});

// --- works with: a second copy of the list, so the strip loops without a seam

const marquee = $('#marquee');
for (const item of [...marquee.children]) {
  const twin = item.cloneNode(true);
  twin.setAttribute('aria-hidden', 'true');
  marquee.append(twin);
}

// --- try it: each choice swaps one class on the button

const demo = $('#demo-button');
const demoCode = $('#demo-code');
const shadow = $('#shadow');
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
const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};
const choice = { color: 'amber', radius: 'rounded-xl', size: 'md' };
const chipOn = ['ring-2', 'ring-ink'];
const optionOn = ['bg-card', 'text-ink', 'shadow-sm', 'ring-1', 'ring-line'];
const optionOff = ['text-muted'];

const demoClasses = () =>
  [
    COLORS[choice.color],
    choice.radius,
    SIZES[choice.size],
    shadow.checked && SHADOWS[choice.color],
    'font-semibold text-white transition active:scale-95',
  ]
    .filter(Boolean)
    .join(' ');

function renderDemo() {
  const cls = demoClasses();
  demo.className = cls;
  // the tag, colored as in an editor
  const token = (color, text) => `<span class="${color}">${text}</span>`;
  demoCode.innerHTML = [
    token('text-code-tag', '&lt;button'),
    ' ',
    token('text-code-attr', 'class'),
    '=',
    token('text-code-value', `"${cls}"`),
    token('text-code-tag', '&gt;'),
  ].join('');
  for (const group of $$('[data-group]')) {
    for (const b of group.children) {
      const on = choice[group.dataset.group] === b.dataset.value;
      b.setAttribute('aria-pressed', String(on));
      if (group.dataset.group === 'color') chipOn.forEach((c) => b.classList.toggle(c, on));
      else swap(b, on ? optionOff : optionOn, on ? optionOn : optionOff);
    }
  }
}

for (const group of $$('[data-group]')) {
  group.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    choice[group.dataset.group] = b.dataset.value;
    renderDemo();
    replay(demo, 'animate-(--pop)');
  });
}
shadow.addEventListener('change', renderDemo);
$('#demo-copy').addEventListener('click', (e) =>
  copyText(
    e.currentTarget,
    '<button class="' + demoClasses() + '">Install Kbach</button>',
    demoCode,
  ),
);
renderDemo();

// --- sections rise in as they come into view, and the numbers count up
// (both skipped for readers who asked their system for less motion)

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const hidden = ['opacity-0', 'translate-y-6'];
  const reveal = new IntersectionObserver(
    (entries) => {
      for (const e of entries.filter((e) => e.isIntersecting)) {
        e.target.classList.remove(...hidden);
        reveal.unobserve(e.target);
      }
    },
    { threshold: 0.15 },
  );
  for (const el of $$('[data-reveal]')) {
    el.classList.add('transition', 'duration-700', 'ease-out', ...hidden);
    reveal.observe(el);
  }

  const countUp = new IntersectionObserver(
    (entries) => {
      for (const e of entries.filter((e) => e.isIntersecting)) {
        countUp.unobserve(e.target);
        const target = Number(e.target.dataset.count);
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / 1200);
          e.target.textContent = String(Math.round(target * (1 - (1 - t) ** 3)));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    },
    { threshold: 0.6 },
  );
  for (const el of $$('[data-count]')) {
    el.textContent = '0';
    countUp.observe(el);
  }
}

// --- the feature cards: a soft light in the card's color follows the pointer

for (const card of $$('[data-spotlight]')) {
  const light = document.createElement('span');
  light.className =
    'pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100';
  card.prepend(light);
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const at = e.clientX - r.left + 'px ' + (e.clientY - r.top) + 'px';
    light.style.background = `radial-gradient(260px circle at ${at}, rgba(${card.dataset.spotlight}, 0.16), transparent 65%)`;
  });
}
