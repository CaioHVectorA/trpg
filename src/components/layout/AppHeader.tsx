'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navigation, NAV_ITEMS } from './Navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Swords, Shield, Map, Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AppHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-100 group-hover:border-zinc-500 transition-colors">
            <Swords className="w-4 h-4 text-zinc-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-wider text-zinc-100 group-hover:text-white transition-colors">
                ARTON VTT
              </span>
              <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono text-zinc-400 border-zinc-800">
                T20
              </Badge>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Navigation />
        </div>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-2">
          <Link href="/characters">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 flex items-center gap-1.5"
            >
              <Shield className="w-3 h-3 text-zinc-400" />
              <span>Fichas</span>
            </Button>
          </Link>

          <Link href="/vtt">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-zinc-200 border border-zinc-300 flex items-center gap-1.5"
            >
              <Map className="w-3 h-3 text-zinc-950" />
              <span>Entrar no VTT</span>
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/vtt">
            <button className="px-2.5 py-1 text-xs font-semibold bg-zinc-100 text-zinc-950 rounded border border-zinc-300">
              VTT
            </button>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 py-3 space-y-1.5 animate-in slide-in-from-top-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-zinc-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
