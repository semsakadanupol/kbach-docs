// Chat, in React: the same page as the HTML version. The list and the chat sit side by side
// from md; on a phone, one at a time.
import { useEffect, useRef, useState } from 'react';
import { clsx } from '@kbach/react';

const CONVERSATIONS = [
  {
    name: 'Srey Chan',
    last: 'Typing…',
    time: 'now',
    online: true,
    avatar: 'from-violet-5 to-fuchsia-6',
    current: true,
  },
  {
    name: 'Design team',
    last: 'Bora: the new icons are in the shared folder, take a look when you can',
    time: '9:41',
    online: true,
    unread: 3,
    avatar: 'from-sky-5 to-blue-6',
  },
  {
    name: 'Visal Keo',
    last: 'Thanks! See you then 👋',
    time: 'Tue',
    avatar: 'from-amber-5 to-orange-6',
  },
  {
    name: 'Mony Ouk-Fairbanks-Delacroix',
    last: 'The invoice is attached',
    time: 'Mon',
    avatar: 'from-emerald-5 to-teal-6',
  },
];
const FIRST = [
  {
    from: 'them',
    text: 'Morning! Did you get a chance to look at the new home page?',
    time: '9:12',
  },
  { from: 'me', text: 'I did, it looks great on my phone 🙌', time: '9:14' },
  {
    from: 'me',
    text: 'The cards line up even with the long titles now, the two-line clamp did it.',
    time: '9:14',
  },
  { from: 'them', text: 'Nice. Dark mode too?', time: '9:15' },
];
const REPLIES = [
  'Love it.',
  'Ha, same here.',
  'Let me check and get back to you.',
  'Sounds good to me 👍',
];

const initials = (name) =>
  name
    .split(/[\s-]+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
const now = () =>
  new Date()
    .toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })
    .replace(/\s?[AP]M/, '');

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

function Avatar({ name, gradient, online, size = 'size-11 text-sm' }) {
  return (
    <span className="relative shrink-0">
      <span
        className={clsx(
          'grid place-items-center rounded-full bg-linear-to-br font-bold text-white',
          size,
          gradient,
        )}
      >
        {initials(name)}
      </span>
      {online && (
        <span className="absolute right-0 bottom-0 size-3 rounded-full bg-emerald-5 ring-2 ring-card" />
      )}
    </span>
  );
}

// one message: theirs with the avatar (on the last of a run), yours on the right; the corner by
// the sender is the sharp one, and the time shows under the last of a run
function Bubble({ message, first, last, fresh }) {
  const mine = message.from === 'me';
  return (
    <li
      className={clsx(
        'flex items-end gap-2',
        mine && 'flex-row-reverse',
        first && 'mt-3',
        fresh && 'motion-safe:animate-bubble',
      )}
    >
      {!mine &&
        (last ? (
          <Avatar
            name="Srey Chan"
            gradient="from-violet-5 to-fuchsia-6"
            size="size-7 text-[10px]"
          />
        ) : (
          <span className="w-7 shrink-0" />
        ))}
      <div
        className={clsx(
          'flex max-w-[78%] flex-col sm:max-w-md',
          mine ? 'items-end' : 'items-start',
        )}
      >
        <p
          className={clsx(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words',
            mine ? 'bg-brand text-white' : 'bg-well',
            last && (mine ? 'rounded-br-md' : 'rounded-bl-md'),
          )}
        >
          {message.text}
        </p>
        {last && (
          <span className="mt-1 px-1 text-[11px] text-muted">
            {message.time}
            {mine && ' · Seen'}
          </span>
        )}
      </div>
    </li>
  );
}

