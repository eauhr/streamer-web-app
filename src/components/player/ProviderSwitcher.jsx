import React from 'react';
import useStore from '@/hooks/useStore';
import { AUTO_PROVIDER_ORDER, PROVIDER_GROUPS, getProvider } from '@/lib/player';
import { providerStore, sourceAdvisor } from '@/lib/storage';

export default function ProviderSwitcher({ mediaType, mediaId, className = '' }) {
  const selected = useStore(() => providerStore.get(), []);
  const active = useStore(() => providerStore.getForTitle(mediaType, mediaId, AUTO_PROVIDER_ORDER), [mediaType, mediaId]);
  const report = (kind) => sourceAdvisor.report(mediaType, mediaId, active, kind);
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="space-y-3">
        <button
          type="button"
          aria-pressed={selected === 'auto'}
          onClick={() => providerStore.set('auto')}
          className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition ${selected === 'auto' ? 'border-teev-lime bg-teev-lime text-black' : 'border-white/15 text-[#A1A1AA] hover:text-white'}`}
        >
          Auto · best known
        </button>
        <span className="ml-2 text-xs text-[#A1A1AA]">Selected: {getProvider(active).name}</span>
        {PROVIDER_GROUPS.map((group) => {
          const available = group.providers.filter((id) => getProvider(id).supports.includes(mediaType));
          if (!available.length) return null;
          return (
            <div key={group.id} role="group" aria-label={group.label} className="space-y-2">
              <p className="text-xs font-medium text-[#A1A1AA]">{group.label}</p>
              <div className="flex flex-wrap items-center gap-2">
                {available.map((id) => {
                  const provider = getProvider(id);
                  const isActive = selected === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => providerStore.set(id)}
                      className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition ${isActive ? 'border-teev-lime bg-teev-lime text-black' : 'border-white/15 text-[#A1A1AA] hover:text-white'}`}
                    >
                      {provider.name}
                    </button>
                  );
                })}
              </div>
            </div>
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
