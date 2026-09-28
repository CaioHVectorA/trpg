'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Shield, BookOpen, Map, Home } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/characters', label: 'Fichas de Personagem', icon: Shield },
  { href: '/compendium', label: 'Compêndio de Regras', icon: BookOpen },
  { href: '/vtt', label: 'Grid Tático (VTT)', icon: Map },
];

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 sm:gap-1.5">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-colors duration-150',
              isActive
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
            )}
          >
            <Icon className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
