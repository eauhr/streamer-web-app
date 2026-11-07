import React, { useEffect, useState } from 'react';

export default function Artwork({ src, alt, title = '', className = '', eager = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) {
    return (
      <div role="img" aria-label={alt} className={`flex items-end bg-gradient-to-br from-[#1D1D1F] via-[#151515] to-black p-3 ${className}`}>
        {title && <span className="line-clamp-2 text-sm font-semibold text-white/80">{title}</span>}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
