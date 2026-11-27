import type { Page } from '../markdown/parse';

// What the docs are made of: every page is a Markdown file in content/. The sidebar order
// is set here. Reading the files is content.ts's job (at build time); this
// file is safe to use anywhere.

export interface DocPage extends Page {
  slug: string;
  title: string;
  description: string;
  /** its section's title (NAV) */
  section: string;
  /** when its file last changed (an ISO date), if known */
  updated?: string;
}

/** A page as the sidebar, the pager and the home page list it. */
export interface PageInfo {
  slug: string;
  title: string;
  /** the shorter name the sidebar uses, else the title */
  nav: string;
  section: string;
}

export const NAV: { title: string; pages: string[] }[] = [
  { title: 'Getting started', pages: ['introduction', 'installation', 'quick-start', 'editor-setup'] },
  { title: 'Core concepts', pages: ['how-it-works', 'utility-classes', 'variants', 'colors', 'dark-mode', 'dynamic-classes'] },
  { title: 'Platforms', pages: ['web', 'react-native', 'plain-html'] },
  {
    title: 'Utilities',
    pages: [
      'layout', 'flexbox-grid', 'spacing', 'sizing', 'typography', 'backgrounds', 'borders', 'effects',
      'filters', 'tables', 'transitions-animation', 'transforms', 'interactivity', 'svg', 'accessibility',
    ],
  },
  { title: 'Customization', pages: ['configuration', 'theme-colors', 'spacing-screens-fonts'] },
  { title: 'API reference', pages: ['react-api', 'plugin-options', 'react-native-api', 'browser-api', 'cli'] },
  { title: 'Help', pages: ['common-mistakes', 'ai-assistants', 'coming-from-tailwind', 'troubleshooting', 'faq'] },
];
// content/playground.md is its own page (/playground), outside the docs: no sidebar, not in this list.

/** Pages that moved: the old URL keeps working and sends the reader to the new place. */
export const REDIRECTS: Record<string, string> = {
  cdn: 'plain-html',
  'tailwind-differences': 'coming-from-tailwind',
};

/** The first page of the docs (the header's Docs link). */
export const HOME = 'introduction';

/** Every page has its own path (/<slug>); / is the home page (components/Landing.tsx). */
export function hrefFor(slug: string): string {
  return '/' + slug;
}

// Version shown in the header, read from the @kbach/react package in this repo.
export { version as KBACH_VERSION } from '@kbach/react/package.json';
