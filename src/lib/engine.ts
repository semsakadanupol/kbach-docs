import { useEffect, useState } from 'react';
import { initKbach, isKbachReady, kb } from '@kbach/react';

// Most of this site is styled by the static kbach.css the Vite plugin
// writes at build time. The live previews and the playground style class
// strings that only exist at runtime (inside content/*.md, or typed by the
// reader), so they load the engine and call kb(). kb() leaves the classes
// kbach.css already defines to it, and uses the same theme (light/dark
// colors as CSS variables), so the two stylesheets never disagree.
let ready: Promise<void> | null = null;

export function loadEngine(): Promise<void> {
  ready ??= initKbach();
  return ready;
}

export function useEngine(): boolean {
  const [ok, setOk] = useState(isKbachReady());
  useEffect(() => {
    if (ok) return;
    let live = true;
    loadEngine().then(() => live && setOk(true));
    return () => {
      live = false;
    };
  }, [ok]);
  return ok;
}

/** Styles every element inside `root` (and `root` itself), before the next paint. */
export function styleTree(root: Element) {
  for (const el of [root, ...Array.from(root.querySelectorAll('[class]'))]) {
    const cls = el.getAttribute('class');
    if (!cls) continue;
    // kb() returns the class string to use; it differs only when the engine
    // expands a class (a light/dark color whose values aren't hex).
    const resolved = kb(cls);
    if (resolved !== cls) el.setAttribute('class', resolved);
  }
}

/**
 * The CSS rules on the page for a class, for showing what it compiles to:
 * from kbach.css when the site already uses the class, else from the rules
 * kb() injected. A class lives in only one of the two, so nothing repeats.
 */
export function rulesForClass(cls: string): string[] {
  const needle = '.' + CSS.escape(cls);
  // match the whole class: ".p-4" must not match ".p-40"
  const has = (sel: string) => {
    for (let i = sel.indexOf(needle); i >= 0; i = sel.indexOf(needle, i + 1)) {
      if (!/[\w\\-]/.test(sel[i + needle.length] ?? '')) return true;
    }
    return false;
  };
  const found: string[] = [];
  const visit = (rules: CSSRuleList) => {
    for (const r of Array.from(rules)) {
      if (r instanceof CSSStyleRule) {
        if (has(r.selectorText)) found.push(r.cssText);
      } else if ('cssRules' in r) {
        const inner = Array.from((r as CSSGroupingRule).cssRules).filter((x) => x instanceof CSSStyleRule && has(x.selectorText));
        if (inner.length) {
          const head = r.cssText.slice(0, r.cssText.indexOf('{')).trim();
          found.push(head + ' {\n' + inner.map((x) => '  ' + x.cssText).join('\n') + '\n}');
        }
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules);
    } catch {
      // a stylesheet from another origin (Google Fonts) can't be read
    }
  }
  return [...new Set(found)];
}
