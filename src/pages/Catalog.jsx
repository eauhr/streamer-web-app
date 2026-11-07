import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/lib/catalogApi';
import PageHeader from '@/components/PageHeader';
import GenreChips from '@/components/media/GenreChips';
import PosterGrid from '@/components/media/PosterGrid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COPY = {
  movie: { title: 'Movies', description: 'Blockbusters, modern classics and critically loved films — ready when you are.' },
  tv: { title: 'Series', description: 'Bingeable dramas, sharp comedies and the shows everyone is talking about.' },
};

export default function Catalog({ type }) {
  const [params, setParams] = useSearchParams();
  const genre = params.get('genre') ? Number(params.get('genre')) : null;
  const originalLanguage = type === 'tv' ? params.get('language') || null : null;
  const page = Math.max(1, Number(params.get('page')) || 1);
  const { data = { items: [], page: 1, totalPages: 1 }, isLoading } = useQuery({
    queryKey: ['catalog', type, page, genre, originalLanguage],
    queryFn: () => catalogApi.browse(type, page, genre, originalLanguage),
    placeholderData: (previous) => previous,
  });
  const { data: genres = [] } = useQuery({ queryKey: ['genres', type], queryFn: () => catalogApi.genres(type) });
  const { data: languages = [] } = useQuery({
    queryKey: ['catalog-languages'],
    queryFn: () => catalogApi.languages(),
    enabled: type === 'tv',
  });
  const updateParams = (nextGenre, nextPage, nextLanguage = originalLanguage) => {
    const next = new URLSearchParams();
    if (nextGenre) next.set('genre', String(nextGenre));
    if (nextPage > 1) next.set('page', String(nextPage));
    if (nextLanguage) next.set('language', nextLanguage);
    setParams(next, { replace: true });
  };

  return (
    <div>
      <PageHeader title={COPY[type].title} description={COPY[type].description}>
        <div className="space-y-4">
          <GenreChips genres={genres} active={genre} onChange={(nextGenre) => updateParams(nextGenre, 1)} />
          {type === 'tv' && languages.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="series-language" className="text-sm text-[#A1A1AA]">Original language</label>
              <Select value={originalLanguage || 'all'} onValueChange={(value) => updateParams(genre, 1, value === 'all' ? null : value)}>
                <SelectTrigger id="series-language" className="h-10 w-56 rounded-full border-white/10 bg-[#151515] text-white">
                  <SelectValue placeholder="All languages" />
                </SelectTrigger>
                <SelectContent className="max-h-72 border-white/10 bg-[#151515]">
                  <SelectItem value="all">All languages</SelectItem>
                  {languages.map((language) => (
                    <SelectItem key={language.iso_639_1} value={language.iso_639_1}>
                      {language.english_name}{language.name && language.name !== language.english_name ? ` · ${language.name}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
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
