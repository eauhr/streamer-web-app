import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/lib/catalogApi';
import Hero from '@/components/home/Hero';
import ContinueRow from '@/components/continue/ContinueRow';
import Shelf, { LANDSCAPE_W, POSTER_W } from '@/components/media/Shelf';
import PosterCard from '@/components/media/PosterCard';
import LandscapeCard from '@/components/media/LandscapeCard';
import TrailerCard from '@/components/media/TrailerCard';

const useRow = (key, fn) => useQuery({ queryKey: key, queryFn: fn });

export default function Home() {
  const hero = useRow(['hero'], catalogApi.hero);
  const trending = useRow(['trending'], catalogApi.trending);
  const popMovies = useRow(['popular', 'movie'], () => catalogApi.popular('movie'));
  const popTv = useRow(['popular', 'tv'], () => catalogApi.popular('tv'));
  const topMovies = useRow(['top', 'movie'], () => catalogApi.topRated('movie'));
  const topTv = useRow(['top', 'tv'], () => catalogApi.topRated('tv'));
  const trailers = useRow(['trailers'], catalogApi.trailers);
  const alsoWatched = (trending.data || []).slice().reverse();

  const posters = (q) => (q.data || []).map((i) => <PosterCard key={`${i.mediaType}-${i.id}`} item={i} className={POSTER_W} />);
  const landscapes = (list) => list.map((i) => <LandscapeCard key={`${i.mediaType}-${i.id}`} item={i} className={LANDSCAPE_W} />);

  return (
    <div className="pb-8">
      <Hero items={hero.data} />
      <div className="relative z-10 -mt-4 space-y-12 sm:space-y-14">
        <ContinueRow />
        <Shelf title="Trending today" loading={trending.isLoading}>{posters(trending)}</Shelf>
        <Shelf title="Movies people are watching" variant="landscape" loading={popMovies.isLoading}>{landscapes(popMovies.data || [])}</Shelf>
        <Shelf title="Series worth starting" loading={popTv.isLoading}>{posters(popTv)}</Shelf>
        <Shelf title="Top-rated movies" loading={topMovies.isLoading}>{posters(topMovies)}</Shelf>
        <Shelf title="Top-rated series" variant="landscape" loading={topTv.isLoading}>{landscapes(topTv.data || [])}</Shelf>
        <Shelf title="Customers also watched" variant="landscape" loading={trending.isLoading}>{landscapes(alsoWatched)}</Shelf>
        <Shelf title="Featured trailers" variant="landscape" loading={trailers.isLoading}>
          {(trailers.data || []).map((i) => <TrailerCard key={`${i.mediaType}-${i.id}`} item={i} className={LANDSCAPE_W} />)}
        </Shelf>
      </div>
    </div>
  );
}