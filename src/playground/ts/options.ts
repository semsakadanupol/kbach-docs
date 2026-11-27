// The playground's TypeScript settings: a Vite + React project's (the tsconfig a new one comes
// with), for the worker (ts.worker.ts) and for scripts/ts-files.mjs, which gathers the lib files
// these options need. A function of the `typescript` module, for its enums.
import type * as TS from 'typescript';

export const COMPILER_OPTIONS = (ts: typeof TS): TS.CompilerOptions => ({
  target: ts.ScriptTarget.ES2022,
  lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  // every file is a module: script.js's top-level names don't clash with kbach.config.js's
  moduleDetection: ts.ModuleDetectionKind.Force,
  allowJs: true,
  checkJs: false,
  strict: true,
  noEmit: true,
  esModuleInterop: true,
  skipLibCheck: true,
  isolatedModules: true,
  allowImportingTsExtensions: true,
});

/** The playground's files, as the TypeScript service names them. */
export const PATHS = {
  config: '/kbach.config.js',
  script: (react: boolean, ts: boolean) => (react ? (ts ? '/App.tsx' : '/App.jsx') : ts ? '/script.ts' : '/script.js'),
};
