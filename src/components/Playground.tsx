import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { clsx, useTheme } from '@kbach/react';
import { CopyButton } from './CodeBlock';
import { KbachEditor, type EditorHandle, type EditorStatus, type RunError } from './KbachEditor';
import { Inspector, type InspectInfo } from './Inspector';
import { ExamplesGallery } from './ExamplesGallery';
import { CommandPalette, type PaletteItem } from './CommandPalette';
import { Logo } from './Logo';
import { PHONE_MAX, SIDE_BY_SIDE_MIN } from '../playground/panes';
import { ConsolePanel, FileTab, LayoutMenu, MoreMenu, PhoneBar, ShortcutSheet, Splitter, StatusBar, Switch, type LogLine, type Notice, type PaneLayout } from './PlaygroundParts';
import { cssForClasses, loadPlaygroundEngine, setPlaygroundTheme, setProjectClasses, suggestFor, type PlaygroundCss } from '../playground/engine';
import { DEFAULT_CONFIG, parseConfig, themeFromConfig } from '../playground/config';
import { useRouter } from 'next/navigation';
import { previousSitePage } from '../lib/location';
import type { ThemeConfig } from '@kbach/react';
import { exampleById, exampleOf, isExampleAsIs } from '../playground/examples';
import { EMPTY_DOCUMENT, STARTER_DOCUMENT, STARTER_TEXT, ensureDocument, pageParts } from '../playground/document';
import { REACT_NOTE, hasCode, htmlToReact, renderedToHtml } from '../playground/convert';
import { kbachModuleUrl, usesKbach } from '../playground/kbachModule';
import { cdnProblems, configAsScript, hasCdnScript, hasConfigScript, hasScriptTag, packageImports, renameScriptTag, scriptAsConfig, scriptProblems, withCdnSetup, withConfigInline, withoutCdnSetup, withoutScriptTag, withScriptMark, withScriptTag } from '../playground/cdn';
import { BROWSER_TYPES, BROWSER_TYPES_PATH } from '../playground/ts/browserTypes';
import { projectZip } from '../playground/projectZip';
import { KBACH_VERSION } from '../lib/docs';
import { PATHS } from '../playground/ts/options';
import { dropFile, syncFile, warmUp } from '../playground/ts/client';
import { CANVAS_SANDBOX, canvasBase, canvasDocument, classesInHtml, exportDocument, inlineParts, sandboxedTab, scriptCandidates, tagsInCode, withFullUrls } from '../playground/canvas';
import { compileScript, type ScriptLang } from '../playground/script';
import { defaultConfigFor, initialFiles, isPristineExample, saveFiles, savedFiles, shareHash, type PlaygroundFiles, type PlaygroundMode } from '../playground/share';
import { REACT_INDEX_HTML, classLiteralFor, jsxClassMarkup, reactIndexFor, withMount } from '../playground/react';
import { applyChange } from '../playground/design';
import { elementAt, elementForTrail, setClassesInSource, sourceTree, trailForElement, type Trail } from '../playground/sourceMap';
import { nativeStylesFile } from '../playground/nativeStyles';
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  InspectIcon,
  LayersIcon,
  LinkIcon,
  MonitorIcon,
  MoonIcon,
  PhoneIcon,
  PlayIcon,
  ReloadIcon,
  RotateIcon,
  SunIcon,
  TabletIcon,
  TrashIcon,
  WrapIcon,
} from './icons';

const WRAP_KEY = 'kbach-playground-wrap';
const SPLIT_KEY = 'kbach-playground-split';
// where the code sits (the old 'kbach-playground-layout' was stack/split, from before full screen)
const LAYOUT_KEY = 'kbach-playground-panes';
const AUTORUN_KEY = 'kbach-playground-autorun';
/** Share went to its new link (a reload): the page says so once it's open again (sessionStorage) */
const SHARED_KEY = 'kbach-playground-shared';
const TAG = 'kbach-playground';
/** What Clear all leaves in React mode: a component with nothing in it yet. */
const BLANK_APP = `export default function App() {
  return <main className="p-6"></main>;
}
`;

/** The editor's tabs: the reader's three files, then Kbach's two outputs. */
type FileId = 'html' | 'script' | 'config' | 'css' | 'native';

/** Opened again by Share (it went to its new link, SHARED_KEY): the notice that says so, once. */
function sharedNotice(): Notice | null {
  try {
    if (!window.sessionStorage.getItem(SHARED_KEY)) return null;
    window.sessionStorage.removeItem(SHARED_KEY);
  } catch {
    return null;
  }
  return { text: 'Link copied. This is the page at it: anyone who opens it gets this code', kind: 'ok' };
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // storage blocked
  }
}

// Canvas sizes. A device has a real width AND height (portrait); the
// rotate button swaps them. Fill just takes the panel.
const DEVICES = [
  { id: 'fill', label: 'Fill', icon: LayersIcon, size: null },
  { id: 'desktop', label: 'Desktop', icon: MonitorIcon, size: { w: 1280, h: 800 } },
  { id: 'tablet', label: 'Tablet', icon: TabletIcon, size: { w: 768, h: 1024 } },
  { id: 'phone', label: 'Phone', icon: PhoneIcon, size: { w: 390, h: 844 } },
] as const;

/** Room around a device inside the panel. */
const DEVICE_MARGIN = 32;

/** Replaces one class everywhere it appears as a whole class name. */
/** index.html's <html> tag, its head and its <body> tag: when they change, the page is built again. */
function pageHead(html: string): string {
  const p = pageParts(html);
  return p.htmlTag + p.head + p.bodyTag;
}

function replaceClass(code: string, from: string, to: string): string {
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return code.replace(new RegExp('(^|[\\s"\'`])' + escaped + '(?=[\\s"\'`]|$)', 'g'), '$1' + to);
}

/**
 * The CSS for a canvas: its HTML's classes, the candidates in the script file
 * and in index.html's inline <script>s, and what a running script added.
 * Classes an inline <style> defines are the reader's own, never "unknown".
 */
function canvasCss(html: string, script: string, added: Set<string>): PlaygroundCss {
  const inHtml = classesInHtml(html);
  const inline = inlineParts(html);
  setProjectClasses(inline.styleClasses);
  const candidates = [...scriptCandidates(script), ...scriptCandidates(inline.scripts)];
  // the tags in use: index.html's, and the ones the script writes (JSX, markup in strings)
  const tags = new Set([...inline.tags, ...tagsInCode(script), ...tagsInCode(inline.scripts)]);
  const result = cssForClasses([...new Set([...inHtml, ...added, ...candidates])], tags, canvasBase());
  // only a class really on the page is "unknown"; a word in the script that isn't a class is just a word
  const real = new Set([...inHtml, ...added]);
  return { ...result, unknown: result.unknown.filter((c) => real.has(c)) };
}

/**
 * What the canvas's stylesheet holds. React: Kbach's CSS for the page (as the build plugin
 * writes kbach.css). HTML: only the preview's page basics: the page's own CDN script styles it,
 * as on a real page (cdn.ts), and the playground's CSS (the kbach.css tab) is just to look at.
 */
function canvasSheet(result: PlaygroundCss, mode: PlaygroundMode): string {
  return mode === 'react' ? result.stylesheet : canvasBase();
}

// --- the playground --------------------------------------------------------
/**
 * A free-form Kbach playground, CodePen style: HTML with Kbach classes, and
 * a script in JavaScript or TypeScript, rendered live. The canvas is a
 * sandboxed iframe, so its width drives the responsive variants, dark mode
 * can be switched on its own, and the script can't reach the docs page.
 *
 * Around it, what an IDE has: a status bar, Format, Emmet, a console you can
 * type into, panes you can resize, a full-screen mode, and an inspector that
 * picks elements in the preview and finds them in the code.
 *
 * Three bars, by what they act on:
 *   the header   the whole project: Run (and Auto-run), the layout, export, Share
 *   the editor   the files: tabs, JS or TS, wrap, copy; its status bar has Format and Fix all
 *   the preview  how the page is viewed: Preview or Console, Inspect, dark, the device
 *
 * Every visit starts from the first example. A shared link (#code=) opens its
 * code instead; the reader's last edited code can be brought back (Restore).
 */
