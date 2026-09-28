'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Shield, BookOpen, Map, Home, Dices } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/characters', label: 'Fichas de Personagem', icon: Shield },
  { href: '/compendium', label: 'Compêndio de Regras', icon: BookOpen },
  { href: '/vtt', label: 'Grid Tático (VTT)', icon: Map },
];

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150',
              isActive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800/60'
            )}
          >
            <Icon className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
