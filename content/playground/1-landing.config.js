/** @type {import('@kbach/react').KbachConfig} */
module.exports = {
  // 'class' (the preview's moon button), 'attribute' or 'media'
  darkMode: 'class',
  extend: {
    colors: {
      // the brand: bg-brand, text-brand, border-brand/30, shadow-brand/30, …
      brand: 'amber-6',
      // colors that follow the page's mode: bg-surface is white in light mode and
      // gray-11 in dark, with no dark: class on the page
      surface: { light: '#ffffff', dark: 'gray-11' },
      card: { light: '#ffffff', dark: 'gray-10' },
      well: { light: 'gray-2', dark: 'gray-9' },
      ink: { light: 'gray-12', dark: '#ffffff' },
      muted: { light: 'gray-8', dark: 'gray-4' },
      line: { light: 'gray-3', dark: 'gray-8' },
      accent: { light: 'amber-10', dark: 'amber-4' },
      // the code block, and its tag, attribute and value colors
      code: { light: 'gray-1', dark: 'gray-12' },
      'code-tag': { light: 'sky-8', dark: 'sky-4' },
      'code-attr': { light: 'amber-9', dark: 'amber-4' },
      'code-value': { light: 'emerald-8', dark: 'emerald-4' },
    },
  },
};
