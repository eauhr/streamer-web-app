import { CATALOG, HERO_IDS } from '@/lib/catalog';
import { genreNames } from '@/lib/tmdb';
import { tmdbEnabled, tmdbSearch, tmdbDetails, tmdbTrending, tmdbBrowse, tmdbGenres, tmdbProviderRegions, tmdbWatchProviders } from '@/lib/tmdbClient';

// Single data access layer. Uses live TMDB when a key is set in tmdbClient.js,
// and falls back to the curated local catalog when it's missing or a call fails.
const byType = (type) => CATALOG.filter((i) => i.mediaType === type);
const find = (type, id) => CATALOG.find((i) => i.mediaType === type && String(i.id) === String(id)) || null;

const localSearch = (query) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CATALOG.filter((i) =>
    [i.title, ...(i.cast || []), ...(i.creators || []), ...genreNames(i.genreIds)]
      .some((s) => s.toLowerCase().includes(q))
  );
};

export const catalogApi = {
  hero: async () => HERO_IDS.map((id) => CATALOG.find((i) => i.id === id)).filter(Boolean),
  trending: async () => {
    if (tmdbEnabled()) { try { return await tmdbTrending(); } catch { /* fall back to local */ } }
    return CATALOG.slice(0, 14);
  },
  popular: async (type) => {
    if (tmdbEnabled()) { try { return (await tmdbBrowse(type)).items; } catch { /* fall back to local */ } }
    return byType(type);
  },
  topRated: async (type) => {
    if (tmdbEnabled()) { try { return (await tmdbBrowse(type, { sortBy: 'vote_average.desc' })).items; } catch { /* fall back to local */ } }
    return [...byType(type)].sort((a, b) => b.voteAverage - a.voteAverage);
  },
  browse: async (type, page = 1, genre = null) => {
    if (tmdbEnabled()) {
      try { return await tmdbBrowse(type, { page, genre }); } catch { /* fall back to local */ }
    }
    const local = byType(type);
    const filtered = genre ? local.filter((item) => item.genreIds.includes(Number(genre))) : local;
    const pageSize = 24;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    return { items: filtered.slice((safePage - 1) * pageSize, safePage * pageSize), page: safePage, totalPages, totalResults: filtered.length };
  },
  genres: async (type) => {
    if (tmdbEnabled()) { try { return await tmdbGenres(type); } catch { /* fall back to local */ } }
    return [...new Set(byType(type).flatMap((item) => item.genreIds))]
      .map((id) => ({ id, name: genreNames([id])[0] }))
      .filter((genre) => genre.name);
  },
  providerRegions: async () => {
    if (!tmdbEnabled()) return [];
    try { return await tmdbProviderRegions(); } catch { return []; }
  },
  watchProviders: async (type, id) => {
    if (!tmdbEnabled()) return {};
    try { return await tmdbWatchProviders(type, id); } catch { return {}; }
  },
  trailers: async () => CATALOG.filter((i) => i.trailerKey).slice(0, 10),
  details: async (type, id) => {
    if (tmdbEnabled()) { try { return await tmdbDetails(type, id); } catch { /* fall back to local */ } }
    return find(type, id);
  },
  search: async (query, page = 1) => {
    if (!query.trim()) return { items: [], page: 1, totalPages: 1, totalResults: 0 };
    if (tmdbEnabled()) { try { return await tmdbSearch(query, page); } catch { /* fall back to local */ } }
    const items = localSearch(query);
    return { items, page: 1, totalPages: 1, totalResults: items.length };
  },
  related: async (item) =>
    CATALOG.filter((i) => i.id !== item.id)
      .map((i) => ({ i, score: i.genreIds.filter((g) => item.genreIds.includes(g)).length + (i.mediaType === item.mediaType ? 0.5 : 0) }))
      .filter((x) => x.score > 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((x) => x.i),
  genresFor: (type) => [...new Set(byType(type).flatMap((i) => i.genreIds))],
};
