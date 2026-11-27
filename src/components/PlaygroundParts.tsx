import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { clsx } from '@kbach/react';
import type { EditorHandle, EditorStatus } from './KbachEditor';
import type { PlaygroundMode } from '../playground/share';
import { CheckIcon, CodeIcon, DotsIcon, DownloadIcon, ExternalIcon, FileIcon, HistoryIcon, KeyboardIcon, PanesIcon, PlayIcon, ResetIcon, SparklesIcon } from './icons';

// The playground's smaller pieces: file tabs, the console, the examples
// menu, the editor's status bar, the drag handle between panes, and the
// keyboard shortcut sheet.

export function FileTab({ active, onClick, badge, children, title }: { active: boolean; onClick: () => void; badge: ReactNode; children: ReactNode; title?: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      title={title}
      // VS Code's editor tabs: the open one joins the editor, a blue line on top
      className={clsx(
        'relative flex shrink-0 items-center gap-1.5 border-r border-(--ed-tabs) px-1.5 font-sans text-[13px] transition-colors @min-[28rem]:px-2 @min-[50rem]:px-3',
        active ? 'bg-(--ed-bg) text-(--ed-tab-on-fg)' : 'bg-(--ed-tab) text-(--ed-tab-fg) hover:text-(--ed-icon-hover) active:text-(--ed-icon-hover)',
      )}
    >
      {badge}
      {children}
      <span className={clsx('absolute inset-x-0 top-0 h-px', active ? 'bg-gold' : 'bg-transparent')} />
    </button>
  );
}

// --- console -------------------------------------------------------------------
export interface LogLine {
  level: 'log' | 'info' | 'warn' | 'error' | 'input' | 'result';
  text: string;
  line?: number | null;
}

const LEVEL_STYLE: Record<LogLine['level'], string> = {
  log: 'text-[#e3ded1]',
  info: 'text-[#8fc7d9]',
  warn: 'bg-amber-6/8 text-[#e2c27f]',
  error: 'bg-red-6/10 text-[#ee9f9f]',
  input: 'text-[#a9b6bb]',
  result: 'text-[#b9d08f]',
};
const LEVEL_MARK: Partial<Record<LogLine['level'], string>> = { input: '›', result: '‹' };

/**
 * What the script logged, its errors (a click on "script.js:12" goes to the
 * line), and a prompt that runs JavaScript in the page, like a browser's
 * console: ↑ and ↓ go through what was typed before.
 */
export function ConsolePanel({
  logs,
  file,
  onClear,
  onEval,
  onJump,
}: {
  logs: LogLine[];
  file: string;
  onClear: () => void;
  onEval: (code: string) => void;
  onJump: (line: number) => void;
}) {
  const end = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const history = useRef<string[]>([]);
  const back = useRef(-1);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [logs]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      history.current.push(input);
      back.current = -1;
      onEval(input);
      setInput('');
    } else if (e.key === 'ArrowUp' && history.current.length) {
      e.preventDefault();
      back.current = back.current < 0 ? history.current.length - 1 : Math.max(0, back.current - 1);
      setInput(history.current[back.current]);
    } else if (e.key === 'ArrowDown' && back.current >= 0) {
      e.preventDefault();
      back.current = back.current + 1 >= history.current.length ? -1 : back.current + 1;
      setInput(back.current < 0 ? '' : history.current[back.current]);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      onClear();
    }
  };

  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto py-1 font-mono text-[12.5px] leading-5">
        {logs.length === 0 ? (
          <p className="px-4 py-3 font-sans text-sm text-[#7f9198]">Nothing logged yet. console.log() in the script shows up here, and so do its errors. Type JavaScript below to run it in the page.</p>
        ) : (
          logs.map((l, i) => (
            <div key={i} className={clsx('flex gap-2 border-b border-white/5 px-4 py-1', LEVEL_STYLE[l.level])}>
              <span className="w-2.5 shrink-0 text-[#5f7077]" aria-hidden="true">
                {LEVEL_MARK[l.level] ?? ''}
              </span>
              <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">{l.text}</span>
              {l.line ? (
                <button type="button" onClick={() => onJump(l.line!)} className="shrink-0 text-[#7f9198] underline-offset-2 hover:text-[#cfd6d8] hover:underline active:text-[#cfd6d8] active:underline" title="Go to this line">
                  {file}:{l.line}
                </button>
              ) : null}
            </div>
          ))
        )}
        <div ref={end} />
      </div>
      <div className="flex shrink-0 items-center gap-2 border-t border-white/5 pl-4 pr-2">
        <span className="font-mono text-[13px] text-gold" aria-hidden="true">
          ›
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Run JavaScript in the page"
          placeholder="document.querySelectorAll('button').length"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          className="h-9 min-w-0 flex-1 bg-transparent font-mono text-[12.5px] text-[#e3ded1] outline-none placeholder:text-[#5f7077]"
        />
        <button type="button" onClick={onClear} title="Clear (Ctrl+L)" className="rounded px-2 py-0.5 text-xs text-[#9aa8ae] hover:bg-white/10 hover:text-[#ece6d8] active:bg-white/10 active:text-[#ece6d8]">
          Clear
        </button>
      </div>
    </>
  );
}

