import type { ScriptLang } from './script';
import { DEFAULT_CONFIG } from './config';

// The playground's example, in content/playground/ (outside the scanned
// folders: its classes come from the engine at runtime, not from the site's
// own kbach.css): an .html file, a whole document titled by its <title> (or
// a body's markup whose first line is an HTML comment with the title), its
// script (.js or .ts) and its own kbach.config.js.
//
// The playground offers one example, the landing page, on purpose: no menu
// to pick another.
import landingHtml from '../../content/playground/1-landing.html?raw';
import landingScript from '../../content/playground/1-landing.js?raw';
import landingConfig from '../../content/playground/1-landing.config.js?raw';

const SOURCES: { id: string; html: string; script: string; lang: ScriptLang; config: string }[] = [
  { id: '1-landing', html: landingHtml, script: landingScript, lang: 'js', config: landingConfig },
];

export interface Example {
  id: string;
  name: string;
  hint: string;
  html: string;
  script: string;
  lang: ScriptLang;
  /** its kbach.config.js */
  config: string;
}

const lf = (s: string) => s.replace(/\r\n/g, '\n');

export const EXAMPLES: Example[] = SOURCES.map(({ id, html: source, script, lang, config }) => {
  const m = /^<!--\s*(.*?)\s*-->\s*\r?\n?/.exec(source);
  // the title: a first-line comment (a body's markup), else a whole document's <title>
  const title = m ? m[1] : (/<title>\s*(.*?)\s*<\/title>/i.exec(source)?.[1] ?? id);
  // "Navbar: links from md up" / "Pricing (try the widths)" → a name and a hint
  const parts = /^(.*?)(?::\s*(.*)|\s*\((.*)\))?$/.exec(title)!;
  const hint = parts[2] ?? parts[3] ?? '';
  return {
    id,
    name: parts[1],
    hint: hint ? hint[0].toUpperCase() + hint.slice(1) : '',
    html: lf(m ? source.slice(m[0].length) : source),
    script: lf(script),
    lang,
    config: lf(config || DEFAULT_CONFIG),
  };
});
