import React from 'react';
import useStore from '@/hooks/useStore';
import { PROVIDER_ORDER, getProvider } from '@/lib/player';
import { providerStore, sourceAdvisor } from '@/lib/storage';

export default function ProviderSwitcher({ mediaType, mediaId, className = '' }) {
  const selected = useStore(() => providerStore.get(), []);
  const active = useStore(() => providerStore.getForTitle(mediaType, mediaId, PROVIDER_ORDER), [mediaType, mediaId]);
  const report = (kind) => sourceAdvisor.report(mediaType, mediaId, active, kind);
  return (
    <div className={`space-y-2 ${className}`}>
      <div role="group" aria-label="Streaming source" className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-[#A1A1AA]">Source:</span>
        <button
          type="button"
          aria-pressed={selected === 'auto'}
          onClick={() => providerStore.set('auto')}
          className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition ${selected === 'auto' ? 'border-teev-lime bg-teev-lime text-black' : 'border-white/15 text-[#A1A1AA] hover:text-white'}`}
        >
          Auto
        </button>
        {PROVIDER_ORDER.filter((id) => getProvider(id).supports.includes(mediaType)).map((id) => {
        const p = getProvider(id);
        const on = active === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            onClick={() => providerStore.set(id)}
            className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition ${on ? 'border-teev-lime bg-teev-lime text-black' : 'border-white/15 text-[#A1A1AA] hover:text-white'}`}
          >
            {p.name}
          </button>
        );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-[#A1A1AA]" aria-label="Rate current source">
        <span>Help Auto choose:</span>
        <button type="button" onClick={() => report('works')} className="underline underline-offset-2 hover:text-white">Works</button>
        <button type="button" onClick={() => report('unavailable')} className="underline underline-offset-2 hover:text-white">Unavailable</button>
        <button type="button" onClick={() => report('ads')} className="underline underline-offset-2 hover:text-white">Too many ads</button>
      </div>
    </div>
  );
}
