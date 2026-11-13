import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'

const srcDirectory = fileURLToPath(new URL('./src', import.meta.url));

const ALLOWED_TMDB_PARAMS = new Set([
  'query', 'page', 'language', 'include_adult', 'sort_by', 'with_genres',
  'with_original_language', 'vote_count.gte', 'append_to_response',
]);

const cacheControlFor = (path) => path.startsWith('/search/')
  ? 'public, max-age=60, s-maxage=600, stale-while-revalidate=3600'
  : 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';

function tmdbProxyPlugin({ token, apiKey }) {
  const enabled = Boolean(token || apiKey);
  const handle = async (req, res, next) => {
    const requestUrl = new URL(req.url || '/', 'http://localhost');
    if (requestUrl.pathname === '/api/tmdb/status') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify({ enabled }));
      return;
    }
    if (requestUrl.pathname !== '/api/tmdb' && !requestUrl.pathname.startsWith('/api/tmdb/')) return next();
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.setHeader('Cache-Control', 'no-store');
      res.end('Method not allowed');
      return;
    }
    if (!enabled) {
      res.statusCode = 503;
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Set TMDB_API_READ_TOKEN or TMDB_API_KEY in your local environment to enable the live catalog.' }));
      return;
    }

    const requestedPath = requestUrl.searchParams.get('path') || requestUrl.pathname.slice('/api/tmdb'.length);
    const path = requestedPath.startsWith('/') ? requestedPath : `/${requestedPath}`;
    const allowed = /^\/(?:search\/(?:multi|tv)|configuration\/languages|trending\/all\/(?:day|week)|discover\/(?:movie|tv)|genre\/(?:movie|tv)\/list|watch\/providers\/regions|person\/\d+(?:\/combined_credits)?|(?:movie|tv)\/\d+(?:\/(?:watch\/providers|recommendations))?)$/;
    if (!allowed.test(path)) {
      res.statusCode = 404;
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'TMDB endpoint not allowed' }));
      return;
    }

    try {
      const target = new URL(`https://api.themoviedb.org/3${path}`);
      requestUrl.searchParams.forEach((value, key) => {
        if (ALLOWED_TMDB_PARAMS.has(key)) {
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
      res.statusCode = upstream.status;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', upstream.ok ? cacheControlFor(path) : 'no-store');
      res.end(await upstream.text());
    } catch (error) {
      res.statusCode = error.name === 'TimeoutError' ? 504 : 502;
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'TMDB request failed' }));
    }
  };

  return {
    name: 'teev-tmdb-proxy',
    configureServer(server) { server.middlewares.use(handle); },
    configurePreviewServer(server) { server.middlewares.use(handle); },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const tmdbToken = env.TMDB_API_READ_TOKEN || process.env.TMDB_API_READ_TOKEN;
  const tmdbApiKey = env.TMDB_API_KEY || process.env.TMDB_API_KEY;
  const tmdbCredentials = { token: tmdbToken, apiKey: tmdbApiKey };

  return {
    resolve: {
      alias: { '@': srcDirectory },
    },
    define: {
      'import.meta.env.VITE_TMDB_ENABLED': JSON.stringify(Boolean(tmdbToken || tmdbApiKey)),
    },
    plugins: [
      react(),
      tmdbProxyPlugin(tmdbCredentials),
    ]
  };
});
