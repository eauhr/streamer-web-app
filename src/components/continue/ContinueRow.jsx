import React from 'react';
import useStore from '@/hooks/useStore';
import { continueStore } from '@/lib/storage';
import Shelf, { LANDSCAPE_W } from '@/components/media/Shelf';
import ContinueCard from '@/components/continue/ContinueCard';

export default function ContinueRow() {
  const entries = useStore(() => continueStore.all());
  if (!entries.length) return null;
  return (
    <Shelf title="Continue watching" variant="landscape">
      {entries.map((e) => <ContinueCard key={`${e.type}-${e.id}`} entry={e} className={LANDSCAPE_W} />)}
    </Shelf>
  );
}