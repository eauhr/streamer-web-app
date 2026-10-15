import React from 'react';
import { Link } from 'react-router-dom';
import useStore from '@/hooks/useStore';
import { continueStore } from '@/lib/storage';
import PageHeader from '@/components/PageHeader';
import ContinueCard from '@/components/continue/ContinueCard';

export default function ContinueWatching() {
  const entries = useStore(() => continueStore.all());
  return (
    <div>
      <PageHeader title="Continue watching" description="Pick up right where you left off. Your progress is saved on this device." />
      <div className="container-teev">
        {entries.length ? (
          <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {entries.map((e) => <ContinueCard key={`${e.type}-${e.id}`} entry={e} />)}
          </div>
        ) : (
          <div className="card-surface flex flex-col items-center px-6 py-16 text-center">
            <p className="text-lg font-semibold">Nothing in progress</p>
            <p className="mt-1 text-sm text-[#A1A1AA]">Start a movie or episode and it will show up here.</p>
            <Link to="/" className="btn-primary mt-6">Start browsing</Link>
          </div>
        )}
      </div>
    </div>
  );
}