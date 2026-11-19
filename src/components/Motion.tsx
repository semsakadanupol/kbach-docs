import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

/** Calls back once, when the element first scrolls into view. */
function useSeen<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      // The area reaches far above the window: content the page jumped past (End,
      // a #link) counts as seen too, or it would be blank on the way back up.
      { rootMargin: '100000px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

/**
 * Rises in as it scrolls into view (motion.css [data-reveal]). The delay staggers a
 * row of cards. A wrapper of its own, so it never fights the transform of
 * a card's hover lift inside it.
 */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  return (
    // data attributes, not classes: they're plain CSS (motion.css), not Kbach classes
    <div ref={ref} data-reveal="" data-in={seen ? '' : undefined} style={delay ? { transitionDelay: delay + 'ms' } : undefined} className={className}>
      {children}
    </div>
  );
}
