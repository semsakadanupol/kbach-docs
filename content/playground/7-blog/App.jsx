// Blog, in React: the same page as the HTML version. Titles stop at 2 lines and excerpts at 3
// (line-clamp-2, line-clamp-3), so every card lines up however long its words are.
import { useState } from 'react';
import { clsx } from '@kbach/react';

const TOPICS = ['all', 'design', 'engineering', 'product'];

const FEATURED = {
  topic: 'design',
  date: 'Nov 20',
  read: '9 min read',
  title: 'A design system that bends without breaking, after three redesigns',
  text: "We rebuilt the components three times in two years. The fourth time we started from the tokens instead of the screens, and the next redesign took a week instead of a quarter. Here is what changed, what we kept, and what we'd do differently.",
  author: 'Chenda Lim',
  role: 'Design lead',
};

const POSTS = [
  {
    topic: 'engineering',
    date: 'Nov 18 · 6 min',
    title:
      "Cutting our build from eleven minutes to forty seconds with a cache we almost didn't write",
    text: "The slow part wasn't compiling, it was waiting. A content-addressed cache, a few rules about what counts as an input, and a long afternoon of measuring.",
    author: 'Rithy Heng',
    cover: 'from-sky-4 to-blue-7',
    avatar: 'bg-sky-6/15 text-sky-7 dark:text-sky-4',
    icon: ['M16 18l6-6-6-6M8 6l-6 6 6 6'],
  },
  {
    topic: 'product',
    date: 'Nov 15 · 4 min',
    title: 'What a year of user interviews taught us',
    text: 'Fifty-two conversations, one spreadsheet, and the three questions we now ask in every single one.',
    author: 'Malis Pich',
    cover: 'from-emerald-4 to-teal-7',
    avatar: 'bg-emerald-6/15 text-emerald-7 dark:text-emerald-4',
    icon: ['m23 6-9.5 9.5-5-5L1 18', 'M17 6h6v6'],
  },
  {
    topic: 'design',
    date: 'Nov 11 · 7 min',
    title: 'Dark mode is not just the light theme with the colors flipped, and here is the proof',
    text: 'Shadows disappear, saturated colors glow, and borders that were quiet start to shout. We went through every screen and wrote down what had to change, and why a palette with twelve shades made it far easier.',
    author: 'Sreypov Vann-Okonkwo-Hadley',
    cover: 'from-violet-4 to-indigo-7',
    avatar: 'bg-violet-6/15 text-violet-7 dark:text-violet-4',
    icon: ['M12 2 2 7l10 5 10-5-10-5z', 'm2 17 10 5 10-5M2 12l10 5 10-5'],
  },
  {
    topic: 'engineering',
    date: 'Nov 6 · 5 min',
    title: 'Fast pages on slow phones',
    text: 'We bought the cheapest phone in the shop and used it for a month. Then we cut a third of our JavaScript.',
    author: 'Piseth Seng',
    cover: 'from-amber-4 to-orange-7',
    avatar: 'bg-amber-6/15 text-amber-7 dark:text-amber-4',
    icon: ['M13 2 3 14h9l-1 8 10-12h-9z'],
  },
  {
    topic: 'product',
    date: 'Nov 2 · 3 min',
    title: 'Saying no to the most requested feature, and what we built instead',
    text: 'Everyone asked for it. Nobody would have used it twice. How we found the need under the request.',
    author: 'Nary Khim',
    cover: 'from-pink-4 to-rose-7',
    avatar: 'bg-rose-6/15 text-rose-7 dark:text-rose-4',
    icon: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
  },
  {
    topic: 'design',
    date: 'Oct 28 · 8 min',
    title: 'Writing the words before drawing the boxes',
    text: "Every screen now starts as a page of plain sentences. It's slower for an hour and faster for a month, and the reviews got a lot shorter.",
    author: 'Chenda Lim',
    cover: 'from-cyan-4 to-sky-7',
    avatar: 'bg-cyan-6/15 text-cyan-7 dark:text-cyan-4',
    icon: ['M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z'],
  },
];

