// Shared TMDB helpers. Credentials never live here — live data must come through a server-side proxy.
const IMG = 'https://image.tmdb.org/t/p';

export const GENRES = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 18: 'Drama',
  10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 9648: 'Mystery', 10749: 'Romance',
  878: 'Science Fiction', 53: 'Thriller', 10752: 'War', 10759: 'Action & Adventure',
  10765: 'Sci-Fi & Fantasy', 10768: 'War & Politics',
};

export const posterUrl = (path, size = 'w500') => (path ? `${IMG}/${size}${path}` : null);
export const backdropUrl = (path, size = 'w1280') => (path ? `${IMG}/${size}${path}` : null);
export const releaseYear = (item) => (item?.releaseDate || item?.firstAirDate || '').slice(0, 4);
export const titleOf = (raw) => raw?.title || raw?.name || 'Untitled';
export const genreNames = (ids = []) => ids.map((id) => GENRES[id]).filter(Boolean);
export const typeLabel = (item) => (item.mediaType === 'tv' ? 'Series' : 'Movie');
export const detailsHref = (item) => `/watch/${item.id}?type=${item.mediaType}`;
export const formatRating = (v) => (v ? Number(v).toFixed(1) : '—');

export const normalizeCast = (credits) =>
  (credits?.cast || []).slice(0, 12).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character,
    profilePath: c.profile_path ?? null,
  }));

// Priority: official YouTube trailer → YouTube teaser → official featurette → none.
export function selectTrailer(videos = []) {
  const yt = videos.filter((v) => v.site === 'YouTube');
  return (
    yt.find((v) => v.type === 'Trailer' && v.official) ||
    yt.find((v) => v.type === 'Trailer') ||
    yt.find((v) => v.type === 'Teaser') ||
    yt.find((v) => v.type === 'Featurette' && v.official) ||
    null
  );
}

// Converts a raw TMDB response into the internal media shape.
export function normalizeMedia(raw, fallbackType = 'movie') {
  const mediaType = raw.media_type === 'tv' || raw.media_type === 'movie' ? raw.media_type : fallbackType;
  return {
    id: raw.id,
    mediaType,
    title: titleOf(raw),
    overview: raw.overview || '',
    posterPath: raw.poster_path ?? null,
    backdropPath: raw.backdrop_path ?? null,
    releaseDate: raw.release_date || raw.first_air_date || '',
    voteAverage: raw.vote_average,
    genreIds: raw.genre_ids || (raw.genres || []).map((g) => g.id),
    cast: normalizeCast(raw.credits).map((c) => c.name),
    castDetails: normalizeCast(raw.credits),
    trailerKey: selectTrailer(raw.videos?.results)?.key || null,
    runtime: raw.runtime,
    seasons: raw.seasons?.filter((s) => s.season_number > 0).map((s) => s.episode_count),
    seasonDetails: raw.seasons?.filter((s) => s.season_number > 0).map((s) => ({
      number: s.season_number,
      name: s.name || `Season ${s.season_number}`,
      episodeCount: s.episode_count || 0,
    })),
  };
}

export function formatDuration(seconds) {
  const m = Math.max(0, Math.round(seconds / 60));
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}
