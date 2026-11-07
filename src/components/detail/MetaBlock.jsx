import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Star } from 'lucide-react';
import { formatRating, GENRES, releaseYear } from '@/lib/tmdb';
import { advisoryFor } from '@/components/detail/advisory';

const Badge = ({ children, label }) => (
  <span aria-label={label} className="inline-flex h-6 items-center rounded border border-white/25 px-1.5 text-[11px] font-semibold text-[#D4D4D8]">{children}</span>
);

export default function MetaBlock({ item }) {
  const isTv = item.mediaType === 'tv';
  const isNew = Number(releaseYear(item)) >= new Date().getFullYear() - 3;
  const length = isTv ? `${item.seasons?.length} season${item.seasons?.length > 1 ? 's' : ''}` : `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`;
  const base = isTv ? '/tv' : '/movies';

  return (
    <section className="max-w-3xl space-y-5 pb-8">
      <span className="inline-flex rounded-sm bg-white/10 px-2 py-1 text-[11px] font-bold tracking-wider text-white">
        {isNew ? 'NEW ' : ''}{isTv ? 'SERIES' : 'MOVIE'}
      </span>
      <p className="text-[15px] leading-relaxed text-[#D4D4D8]">{item.overview}</p>
      {item.cast?.length > 0 && (
        <p className="text-sm leading-relaxed text-[#A1A1AA]">
          <span className="text-white">Cast: </span>
          {(item.castDetails?.length ? item.castDetails : item.cast.map((name) => ({ name }))).map((person, i, cast) => (
            <React.Fragment key={person.id || person.name}>
              <Link to={person.id ? `/person/${person.id}` : `/search?q=${encodeURIComponent(person.name)}`} className="underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white">{person.name}</Link>
              {i < cast.length - 1 && ', '}
            </React.Fragment>
          ))}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#A1A1AA]">
        <Badge label={`Rated ${item.certification}`}>{item.certification}</Badge>
        <Badge label="Closed captions">CC</Badge>
        <Badge label="Audio description">AD</Badge>
        <span className="inline-flex items-center gap-1 font-medium text-white"><Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />{formatRating(item.voteAverage)}<span className="sr-only"> out of 10</span></span>
        <span>{releaseYear(item)}</span>
        <span>{length}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {item.genreIds.filter((g) => GENRES[g]).map((g) => (
          <Link key={g} to={`${base}?genre=${g}`} className="text-sm text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">{GENRES[g]}</Link>
        ))}
      </div>
      <div className="card-surface flex gap-3 p-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#A1A1AA]" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-white">Content advisory · {item.certification}</p>
          <p className="mt-1 text-sm text-[#A1A1AA]">{advisoryFor(item.certification)}</p>
        </div>
      </div>
    </section>
  );
}
