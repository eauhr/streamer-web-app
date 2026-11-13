# TeeV

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![TMDB](https://img.shields.io/badge/Data-TMDB-01B4E4?logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

A modern web app for discovering and watching movies and series. TeeV pulls its catalog from TMDB, lets you search titles and people, resume where you left off, and keep a personal watchlist.

## Features

- Browse and search movies, TV series and people (cast and crew pages)
- Detail pages with trailers, related titles and availability info
- Built-in player with a source switcher to change playback provider
- Continue Watching, with playback progress saved per title
- My List watchlist
- Embed builder: configure a player and copy a ready-to-paste iframe snippet
- Developer docs for the embed parameters
- Responsive, dark UI built with Tailwind and Radix/shadcn components

## Tech stack

- **Frontend:** React 18, Vite, React Router, TanStack Query
- **UI:** Tailwind CSS, Radix UI / shadcn/ui, Framer Motion, Lucide icons
- **Data:** TMDB API, proxied through serverless functions in `/api` so the key stays server-side
- **Hosting:** Vercel

## Getting started

```bash
git clone https://github.com/eauhr/streamer-web-app.git
cd streamer-web-app
npm install
cp .env.example .env.local
```

Add one TMDB credential to `.env.local` (don't prefix it with `VITE_`):

```env
TMDB_API_READ_TOKEN=your_v4_read_access_token
# or
TMDB_API_KEY=your_v3_api_key
```

Then start the dev server:

```bash
npm run dev
```

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
api/          Serverless TMDB proxy
src/
  components/ UI, layout, player, media cards, detail views
  pages/      Home, Catalog, Watch, Search, Person, MyList, Builder, Docs
  lib/        TMDB client, player providers, local storage
  hooks/      Shared React hooks
```

## Disclaimer

TeeV does not host or store any media. Playback is provided by third-party embed providers. This product uses the TMDB API but is not endorsed or certified by TMDB.
