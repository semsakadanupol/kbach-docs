// The mode, with the dark mode store of Kbach's CDN script: Kbach.setMode() puts the dark class
// on <html> (darkMode: 'class' in kbach.config.js), and Auto follows the
// system. It saves the choice in localStorage, under kbach-theme.
// The values: the colors kbach.config.js sets (as window.kbachConfig), as it writes them.

const pill = document.querySelector('#pill');
const PLACE = { light: '', dark: 'translate-x-full', system: 'translate-x-[200%]' };
const savedMode = () => {
  try {
    return localStorage.getItem('kbach-theme') || 'system';
  } catch {
    return 'system';
  }
};

// the switch shows the saved mode, whoever changed it (this page, or the moon above the preview)
function show() {
  const mode = savedMode();
  pill.classList.remove('translate-x-full', 'translate-x-[200%]');
  if (PLACE[mode]) pill.classList.add(PLACE[mode]);
  for (const b of document.querySelectorAll('[data-mode]')) {
    b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
    b.classList.toggle('text-muted', b.dataset.mode !== mode);
  }
}
document.querySelectorAll('[data-mode]').forEach((b) =>
  b.addEventListener('click', () => {
    Kbach.setMode(b.dataset.mode);
    show();
  }),
);
// a change from elsewhere (the moon button) shows as the dark class coming or going
new MutationObserver(show).observe(document.documentElement, { attributeFilter: ['class'] });
show();

// --- each color's two values, as the config writes them (a color for both modes is one value),
// with a swatch that is a Kbach class made from it: bg-rose-6, or bg-[#ffffff] for a CSS color
const { colors } = window.kbachConfig.extend;
const swatch = (value) => 'bg-' + (/^[a-z]+-\d+$/.test(value) ? value : '[' + value + ']');
for (const cell of document.querySelectorAll('[data-values]')) {
  const value = colors[cell.dataset.values];
  const pair = typeof value === 'string' ? { light: value, dark: value } : value;
  cell.innerHTML = Object.entries(pair)
    .map(
      ([mode, color]) =>
        `<span class="flex items-center justify-end gap-1.5">${mode} <code>${color}</code><i class="size-2.5 rounded-full ring-1 ring-ink/10 ${swatch(color)}"></i></span>`,
    )
    .join('');
}

// --- play and pause: the record stops where it is (animation-play-state), the icon swaps in
const play = document.querySelector('#play');
const record = document.querySelector('#record');
const PAUSE = 'M6 5h4v14H6zM14 5h4v14h-4z';
const PLAY = 'M8 5v14l11-7z';
play.addEventListener('click', () => {
  const playing = play.getAttribute('aria-label') === 'Pause';
  record.classList.toggle('[animation-play-state:paused]', playing);
  play.setAttribute('aria-label', playing ? 'Play' : 'Pause');
  const icon = document.querySelector('#play-icon');
  icon.innerHTML = `<path d="${playing ? PLAY : PAUSE}" />`;
  icon.classList.remove('motion-safe:animate-swap');
  void icon.getBoundingClientRect();
  icon.classList.add('motion-safe:animate-swap');
});