export function Playground() {
  const site = useTheme();
  const router = useRouter();
  const [initial] = useState(initialFiles);
  // index.html is always a whole document (older code, just a body's markup, is put in one)
  const [html, setHtml] = useState(() => ensureDocument(initial.html));
  const [script, setScript] = useState(initial.script);
  const [lang, setLang] = useState<ScriptLang>(initial.lang);
  const [config, setConfig] = useState(initial.config);
  // html: index.html and a script; react: index.html and App.jsx, run with real React (react.ts)
  const [mode, setMode] = useState<PlaygroundMode>(initial.mode);
  // the reader's files, and what Kbach makes from them (read-only): the
  // stylesheet, and the React Native style objects. A React page opens on App.jsx.
  const [file, setFile] = useState<FileId>(initial.mode === 'react' ? 'script' : 'html');
  // kbach.config.js, read as data: the theme everything here uses. React: the build plugin's
  // (module.exports = { … }). HTML: a plain page's, `window.kbachConfig = { … }`, which index.html
  // loads before the CDN script (cdn.ts). One that doesn't parse keeps the last good theme, and
  // shows its error.
  const parsedConfig = useMemo(() => parseConfig(config), [config]);
  const lastTheme = useRef<ThemeConfig | null>(null);
  // (React's lint asks for no ref reads during render. Here the ref is the last good
  // theme, a memo of a memo: it changes only with the config, and nothing else reads it.)
  /* eslint-disable react-hooks/refs */
  const theme = useMemo(() => {
    if (parsedConfig.config) lastTheme.current = themeFromConfig(parsedConfig.config);
    return lastTheme.current ?? themeFromConfig({});
  }, [parsedConfig]);
  /* eslint-enable react-hooks/refs */
  setPlaygroundTheme(theme);
  // classes index.html's inline <style>s define: the reader's own CSS, so the
  // checks don't flag them (set here, as they type, before the checks run)
  const styleClasses = useMemo(() => [...inlineParts(html).styleClasses].sort().join(' '), [html]);
  setProjectClasses(new Set(styleClasses.split(' ').filter(Boolean)));
  // a change to either re-runs the class checks
  const recheckKey = config + '|' + styleClasses;
  const configErrors: RunError[] = parsedConfig.error ? [parsedConfig.error] : [];
  // an HTML page's Kbach setup (no CDN script, no config, the config after it) and package imports its script can't have
  // (and its script: index.html loads it with a module tag, or it doesn't run)
  const htmlSetupErrors: RunError[] = useMemo(() => (mode === 'html' ? [...cdnProblems(html), ...scriptProblems(html, hasCode(script), lang)] : []), [mode, html, script, lang]);
  const importErrors: RunError[] = useMemo(() => (mode === 'html' ? packageImports(script) : []), [mode, script]);
  // the example the code came from, to name it in the menu (and say when it was edited)
  const [exampleId, setExampleId] = useState(() => exampleOf(initial)?.id ?? null);
  // the code the reader edited on an earlier visit, to bring back (a visit starts clean)
  const [lastCode] = useState(() => {
    const saved = savedFiles();
    return saved && !isPristineExample(saved) && (saved.html !== initial.html || saved.script !== initial.script || saved.config !== initial.config) ? saved : null;
  });
  const [loads, setLoads] = useState(0);
  // long lines wrap on a phone unless the reader chose otherwise (scrolling sideways there is hard)
  const [wrap, setWrap] = useState(() => {
    const saved = read(WRAP_KEY);
    return saved !== null ? saved === '1' : typeof window !== 'undefined' && window.innerWidth < PHONE_MAX;
  });
  const [dark, setDark] = useState(site.isDark);
  const [device, setDevice] = useState<(typeof DEVICES)[number]['id']>('fill');
  const [landscape, setLandscape] = useState(false);
  const [tab, setTab] = useState<'preview' | 'console'>('preview');
  const [engineReady, setEngineReady] = useState(false);
  const [css, setCss] = useState<PlaygroundCss | null>(null);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [srcDoc, setSrcDoc] = useState('');
  // A new canvas is a new <iframe>, not the same one navigated: changing an
  // iframe's srcdoc adds an entry to the tab's history, so the browser's Back
  // button stepped through earlier runs instead of leaving the page.
  const [canvasKey, setCanvasKey] = useState(0);
  const [run, setRun] = useState(0);
  const [shared, setShared] = useState(false);
  const [panel, setPanel] = useState({ w: 0, h: 0 });
  // IDE parts
  const [status, setStatus] = useState<EditorStatus | null>(null);
  // (opened again by Share: it says what happened)
  const [notice, setNotice] = useState<Notice | null>(sharedNotice);
  const [shortcuts, setShortcuts] = useState(false);
  // the command palette (Ctrl+Shift+P, F1) or the file list (Ctrl+P), as in VS Code
  const [palette, setPalette] = useState<'commands' | 'files' | null>(null);
  const [gallery, setGallery] = useState(false);
  // on a phone, which pane fills the screen: the result first
  const [phoneView, setPhoneView] = useState<'code' | 'preview'>('preview');
  // the playground is its own page, always full screen
  const fullscreen = true;
  const [split, setSplit] = useState(() => Math.min(75, Math.max(25, Number(read(SPLIT_KEY)) || 45)));
  // where the code sits: left (the default), right, top or bottom; the preview takes the other side
  const [layout, setLayout] = useState<PaneLayout>(() => {
    const saved = read(LAYOUT_KEY);
    return saved === 'right' || saved === 'top' || saved === 'bottom' ? saved : 'left';
  });
  const [rootWidth, setRootWidth] = useState(0);
  // off: changes wait for Run (a heavy script, or a page you want to look at while you type)
  const [autoRun, setAutoRun] = useState(() => read(AUTORUN_KEY) !== '0');
  const [pending, setPending] = useState(false);
  // inspector
  const [inspecting, setInspecting] = useState(false);
  const [picked, setPicked] = useState<InspectInfo | null>(null);
  const [gone, setGone] = useState(false);

  const frame = useRef<HTMLIFrameElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const htmlEditor = useRef<EditorHandle>(null);
  const scriptEditor = useRef<EditorHandle>(null);
  const cssEditor = useRef<EditorHandle>(null);
  const nativeEditor = useRef<EditorHandle>(null);
  const configEditor = useRef<EditorHandle>(null);

  // the canvas currently showing: its generation, whether it said it's ready,
  // what it was built from, and the classes its script added
  const canvas = useRef({
    gen: 0,
    ready: false,
    hasScript: false,
    html: '',
    script: '',
    lang: '' as string,
    mode: '' as string,
    run: -1,
    loads: 0,
    config: '',
    added: new Set<string>(),
    theme: null as ThemeConfig | null,
  });
  const latest = useRef({ html, script, dark, autoRun, stylesheet: '', inspecting, picked: null as Trail | null, scroll: null as { x: number; y: number } | null });
  // the newest values, for the canvas's message handler (set up once); a ref read only outside render
  // eslint-disable-next-line react-hooks/refs
  latest.current = { ...latest.current, html, script, dark, autoRun, inspecting, picked: picked?.trail ?? null };

  // the switch from React to HTML waits for the canvas's answer (renderedMarkup)
  const snapshotWait = useRef<((markup: string | null) => void) | null>(null);
  const post = (msg: Record<string, unknown>) => frame.current?.contentWindow?.postMessage({ ...msg, kb: TAG }, '*');

  const tree = useMemo(() => sourceTree(html), [html]);
  const pickedSource = picked?.trail ? elementForTrail(tree, picked.trail) : null;

  useEffect(() => {
    loadPlaygroundEngine().then(() => setEngineReady(true));
  }, []);

  // Keep the reader's own code for Restore. Not an untouched example: that
  // would overwrite the code they wrote with code they can load any time.
  useEffect(() => {
    if (isPristineExample({ html, script, lang, config, mode })) return;
    const t = setTimeout(() => saveFiles({ html, script, lang, config, mode }, exampleId), 400);
    return () => clearTimeout(t);
  }, [html, script, lang, config, mode, exampleId]);

  // Render. With no script, an HTML change is morphed into the live canvas
  // (only what changed is touched, so animations keep running). A script
  // means a fresh canvas instead, as CodePen does: the script runs again on
  // the new HTML. Typing in the script waits for a pause before re-running.
  useEffect(() => {
    if (!engineReady) return;
    const c = canvas.current;
    // a script file index.html loads, an inline <script> of its own, or a React App: either way the
    // page runs code (a script of comments only, like React → HTML's note, runs nothing: the HTML
    // keeps morphing; so does a page whose only scripts are tags, Kbach's and kbach.config.js)
    const hasScript = mode === 'react' || (hasCode(script) && hasScriptTag(html)) || inlineParts(html).scripts.trim() !== '';
    const scriptChanged = c.script !== script || c.lang !== lang || c.mode !== mode;
    // kbach.config.js changed the theme: a fresh page (its CSS and dark mode change)
    const themeChanged = c.theme !== theme;
    // index.html's <head> or its <html>/<body> tags changed: a fresh page (only the body is morphed)
    const headChanged = c.html !== html && pageHead(c.html) !== pageHead(html);
    // an HTML page runs its kbach.config.js (the CDN script reads it as it loads): any change is a fresh page
    const configChanged = mode === 'html' && c.config !== config;
    const reload = c.run !== run || c.loads !== loads || scriptChanged || themeChanged || configChanged || headChanged || (hasScript && c.html !== html);
    // auto-run off: the page stays as it was until Run (but the first page, and a loaded example, show)
    if (!autoRun && c.gen > 0 && c.run === run && c.loads === loads) {
      setPending(scriptChanged || themeChanged || configChanged || c.html !== html);
      return;
    }
    setPending(false);
    // a Run click or a loaded example shows at once; typing waits for a pause
    const delay = c.run !== run || c.loads !== loads ? 0 : scriptChanged ? 700 : reload ? 450 : 40;
    let cancelled = false;
    const t = setTimeout(async () => {
      if (!reload) {
        const result = canvasCss(html, script, new Set());
        latest.current.stylesheet = canvasSheet(result, mode);
        setCss(result);
        // a canvas still loading gets the HTML when it says it's ready
        if (c.ready) {
          post({ type: 'html', html: pageParts(html).body, css: latest.current.stylesheet });
          c.html = html;
          // the inspected element, found again in the changed page
          if (latest.current.picked) post({ type: 'inspect-trail', trail: latest.current.picked });
        }
        return;
      }
      const react = mode === 'react';
      let compiled = script.trim() ? await compileScript(script, lang, { jsx: react }) : { code: null as string | null, error: undefined as { message: string; line: number | null } | undefined };
      // React: the lines that mount the component App.jsx exports
      if (react && compiled.code !== null) {
        const mounted = withMount(compiled.code);
        compiled = mounted.error ? { code: null, error: { message: mounted.error, line: null } } : { code: mounted.code };
      }
      if (cancelled) return;
      const result = canvasCss(html, script, new Set());
      canvas.current = { gen: c.gen + 1, ready: false, hasScript, html, script, lang, mode, run, loads, config, added: new Set(), theme };
      latest.current.stylesheet = canvasSheet(result, mode);
      setCss(result);
      setLogs(compiled.error ? [{ level: 'error', text: compiled.error.message, line: compiled.error.line }] : []);
      // a re-run of the same page lands where the reader was scrolled to; a new example starts at the top
      if (c.loads !== loads) latest.current.scroll = null;
      setCanvasKey((k) => k + 1);
      setSrcDoc(
        canvasDocument({
          // (an HTML page: its kbach.config.js in place of the tag that loads it, the srcdoc has no folder)
          // (an HTML page: its kbach.config.js in place of the tag that loads it, the srcdoc has no
          // folder; its script where index.html's tag is, and with no tag it doesn't run)
          html: react ? html : withScriptMark(withConfigInline(html, config)),
          css: latest.current.stylesheet,
          dark: latest.current.dark,
          script: react || hasScriptTag(html) ? compiled.code : null,
          gen: c.gen + 1,
          inspecting: latest.current.inspecting,
          scroll: latest.current.scroll,
          react,
          // (React only: a plain HTML page has no packages, it has window.Kbach from the CDN script)
          kbach: react && usesKbach(script) ? kbachModuleUrl(parsedConfig.config ?? {}) : undefined,
        }),
      );
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, script, lang, mode, theme, config, run, loads, engineReady, autoRun]);

  useEffect(() => {
    if (canvas.current.ready) post({ type: 'dark', on: dark });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark]);

  // what the canvas says: ready, new classes, console output, the inspector's pick
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const c = canvas.current;
      if (e.source !== frame.current?.contentWindow) return;
      const d = e.data as { kb?: string; gen?: number; type?: string; html?: unknown; list?: unknown; level?: string; text?: unknown; line?: unknown; trail?: unknown };
      if (!d || d.kb !== TAG || d.gen !== c.gen) return;
      if (d.type === 'snapshot') {
        snapshotWait.current?.(typeof d.html === 'string' ? d.html : null);
        snapshotWait.current = null;
      } else if (d.type === 'ready') {
        c.ready = true;
        const now = latest.current;
        // edits made while it loaded (not with Auto-run off: those wait for Run, Reload included)
        if (!c.hasScript && now.autoRun && now.html !== c.html) {
          post({ type: 'html', html: pageParts(now.html).body, css: now.stylesheet });
          c.html = now.html;
        }
        post({ type: 'dark', on: now.dark }); // in case it was switched while loading
        post({ type: 'inspect', on: now.inspecting });
        if (now.picked) post({ type: 'inspect-trail', trail: now.picked });
      } else if (d.type === 'classes' && c.hasScript && Array.isArray(d.list)) {
        // classes the script made at runtime: generate their CSS
        let grew = false;
        for (const cls of d.list) {
          if (typeof cls === 'string' && cls.length < 200 && !c.added.has(cls)) {
            c.added.add(cls);
            grew = true;
          }
        }
        if (!grew) return;
        const result = canvasCss(c.html, c.script, c.added);
        // (an HTML page's CDN script styles them itself: the canvas only needs them for React)
        if (c.mode === 'react' && result.stylesheet !== latest.current.stylesheet) {
          latest.current.stylesheet = result.stylesheet;
          post({ type: 'css', css: result.stylesheet });
        }
        setCss(result);
      } else if (d.type === 'console') {
        const level = (['log', 'info', 'warn', 'error', 'result'] as const).find((l) => l === d.level) ?? 'log';
        const entry: LogLine = { level, text: String(d.text).slice(0, 5000), line: typeof d.line === 'number' ? d.line : null };
        setLogs((l) => [...l.slice(-299), entry]);
      } else if (d.type === 'clear') {
        setLogs([]);
      } else if (d.type === 'inspect-select') {
        setPicked(Array.isArray(d.trail) ? (d as unknown as InspectInfo) : null);
      } else if (d.type === 'inspect-lost') {
        // (not inside a setPicked updater: React doesn't take a state update made in there)
        if (latest.current.picked) setGone(true);
        setPicked(null);
      } else if (d.type === 'scroll') {
        const sd = d as unknown as { x: number; y: number };
        latest.current.scroll = { x: Number(sd.x) || 0, y: Number(sd.y) || 0 };
      } else if (d.type === 'inspect-exit') {
        setInspecting(false);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the space the canvas has, to fit a device into it
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPanel({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // --- inspector ---------------------------------------------------------------
  useEffect(() => {
    post({ type: 'inspect', on: inspecting });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the inspector picks in the preview: show it
    if (inspecting) setTab('preview');
    else post({ type: 'highlight-trail', trail: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspecting]);

  // the picked element's tag, marked in the code
  useEffect(() => {
    htmlEditor.current?.mark(pickedSource ? { from: pickedSource.openFrom, to: pickedSource.openTo } : null);
  }, [pickedSource?.openFrom, pickedSource?.openTo, pickedSource]);

  // While inspecting, the element the cursor is in lights up in the canvas:
  // only while someone is actually in the HTML editor (the cursor sitting at
  // the top of a file nobody is typing in would light up the whole page).
  const codeFocused = inspecting && file === 'html' && !!status?.focused;
  useEffect(() => {
    if (!codeFocused || !status) {
      post({ type: 'highlight-trail', trail: null });
      return;
    }
    const t = setTimeout(() => {
      const el = elementAt(tree, status.pos);
      post({ type: 'highlight-trail', trail: el ? trailForElement(tree, el) : null, scroll: true });
    }, 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeFocused, status?.pos, tree]);

  useEffect(() => {
    if (!gone) return;
    const t = setTimeout(() => setGone(false), 2500);
    return () => clearTimeout(t);
  }, [gone]);

  const selectTrail = (trail: Trail) => post({ type: 'inspect-trail', trail });
  const closeInspector = () => {
    setPicked(null);
    post({ type: 'inspect-trail', trail: null });
  };
  // React mode: the picked element's className="…" in App.jsx, when exactly one literal has its classes
  const reactLiteral = useMemo(() => (mode === 'react' && picked ? classLiteralFor(script, picked.classes) : null), [mode, picked, script]);
  const goToCode = () => {
    setPhoneView('code');
    if (reactLiteral) {
      setFile('script');
      requestAnimationFrame(() => scriptEditor.current?.select(reactLiteral.from, reactLiteral.to));
      return;
    }
    if (!pickedSource) return;
    setFile('html');
    requestAnimationFrame(() => htmlEditor.current?.select(pickedSource.openFrom, pickedSource.openTo));
  };
  /** The picked element's classes changed in the code: its class attribute in index.html, or its className in App.jsx. One edit. */
  const editPickedClasses = (change: (tokens: string[]) => string[]) => {
    if (reactLiteral) {
      const { from, to } = reactLiteral;
      setScript((src) => src.slice(0, from) + change(src.slice(from, to).split(/\s+/).filter(Boolean)).join(' ') + src.slice(to));
      return;
    }
    const el = pickedSource;
    if (!el) return;
    setHtml((src) => {
      const tokens = el.classFrom !== null && el.classTo !== null ? src.slice(el.classFrom, el.classTo).split(/\s+/).filter(Boolean) : [];
      const next = change(tokens);
      const remove = tokens.filter((t) => !next.includes(t));
      const add = next.filter((t) => !tokens.includes(t));
      // (a pure reorder, like a replace in place, rewrites the attribute as it is now)
      if (!remove.length && !add.length && next.join(' ') === tokens.join(' ')) return src;
      if (el.classFrom !== null && el.classTo !== null) return src.slice(0, el.classFrom) + next.join(' ') + src.slice(el.classTo);
      return setClassesInSource(src, el, remove, add);
    });
  };

  // --- IDE: status, notices, panes ----------------------------------------------------
  const showNotice = useCallback((text: string, kind: 'ok' | 'error') => setNotice({ text, kind }), []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), notice.kind === 'error' || notice.action ? 7000 : 2500);
    return () => clearTimeout(t);
  }, [notice]);

  const activeEditor = () =>
    file === 'html' ? htmlEditor.current : file === 'script' ? scriptEditor.current : file === 'config' ? configEditor.current : file === 'css' ? cssEditor.current : nativeEditor.current;
  const runAgain = useCallback(() => setRun((r) => r + 1), []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // the inside of the box (not its padding): the panes share this width
    const ro = new ResizeObserver(([entry]) => setRootWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // full screen: the page behind doesn't scroll; Esc leaves the inspector
  useEffect(() => {
    if (!fullscreen) return;
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = before;
    };
  }, [fullscreen]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (inspecting) setInspecting(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inspecting]);

  const dragFrom = useRef(0);
  const splitPane = (delta: number) => {
    const box = bodyRef.current?.getBoundingClientRect();
    if (!box) return;
    const size = horizontal ? box.width : box.height;
    const [lo, hi] = splitRange(size);
    // code after the preview: dragging right (or down) makes the code smaller
    const next = Math.min(hi, Math.max(lo, dragFrom.current + ((codeLast ? -delta : delta) / size) * 100));
    setSplit(next);
    write(SPLIT_KEY, String(Math.round(next)));
  };
  /** The split's limits, in %, for a playground this wide (or tall): each pane keeps a usable size. */
  const splitRange = (size: number): [number, number] => {
    if (!horizontal) return [25, 75];
    // (the 12px drag bar between them comes out of the preview's side)
    const lo = (360 / size) * 100;
    const hi = 100 - ((420 + 12) / size) * 100;
    return lo <= hi ? [Math.max(20, lo), Math.min(80, hi)] : [50, 50];
  };

  // Back: to the page the reader came from on this site, else the docs' home. It's the entry
  // before this one: the playground adds none of its own (a re-run is a new iframe, Share and a
  // loaded example replace the address), so a real step back, and the browser's Back button
  // doesn't then return here.
  const goBack = () => (previousSitePage() ? router.back() : router.push('/'));

  /**
   * Share (2026-11-27, the user: "when click share make new link and redirect"): the link to this
   * code, copied, and the browser goes to it: a new entry in its history (Back returns to the
   * page before) and the page opens from the link, as anyone who gets it sees it. Unchanged code
   * has the same link: copied again, nothing to go to.
   */
  const share = async () => {
    const here = '/playground' + shareHash({ html, script, lang, config, mode });
    try {
      await navigator.clipboard?.writeText(window.location.origin + here);
    } catch {
      // no clipboard (blocked, or no permission): the link is in the address bar all the same
    }
    if (window.location.pathname + window.location.hash === here) {
      setShared(true);
      setTimeout(() => setShared(false), 1800);
      setNotice({ text: 'Link copied: the same as the last one (nothing changed)', kind: 'ok' });
      return;
    }
    try {
      window.sessionStorage.setItem(SHARED_KEY, '1');
    } catch {
      // storage blocked: the page opens from the link without saying so
    }
    // (Next.js keeps its own state in history.state: keep it)
    history.pushState(history.state, '', here);
    window.location.reload();
  };


  /** Swaps in other code (an example, or the reader's last code). Edited code gets an Undo. */
  const replaceCode = (files: PlaygroundFiles, id: string | null, label: string) => {
    const before = { html, script, lang, config, mode, exampleId };
    const wasEdited = !isPristineExample({ html, script, lang, config, mode });
    setNotice(
      wasEdited && (html.trim() || script.trim())
        ? {
            text: label,
            kind: 'ok',
            action: {
              label: 'Undo',
              run: () => {
                setHtml(before.html);
                setScript(before.script);
                setLang(before.lang);
                setConfig(before.config);
                setMode(before.mode);
                setFile(before.mode === 'react' ? 'script' : 'html');
                setExampleId(before.exampleId);
                setLoads((n) => n + 1);
                setNotice({ text: 'Your code is back', kind: 'ok' });
              },
            },
          }
        : null,
    );
    setHtml(ensureDocument(files.html));
    setScript(files.script);
    setLang(files.lang);
    setConfig(files.config);
    // another kind of page opens on its main file: index.html, or App.jsx
    if (files.mode !== mode) setFile(files.mode === 'react' ? 'script' : 'html');
    setMode(files.mode);
    setExampleId(id);
    setLoads((n) => n + 1);
    setPicked(null);
    // the address no longer holds this code: a reload starts from the first example
    if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
  };
  /** An example, in the kind of page asked for (HTML or React). */
  const pickExample = (id: string, kind: PlaygroundMode) => {
    const ex = exampleById(id);
    if (ex) replaceCode(ex[kind], ex.id, 'Loaded ' + ex.name + (kind === 'react' ? ' (React)' : ''));
  };
  const restoreLastCode = () => {
    if (!lastCode) return;
    replaceCode(lastCode, lastCode.example, 'Restored your last code');
  };

  // a fresh start, with the way back to what the reader wrote last time
  // (through a ref: the notice outlives this render, and Undo needs the code as it is then)
  const restoreRef = useRef(restoreLastCode);
  // eslint-disable-next-line react-hooks/refs
  restoreRef.current = restoreLastCode;
  useEffect(() => {
    if (lastCode && !window.location.hash.includes('code=')) setNotice({ text: 'Started fresh', kind: 'ok', action: { label: 'Restore my last code', run: () => restoreRef.current() } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleWrap = () => {
    setWrap((w) => {
      write(WRAP_KEY, w ? '0' : '1');
      return !w;
    });
  };

  // the palette and word wrap keys, from anywhere in the playground
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const p = e.key.toLowerCase() === 'p';
      if ((mod && e.shiftKey && p) || e.key === 'F1') {
        e.preventDefault();
        setPalette('commands');
      } else if (mod && !e.shiftKey && !e.altKey && p) {
        // (the browser's Print, as VS Code takes it too)
        e.preventDefault();
        setPalette('files');
      } else if (e.altKey && !mod && !e.shiftKey && e.code === 'KeyZ') {
        // VS Code's word wrap key (toggleWrap's update needs no fresh state)
        e.preventDefault();
        toggleWrap();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toggleWrap only sets state
  }, []);

  /** The page as a standalone file: its HTML, CSS and script (without the playground's loop guard). */
  /** `sandboxed`: for Open in a new tab, a frame with no origin (exportDocument) */
  const exportFile = async (sandboxed = false): Promise<string | null> => {
    const react = mode === 'react';
    const compiled = script.trim() ? await compileScript(script, lang, { guard: false, jsx: react }) : { code: null };
    if (compiled.error) {
      setNotice({ text: 'The script doesn’t compile: ' + compiled.error.message, kind: 'error' });
      return null;
    }
    let code = compiled.code;
    if (react && code !== null) {
      const mounted = withMount(code);
      if (mounted.error) {
        setNotice({ text: mounted.error, kind: 'error' });
        return null;
      }
      code = mounted.code;
    }
    const kbach = react && usesKbach(script) ? kbachModuleUrl(parsedConfig.config ?? {}) : undefined;
    // (one file: an HTML page's kbach.config.js and its script go in where their tags were)
    return exportDocument({
      html: react ? html : withScriptMark(withConfigInline(html, config)),
      css: canvasSheet(canvasCss(html, script, canvas.current.added), mode),
      dark,
      script: react || hasScriptTag(html) ? code : null,
      react,
      kbach,
      sandboxed,
    });
  };
  const openInTab = async () => {
    const doc = await exportFile(true);
    if (!doc) return;
    // the tab shows it in a sandboxed frame, so its script never runs on this site's origin
    const url = URL.createObjectURL(new Blob([sandboxedTab(doc)], { type: 'text/html' }));
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };
  /** Download: the page as a project in a .zip, each file on its own (projectZip.ts). */
  const download = async () => {
    const react = mode === 'react';
    // an HTML page in TypeScript also gets the JavaScript it compiles to (a browser can't run .ts)
    let compiled: string | null = null;
    if (!react && lang === 'ts' && script.trim()) {
      const result = await compileScript(script, lang, { guard: false, jsx: false });
      if (result.error) {
        setNotice({ text: 'The script doesn’t compile: ' + result.error.message, kind: 'error' });
        return;
      }
      compiled = result.code;
    }
    const name = example && !edited ? example.id.replace(/^\d+-/, '') : 'kbach-playground';
    // (site addresses made full, src="/kbach-logo-64.png": the folder isn't this site; withFullUrls)
    const zip = projectZip({
      mode,
      name,
      html: withFullUrls(html),
      script: withFullUrls(script),
      lang,
      config,
      compiled: compiled === null ? null : withFullUrls(compiled),
      // kbach.css as its tab has it, the classes a script added included
      kbachCss: css?.file ?? '',
      basics: canvasBase(),
      kbachVersion: KBACH_VERSION,
    });
    const url = URL.createObjectURL(new Blob([zip as BlobPart], { type: 'application/zip' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name + '.zip';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    setNotice({ text: 'Downloaded ' + a.download + (react ? ': a Vite project (npm install, npm run dev)' : ': index.html, kbach.config.js, the script and style.css'), kind: 'ok' });
  };
  const switchAutoRun = (on: boolean) => {
    setAutoRun(on);
    write(AUTORUN_KEY, on ? '1' : '0');
    setNotice({ text: on ? 'Auto-run on: the preview updates as you type' : 'Auto-run off: the preview updates on Run (Ctrl+Enter)', kind: 'ok' });
  };
  /**
   * Reload, as a browser does: the page as it last ran, fresh (its script from the top), on a
   * new iframe with the same document. Unlike Run it doesn't take in code Auto-run is holding.
   */
  const reloadPreview = () => {
    canvas.current = { ...canvas.current, ready: false, added: new Set() };
    setLogs([]);
    setCanvasKey((k) => k + 1);
  };
  const switchLayout = (next: PaneLayout) => {
    setLayout(next);
    write(LAYOUT_KEY, next);
  };

  /** Empties index.html (the skeleton stays) and the script, and puts the config back to the default. Undo brings it all back. */
  // (an empty body has comments at most, and an HTML page's tag for its script)
  const nothingToClear =
    !withoutScriptTag(pageParts(html).body)
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim() &&
    !script.trim() &&
    config === defaultConfigFor(mode) &&
    (mode === 'react' || (hasCdnScript(html) && hasConfigScript(html)));
  /**
   * A page of either kind with nothing of yours in it (Undo brings the code back). `starter`: the
   * gallery's Blank page card and New blank page in ⋯ open STARTER_DOCUMENT (its React version
   * made by convert.ts), its heading selected to type over; Clear all (the kind open now) leaves
   * it empty. kbach.config.js goes back to the default (2026-11-27: it used to stay), and an
   * HTML page loads it and the CDN script (cdn.ts).
   */
  const blankPage = async (kind: PlaygroundMode = mode, label = 'Cleared', starter = false) => {
    if (kind === 'react') {
      // a React page keeps a component to show: the starter, or an empty one with the cursor in it
      const app = starter ? await htmlToReact(STARTER_DOCUMENT, '', lang === 'ts') : BLANK_APP;
      replaceCode({ html: REACT_INDEX_HTML, script: app, lang, config: DEFAULT_CONFIG, mode: 'react' }, null, label);
      setFile('script');
      const at = starter ? app.indexOf(STARTER_TEXT) : BLANK_APP.indexOf('">') + 2;
      selectWhenShown(() => scriptEditor.current, app, at, starter ? at + STARTER_TEXT.length : at);
      return;
    }
    // (it loads kbach.config.js and the CDN script in its <head>, and its script before </body>)
    const doc = withScriptTag(withCdnSetup(starter ? STARTER_DOCUMENT : EMPTY_DOCUMENT), lang);
    replaceCode({ html: doc, script: '', lang, config: defaultConfigFor('html'), mode: 'html' }, null, label);
    setFile('html');
    // the starter's words selected to type over, or the cursor in the empty body
    const at = starter ? doc.indexOf(STARTER_TEXT) : doc.indexOf('<body>') + '<body>\n    '.length;
    selectWhenShown(() => htmlEditor.current, doc, at, starter ? at + STARTER_TEXT.length : at);
  };

  /** Go to definition found it in another of the reader's files: that file's tab, the name selected. */
  const openFileAt = (path: string, from: number, to: number) => {
    const target = path === PATHS.config ? 'config' : 'script';
    setFile(target);
    requestAnimationFrame(() => (target === 'config' ? configEditor : scriptEditor).current?.select(from, to));
  };

  // the TypeScript service starts with the playground, so the first suggestion is quick
  useEffect(() => warmUp(), []);
  // an HTML page's script has window.Kbach (the CDN script's API); a React page doesn't
  useEffect(() => {
    if (mode === 'html') void syncFile(BROWSER_TYPES_PATH, BROWSER_TYPES);
    else void dropFile(BROWSER_TYPES_PATH);
  }, [mode]);

  /** Selects a range once the editor holds `code` (it takes new code an effect after the render; tries for about a second). */
  const selectWhenShown = (editor: () => EditorHandle | null, code: string, from: number, to: number) => {
    let frames = 0;
    const attempt = () => {
      const e = editor();
      if (e && e.text() === code) e.select(from, to);
      else if (++frames < 60) requestAnimationFrame(attempt);
    };
    requestAnimationFrame(attempt);
  };

  /** What React drew into #root, from the canvas (null: nothing running, or no answer in time). */
  const renderedMarkup = () =>
    new Promise<string | null>((resolve) => {
      if (!canvas.current.ready) return resolve(null);
      const timer = setTimeout(() => {
        snapshotWait.current = null;
        resolve(null);
      }, 1500);
      snapshotWait.current = (markup) => {
        clearTimeout(timer);
        resolve(markup);
      };
      post({ type: 'snapshot' });
    });

  const evaluate = (code: string) => {
    setLogs((l) => [...l.slice(-299), { level: 'input', text: code }]);
    post({ type: 'eval', code });
  };

  const example = exampleById(exampleId);
  const edited = !!example && !isExampleAsIs(example, { html, script, lang, config, mode });
  const react = mode === 'react';
  const scriptName = react ? 'App.' + (lang === 'ts' ? 'tsx' : 'jsx') : 'script.' + lang;
  /**
   * HTML or React. An example turns into its other version (both written by hand). Any other page
   * is converted (convert.ts, 2026-11-27): HTML becomes App.jsx (its markup as JSX, its script in a
   * useEffect); React becomes index.html from what React drew (its logic stays in App.jsx, which
   * Undo brings back). The same Kbach classes either way.
   */
  const switchMode = async (next: PlaygroundMode) => {
    if (next === mode) return;
    if (example) {
      replaceCode(example[next], example.id, (next === 'react' ? 'React: ' : 'HTML: ') + example.name);
      return;
    }
    if (next === 'react') {
      // the page's CDN setup goes (React has the build plugin), and kbach.config.js becomes the plugin's kind
      const plain = withoutScriptTag(withoutCdnSetup(html));
      const app = await htmlToReact(plain, script, lang === 'ts');
      replaceCode({ html: reactIndexFor(plain), script: app, lang, config: scriptAsConfig(config), mode: 'react' }, null, 'Made into React: the same classes, as className');
      setFile('script');
      return;
    }
    const rendered = await renderedMarkup();
    // nothing drawn (an error in App.jsx, or React not loaded yet): a new page instead
    if (rendered === null) {
      await blankPage('html', 'Nothing drawn to turn into HTML: a new page', true);
      return;
    }
    // a plain page loads its kbach.config.js (window.kbachConfig now), then Kbach's CDN script
    const page = withScriptTag(withCdnSetup(await renderedToHtml(html, rendered)), 'js');
    replaceCode({ html: page, script: REACT_NOTE(scriptName), lang: 'js', config: configAsScript(config), mode: 'html' }, null, 'Made into HTML: what React drew, the same classes');
    setFile('html');
  };
  // the project's files, as the tabs list them (VS Code-style icons)
  const fileIcon = (text: string, color: string) => (
    <span className="w-4 shrink-0 text-center font-mono text-[10px] font-bold" style={{ color }} aria-hidden="true">
      {text}
    </span>
  );
  const htmlFile = { id: 'html' as const, name: 'index.html', short: 'HTML', icon: fileIcon('<>', '#e37933') };
  const scriptFile = react
    ? { id: 'script' as const, name: scriptName, short: 'App', icon: fileIcon(lang === 'ts' ? 'TSX' : 'JSX', '#61dafb'), title: scriptName + ': the React component the preview shows' }
    : { id: 'script' as const, name: scriptName, short: lang.toUpperCase(), icon: lang === 'ts' ? fileIcon('TS', '#3178c6') : fileIcon('JS', '#cbcb41') };
  const projectFiles: { id: FileId; name: string; short: string; icon: ReactNode; title?: string; error?: boolean }[] = [
    // a React page's main file is App.jsx: first
    ...(react ? [scriptFile, htmlFile] : [htmlFile, scriptFile]),
    {
      id: 'config',
      name: 'kbach.config.js',
      short: 'Config',
      icon: fileIcon('{}', '#cbcb41'),
      title: react
        ? 'kbach.config.js: colors, breakpoints, dark mode (as in a project: the build plugin reads it)'
        : 'kbach.config.js: colors, breakpoints, dark mode (window.kbachConfig: index.html loads it before Kbach’s CDN script)',
      error: !!parsedConfig.error,
    },
    { id: 'css', name: 'kbach.css', short: 'CSS', icon: fileIcon('#', '#519aba'), title: 'The CSS Kbach generated for your classes (read-only)' },
    { id: 'native', name: 'native-styles.js', short: 'Native', icon: fileIcon('RN', '#58c4dc'), title: 'The style objects @kbach/react-native gives the same classes on a phone (read-only)' },
  ];

  /** Every command, by name, for the palette (what the buttons and menus do, and the editor's own). */
  const editors: Record<FileId, { current: EditorHandle | null }> = { html: htmlEditor, script: scriptEditor, config: configEditor, css: cssEditor, native: nativeEditor };
  const toggleInspect = () => {
    post({ type: 'inspect', on: !inspecting });
    setInspecting(!inspecting);
  };
  const paletteCommands = (): PaletteItem[] => [
    { id: 'run', label: 'Run', hint: 'the page, with your changes', keys: 'Ctrl+Enter', run: runAgain },
    { id: 'reload', label: 'Reload the preview', run: reloadPreview },
    { id: 'autorun', label: autoRun ? 'Turn Auto-run off' : 'Turn Auto-run on', run: () => switchAutoRun(!autoRun) },
    { id: 'format', label: 'Format the file', hint: 'and sort the classes', keys: 'Shift+Alt+F', run: () => void activeEditor()?.format() },
    { id: 'line', label: 'Go to line…', keys: 'Ctrl+G', run: () => activeEditor()?.goToLineBox() },
    { id: 'blank', label: 'New blank page', hint: mode === 'react' ? 'React' : 'HTML', run: () => void blankPage(mode, mode === 'react' ? 'New blank React page' : 'New blank page', true) },
    {
      id: 'mode',
      label: mode === 'react' ? 'Switch to HTML' : 'Switch to React',
      hint: example ? example.name : 'converts this page',
      run: () => void switchMode(mode === 'react' ? 'html' : 'react'),
    },
    { id: 'gallery', label: 'Open the examples', run: () => setGallery(true) },
    { id: 'share', label: 'Share: copy a link to this page', run: share },
    { id: 'download', label: 'Download as a .zip (each file on its own)', run: () => void download() },
    { id: 'tab', label: 'Open the page in a new tab', run: () => void openInTab() },
    { id: 'wrap', label: wrap ? 'Turn word wrap off' : 'Turn word wrap on', keys: 'Alt+Z', run: toggleWrap },
    { id: 'dark', label: dark ? 'Preview in light mode' : 'Preview in dark mode', run: () => setDark((d) => !d) },
    { id: 'inspect', label: inspecting ? 'Stop inspecting' : 'Inspect an element in the preview', run: toggleInspect },
    { id: 'view', label: tab === 'console' ? 'Show the preview' : 'Show the console', run: () => setTab(tab === 'console' ? 'preview' : 'console') },
    ...(phone
      ? []
      : (['left', 'right', 'top', 'bottom'] as const).map((l) => ({
          id: 'layout-' + l,
          label: 'Layout: code ' + (l === 'left' ? 'left' : l === 'right' ? 'right' : l === 'top' ? 'on top' : 'below'),
          run: () => switchLayout(l),
        }))),
    ...(example && edited ? [{ id: 'reset', label: 'Reset ' + example.name, run: () => pickExample(example.id, mode) }] : []),
    ...(lastCode ? [{ id: 'restore', label: 'Restore your last code', run: restoreLastCode }] : []),
    { id: 'keys', label: 'Keyboard shortcuts', run: () => setShortcuts(true) },
    { id: 'back', label: 'Back to the docs', run: goBack },
  ];
  const paletteFiles = (): PaletteItem[] =>
    projectFiles.map((f) => ({
      id: 'file-' + f.id,
      label: f.name,
      hint: f.id === 'css' || f.id === 'native' ? 'made by Kbach, read-only' : undefined,
      icon: f.icon,
      run: () => {
        setFile(f.id);
        requestAnimationFrame(() => editors[f.id].current?.focus());
      },
    }));

  const deviceSize = DEVICES.find((d) => d.id === device)?.size ?? null;
  const dims = deviceSize ? (landscape ? { w: deviceSize.h, h: deviceSize.w } : { w: deviceSize.w, h: deviceSize.h }) : null;
  // A device is drawn at its real size and scaled to fit the panel: the
  // canvas still lays out at e.g. 1280px, so the responsive variants see
  // that width; only the drawing is smaller.
  const scale = dims && panel.w > 0 ? Math.min(1, (panel.w - DEVICE_MARGIN) / dims.w, (panel.h - DEVICE_MARGIN) / dims.h) : 1;
  const sizeLabel = dims ? dims.w + '×' + dims.h : panel.w + '×' + panel.h;
  const ruleCount = css?.ruleCount ?? 0;
  // the file a project gets from the build plugin (read-only: it changes as you edit)
  const cssText = css?.file ?? '';
  // the same classes on React Native: made only while its tab is open, at the
  // picked device's width (a phone's, 390, when the preview fills the panel)
  const nativeWidth = dims?.w ?? 390;
  const native = useMemo(
    // (React: the class lists written in App.jsx, one style object per distinct list)
    () => (file === 'native' && engineReady ? nativeStylesFile(react ? jsxClassMarkup(script) : html, theme, { dark, width: nativeWidth }) : null),
    [file, engineReady, html, script, react, theme, dark, nativeWidth],
  );
  const nativeText = native?.file ?? '';
  const problems = logs.filter((l) => l.level === 'error').length;
  // errors with a line in the script, for the editor to show on those lines
  const runErrors: RunError[] = [...importErrors, ...logs.filter((l) => l.level === 'error' && l.line).map((l) => ({ line: l.line!, message: l.text.replace(/^Uncaught /, '') }))];
  // side by side needs room: in a narrow window it shows stacked (the choice is kept for a wider one)
  const narrow = rootWidth > 0 && rootWidth < SIDE_BY_SIDE_MIN;
  // A phone: the code and the preview each get the whole screen, switched from a bar at the bottom
  const phone = rootWidth > 0 && rootWidth < PHONE_MAX;
  const shownLayout: PaneLayout = narrow ? (layout === 'left' ? 'top' : layout === 'right' ? 'bottom' : layout) : layout;
  /** the editor and the preview sit next to each other (not one above the other) */
  const horizontal = shownLayout === 'left' || shownLayout === 'right';
  /** the preview comes first, the code after it */
  const codeLast = shownLayout === 'right' || shownLayout === 'bottom';
  // a split saved on a wider screen still leaves both panes usable here
  const clampedSplit = horizontal && rootWidth > 0 ? Math.min(splitRange(rootWidth)[1], Math.max(splitRange(rootWidth)[0], split)) : split;
  const fixes = (css?.unknown ?? []).map((cls) => [cls, suggestFor(cls)] as const).filter((f): f is readonly [string, string] => !!f[1]);
  const fixAll = () => {
    setHtml((c) => fixes.reduce((code, [from, to]) => replaceClass(code, from, to), c));
    setScript((c) => fixes.reduce((code, [from, to]) => replaceClass(code, from, to), c));
    setNotice({ text: 'Replaced ' + (fixes.length === 1 ? '1 Tailwind CSS class' : fixes.length + ' Tailwind CSS classes') + ' with Kbach ones', kind: 'ok' });
  };

  return (
    <div ref={rootRef} className={clsx('flex flex-col', fullscreen ? 'fixed inset-0 z-50 bg-page p-2 md:p-3' : 'my-6 h-[calc(100dvh-5.5rem)] min-h-[32rem]')}>
      {/* the project: which code, running it, the layout, export, share. Fits a
          320px phone: the example name truncates, Run and Share drop their words. */}
      <div className="@container mb-2 flex min-w-0 shrink-0 items-center gap-1">
        {/* Kbach's logo: back to the docs (the page the reader came from, else the docs' home) */}
        <button
          type="button"
          onClick={goBack}
          aria-label="Back to the docs"
          title="Back to the Kbach docs"
          className="group flex h-8 shrink-0 items-center gap-2 rounded-lg pr-2 pl-1 transition-colors hover:bg-raised active:bg-raised"
        >
          <ArrowLeftIcon className="text-[13px] text-faint transition-transform group-hover:-translate-x-0.5 group-active:-translate-x-0.5" />
          <Logo source={64} shown={24} className="size-6 rounded-md shadow-xs ring-1 ring-gold/30" />
          <span className="hidden font-display text-[15px] font-semibold text-ink @min-[60rem]:inline">Playground</span>
        </button>
        <span className="mx-0.5 hidden h-5 w-px shrink-0 bg-line @min-[30rem]:block" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          {/* the example the code came from (a dot once it's edited): opens the examples gallery */}
          <button
            type="button"
            onClick={() => setGallery(true)}
            aria-haspopup="dialog"
            title="Examples: open another page made with Kbach"
            className="flex h-8 max-w-full min-w-0 items-center gap-2 rounded-lg px-2 text-[13px] transition-colors hover:bg-raised active:bg-raised"
          >
            <span className="hidden shrink-0 text-muted @min-[30rem]:inline">Examples /</span>
            <span className="min-w-0 truncate font-semibold">{example ? example.name : 'Your page'}</span>
            {(edited || !example) && <span className="size-1.5 shrink-0 rounded-full bg-gold" title="Edited" aria-label="(edited)" />}
            <ChevronDownIcon className="shrink-0 text-[12px] text-faint" />
          </button>
        </div>
        {/* HTML or React: the kind of page (the other kind starts from its first example) */}
        <div role="group" aria-label="Kind of page" className="mr-1 hidden shrink-0 rounded-lg bg-raised p-0.5 text-[12px] font-semibold @min-[40rem]:flex">
          {(['html', 'react'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => switchMode(m)}
              title={m === 'react' ? 'React: write App.jsx, a component with className, run with real React' : 'HTML: write index.html, with an optional script'}
              className={clsx('rounded-md px-2.5 py-1 transition-colors', mode === m ? 'bg-card text-ink shadow-xs' : 'text-muted hover:text-ink active:text-ink')}
            >
              {m === 'react' ? 'React' : 'HTML'}
            </button>
          ))}
        </div>
        {/* the project: layout, ⋯, Share (Run, Auto-run and Reload are the preview's, on its toolbar) */}
        <div className="flex shrink-0 items-center gap-0.5 @min-[30rem]:gap-1">
          {/* phone-wide: no room for it, and only the stacked layouts fit; they're under ⋯ */}
          <div className="hidden @min-[30rem]:block">
            <LayoutMenu layout={layout} shown={shownLayout} narrow={narrow} onChange={switchLayout} />
          </div>
          <MoreMenu
            onBlank={() => {
              blankPage(mode, mode === 'react' ? 'New blank React page' : 'New blank page', true);
              setPhoneView('code');
            }}
            onOpenTab={openInTab}
            onDownload={download}
            onReset={example && edited ? { name: example.name, run: () => pickExample(example.id, mode) } : null}
            onRestore={lastCode ? restoreLastCode : null}
            layout={phone ? undefined : { shown: shownLayout, onChange: switchLayout }}
            kind={{ mode, onChange: switchMode }}
          />
          <button
            type="button"
            onClick={share}
            aria-label={shared ? 'Link copied' : 'Share'}
            title="Copy a link with your code in it"
            className={clsx(
              'flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold whitespace-nowrap transition-colors @min-[30rem]:min-w-[5rem] @min-[30rem]:px-3',
              shared ? 'bg-emerald-6/15 text-emerald-7 dark:text-emerald-4' : 'bg-accent text-accent-ink hover:opacity-90 active:opacity-90',
            )}
          >
            <LinkIcon className="text-[14px] @min-[30rem]:hidden" aria-hidden="true" />
            <span className="hidden @min-[30rem]:inline">{shared ? 'Link copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      <div ref={bodyRef} className={clsx('flex min-h-0 min-w-0 flex-1', horizontal ? (codeLast ? 'flex-row-reverse' : 'flex-row') : codeLast ? 'flex-col-reverse' : 'flex-col')}>
        {/* editor. Not overflow-hidden: only the code area is clipped (to the
          rounded corners), so the shortcut sheet can sit over the edge. min-w-0:
          as a flex item it would otherwise grow to the longest line of code. */}
        <section
          aria-label="Code"
          // on a phone: the whole screen, when the bottom bar shows Code
          style={phone ? undefined : horizontal ? { width: clampedSplit + '%' } : { height: split + '%' }}
          className={clsx(
            '@container relative flex min-h-0 min-w-0 flex-col rounded-md border border-(--ed-border) bg-(--ed-bg) shadow-sm dark:shadow-none',
            phone ? (phoneView === 'code' ? 'flex-1' : 'hidden') : 'shrink-0',
          )}
        >
          <div className="flex min-h-0 flex-1">
            <div className="flex min-w-0 flex-1 flex-col">
              {/* the open files, VS Code's tab bar; fits a phone: short names there */}
              <div className="relative flex h-[35px] min-w-0 shrink-0 items-stretch rounded-t-md bg-(--ed-tabs) pr-2">
                <div role="tablist" aria-label="Files" className="flex min-w-0 shrink items-stretch overflow-x-auto [scrollbar-width:none]">
                  {projectFiles.map((f) => (
                    <FileTab key={f.id} active={file === f.id} onClick={() => setFile(f.id)} title={f.title} badge={f.icon}>
                      {/* the full name when there's room, a short one, then the icon alone on a phone */}
                      <span className="sr-only @min-[50rem]:not-sr-only">{f.name}</span>
                      <span aria-hidden="true" className="hidden @min-[28rem]:inline @min-[50rem]:hidden">
                        {f.short}
                      </span>
                      {f.error && <span className="size-1.5 shrink-0 rounded-full bg-[#f14c4c]" aria-label="(has an error)" />}
                    </FileTab>
                  ))}
                </div>
                <div className="ml-auto flex min-w-0 items-center gap-0.5 @min-[40rem]:gap-1">
                  {file === 'script' && (
                    <div role="group" aria-label="Script language" className="flex shrink-0 rounded-md border border-(--ed-border) p-0.5 text-[11px] font-semibold @min-[40rem]:mr-1">
                      {(['js', 'ts'] as const).map((l) => (
                        <button
                          key={l}
                          type="button"
                          aria-pressed={lang === l}
                          onClick={() => {
                            setLang(l);
                            // an HTML page loads script.js or script.ts: the tag follows the file
                            if (!react) setHtml((h) => renameScriptTag(h, l));
                          }}
                          title={l === 'ts' ? 'TypeScript: types are stripped before it runs' : 'JavaScript'}
                          className={clsx(
                            'rounded px-1.5 py-0.5 transition-colors @min-[40rem]:px-2',
                            lang === l ? 'bg-(--ed-hover) text-(--ed-tab-on-fg)' : 'text-(--ed-muted) hover:text-(--ed-icon-hover) active:text-(--ed-icon-hover)',
                          )}
                        >
                          {react ? (l === 'ts' ? 'TSX' : 'JSX') : l === 'ts' ? 'TS' : 'JS'}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={toggleWrap}
                    aria-pressed={wrap}
                    aria-label="Wrap long lines"
                    title={wrap ? 'Wrapping long lines' : 'Wrap long lines'}
                    className={clsx(
                      'inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-gold',
                      wrap ? 'bg-gold/15 text-accent' : 'text-(--ed-icon) hover:bg-(--ed-hover) hover:text-(--ed-icon-hover) active:bg-(--ed-hover) active:text-(--ed-icon-hover)',
                    )}
                  >
                    <WrapIcon className="text-[15px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => blankPage()}
                    disabled={nothingToClear}
                    aria-label="Clear all"
                    title="Clear all: empty index.html (the page skeleton stays) and the script, and kbach.config.js back to the default. Undo brings it back."
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-(--ed-icon) transition-colors hover:bg-(--ed-hover) hover:text-red-6 focus-visible:outline-2 focus-visible:outline-gold disabled:pointer-events-none disabled:opacity-35 active:bg-(--ed-hover) active:text-red-6"
                  >
                    <TrashIcon className="text-[15px]" />
                  </button>
                  <CopyButton text={file === 'html' ? html : file === 'script' ? script : file === 'config' ? config : file === 'css' ? cssText : nativeText} tone="editor" className="shrink-0" />
                </div>
              </div>
              {/* isolate: CodeMirror's gutter is z-index 200; this keeps it (and the
                other editor layers) under the menus */}
              <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden">
                <KbachEditor
                  ref={htmlEditor}
                  label="HTML with Kbach classes"
                  value={html}
                  onChange={setHtml}
                  lockSkeleton
                  wrap={wrap}
                  docKey={loads}
                  hidden={file !== 'html'}
                  onStatus={file === 'html' ? setStatus : undefined}
                  onRun={runAgain}
                  onNotice={showNotice}
                  recheck={recheckKey}
                  errors={htmlSetupErrors}
                />
                <KbachEditor
                  ref={scriptEditor}
                  label={scriptName}
                  tsPath={PATHS.script(react, lang === 'ts')}
                  onOpenFile={openFileAt}
                  mode={react ? (lang === 'ts' ? 'tsx' : 'jsx') : lang}
                  value={script}
                  onChange={setScript}
                  wrap={wrap}
                  docKey={loads}
                  hidden={file !== 'script'}
                  errors={runErrors}
                  onStatus={file === 'script' ? setStatus : undefined}
                  onRun={runAgain}
                  onNotice={showNotice}
                  recheck={recheckKey}
                />
                <KbachEditor
                  ref={configEditor}
                  label="kbach.config.js"
                  tsPath={PATHS.config}
                  onOpenFile={openFileAt}
                  mode="js"
                  value={config}
                  onChange={setConfig}
                  wrap={wrap}
                  docKey={loads}
                  hidden={file !== 'config'}
                  errors={configErrors}
                  onStatus={file === 'config' ? setStatus : undefined}
                  onRun={runAgain}
                  onNotice={showNotice}
                />
                <KbachEditor
                  ref={cssEditor}
                  label="kbach.css, generated by Kbach (read-only)"
                  mode="css"
                  value={cssText}
                  onChange={() => {}}
                  wrap={wrap}
                  hidden={file !== 'css'}
                  onStatus={file === 'css' ? setStatus : undefined}
                  onRun={runAgain}
                />
                <KbachEditor
                  ref={nativeEditor}
                  label="native-styles.js, the React Native styles Kbach makes (read-only)"
                  mode="native"
                  value={nativeText}
                  onChange={() => {}}
                  wrap={wrap}
                  hidden={file !== 'native'}
                  onStatus={file === 'native' ? setStatus : undefined}
                  onRun={runAgain}
                />
              </div>
            </div>
          </div>
          <StatusBar
            status={status}
            language={
              file === 'html'
                ? 'HTML · Emmet'
                : file === 'css'
                  ? 'CSS · ' + ruleCount + ' rules · read-only'
                  : file === 'native'
                    ? 'React Native · ' + nativeWidth + ' wide · ' + (dark ? 'dark' : 'light') + ' · read-only'
                    : file === 'config'
                      ? 'JavaScript · Kbach config'
                      : react
                        ? 'React · ' + (lang === 'ts' ? 'TSX' : 'JSX')
                        : lang === 'ts'
                          ? 'TypeScript'
                          : 'JavaScript'
            }
            notice={notice}
            fixes={file === 'html' || file === 'script' ? fixes.length : 0}
            onFixAll={fixAll}
            onProblems={() => activeEditor()?.openProblems()}
            onFormat={file === 'css' || file === 'native' ? undefined : () => activeEditor()?.format()}
            onShortcuts={() => setShortcuts((s) => !s)}
          />
          {shortcuts && <ShortcutSheet onClose={() => setShortcuts(false)} />}
        </section>

        {!phone && (
          <Splitter
            vertical={horizontal}
            label="Resize the code and the preview"
            value={split}
            onStart={() => (dragFrom.current = split)}
            onMove={splitPane}
            onStep={(dir) => {
              dragFrom.current = split;
              splitPane(dir * ((horizontal ? bodyRef.current!.clientWidth : bodyRef.current!.clientHeight) * 0.02));
            }}
          />
        )}

        {/* output: as tall as the screen under the docs' navbar (or the rest of
          the full screen). @container: the toolbar lays out by the output's own
          width, not the screen's. It holds how the page is viewed (the view,
          Inspect, dark, the device) and how it runs (Run while Auto-run is off,
          Auto-run, Reload: at the end). Under 36rem (all of it in one row needs about 35rem with Run showing) the canvas controls take a
          row of their own below; device names show from 52rem. */}
        <section
          aria-label="Output"
          className={clsx(
            '@container flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-sm dark:shadow-none',
            'min-h-0 flex-1',
            // (hidden, not removed: the preview keeps running while the phone shows the code)
            phone && phoneView !== 'preview' && 'hidden',
          )}
        >
          <div className="flex shrink-0 flex-wrap items-center gap-x-1 gap-y-1.5 border-b border-line bg-panel px-2 py-1.5">
            <div role="group" aria-label="View" className="flex items-center gap-0.5">
              {(['preview', 'console'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tab === t}
                  onClick={() => setTab(t)}
                  className={clsx(
                    'flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium whitespace-nowrap transition-colors @min-[43rem]:px-3',
                    tab === t ? 'bg-card text-ink shadow-xs ring-1 ring-line' : 'text-muted hover:text-ink active:text-ink',
                  )}
                >
                  {t === 'preview' ? 'Preview' : 'Console'}
                  {t === 'console' && logs.length > 0 && (
                    <span className={clsx('min-w-4 rounded-full px-1 text-center font-mono text-[10px] leading-4', problems ? 'bg-red-6 text-white' : 'bg-line text-muted')}>
                      {problems || logs.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* the canvas controls: their own full-width row when narrow, inline when wide.
              Rotate comes last, so its showing up (a device picked) moves nothing else. */}
            <div className="order-last -mx-2 flex w-[calc(100%+1rem)] items-center gap-0.5 border-t border-line px-2 pt-1.5 @min-[36rem]:order-none @min-[36rem]:mx-0 @min-[36rem]:w-auto @min-[36rem]:border-0 @min-[36rem]:p-0">
              <span className="mx-1 hidden h-5 w-px bg-line @min-[36rem]:block" aria-hidden="true" />
              <button
                type="button"
                onClick={() => {
                  // tell the canvas now, not after the next render: no gap where a click falls through
                  post({ type: 'inspect', on: !inspecting });
                  setInspecting(!inspecting);
                }}
                aria-pressed={inspecting}
                aria-label="Inspect"
                title={inspecting ? 'Stop inspecting (Esc)' : 'Inspect: point at the preview, click an element'}
                className={clsx('grid size-7 place-items-center rounded-md text-[15px] transition-colors', inspecting ? 'bg-gold/15 text-accent' : 'text-faint hover:text-ink active:text-ink')}
              >
                <InspectIcon />
              </button>
              <button
                type="button"
                onClick={() => setDark((d) => !d)}
                aria-label={dark ? 'Preview in light mode' : 'Preview in dark mode'}
                title={dark ? 'Light canvas' : 'Dark canvas'}
                className="grid size-7 place-items-center rounded-md text-[15px] text-faint transition-colors hover:text-ink active:text-ink"
              >
                {dark ? <MoonIcon /> : <SunIcon />}
              </button>
              <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
              <div role="group" aria-label="Canvas size" className="flex items-center gap-0.5">
                {DEVICES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    aria-pressed={device === d.id}
                    aria-label={d.label}
                    title={d.size ? d.label + ', ' + d.size.w + '×' + d.size.h : 'Fill the panel'}
                    onClick={() => setDevice(d.id)}
                    className={clsx(
                      'flex h-7 min-w-7 items-center justify-center gap-1 rounded-md px-1.5 text-[12px] transition-colors @min-[52rem]:px-2',
                      device === d.id ? 'bg-gold/15 text-accent' : 'text-faint hover:text-ink active:text-ink',
                    )}
                  >
                    <d.icon className="text-[14px] @min-[52rem]:text-[13px]" />
                    <span className="hidden @min-[52rem]:inline">{d.label}</span>
                  </button>
                ))}
                {dims && (
                  <button
                    type="button"
                    onClick={() => setLandscape((l) => !l)}
                    aria-pressed={landscape}
                    aria-label={landscape ? 'Rotate to portrait' : 'Rotate to landscape'}
                    title={landscape ? 'Rotate to portrait' : 'Rotate to landscape'}
                    className={clsx('grid size-7 place-items-center rounded-md text-[14px] transition-colors', landscape ? 'bg-gold/15 text-accent' : 'text-faint hover:text-ink active:text-ink')}
                  >
                    <RotateIcon className={clsx('transition-transform duration-300', landscape && 'rotate-90')} />
                  </button>
                )}
              </div>
            </div>

            {/* running it: Run (only while Auto-run is off: the code waits for it), the Auto-run
              switch, Reload. At the end of the first row; last of all when the bar is one row. */}
            <div className="ml-auto flex items-center gap-1 @min-[36rem]:order-last">
              {!autoRun && (
                <button
                  type="button"
                  onClick={runAgain}
                  aria-label={pending ? 'Run (there are changes)' : 'Run'}
                  title={pending ? 'Run your changes (Ctrl+Enter)' : 'Run: a fresh page with your code (Ctrl+Enter)'}
                  className={clsx(
                    'relative flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-[13px] font-semibold transition-colors',
                    pending ? 'bg-gold/15 text-accent ring-1 ring-gold/40' : 'text-ink hover:bg-raised active:bg-raised',
                  )}
                >
                  <PlayIcon className="text-[12px]" />
                  Run
                  {pending && <span className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-gold" aria-hidden="true" />}
                </button>
              )}
              <Switch
                on={autoRun}
                onChange={switchAutoRun}
                label="Auto-run"
                title={
                  autoRun
                    ? 'Auto-run is on: the preview updates as you type. Turn it off to update only when you press Run (Ctrl+Enter)'
                    : 'Auto-run is off: the preview updates when you press Run (Ctrl+Enter). Turn it on to update as you type'
                }
              />
              <button
                type="button"
                onClick={reloadPreview}
                aria-label="Reload"
                title="Reload: the page again, fresh, its script from the top"
                className="grid size-7 shrink-0 place-items-center rounded-md text-[15px] text-faint transition-colors hover:text-ink active:text-ink"
              >
                <ReloadIcon />
              </button>
            </div>
          </div>

          {/* the preview, with the inspector beside it (wide) or under it (narrow) */}
          <div className={clsx('relative min-h-0 flex-1 flex-col @min-[44rem]:flex-row', tab === 'preview' ? 'flex' : 'hidden')}>
            <div className="relative flex min-h-0 min-w-0 flex-1">
              <div
                ref={panelRef}
                className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden bg-panel [background-image:radial-gradient(circle,rgb(127_127_127/0.16)_1px,transparent_1px)] [background-size:16px_16px]"
              >
                {/* One wrapper in both modes, so switching never remounts the iframe. */}
                <div
                  style={dims ? { width: dims.w * scale, height: dims.h * scale } : { width: '100%', height: '100%' }}
                  className={clsx(
                    'relative shrink-0 overflow-hidden transition-[width,height,border-radius] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                    device === 'phone' && 'rounded-[2rem] ring-[6px] ring-scrim/85 shadow-2xl',
                    device === 'tablet' && 'rounded-[1.25rem] ring-[6px] ring-scrim/85 shadow-2xl',
                    device === 'desktop' && 'rounded-lg ring-1 ring-line shadow-2xl',
                  )}
                >
                  <iframe
                    ref={frame}
                    title="Playground canvas"
                    sandbox={CANVAS_SANDBOX}
                    allow="clipboard-write *"
                    key={canvasKey}
                    srcDoc={srcDoc}
                    style={dims ? { width: dims.w + 'px', height: dims.h + 'px', transform: 'scale(' + scale + ')', transformOrigin: 'top left' } : { width: '100%', height: '100%' }}
                    className="absolute left-0 top-0 border-0 bg-white transition-transform will-change-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                </div>
              </div>
              {!engineReady && <div className="absolute inset-0 grid place-items-center text-sm text-faint">Loading the engine…</div>}
              {(gone || (inspecting && !picked)) && (
                <p role="status" className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 rounded-full bg-scrim/80 px-3 py-1 text-xs whitespace-nowrap text-white shadow-lg">
                  {gone ? 'The element you picked left the page' : 'Click an element to inspect it · Esc to stop'}
                </p>
              )}
              <span className="pointer-events-none absolute right-3 bottom-2 rounded-md bg-scrim/60 px-2 py-0.5 font-mono text-[11px] text-white/80">
                {sizeLabel}
                {scale < 1 ? ' · ' + Math.round(scale * 100) + '%' : ''}
              </span>
            </div>
            {picked && (
              <div className="flex h-[46%] min-h-0 shrink-0 flex-col border-t border-line @min-[44rem]:h-auto @min-[44rem]:w-80 @min-[44rem]:border-t-0 @min-[44rem]:border-l">
                <Inspector
                  info={picked}
                  inSource={mode === 'react' ? !!reactLiteral : !!pickedSource}
                  sourceFile={mode === 'react' ? scriptName : 'index.html'}
                  readOnlyReason={
                    mode === 'react'
                      ? 'Its classes are built in ' +
                        scriptName +
                        ' (cn(), a variable or state), or the same className is written in more than one place, so they can’t be changed from here: change them in the code. They can still be switched off here.'
                      : 'The script made this element, so it isn’t in index.html. Its classes can still be switched off here.'
                  }
                  onClose={closeInspector}
                  onSelect={selectTrail}
                  onHover={(trail) => post({ type: 'highlight-trail', trail })}
                  onToggleClass={(cls, on) => post({ type: 'toggle-class', cls, on })}
                  onAddClass={(cls) => editPickedClasses((t) => (t.includes(cls) ? t : [...t, cls]))}
                  onRemoveClass={(cls) => editPickedClasses((t) => t.filter((c) => c !== cls))}
                  onReplaceClass={(from, to) => editPickedClasses((t) => t.map((c) => (c === from ? to : c)))}
                  onSetClasses={(remove, add) => editPickedClasses((t) => applyChange(t, remove, add))}
                  onGoToCode={goToCode}
                />
              </div>
            )}
          </div>

          <div className={clsx('min-h-0 flex-1 flex-col bg-code', tab === 'console' ? 'flex' : 'hidden')}>
            <ConsolePanel
              logs={logs}
              file={scriptName}
              onClear={() => setLogs([])}
              onEval={evaluate}
              onJump={(line) => {
                setFile('script');
                setPhoneView('code');
                requestAnimationFrame(() => scriptEditor.current?.goToLine(line));
              }}
            />
          </div>
        </section>
      </div>
      {phone && (
        <PhoneBar
          view={phoneView}
          onView={setPhoneView}
          problems={(css?.unknown.length ?? 0) + configErrors.length + htmlSetupErrors.length + importErrors.length}
          errors={problems}
          editor={phoneView === 'code' && file !== 'css' && file !== 'native' ? activeEditor : null}
        />
      )}
      {palette && <CommandPalette start={palette} commands={paletteCommands} files={paletteFiles} onClose={() => setPalette(null)} />}
      {gallery && (
        <ExamplesGallery
          current={exampleId}
          mode={mode}
          edited={edited || (!example && !nothingToClear)}
          onPick={(id, kind) => {
            setGallery(false);
            if (id !== exampleId || kind !== mode || edited) pickExample(id, kind);
            // on a phone, see what was picked first
            setPhoneView('preview');
          }}
          onBlank={(kind) => {
            setGallery(false);
            blankPage(kind, kind === 'react' ? 'New blank React page' : 'New blank page', true);
            // on a phone, straight to the code to write
            setPhoneView('code');
          }}
          onClose={() => setGallery(false)}
        />
      )}
    </div>
  );
}
