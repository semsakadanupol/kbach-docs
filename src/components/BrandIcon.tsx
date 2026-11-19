import { clsx } from '@kbach/react';
import {
  siBun,
  siExpo,
  siHtml5,
  siNextdotjs,
  siNpm,
  siPnpm,
  siPostcss,
  siReact,
  siVite,
  siYarn,
  type SimpleIcon,
} from 'simple-icons';

// The official marks of what Kbach works with (Simple Icons, CC0), in each
// brand's own color. The site uses them in the home page's "Works with" row,
// the Installation page's setup tabs, and the npm / pnpm / yarn / bun (and
// Expo / React Native CLI) tabs of its code blocks.

export const BRANDS = {
  react: siReact,
  nextjs: siNextdotjs,
  vite: siVite,
  postcss: siPostcss,
  expo: siExpo,
  html5: siHtml5,
  npm: siNpm,
  pnpm: siPnpm,
  yarn: siYarn,
  bun: siBun,
} satisfies Record<string, SimpleIcon>;

export type Brand = keyof typeof BRANDS;

export function isBrand(name: string | undefined): name is Brand {
  return !!name && name in BRANDS;
}

/** The brand a code-block tab names ("npm", "Expo", "React Native CLI"), if it's one of ours. */
export function brandForTab(label: string | undefined): Brand | null {
  const key = (label ?? '').trim().toLowerCase();
  if (key === 'react native cli' || key === 'react native') return 'react';
  return isBrand(key) ? key : null;
}

/** A mark that's black or near it (Next.js, Expo, Bun): drawn in the text color, so dark mode shows it. */
function isInk(hex: string): boolean {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 48;
}

/** A brand's official mark, 1em square by default (className sizes it). */
export function BrandIcon({ brand, className }: { brand: Brand; className?: string }) {
  const icon: SimpleIcon = BRANDS[brand];
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={clsx('size-[1em] shrink-0', className)}
      style={{ fill: isInk(icon.hex) ? 'currentColor' : '#' + icon.hex }}
    >
      <path d={icon.path} />
    </svg>
  );
}
