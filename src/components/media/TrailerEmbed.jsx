import React from 'react';

export default function TrailerEmbed({ youtubeKey, title, autoplay = false }) {
  if (!youtubeKey) return null;
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${youtubeKey}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`}
        title={`${title} trailer`}
        aria-label={`${title} trailer`}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}