// Colors come from the Kbach logo: the gold of the letter and the
// blue-gray slate behind it.
/** @type {import('@kbach/react').KbachConfig} */
module.exports = {
  darkMode: 'class',
  extend: {
    fontFamily: {
      // Khmer (the /km pages; Geist and Fraunces have no Khmer letters): Kantumruy Pro for
      // text, Noto Serif Khmer for headings (a serif beside Fraunces). src/khmer.css
      sans: '"Geist", "Kantumruy Pro", ui-sans-serif, system-ui, sans-serif',
      display: '"Fraunces", "Noto Serif Khmer", "Kantumruy Pro", ui-serif, Georgia, serif',
      mono: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    },
    colors: {
      // Always the same, whatever the mode.
      gold: '#c7a25d',
      bronze: '#8d6938',
      ember: '#e2c27f',
      logo: '#2e393f',
      scrim: '#0d1113', // behind dialogs

      // Page surfaces
      page: { light: '#faf7f0', dark: '#1a2125' },
      panel: { light: '#f4efe4', dark: '#1e272c' },
      card: { light: '#ffffff', dark: '#243036' },
      raised: { light: '#ede6d6', dark: '#2b383f' },
      line: { light: '#e4dccb', dark: '#33424a' },

      // Text
      ink: { light: '#1f272b', dark: '#ece6d8' },
      muted: { light: '#5b676d', dark: '#9aa8ae' },
      faint: { light: '#727c82', dark: '#6f7f86' },

      // Gold accent: deeper on light pages so text stays readable.
      accent: { light: '#87642f', dark: '#d6b46f' },
      'accent-ink': { light: '#ffffff', dark: '#1a1b1b' },

      // The playground's editor stays dark slate in both modes, like the logo.
      code: { light: '#222b30', dark: '#151b1e' },
      'code-line': { light: '#33414a', dark: '#2a363c' },
      'code-ink': { light: '#e3ded1', dark: '#e3ded1' },

      // Code blocks in the docs follow the page: warm paper in light mode,
      // the dark slate in dark mode.
      snippet: { light: '#fdfbf6', dark: '#151b1e' },
      'snippet-bar': { light: '#f4efe4', dark: '#1b2226' },
      'snippet-ink': { light: '#26303a', dark: '#e3ded1' },
      'snippet-muted': { light: '#76828a', dark: '#7f9198' },
    },
  },
};
