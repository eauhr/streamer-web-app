import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import Watch from '@/pages/Watch';
import Search from '@/pages/Search';
import ContinueWatching from '@/pages/ContinueWatching';
import MyList from '@/pages/MyList';
import Builder from '@/pages/Builder';
import Docs from '@/pages/Docs';
import NotFound from '@/pages/NotFound';

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
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Catalog key="movie" type="movie" />} />
        <Route path="/tv" element={<Catalog key="tv" type="tv" />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/search" element={<Search />} />
        <Route path="/continue" element={<ContinueWatching />} />
        <Route path="/list" element={<MyList />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App