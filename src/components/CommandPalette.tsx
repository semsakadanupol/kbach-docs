'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { clsx } from '@kbach/react';

// The playground's command palette (2026-11-27), as VS Code's: Ctrl+Shift+P (or F1) lists every
// command by name, Ctrl+P the files. Typing filters (every word must appear, in any order); ↑ ↓
// move, Enter runs, Esc closes. As in VS Code, a ">" at the start turns the file list into the
// commands, and deleting it turns them back into the files.

export interface PaletteItem {
  id: string;
  label: string;
  /** a group or a short note, on the right */
  hint?: string;
  /** its shortcut, shown as keys */
  keys?: string;
  icon?: ReactNode;
  run: () => void;
}

export function CommandPalette({
  start,
  commands,
  files,
  onClose,
}: {
  /** what opened it: Ctrl+Shift+P (commands) or Ctrl+P (files) */
  start: 'commands' | 'files';
  /** the lists, made once as it opens (the commands' names say what each would do now) */
  commands: () => PaletteItem[];
  files: () => PaletteItem[];
  onClose: () => void;
}) {
  const [lists] = useState(() => ({ commands: commands(), files: files() }));
  const [query, setQuery] = useState(start === 'commands' ? '>' : '');
  const [at, setAt] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const commandMode = query.startsWith('>');
  const words = (commandMode ? query.slice(1) : query).toLowerCase().split(/\s+/).filter(Boolean);
  const shown = useMemo(
    () => (commandMode ? lists.commands : lists.files).filter((c) => words.every((w) => (c.label + ' ' + (c.hint ?? '')).toLowerCase().includes(w))),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- words come from query
    [commandMode, lists, query],
  );

  useEffect(() => input.current?.focus(), []);
  // the highlighted row stays in view
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [at]);

  const run = (item: PaletteItem | undefined) => {
    if (!item) return;
    onClose();
    // after the palette is gone, so the command can move the focus
    requestAnimationFrame(() => item.run());
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-center px-3 pt-[12vh]" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        role="dialog"
        aria-label={commandMode ? 'Command palette' : 'Go to file'}
        className="flex max-h-[min(28rem,70vh)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-(--ed-widget-border) bg-(--ed-widget) text-(--ed-widget-fg) shadow-2xl shadow-black/40 motion-safe:animate-[kbd-fade_120ms_ease-out]"
      >
        <input
          ref={input}
          value={query}
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={shown[at] ? 'palette-' + shown[at].id : undefined}
          placeholder={commandMode ? 'Type a command' : 'Search files by name (type > for commands)'}
          onChange={(e) => {
            setQuery(e.target.value);
            setAt(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              onClose();
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              setAt((i) => Math.min(shown.length - 1, i + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setAt((i) => Math.max(0, i - 1));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              run(shown[at]);
            }
          }}
          className="m-2 rounded-md border border-(--ed-match) bg-(--ed-bg) px-3 py-2 font-mono text-[13px] text-(--ed-fg) outline-none"
        />
        <ul ref={listRef} id="palette-list" role="listbox" aria-label={commandMode ? 'Commands' : 'Files'} className="min-h-0 overflow-y-auto pb-2">
          {shown.length === 0 && <li className="px-4 py-2 text-[13px] text-(--ed-muted)">{commandMode ? 'No commands match' : 'No files match'}</li>}
          {shown.map((c, i) => (
            <li
              key={c.id}
              id={'palette-' + c.id}
              role="option"
              aria-selected={i === at}
              onMouseMove={() => setAt(i)}
              onClick={() => run(c)}
              className={clsx('mx-1.5 flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px]', i === at && 'bg-(--ed-pick) text-(--ed-pick-fg)')}
            >
              {c.icon && <span className="grid w-5 shrink-0 place-items-center">{c.icon}</span>}
              <span className="min-w-0 flex-1 truncate">{c.label}</span>
              {c.hint && <span className="shrink-0 text-[12px] opacity-60">{c.hint}</span>}
              {c.keys && <kbd className="shrink-0 rounded border border-(--ed-widget-border) px-1.5 font-mono text-[11px] opacity-80">{c.keys}</kbd>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
