import React from 'react';
import useStore from '@/hooks/useStore';
import { PROVIDER_ORDER, getProvider } from '@/lib/player';
import { providerStore } from '@/lib/storage';

export default function ProviderSwitcher({ className = '' }) {
  const active = useStore(() => providerStore.get(), []);
  return (
    <div role="group" aria-label="Streaming source" className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-xs text-[#A1A1AA]">Source:</span>
      {PROVIDER_ORDER.map((id) => {
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
  );
}