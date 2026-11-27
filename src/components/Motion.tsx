import type { ReactNode } from 'react';

/**
 * Rises in when it reaches the screen (components/scrollReveal.ts looks for
 * [data-reveal]). Cards that arrive together follow each other on their own. A
 * wrapper of its own, so the animation never fights the transform of a card's
 * hover lift inside it.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    // a data attribute, not a class: scrollReveal.ts finds it, it's not a Kbach class
    <div data-reveal="" className={className}>
      {children}
    </div>
  );
}
