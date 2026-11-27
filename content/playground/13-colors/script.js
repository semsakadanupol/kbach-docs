// Kbach's 26 color families, twelve shades each: bg-rose-6 and the rest are real classes, and
// Kbach's CDN script styles each one the moment it's on the page. A hex value is read from the
// page once the script has styled it (Kbach.ready): a plain page has the CSS, not the palette.
const $ = (selector) => document.querySelector(selector);
const cn = (...parts) => parts.filter(Boolean).join(' ');
const SHADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// the grays first, then around the color wheel
const FAMILIES = [
  'neutral',
  'taupe',
  'stone',
  'olive',
  'mist',
  'slate',
  'gray',
  'zinc',
  'mauve',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
];

/** An element's background as #rrggbb (the browser gives rgb(…)). */
function hexOf(el) {
  const probe = document.createElement('canvas').getContext('2d');
  probe.fillStyle = getComputedStyle(el).backgroundColor;
  return probe.fillStyle;
}

let picked = { family: 'violet', shade: 6 };

// the shade numbers on top, then a row per family: its name and twelve swatches
$('#palette').innerHTML =
  `<div class="grid grid-cols-[4.5rem_repeat(12,minmax(0,1fr))] gap-1.5 text-center text-[11px] text-muted"><span></span>${SHADES.map((s) => `<span>${s}</span>`).join('')}</div>` +
  FAMILIES.map(
    (f) => `<div class="grid grid-cols-[4.5rem_repeat(12,minmax(0,1fr))] items-center gap-1.5">
      <span class="truncate text-xs font-medium text-muted capitalize">${f}</span>
      ${SHADES.map((s) => `<button data-family="${f}" data-shade="${s}" title="bg-${f}-${s}" aria-label="${f} ${s}" class="bg-${f}-${s} aspect-[4/3] rounded-md ring-ink ring-offset-2 ring-offset-surface transition duration-200 hover:z-10 hover:scale-125 hover:shadow-lg"></button>`).join('')}
    </div>`,
  ).join('');

// the classes the picked color changes, each built from its fixed part with cn
const big = $('#big');
const BIG = big.className;
const ON_WHITE = $('#on-white').className;
const ON_BLACK = $('#on-black').className;

function show() {
  const { family, shade } = picked;
  const name = family + '-' + shade;
  for (const b of document.querySelectorAll('[data-family]')) {
    const on = b.dataset.family === family && Number(b.dataset.shade) === shade;
    b.classList.toggle('ring-2', on);
    b.setAttribute('aria-pressed', String(on));
  }
  // the big swatch: its color, and words light or dark enough to read on it
  big.className = cn(BIG, 'bg-' + name, shade >= 6 ? 'text-white' : 'text-zinc-11');
  $('#big-name').textContent = name;
  $('#big-hex').textContent = hexOf(
    document.querySelector(`[data-family="${family}"][data-shade="${shade}"]`),
  );
  $('#copy').innerHTML = ['bg', 'text', 'border', 'ring']
    .map(
      (p) =>
        `<button data-copy="${p}-${name}" class="rounded-lg bg-well px-2.5 py-1.5 font-mono text-xs transition hover:bg-ink hover:text-surface active:scale-95">${p}-${name}</button>`,
    )
    .join('');
  $('#on-white').className = cn(ON_WHITE, 'text-' + name);
  $('#on-black').className = cn(ON_BLACK, 'text-' + name);
}

let toastTimer;
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    $('#toast').textContent = 'Copied ' + text;
  } catch {
    $('#toast').textContent = text;
  }
  const toast = $('#toast');
  toast.classList.remove('hidden', 'motion-safe:animate-pop');
  void toast.offsetWidth; // a reflow, so the pop plays again
  toast.classList.add('motion-safe:animate-pop');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 1600);
}

$('#palette').addEventListener('click', (e) => {
  const b = e.target.closest('[data-family]');
  if (!b) return;
  picked = { family: b.dataset.family, shade: Number(b.dataset.shade) };
  show();
  copy('bg-' + picked.family + '-' + picked.shade);
});
$('#copy').addEventListener('click', (e) => {
  const b = e.target.closest('[data-copy]');
  if (b) copy(b.dataset.copy);
});
// the hex values need the swatches styled: once the CDN script has, each swatch's tooltip has its own
Kbach.ready.then(() => {
  for (const b of document.querySelectorAll('[data-family]')) b.title += '  ' + hexOf(b);
  show();
});
show();
