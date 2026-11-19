'use client';

import type { ReactNode } from 'react';
import { useStarted } from '../lib/browser';

/**
 * Shows `fallback` in the built page and until the page has started in the
 * browser, then `children`. For parts that only work in a browser (the
 * playground, the engine-made reference tables): the fallback is their
 * outline, so nothing moves when they arrive.
 */
export function ClientOnly({ fallback, children }: { fallback: ReactNode; children: ReactNode }) {
  return <>{useStarted() ? children : fallback}</>;
}
