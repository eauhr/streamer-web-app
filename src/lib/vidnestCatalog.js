const BASE = 'https://vidnest.pro/api/discover';

function normalizeEntry(entry, fallbackType) {
  const mediaType = entry.type === 'tv' || entry.type === 'movie' ? entry.type : fallbackType;
  const id = entry.tmdbid || entry.tmdb_id || entry.imdb_id;
  if (!id) return null;

  return {
    id: String(id),
    mediaType,
    title: entry.title || entry.name || entry.orig_title || 'Untitled',
    originalTitle: entry.original_title || entry.original_name || entry.orig_title || '',
    overview: '',
    posterPath: entry.poster_path || entry.posterPath || entry.poster_url || entry.poster || null,
    backdropPath: entry.backdrop_path || entry.backdropPath || entry.backdrop_url || entry.backdrop || null,
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
    seasons: [],
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

  const responses = [
    { result: moviesResult, type: 'movie' },
    { result: tvResult, type: 'tv' },
  ].filter(({ result }) => result.status === 'fulfilled')
    .map(({ result, type }) => ({ data: result.value, type }));
  if (!responses.length) throw new Error('VidNest catalog search failed');

  const items = responses.flatMap(({ data, type }) => (data.data || [])
    .map((entry) => normalizeEntry(entry, type))
    .filter(Boolean));

  return {
    items,
    page,
    totalPages: Math.max(1, ...responses.map(({ data }) => Number(data.last_page) || 1)),
    totalResults: Math.max(0, ...responses.map(({ data }) => Number(data.total_count ?? data.total) || 0)),
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
