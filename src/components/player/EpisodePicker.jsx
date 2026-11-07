import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EpisodePicker({ seasons = [], seasonDetails = [], season, episode, onChange }) {
  const options = seasonDetails.length
    ? seasonDetails
    : seasons.map((episodeCount, index) => ({ number: index + 1, name: `Season ${index + 1}`, episodeCount }));
  const selectedSeason = options.find((option) => option.number === season);
  const count = selectedSeason?.episodeCount || 1;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={String(season)} onValueChange={(v) => onChange(Number(v), 1)}>
        <SelectTrigger aria-label="Season" className="h-10 w-36 rounded-full border-white/10 bg-[#151515]"><SelectValue /></SelectTrigger>
        <SelectContent className="border-white/10 bg-[#151515]">
          {options.map((option) => <SelectItem key={option.number} value={String(option.number)}>{option.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={String(episode)} onValueChange={(v) => onChange(season, Number(v))}>
        <SelectTrigger aria-label="Episode" className="h-10 w-36 rounded-full border-white/10 bg-[#151515]"><SelectValue /></SelectTrigger>
        <SelectContent className="max-h-72 border-white/10 bg-[#151515]">
          {Array.from({ length: count }).map((_, i) => <SelectItem key={i} value={String(i + 1)}>Episode {i + 1}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
