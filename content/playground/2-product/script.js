// Each control swaps a few classes; kbach.css gets the CSS for a class the moment it's used.
const $ = (selector) => document.querySelector(selector);

/** Plays an animate-(…) class again from the start. */
function replay(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth; // a reflow, so the browser sees the class come back
  el.classList.add(cls);
}

// --- favorite: the heart fills, and pops
const favorite = $('#favorite');
favorite.addEventListener('click', () => {
  const on = favorite.getAttribute('aria-pressed') !== 'true';
  favorite.setAttribute('aria-pressed', String(on));
  favorite.classList.toggle('text-rose-6', on);
  favorite.classList.toggle('text-zinc-7', !on);
  favorite.querySelector('svg').classList.toggle('fill-current', on);
  favorite.querySelector('svg').classList.toggle('fill-none', !on);
  replay(favorite.querySelector('svg'), 'motion-safe:animate-pop');
});

// --- read more: line-clamp-3 off and on
const about = $('#about');
const more = $('#more');
more.addEventListener('click', () => {
  const open = about.classList.toggle('line-clamp-3') === false;
  more.textContent = open ? 'Show less' : 'Read more';
});

// --- color: the picked swatch gets a ring, the picture cross-fades to its gradient
function pickColor(button) {
  for (const b of document.querySelectorAll('[data-color]')) {
    const on = b === button;
    b.classList.toggle('ring-ink', on);
    b.classList.toggle('ring-transparent', !on);
    b.setAttribute('aria-pressed', String(on));
  }
  for (const photo of document.querySelectorAll('[data-photo]')) {
    photo.classList.toggle('opacity-0', photo.dataset.photo !== button.dataset.color);
  }
  $('#color-name').textContent = button.dataset.name;
}
$('#colors').addEventListener('click', (e) => {
  const b = e.target.closest('[data-color]');
  if (b) pickColor(b);
});
pickColor($('[data-color]'));

// --- how many: 1 to 9, and the price follows
let count = 1;
function setCount(n) {
  count = Math.min(9, Math.max(1, n));
  $('#count').textContent = count;
  $('#price').textContent = '$' + 249 * count;
  $('#was').textContent = '$' + 299 * count;
  $('#less').disabled = count === 1;
  replay($('#count'), 'motion-safe:animate-pop');
}
$('#less').addEventListener('click', () => setCount(count - 1));
$('#more-items').addEventListener('click', () => setCount(count + 1));
setCount(1);

// --- add to bag: a moment of "Adding…", then green with a check
const add = $('#add');
const addLabel = $('#add-label');
const idle = ['bg-brand', 'hover:bg-brand/90', 'shadow-brand/25'];
const done = ['bg-emerald-6', 'hover:bg-emerald-6', 'shadow-emerald-6/25'];
add.addEventListener('click', () => {
  if (add.disabled) return;
  add.disabled = true;
  addLabel.textContent = 'Adding…';
  setTimeout(() => {
    add.classList.remove(...idle);
    add.classList.add(...done);
    addLabel.textContent = count === 1 ? 'Added to bag' : count + ' added to bag';
    replay(addLabel, 'motion-safe:animate-rise');
    setTimeout(() => {
      add.classList.remove(...done);
      add.classList.add(...idle);
      addLabel.textContent = 'Add to bag';
      add.disabled = false;
    }, 1600);
  }, 600);
});
