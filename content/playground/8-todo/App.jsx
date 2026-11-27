// Todo list, in React: the same page as the HTML version, with the list in state.
import { useState } from 'react';
import { clsx } from '@kbach/react';

const TAGS = {
  Design: 'bg-violet-6/10 text-violet-7 dark:text-violet-4',
  Docs: 'bg-sky-6/10 text-sky-7 dark:text-sky-4',
  Kbach: 'bg-amber-6/10 text-amber-7 dark:text-amber-4',
  Team: 'bg-rose-6/10 text-rose-7 dark:text-rose-4',
  New: 'bg-well text-muted',
};
const FILTERS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'todo', label: 'To do', test: (t) => !t.done },
  { id: 'done', label: 'Done', test: (t) => t.done },
];
const FIRST = [
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

// a task: the round box (its tick pops when it's checked), the words (struck through when done,
// two lines at most), its tag, and the delete button (shown on hover; always on a touch screen)
function Task({ task, isNew, onToggle, onDelete }) {
  return (
    <li
      className={clsx(
        'group flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-well/40',
        isNew && 'motion-safe:animate-enter',
      )}
    >
      <button
        onClick={onToggle}
        aria-pressed={task.done}
        aria-label={task.done ? 'Mark as to do' : 'Mark as done'}
        className={clsx(
          'grid size-6 shrink-0 place-items-center rounded-full border-2 transition',
          task.done
            ? 'border-brand bg-brand text-white'
            : 'border-line text-transparent hover:border-brand',
        )}
      >
        <Icon
          paths={['M20 6 9 17l-5-5']}
          className={clsx('size-3.5 stroke-[3]', task.done && 'motion-safe:animate-pop')}
        />
      </button>
      <span
        className={clsx(
          'min-w-0 flex-1 line-clamp-2 text-sm transition-colors',
          task.done && 'text-muted line-through',
        )}
      >
        {task.text}
      </span>
      <span
        className={clsx(
          'hidden shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold sm:inline',
          TAGS[task.tag],
        )}
      >
        {task.tag}
      </span>
      <button
        onClick={onDelete}
        aria-label="Delete"
        className="grid size-8 shrink-0 place-items-center rounded-lg text-muted opacity-0 transition group-hover:opacity-100 hover:bg-rose-6/10 hover:text-rose-6 focus-visible:opacity-100 pointer-coarse:opacity-100"
      >
        <Icon
          paths={[
            'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
          ]}
          className="size-4"
        />
      </button>
    </li>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(FIRST);
  const [filter, setFilter] = useState('all');
  const [text, setText] = useState('');
  const [added, setAdded] = useState(null);
  const done = tasks.filter((t) => t.done).length;
  const shown = tasks.filter(FILTERS.find((f) => f.id === filter).test);
  const today = new Date().toLocaleDateString('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const add = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const id = Date.now();
    setTasks([{ id, text: text.trim(), tag: 'New', done: false }, ...tasks]);
    setAdded(id);
    setText('');
    if (filter === 'done') setFilter('all');
  };

  return (
    <main className="-m-6 grid min-h-screen place-items-start bg-linear-to-b from-brand/10 to-transparent px-4 py-10 sm:place-items-center sm:py-16">
      <section className="mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-card shadow-2xl shadow-ink/5">
        <header className="p-6 pb-5">
          <p className="text-sm font-medium text-muted">{today}</p>
          <div className="mt-1 flex items-end justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight">My tasks</h1>
            <p className="shrink-0 text-sm text-muted tabular-nums">
              {done} of {tasks.length} done
            </p>
          </div>
          {/* how much is done: the bar's width follows */}
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-well">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
              style={{ width: tasks.length ? (done / tasks.length) * 100 + '%' : '0%' }}
            />
          </div>

          <form onSubmit={add} className="mt-5 flex gap-2">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">A new task</span>
              <Icon
                paths={['M12 5v14M5 12h14']}
                className="pointer-events-none absolute top-3 left-3.5 size-5 stroke-muted"
              />
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoComplete="off"
                placeholder="Add a task, press Enter"
                className="h-11 w-full rounded-xl border border-line bg-surface pr-3 pl-10 text-sm outline-none transition placeholder:text-muted/70 focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/15"
              />
            </label>
            <button className="h-11 shrink-0 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:bg-brand/90 active:scale-95">
              Add
            </button>
          </form>
        </header>

        {/* All / To do / Done, each with its count */}
        <nav
          aria-label="Show"
          className="flex gap-1 border-y border-line bg-well/40 px-4 py-2 text-sm font-medium"
        >
          {FILTERS.map((f) => {
            const on = f.id === filter;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                aria-pressed={on}
                className={clsx(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition',
                  on ? 'bg-card text-ink shadow-sm ring-1 ring-line' : 'text-muted hover:text-ink',
                )}
              >
                {f.label}
                <span
                  className={clsx(
                    'rounded-full px-1.5 text-xs tabular-nums',
                    on ? 'bg-brand/15 text-accent' : 'bg-well',
                  )}
                >
                  {tasks.filter(f.test).length}
                </span>
              </button>
            );
          })}
        </nav>

        <ul className="divide-y divide-line">
          {shown.map((t) => (
            <Task
              key={t.id}
              task={t}
              isNew={t.id === added}
              onToggle={() =>
                setTasks(tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))
              }
              onDelete={() => setTasks(tasks.filter((x) => x.id !== t.id))}
            />
          ))}
          {shown.length === 0 && (
            // nothing to show: say so, with an icon
            <li
              key={filter}
              className="flex flex-col items-center px-6 py-12 text-center motion-safe:animate-enter"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-well text-muted">
                <Icon
                  paths={[
                    'M9 11l3 3L22 4',
                    'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
                  ]}
                  className="size-6"
                />
              </span>
              <p className="mt-3 font-semibold">
                {filter === 'done' ? 'Nothing done yet' : 'All clear'}
              </p>
              <p className="mt-1 text-sm text-muted">
                {filter === 'done'
                  ? 'Check a task off and it shows up here.'
                  : 'Add a task above to get going.'}
              </p>
            </li>
          )}
        </ul>

        <footer className="flex items-center justify-between px-6 py-4 text-sm text-muted">
          <span className="tabular-nums">{tasks.length - done} left</span>
          <button
            onClick={() => setTasks(tasks.filter((t) => !t.done))}
            disabled={done === 0}
            className="font-medium transition-colors hover:text-rose-6 disabled:opacity-40 disabled:hover:text-muted"
          >
            Clear done
          </button>
        </footer>
      </section>
    </main>
  );
}
