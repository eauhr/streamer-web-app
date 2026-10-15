import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/brand/Logo';

const LINKS = ['Terms of Use', 'Privacy Notice', 'Cookies Notice', 'Send us feedback', 'Help'];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-black py-12">
      <div className="container-teev flex flex-col items-center gap-6 text-center">
        <Logo size="sm" />
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <Link key={l} to={l === 'Help' ? '/docs' : '#'} className="text-sm text-[#A1A1AA] underline decoration-white/20 underline-offset-4 transition hover:text-white hover:decoration-white/60">
              {l}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-[#666]">© {new Date().getFullYear()} TeeV. All rights reserved.</p>
      </div>
    </footer>
  );
}