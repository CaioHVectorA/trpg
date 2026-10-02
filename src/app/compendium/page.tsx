import React from 'react';
import prisma from '@/lib/db/prisma';
import { CompendiumBrowser } from '@/components/compendium/CompendiumBrowser';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CompendiumPage() {
  const items = await prisma.compendiumItem.findMany({
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-amber-500/20 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-slate-100 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-amber-400" />
            <span>Grimório &amp; Bestiário Canônico</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Catálogo unificado para Tormenta 20 (Jogo do Ano) e Tormenta RPG Clássico.
            Consulte raças, classes, magias, poderes concedidos dos Deuses do Panteão, equipamentos e monstros.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="gold" className="text-xs flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {items.length} Registros Prontos
          </Badge>
        </div>
      </div>

      <CompendiumBrowser items={items} />
    </div>
  );
}
