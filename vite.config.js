import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function tmdbProxyPlugin({ token, apiKey }) {
  const enabled = Boolean(token || apiKey);
  const handle = async (req, res, next) => {
    const requestUrl = new URL(req.url || '/', 'http://localhost');
    if (requestUrl.pathname === '/api/tmdb/status') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ enabled }));
      return;
    }
    if (requestUrl.pathname !== '/api/tmdb' && !requestUrl.pathname.startsWith('/api/tmdb/')) return next();
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.end('Method not allowed');
      return;
    }
    if (!enabled) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Set TMDB_API_READ_TOKEN or TMDB_API_KEY in your local environment to enable the live catalog.' }));
      return;
    }

    const requestedPath = requestUrl.searchParams.get('path') || requestUrl.pathname.slice('/api/tmdb'.length);
    const path = requestedPath.startsWith('/') ? requestedPath : `/${requestedPath}`;
    const allowed = /^\/(?:search\/(?:multi|tv)|configuration\/languages|trending\/all\/(?:day|week)|discover\/(?:movie|tv)|genre\/(?:movie|tv)\/list|watch\/providers\/regions|person\/\d+(?:\/combined_credits)?|(?:movie|tv)\/(?:popular|top_rated|\d+(?:\/(?:watch\/providers|recommendations))?))$/;
    if (!allowed.test(path)) {
      res.statusCode = 404;
      res.end('TMDB endpoint not allowed');
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
      res.statusCode = upstream.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(await upstream.text());
    } catch (error) {
      res.statusCode = error.name === 'TimeoutError' ? 504 : 502;
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
    define: {
      'import.meta.env.VITE_TMDB_ENABLED': JSON.stringify(Boolean(tmdbToken || tmdbApiKey)),
    },
    plugins: [
      base44({
        // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
        // can be removed when the app no longer uses legacy SDK imports.
        legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
        hmrNotifier: true,
        navigationNotifier: true,
        analyticsTracker: true,
        visualEditAgent: true
      }),
      react(),
      tmdbProxyPlugin(tmdbCredentials),
    ]
  };
});
