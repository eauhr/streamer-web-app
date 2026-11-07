const ALLOWED_PATH = /^\/(?:search\/(?:multi|tv)|configuration\/languages|trending\/all\/(?:day|week)|discover\/(?:movie|tv)|genre\/(?:movie|tv)\/list|watch\/providers\/regions|person\/\d+(?:\/combined_credits)?|(?:movie|tv)\/(?:popular|top_rated|\d+(?:\/(?:watch\/providers|recommendations))?))$/;

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
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const requestUrl = new URL(req.url || '/', 'http://localhost');
  const path = getProxyPath(req, requestUrl);
  const token = process.env.TMDB_API_READ_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;

  if (path === '/status') {
    res.status(200).json({ enabled: Boolean(token || apiKey) });
    return;
  }

  if (!ALLOWED_PATH.test(path)) {
    res.status(404).json({ error: 'TMDB endpoint not allowed', path });
    return;
  }

  if (!token && !apiKey) {
    res.status(503).json({ error: 'TMDB API credentials are not configured' });
    return;
  }

  try {
    const target = new URL(`https://api.themoviedb.org/3${path}`);
    requestUrl.searchParams.forEach((value, key) => {
      if (key !== 'path') target.searchParams.set(key, value);
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
    res.send(await upstream.text());
  } catch (error) {
    const status = error.name === 'TimeoutError' ? 504 : 502;
    res.status(status).json({ error: 'TMDB request failed' });
  }
}
