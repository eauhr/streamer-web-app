import React from 'react';
import { Switch } from '@/components/ui/switch';
import { PROVIDER_ORDER, getProvider } from '@/lib/player';

const field = 'h-11 w-full rounded-lg border border-white/10 bg-[#151515] px-3 text-sm text-white focus:border-white/30 focus:outline-none';
const Label = ({ children, htmlFor }) => <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">{children}</label>;

export default function BuilderForm({ value, onChange }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e?.target ? e.target.value : e });
  return (
    <div className="card-surface grid gap-4 p-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <span className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">Source</span>
        <div role="group" aria-label="Source" className="flex flex-wrap gap-2">
          {PROVIDER_ORDER.map((id) => (
            <button key={id} type="button" aria-pressed={value.provider === id} onClick={() => onChange({ ...value, provider: id })} className={`chip ${value.provider === id ? 'chip-active' : ''}`}>
              {getProvider(id).name}
            </button>
          ))}
        </div>
      </div>
      <div className="sm:col-span-2">
        <span className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">Content type</span>
        <div role="group" aria-label="Content type" className="flex gap-2">
          {['movie', 'tv'].map((t) => (
            <button key={t} type="button" aria-pressed={value.type === t} onClick={() => onChange({ ...value, type: t })} className={`chip ${value.type === t ? 'chip-active' : ''}`}>
              {t === 'movie' ? 'Movie' : 'TV episode'}
            </button>
          ))}
        </div>
      </div>
      <div className="sm:col-span-2"><Label htmlFor="b-id">TMDB or IMDb ID</Label><input id="b-id" className={field} value={value.id} onChange={set('id')} placeholder="e.g. 27205 or tt1375666" /></div>
      {value.type === 'tv' && (
        <>
          <div><Label htmlFor="b-s">Season</Label><input id="b-s" type="number" min="1" className={field} value={value.season} onChange={set('season')} /></div>
          <div><Label htmlFor="b-e">Episode</Label><input id="b-e" type="number" min="1" className={field} value={value.episode} onChange={set('episode')} /></div>
        </>
      )}
      <div><Label htmlFor="b-start">Start time (seconds)</Label><input id="b-start" type="number" min="0" className={field} value={value.startAt} onChange={set('startAt')} /></div>
      <div><Label htmlFor="b-color">Accent color</Label><input id="b-color" type="color" className={`${field} p-1`} value={value.color} onChange={set('color')} /></div>
      <label className="flex items-center justify-between gap-3 text-sm text-white">Autoplay <Switch checked={value.autoplay} onCheckedChange={set('autoplay')} /></label>
      {value.type === 'tv' && <label className="flex items-center justify-between gap-3 text-sm text-white">Next episode <Switch checked={value.nextEpisode} onCheckedChange={set('nextEpisode')} /></label>}
    </div>
  );
}