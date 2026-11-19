import { BoltIcon, CodeIcon, LayersIcon, PaletteIcon, PlayIcon } from '../icons';

/** The three parts of the site. The header, the phone menu and the shell change with it. */
export type Place = 'home' | 'docs' | 'playground';

/** Which part a path (without its /km) is in. */
export function placeOf(path: string): Place {
  const slug = path.replace(/^\/+|\/+$/g, '');
  return slug === '' ? 'home' : slug === 'playground' ? 'playground' : 'docs';
}

/** Where each part of the site starts. */
export const PLACES: { id: Exclude<Place, 'home'>; label: string; href: string }[] = [
  { id: 'docs', label: 'Docs', href: '/introduction' },
  { id: 'playground', label: 'Playground', href: '/playground' },
];

/** The home page's links: the main parts of the docs, then the playground. */
export const HOME_LINKS = [
  { label: 'Docs', href: '/introduction', icon: BoltIcon, note: 'Start here: what Kbach is, and how to install it' },
  { label: 'Utilities', href: '/layout', icon: LayersIcon, note: 'Every class, with its CSS and a live preview' },
  { label: 'Customization', href: '/configuration', icon: PaletteIcon, note: 'Your colors, spacing and fonts in kbach.config.js', wide: true },
  { label: 'API', href: '/react-api', icon: CodeIcon, note: 'React, React Native, the plugins, the CDN script, the CLI', wide: true },
  { label: 'Playground', href: '/playground', icon: PlayIcon, note: 'Try classes in your browser, nothing to install' },
];
