import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/lib/catalogApi';
import PageHeader from '@/components/PageHeader';
import GenreChips from '@/components/media/GenreChips';
import PosterGrid from '@/components/media/PosterGrid';

const COPY = {
  movie: { title: 'Movies', description: 'Blockbusters, modern classics and critically loved films — ready when you are.' },
  tv: { title: 'Series', description: 'Bingeable dramas, sharp comedies and the shows everyone is talking about.' },
};

export default function Catalog({ type }) {
  const [params, setParams] = useSearchParams();
  const genre = params.get('genre') ? Number(params.get('genre')) : null;
  const page = Math.max(1, Number(params.get('page')) || 1);
  const { data = { items: [], page: 1, totalPages: 1 }, isLoading } = useQuery({
    queryKey: ['catalog', type, page, genre],
    queryFn: () => catalogApi.browse(type, page, genre),
    placeholderData: (previous) => previous,
  });
  const { data: genres = [] } = useQuery({ queryKey: ['genres', type], queryFn: () => catalogApi.genres(type) });
  const updateParams = (nextGenre, nextPage) => {
    const next = new URLSearchParams();
    if (nextGenre) next.set('genre', String(nextGenre));
    if (nextPage > 1) next.set('page', String(nextPage));
    setParams(next, { replace: true });
  };

  return (
    <div>
      <PageHeader title={COPY[type].title} description={COPY[type].description}>
        <GenreChips genres={genres} active={genre} onChange={(nextGenre) => updateParams(nextGenre, 1)} />
      </PageHeader>
      <div className="container-teev">
        <PosterGrid items={data.items} loading={isLoading} />
        {!isLoading && !data.items.length && <p className="py-16 text-center text-[#A1A1AA]">Nothing in this genre yet.</p>}
        {data.totalPages > 1 && <nav aria-label="Catalog pages" className="flex items-center justify-center gap-4 py-10">
          <button type="button" disabled={page <= 1} onClick={() => updateParams(genre, page - 1)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
          <span className="text-sm text-[#A1A1AA]">Page {data.page} of {data.totalPages}</span>
          <button type="button" disabled={page >= data.totalPages} onClick={() => updateParams(genre, page + 1)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40">Next</button>
        </nav>}
      </div>
    </div>
  );
}
