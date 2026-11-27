/** @type {import('@kbach/react').KbachConfig} */
module.exports = {
  // 'class' (the preview's moon button), 'attribute' or 'media'
  darkMode: 'class',
  extend: {
    colors: {
      // the brand: bg-brand, text-brand, ring-brand/30, shadow-brand/20, …
      brand: 'emerald-6',
      // colors that follow light and dark mode, so the page needs no dark: classes for them
      surface: { light: 'zinc-1', dark: 'zinc-11' },
      card: { light: '#ffffff', dark: 'zinc-10' },
      well: { light: 'zinc-2', dark: 'zinc-9' },
      line: { light: 'zinc-3', dark: 'zinc-9' },
      ink: { light: 'zinc-11', dark: 'zinc-1' },
      muted: { light: 'zinc-7', dark: 'zinc-5' },
      // the brand as text: dark enough on white, light enough on near-black
      accent: { light: 'emerald-8', dark: 'emerald-4' },
    },
    // each name in animation is a class (animate-pop, …) that brings its @keyframes along;
    // write it as motion-safe:animate-pop to keep it still for readers who ask for less motion
    keyframes: {
      shake: {
        '20%, 60%': { transform: 'translateX(-6px)' },
        '40%, 80%': { transform: 'translateX(6px)' },
      },
      rise: { from: { opacity: 0, transform: 'translateY(8px)' } },
      pop: {
        '0%': { transform: 'scale(1)' },
        '40%': { transform: 'scale(1.25)' },
        '100%': { transform: 'scale(1)' },
      },
    },
    animation: {
      shake: 'shake 400ms ease-in-out',
      rise: 'rise 400ms cubic-bezier(0.22, 1, 0.36, 1) backwards',
      pop: 'pop 400ms ease-out',
    },
  },
};
