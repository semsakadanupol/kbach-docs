import type { ScriptLang } from './script';
import type { PlaygroundFiles } from './share';
import { DEFAULT_CONFIG } from './config';
import { configAsScript, withCdnSetup, withScriptTag } from './cdn';
import { reactIndexFor } from './react';

// The playground's examples, one folder each in content/playground/ (outside the scanned
// folders: their classes come from the engine at runtime, not from the site's own kbach.css).
// Every example is the same page twice (since 2026-11-26), and the header's HTML / React
// switch flips between them:
//
//   index.html             the HTML version, a whole document. Its <title> names the example
//                          ("Navbar: links fold into a menu below md" is the name and its hint).
//   script.js / script.ts  the HTML version's script (optional)
//   App.jsx / App.tsx      the React version. Its index.html is made from the HTML one's
//                          <html>, <title> and <body> tags (reactIndexFor), so the two match.
//   kbach.config.js        both versions' config (optional)
//
// They're Kbach only: every class goes through the engine with the example's config
// (tests/e2e/playground-examples-menu.mjs), so none is "unknown", in either version.
//
// Picked from the examples gallery (components/ExamplesGallery.tsx); the first one's HTML
// version is where every visit starts.
import landingHtml from '../../content/playground/1-landing/index.html?raw';
import landingScript from '../../content/playground/1-landing/script.js?raw';
import landingApp from '../../content/playground/1-landing/App.jsx?raw';
import landingConfig from '../../content/playground/1-landing/kbach.config.js?raw';
import productHtml from '../../content/playground/2-product/index.html?raw';
import productScript from '../../content/playground/2-product/script.js?raw';
import productApp from '../../content/playground/2-product/App.jsx?raw';
import productConfig from '../../content/playground/2-product/kbach.config.js?raw';
import navbarHtml from '../../content/playground/3-navbar/index.html?raw';
import navbarScript from '../../content/playground/3-navbar/script.js?raw';
import navbarApp from '../../content/playground/3-navbar/App.jsx?raw';
import navbarConfig from '../../content/playground/3-navbar/kbach.config.js?raw';
import pricingHtml from '../../content/playground/4-pricing/index.html?raw';
import pricingScript from '../../content/playground/4-pricing/script.js?raw';
import pricingApp from '../../content/playground/4-pricing/App.jsx?raw';
import pricingConfig from '../../content/playground/4-pricing/kbach.config.js?raw';
import signupHtml from '../../content/playground/5-signup/index.html?raw';
import signupScript from '../../content/playground/5-signup/script.ts?raw';
import signupApp from '../../content/playground/5-signup/App.tsx?raw';
import signupConfig from '../../content/playground/5-signup/kbach.config.js?raw';
import dashboardHtml from '../../content/playground/6-dashboard/index.html?raw';
import dashboardScript from '../../content/playground/6-dashboard/script.js?raw';
import dashboardApp from '../../content/playground/6-dashboard/App.jsx?raw';
import dashboardConfig from '../../content/playground/6-dashboard/kbach.config.js?raw';
import blogHtml from '../../content/playground/7-blog/index.html?raw';
import blogScript from '../../content/playground/7-blog/script.js?raw';
import blogApp from '../../content/playground/7-blog/App.jsx?raw';
import blogConfig from '../../content/playground/7-blog/kbach.config.js?raw';
import todoHtml from '../../content/playground/8-todo/index.html?raw';
import todoScript from '../../content/playground/8-todo/script.js?raw';
import todoApp from '../../content/playground/8-todo/App.jsx?raw';
import todoConfig from '../../content/playground/8-todo/kbach.config.js?raw';
import tabsHtml from '../../content/playground/9-tabs/index.html?raw';
import tabsScript from '../../content/playground/9-tabs/script.js?raw';
import tabsApp from '../../content/playground/9-tabs/App.jsx?raw';
import tabsConfig from '../../content/playground/9-tabs/kbach.config.js?raw';
import chatHtml from '../../content/playground/10-chat/index.html?raw';
import chatScript from '../../content/playground/10-chat/script.js?raw';
import chatApp from '../../content/playground/10-chat/App.jsx?raw';
import chatConfig from '../../content/playground/10-chat/kbach.config.js?raw';
import themeHtml from '../../content/playground/11-theme/index.html?raw';
import themeScript from '../../content/playground/11-theme/script.js?raw';
import themeApp from '../../content/playground/11-theme/App.jsx?raw';
import themeConfig from '../../content/playground/11-theme/kbach.config.js?raw';
import animationsHtml from '../../content/playground/12-animations/index.html?raw';
import animationsScript from '../../content/playground/12-animations/script.js?raw';
import animationsApp from '../../content/playground/12-animations/App.jsx?raw';
import animationsConfig from '../../content/playground/12-animations/kbach.config.js?raw';
import colorsHtml from '../../content/playground/13-colors/index.html?raw';
import colorsScript from '../../content/playground/13-colors/script.js?raw';
import colorsApp from '../../content/playground/13-colors/App.jsx?raw';
import colorsConfig from '../../content/playground/13-colors/kbach.config.js?raw';

