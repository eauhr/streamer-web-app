import { CATALOG, HERO_IDS } from '@/lib/catalog';
import { genreNames } from '@/lib/tmdb';
import { tmdbEnabled, tmdbSearch, tmdbDetails, tmdbTrending, tmdbBrowse, tmdbGenres, tmdbProviderRegions, tmdbWatchProviders } from '@/lib/tmdbClient';
import { vidnestBrowse, vidnestDetails, vidnestSearch } from '@/lib/vidnestCatalog';

// Single data access layer. Uses TMDB and VidNest live catalogs when available,
// and falls back to the curated local catalog only when both are unavailable.
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
    const results = await Promise.allSettled([
      tmdbEnabled() ? tmdbBrowse(type, { page, genre }) : Promise.reject(new Error('TMDB is not enabled')),
      genre == null ? vidnestBrowse(type, page) : Promise.reject(new Error('VidNest does not provide genre filtering')),
    ]);
    const sources = results.filter((result) => result.status === 'fulfilled').map((result) => result.value);
    if (sources.length) {
      const uniqueItems = new Map();
      sources.forEach(({ items = [] }) => items.forEach((item) => {
        const key = `${item.mediaType}:${item.id}`;
        if (!uniqueItems.has(key)) uniqueItems.set(key, item);
      }));
      return {
        items: [...uniqueItems.values()],
        page,
        totalPages: Math.max(1, ...sources.map((result) => result.totalPages || 1)),
        totalResults: Math.max(0, ...sources.map((result) => result.totalResults || 0)),
      };
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
    try {
      const item = await vidnestDetails(type, id);
      if (item) return item;
    } catch { /* fall back to local */ }
    return find(type, id);
  },
  search: async (query, page = 1) => {
    if (!query.trim()) return { items: [], page: 1, totalPages: 1, totalResults: 0 };
    const [tmdbResult, vidnestResult] = await Promise.allSettled([
      tmdbEnabled() ? tmdbSearch(query, page) : Promise.reject(new Error('TMDB is not enabled')),
      vidnestSearch(query, page),
    ]);
    const results = [tmdbResult, vidnestResult]
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value);
    if (!results.length) {
      const items = localSearch(query);
      return { items, page: 1, totalPages: 1, totalResults: items.length };
    }

    const uniqueItems = new Map();
    results.forEach(({ items = [] }) => items.forEach((item) => {
      const key = `${item.mediaType}:${item.id}`;
      if (!uniqueItems.has(key)) uniqueItems.set(key, item);
    }));
    return {
      items: [...uniqueItems.values()],
      page,
      totalPages: Math.max(1, ...results.map((result) => result.totalPages || 1)),
      totalResults: Math.max(0, ...results.map((result) => result.totalResults || 0)),
    };
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