// --- the editor's status bar -------------------------------------------------------
/** A short message in the status bar, with an optional action ("Undo"). */
export interface Notice {
  text: string;
  kind: 'ok' | 'error';
  action?: { label: string; run: () => void };
}

export function StatusBar({
  status,
  language,
  notice,
  onProblems,
  onFormat,
  onShortcuts,
  fixes = 0,
  onFixAll,
}: {
  status: EditorStatus | null;
  language: string;
  notice: Notice | null;
  onProblems: () => void;
  /** Tailwind CSS classes in the code that have a Kbach name: one click replaces them all */
  fixes?: number;
  onFixAll?: () => void;
  /** none for a read-only file */
  onFormat?: () => void;
  onShortcuts: () => void;
}) {
  const problems = status ? status.errors + status.warnings : 0;
  return (
    // the status bar, as VS Code lays it out, in Kbach's gold (dark text: white on gold is too faint)
    <div className="flex h-6 shrink-0 items-center gap-3 rounded-b-md bg-gold px-3 font-sans text-[12px] text-[#1f1a10]">
      {status && (
        // a narrow bar with a message gives Ln/Col's room to the message
        <span className={clsx('whitespace-nowrap tabular-nums', notice && '@max-[40rem]:hidden')} aria-live="off">
          Ln {status.line}, Col {status.col}
          {status.selected > 0 && <span className="@max-[40rem]:hidden"> ({status.selected} selected)</span>}
          {status.cursors > 1 && <span className="@max-[40rem]:hidden"> · {status.cursors} cursors</span>}
        </span>
      )}
      <button
        type="button"
        onClick={onProblems}
        title={problems ? 'Show the problems' : 'No problems'}
        className={clsx('flex items-center gap-1 rounded px-1 transition-colors hover:bg-black/10 active:bg-black/10', problems && 'font-semibold')}
      >
        <span aria-hidden="true">⚠</span>
        {status?.warnings ?? 0}
        <span className="ml-1" aria-hidden="true">
          ✕
        </span>
        {status?.errors ?? 0}
        <span className="sr-only"> problems</span>
      </button>
      {fixes > 0 && onFixAll && (
        <button
          type="button"
          onClick={onFixAll}
          title="Replace each Tailwind CSS class with its Kbach name"
          className="shrink-0 rounded bg-black/15 px-1.5 font-sans font-semibold whitespace-nowrap transition-colors hover:bg-black/25 active:bg-black/25"
        >
          Fix {fixes === 1 ? '1 class' : 'all ' + fixes}
        </button>
      )}
      {notice && (
        <span role="status" className="flex min-w-0 items-center gap-2 font-sans @max-[40rem]:mr-auto">
          <span className={clsx('min-w-0 truncate', notice.kind === 'error' ? 'rounded bg-[#c72e0f] px-1.5 font-semibold text-white' : '')}>{notice.text}</span>
          {notice.action && (
            <button type="button" onClick={notice.action.run} className="shrink-0 rounded bg-black/15 px-1.5 font-semibold hover:bg-black/25 active:bg-black/25">
              {notice.action.label}
            </button>
          )}
        </span>
      )}
      <span className="ml-auto whitespace-nowrap @max-[40rem]:hidden">{language}</span>
      <span className="whitespace-nowrap @max-[48rem]:hidden">Spaces: 2</span>
      {onFormat && (
      <button
        type="button"
        onClick={onFormat}
        title="Format, and sort the classes (Shift+Alt+F)"
        className={clsx('flex items-center gap-1 rounded px-1 font-sans transition-colors hover:bg-black/10 @max-[40rem]:ml-auto active:bg-black/10', notice?.action && '@max-[40rem]:hidden')}
      >
        <SparklesIcon className="text-[12px]" /> Format
      </button>
      )}
      <button type="button" onClick={onShortcuts} aria-label="Keyboard shortcuts" title="Keyboard shortcuts" className="grid size-5 place-items-center rounded transition-colors hover:bg-black/10 active:bg-black/10">
        <KeyboardIcon className="text-[13px]" />
      </button>
    </div>
  );
}

