import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import AppErrorBoundary from '@/components/AppErrorBoundary';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
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
    <div role="status" aria-label="Loading page" className="min-h-[60vh] animate-pulse bg-[#090909]" />
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#090909]">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#E7FF4F] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
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
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AppErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </AppErrorBoundary>
  )
}

export default App
