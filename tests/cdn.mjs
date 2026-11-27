// HTML mode's CDN setup (src/playground/cdn.ts): kbach.config.js as a plain page's script
// (window.kbachConfig) and as the build plugin's (module.exports), the tags in <head>, the config
// put inline for the preview, the problems it flags, older code upgraded. Node runs the
// TypeScript file as it is. (No browser.)
import { CDN_SRC, SCRIPT_MARK, cdnProblems, configAsScript, hasCdnScript, hasConfigScript, hasScriptTag, isModuleConfig, packageImports, renameScriptTag, scriptAsConfig, scriptProblems, upgradeHtmlPage, withCdnSetup, withConfigInline, withoutCdnSetup, withoutScriptTag, withScriptMark, withScriptTag } from '../src/playground/cdn.ts';
import { DEFAULT_CONFIG, parseConfig } from '../src/playground/config.ts';

let failures = 0;
const check = (ok, msg) => {
  console.log((ok ? 'OK   ' : 'FAIL ') + msg);
  if (!ok) failures++;
};

const page = '<!doctype html>\n<html lang="en">\n  <head>\n    <title>Page</title>\n  </head>\n  <body>\n    <p class="bg-brand">x</p>\n  </body>\n</html>\n';
const config = "/** @type {import('@kbach/react').KbachConfig} */\nmodule.exports = {\n  darkMode: 'class',\n  extend: { colors: { brand: '#ff6b35' } }, // the brand\n};\n";

// --- the two kinds of kbach.config.js: the same object, the @type line and comments kept
const plain = configAsScript(config);
check(plain.startsWith("/** @type {import('@kbach/react').KbachConfig} */\nwindow.kbachConfig = {") && plain.includes('// the brand'), 'configAsScript: window.kbachConfig = { … }, its @type line and comments kept');
check(scriptAsConfig(plain) === config && scriptAsConfig(configAsScript(DEFAULT_CONFIG)) === DEFAULT_CONFIG, 'scriptAsConfig gives back the build plugin’s file, the same text');
check(isModuleConfig(config) && !isModuleConfig(plain), 'isModuleConfig tells the two apart');
check(parseConfig(plain).config?.extend?.colors?.brand === '#ff6b35', 'the plain page’s file reads as data too (parseConfig)');

// --- into the page: kbach.config.js, then the CDN script, before </head>, indented with the head
const set = withCdnSetup(page);
const head = set.slice(set.indexOf('<head>'), set.indexOf('</head>'));
check(head.includes('    <script src="kbach.config.js"></script>\n    <script src="' + CDN_SRC + '"></script>\n'), 'withCdnSetup: <script src="kbach.config.js">, then the CDN script, as the head’s children:\n' + head);
check(hasCdnScript(set) && hasConfigScript(set) && withCdnSetup(set) === set, 'a page that already loads Kbach is left as it is');
check(withoutCdnSetup(set) === page, 'withoutCdnSetup gives back the page as it was');

// --- the preview and a download: the file's text where its tag was
const inline = withConfigInline(set, plain);
check(!inline.includes('src="kbach.config.js"') && inline.includes('<script>\n// kbach.config.js\n' + plain.trim() + '\n</script>') && inline.indexOf('window.kbachConfig') < inline.indexOf(CDN_SRC), 'withConfigInline puts the file’s text in place of its tag, before the CDN script');
check(withConfigInline(set, 'window.kbachConfig = { a: "</script>" };').includes('<\\/script>'), 'a </script> in the config can’t close the tag early');
check(withConfigInline(page, plain) === page, 'a page that doesn’t load the file is left as it is');

