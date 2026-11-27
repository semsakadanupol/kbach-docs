// Tabs: a click or ← → picks one; the line moves under it and its panel fades in.
// The accordion: a question opens its answer and closes the one that was open.
const tabs = [...document.querySelectorAll('[role="tab"]')];
const line = document.querySelector('#line');

/** Plays an animate-(…) class again from the start. */
function replay(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth; // a reflow, so the browser sees the class come back
  el.classList.add(cls);
}

/** The line: as wide as the tab, where the tab is. */
function moveLine(tab) {
  line.style.width = tab.offsetWidth + 'px';
  line.style.transform = `translateX(${tab.offsetLeft - tab.parentElement.scrollLeft}px)`;
}

function pick(tab, focus) {
  for (const t of tabs) {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls'));
    panel.hidden = !on;
    if (on) replay(panel, 'motion-safe:animate-swap');
  }
  moveLine(tab);
  if (focus) tab.focus();
}

tabs.forEach((t) => t.addEventListener('click', () => pick(t)));
document.querySelector('#tabs').addEventListener('keydown', (e) => {
  const i = tabs.indexOf(document.activeElement);
  const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
  if (i < 0 || !step) return;
  e.preventDefault();
  pick(tabs[(i + step + tabs.length) % tabs.length], true);
});
// the line follows the picked tab when the list scrolls, the page resizes, and once the fonts
// are in (the tabs have their real widths then)
const picked = () => tabs.find((t) => t.getAttribute('aria-selected') === 'true');
document.querySelector('#tabs').addEventListener('scroll', () => moveLine(picked()));
addEventListener('resize', () => moveLine(picked()));
document.fonts.ready.then(() => moveLine(picked()));
moveLine(picked());

// --- the accordion
const questions = [...document.querySelectorAll('#faq button')];
function setOpen(button, open) {
  button.setAttribute('aria-expanded', String(open));
  const answer = button.nextElementSibling;
  answer.classList.toggle('grid-rows-[0fr]', !open);
  answer.classList.toggle('grid-rows-[1fr]', open);
}
for (const q of questions) {
  q.addEventListener('click', () => {
    const open = q.getAttribute('aria-expanded') !== 'true';
    questions.forEach((other) => setOpen(other, other === q && open));
  });
}
setOpen(questions[0], true);
