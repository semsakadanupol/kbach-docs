// The sidebar drawer (below lg) and the chart, made from the numbers below.
const $ = (selector) => document.querySelector(selector);

// --- the drawer: shown with its slide-in, a blurred backdrop behind; Esc or the backdrop closes it
const sidebar = $('#sidebar');
const backdrop = $('#backdrop');
function setDrawer(open) {
  sidebar.classList.toggle('hidden', !open);
  sidebar.classList.toggle('flex', open);
  backdrop.classList.toggle('hidden', !open);
}
$('#open-sidebar').addEventListener('click', () => setDrawer(true));
backdrop.addEventListener('click', () => setDrawer(false));
document.addEventListener('keydown', (e) => e.key === 'Escape' && setDrawer(false));
matchMedia('(min-width: 1024px)').addEventListener('change', () => setDrawer(false));

// --- the chart: a bar a month, as tall as its share of the year's best month
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const REVENUE = {
  2025: [18, 22, 19, 27, 31, 29, 34, 30, 36, 33, 39, 44],
  2026: [26, 31, 28, 37, 42, 40, 47, 45, 51, 49, 55, 62],
};
const MAX = 64;
const chart = $('#chart');

// each month: a column with the bar at the bottom (its value shows above it on hover) and the
// name (every other one on a phone, where they'd crowd)
chart.innerHTML = MONTHS.map(
  (m, i) => `
  <div class="group flex h-full min-w-0 flex-1 flex-col items-center gap-2">
    <div class="flex w-full flex-1 items-end">
      <div data-bar class="relative w-full origin-bottom rounded-t-md bg-brand/70 transition-[height,background-color] duration-500 ease-out group-hover:bg-brand motion-safe:animate-grow" style="animation-delay: ${i * 40}ms">
        <span class="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-surface opacity-0 transition group-hover:opacity-100"></span>
      </div>
    </div>
    <span class="text-[11px] text-muted ${i % 2 ? 'max-sm:invisible' : ''}">${m}</span>
  </div>`,
).join('');

function setYear(year) {
  chart.querySelectorAll('[data-bar]').forEach((bar, i) => {
    const value = REVENUE[year][i];
    bar.style.height = (value / MAX) * 100 + '%';
    bar.firstElementChild.textContent = '$' + value + 'k';
  });
  for (const b of document.querySelectorAll('[data-year]')) {
    const on = b.dataset.year === String(year);
    b.setAttribute('aria-pressed', String(on));
    b.classList.toggle('bg-card', on);
    b.classList.toggle('shadow-sm', on);
    b.classList.toggle('text-muted', !on);
  }
}
document
  .querySelectorAll('[data-year]')
  .forEach((b) => b.addEventListener('click', () => setYear(b.dataset.year)));
setYear(2026);
