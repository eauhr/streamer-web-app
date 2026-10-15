import React from 'react';
import PosterCard from '@/components/media/PosterCard';

export default function PosterGrid({ items = [], loading = false }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:gap-x-4">
      {loading && !items.length
        ? Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-[2/3] animate-pulse rounded-[10px] bg-[#151515]" />)
        : items.map((item) => <PosterCard key={`${item.mediaType}-${item.id}`} item={item} showMeta />)}
    </div>
  );
}