// --- a drag handle between two panes ---------------------------------------------------
/**
 * Drag (or focus it and use the arrow keys) to resize. `vertical` is a bar
 * between side-by-side panes. `onMove` gets the pointer's distance moved
 * since the drag began, in pixels.
 */
export function Splitter({
  vertical,
  label,
  value,
  onStart,
  onMove,
  onStep,
  className,
}: {
  vertical: boolean;
  label: string;
  value: number;
  onStart: () => void;
  onMove: (delta: number) => void;
  onStep: (dir: 1 | -1) => void;
  className?: string;
}) {
  const start = useRef(0);
  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = vertical ? e.clientX : e.clientY;
    onStart();
    document.documentElement.style.cursor = vertical ? 'col-resize' : 'row-resize';
    document.documentElement.style.userSelect = 'none';
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    onMove((vertical ? e.clientX : e.clientY) - start.current);
  };
  const up = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    document.documentElement.style.cursor = '';
    document.documentElement.style.userSelect = '';
  };
  return (
    <div
      role="separator"
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      aria-label={label}
      aria-valuenow={Math.round(value)}
      tabIndex={0}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onKeyDown={(e) => {
        const dir = (vertical ? { ArrowLeft: -1, ArrowRight: 1 } : { ArrowUp: -1, ArrowDown: 1 })[e.key as 'ArrowUp'] as 1 | -1 | undefined;
        if (dir) {
          e.preventDefault();
          onStep(dir);
        }
      }}
      className={clsx(
        'group grid shrink-0 touch-none place-items-center outline-none',
        vertical ? 'w-3 cursor-col-resize' : 'h-4 cursor-row-resize',
        className,
      )}
    >
      <span
        className={clsx(
          'rounded-full bg-line transition-colors group-hover:bg-gold group-focus-visible:bg-gold group-active:bg-gold',
          vertical ? 'h-10 w-1' : 'h-1 w-10',
        )}
      />
    </div>
  );
}

// --- keyboard shortcuts --------------------------------------------------------------
const SHORTCUTS: [string, string][] = [
  ['Ctrl+Shift+P, F1', 'Command palette: every command, by name'],
  ['Ctrl+P', 'Go to a file'],
  ['Ctrl+Space', 'Suggest classes, tags, names and imports'],
  ['Ctrl+Shift+Space', 'Show the parameters of the call'],
  ['F12, Ctrl+click', 'Go to the definition'],
  ['F2', 'Rename everywhere in the file'],
  ['Tab', 'Expand an Emmet abbreviation (ul>li*3), else indent'],
  ['Ctrl+Shift+A', 'Wrap the selection in an Emmet abbreviation'],
  ['Shift+Alt+F', 'Format, and sort the classes'],
  ['Ctrl+Enter, Ctrl+S', 'Run the page again'],
  ['Ctrl+F', 'Find and replace'],
  ['Ctrl+G', 'Go to line'],
  ['Ctrl+D', 'Select the next match too'],
  ['Ctrl+Shift+L', 'Select every match'],
  ['Alt+click, Ctrl+Alt+↑ / ↓', 'Add a cursor'],
  ['Alt+↑ / Alt+↓', 'Move the line'],
  ['Shift+Alt+↑ / ↓', 'Copy the line'],
  ['Ctrl+Shift+K', 'Delete the line'],
  ['Ctrl+/', 'Comment or uncomment'],
  ['Ctrl+[ / Ctrl+]', 'Indent less / more'],
  ['Ctrl+Shift+[ / ]', 'Fold / unfold'],
  ['Ctrl+I', 'Select the enclosing tag or block'],
  ['Ctrl+Z / Ctrl+Shift+Z', 'Undo / redo'],
];

