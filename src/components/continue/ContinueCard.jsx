import React from 'react';
import { Link } from 'react-router-dom';
import { Play, X } from 'lucide-react';
import Artwork from '@/components/media/Artwork';
import { backdropUrl, formatDuration, posterUrl } from '@/lib/tmdb';
import { continueStore } from '@/lib/storage';

export default function ContinueCard({ entry, className = '' }) {
  const pct = entry.durationSeconds ? Math.min(100, (entry.watchedSeconds / entry.durationSeconds) * 100) : 0;
  const remaining = Math.max(0, entry.durationSeconds - entry.watchedSeconds);
  const epLabel = entry.type === 'tv' ? `S${entry.season} · E${entry.episode}` : 'Movie';
  const href = `/watch/${entry.id}?type=${entry.type}&play=1`;

  return (
    <div className={`group relative snap-start ${className}`}>
      <Link to={href} aria-label={`Resume ${entry.title}`} className="block">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-[#151515]">
          <Artwork src={backdropUrl(entry.backdrop, 'w780') || posterUrl(entry.poster, 'w500')} alt={`${entry.title} artwork`} title={entry.title} className="h-full w-full" />
          <div className="absolute inset-0 grid place-items-center bg-black/20 transition group-hover:bg-black/45">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-black"><Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true" /></span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Watched">
            <div className="h-full bg-teev-lime" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <p className="mt-2.5 truncate text-sm font-medium text-white">{entry.title}</p>
        <p className="text-xs text-[#A1A1AA]">{epLabel} · {formatDuration(remaining)} left</p>
      </Link>
      <button
        type="button"
        onClick={() => continueStore.remove(entry.type, entry.id)}
        aria-label={`Remove ${entry.title} from Continue Watching`}
        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white opacity-100 transition hover:bg-black lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}