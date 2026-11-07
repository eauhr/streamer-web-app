import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/lib/catalogApi';
import { posterUrl } from '@/lib/tmdb';
import PosterGrid from '@/components/media/PosterGrid';
import NotFound from '@/pages/NotFound';

const FILTERS = [['all', 'All'], ['movie', 'Movies'], ['tv', 'Series']];

export default function Person() {
  const { id } = useParams();
  const [filter, setFilter] = useState('all');
  const [showFullBiography, setShowFullBiography] = useState(false);
  const { data: person, isLoading } = useQuery({
    queryKey: ['person', id],
    queryFn: () => catalogApi.person(id),
  });

  if (isLoading) {
    return <div className="container-teev py-20"><div className="h-64 animate-pulse rounded-xl bg-[#111111]" /></div>;
  }
  if (!person) return <NotFound />;

  const items = person.items.filter((item) => filter === 'all' || item.mediaType === filter);
  const biography = person.biography;
  const displayedBiography = biography.length > 420 && !showFullBiography
    ? `${biography.slice(0, 420)}…`
    : biography;
  const photo = posterUrl(person.profilePath, 'w342');

  return (
    <div className="container-teev pb-8 pt-10 sm:pt-14">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="h-60 w-40 shrink-0 overflow-hidden rounded-xl bg-[#151515]">
          {photo && <img src={photo} alt={person.name} className="h-full w-full object-cover" />}
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl">{person.name}</h1>
          <p className="mt-2 text-sm text-[#A1A1AA]">
            {[person.department, person.birthday && `Born ${person.birthday}`, person.placeOfBirth].filter(Boolean).join(' · ')}
          </p>
          {biography && (
            <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-[#D4D4D8]">
              {displayedBiography}{' '}
              {biography.length > 420 && (
                <button type="button" onClick={() => setShowFullBiography(!showFullBiography)} className="text-white underline underline-offset-4">
                  {showFullBiography ? 'Less' : 'More'}
                </button>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 mt-10 flex flex-wrap items-center gap-2">
        <h2 className="mr-3 text-xl font-semibold">Filmography <span className="text-[#666]">({items.length})</span></h2>
        {FILTERS.map(([key, label]) => (
          <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={`chip ${filter === key ? 'chip-active' : ''}`}>
            {label}
          </button>
        ))}
      </div>
      <PosterGrid items={items} />
    </div>
  );
}
