import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Artwork from '@/components/media/Artwork';
import TrailerEmbed from '@/components/media/TrailerEmbed';
import { backdropUrl, detailsHref } from '@/lib/tmdb';

export default function TrailerCard({ item, className = '' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`group snap-start text-left ${className}`} aria-label={`Play ${item.title} trailer`}>
        <div className="relative aspect-video overflow-hidden rounded-lg bg-[#151515]">
          <Artwork src={backdropUrl(item.backdropPath || item.posterPath, 'w780')} alt="" title={item.title} className="h-full w-full transition duration-200 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition group-hover:bg-white group-hover:text-black">
            <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> Trailer
          </span>
        </div>
        <p className="mt-2.5 truncate text-sm font-medium text-white">{item.title}</p>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl gap-4 border-white/10 bg-[#111111] p-4 sm:p-5">
          <DialogTitle className="text-base font-semibold">{item.title}</DialogTitle>
          {open && <TrailerEmbed youtubeKey={item.trailerKey} title={item.title} autoplay />}
          <Link to={detailsHref(item)} className="text-sm text-[#A1A1AA] underline underline-offset-4 hover:text-white">View details</Link>
        </DialogContent>
      </Dialog>
    </>
  );
}