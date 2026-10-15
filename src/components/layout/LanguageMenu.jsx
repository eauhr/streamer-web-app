import React from 'react';
import { Check, Globe } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const LANGS = [{ code: 'EN', label: 'English' }, { code: 'ES', label: 'Español' }, { code: 'FR', label: 'Français' }];

export default function LanguageMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Language: English" className="hidden h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-[#A1A1AA] transition hover:text-white lg:inline-flex">
        <Globe className="h-4 w-4" aria-hidden="true" /> EN
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 border-white/10 bg-[#151515]">
        {LANGS.map((l) => (
          <DropdownMenuItem key={l.code} disabled={l.code !== 'EN'} className="justify-between">
            {l.label}
            {l.code === 'EN' ? <Check className="h-4 w-4 text-teev-lime" /> : <span className="text-xs text-[#666]">Soon</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}