export function ShortcutSheet({ onClose }: { onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    box.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [onClose]);
  return (
    <div
      ref={box}
      role="dialog"
      aria-label="Keyboard shortcuts"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
      className="absolute right-2 bottom-9 z-20 max-h-[min(26rem,70vh)] w-[min(24rem,calc(100%-1rem))] overflow-auto rounded-xl border border-(--ed-widget-border) bg-(--ed-widget) p-3 text-(--ed-widget-fg) shadow-2xl shadow-black/40 outline-none"
    >
      <p className="mb-2 text-xs font-semibold tracking-wider text-(--ed-muted) uppercase">Keyboard shortcuts</p>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[12.5px]">
        {SHORTCUTS.map(([keys, what]) => (
          <div key={keys} className="contents">
            <dt className="font-mono text-[11.5px] whitespace-nowrap text-(--ed-keys)">{keys}</dt>
            <dd className="text-(--ed-fg)">{what}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[11px] text-(--ed-muted)">On a Mac, Cmd for Ctrl and Option for Alt.</p>
    </div>
  );
}

// --- more: export, reset, restore -----------------------------------------------
/**
 * The header's overflow menu: open the page in a tab of its own, download it
 * as one HTML file, put the example back as it was, and bring back the code
 * from an earlier visit (every visit starts from the first example).
 */
export function MoreMenu({
  onBlank,
  onOpenTab,
  onDownload,
  onReset,
  onRestore,
  layout,
  kind,
}: {
  /** an empty page of the kind open now (at the top: the quickest way to start from nothing) */
  onBlank: () => void;
  /** only in a narrow header, which has no room for the full-screen button */
  onOpenTab: () => void;
  onDownload: () => void;
  /** the example's name, when the code is an edited example */
  onReset: { name: string; run: () => void } | null;
  onRestore: (() => void) | null;
  /** in a phone-wide header (no room for the Layout button): its two stacked layouts, here */
  layout?: { shown: PaneLayout; onChange: (l: PaneLayout) => void };
  /** HTML or React: in the header from 40rem, here below that */
  kind?: { mode: PlaygroundMode; onChange: (m: PlaygroundMode) => void };
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    first.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);
  const item = 'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] text-ink outline-none hover:bg-raised focus-visible:bg-raised active:bg-raised';
  const act = (fn: () => void) => () => {
    fn();
    setOpen(false);
  };
  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More"
        title="New blank page, open in a new tab, download, reset"
        onClick={() => setOpen((o) => !o)}
        className={clsx('grid size-8 place-items-center rounded-lg text-[16px] transition-colors', open ? 'bg-raised text-ink' : 'text-muted hover:bg-raised hover:text-ink active:bg-raised active:text-ink')}
      >
        <DotsIcon />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="More"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              setOpen(false);
            }
          }}
          className="absolute top-full right-0 z-20 mt-1.5 w-64 rounded-xl border border-line bg-card p-1 shadow-xl"
        >
          <button ref={first} type="button" role="menuitem" onClick={act(onBlank)} className={item}>
            <FileIcon className="shrink-0 text-faint" /> New blank page
          </button>
          <div className="my-1 border-t border-line" />
          <button type="button" role="menuitem" onClick={act(onOpenTab)} className={item}>
            <ExternalIcon className="shrink-0 text-faint" /> Open in a new tab
          </button>
          <button type="button" role="menuitem" onClick={act(onDownload)} className={item}>
            <DownloadIcon className="shrink-0 text-faint" /> Download as a .zip
          </button>
          {layout && (
            <div className="@min-[30rem]:hidden">
              <div className="my-1 border-t border-line" />
              {LAYOUTS.filter((l) => l.id === 'top' || l.id === 'bottom').map((l) => (
                <button key={l.id} type="button" role="menuitemradio" aria-checked={layout.shown === l.id} onClick={act(() => layout.onChange(l.id))} className={item}>
                  <PanesIcon code={l.id} className="shrink-0 text-faint" /> <span className="flex-1">{l.label}</span>
                  {layout.shown === l.id && <CheckIcon className="shrink-0 text-accent" />}
                </button>
              ))}
            </div>
          )}
          {kind && (
            <div className="@min-[40rem]:hidden" role="group" aria-label="Kind of page">
              <div className="my-1 border-t border-line" />
              {(['html', 'react'] as const).map((m) => (
                <button key={m} type="button" role="menuitemradio" aria-checked={kind.mode === m} onClick={act(() => kind.onChange(m))} className={item}>
                  <CodeIcon className={clsx('shrink-0', m === 'react' ? 'text-[#61dafb]' : 'text-faint')} />
                  <span className="flex-1">{m === 'html' ? 'HTML page' : 'React app (JSX)'}</span>
                  {kind.mode === m && <CheckIcon className="shrink-0 text-accent" />}
                </button>
              ))}
            </div>
          )}
          {(onReset || onRestore) && <div className="my-1 border-t border-line" />}
          {onReset && (
            <button type="button" role="menuitem" onClick={act(onReset.run)} className={item}>
              <ResetIcon className="shrink-0 text-faint" /> Reset {onReset.name}
            </button>
          )}
          {onRestore && (
            <button type="button" role="menuitem" onClick={act(onRestore)} className={item}>
              <HistoryIcon className="shrink-0 text-faint" /> Restore your last code
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Where the code sits; the preview takes the other side. */
export type PaneLayout = 'left' | 'right' | 'top' | 'bottom';
const LAYOUTS: { id: PaneLayout; label: string }[] = [
  { id: 'left', label: 'Code left, preview right' },
  { id: 'right', label: 'Preview left, code right' },
  { id: 'top', label: 'Code on top, preview below' },
  { id: 'bottom', label: 'Preview on top, code below' },
];

/**
 * The header's layout menu: the code and the preview side by side (either way
 * round) or one above the other. `narrow`: no room side by side, so only the
 * stacked ones can be picked (a side-by-side choice shows stacked until there is).
 */
export function LayoutMenu({ layout, shown, narrow, onChange }: { layout: PaneLayout; shown: PaneLayout; narrow: boolean; onChange: (l: PaneLayout) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const current = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    // the layout showing: always one that can be picked (in a narrow window a saved
    // side-by-side one is disabled, and focus can't land on it)
    current.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    // Esc closes it wherever the focus is
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Layout"
        title="Layout: where the code and the preview go"
        onClick={() => setOpen((o) => !o)}
        className={clsx('grid size-8 place-items-center rounded-lg text-[16px] transition-colors', open ? 'bg-raised text-ink' : 'text-muted hover:bg-raised hover:text-ink active:bg-raised active:text-ink')}
      >
        <PanesIcon code={shown} />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Layout"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              setOpen(false);
            }
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]:not(:disabled)')];
              const i = items.indexOf(document.activeElement as HTMLButtonElement);
              items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus();
            }
          }}
          className="absolute top-full right-0 z-20 mt-1.5 w-64 rounded-xl border border-line bg-card p-1 shadow-xl"
        >
          {LAYOUTS.map((l) => {
            const disabled = narrow && (l.id === 'left' || l.id === 'right');
            return (
              <button
                key={l.id}
                ref={l.id === shown ? current : undefined}
                type="button"
                role="menuitemradio"
                aria-checked={l.id === layout}
                disabled={disabled}
                title={disabled ? 'Needs a wider window' : undefined}
                onClick={() => {
                  onChange(l.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] text-ink outline-none hover:bg-raised focus-visible:bg-raised disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent active:bg-raised disabled:active:bg-transparent"
              >
                <PanesIcon code={l.id} className="shrink-0 text-[16px] text-faint" />
                <span className="flex-1">{l.label}</span>
                {l.id === layout && <CheckIcon className="shrink-0 text-accent" />}
              </button>
            );
          })}
          {narrow && <p className="px-2.5 pt-1 pb-1.5 text-[11.5px] text-faint">Side by side needs a wider window.</p>}
        </div>
      )}
    </div>
  );
}

