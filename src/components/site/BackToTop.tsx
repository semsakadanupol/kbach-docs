'use client';

import { useEffect, useRef, useState } from 'react';
import { clsx } from '@kbach/react';
import { ArrowUpIcon } from '../icons';

// The ring around the button: a circle of radius 20 in a 44×44 box.
const RING = 2 * Math.PI * 20;

/**
 * The home page's Back to top button (2026-11-27): bottom right, once the
 * reader is a screen down the page, with a ring that fills as they scroll.
 * It scrolls up smoothly (at once with reduced motion) and puts the keyboard
 * focus back at the top, on the header's first link. Hidden, it's out of the
 * tab order and away from screen readers.
 */
export function BackToTop() {
  const [shown, setShown] = useState(false);
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const room = document.documentElement.scrollHeight - window.innerHeight;
      setShown(window.scrollY > window.innerHeight);
      // set straight on the circle, not through state: no render per scrolled pixel
      if (ring.current) ring.current.style.strokeDashoffset = String(RING * (1 - (room > 0 ? Math.min(1, window.scrollY / room) : 0)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const toTop = () => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' });
    document.querySelector<HTMLElement>('header a[href]')?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      title="Back to top"
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      className={clsx(
        'fixed right-4 bottom-4 z-30 grid size-11 place-items-center rounded-full border border-line bg-card/90 text-lg text-accent shadow-lg shadow-gold/10 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:scale-95 motion-reduce:transition-none sm:right-6 sm:bottom-6',
        shown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      {/* The ring is the gold edge: hover doesn't recolor the border (it sits just outside the ring,
          and a gold border beside it read as a second ring); it deepens the glow instead. */}
      {/* No Kbach transform class inside the button (no -rotate-90, no group-hover:translate): Kbach
          builds transform from --kb-* variables, which children inherit, so a child with one took the
          button's hover lift a second time and the ring slid off the border. The ring turns to start
          at the top with SVG's own transform attribute instead; the arrow rides the button's lift. */}
      <svg viewBox="0 0 44 44" aria-hidden="true" className="absolute inset-0 size-full">
        <circle ref={ring} cx="22" cy="22" r="20" transform="rotate(-90 22 22)" fill="none" strokeWidth="2" strokeLinecap="round" strokeDasharray={RING} strokeDashoffset={RING} className="stroke-gold/70" />
      </svg>
      <ArrowUpIcon />
    </button>
  );
}
