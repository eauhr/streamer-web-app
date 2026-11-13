const ALLOWED_PATH = /^\/(?:search\/(?:multi|tv)|configuration\/languages|trending\/all\/(?:day|week)|discover\/(?:movie|tv)|genre\/(?:movie|tv)\/list|watch\/providers\/regions|person\/\d+(?:\/combined_credits)?|(?:movie|tv)\/\d+(?:\/(?:watch\/providers|recommendations))?)$/;
const ALLOWED_PARAMS = new Set([
  'query', 'page', 'language', 'include_adult', 'sort_by', 'with_genres',
  'with_original_language', 'vote_count.gte', 'append_to_response',
]);

const cacheControlFor = (path) => path.startsWith('/search/')
  ? 'public, max-age=60, s-maxage=600, stale-while-revalidate=3600'
  : 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';

function getProxyPath(req, requestUrl) {
  const routePath = req.query?.path;
  if (Array.isArray(routePath) && routePath.length) return `/${routePath.join('/')}`;
  if (typeof routePath === 'string' && routePath) return `/${routePath.replace(/^\/+/, '')}`;

  const pathname = requestUrl.pathname.replace(/^\/api\/tmdb(?=\/|$)/, '');
  if (!pathname || pathname === '/') return '/';
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.setHeader('Cache-Control', 'no-store');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const requestUrl = new URL(req.url || '/', 'http://localhost');
  const path = getProxyPath(req, requestUrl);
  const token = process.env.TMDB_API_READ_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;

  if (path === '/status') {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ enabled: Boolean(token || apiKey) });
    return;
  }

  if (!ALLOWED_PATH.test(path)) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(404).json({ error: 'TMDB endpoint not allowed' });
    return;
  }

  if (!token && !apiKey) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(503).json({ error: 'TMDB API credentials are not configured' });
    return;
  }

  try {
    const target = new URL(`https://api.themoviedb.org/3${path}`);
    requestUrl.searchParams.forEach((value, key) => {
      if (ALLOWED_PARAMS.has(key)) {
        if (key !== 'append_to_response' || value === 'credits,videos') {
          target.searchParams.set(key, value);
        }
      }
    });
    if (!token && apiKey) target.searchParams.set('api_key', apiKey);

    const upstream = await fetch(target, {
      headers: {
        accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(15000),
    });
    res.status(upstream.status);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', upstream.ok ? cacheControlFor(path) : 'no-store');
    res.send(await upstream.text());
  } catch (error) {
    const status = error.name === 'TimeoutError' ? 504 : 502;
    res.setHeader('Cache-Control', 'no-store');
    res.status(status).json({ error: 'TMDB request failed' });
  }
}
