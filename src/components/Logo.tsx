import { clsx } from '@kbach/react';

/**
 * The Kbach logo in the page's theme: gold on cream in light mode
 * (kbach-logo-light-N.png), gold on slate in dark mode (kbach-logo-N.png).
 * Both are in the page and CSS shows one, so the right logo is there from
 * the first paint, with no flash when the theme is read. `source` is the
 * image file's size in px (pick about twice the shown size, for sharp
 * screens); `className` sizes and styles both, and shouldn't set display.
 *
 * (The browser tab's icon is different: it follows the browser's theme, and
 * index.html sets it.)
 */
export function Logo({ source, shown, className }: { source: 32 | 64 | 128 | 256; shown: number; className?: string }) {
  return (
    <>
      <img src={'/kbach-logo-light-' + source + '.png'} alt="" width={shown} height={shown} className={clsx('block dark:hidden', className)} />
      <img src={'/kbach-logo-' + source + '.png'} alt="" width={shown} height={shown} className={clsx('hidden dark:block', className)} />
    </>
  );
}
