import React from 'react';
import Link from 'next/link';
import { Navigation } from './Navigation';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Swords } from 'lucide-react';

export const AppHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-500/20 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 via-amber-600 to-red-800 p-0.5 shadow-md flex items-center justify-center border border-amber-400/40 group-hover:scale-105 transition-transform duration-150">
            <Swords className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-lg tracking-wider text-amber-200 group-hover:text-amber-100 transition-colors">
                TORMENTA
              </span>
              <Badge variant="arton" className="hidden sm:inline-flex text-[10px]">
                Arton Platform
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-sans tracking-wide">
              T20 Jogo do Ano &amp; TRPG Clássico
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <Navigation />

        {/* System Badges */}
        <div className="hidden lg:flex items-center gap-2">
          <Badge variant="gold" className="text-[10px] flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            T20 / TRPG Dual-Engine
          </Badge>
        </div>
      </div>
    </header>
  );
};
