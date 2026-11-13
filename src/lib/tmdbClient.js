import { normalizeMedia } from '@/lib/tmdb';

const BASE = '/api/tmdb';

// The token stays in the Vite server environment and is never bundled into browser code.
export const tmdbEnabled = () => [true, 'true'].includes(import.meta.env.VITE_TMDB_ENABLED);

async function get(path, params = {}) {
  const url = new URL(BASE, window.location.origin);
  url.searchParams.set('path', path);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

export async function tmdbSearch(query, page = 1) {
  const [multiResult, tvResult] = await Promise.allSettled([
    get('/search/multi', { query, include_adult: 'false', language: 'en-US', page }),
    get('/search/tv', { query, include_adult: 'false', language: 'en-US', page }),
  ]);
  if (multiResult.status === 'rejected' && tvResult.status === 'rejected') throw multiResult.reason;
  const multi = multiResult.status === 'fulfilled' ? multiResult.value : { results: [] };
  const tv = tvResult.status === 'fulfilled' ? tvResult.value : { results: [] };
  const items = (multi.results || []).flatMap((result) => {
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
  (tv.results || []).forEach((result) => items.push(normalizeMedia(result, 'tv')));
  const uniqueItems = new Map();
  items.forEach((item) => uniqueItems.set(`${item.mediaType}:${item.id}`, item));
  const results = [...uniqueItems.values()];
  return {
    items: results,
    page: multi.page || tv.page || page,
    totalPages: Math.max(multi.total_pages || 1, tv.total_pages || 1),
    totalResults: Math.max(multi.total_results || 0, tv.total_results || 0, results.length),
  };
}

export async function tmdbBrowse(type, { page = 1, genre = null, sortBy = 'popularity.desc', originalLanguage = null } = {}) {
  const data = await get(`/discover/${type}`, {
    page,
    with_genres: genre,
    with_original_language: originalLanguage,
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

export async function tmdbLanguages() {
  const data = await get('/configuration/languages');
  return (data || [])
    .filter((language) => language.iso_639_1 && language.english_name)
    .sort((a, b) => a.english_name.localeCompare(b.english_name));
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

export async function tmdbPerson(id) {
  const [person, credits] = await Promise.all([
    get(`/person/${id}`, { language: 'en-US' }),
    get(`/person/${id}/combined_credits`, { language: 'en-US' }),
  ]);
  const seen = new Map();
  [...(credits.cast || []), ...(credits.crew || []).filter((credit) => credit.job === 'Director')].forEach((credit) => {
    if (credit.media_type !== 'movie' && credit.media_type !== 'tv') return;
    if (!credit.poster_path) return;
    if ((credit.genre_ids || []).some((genre) => genre === 10767 || genre === 10763)) return;
    if (/\b(?:self|himself|herself)\b/i.test(credit.character || '')) return;
    const key = `${credit.media_type}:${credit.id}`;
    if (!seen.has(key)) seen.set(key, credit);
  });
  const items = [...seen.values()]
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .map((credit) => normalizeMedia(credit));
  return {
    id: person.id,
    name: person.name,
    biography: person.biography || '',
    birthday: person.birthday,
    deathday: person.deathday,
    placeOfBirth: person.place_of_birth,
    department: person.known_for_department,
    profilePath: person.profile_path,
    items,
  };
}

export async function tmdbRecommendations(type, id, page = 1) {
  const data = await get(`/${type}/${id}/recommendations`, { page, language: 'en-US' });
  return (data.results || []).map((item) => normalizeMedia(item, type));
}

export async function tmdbTrending(timeWindow = 'week') {
  const data = await get(`/trending/all/${timeWindow}`);
  return (data.results || []).map((r) => normalizeMedia(r));
}
