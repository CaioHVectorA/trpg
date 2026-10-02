import React from 'react';
import prisma from '@/lib/db/prisma';
import { CompendiumBrowser } from '@/components/compendium/CompendiumBrowser';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CompendiumPage() {
  const items = await prisma.compendiumItem.findMany({
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-zinc-300" />
            <span>Grimório &amp; Compêndio</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Consulta rápida de raças, classes, magias, poderes concedidos e itens de Tormenta 20 e TRPG.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono border-zinc-700 text-zinc-300">
            {items.length} itens catalogados
          </Badge>
        </div>
      </div>

      <CompendiumBrowser items={items} />
    </div>
  );
}
