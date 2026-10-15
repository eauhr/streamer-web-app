import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/lib/catalogApi';
import Shelf, { LANDSCAPE_W } from '@/components/media/Shelf';
import LandscapeCard from '@/components/media/LandscapeCard';
import TrailerEmbed from '@/components/media/TrailerEmbed';

export default function RelatedTab({ item }) {
  const { data = [], isLoading } = useQuery({ queryKey: ['related', item.mediaType, item.id], queryFn: () => catalogApi.related(item) });
  return (
    <div className="space-y-12 pt-8">
      {(isLoading || data.length > 0) && (
        <Shelf title="Customers also watched" variant="landscape" loading={isLoading} contained={false}>
          {data.map((r) => <LandscapeCard key={`${r.mediaType}-${r.id}`} item={r} className={LANDSCAPE_W} />)}
        </Shelf>
      )}
      {item.trailerKey && (
        <section aria-label="Trailer" className="max-w-4xl">
          <h2 className="mb-3 text-lg font-semibold tracking-tight sm:text-xl">Trailer</h2>
          <TrailerEmbed youtubeKey={item.trailerKey} title={item.title} />
        </section>
      )}
    </div>
  );
}