import React from 'react';
import Link from 'next/link';
import { Navigation } from './Navigation';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Swords } from 'lucide-react';

export const AppHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center text-white">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-base tracking-tight text-white">
                TORMENTA
              </span>
              <Badge variant="arton" className="hidden sm:inline-flex text-[10px] py-0 px-1.5">
                Arton Platform
              </Badge>
            </div>
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
