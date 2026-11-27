/// <reference lib="webworker" />
// The playground's TypeScript service (2026-11-27): TypeScript's own language service, as VS Code
// runs it, in a worker so typing never waits for it. Its files: the lib and type files from
// /ts/files.json (scripts/ts-files.mjs: the DOM, React, @kbach/react, the installed versions)
// and the reader's files (index.ts's sync: App.jsx, script.ts, kbach.config.js, …).
//
// Requests are { id, method, args }; the answer is { id, result } or { id, error }.
import ts from 'typescript';
import { createSystem, createVirtualTypeScriptEnvironment, type VirtualTypeScriptEnvironment } from '@typescript/vfs';
import { COMPILER_OPTIONS } from './options';

let env: VirtualTypeScriptEnvironment | null = null;
const project = new Set<string>();

const text = (parts?: ts.SymbolDisplayPart[]) => ts.displayPartsToString(parts ?? []);
const tagText = (tags?: ts.JSDocTagInfo[]) => (tags ?? []).map((t) => '@' + t.name + (t.text ? ' ' + text(t.text) : '')).join('\n');
const isTs = (path: string) => /\.tsx?$/.test(path);

const methods = {
  async init(filesUrl: string) {
    const files = (await (await fetch(filesUrl)).json()) as Record<string, string>;
    const map = new Map(Object.entries(files));
    env = createVirtualTypeScriptEnvironment(createSystem(map), [], ts, COMPILER_OPTIONS(ts));
    // the first suggestion with auto-imports builds an index of every package's exports, which
    // takes a moment: build it now, before anyone is typing
    const warm = '/__warm-up.tsx';
    const warmCode = "import React from 'react';\nimport { clsx } from '@kbach/react';\nu";
    env.createFile(warm, warmCode);
    env.languageService.getCompletionsAtPosition(warm, warmCode.length, { includeCompletionsForModuleExports: true, includeCompletionsWithInsertText: true });
    env.deleteFile(warm);
    return true;
  },

  /** A file of the reader's, new or changed (the whole text). */
  set(path: string, content: string) {
    const e = env!;
    // (the environment can't hold an empty file)
    const body = content || ' ';
    if (project.has(path)) e.updateFile(path, body);
    else {
      e.createFile(path, body);
      project.add(path);
    }
    return true;
  },

  remove(path: string) {
    if (!project.has(path)) return true;
    env!.deleteFile(path);
    project.delete(path);
    return true;
  },

  completions(path: string, pos: number) {
    const info = env!.languageService.getCompletionsAtPosition(path, pos, {
      includeCompletionsForModuleExports: true,
      includeCompletionsForImportStatements: true,
      includeCompletionsWithInsertText: true,
      includeAutomaticOptionalChainCompletions: true,
      includeCompletionsWithSnippetText: false,
      // the whole list every time: "incomplete" lists leave the auto-imports for a follow-up
      // request in a mode the editor doesn't send, and in a worker they were always left out
      allowIncompleteCompletions: false,
    });
    if (!info) return null;
    return {
      member: info.isMemberCompletion,
      // all of them: the DOM alone has thousands of globals, and a cut-off list lost the
      // auto-imports (useTheme from @kbach/react), which come last
      entries: info.entries.map((c) => ({
        name: c.name,
        kind: c.kind,
        sortText: c.sortText,
        insertText: c.insertText,
        span: c.replacementSpan,
        source: c.source,
        data: c.data,
        hasAction: !!c.hasAction,
      })),
    };
  },

  /** A completion's signature and docs, and what else picking it changes (an auto-import). */
  details(path: string, pos: number, name: string, source: string | undefined, data: ts.CompletionEntryData | undefined) {
    const d = env!.languageService.getCompletionEntryDetails(path, pos, name, {}, source, {}, data);
    if (!d) return null;
    return {
      detail: text(d.displayParts),
      docs: text(d.documentation),
      tags: tagText(d.tags),
      // only this file's edits (an import line), as VS Code applies them
      edits: (d.codeActions ?? []).flatMap((a) => a.changes.filter((c) => c.fileName === path).flatMap((c) => c.textChanges)),
    };
  },

  quickInfo(path: string, pos: number) {
    const q = env!.languageService.getQuickInfoAtPosition(path, pos);
    if (!q) return null;
    return { start: q.textSpan.start, length: q.textSpan.length, detail: text(q.displayParts), docs: text(q.documentation), tags: tagText(q.tags) };
  },

  /** Problems: syntax for every file; types too for TypeScript files (JS is unchecked, as in VS Code). */
  diagnostics(path: string) {
    const ls = env!.languageService;
    const all = [...ls.getSyntacticDiagnostics(path), ...(isTs(path) ? ls.getSemanticDiagnostics(path) : [])];
    return all.map((d) => ({
      start: d.start ?? 0,
      length: d.length ?? 0,
      message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
      severity: d.category === ts.DiagnosticCategory.Error ? 'error' : d.category === ts.DiagnosticCategory.Warning ? 'warning' : 'info',
      code: d.code,
    }));
  },

  signature(path: string, pos: number) {
    const s = env!.languageService.getSignatureHelpItems(path, pos, {});
    if (!s) return null;
    return {
      selected: s.selectedItemIndex,
      argument: s.argumentIndex,
      items: s.items.map((i) => ({
        prefix: text(i.prefixDisplayParts),
        separator: text(i.separatorDisplayParts),
        suffix: text(i.suffixDisplayParts),
        docs: text(i.documentation),
        params: i.parameters.map((p) => ({ label: text(p.displayParts), docs: text(p.documentation) })),
      })),
    };
  },

  /** Where a name is defined, in the reader's own files. */
  definition(path: string, pos: number) {
    const defs = env!.languageService.getDefinitionAtPosition(path, pos) ?? [];
    return defs.map((d) => ({ path: d.fileName, start: d.textSpan.start, length: d.textSpan.length, own: project.has(d.fileName) }));
  },

  /** Every place a name is used, to rename it (null: it can't be renamed, with why). */
  rename(path: string, pos: number) {
    const ls = env!.languageService;
    const info = ls.getRenameInfo(path, pos, { allowRenameOfImportPath: false });
    if (!info.canRename) return { error: info.localizedErrorMessage };
    const places = ls.findRenameLocations(path, pos, false, false, { providePrefixAndSuffixTextForRename: true }) ?? [];
    return {
      name: info.displayName,
      places: places.filter((p) => project.has(p.fileName)).map((p) => ({ path: p.fileName, start: p.textSpan.start, length: p.textSpan.length, prefix: p.prefixText ?? '', suffix: p.suffixText ?? '' })),
    };
  },
};

export type TsMethods = typeof methods;

self.onmessage = async (e: MessageEvent<{ id: number; method: keyof typeof methods; args: unknown[] }>) => {
  const { id, method, args } = e.data;
  try {
    // (each method's own argument list)
    const result = await (methods[method] as (...a: unknown[]) => unknown)(...args);
    self.postMessage({ id, result });
  } catch (err) {
    self.postMessage({ id, error: err instanceof Error ? err.message : String(err) });
  }
};
