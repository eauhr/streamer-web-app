import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import Artwork from '@/components/media/Artwork';
import { backdropUrl, detailsHref, releaseYear, typeLabel } from '@/lib/tmdb';

export default function LandscapeCard({ item, className = '' }) {
  return (
    <Link to={detailsHref(item)} className={`group block snap-start ${className}`}>
      <div className="relative aspect-video overflow-hidden rounded-lg bg-[#151515]">
        <Artwork src={backdropUrl(item.backdropPath || item.posterPath, 'w780')} alt={`${item.title} artwork`} title={item.title} className="h-full w-full transition duration-200 group-hover:scale-[1.03]" />
        <div className="absolute inset-0 grid place-items-center bg-black/0 transition duration-200 group-hover:bg-black/40 group-focus-visible:bg-black/40">
          <span className="grid h-12 w-12 scale-90 place-items-center rounded-full bg-white text-black opacity-0 transition duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:opacity-100">
            <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
          </span>
        </div>
      </div>
      <p className="mt-2.5 truncate text-sm font-medium text-white">{item.title}</p>
      <p className="text-xs text-[#A1A1AA]">{releaseYear(item)} · {typeLabel(item)}</p>
    </Link>
  );
}