const initials = (name) =>
  name
    .split(/[\s-]+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
const label = (topic) => topic[0].toUpperCase() + topic.slice(1);

function Post({ post, delay, saved, onSave }) {
  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5 motion-safe:animate-rise"
      style={{ animationDelay: delay + 'ms' }}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <div
          className={clsx(
            'absolute inset-0 bg-linear-to-br transition duration-500 group-hover:scale-105',
            post.cover,
          )}
        />
        <svg
          viewBox="0 0 24 24"
          className="absolute right-5 bottom-4 size-16 fill-none stroke-white/40 stroke-[1.5]"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {post.icon.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-muted">
          <span className="font-semibold text-accent">{label(post.topic)}</span> · {post.date}
        </p>
        <h3 className="mt-2 line-clamp-2 font-semibold">{post.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted">{post.text}</p>
        <div className="mt-auto flex items-center gap-2.5 pt-5 text-sm">
          <span
            className={clsx(
              'grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-bold',
              post.avatar,
            )}
          >
            {initials(post.author)}
          </span>
          <span className="min-w-0 flex-1 truncate text-muted">{post.author}</span>
          {/* save it: the bookmark fills in the brand's color */}
          <button
            onClick={onSave}
            aria-pressed={saved}
            aria-label={saved ? 'Saved' : 'Save'}
            className={clsx(
              'grid size-8 place-items-center rounded-lg transition hover:bg-well hover:text-ink',
              saved ? 'text-accent' : 'text-muted',
            )}
          >
            <svg
              viewBox="0 0 24 24"
              className={clsx(
                'size-4 stroke-current stroke-2',
                saved ? 'fill-current' : 'fill-none',
              )}
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    // side by side from md, the field and button stacked on a phone
    <section className="mt-12 flex flex-col gap-6 rounded-3xl bg-ink p-6 text-surface sm:p-10 md:flex-row md:items-center md:justify-between">
      <div className="max-w-md">
        <h2 className="text-xl font-bold">One story a week, nothing else</h2>
        <p className="mt-1.5 text-sm text-surface/70">Every Friday. Leave whenever you like.</p>
      </div>
      {done ? (
        <p className="flex items-center gap-2 text-sm font-semibold motion-safe:animate-rise">
          <span className="grid size-6 place-items-center rounded-full bg-brand text-white">✓</span>{' '}
          You’re in. See you on Friday.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
          className="flex w-full flex-col gap-2 sm:flex-row md:max-w-sm"
        >
          <input
            type="email"
            required
            placeholder="you@example.com"
            aria-label="Email"
            className="h-11 min-w-0 flex-1 rounded-xl bg-surface/10 px-4 text-sm text-surface outline-none ring-1 ring-surface/20 transition placeholder:text-surface/50 focus:ring-2 focus:ring-brand"
          />
          <button className="h-11 shrink-0 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand/90 active:scale-95">
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
}

export default function App() {
  const [topic, setTopic] = useState('all');
  // the saved stories, kept here: a post's key changes with the topic (to rise in again)
  const [saved, setSaved] = useState(() => new Set());
  const toggleSaved = (title) =>
    setSaved((s) => {
      const next = new Set(s);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  const shown = POSTS.filter((p) => topic === 'all' || p.topic === topic);
  const showFeatured = topic === 'all' || topic === FEATURED.topic;

  return (
    <main className="mx-auto max-w-6xl py-6 sm:py-10">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-accent">The Field Notes</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Stories from the team
          </h1>
          <p className="mt-3 text-pretty text-muted">
            How we design, build and run the product, written by the people doing it.
          </p>
        </div>
        {/* topics: a row that scrolls sideways on a phone instead of wrapping */}
        <div
          role="group"
          aria-label="Topic"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
        >
          {TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              aria-pressed={t === topic}
              className={clsx(
                'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition',
                t === topic
                  ? 'bg-ink text-surface'
                  : 'bg-card text-muted ring-1 ring-line hover:text-ink',
              )}
            >
              {label(t)}
            </button>
          ))}
        </div>
      </header>

      {/* the featured story: picture and words side by side from lg (a key per topic: it rises in again) */}
      {showFeatured && (
        <a
          key={topic}
          href="#"
          className="group mt-10 grid overflow-hidden rounded-3xl border border-line bg-card transition hover:shadow-2xl hover:shadow-ink/5 motion-safe:animate-rise lg:grid-cols-5"
        >
          <div className="relative aspect-[16/9] overflow-hidden lg:col-span-3 lg:aspect-auto lg:min-h-80">
            <div className="absolute inset-0 bg-linear-to-br from-orange-4 via-rose-5 to-fuchsia-7 transition duration-700 group-hover:scale-105" />
            <div className="absolute -right-10 -bottom-10 size-64 rounded-full border-[40px] border-white/15" />
            <div className="absolute top-8 left-8 size-24 rounded-3xl bg-white/15 backdrop-blur-sm" />
            <span className="absolute bottom-5 left-5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-11">
              Featured
            </span>
          </div>
          <div className="flex flex-col p-6 sm:p-8 lg:col-span-2">
            <p className="flex items-center gap-2 text-xs text-muted">
              <span className="font-semibold text-accent">{label(FEATURED.topic)}</span> ·{' '}
              {FEATURED.date} · {FEATURED.read}
            </p>
            <h2 className="mt-3 line-clamp-2 text-2xl font-bold tracking-tight text-balance">
              {FEATURED.title}
            </h2>
            <p className="mt-3 line-clamp-3 text-muted">{FEATURED.text}</p>
            <div className="mt-auto flex items-center gap-3 pt-6">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-orange-6/15 text-xs font-bold text-orange-7 dark:text-orange-4">
                {initials(FEATURED.author)}
              </span>
              <span className="min-w-0 text-sm">
                <b className="block truncate font-semibold">{FEATURED.author}</b>
                <span className="block truncate text-muted">{FEATURED.role}</span>
              </span>
              <span className="ml-auto flex items-center gap-1 text-sm font-semibold text-accent">
                Read <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </div>
          </div>
        </a>
      )}

      {/* the rest: 1 column, 2 from sm, 3 from lg; they rise in again, a little apart, on a new topic */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((post, i) => (
          <Post
            key={topic + post.title}
            post={post}
            delay={(i + (showFeatured ? 1 : 0)) * 60}
            saved={saved.has(post.title)}
            onSave={() => toggleSaved(post.title)}
          />
        ))}
      </div>

      <Newsletter />
    </main>
  );
}