export default function App() {
  const [messages, setMessages] = useState(FIRST);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [fresh, setFresh] = useState(-1);
  // a phone shows the list or the chat
  const [showList, setShowList] = useState(false);
  const scroller = useRef(null);

  useEffect(() => {
    scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [messages, typing]);
  useEffect(() => {
    const wide = matchMedia('(min-width: 768px)');
    const onWide = () => setShowList(false);
    wide.addEventListener('change', onWide);
    return () => wide.removeEventListener('change', onWide);
  }, []);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const sent = [...messages, { from: 'me', text: text.trim(), time: now() }];
    setMessages(sent);
    setFresh(sent.length - 1);
    setText('');
    // the answer: dots for a moment, then the message
    setTimeout(() => setTyping(true), 500);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        { from: 'them', text: REPLIES[m.length % REPLIES.length], time: now() },
      ]);
      setFresh(sent.length);
    }, 2000);
  };

  return (
    <div className="-m-6 flex h-screen overflow-hidden bg-card">
      <aside
        className={clsx(
          'w-full shrink-0 flex-col border-r border-line md:flex md:w-80',
          showList ? 'flex' : 'hidden',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <h1 className="text-lg font-bold">Messages</h1>
          <button
            aria-label="New message"
            className="grid size-9 place-items-center rounded-lg text-muted transition hover:bg-well hover:text-ink"
          >
            <Icon
              paths={['M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z']}
              className="size-5"
            />
          </button>
        </div>
        <div className="px-4 pb-3">
          <label className="relative block">
            <Icon
              paths={['M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0z', 'm21 21-4.3-4.3']}
              className="pointer-events-none absolute top-2.5 left-3 size-4 stroke-muted"
            />
            <input
              placeholder="Search"
              aria-label="Search"
              className="h-9 w-full rounded-lg bg-well pr-3 pl-9 text-sm outline-none transition focus:ring-2 focus:ring-brand/40"
            />
          </label>
        </div>
        {/* each conversation: avatar (a green dot when they're online), name, last line, time, unread count */}
        <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
          {CONVERSATIONS.map((c) => (
            <li key={c.name}>
              <button
                onClick={() => setShowList(false)}
                className={clsx(
                  'flex w-full items-center gap-3 rounded-xl p-3 text-left',
                  c.current ? 'bg-brand/10' : 'transition hover:bg-well',
                )}
              >
                <Avatar name={c.name} gradient={c.avatar} online={c.online} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <b className="truncate text-sm font-semibold">{c.name}</b>
                    <span
                      className={clsx('shrink-0 text-xs', c.current ? 'text-accent' : 'text-muted')}
                    >
                      {c.time}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm text-muted">{c.last}</span>
                    {c.unread && (
                      <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white">
                        {c.unread}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className={clsx('min-w-0 flex-1 flex-col md:flex', showList ? 'hidden' : 'flex')}>
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-3 sm:px-5">
          <button
            onClick={() => setShowList(true)}
            aria-label="Back to messages"
            className="grid size-9 place-items-center rounded-lg text-muted transition hover:bg-well hover:text-ink md:hidden"
          >
            <Icon paths={['M15 18l-6-6 6-6']} className="size-5" />
          </button>
          <Avatar
            name="Srey Chan"
            gradient="from-violet-5 to-fuchsia-6"
            online
            size="size-10 text-sm"
          />
          <span className="min-w-0 flex-1">
            <b className="block truncate font-semibold">Srey Chan</b>
            <span className="block truncate text-xs text-emerald-7 dark:text-emerald-4">
              Online
            </span>
          </span>
          <button
            aria-label="Call"
            className="grid size-9 place-items-center rounded-lg text-muted transition hover:bg-well hover:text-ink"
          >
            <Icon
              paths={[
                'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z',
              ]}
              className="size-5"
            />
          </button>
          <button
            aria-label="Video call"
            className="hidden size-9 place-items-center rounded-lg text-muted transition hover:bg-well hover:text-ink sm:grid"
          >
            <Icon
              paths={[
                'm23 7-7 5 7 5V7z',
                'M3 5h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
              ]}
              className="size-5"
            />
          </button>
        </header>

        {/* the messages: theirs on the left, yours on the right in the brand color */}
        <ol ref={scroller} className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5 sm:px-5">
          <li className="mx-auto mb-3 rounded-full bg-well px-3 py-1 text-xs font-medium text-muted">
            Today
          </li>
          {messages.map((m, i) => (
            <Bubble
              key={i}
              message={m}
              first={i === 0 || messages[i - 1].from !== m.from}
              last={i === messages.length - 1 || messages[i + 1].from !== m.from}
              fresh={i === fresh}
            />
          ))}
          {typing && (
            // three dots, one after the other
            <li className="mt-2 flex items-end gap-2 motion-safe:animate-bubble">
              <Avatar
                name="Srey Chan"
                gradient="from-violet-5 to-fuchsia-6"
                size="size-7 text-[10px]"
              />
              <span
                className="flex gap-1 rounded-2xl rounded-bl-md bg-well px-4 py-3"
                aria-label="Srey is typing"
              >
                <span className="size-1.5 rounded-full bg-muted motion-safe:animate-blink" />
                <span className="size-1.5 rounded-full bg-muted motion-safe:animate-blink [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-muted motion-safe:animate-blink [animation-delay:300ms]" />
              </span>
            </li>
          )}
        </ol>

        <form
          onSubmit={send}
          className="flex shrink-0 items-end gap-2 border-t border-line p-3 sm:px-5"
        >
          <button
            type="button"
            aria-label="Attach a file"
            className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition hover:bg-well hover:text-ink"
          >
            <Icon
              paths={[
                'm21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48',
              ]}
              className="size-5"
            />
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoComplete="off"
            placeholder="Write a message"
            aria-label="Message"
            className="h-10 min-w-0 flex-1 rounded-full bg-well px-4 text-sm outline-none transition focus:ring-2 focus:ring-brand/40"
          />
          {/* send: faded and still until there's something to send */}
          <button
            aria-label="Send"
            disabled={!text.trim()}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-white shadow-md shadow-brand/30 transition hover:bg-brand/90 active:scale-90 disabled:scale-90 disabled:opacity-40 disabled:shadow-none"
          >
            <Icon paths={['M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z']} className="size-4" />
          </button>
        </form>
      </section>
    </div>
  );
}
