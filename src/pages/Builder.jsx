import React, { useState } from 'react';
import { getProvider } from '@/lib/player';
import PageHeader from '@/components/PageHeader';
import BuilderForm from '@/components/builder/BuilderForm';
import CodeBlock from '@/components/docs/CodeBlock';

export default function Builder() {
  const [cfg, setCfg] = useState({ provider: 'peachify', type: 'movie', id: '27205', season: 1, episode: 1, startAt: 0, autoplay: false, nextEpisode: true, color: '#E7FF4F' });
  const url = getProvider(cfg.provider).buildUrl({ ...cfg, id: cfg.id.trim() || '27205', season: Number(cfg.season) || 1, episode: Number(cfg.episode) || 1, startAt: Number(cfg.startAt) || 0 });
  const snippet = `<iframe\n  src="${url}"\n  width="100%"\n  style="aspect-ratio: 16 / 9; border: 0;"\n  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"\n  allowfullscreen\n></iframe>`;

  return (
    <div>
      <PageHeader title="Embed builder" description="Configure a player and copy a ready-to-paste iframe snippet for your site." />
      <div className="container-teev grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <BuilderForm value={cfg} onChange={setCfg} />
        <div className="min-w-0 space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
            <iframe key={url} src={url} title="Embed preview player" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen className="absolute inset-0 h-full w-full" />
          </div>
          <CodeBlock code={snippet} label="Copy embed snippet" />
        </div>
      </div>
    </div>
  );
}