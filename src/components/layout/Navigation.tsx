'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Shield, BookOpen, Map, Home, Sparkles } from 'lucide-react';

export const NAV_ITEMS = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/vtt', label: 'Mesa Virtual', icon: Map, badge: 'VTT' },
  { href: '/characters', label: 'Fichas', icon: Shield },
  { href: '/compendium', label: 'Grimório', icon: BookOpen },
  { href: '/knowledge', label: 'Enciclopédia', icon: Sparkles, badge: 'Docs' },
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
              'relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              isActive
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            )}
          >
            <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-zinc-100' : 'text-zinc-400')} />
            <span className="hidden md:inline">{item.label}</span>
            {item.badge && (
              <span className="hidden lg:inline-flex items-center text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                {item.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-zinc-300 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};
