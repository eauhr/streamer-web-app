import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';

export default function SearchBox({ className = '', autoFocus = false, large = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const initial = location.pathname === '/search' ? new URLSearchParams(location.search).get('q') || '' : '';
  const [value, setValue] = useState(initial);
  const touched = useRef(false);
  const debounced = useDebounce(value, 400);

  useEffect(() => {
    if (location.pathname !== '/search') { setValue(''); touched.current = false; }
  }, [location.pathname]);

  useEffect(() => {
    if (!touched.current) return;
    const onSearch = location.pathname === '/search';
    if (debounced.trim()) navigate(`/search?q=${encodeURIComponent(debounced.trim())}`, { replace: onSearch });
    else if (onSearch) navigate('/search', { replace: true });
  }, [debounced]);

  const onChange = (e) => { touched.current = true; setValue(e.target.value); };

  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className={`relative ${className}`}>
      <Search aria-hidden="true" className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] ${large ? 'h-5 w-5' : 'h-4 w-4'}`} />
      <input
        type="search"
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        placeholder="Titles, people, genres"
        aria-label="Search titles, people and genres"
        className={`w-full rounded-full border border-white/10 bg-transparent pl-10 pr-9 text-white placeholder:text-[#666] transition focus:border-white/25 focus:bg-white/[0.04] focus:outline-none [&::-webkit-search-cancel-button]:hidden ${large ? 'h-12 text-base' : 'h-10 text-sm'}`}
      />
      {value && (
        <button type="button" aria-label="Clear search" onClick={() => { touched.current = true; setValue(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#A1A1AA] hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </form>
  );
}
