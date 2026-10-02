'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Shield, BookOpen, Map, Home, Sparkles } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/vtt', label: 'Mesa Virtual (VTT)', icon: Map, badge: 'Ao Vivo' },
  { href: '/characters', label: 'Fichas & Heróis', icon: Shield },
  { href: '/compendium', label: 'Grimório', icon: BookOpen },
  { href: '/knowledge', label: 'Enciclopédia', icon: Sparkles, badge: '6 Livros' },
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
              'relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent'
            )}
          >
            <Icon className={cn('w-4 h-4', isActive ? 'text-amber-400' : 'text-slate-400')} />
            <span className="hidden md:inline">{item.label}</span>
            {item.badge && (
              <span className="hidden lg:inline-flex items-center text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-red-950/80 text-red-300 border border-red-500/40 animate-pulse">
                {item.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-400 to-red-500 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};
