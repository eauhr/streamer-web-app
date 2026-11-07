import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import Artwork from '@/components/media/Artwork';
import { detailsHref, formatRating, posterUrl, releaseYear, typeLabel } from '@/lib/tmdb';

export default function PosterCard({ item, className = '', showMeta = false }) {
  return (
    <Link to={detailsHref(item)} className={`group block snap-start rounded-xl ${className}`} aria-label={`${item.title}, ${typeLabel(item)}, ${releaseYear(item)}`}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] bg-[#151515]">
        <Artwork src={posterUrl(item.posterPath, 'w342') || posterUrl(item.backdropPath, 'w780')} alt={`${item.title} poster`} title={item.title} className="h-full w-full transition duration-200 group-hover:scale-[1.03]" />
        <div className="absolute inset-0 rounded-[10px] ring-1 ring-inset ring-white/5 transition duration-200 group-hover:ring-white/30 group-focus-visible:ring-teev-lime" />
      </div>
      {showMeta && (
        <div className="mt-2.5 space-y-0.5 px-0.5">
          <p className="truncate text-sm font-medium text-white">{item.title}</p>
          <p className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
            {releaseYear(item)} <span aria-hidden="true">·</span>
            <Star className="h-3 w-3 fill-current" aria-hidden="true" /> {formatRating(item.voteAverage)}
            <span aria-hidden="true">·</span> {typeLabel(item)}
          </p>
        </div>
      )}
    </Link>
  );
}
