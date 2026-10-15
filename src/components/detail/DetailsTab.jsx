import React from 'react';
import { genreNames, releaseYear } from '@/lib/tmdb';
import { advisoryFor } from '@/components/detail/advisory';

const Card = ({ title, children }) => (
  <section className="card-surface p-5">
    <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>
    <div className="space-y-1.5 text-sm leading-relaxed text-[#A1A1AA]">{children}</div>
  </section>
);
const Row = ({ k, v }) => <p><span className="text-[#666]">{k}: </span><span className="text-[#D4D4D8]">{v}</span></p>;

export default function DetailsTab({ item }) {
  const isTv = item.mediaType === 'tv';
  const audio = [...new Set([item.language || 'English', 'English', 'Spanish'])];
  return (
    <div className="grid gap-4 pt-8 md:grid-cols-2">
      <Card title="Main information">
        <Row k="Title" v={item.title} />
        <Row k="Type" v={isTv ? 'Series' : 'Movie'} />
        <Row k="Released" v={releaseYear(item)} />
        <Row k={isTv ? 'Seasons' : 'Runtime'} v={isTv ? `${item.seasons.length} (${item.seasons.reduce((a, b) => a + b, 0)} episodes)` : `${item.runtime} min`} />
        <Row k="Genres" v={genreNames(item.genreIds).join(', ')} />
      </Card>
      <Card title="Creators and cast">
        <Row k={isTv ? 'Created by' : 'Directed by'} v={(item.creators || []).join(', ')} />
        <Row k="Starring" v={(item.cast || []).join(', ')} />
      </Card>
      <Card title="Studio"><p className="text-[#D4D4D8]">{item.studio}</p></Card>
      <Card title="Audio languages"><p className="text-[#D4D4D8]">{audio.join(', ')}</p></Card>
      <Card title="Subtitles"><p className="text-[#D4D4D8]">English [CC], Spanish, French, German, Portuguese</p></Card>
      <Card title="Content advisory">
        <Row k="Rating" v={item.certification} />
        <p>{advisoryFor(item.certification)}</p>
      </Card>
    </div>
  );
}