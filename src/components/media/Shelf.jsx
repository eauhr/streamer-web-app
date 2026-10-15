import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const POSTER_W = 'w-[36vw] shrink-0 sm:w-40 lg:w-44';
export const LANDSCAPE_W = 'w-[72vw] shrink-0 sm:w-72 lg:w-[320px] xl:w-[350px]';

export default function Shelf({ title, children, loading = false, variant = 'poster', contained = true }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: 'smooth' });
  const skeleton = variant === 'poster' ? `${POSTER_W} aspect-[2/3]` : `${LANDSCAPE_W} aspect-video`;

  return (
    <section aria-label={title} className={contained ? 'container-teev' : ''}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">{title}</h2>
        <div className="hidden gap-1 lg:flex">
          <button type="button" onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`} className="grid h-8 w-8 place-items-center rounded-full text-[#A1A1AA] transition hover:bg-white/10 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label={`Scroll ${title} right`} className="grid h-8 w-8 place-items-center rounded-full text-[#A1A1AA] transition hover:bg-white/10 hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={ref} className={`scrollbar-none flex snap-x gap-3 overflow-x-auto pb-2 lg:gap-4 ${contained ? '-mx-4 scroll-px-4 px-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0' : ''}`}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className={`${skeleton} animate-pulse rounded-lg bg-[#151515]`} />)
          : children}
      </div>
    </section>
  );
}