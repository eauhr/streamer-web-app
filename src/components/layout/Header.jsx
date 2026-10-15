import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Search } from 'lucide-react';
import SearchBox from '@/components/layout/SearchBox';
import SlidingNav from '@/components/layout/SlidingNav';

export default function Header() {
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (latest > prev && latest > 64) setHidden(true);
    else setHidden(false);
  });

  return (
    <motion.header
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="sticky top-0 z-50"
    >
      <div className="container-teev flex h-16 items-center">
        <div className="flex-1" />
        <SlidingNav />
        <div className="flex flex-1 items-center justify-end gap-1">
          <SearchBox className="hidden w-56 md:block xl:w-72" />
          <Link to="/search" aria-label="Search" className="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/10 md:hidden">
            <Search className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}