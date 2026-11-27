/** @type {import('@kbach/react').KbachConfig} */
module.exports = {
  // 'class' (the preview's moon button), 'attribute' or 'media'
  darkMode: 'class',
  extend: {
    colors: {
      // the brand: bg-brand, text-brand, ring-brand/30, shadow-brand/20, …
      brand: 'fuchsia-6',
      // colors that follow light and dark mode, so the page needs no dark: classes for them
      surface: { light: 'zinc-1', dark: 'zinc-11' },
      card: { light: '#ffffff', dark: 'zinc-10' },
      well: { light: 'zinc-2', dark: 'zinc-9' },
      line: { light: 'zinc-3', dark: 'zinc-9' },
      ink: { light: 'zinc-11', dark: 'zinc-1' },
      muted: { light: 'zinc-7', dark: 'zinc-5' },
      // the brand as text: dark enough on white, light enough on near-black
      accent: { light: 'fuchsia-8', dark: 'fuchsia-4' },
    },
    // each name in animation is a class (animate-pop, …) that brings its @keyframes along;
    // write it as motion-safe:animate-pop to keep it still for readers who ask for less motion
    keyframes: {
      rise: { from: { opacity: 0, transform: 'translateY(16px)' } },
      wiggle: { '0%, 100%': { transform: 'rotate(-6deg)' }, '50%': { transform: 'rotate(6deg)' } },
      shimmer: { to: { transform: 'translateX(100%)' } },
      orbit: { to: { transform: 'rotate(360deg)' } },
      heartbeat: {
        '0%, 100%': { transform: 'scale(1)' },
        '15%': { transform: 'scale(1.18)' },
        '30%': { transform: 'scale(1)' },
        '45%': { transform: 'scale(1.12)' },
      },
      slide: {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(250%)' },
      },
    },
    animation: {
      rise: 'rise 600ms cubic-bezier(0.22, 1, 0.36, 1) backwards',
      wiggle: 'wiggle 1s ease-in-out infinite',
      shimmer: 'shimmer 1.6s ease-in-out infinite',
      orbit: 'orbit 3s linear infinite',
      heartbeat: 'heartbeat 1.4s ease-in-out infinite',
      slide: 'slide 1.4s ease-in-out infinite',
    },
  },
};
