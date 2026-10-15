import React from 'react';
import { Link } from 'react-router-dom';

const SIZES = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };

export default function Logo({ size = 'md', icon = true, asLink = true }) {
  const mark = (
    <span className="inline-flex select-none items-center gap-2">
      {icon && (
        <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-teev-lime text-[10px] font-extrabold tracking-tight text-black">
          TV
        </span>
      )}
      <span className={`${SIZES[size]} font-extrabold leading-none tracking-[-0.04em]`}>
        <span className="text-white">Tee</span>
        <span className="text-teev-lime">V</span>
      </span>
    </span>
  );
  if (!asLink) return mark;
  return (
    <Link to="/" aria-label="TeeV home" className="rounded-md">
      {mark}
    </Link>
  );
}