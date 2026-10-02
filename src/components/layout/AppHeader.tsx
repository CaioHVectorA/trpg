import React from 'react';
import Link from 'next/link';
import { Navigation } from './Navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Swords, Plus, Shield, Flame } from 'lucide-react';

export const AppHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-500/25 bg-[#070A12]/95 backdrop-blur-md shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-red-800 to-amber-600 p-0.5 shadow-[0_0_15px_rgba(220,38,38,0.4)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <Swords className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-lg tracking-wider text-amber-100 group-hover:text-amber-300 transition-colors">
                ARTON VTT
              </span>
              <Badge variant="arton" className="text-[10px] py-0 px-1.5 font-sans font-semibold">
                T20 &amp; TRPG
              </Badge>
            </div>
            <p className="text-[10px] text-amber-400/80 font-medium tracking-wide -mt-0.5 hidden sm:block">
              Mesa Virtual &amp; Fichas Oficiais
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <Navigation />

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link href="/characters">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10 flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Fichas</span>
            </Button>
          </Link>

          <Link href="/vtt">
            <Button
              variant="arton"
              size="sm"
              className="text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(220,38,38,0.35)] hover:shadow-[0_0_20px_rgba(220,38,38,0.6)]"
            >
              <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Entrar no VTT</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
