import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/lib/catalogApi';
import WatchView from '@/components/detail/WatchView';
import NotFound from '@/pages/NotFound';

export default function Watch() {
  const { id } = useParams();
  const params = new URLSearchParams(useLocation().search);
  const type = params.get('type') === 'tv' ? 'tv' : 'movie';
  const { data: item, isLoading } = useQuery({ queryKey: ['details', type, id], queryFn: () => catalogApi.details(type, id) });

  if (isLoading) return <div className="h-[58vh] min-h-[400px] animate-pulse bg-[#111111]" />;
  if (!item) return <NotFound />;
  return <WatchView key={`${type}-${id}`} item={item} autoPlay={params.get('play') === '1'} />;
}