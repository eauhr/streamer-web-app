import React, { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Movies', to: '/movies' },
  { label: 'Series', to: '/tv' },
  { label: 'My List', to: '/list' },
];

function Tab({ to, end, children, setPosition }) {
  const ref = useRef(null);
  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({ width, opacity: 1, left: ref.current.offsetLeft });
      }}
      className="relative z-10"
    >
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          `block rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
            isActive ? 'text-white' : 'text-[#A1A1AA]'
          } hover:text-black`
        }
      >
        {children}
      </NavLink>
    </li>
  );
}

function Cursor({ position }) {
  return (
    <motion.li
      animate={position}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className="absolute left-0 top-1 z-0 h-8 rounded-full bg-teev-lime"
    />
  );
}

export default function SlidingNav() {
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });
  return (
    <ul
      className="relative mx-auto flex w-fit items-center rounded-full border border-white/10 bg-white/[0.04] p-1"
      onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
    >
      {NAV.map((n) => (
        <Tab key={n.to} to={n.to} end={n.to === '/'} setPosition={setPosition}>
          {n.label}
        </Tab>
      ))}
      <Cursor position={position} />
    </ul>
  );
}