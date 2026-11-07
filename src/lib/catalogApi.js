import { CATALOG, HERO_IDS } from '@/lib/catalog';
import { genreNames } from '@/lib/tmdb';
import { tmdbEnabled, tmdbSearch, tmdbDetails, tmdbPerson, tmdbTrending, tmdbBrowse, tmdbGenres, tmdbLanguages, tmdbProviderRegions, tmdbWatchProviders, tmdbRecommendations } from '@/lib/tmdbClient';
import { vidnestDetails, vidnestSearch } from '@/lib/vidnestCatalog';

// TMDB supplies the main catalog; VidNest adds titles it can play to search.
// The curated local catalog remains a fallback when live sources are unavailable.
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

const searchText = (value = '') => String(value)
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();

const titleMatchRank = (item, query) => {
  const q = searchText(query);
  const titles = [item.title, item.originalTitle].map(searchText).filter(Boolean);
  if (titles.some((title) => title === q)) return 0;
  if (titles.some((title) => title.startsWith(q))) return 1;
  if (titles.some((title) => title.includes(q))) return 2;
  return 3;
};

const rankSearchItems = (items, query) => [...items].sort((a, b) =>
  titleMatchRank(a, query) - titleMatchRank(b, query) ||
  (b.popularity || 0) - (a.popularity || 0) ||
  (b.voteAverage || 0) - (a.voteAverage || 0)
);

export const catalogApi = {
  hero: async () => {
    if (tmdbEnabled()) { try { return (await tmdbTrending()).slice(0, 5); } catch { /* fall back to local */ } }
    return HERO_IDS.map((id) => CATALOG.find((i) => i.id === id)).filter(Boolean);
  },
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
  browse: async (type, page = 1, genre = null, originalLanguage = null) => {
    if (tmdbEnabled()) { try { return await tmdbBrowse(type, { page, genre, originalLanguage }); } catch { /* fall back to local */ } }
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
  languages: async () => {
    if (!tmdbEnabled()) return [];
    try { return await tmdbLanguages(); } catch { return []; }
  },
  providerRegions: async () => {
    if (!tmdbEnabled()) return [];
    try { return await tmdbProviderRegions(); } catch { return []; }
  },
  watchProviders: async (type, id) => {
    if (!tmdbEnabled()) return {};
    try { return await tmdbWatchProviders(type, id); } catch { return {}; }
  },
  trailers: async () => {
    if (tmdbEnabled()) {
      try {
        const trending = await tmdbTrending();
        const details = await Promise.allSettled(trending.slice(0, 12).map((item) => tmdbDetails(item.mediaType, item.id)));
        const withTrailers = details
          .filter((result) => result.status === 'fulfilled' && result.value?.trailerKey)
          .map((result) => result.value);
        if (withTrailers.length) return withTrailers.slice(0, 10);
      } catch { /* fall back to local */ }
    }
    return CATALOG.filter((i) => i.trailerKey).slice(0, 10);
  },
  details: async (type, id) => {
    if (tmdbEnabled()) { try { return await tmdbDetails(type, id); } catch { /* fall back to local */ } }
    try {
      const item = await vidnestDetails(type, id);
      if (item) return item;
    } catch { /* fall back to local */ }
    return find(type, id);
  },
  person: async (id) => {
    if (!tmdbEnabled()) return null;
    try { return await tmdbPerson(id); } catch { return null; }
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

    const tmdbItems = tmdbResult.status === 'fulfilled' ? tmdbResult.value.items : [];
    const vidnestItems = vidnestResult.status === 'fulfilled' ? vidnestResult.value.items : [];
    const uniqueItems = new Map();
    [...vidnestItems, ...tmdbItems].forEach((item) => {
      const key = `${item.mediaType}:${item.id}`;
      const previous = uniqueItems.get(key);
      uniqueItems.set(key, previous ? {
        ...previous,
        ...item,
        posterPath: item.posterPath || previous.posterPath,
        backdropPath: item.backdropPath || previous.backdropPath,
        overview: item.overview || previous.overview,
        originalTitle: item.originalTitle || previous.originalTitle,
      } : item);
    });
    const rankedItems = rankSearchItems([...uniqueItems.values()], query);
    const itemsToEnrich = tmdbEnabled()
      ? rankedItems
        .filter((item) => /^\d+$/.test(String(item.id)) && (!item.posterPath || !item.overview))
        .slice(0, 16)
      : [];
    const enrichedResults = await Promise.allSettled(
      itemsToEnrich.map((item) => tmdbDetails(item.mediaType, item.id))
    );
    const enrichedItems = enrichedResults
      .filter((result) => result.status === 'fulfilled' && result.value)
      .map((result) => result.value);

    const enrichedItemsByKey = new Map();
    [...rankedItems, ...enrichedItems].forEach((item) => {
      const key = `${item.mediaType}:${item.id}`;
      const previous = enrichedItemsByKey.get(key);
      if (!previous) {
        enrichedItemsByKey.set(key, item);
        return;
      }
      enrichedItemsByKey.set(key, {
        ...previous,
        ...item,
        title: item.title || previous.title,
        overview: item.overview || previous.overview,
        posterPath: item.posterPath || previous.posterPath,
        backdropPath: item.backdropPath || previous.backdropPath,
        genreIds: item.genreIds?.length ? item.genreIds : previous.genreIds,
        cast: item.cast?.length ? item.cast : previous.cast,
        castDetails: item.castDetails?.length ? item.castDetails : previous.castDetails,
        creators: item.creators?.length ? item.creators : previous.creators,
        seasons: item.seasons?.length ? item.seasons : previous.seasons,
        seasonDetails: item.seasonDetails?.length ? item.seasonDetails : previous.seasonDetails,
      });
    });
    return {
      items: rankSearchItems([...enrichedItemsByKey.values()], query),
      page,
      totalPages: Math.max(1, ...results.map((result) => result.totalPages || 1)),
      totalResults: Math.max(0, ...results.map((result) => result.totalResults || 0)),
    };
  },
  related: async (item) => {
    if (tmdbEnabled()) {
      try { return await tmdbRecommendations(item.mediaType, item.id); } catch { /* fall back to local */ }
    }
    return CATALOG.filter((i) => i.id !== item.id)
      .map((i) => ({ i, score: i.genreIds.filter((g) => item.genreIds.includes(g)).length + (i.mediaType === item.mediaType ? 0.5 : 0) }))
      .filter((x) => x.score > 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((x) => x.i);
  },
  genresFor: (type) => [...new Set(byType(type).flatMap((i) => i.genreIds))],
};
