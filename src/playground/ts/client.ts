// The page's side of the TypeScript service (ts.worker.ts): one worker for the whole playground,
// started the first time an editor asks (its files load once, ~4 MB, then the browser caches
// them). Calls are queued until it's ready; each answer comes back by its id.
import type { TsMethods } from './ts.worker';

type Method = keyof TsMethods;
type Result<M extends Method> = Awaited<ReturnType<TsMethods[M]>>;

let worker: Worker | null = null;
let ready: Promise<unknown> | null = null;
let nextId = 1;
const waiting = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
/** What each file was last sent as: only changes go to the worker. */
const sent = new Map<string, string>();

function call<M extends Method>(method: M, ...args: Parameters<TsMethods[M]>): Promise<Result<M>> {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    waiting.set(id, { resolve: resolve as (v: unknown) => void, reject });
    worker!.postMessage({ id, method, args });
  });
}

function start(): Promise<unknown> {
  if (ready) return ready;
  worker = new Worker(new URL('./ts.worker.ts', import.meta.url), { type: 'module', name: 'TypeScript' });
  worker.onmessage = (e: MessageEvent<{ id: number; result?: unknown; error?: string }>) => {
    const w = waiting.get(e.data.id);
    if (!w) return;
    waiting.delete(e.data.id);
    if (e.data.error) w.reject(new Error(e.data.error));
    else w.resolve(e.data.result);
  };
  ready = call('init', '/ts/files.json');
  return ready;
}

/** Calls the service once it's up; null if it can't be reached (offline, the files missing). */
export async function ts<M extends Method>(method: M, ...args: Parameters<TsMethods[M]>): Promise<Result<M> | null> {
  try {
    await start();
    return await call(method, ...args);
  } catch {
    return null;
  }
}

/** A file of the reader's, as it is now (sent only when it changed). */
export async function syncFile(path: string, content: string): Promise<void> {
  if (sent.get(path) === content) return;
  sent.set(path, content);
  await ts('set', path, content);
}

/** A file that's gone (script.js became script.ts, App.jsx became App.tsx). */
export async function dropFile(path: string): Promise<void> {
  if (!sent.has(path)) return;
  sent.delete(path);
  await ts('remove', path);
}

/** Starts the service early (the playground opened): the first completion is then quick. */
export function warmUp(): void {
  void start().catch(() => {});
}

