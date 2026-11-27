// Topics filter the stories (the ones shown rise in again, a little apart); each story can be
// saved; the newsletter says thanks.
const $$ = (selector) => document.querySelectorAll(selector);

/** Plays an animate-(…) class again from the start. */
function replay(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth; // a reflow, so the browser sees the class come back
  el.classList.add(cls);
}

// --- topics: the picked chip is ink on surface, the others quiet
const on = ['bg-ink', 'text-surface'];
const off = ['bg-card', 'text-muted', 'ring-1', 'ring-line', 'hover:text-ink'];

function pickTopic(topic) {
  for (const chip of $$('[data-topic]')) {
    const picked = chip.dataset.topic === topic;
    chip.classList.remove(...(picked ? off : on));
    chip.classList.add(...(picked ? on : off));
    chip.setAttribute('aria-pressed', String(picked));
  }
  let n = 0;
  for (const post of $$('[data-post]')) {
    const shown = topic === 'all' || post.dataset.post === topic;
    post.classList.toggle('hidden', !shown);
    if (shown) {
      post.style.animationDelay = n++ * 60 + 'ms';
      replay(post, 'motion-safe:animate-rise');
    }
  }
}
$$('[data-topic]').forEach((chip) =>
  chip.addEventListener('click', () => pickTopic(chip.dataset.topic)),
);
pickTopic('all');

// --- save a story: the bookmark fills in the brand's color
for (const b of $$('[data-bookmark]')) {
  b.addEventListener('click', () => {
    const saved = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(saved));
    b.setAttribute('aria-label', saved ? 'Saved' : 'Save');
    b.classList.toggle('text-accent', saved);
    b.querySelector('svg').classList.toggle('fill-current', saved);
    b.querySelector('svg').classList.toggle('fill-none', !saved);
  });
}

// --- the newsletter: the form becomes a thank-you
document.querySelector('#newsletter').addEventListener('submit', (e) => {
  e.preventDefault();
  e.target.outerHTML =
    '<p class="flex items-center gap-2 text-sm font-semibold motion-safe:animate-rise"><span class="grid size-6 place-items-center rounded-full bg-brand text-white">✓</span> You’re in. See you on Friday.</p>';
});
