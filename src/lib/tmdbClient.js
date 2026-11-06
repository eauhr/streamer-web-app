import { normalizeMedia } from '@/lib/tmdb';

const BASE = '/api/tmdb';

// The token stays in the Vite server environment and is never bundled into browser code.
export const tmdbEnabled = () => import.meta.env.VITE_TMDB_ENABLED === true;

async function get(path, params = {}) {
  const url = new URL(`${BASE}${path}`, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

export async function tmdbSearch(query, page = 1) {
  const data = await get('/search/multi', { query, include_adult: 'false', language: 'en-US', page });
  const items = (data.results || []).flatMap((result) => {
    if (result.media_type === 'movie' || result.media_type === 'tv') {
      return [normalizeMedia(result)];
    }
    if (result.media_type === 'person') {
      return (result.known_for || [])
        .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
        .map((item) => normalizeMedia(item, item.media_type));
    }
    return [];
  });
  const uniqueItems = new Map();
  items.forEach((item) => uniqueItems.set(`${item.mediaType}:${item.id}`, item));
  const results = [...uniqueItems.values()];
  return { items: results, page: data.page || page, totalPages: data.total_pages || 1, totalResults: data.total_results || results.length };
}

export async function tmdbBrowse(type, { page = 1, genre = null, sortBy = 'popularity.desc' } = {}) {
  const data = await get(`/discover/${type}`, {
    page,
    with_genres: genre,
    sort_by: sortBy,
    'vote_count.gte': sortBy === 'vote_average.desc' ? 1000 : undefined,
    include_adult: 'false',
    language: 'en-US',
  });
  const items = (data.results || []).map((r) => normalizeMedia(r, type));
  return {
    items,
    page: data.page || page,
    totalPages: Math.min(data.total_pages || 1, 500),
    totalResults: data.total_results || items.length,
  };
}

export async function tmdbGenres(type) {
  const data = await get(`/genre/${type}/list`, { language: 'en-US' });
  return data.genres || [];
}

export async function tmdbProviderRegions() {
  const data = await get('/watch/providers/regions', { language: 'en-US' });
  return data.results || [];
}

export async function tmdbWatchProviders(type, id) {
  const data = await get(`/${type}/${id}/watch/providers`);
  return data.results || {};
}

export async function tmdbDetails(type, id) {
  const data = await get(`/${type}/${id}`, { append_to_response: 'credits,videos', language: 'en-US' });
  return normalizeMedia(data, type);
}

export async function tmdbRecommendations(type, id, page = 1) {
  const data = await get(`/${type}/${id}/recommendations`, { page, language: 'en-US' });
  return (data.results || []).map((item) => normalizeMedia(item, type));
}

export async function tmdbTrending(window = 'week') {
  const data = await get(`/trending/all/${window}`);
  return (data.results || []).map((r) => normalizeMedia(r));
}
