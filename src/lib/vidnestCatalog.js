const BASE = 'https://vidnest.pro/api/discover';

function normalizeEntry(entry, fallbackType) {
  const mediaType = entry.type === 'tv' ? 'tv' : fallbackType;
  const id = entry.tmdbid || entry.tmdb_id || entry.imdb_id;
  if (!id) return null;

  return {
    id: String(id),
    mediaType,
    title: entry.orig_title || entry.title || entry.name || 'Untitled',
    overview: '',
    posterPath: null,
    backdropPath: null,
    releaseDate: entry.year ? String(entry.year) : '',
    voteAverage: 0,
    genreIds: [],
    cast: [],
    creators: [],
    studio: '',
    language: '',
    certification: 'NR',
    runtime: 0,
    episodeRuntime: 0,
    seasons: mediaType === 'tv' ? [1] : [],
    imdbId: entry.imdb_id || entry.imdbid || null,
    quality: entry.Quality || entry.quality || null,
    catalogSource: 'vidnest',
  };
}

async function request(type, params) {
  const url = new URL(`${BASE}/${type}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') url.searchParams.set(key, String(value));
  });

  const response = await fetch(url);
  if (!response.ok) throw new Error(`VidNest catalog ${response.status}`);
  return response.json();
}

export async function vidnestSearch(query, page = 1) {
  const q = query.trim();
  if (q.length < 3) return { items: [], page, totalPages: 1, totalResults: 0 };

  const [moviesResult, tvResult] = await Promise.allSettled([
    request('movies', { query: q, page, resultsPerPage: 20 }),
    request('tv', { query: q, page, resultsPerPage: 20 }),
  ]);

  const responses = [moviesResult, tvResult]
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
  if (!responses.length) throw new Error('VidNest catalog search failed');

  const items = responses.flatMap((data) => (data.data || [])
    .map((entry) => normalizeEntry(entry, entry.type === 'tv' ? 'tv' : 'movie'))
    .filter(Boolean));

  return {
    items,
    page,
    totalPages: Math.max(1, ...responses.map((data) => Number(data.last_page) || 1)),
    totalResults: Math.max(0, ...responses.map((data) => Number(data.total_count ?? data.total) || 0)),
  };
}

export async function vidnestBrowse(type, page = 1) {
  const data = await request(type === 'tv' ? 'tv' : 'movies', { page, resultsPerPage: 20 });
  return {
    items: (data.data || []).map((entry) => normalizeEntry(entry, type)).filter(Boolean),
    page: Number(data.current_page) || page,
    totalPages: Number(data.last_page) || 1,
    totalResults: Number(data.total_count ?? data.total) || 0,
  };
}

export async function vidnestDetails(type, id) {
  const isImdbId = /^tt\d+$/i.test(String(id));
  const key = isImdbId ? (type === 'tv' ? 'imdbid' : 'imdb_id') : 'tmdbid';
  const data = await request(type === 'tv' ? 'tv' : 'movies', { [key]: id, resultsPerPage: 1 });
  const entry = (data.data || []).find((item) => String(
    isImdbId ? item.imdb_id || item.imdbid : item.tmdbid || item.tmdb_id
  ) === String(id));
  return entry ? normalizeEntry(entry, type) : null;
}