/** An on/off switch with its label (the header's "Auto-run" switch). */
export function Switch({ on, onChange, label, title }: { on: boolean; onChange: (on: boolean) => void; label: string; title: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      title={title}
      className="flex h-7 shrink-0 items-center gap-1 rounded-md px-1 text-[12px] font-medium text-muted transition-colors hover:bg-raised hover:text-ink @min-[30rem]:gap-1.5 @min-[30rem]:px-1.5 active:bg-raised active:text-ink"
    >
      <span className={clsx('relative h-4 w-7 shrink-0 rounded-full transition-colors', on ? 'bg-gold' : 'bg-line')}>
        <span className={clsx('absolute top-0.5 size-3 rounded-full bg-white shadow transition-transform', on ? 'translate-x-3.5' : 'translate-x-0.5')} />
      </span>
      {label}
    </button>
  );
}

/** Keys a phone's keyboard keeps a tap or two away, for HTML, JSX and classes. */
const PHONE_KEYS = ['<', '>', '/', '"', '=', '-', ':', '{', '}', '(', ')', '.'];

/**
 * The playground on a phone (added 2026-11-26): Code or Preview fill the screen, picked
 * here; while the code shows, a row of keys a phone keyboard hides (Tab expands Emmet). The
 * keys keep the editor's focus (pointerdown is cancelled), so the keyboard stays up.
 */
