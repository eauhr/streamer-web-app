import React from 'react';
import Artwork from '@/components/media/Artwork';
import { backdropUrl, posterUrl } from '@/lib/tmdb';

export default function DetailHero({ item }) {
  const src = backdropUrl(item.backdropPath, 'original') || posterUrl(item.posterPath, 'original');
  return (
    <section aria-label={item.title} className="relative h-[58vh] min-h-[400px] max-h-[760px] w-full overflow-hidden bg-black">
      <Artwork src={src} alt={`${item.title} backdrop`} eager className="absolute inset-0 h-full w-full object-[60%_20%]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#090909] via-[#090909]/70 to-transparent" />
      <div className="container-teev absolute inset-x-0 bottom-0 pb-4">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-teev-lime">{item.mediaType === 'tv' ? 'SERIES' : 'MOVIE'}</p>
        <h1 className="mt-2 max-w-3xl text-4xl font-extrabold leading-[0.95] tracking-[-0.035em] text-white sm:text-6xl">{item.title}</h1>
        <p className="mt-4 hidden max-w-2xl text-base leading-relaxed text-[#D4D4D8] sm:line-clamp-2">{item.overview}</p>
      </div>
    </section>
  );
}