// --- problems: no script; no config; the config after the script
const none = cdnProblems(page);
check(none.length === 1 && none[0].line === 5 && none[0].message.includes(CDN_SRC), 'no CDN script: one problem, on the </head> line, naming the script (' + none[0]?.line + ')');
check(cdnProblems(set).length === 0, 'the setup as made has no problem');
const noConfig = set.replace(/\s*<script src="kbach\.config\.js"><\/script>/, '');
check(/kbach\.config\.js isn’t loaded/.test(cdnProblems(noConfig)[0]?.message ?? ''), 'the CDN script without kbach.config.js: flagged, on the script’s line');
const ownConfig = noConfig.replace('<script src="' + CDN_SRC, '<script>window.kbachConfig = {};</script>\n    <script src="' + CDN_SRC);
check(cdnProblems(ownConfig).length === 0 && hasConfigScript(ownConfig), 'a page that sets window.kbachConfig in a script of its own is fine too');
const late = set.replace(/(\s*<script src="kbach\.config\.js"><\/script>)(\s*<script src="https[^\n]*)/, '$2$1');
const lateProblems = cdnProblems(late);
check(lateProblems.length === 1 && /before the Kbach script/.test(lateProblems[0].message) && late.split('\n')[lateProblems[0].line - 1].includes('kbach.config.js'), 'the config after the script: flagged on its line');
check(packageImports("import { clsx } from '@kbach/react';\nconst x = 1;").map((p) => p.line).join() === '1' && packageImports('const k = window.Kbach;').length === 0, 'an import from @kbach/… in a plain page’s script is flagged; window.Kbach isn’t');

// --- the page's own script: a module tag before </body>, renamed with the language, the compiled
// script in its place for the preview; no tag, no run
const tagged = withScriptTag(set, 'js');
check(tagged.includes('    <p class="bg-brand">x</p>\n    <script type="module" src="script.js"></script>\n  </body>') && hasScriptTag(tagged) && withScriptTag(tagged, 'ts') === tagged, 'withScriptTag: <script type="module" src="script.js"> on its own line before </body> (once)');
check(renameScriptTag(tagged, 'ts').includes('src="script.ts"') && renameScriptTag(renameScriptTag(tagged, 'ts'), 'js') === tagged, 'renameScriptTag follows the JS / TS switch');
check(withoutScriptTag(tagged) === set && withScriptMark(tagged).includes(SCRIPT_MARK) && !hasScriptTag(withScriptMark(tagged)), 'withoutScriptTag takes it out; withScriptMark puts the preview’s mark in its place');
check(scriptProblems(tagged, true, 'js').length === 0 && scriptProblems(set, false, 'js').length === 0, 'no problem with the tag, or with no script to load');
const notRun = scriptProblems(set, true, 'js');
check(notRun.length === 1 && notRun[0].message.includes('<script type="module" src="script.js"></script>') && set.split('\n')[notRun[0].line - 1].includes('</body>'), 'a script with code and no tag: “doesn’t run”, naming the tag, on the </body> line');
check(/script\.ts/.test(scriptProblems(tagged, true, 'ts')[0]?.message ?? ''), 'a tag for the other language’s file is flagged');

// --- older HTML-mode code: the build plugin's config and no script → the plain page's, with the setup
const old = upgradeHtmlPage({ html: page, script: '', lang: 'js', config, mode: 'html' });
check(old.config === plain && hasCdnScript(old.html) && hasConfigScript(old.html) && !hasScriptTag(old.html), 'older HTML-mode code: its config becomes window.kbachConfig, and the page loads it and the CDN script');
const oldWithScript = upgradeHtmlPage({ html: page, script: 'console.log(1);', lang: 'ts', config, mode: 'html' });
check(oldWithScript.html.includes('<script type="module" src="script.ts"></script>'), 'and, when it has a script, the tag that loads it (script.ts for TypeScript)');
const fresh = { html: set, script: '', lang: 'js', config: plain, mode: 'html' };
check(upgradeHtmlPage(fresh) === fresh, 'current HTML-mode code is left alone');
const react = { html: page, script: '', lang: 'js', config, mode: 'react' };
check(upgradeHtmlPage(react) === react, 'React-mode code is left alone');

console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
