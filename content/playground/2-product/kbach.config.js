/** @type {import('@kbach/react').KbachConfig} */
module.exports = {
  // 'class' (the preview's moon button), 'attribute' or 'media'
  darkMode: 'class',
  extend: {
    colors: {
      // the brand: bg-brand, text-brand, ring-brand/30, shadow-brand/20, …
      brand: 'indigo-6',
      // colors that follow light and dark mode, so the page needs no dark: classes for them
      surface: { light: 'zinc-1', dark: 'zinc-11' },
      card: { light: '#ffffff', dark: 'zinc-10' },
      well: { light: 'zinc-2', dark: 'zinc-9' },
      line: { light: 'zinc-3', dark: 'zinc-9' },
      ink: { light: 'zinc-11', dark: 'zinc-1' },
      muted: { light: 'zinc-7', dark: 'zinc-5' },
      // the brand as text: dark enough on white, light enough on near-black
      accent: { light: 'indigo-8', dark: 'indigo-4' },
    },
    // each name in animation is a class (animate-pop, …) that brings its @keyframes along;
    // write it as motion-safe:animate-pop to keep it still for readers who ask for less motion
    keyframes: {
      pop: {
        '0%': { transform: 'scale(1)' },
        '40%': { transform: 'scale(1.25)' },
        '100%': { transform: 'scale(1)' },
      },
      rise: { from: { opacity: 0, transform: 'translateY(8px)' } },
      float: { to: { transform: 'translateY(-10px)' } },
    },
    animation: {
      pop: 'pop 350ms ease-out',
      rise: 'rise 300ms ease-out backwards',
      float: 'float 3s ease-in-out infinite alternate',
    },
  },
};
