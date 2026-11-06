import tmdbProxy from './tmdb/[...path].js';

// Stable single-segment function route for Vercel requests. The upstream path
// is passed in the `path` query parameter to avoid nested route matching.
export default tmdbProxy;
