import React, { useEffect, useMemo, useRef } from 'react';
import useStore from '@/hooks/useStore';
import { getProvider, parsePlayerMessage } from '@/lib/player';
import { continueStore, providerStore } from '@/lib/storage';

export default function Player({ item, season = 1, episode = 1, startAt = 0, autoplay = true, onEnded }) {
  const providerId = useStore(() => providerStore.get(), []);
  const provider = getProvider(providerId);
  const isTv = item.mediaType === 'tv';
  const src = useMemo(
    () => provider.buildUrl({ type: item.mediaType, id: item.id, season, episode, startAt, autoplay }),
    [provider.id, item.id, item.mediaType, season, episode, startAt, autoplay]
  );
  const iframeRef = useRef(null);
  const state = useRef({});

  useEffect(() => {
    state.current = { watched: startAt, duration: ((isTv ? item.episodeRuntime : item.runtime) || 45) * 60, lastSave: 0, ended: false };
    const save = () => {
      if (state.current.ended) return;
      continueStore.save({
        id: item.id, type: item.mediaType, title: item.title,
        season: isTv ? season : undefined, episode: isTv ? episode : undefined,
        watchedSeconds: Math.floor(state.current.watched), durationSeconds: Math.floor(state.current.duration),
        poster: item.posterPath, backdrop: item.backdropPath,
      });
    };
    const onMessage = (e) => {
      if (e.origin !== provider.origin) return;
      const m = parsePlayerMessage(e.data);
      if (!m) return;
      if (m.duration) state.current.duration = m.duration;
      if (m.currentTime != null) state.current.watched = m.currentTime;
      if (/end|complete/.test(m.event)) {
        state.current.ended = true;
        continueStore.remove(item.mediaType, item.id);
        onEnded?.();
      } else if (/pause/.test(m.event)) {
        save();
      } else if (Date.now() - state.current.lastSave > 10000) {
        state.current.lastSave = Date.now();
        save();
      }
    };
    save();
    window.addEventListener('message', onMessage);
    window.addEventListener('beforeunload', save);
    return () => {
      save();
      window.removeEventListener('message', onMessage);
      window.removeEventListener('beforeunload', save);
    };
  }, [src]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
      <iframe
        key={src}
        ref={iframeRef}
        src={src}
        title={`${item.title}${isTv ? ` season ${season} episode ${episode}` : ''} player`}
        sandbox={provider.sandbox}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        referrerPolicy="origin"
        onLoad={() => {
          if (provider.id === 'vidrift' && startAt > 0) {
            iframeRef.current?.contentWindow?.postMessage(
              { type: 'vidrift:resume', currentTime: startAt },
              provider.origin
            );
          }
        }}
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
