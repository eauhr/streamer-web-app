import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/lib/catalogApi';
import WatchView from '@/components/detail/WatchView';
import NotFound from '@/pages/NotFound';

export default function Watch() {
  const { id } = useParams();
  const params = new URLSearchParams(useLocation().search);
  const requestedType = params.get('type');
  const type = requestedType === 'tv' ? 'tv' : 'movie';
  const hasExplicitType = requestedType === 'movie' || requestedType === 'tv';
  const validId = typeof id === 'string' && /^(\d+|tt\d+)$/i.test(id);
  const { data: item, isLoading, isError, refetch } = useQuery({
    queryKey: ['details', id, hasExplicitType ? requestedType : 'auto'],
    queryFn: async () => {
      const result = await catalogApi.details(type, id);
      if (result || hasExplicitType) return result;
      return catalogApi.details(type === 'movie' ? 'tv' : 'movie', id);
    },
    enabled: validId,
  });

  useEffect(() => {
    document.title = item ? `${item.title} | TeeV` : 'Watch | TeeV';
    return () => { document.title = 'TeeV'; };
  }, [item?.title]);

  if (!validId) return <NotFound />;
  if (isLoading) return <div className="h-[58vh] min-h-[400px] animate-pulse bg-[#111111]" />;
  if (isError) return (
    <div role="alert" className="container-teev flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-[#A1A1AA]">This title could not be loaded. Please try again.</p>
      <button type="button" onClick={() => refetch()} className="btn-primary">Retry</button>
    </div>
  );
  if (!item) return <NotFound />;
  return <WatchView key={`${item.mediaType}-${item.id}`} item={item} autoPlay={params.get('play') === '1'} />;
}
