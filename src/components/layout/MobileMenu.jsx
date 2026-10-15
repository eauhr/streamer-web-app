import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Logo from '@/components/brand/Logo';

const EXTRA = [
  { label: 'Continue watching', to: '/continue' },
  { label: 'Embed builder', to: '/builder' },
  { label: 'Developer docs', to: '/docs' },
];

export default function MobileMenu({ nav }) {
  const [open, setOpen] = useState(false);
  const item = ({ isActive }) =>
    `flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium transition ${isActive ? 'bg-white/[0.06] text-white' : 'text-[#A1A1AA] hover:text-white'}`;
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex h-10 items-center gap-1 rounded-full px-2 text-sm font-semibold text-white lg:hidden">
        Menu <ChevronDown className="h-4 w-4 text-[#A1A1AA]" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] border-white/10 bg-[#090909] p-5">
        <SheetTitle className="mb-8"><Logo asLink={false} /></SheetTitle>
        <nav aria-label="Mobile" className="space-y-1">
          {[...nav, ...EXTRA].map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={item} onClick={() => setOpen(false)}>
              {({ isActive }) => (<>{n.label}{isActive && <span className="h-1.5 w-1.5 rounded-full bg-teev-lime" aria-label="current page" />}</>)}
            </NavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}