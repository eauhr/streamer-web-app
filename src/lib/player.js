// Playback provider configuration. Add another provider here and switch via the Source switcher.
export const PLAYER_PROVIDERS = {
  peachify: {
    id: 'peachify',
    name: 'Peachify',
    origin: 'https://peachify.top',
    originMatch: 'peachify',
    supports: ['movie', 'tv'],
    buildUrl({ type, id, season = 1, episode = 1, startAt = 0, autoplay = true, color }) {
      const path = type === 'tv' ? `/embed/tv/${id}/${season}/${episode}` : `/embed/movie/${id}`;
      const params = new URLSearchParams();
      if (autoplay) params.set('autoplay', 'true');
      if (startAt > 0) params.set('progress', String(Math.floor(startAt)));
      if (color) params.set('color', color.replace('#', ''));
      const qs = params.toString();
      return `${this.origin}${path}${qs ? `?${qs}` : ''}`;
    },
  },
  vidnest: {
    id: 'vidnest',
    name: 'VidNest',
    origin: 'https://vidnest.pro',
    originMatch: 'vidnest',
    supports: ['movie', 'tv'],
    buildUrl({ type, id, season = 1, episode = 1, startAt = 0, autoplay = true }) {
      const path = type === 'tv' ? `/tv/${id}/${season}/${episode}` : `/movie/${id}`;
      const params = new URLSearchParams();
      if (autoplay) params.set('autoplay', '1');
      if (startAt > 0) params.set('t', String(Math.floor(startAt)));
      const qs = params.toString();
      return `${this.origin}${path}${qs ? `?${qs}` : ''}`;
    },
  },
  vidrift: {
    id: 'vidrift',
    name: 'VidRift',
    origin: 'https://embed.vidrift.net',
    supports: ['movie', 'tv'],
    buildUrl({ type, id, season = 1, episode = 1, autoplay = true }) {
      const path = type === 'tv'
        ? `/embed/tv/${id}/${season}/${episode}`
        : `/embed/movie/${id}`;
      const params = new URLSearchParams();
      if (!autoplay) params.set('autoplay', '0');
      const query = params.toString();
      return `${this.origin}${path}${query ? `?${query}` : ''}`;
    },
  },
  vidcore: {
    id: 'vidcore',
    name: 'VidCore',
    origin: 'https://vidcore.io',
    originMatch: 'vidcore',
    supports: ['movie', 'tv'],
    buildUrl({ type, id, season = 1, episode = 1, startAt = 0, autoplay = true, color }) {
      const path = type === 'tv' ? `/tv/${id}/${season}/${episode}` : `/movie/${id}`;
      const params = new URLSearchParams();
      if (autoplay) params.set('autoPlay', 'true');
      if (startAt > 0) params.set('startAt', String(Math.floor(startAt)));
      if (color) params.set('theme', color.replace('#', ''));
      const qs = params.toString();
      return `${this.origin}${path}${qs ? `?${qs}` : ''}`;
    },
  },
  embos: {
    id: 'embos',
    name: 'Embos',
    origin: 'https://embos.top',
    originMatch: 'embos',
    supports: ['movie', 'tv'],
    buildUrl({ type, id, season = 1, episode = 1, startAt = 0, autoplay = true }) {
      const path = type === 'tv' ? '/tv/' : '/movie/';
      const params = new URLSearchParams();
      params.set('mid', String(id));
      if (type === 'tv') { params.set('s', String(season)); params.set('e', String(episode)); }
      if (autoplay) params.set('autoPlay', 'true');
      if (startAt > 0) params.set('startAt', String(Math.floor(startAt)));
      return `${this.origin}${path}?${params.toString()}`;
    },
  },
  vidlink: {
    id: 'vidlink',
    name: 'VidLink',
    origin: 'https://vidlink.pro',
    originMatch: 'vidlink',
    supports: ['movie', 'tv'],
    buildUrl({ type, id, season = 1, episode = 1, startAt = 0, autoplay = true, color }) {
      const path = type === 'tv' ? `/tv/${id}/${season}/${episode}` : `/movie/${id}`;
      const params = new URLSearchParams();
      params.set('primaryColor', (color || '#E7FF4F').replace('#', ''));
      params.set('secondaryColor', '8a9a2e');
      params.set('icons', 'vid');
      params.set('title', 'false');
      params.set('poster', 'false');
      params.set('autoplay', autoplay ? 'true' : 'false');
      if (type === 'tv') params.set('nextbutton', 'true');
      if (startAt > 0) params.set('startAt', String(Math.floor(startAt)));
      return `${this.origin}${path}?${params.toString()}`;
    },
  },
};

export const PROVIDER_ORDER = ['peachify', 'vidnest', 'vidrift', 'vidcore', 'embos', 'vidlink'];
export const DEFAULT_PROVIDER = 'peachify';
export const getProvider = (id) => PLAYER_PROVIDERS[id] || PLAYER_PROVIDERS[DEFAULT_PROVIDER];

// Normalizes player postMessage payloads across providers:
// - VidNest / VidCore PLAYER_EVENT wrapper: { type: 'PLAYER_EVENT', data: { event, currentTime, duration } }
// - VidCore direct event: { type: 'timeupdate', data: { currentTime, duration, percent } }
// - Generic flat: { event, currentTime, duration }
export function parsePlayerMessage(raw) {
  let d = raw;
  if (typeof d === 'string') {
    try { d = JSON.parse(d); } catch { return null; }
  }
  if (!d || typeof d !== 'object') return null;
  if (d.type === 'PLAYER_EVENT' && d.data) d = d.data;
  if (d.data && (d.data.currentTime != null || d.data.duration != null) && d.currentTime == null) {
    d = { event: d.type, ...d.data };
  }
  const time = Number(d.currentTime ?? d.time ?? d.position);
  const duration = Number(d.duration);
  return {
    event: String(d.event || d.type || '').toLowerCase(),
    currentTime: Number.isFinite(time) ? time : null,
    duration: Number.isFinite(duration) && duration > 0 ? duration : null,
  };
}
