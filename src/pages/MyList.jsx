import React from 'react';
import { Link } from 'react-router-dom';
import { CATALOG } from '@/lib/catalog';
import useStore from '@/hooks/useStore';
import { listStore } from '@/lib/storage';
import PageHeader from '@/components/PageHeader';
import PosterGrid from '@/components/media/PosterGrid';

export default function MyList() {
  const saved = useStore(() => listStore.all());
  const items = saved
    .map((s) => CATALOG.find((i) => i.mediaType === s.type && String(i.id) === s.id))
    .filter(Boolean);

  return (
    <div>
      <PageHeader title="My List" description="Titles you’ve saved to watch later." />
      <div className="container-teev">
        {items.length ? <PosterGrid items={items} /> : (
          <div className="card-surface flex flex-col items-center px-6 py-16 text-center">
            <p className="text-lg font-semibold">Your list is empty</p>
            <p className="mt-1 text-sm text-[#A1A1AA]">Tap the + button on any title to save it here.</p>
            <Link to="/movies" className="btn-primary mt-6">Browse movies</Link>
          </div>
        )}
      </div>
    </div>
  );
}