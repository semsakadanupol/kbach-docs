import { classSortKey } from './engine';
import type { EditorMode } from '../components/KbachEditor';

// Format document (Shift+Alt+F): Prettier for the layout, and a fixed order
// for every class="…" list: plain classes before variants, and within each,
// by the CSS property (layout, box, borders and backgrounds, text, effects;
// see classOrder.ts). Unknown classes go first, as the Tailwind CSS class
// sorter does. Prettier is big, so it loads the first time someone formats.

/** Sorts the classes in every class="…" attribute; leaves a list with a template (`${…}`, `{{…}}`) alone. */
export function sortClasses(html: string): string {
  return html.replace(/(\bclass\s*=\s*)(["'])([^"']*)\2/g, (whole, head: string, q: string, value: string) => {
    if (/[{}$]/.test(value)) return whole;
    const list = value.split(/\s+/).filter(Boolean);
    const sorted = list
      .map((cls, i) => ({ cls, i, key: classSortKey(cls) }))
      .sort((a, b) => a.key[0] - b.key[0] || a.key[1] - b.key[1] || a.i - b.i)
      .map((x) => x.cls);
    return head + q + sorted.join(' ') + q;
  });
}

export interface Formatted {
  code: string;
  sorted: boolean;
}

export async function formatCode(code: string, mode: EditorMode): Promise<Formatted> {
  const [{ format }, ...plugins] = await Promise.all(
    mode === 'html'
      ? [import('prettier/standalone'), import('prettier/plugins/html')]
      : mode === 'ts' || mode === 'tsx'
        ? [import('prettier/standalone'), import('prettier/plugins/typescript'), import('prettier/plugins/estree')]
        : [import('prettier/standalone'), import('prettier/plugins/babel'), import('prettier/plugins/estree')],
  );
  const source = mode === 'html' ? sortClasses(code) : code;
  const out = await format(source, {
    parser: mode === 'html' ? 'html' : mode === 'ts' || mode === 'tsx' ? 'typescript' : 'babel',
    plugins: plugins.map((p) => (('default' in p ? p.default : p) as object)),
    printWidth: 100,
    tabWidth: 2,
    singleQuote: true,
    // <script> and <style> inside the HTML stay as written: their plugins aren't loaded here
    embeddedLanguageFormatting: 'off',
  });
  return { code: out, sorted: mode === 'html' && source !== code };
}
