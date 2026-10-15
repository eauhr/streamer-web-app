import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Info, Play, Star } from 'lucide-react';
import { backdropUrl, detailsHref, formatRating, posterUrl, releaseYear, typeLabel } from '@/lib/tmdb';

export default function Hero({ items = [] }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || items.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 9000);
    return () => clearInterval(t);
  }, [items.length, reduce]);

  const item = items[index];
  if (!item) return <div className="h-[72vh] min-h-[520px] animate-pulse bg-[#111111]" />;

  return (
    <section aria-label="Featured title" className="relative h-[76vh] min-h-[540px] max-h-[860px] w-full overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        <motion.img
          key={item.id}
          src={backdropUrl(item.backdropPath, 'original') || posterUrl(item.posterPath, 'original')}
          alt=""
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute inset-0 h-full w-full object-cover object-[60%_20%]"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#090909] via-[#090909]/60 to-transparent" />

      <div className="container-teev relative flex h-full items-end pb-12 lg:pb-20">
        <AnimatePresence mode="wait">
          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="max-w-xl">
            <p className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-teev-lime">
              <span className="h-1.5 w-1.5 rounded-full bg-teev-lime" aria-hidden="true" /> Featured on TeeV
            </p>
            <p className="flex items-center gap-2 text-sm text-[#A1A1AA]">
              {typeLabel(item)} <span aria-hidden="true">·</span> {releaseYear(item)} <span aria-hidden="true">·</span>
              <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> {formatRating(item.voteAverage)}
            </p>
            <h1 className="mt-2 text-[2.6rem] font-extrabold leading-[0.95] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">{item.title}</h1>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`${detailsHref(item)}&play=1`} className="btn-primary"><Play className="h-4 w-4 fill-current" aria-hidden="true" /> Watch now</Link>
              <Link to={detailsHref(item)} className="btn-ghost"><Info className="h-4 w-4" aria-hidden="true" /> Details</Link>
            </div>
            <p className="mt-5 line-clamp-3 max-w-lg text-sm leading-relaxed text-[#D4D4D8] sm:text-base">{item.overview}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}