export function PhoneBar({
  view,
  onView,
  problems,
  errors,
  editor,
}: {
  view: 'code' | 'preview';
  onView: (v: 'code' | 'preview') => void;
  /** unknown classes and config errors, on the Code button */
  problems: number;
  /** console errors, on the Preview button */
  errors: number;
  /** the editor the keys type into, or null to hide them */
  editor: (() => EditorHandle | null | undefined) | null;
}) {
  const keep = (e: ReactPointerEvent) => e.preventDefault();
  const key = 'h-10 min-w-10 shrink-0 rounded-lg bg-card px-2 font-mono text-[15px] text-ink shadow-xs ring-1 ring-line active:bg-raised';
  const tab = (on: boolean) =>
    clsx(
      'flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors',
      on ? 'bg-card text-ink shadow-sm ring-1 ring-line' : 'text-muted active:bg-card/60',
    );
  const badge = (n: number, danger: boolean) =>
    n > 0 && <span className={clsx('min-w-5 rounded-full px-1.5 text-center font-mono text-[11px] leading-5', danger ? 'bg-red-6 text-white' : 'bg-amber-6/20 text-amber-9 dark:text-amber-3')}>{n}</span>;
  return (
    <div className="shrink-0 pt-2 pb-[env(safe-area-inset-bottom)]">
      {editor && (
        <div role="toolbar" aria-label="Keys" className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
          <button type="button" onPointerDown={keep} onClick={() => editor()?.tab()} className={clsx(key, 'font-sans text-[13px] font-semibold')} aria-label="Tab (expands Emmet)">
            Tab
          </button>
          {PHONE_KEYS.map((k) => (
            <button key={k} type="button" onPointerDown={keep} onClick={() => editor()?.insert(k)} className={key} aria-label={'Type ' + k}>
              {k}
            </button>
          ))}
        </div>
      )}
      <nav aria-label="Playground view" className="grid grid-cols-2 gap-1 rounded-2xl bg-raised p-1">
        <button type="button" aria-pressed={view === 'code'} onClick={() => onView('code')} className={tab(view === 'code')}>
          <CodeIcon /> Code {badge(problems, false)}
        </button>
        <button type="button" aria-pressed={view === 'preview'} onClick={() => onView('preview')} className={tab(view === 'preview')}>
          <PlayIcon className="text-[13px]" /> Preview {badge(errors, true)}
        </button>
      </nav>
    </div>
  );
}
