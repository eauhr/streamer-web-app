import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppErrorBoundary from '@/components/AppErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

const Layout = lazy(() => import('@/components/layout/Layout'));
const Home = lazy(() => import('@/pages/Home'));
const Catalog = lazy(() => import('@/pages/Catalog'));
const Watch = lazy(() => import('@/pages/Watch'));
const Search = lazy(() => import('@/pages/Search'));
const ContinueWatching = lazy(() => import('@/pages/ContinueWatching'));
const MyList = lazy(() => import('@/pages/MyList'));
const Builder = lazy(() => import('@/pages/Builder'));
const Docs = lazy(() => import('@/pages/Docs'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Person = lazy(() => import('@/pages/Person'));

function RouteLoadingFallback() {
  return (
    <div role="status" aria-label="Loading page" className="flex min-h-[40vh] items-center justify-center bg-[#090909]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-[#E7FF4F]" />
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Catalog key="movie" type="movie" />} />
          <Route path="/tv" element={<Catalog key="tv" type="tv" />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/search" element={<Search />} />
          <Route path="/person/:id" element={<Person />} />
          <Route path="/continue" element={<ContinueWatching />} />
          <Route path="/list" element={<MyList />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};


function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App
