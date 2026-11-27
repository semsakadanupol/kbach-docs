/** @type {import('@kbach/react').KbachConfig} */
module.exports = {
  // 'class': dark mode is the dark class on <html> (the page's switch, or the moon button above
  // the preview). 'media' would follow the system only; 'attribute' a data-theme="dark".
  darkMode: 'class',
  extend: {
    colors: {
      // each of these is a class family: bg-brand, text-ink, border-line, ring-brand/30, …
      // { light, dark } colors follow the mode by themselves: the page has no dark: classes
      // for them. A value is a color of the palette (rose-6) or any CSS color (#ffffff).
      brand: { light: 'rose-6', dark: 'rose-5' },
      surface: { light: 'stone-1', dark: 'stone-11' },
      card: { light: '#ffffff', dark: 'stone-10' },
      well: { light: 'stone-2', dark: 'stone-9' },
      line: { light: 'stone-3', dark: 'stone-9' },
      ink: { light: 'stone-11', dark: 'stone-1' },
      muted: { light: 'stone-7', dark: 'stone-5' },
      accent: { light: 'rose-8', dark: 'rose-4' },
      success: { light: 'emerald-7', dark: 'emerald-4' },
    },
    keyframes: {
      swap: { from: { opacity: 0, transform: 'scale(0.6) rotate(-30deg)' } },
      turn: { to: { transform: 'rotate(360deg)' } },
    },
    animation: {
      swap: 'swap 300ms cubic-bezier(0.22, 1, 0.36, 1)',
      // the record turns while it plays
      record: 'turn 6s linear infinite',
    },
  },
};
