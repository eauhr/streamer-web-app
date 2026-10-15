import React from 'react';
import { GENRES } from '@/lib/tmdb';

export default function GenreChips({ genres, active, onChange }) {
  return (
    <div role="group" aria-label="Filter by genre" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      <button type="button" aria-pressed={!active} onClick={() => onChange(null)} className={`chip ${!active ? 'chip-active' : ''}`}>All</button>
      {genres.map((genre) => {
        const id = typeof genre === 'object' ? Number(genre.id) : Number(genre);
        const name = typeof genre === 'object' ? genre.name : GENRES[id];
        return (
        <button key={id} type="button" aria-pressed={active === id} onClick={() => onChange(id)} className={`chip ${active === id ? 'chip-active' : ''}`}>
          {name}
        </button>
        );
      })}
    </div>
  );
}
