// The list is drawn from `tasks` every time it changes. cn() puts together each element's
// classes from its state (a plain page imports no packages: it's one line), and Kbach's CDN
// script styles every class the moment it's on the page.
const cn = (...parts) => parts.filter(Boolean).join(' ');

const $ = (selector) => document.querySelector(selector);

let tasks = [
  { id: 1, text: 'Pick a color family for the brand', tag: 'Design', done: true },
  {
    id: 2,
    text: 'Write the release notes for 1.1, with the new tools and the two fixes people asked about',
    tag: 'Docs',
    done: false,
  },
  { id: 3, text: 'Try the dark mode button above the preview', tag: 'Kbach', done: false },
  { id: 4, text: 'Book the team lunch', tag: 'Team', done: false },
];
let filter = 'all';
let justAdded = null;
let justDone = null;

const TAGS = {
  Design: 'bg-violet-6/10 text-violet-7 dark:text-violet-4',
  Docs: 'bg-sky-6/10 text-sky-7 dark:text-sky-4',
  Kbach: 'bg-amber-6/10 text-amber-7 dark:text-amber-4',
  Team: 'bg-rose-6/10 text-rose-7 dark:text-rose-4',
  New: 'bg-well text-muted',
};
const FILTERS = [
  ['all', 'All', () => true],
  ['todo', 'To do', (t) => !t.done],
  ['done', 'Done', (t) => t.done],
];
const escape = (s) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function render() {
  const done = tasks.filter((t) => t.done).length;
  $('#progress').style.width = tasks.length ? (done / tasks.length) * 100 + '%' : '0%';
  $('#progress-label').textContent = done + ' of ' + tasks.length + ' done';
  $('#left').textContent = tasks.length - done + ' left';
  $('#clear').disabled = done === 0;

  $('#filters').innerHTML = FILTERS.map(([id, label, test]) => {
    const on = id === filter;
    const button = cn(
      'flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition',
      on ? 'bg-card text-ink shadow-sm ring-1 ring-line' : 'text-muted hover:text-ink',
    );
    const count = cn(
      'rounded-full px-1.5 text-xs tabular-nums',
      on ? 'bg-brand/15 text-accent' : 'bg-well',
    );
    return `<button data-filter="${id}" aria-pressed="${on}" class="${button}">${label}<span class="${count}">${tasks.filter(test).length}</span></button>`;
  }).join('');

  const shown = tasks.filter(FILTERS.find((f) => f[0] === filter)[2]);
  $('#list').innerHTML = shown.length
    ? shown.map(row).join('')
    : // nothing to show: say so, with an icon
      `<li class="flex flex-col items-center px-6 py-12 text-center motion-safe:animate-enter">
        <span class="grid size-12 place-items-center rounded-2xl bg-well text-muted"><svg viewBox="0 0 24 24" class="size-6 fill-none stroke-current stroke-2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></span>
        <p class="mt-3 font-semibold">${filter === 'done' ? 'Nothing done yet' : 'All clear'}</p>
        <p class="mt-1 text-sm text-muted">${filter === 'done' ? 'Check a task off and it shows up here.' : 'Add a task above to get going.'}</p>
      </li>`;
  justAdded = justDone = null;
}

// a task: the round box (its tick pops when it's checked), the words (struck through when done,
// two lines at most), its tag, and the delete button (shown on hover; always on a touch screen)
function row(t) {
  const item = cn(
    'group flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-well/40',
    t.id === justAdded && 'motion-safe:animate-enter',
  );
  const box = cn(
    'grid size-6 shrink-0 place-items-center rounded-full border-2 transition',
    t.done ? 'border-brand bg-brand text-white' : 'border-line text-transparent hover:border-brand',
  );
  const tick = cn(
    'size-3.5 fill-none stroke-current stroke-[3]',
    t.id === justDone && 'motion-safe:animate-pop',
  );
  const words = cn(
    'min-w-0 flex-1 line-clamp-2 text-sm transition-colors',
    t.done && 'text-muted line-through',
  );
  const tag = cn(
    'hidden shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold sm:inline',
    TAGS[t.tag],
  );
  return `<li class="${item}">
    <button data-toggle="${t.id}" aria-pressed="${t.done}" aria-label="${t.done ? 'Mark as to do' : 'Mark as done'}" class="${box}">
      <svg viewBox="0 0 24 24" class="${tick}" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    </button>
    <span class="${words}">${escape(t.text)}</span>
    <span class="${tag}">${t.tag}</span>
    <button data-delete="${t.id}" aria-label="Delete" class="grid size-8 shrink-0 place-items-center rounded-lg text-muted opacity-0 transition group-hover:opacity-100 hover:bg-rose-6/10 hover:text-rose-6 focus-visible:opacity-100 pointer-coarse:opacity-100">
      <svg viewBox="0 0 24 24" class="size-4 fill-none stroke-current stroke-2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
    </button>
  </li>`;
}

$('#add').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $('#new-task').value.trim();
  if (!text) return;
  justAdded = Date.now();
  tasks = [{ id: justAdded, text, tag: 'New', done: false }, ...tasks];
  $('#new-task').value = '';
  if (filter === 'done') filter = 'all';
  render();
});

$('#list').addEventListener('click', (e) => {
  const toggle = e.target.closest('[data-toggle]');
  const remove = e.target.closest('[data-delete]');
  if (toggle) {
    const id = Number(toggle.dataset.toggle);
    tasks = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    if (tasks.find((t) => t.id === id).done) justDone = id;
  }
  if (remove) tasks = tasks.filter((t) => t.id !== Number(remove.dataset.delete));
  if (toggle || remove) render();
});

$('#filters').addEventListener('click', (e) => {
  const b = e.target.closest('[data-filter]');
  if (!b) return;
  filter = b.dataset.filter;
  render();
});

$('#clear').addEventListener('click', () => {
  tasks = tasks.filter((t) => !t.done);
  render();
});

$('#today').textContent = new Date().toLocaleDateString('en', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});
render();
