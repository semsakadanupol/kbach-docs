// `import { clsx, kb, useTheme } from '@kbach/react'` in the playground (2026-11-27): the canvas's
// import map points @kbach/react at a module made here from the package's own code, the very
// dist/index.js this site installs (so its version is the docs' version), with:
//   - React from the import map (react, react/jsx-runtime: the canvas's React),
//   - the engine standing in (its WASM isn't loaded in the canvas): the playground makes the CSS
//     for every class, as the build plugin does in a project, so runtime CSS is off and kb()
//     gives the classes back as they are,
//   - the playground's kbach.config.js applied (applyKbachConfig), so useTheme() and useColors()
//     see its colors and dark mode,
//   - initKbach() already called,
//   - its dark mode store starting from the preview's mode (the moon button), and following it
//     when it changes (the runtime's kbach-preview-dark event): left alone, the store applies
//     the system's mode as it loads, and the moon button stopped working on React examples.
// It's a data: URL (the canvas is sandboxed with no origin of its own: a module from this site
// would need CORS), added only when the code imports @kbach/react (usesKbach).

import KBACH_REACT_CJS from '../../node_modules/@kbach/react/dist/index.js?raw';

/** Whether code imports @kbach/react (its root: the build tools' subpaths don't run in a page). */
export function usesKbach(code: string): boolean {
  return /\bfrom\s*['"]@kbach\/react['"]|\bimport\s*\(\s*['"]@kbach\/react['"]\s*\)/.test(code);
}

/** The package's exports, from its bundle's export list. */
const NAMES = (() => {
  const list = /__export\(src_exports,\s*\{([\s\S]*?)\}\);/.exec(KBACH_REACT_CJS)?.[1] ?? '';
  return [...list.matchAll(/^\s*([A-Za-z_$][\w$]*):/gm)].map((m) => m[1]);
})();

/** @kbach/react for a canvas, with this kbach.config.js (its parsed object), as a data: URL. */
export function kbachModuleUrl(config: object): string {
  const source = [
    "import * as __react from 'react';",
    "import * as __jsx from 'react/jsx-runtime';",
    '// @kbach/react in the Kbach playground: the package itself, its engine standing in (the',
    '// playground makes the CSS), your kbach.config.js applied.',
    // (__esModule: the bundle's interop then takes default as the init function, not this object)
    'const __engine = { __esModule: true, default: () => Promise.resolve(), generate_css: (c) => JSON.stringify({ className: c, rules: [] }) };',
    // its dark mode store applies a mode as it loads: the preview's (moon button), not the system's
    "try { localStorage.setItem('kbach-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light'); } catch {}",
    'const __module = { exports: {} };',
    '(function (exports, module, require) {',
    KBACH_REACT_CJS,
    "})(__module.exports, __module, (id) => ({ react: __react, 'react/jsx-runtime': __jsx, '@kbach/core-engine': __engine })[id]);",
    'const __kbach = __module.exports;',
    '__kbach.disableRuntimeCSS();',
    '__kbach.applyKbachConfig(' + JSON.stringify(config) + ');',
    '__kbach.initKbach();',
    // the moon button above the preview, pressed later: the store follows, so useTheme() does
    "addEventListener('kbach-preview-dark', (e) => __kbach.setGlobalThemeMode(e.detail ? 'dark' : 'light'));",
    'export const { ' + NAMES.join(', ') + ' } = __kbach;',
    'export default __kbach;',
  ].join('\n');
  return 'data:text/javascript;charset=utf-8,' + encodeURIComponent(source);
}