/** What an example shows off, for the gallery's tags. */
export type ExampleTag = 'responsive' | 'dark' | 'animation' | 'states' | 'forms' | 'config' | 'typescript';

interface Source {
  id: string;
  tags: ExampleTag[];
  html: string;
  script?: string;
  /** the HTML version's script and the React version's App are TypeScript (script.ts, App.tsx) */
  ts?: boolean;
  app: string;
  config?: string;
}

const SOURCES: Source[] = [
  { id: '1-landing', html: landingHtml, script: landingScript, app: landingApp, config: landingConfig, tags: ['responsive', 'animation', 'dark', 'config'] },
  { id: '2-product', html: productHtml, script: productScript, app: productApp, config: productConfig, tags: ['responsive', 'states', 'dark'] },
  { id: '3-navbar', html: navbarHtml, script: navbarScript, app: navbarApp, config: navbarConfig, tags: ['responsive', 'animation', 'states'] },
  { id: '4-pricing', html: pricingHtml, script: pricingScript, app: pricingApp, config: pricingConfig, tags: ['responsive', 'states', 'dark'] },
  { id: '5-signup', html: signupHtml, script: signupScript, ts: true, app: signupApp, config: signupConfig, tags: ['forms', 'states', 'typescript'] },
  { id: '6-dashboard', html: dashboardHtml, script: dashboardScript, app: dashboardApp, config: dashboardConfig, tags: ['responsive', 'dark', 'states'] },
  { id: '7-blog', html: blogHtml, script: blogScript, app: blogApp, config: blogConfig, tags: ['responsive', 'states'] },
  { id: '8-todo', html: todoHtml, script: todoScript, app: todoApp, config: todoConfig, tags: ['forms', 'states', 'animation'] },
  { id: '9-tabs', html: tabsHtml, script: tabsScript, app: tabsApp, config: tabsConfig, tags: ['animation', 'states'] },
  { id: '10-chat', html: chatHtml, script: chatScript, app: chatApp, config: chatConfig, tags: ['responsive', 'animation', 'forms'] },
  { id: '11-theme', html: themeHtml, script: themeScript, app: themeApp, config: themeConfig, tags: ['dark', 'config', 'states'] },
  { id: '12-animations', html: animationsHtml, script: animationsScript, app: animationsApp, config: animationsConfig, tags: ['animation', 'config'] },
  { id: '13-colors', html: colorsHtml, script: colorsScript, app: colorsApp, config: colorsConfig, tags: ['states', 'responsive'] },
];

export interface Example {
  id: string;
  name: string;
  hint: string;
  tags: ExampleTag[];
  /** the HTML version: index.html and its script */
  html: PlaygroundFiles;
  /** the React version: App.jsx (index.html from the HTML version's tags) */
  react: PlaygroundFiles;
}

const lf = (s: string) => s.replace(/\r\n/g, '\n');
const DOC_TITLE = /<title>\s*(.*?)\s*<\/title>/i;

export const EXAMPLES: Example[] = SOURCES.map(({ id, html, script = '', ts = false, app, config, tags }) => {
  const title = DOC_TITLE.exec(html)?.[1] ?? id;
  // "Navbar: links fold into a menu below md" / "Pricing (try the widths)" → a name and a hint
  const parts = /^(.*?)(?::\s*(.*)|\s*\((.*)\))?$/.exec(title)!;
  const hint = parts[2] ?? parts[3] ?? '';
  const lang: ScriptLang = ts ? 'ts' : 'js';
  const cfg = lf(config || DEFAULT_CONFIG);
  return {
    id,
    name: parts[1],
    hint: hint ? hint[0].toUpperCase() + hint.slice(1) : '',
    tags,
    // the HTML version is a plain page: it loads the folder's config as a script (window.kbachConfig),
    // then Kbach's CDN script, and its own script, when it has one, before </body> (cdn.ts)
    html: { html: script.trim() ? withScriptTag(withCdnSetup(lf(html)), lang) : withCdnSetup(lf(html)), script: lf(script), lang, config: configAsScript(cfg), mode: 'html' },
    react: { html: reactIndexFor(lf(html)), script: lf(app), lang, config: cfg, mode: 'react' },
  };
});

const same = (a: PlaygroundFiles, b: PlaygroundFiles) => a.html === b.html && a.script === b.script && a.lang === b.lang && a.config === b.config && a.mode === b.mode;

/** The example these files are, untouched (in either version), if they are one. */
export function exampleOf(files: PlaygroundFiles): Example | null {
  return EXAMPLES.find((e) => same(e[files.mode], files)) ?? null;
}

/** Whether these files are the example's version of their kind, untouched. */
export function isExampleAsIs(example: Example, files: PlaygroundFiles): boolean {
  return same(example[files.mode], files);
}

export function exampleById(id: string | null): Example | null {
  return (id && EXAMPLES.find((e) => e.id === id)) || null;
}
