import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/lib/catalogApi';
import { posterUrl } from '@/lib/tmdb';
import { tmdbEnabled } from '@/lib/tmdbClient';

const CATEGORIES = [
  ['flatrate', 'Subscription'],
  ['free', 'Free'],
  ['ads', 'Free with ads'],
  ['rent', 'Rent'],
  ['buy', 'Buy'],
];

function aggregateWorldwide(regions) {
  const rows = Object.entries(regions || {});
  return CATEGORIES.map(([key, label]) => {
    const providers = new Map();
    rows.forEach(([regionCode, availability]) => {
      (availability[key] || []).forEach((provider) => {
        const current = providers.get(provider.provider_id) || { ...provider, regionCodes: new Set() };
        current.regionCodes.add(regionCode);
        providers.set(provider.provider_id, current);
      });
    });
    return [label, [...providers.values()].map((provider) => ({ ...provider, regionCount: provider.regionCodes.size }))];
  }).filter(([, providers]) => providers.length);
}

function ProviderList({ providerGroups, worldwide }) {
  if (!providerGroups.length) return <p className="text-sm text-[#A1A1AA]">No licensed streaming availability was reported for this selection.</p>;
  return <div className="space-y-4">
    {providerGroups.map(([label, providers]) => <div key={label}>
      <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-[#777]">{label}</h4>
      <ul className="flex flex-wrap gap-2">
        {providers.map((provider) => <li key={provider.provider_id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm text-white">
          {provider.logo_path && <img src={posterUrl(provider.logo_path, 'w45')} alt="" loading="lazy" className="h-6 w-6 rounded object-contain" />}
          <span>{provider.provider_name}</span>
          {worldwide && <span className="text-xs text-[#888]">{provider.regionCount} regions</span>}
        </li>)}
      </ul>
    </div>)}
  </div>;
}

export default function Availability({ item }) {
  const [regionCode, setRegionCode] = useState('BG');
  const enabled = tmdbEnabled();
  const { data: regions = [], isLoading: regionsLoading } = useQuery({
    queryKey: ['provider-regions'],
    queryFn: catalogApi.providerRegions,
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
  });
  const { data: providerData = {}, isLoading } = useQuery({
    queryKey: ['watch-providers', item.mediaType, item.id],
    queryFn: () => catalogApi.watchProviders(item.mediaType, item.id),
    enabled,
    staleTime: 60 * 60 * 1000,
  });

  const country = providerData[regionCode];
  const worldwideGroups = useMemo(() => aggregateWorldwide(providerData), [providerData]);
  const countryGroups = CATEGORIES
    .filter(([key]) => country?.[key]?.length)
    .map(([key, label]) => [label, country[key]]);
  const selectedRegion = regions.find((region) => region.iso_3166_1 === regionCode);
  const worldUrl = `https://www.themoviedb.org/${item.mediaType}/${item.id}/watch`;

  return (
    <section className="card-surface mt-8 space-y-5 p-5" aria-labelledby="availability-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="availability-title" className="text-lg font-semibold text-white">Where to watch</h2>
          <p className="mt-1 text-xs text-[#888]">Licensed availability data from JustWatch via TMDB.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-[#A1A1AA]">
          <span className="sr-only">Availability region</span>
          <select value={regionCode} onChange={(event) => setRegionCode(event.target.value)} disabled={!enabled || regionsLoading} className="rounded-md border border-white/15 bg-[#151515] px-3 py-2 text-white disabled:opacity-50">
            <option value="BG">Bulgaria</option>
            <option value="WORLD">Worldwide</option>
            {regions.filter((region) => region.iso_3166_1 !== 'BG').map((region) => <option key={region.iso_3166_1} value={region.iso_3166_1}>{region.english_name}</option>)}
          </select>
        </label>
      </div>

      {!enabled && <p className="text-sm text-[#A1A1AA]">Add your TMDB server token to enable worldwide availability lookup.</p>}
      {enabled && isLoading && <p className="text-sm text-[#A1A1AA]">Checking licensed providers…</p>}
      {enabled && !isLoading && <ProviderList
        providerGroups={regionCode === 'WORLD' ? worldwideGroups : countryGroups}
        worldwide={regionCode === 'WORLD'}
      />}
      {enabled && <a href={regionCode === 'WORLD' ? worldUrl : (country?.link || worldUrl)} target="_blank" rel="noreferrer" className="inline-flex text-sm text-teev-lime underline underline-offset-4">
        {regionCode === 'WORLD' ? 'Browse availability on TMDB' : `Browse ${selectedRegion?.english_name || 'regional'} availability on TMDB`}
      </a>}
    </section>
  );
}
