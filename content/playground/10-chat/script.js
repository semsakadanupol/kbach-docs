// The messages are drawn from `messages`; a new one pops in, and Srey answers a moment later
// (three dots first). On a phone, the back button shows the list and a conversation shows the chat.
// cn() puts together each bubble's classes from who sent it and where it falls (a plain page
// imports no packages: it's one line); Kbach's CDN script styles them as they appear.
const cn = (...parts) => parts.filter(Boolean).join(' ');

const $ = (selector) => document.querySelector(selector);

const messages = [
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
let typing = false;
let fresh = -1;

const escape = (s) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function render() {
  $('#messages').innerHTML =
    '<li class="mx-auto mb-3 rounded-full bg-well px-3 py-1 text-xs font-medium text-muted">Today</li>' +
    messages.map(bubble).join('') +
    (typing
      ? // three dots, one after the other
        `<li class="mt-2 flex items-end gap-2 motion-safe:animate-bubble">
          <span class="grid size-7 shrink-0 place-items-center rounded-full bg-linear-to-br from-violet-5 to-fuchsia-6 text-[10px] font-bold text-white">SC</span>
          <span class="flex gap-1 rounded-2xl rounded-bl-md bg-well px-4 py-3" aria-label="Srey is typing">
            <span class="size-1.5 rounded-full bg-muted motion-safe:animate-blink"></span>
            <span class="size-1.5 rounded-full bg-muted motion-safe:animate-blink [animation-delay:150ms]"></span>
            <span class="size-1.5 rounded-full bg-muted motion-safe:animate-blink [animation-delay:300ms]"></span>
          </span>
        </li>`
      : '');
  $('#messages').scrollTop = $('#messages').scrollHeight;
  fresh = -1;
}

// one message: theirs with the avatar (on the last of a run), yours on the right; the corner by
// the sender is the sharp one, and the time shows under the last of a run
function bubble(m, i) {
  const mine = m.from === 'me';
  const next = messages[i + 1];
  const last = !next || next.from !== m.from;
  const first = i === 0 || messages[i - 1].from !== m.from;
  const row = cn(
    'flex items-end gap-2',
    mine && 'flex-row-reverse',
    first && 'mt-3',
    i === fresh && 'motion-safe:animate-bubble',
  );
  const column = cn('flex max-w-[78%] flex-col sm:max-w-md', mine ? 'items-end' : 'items-start');
  const words = cn(
    'rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words',
    mine ? 'bg-brand text-white' : 'bg-well',
    last && (mine ? 'rounded-br-md' : 'rounded-bl-md'),
  );
  return `<li class="${row}">
    ${mine ? '' : last ? '<span class="grid size-7 shrink-0 place-items-center rounded-full bg-linear-to-br from-violet-5 to-fuchsia-6 text-[10px] font-bold text-white">SC</span>' : '<span class="w-7 shrink-0"></span>'}
    <div class="${column}">
      <p class="${words}">${escape(m.text)}</p>
      ${last ? `<span class="mt-1 px-1 text-[11px] text-muted">${m.time}${mine ? ' · Seen' : ''}</span>` : ''}
    </div>
  </li>`;
}

const text = $('#text');
const send = $('#send');
const now = () =>
  new Date()
    .toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })
    .replace(/\s?[AP]M/, '');
text.addEventListener('input', () => (send.disabled = !text.value.trim()));

$('#composer').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!text.value.trim()) return;
  messages.push({ from: 'me', text: text.value.trim(), time: now() });
  fresh = messages.length - 1;
  text.value = '';
  send.disabled = true;
  render();
  // the answer: dots for a moment, then the message
  setTimeout(() => {
    typing = true;
    render();
  }, 500);
  setTimeout(() => {
    typing = false;
    messages.push({ from: 'them', text: REPLIES[messages.length % REPLIES.length], time: now() });
    fresh = messages.length - 1;
    render();
  }, 2000);
});

// --- a phone: one pane at a time
const list = $('#list');
const chat = $('#chat');
function showList(show) {
  list.classList.toggle('hidden', !show);
  list.classList.toggle('flex', show);
  chat.classList.toggle('hidden', show);
  chat.classList.toggle('flex', !show);
}
$('#back').addEventListener('click', () => showList(true));
document
  .querySelectorAll('[data-open]')
  .forEach((b) => b.addEventListener('click', () => showList(false)));
matchMedia('(min-width: 768px)').addEventListener('change', () => showList(false));

render();
