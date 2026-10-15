import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SearchX } from 'lucide-react';
import { catalogApi } from '@/lib/catalogApi';
import SearchBox from '@/components/layout/SearchBox';
import PosterGrid from '@/components/media/PosterGrid';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const { data = [], isFetching } = useQuery({
    queryKey: ['search', q, page],
    queryFn: () => catalogApi.search(q, page),
    enabled: !!q,
    placeholderData: (prev) => prev,
  });
  const setPage = (nextPage) => {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (nextPage > 1) next.set('page', String(nextPage));
    setParams(next, { replace: true });
  };

  return (
    <div className="container-teev pt-8 sm:pt-12">
      <SearchBox autoFocus large className="mb-8 md:hidden" />
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{q ? <>Results for “{q}”</> : 'Search TeeV'}</h1>
        {isFetching && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-teev-lime" aria-label="Loading" />}
      </div>
      {!q && <p className="text-[#A1A1AA]">Find movies and series by title, actor or genre.</p>}
      {q && data.items?.length > 0 && <PosterGrid items={data.items} />}
      {q && data.totalPages > 1 && <nav aria-label="Search result pages" className="flex items-center justify-center gap-4 py-10">
        <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
        <span className="text-sm text-[#A1A1AA]">Page {data.page} of {data.totalPages}</span>
        <button type="button" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40">Next</button>
      </nav>}
      {q && !isFetching && data.items?.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <SearchX className="h-10 w-10 text-[#666]" aria-hidden="true" />
          <p className="mt-4 text-lg font-semibold">No matches for “{q}”</p>
          <p className="mt-1 text-sm text-[#A1A1AA]">Try a different title, actor or genre.</p>
        </div>
      )}
    </div>
  );
}
