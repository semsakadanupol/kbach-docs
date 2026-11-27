// Monthly or yearly: the pill slides (translate-x-full), the prices change and drop in.
const buttons = document.querySelectorAll('[data-billing]');
const pill = document.querySelector('#pill');

/** Plays an animate-(…) class again from the start. */
function replay(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth; // a reflow, so the browser sees the class come back
  el.classList.add(cls);
}

function setBilling(billing, animate) {
  const yearly = billing === 'yearly';
  pill.classList.toggle('translate-x-full', yearly);
  for (const b of buttons) {
    const on = b.dataset.billing === billing;
    b.setAttribute('aria-pressed', String(on));
    b.classList.toggle('text-muted', !on);
  }
  for (const price of document.querySelectorAll('[data-monthly]')) {
    price.textContent = '$' + price.dataset[billing];
    if (animate) replay(price, 'motion-safe:animate-swap');
  }
  for (const note of document.querySelectorAll('[data-note]')) {
    note.textContent = yearly ? note.dataset.note : '';
  }
}

for (const b of buttons) b.addEventListener('click', () => setBilling(b.dataset.billing, true));
setBilling('monthly', false);
