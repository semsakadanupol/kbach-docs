'use client';

import { HeroBackdrop, Landing } from '../Landing';
import { BackToTop } from './BackToTop';
import { Footer } from './Footer';

/** The home page (/): the hero's light behind the header, then Landing.tsx's sections. */
export function HomePage() {
  return (
    // pulled up under the bar (its 64px and the 1px gold line), so the hero's light starts at the top
    <div className="relative isolate -mt-[65px] overflow-x-clip pt-[65px]">
      <HeroBackdrop />
      <main id="content" className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <Landing />
        <Footer />
      </main>
      <BackToTop />
    </div>
  );
}
