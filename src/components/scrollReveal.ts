// The scroll reveal (2026-11-26): every block of a docs page ([data-prose] > *) and the home
// page's [data-reveal] blocks rise in when they're on screen: the ones on the first screen
// as the page opens (top to bottom), the rest as they scroll into view. Only what's on
// screen plays; nothing animates out of sight.
//
// How:
// - RootDocument.tsx marks the page before the first paint (data-kb-reveal), and while it
//   is marked motion.css keeps every block hidden until it's revealed (data-revealed), so
//   the first screen doesn't show, hide, then animate.
// - Shell.tsx starts this for each page. The blocks on screen rise in (40px up and faded in,
//   0.8s, 70ms apart, the first after 150ms so a docs page's header goes first), blocks above
//   the screen are just shown, and an IntersectionObserver plays the rest the moment any
//   part of one shows at the bottom of the screen (blocks arriving together 90ms apart).
// - A block added later (a tab's content, anything mounted after the page) is caught by a
//   MutationObserver and handled the same way, so nothing can stay hidden.
// - Nothing is ever hidden without this running: no JavaScript or reduced motion, no mark;
//   and if this never takes over, the mark goes after 3s.
// - A page opened at a #heading: the blocks on its first screen fade in without moving. The
//   browser scrolls to the heading while they're still 40px down, so rising in would leave
//   the heading 40px above where the link points (regression: tests/e2e/docs-site.mjs).
// - A finished animation leaves nothing behind but data-revealed.
//
// On the dev server one console line says whether it runs, and why not.

const BLOCKS = '[data-prose] > *, [data-reveal]';
const RISE = [
  { opacity: 0, translate: '0 40px' },
  { opacity: 1, translate: '0 0' },
];
/** a #heading's first screen: in place, so the jump to it lands where it should */
const FADE = [{ opacity: 0 }, { opacity: 1 }];
const TIMING = { duration: 800, easing: 'cubic-bezier(0.25, 1, 0.5, 1)', fill: 'backwards' as const };
const FIRST_SCREEN = { start: 150, step: 70, steps: 8 };
const SCROLLED = { step: 90, steps: 4 };

const say = (message: string) => {
  if (process.env.NODE_ENV === 'development') console.info('[kbach docs] scroll reveal: ' + message);
};

/** Starts the reveal for the page as it is now; returns the cleanup. */
export function startScrollReveal(): () => void {
  if (typeof window === 'undefined') return () => {};
  const html = document.documentElement;
  if (!html.hasAttribute('data-kb-reveal')) {
    say(matchMedia('(prefers-reduced-motion: reduce)').matches ? 'off (the browser or the system asks for reduced motion)' : 'off (the page was not marked before it painted)');
    return () => {};
  }
  html.setAttribute('data-kb-reveal', 'on');

  const shown = (el: Element) => el.setAttribute('data-revealed', '');
  const rise = (el: Element, delay: number, keyframes: Keyframe[] = RISE) => {
    shown(el);
    el.animate(keyframes, { ...TIMING, delay });
  };
  // opened at a #heading: the first screen fades in where it is
  const firstScreen = window.location.hash.length > 1 ? FADE : RISE;
  const waiting = new Set<Element>();
  const io = new IntersectionObserver(
    (entries) => {
      let n = 0;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        waiting.delete(e.target);
        // jumped past (above the screen): just show it
        if (e.boundingClientRect.bottom <= 0) shown(e.target);
        else rise(e.target, Math.min(n++, SCROLLED.steps) * SCROLLED.step);
      }
    },
    // in as soon as any of it shows on screen; everything above the screen counts as in
    { rootMargin: '100000px 0px 0px 0px' },
  );

  /** One block: rises now if any of it is on screen, shown if above, else waits to scroll in. */
  const take = (el: Element, delay: number, keyframes: Keyframe[] = RISE) => {
    if (el.hasAttribute('data-revealed') || waiting.has(el)) return false;
    const r = el.getBoundingClientRect();
    if (r.bottom <= 0) shown(el);
    else if (r.top < window.innerHeight) {
      rise(el, delay, keyframes);
      return true;
    } else {
      waiting.add(el);
      io.observe(el);
    }
    return false;
  };

  // the first screen, top to bottom
  let n = 0;
  for (const el of document.querySelectorAll(BLOCKS)) {
    if (take(el, FIRST_SCREEN.start + Math.min(n, FIRST_SCREEN.steps) * FIRST_SCREEN.step, firstScreen)) n++;
  }
  say(`on: ${n} blocks rise in on the first screen, ${waiting.size} wait below it`);

  // blocks that appear later
  const mo = new MutationObserver((records) => {
    for (const r of records) {
      for (const node of r.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches(BLOCKS)) take(node, 0);
        for (const el of node.querySelectorAll(BLOCKS)) take(el, 0);
      }
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });

  return () => {
    io.disconnect();
    mo.disconnect();
    // Leaving the page only stops watching. A block still waiting stays hidden for the next
    // start to take: the next page's run (Shell starts one per page), or the same page again
    // (React's dev mode starts every effect twice; showing the waiting blocks here showed the
    // whole page at once there, with nothing left to rise in).
    waiting.clear();
  };
}
