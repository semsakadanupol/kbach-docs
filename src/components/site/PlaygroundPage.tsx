'use client';

import { Playground } from '../registry';

/** The playground's page (/playground): the playground alone, full screen, with no header, footer or page text. */
export function PlaygroundPage({ title }: { title: string }) {
  return (
    <main id="content" className="bg-page font-sans text-ink antialiased">
      <h1 className="sr-only">{title}</h1>
      <Playground />
    </main>
  );
}
