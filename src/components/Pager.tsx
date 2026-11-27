import { ArrowLeftIcon, ArrowRightIcon } from './icons';
import { SiteLink } from './SiteLink';
import { useNeighbors } from './site/SiteData';

export function Pager({ slug }: { slug: string }) {
  const { prev, next } = useNeighbors(slug);
  return (
    <nav aria-label="Previous and next page" className="mt-8 grid gap-3 sm:grid-cols-2">
      {prev ? (
        <SiteLink
          href={'/' + prev.slug}
          className="group rounded-2xl border border-line bg-card/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gold/60 hover:bg-card hover:shadow-lg hover:shadow-gold/10 active:border-gold/60 active:bg-card active:shadow-lg active:shadow-gold/10 active:scale-[0.98]"
        >
          <span className="flex items-center gap-1.5 text-xs text-faint">
            <ArrowLeftIcon className="transition-transform group-hover:-translate-x-0.5 group-active:-translate-x-0.5" /> Previous · {prev.section}
          </span>
          <span className="mt-1.5 block text-lg font-semibold text-ink group-hover:text-accent group-active:text-accent">{prev.title}</span>
        </SiteLink>
      ) : (
        <span />
      )}
      {next && (
        <SiteLink
          href={'/' + next.slug}
          className="group rounded-2xl border border-line bg-card/60 p-5 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-gold/60 hover:bg-card hover:shadow-lg hover:shadow-gold/10 active:border-gold/60 active:bg-card active:shadow-lg active:shadow-gold/10 active:scale-[0.98]"
        >
          <span className="flex items-center justify-end gap-1.5 text-xs text-faint">
            {next.section} · Next <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5 group-active:translate-x-0.5" />
          </span>
          <span className="mt-1.5 block text-lg font-semibold text-ink group-hover:text-accent group-active:text-accent">{next.title}</span>
        </SiteLink>
      )}
    </nav>
  );
}
